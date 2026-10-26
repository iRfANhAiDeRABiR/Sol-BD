# Solutions BD — Comprehensive Security Checklist

**Document Version:** 1.0.0  
**Target Application:** Solutions BD (Digital Software License Marketplace)  
**Assessment Date:** October 2026  
**Status:** Baseline Security Assessment  

---

## 1. Overview & Verification Status Summary

This checklist evaluates Solutions BD against 20 key application security domains. Every assessment is grounded in the current codebase implementation.

| # | Domain | Current Status | Critical Issues Identified |
|---|---|---|---|
| 1 | **Authentication** | ⚠️ Needs Remediation | Plaintext password fallback in verification; hardcoded credentials in seed/scripts |
| 2 | **Authorization & RBAC** | ⚠️ Needs Remediation | RBAC gap in `deleteProductAction` & product import; inactive root middleware |
| 3 | **Session & Token Security** | ❌ Vulnerable | Hardcoded default `SESSION_SECRET` fallback allows cookie forgery |
| 4 | **Input Validation** | ⚠️ Partially Implemented | Order items & quantities validated; missing format regex for phones/trxIds |
| 5 | **Injection Protection** | ✅ Implemented | Parameterized Prisma queries; parameterized SQL queries in `pg.Client` |
| 6 | **XSS & CSRF** | ⚠️ Partially Implemented | React DOM escaping active; missing strict Content-Security-Policy (CSP) header |
| 7 | **API Security** | ⚠️ Partially Implemented | Server-side price recalculation active; unauthenticated guest order lookup surface |
| 8 | **Rate Limiting & Abuse** | ❌ Missing Control | No rate limiting on login, registration, contact form, or checkout endpoints |
| 9 | **File Uploads & Processing** | ⚠️ Security Weakness | In-memory CSV/JSON parser lacks upload size bound; wildcard remote image patterns |
| 10 | **Database Security** | ❌ Vulnerable | Wide-open Supabase RLS policy (`USING (true) WITH CHECK (true)`) on `users` table |
| 11 | **Secrets Management** | ❌ Vulnerable | `.env` committed in Git; connection URIs and passwords hardcoded in scripts |
| 12 | **Encryption (Transit & Rest)** | ⚠️ Needs Remediation | SQLite database & license keys unencrypted at rest; TLS verification disabled in DB sync |
| 13 | **CORS & Origin Validation** | ⚠️ Missing Control | No explicit CORS header restrictions defined for API routes |
| 14 | **Dependency Security** | ✅ Low Risk | Dependencies up-to-date (Next.js 16.3.4, React 19, Prisma 5.20.0) |
| 15 | **Logging & Monitoring** | ⚠️ Security Weakness | Console error logging active; no immutable audit log for license key access or exports |
| 16 | **Admin Security** | ⚠️ Needs Remediation | No Multi-Factor Authentication (MFA); support role can delete products |
| 17 | **Deployment & Infrastructure** | ⚠️ Security Weakness | SQLite database file (`dev.db`) used for transactional digital commerce |
| 18 | **Data Privacy & PII** | ⚠️ Security Weakness | Customer order histories and digital keys accessible via guest lookup if credentials leak |
| 19 | **Error Handling** | ⚠️ Partially Implemented | Client toast error sanitizer active; server routes return raw `error.message` on 500s |
| 20 | **Backup & Recovery** | ❌ Missing Control | No automated point-in-time recovery (PITR) or automated SQLite file snapshots |

---

## 2. Domain-by-Domain Analysis

### 2.1 Authentication
- [x] Passwords hashed using modern key derivation (Salted scrypt: `crypto.scryptSync(password, salt, 64)`) (`src/lib/customer-auth.ts:24-34`).
- [x] Constant-time hash verification using `crypto.timingSafeEqual` (`src/lib/customer-auth.ts:36-46`).
- [ ] **Defect:** Plaintext password support retained for unmigrated accounts (`src/lib/customer-auth.ts:48-50` and `src/app/admin/actions.ts:32`).
- [ ] **Defect:** Hardcoded default admin credentials present in repository scripts (`scripts/add-admin-user.mjs:10`, `prisma/seed.js:433`).
- [ ] Multi-Factor Authentication (MFA/2FA) is not implemented for administrative users.

---

### 2.2 Authorization & Role-Based Access Control (RBAC)
- [x] Administrative roles modeled in database (`User.role` enum: `CUSTOMER`, `SUPPORT`, `ADMIN`, `OWNER`) (`prisma/schema.prisma:24-29`).
- [x] User role management restricted to `OWNER` and `ADMIN` (`src/app/admin/actions.ts:941`).
- [ ] **Defect:** Inactive middleware. `src/lib/middleware.ts` defines `updateSession`, but no `middleware.ts` exists in project root or `src/middleware.ts`.
- [ ] **Defect:** RBAC gap in `deleteProductAction` (`src/app/admin/actions.ts:418-435`): Only checks `!session`, permitting `SUPPORT` role to delete products.
- [ ] **Defect:** RBAC gap in `/api/admin/products/import` (`src/app/api/admin/products/import/route.ts:84-87`): Permitted to `SUPPORT` tier, whereas manual product creation requires `ADMIN` or `OWNER`.

---

### 2.3 Session & Token Security
- [x] Cookies configured with `httpOnly: true` (prevents XSS cookie theft) (`src/lib/admin-auth.ts:108`, `src/lib/customer-auth.ts:133`).
- [x] Cookies set with `sameSite: 'lax'` and `secure: process.env.NODE_ENV === 'production'`.
- [x] Session payload signed with HMAC-SHA256 (`src/lib/admin-auth.ts:40-42`).
- [ ] **Defect:** Hardcoded fallback secret string used when `SESSION_SECRET` is unset (`src/lib/admin-auth.ts:16`, `src/lib/customer-auth.ts:16`).
- [ ] Sessions are stateless without server-side revocation: suspending a user does not immediately invalidate their active cookie until expiration (7 days).

---

### 2.4 Input Validation
- [x] Order quantities clamped to bounds: `Math.max(1, Math.min(100, Math.floor(...)))` (`src/app/api/orders/route.ts:70`).
- [x] Server-side coupon code existence, expiry, and minimum spend checks (`src/app/api/orders/route.ts:101-125`).
- [ ] Phone numbers (`customerPhone`, `senderPhone`) lack strict E.164 or Bangladesh standard format validation (`/^(\+8801|01)[3-9]\d{8}$/`).
- [ ] Transaction IDs (`paymentTrxId`) accept arbitrary unvalidated strings without format checks for bKash/Nagad patterns (e.g. 10-character alphanumeric).

---

### 2.5 Injection (SQL, Command, Template)
- [x] Prisma ORM used for all primary database interactions, parameterizing all SQLite queries against SQL injection.
- [x] PostgreSQL queries in `pg.Client` utilize `$1, $2` parameterized placeholders (`src/lib/sync-user-supabase.ts:20`, `scripts/sync-supabase.mjs:80-93`).
- [x] No `child_process.exec`, `eval()`, or raw shell commands executed in response to user input.

---

### 2.6 XSS & CSRF
- [x] React JSX automatically escapes dynamic values, neutralizing standard reflective XSS.
- [x] Anti-clickjacking header configured: `X-Frame-Options: SAMEORIGIN` (`next.config.mjs:24`).
- [x] MIME type sniffing prevented: `X-Content-Type-Options: nosniff` (`next.config.mjs:28`).
- [ ] **Defect:** Content-Security-Policy (CSP) is not configured in `next.config.mjs`.
- [ ] **Defect:** Strict CSRF tokens are not used for REST API mutation endpoints (`POST /api/orders`). Protection relies on browser `SameSite: Lax` cookie defaults.

---

### 2.7 API Security
- [x] Server-side price recalculation: `POST /api/orders` ignores client-submitted prices and recalculates total from database `ProductVariant.price` (`src/app/api/orders/route.ts:84-86`).
- [x] Order status transitions enforce valid lifecycle rules in transaction blocks (`src/app/admin/actions.ts:98-175`).
- [ ] `GET /api/orders` allows guest order lookup by matching `orderNumber` + (`email` or `phone`). While better than unauthenticated browsing, an attacker who obtains an order number can probe victim phone numbers.

---

### 2.8 Rate Limiting & Abuse Prevention
- [ ] **Defect:** No rate limiting mechanism (e.g., token bucket, Redis Upstash, memory-rate-limiter) exists on `loginCustomerAction` or `loginAdminAction`.
- [ ] **Defect:** No rate limiting or CAPTCHA on `POST /api/orders` (susceptible to automated transaction spam).
- [ ] **Defect:** No rate limiting on newsletter subscription or contact form submissions.

---

### 2.9 File Uploads & Processing
- [x] Product import file processed in memory via `file.text()` without saving to disk or executing file binaries (`src/app/api/admin/products/import/route.ts:103`).
- [x] Image processing operations execute on client browser Canvas API (`src/lib/imageProcessing.ts:95`).
- [ ] **Defect:** Product import does not validate upload file size bounds, allowing arbitrary payload sizes into server memory.
- [ ] **Defect:** Next.js Image Optimization configuration (`next.config.mjs:6-11`) uses wildcard `hostname: '**'`, opening an SSRF proxy vector.

---

### 2.10 Database Security
- [x] SQLite database file (`dev.db`) located in `prisma/` directory, excluded from Git tracking via `.gitignore`.
- [ ] **Defect:** Supabase `public.users` table Row Level Security configured with `CREATE POLICY ... FOR ALL USING (true) WITH CHECK (true);` (`scripts/sync-supabase.mjs:45`), completely disabling access controls on user records via public API.
- [ ] SQLite does not support native row-level security or user-specific network privileges.

---

### 2.11 Secrets Management
- [x] Server-only environment variables (`BKASH_APP_SECRET`, `SUPABASE_DATABASE_URL`) lack `NEXT_PUBLIC_` prefix, preventing leakage into frontend client bundles.
- [ ] **Defect:** `.env` committed in Git commit `2c8d04b812eb4c9d9145533eb4e1c4509d3049b9`.
- [ ] **Defect:** Supabase connection string and password hardcoded as fallback in `scripts/add-admin-user.mjs:49`, `scripts/remove-old-admin.mjs:49`, and `scripts/sync-supabase.mjs:7-8`.
- [ ] **Defect:** `SESSION_SECRET` omitted from `.env.example`, resulting in application defaulting to hardcoded fallback string.

---

### 2.12 Encryption (In-Transit & At-Rest)
- [x] External HTTPS enforced for public production web traffic.
- [ ] **Defect:** TLS certificate validation explicitly disabled on PostgreSQL connections: `ssl: { rejectUnauthorized: false }` (`src/lib/sync-user-supabase.ts:14`, `scripts/sync-supabase.mjs:14`).
- [ ] **Defect:** Digital license keys (`LicenseKey.keyCode` and `Order.deliveredKeys`) stored unencrypted in plaintext in database (`prisma/schema.prisma:91, 114`).
- [ ] HSTS (`Strict-Transport-Security`) header is not configured in `next.config.mjs`.

---

### 2.13 CORS & Origin Validation
- [x] Server actions inherently check origin and host headers via Next.js action dispatcher.
- [ ] Explicit CORS headers (`Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`) are not configured on `/api/orders` or other API routes.

---

### 2.14 Dependency Security
- [x] Core dependencies use recent major releases: Next.js 16.3.4, React 19.2.8, Prisma 5.20.0, pg 8.23.0 (`package.json:15-36`).
- [ ] Automated vulnerability scanning (e.g., Dependabot, Snyk, `npm audit` in CI) is not integrated into repository workflows.

---

### 2.15 Logging & Monitoring
- [x] Server actions catch and log execution errors to console (`console.error`).
- [ ] **Defect:** No security event logging or audit trail for critical administrative actions (key downloads, product deletions, payment approvals).
- [ ] Centralized monitoring / SIEM (e.g. Sentry, Datadog) is not connected.

---

### 2.16 Admin Security & Hardening
- [x] Admin login path separated at `/admin/login`.
- [x] Admin account suspension immediately prevents login (`src/app/admin/actions.ts:47-49`).
- [ ] Admin panel is publicly reachable on port 443 without IP allowlisting or VPN gating.
- [ ] No session inactivity timeout or forced re-authentication for sensitive actions (e.g., bulk key export).

---

### 2.17 Deployment & Infrastructure
- [x] `poweredByHeader: false` configured in `next.config.mjs:4` to conceal server framework identifier.
- [ ] Production relies on SQLite file-based database (`prisma/dev.db`), which exhibits concurrent write contention and lacks clustering or high-availability failover.

---

### 2.18 Data Privacy & PII
- [x] Customer email addresses converted to lowercase and trimmed before storage to prevent duplicate profile collisions (`src/app/api/orders/route.ts:25`).
- [ ] Customer phone numbers and full purchase histories are stored indefinitely without a defined data retention or redaction policy.

---

### 2.19 Error Handling & Information Leakage
- [x] `src/lib/errorSanitizer.ts` filters out Prisma, Supabase, database column, and SQL error tokens before displaying toasts to customers.
- [ ] API routes return raw error strings on unexpected exceptions: `return NextResponse.json({ error: error.message || ... }, { status: 500 })` (`src/app/api/orders/route.ts:197`).

---

### 2.20 Backup & Disaster Recovery
- [ ] No automated snapshot schedule or point-in-time recovery for `prisma/dev.db`.
- [ ] If the SQLite file becomes corrupted during concurrent write transactions, all order and license key data is at risk of permanent loss.

---

## 3. Detailed Findings with Evidence & Action Plan

---

### [CHK-01] Forgery of Admin and Customer Session Cookies
* **Classification:** Confirmed vulnerability
* **Severity:** CRITICAL
* **Evidence:**
  - `src/lib/admin-auth.ts:16`: `const SESSION_SECRET = process.env.SESSION_SECRET || 'sbd_admin_signing_secret_2026_super_secure';`
  - `src/lib/customer-auth.ts:16`: `const SESSION_SECRET = process.env.SESSION_SECRET || 'sbd_customer_signing_secret_2026_secure';`
  - Neither `.env` nor `.env.local` sets `SESSION_SECRET`.
* **Risk:** Anyone who inspects the code can construct an arbitrary session payload (such as an `OWNER` admin session), calculate the HMAC-SHA256 signature using the static fallback string, and gain full administrative access without knowing any password.
* **Affected location:** `src/lib/admin-auth.ts:16`, `src/lib/customer-auth.ts:16`
* **Why it matters:** Invalidation of all authentication boundaries.
* **Recommended fix:** Remove hardcoded fallback strings. Throw an explicit startup error if `process.env.SESSION_SECRET` is undefined. Set a 64-character high-entropy secret in deployment environment variables.

---

### [CHK-02] Permissive Supabase RLS Exposes Entire Users Table to Public
* **Classification:** Confirmed vulnerability
* **Severity:** CRITICAL
* **Evidence:**
  - `scripts/sync-supabase.mjs:44-47`:
    ```sql
    CREATE POLICY "Public and admin full access to users" ON public.users FOR ALL USING (true) WITH CHECK (true);
    ```
  - `src/lib/client.ts:5-6` exports `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to all browser clients.
* **Risk:** Any user with the publishable key can query `https://[PROJECT].supabase.co/rest/v1/users` to dump all user records, including customer emails, phone numbers, and password values stored in Supabase.
* **Affected location:** `scripts/sync-supabase.mjs:44-47`
* **Why it matters:** Total exfiltration of customer database through external API.
* **Recommended fix:** Drop this policy immediately. Replace with restrictive policies where public users cannot SELECT from `public.users`, or restrict queries strictly to `auth.uid() = id`.

---

### [CHK-03] Hardcoded Database Credentials and Passwords in Repository
* **Classification:** Confirmed vulnerability
* **Severity:** CRITICAL
* **Evidence:**
  - `scripts/add-admin-user.mjs:49`, `scripts/remove-old-admin.mjs:49`, `scripts/sync-supabase.mjs:7-8` hardcode fallback Supabase connection strings containing cleartext PostgreSQL passwords.
  - `scripts/add-admin-user.mjs:10` and `prisma/seed.js:433` hardcode admin passwords.
* **Risk:** Direct remote access to the production database and administrative accounts.
* **Affected location:** `scripts/*.mjs`, `prisma/seed.js`
* **Why it matters:** Credentials committed in code can be harvested by anyone with repository access.
* **Recommended fix:** Rotate the Supabase database password in the cloud dashboard. Remove hardcoded fallback connection strings. Rely exclusively on `process.env.SUPABASE_DATABASE_URL`.

---

### [CHK-04] Plaintext Storage of Commercial License Keys
* **Classification:** Security weakness
* **Severity:** HIGH
* **Evidence:**
  - `prisma/schema.prisma:91`: `keyCode String` (in `LicenseKey` model).
  - `prisma/schema.prisma:114`: `deliveredKeys String?` (in `Order` model).
* **Risk:** If the database file is accessed or an unauthorized query is executed, all commercial software activation keys are immediately compromised in cleartext.
* **Affected location:** `prisma/schema.prisma:91, 114`
* **Why it matters:** Digital license keys represent direct financial inventory.
* **Recommended fix:** Implement envelope encryption or AES-256-GCM symmetric encryption for `keyCode` and `deliveredKeys` before database insertion, storing the decryption key in an isolated secrets manager.

---

### [CHK-05] Disconnected Authentication Middleware
* **Classification:** Security weakness
* **Severity:** HIGH
* **Evidence:**
  - `src/lib/middleware.ts` implements `updateSession`.
  - There is no `middleware.ts` in the project root or `src/middleware.ts`.
* **Risk:** Next.js never executes `updateSession`. Route authorization relies entirely on component-level checks, leaving newly added routes unguarded if an authorization check is forgotten.
* **Affected location:** Project root / `src/` directory
* **Why it matters:** Absence of a centralized enforcement perimeter.
* **Recommended fix:** Create `src/middleware.ts` that imports and executes session validation on protected path matchers (`/admin/:path*`, `/account/:path*`).

---

### [CHK-06] Inconsistent Role Authorization on Product Deletion
* **Classification:** Security weakness
* **Severity:** HIGH
* **Evidence:**
  - `src/app/api/admin/products/route.ts:124` requires `OWNER` or `ADMIN`.
  - `src/app/admin/actions.ts:419` (`deleteProductAction`) does not check role, allowing `SUPPORT` users to delete products.
* **Risk:** Support staff can delete store products through Server Actions even though REST API blocks them.
* **Affected location:** `src/app/admin/actions.ts:418-435`
* **Why it matters:** Privilege escalation / unauthorized destruction of product catalog.
* **Recommended fix:** Add `if (!['OWNER', 'ADMIN'].includes(session.role)) return { error: 'Forbidden' };` to `deleteProductAction`.

---

### [CHK-07] Absence of Rate Limiting Across Public Endpoints
* **Classification:** Missing control
* **Severity:** HIGH
* **Evidence:**
  - `src/app/actions/customer-auth.ts:9` (`loginCustomerAction`).
  - `src/app/admin/actions.ts:15` (`loginAdminAction`).
  - `src/app/api/orders/route.ts:9` (`POST /api/orders`).
  - None of these functions contain rate limiting or lockout logic.
* **Risk:** Automated brute-force attacks against administrative and customer accounts; order spamming and database flooding.
* **Affected location:** Authentication actions and order routes
* **Why it matters:** Credential stuffing attacks and denial-of-service vulnerability.
* **Recommended fix:** Implement an in-memory or Redis-backed rate limiter (e.g. `@upstash/ratelimit`) restricting login attempts to 5 per minute per IP, and order submissions to 10 per hour per IP.

---

### [CHK-08] Disabled TLS Certificate Verification on Database Connection
* **Classification:** Security weakness
* **Severity:** MEDIUM
* **Evidence:** `src/lib/sync-user-supabase.ts:14`: `ssl: { rejectUnauthorized: false }`.
* **Risk:** Connections from Next.js server to Supabase PostgreSQL are vulnerable to man-in-the-middle (MITM) attacks if network traffic is intercepted.
* **Affected location:** `src/lib/sync-user-supabase.ts:14`, `scripts/sync-supabase.mjs:14`
* **Why it matters:** Disabling TLS validation undermines transport encryption.
* **Recommended fix:** Remove `rejectUnauthorized: false` and supply the official Supabase CA certificate bundle or enable standard certificate verification.

---

### [CHK-09] Wildcard Next.js Image Optimization Proxy
* **Classification:** Security weakness
* **Severity:** MEDIUM
* **Evidence:** `next.config.mjs:6-11` configures `remotePatterns: [{ protocol: 'https', hostname: '**' }]`.
* **Risk:** The server can be exploited as an open proxy or amplification tool for outbound HTTP requests by requesting arbitrary image domains via `/_next/image`.
* **Affected location:** `next.config.mjs:6-11`
* **Why it matters:** Exposes server infrastructure to SSRF and bandwidth exhaustion.
* **Recommended fix:** Replace `**` with an explicit whitelist of image hosts used for product assets (e.g. `images.unsplash.com`).

---

### [CHK-10] Missing Content-Security-Policy (CSP) & HSTS Headers
* **Classification:** Missing control
* **Severity:** MEDIUM
* **Evidence:** `next.config.mjs:14-41` specifies `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`, but omits `Content-Security-Policy` and `Strict-Transport-Security`.
* **Risk:** Browsers lack strict directives governing script execution sources and HTTPS protocol enforcement.
* **Affected location:** `next.config.mjs:14-41`
* **Why it matters:** CSP provides critical second-layer defense against Cross-Site Scripting (XSS).
* **Recommended fix:** Add `Content-Security-Policy` with appropriate `default-src 'self'`, script nonces, and `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` to `next.config.mjs`.

---

### [CHK-11] Legacy Plaintext Password Fallback and Timing Side-Channel
* **Classification:** Security weakness
* **Severity:** LOW
* **Evidence:**
  - `src/lib/customer-auth.ts:48-50`: `if (!combinedHash.includes(':')) { return password === combinedHash; }`
  - Plaintext comparison does not run in constant time.
* **Risk:** Password comparison timing varies between legacy plaintext accounts and scrypt-hashed accounts, permitting timing side-channel analysis.
* **Affected location:** `src/lib/customer-auth.ts:48-50`, `src/app/admin/actions.ts:32`
* **Why it matters:** Plaintext passwords should not be retained in database storage.
* **Recommended fix:** Trigger a mandatory password reset for any legacy user whose password does not contain a salt delimiter, deprecating plaintext checks entirely.

---

### [CHK-12] Unbounded CSV/JSON File Ingestion in Admin Product Import
* **Classification:** Missing control
* **Severity:** MEDIUM
* **Evidence:** `src/app/api/admin/products/import/route.ts:103`: `rawContent = await file.text();` without file size check.
* **Risk:** Ingestion of excessively large files can exhaust Node.js heap memory and crash the server.
* **Affected location:** `src/app/api/admin/products/import/route.ts:82-113`
* **Why it matters:** Denies service to the entire application.
* **Recommended fix:** Enforce a maximum file size limit (e.g. 5 MB) before reading file content.

---

### [CHK-13] Guest Account Order Takeover via Registration
* **Classification:** Potential risk requiring verification
* **Severity:** MEDIUM
* **Evidence:** `src/app/actions/customer-auth.ts:50-66`: If a user record exists with email matching registration but without password (created during a guest checkout), registration claims the user record.
* **Risk:** An attacker who knows an unauthenticated customer's email address can register an account with that email and immediately gain access to past order history and digital license keys.
* **Affected location:** `src/app/actions/customer-auth.ts:50-66`
* **Why it matters:** Customer privacy violation and potential key theft.
* **Recommended fix:** Require email verification (OTP or activation link) before linking new account registrations to existing guest order histories.

---

### [CHK-14] Raw Error Message Leakage in API Routes
* **Classification:** Recommendation
* **Severity:** LOW
* **Evidence:** `src/app/api/orders/route.ts:197`: `return NextResponse.json({ error: error.message || 'Failed to process order.' }, { status: 500 });`.
* **Risk:** Unexpected database or internal system errors may include driver strings or schema fragments in the JSON response.
* **Affected location:** `src/app/api/orders/route.ts:197`, `src/app/api/orders/route.ts:293`
* **Why it matters:** Internal implementation details assist attackers in fingerprinting backend components.
* **Recommended fix:** Return generic error messages on HTTP 500 responses in production while logging detailed error traces internally.

---

### [CHK-15] Absence of Automated Backup and Point-in-Time Recovery
* **Classification:** Missing control
* **Severity:** MEDIUM
* **Evidence:** SQLite database `prisma/dev.db` is stored locally without automated backup cron or replication script.
* **Risk:** Physical drive failure, filesystem corruption, or accidental deletion results in total loss of business data.
* **Affected location:** `prisma/dev.db`
* **Why it matters:** Business continuity and disaster recovery.
* **Recommended fix:** Migrate production database to a managed cloud PostgreSQL instance (e.g., Supabase, AWS RDS) with automated daily backups and Point-in-Time Recovery (PITR).

