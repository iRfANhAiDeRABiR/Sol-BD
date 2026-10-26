# Solutions BD — Application Threat Model

**Document Version:** 1.0.0  
**Target Application:** Solutions BD (Next.js 16 Digital License E-Commerce Platform)  
**Assessment Date:** October 2026  
**Status:** Baseline Security Assessment  

---

## 1. Executive Summary

Solutions BD is a digital software marketplace tailored for Bangladesh, selling digital software license keys (operating systems, office productivity, antivirus, and utility software). The application uses Next.js 16 (App Router), React 19, Prisma ORM with SQLite for local operations, and secondary PostgreSQL synchronization via Supabase.

This Threat Model decomposes the architecture, establishes trust boundaries, enumerates threat actors and entry points, analyzes risks using STRIDE methodology, and contrasts existing defensive controls against missing mitigations.

---

## 2. Assets & Business Value

| Asset ID | Asset Name | Description | Confidentiality | Integrity | Availability |
|---|---|---|---|---|---|
| **AST-01** | **Digital License Keys** | Genuine activation codes and retail keys stored in the database (`LicenseKey` table, `Order.deliveredKeys`). Direct inventory loss if compromised. | **CRITICAL** | **CRITICAL** | **HIGH** |
| **AST-02** | **Customer PII & Order History** | Customer names, email addresses, phone numbers, purchase histories, and invoice data. Violation exposes store to reputational and legal harm. | **HIGH** | **HIGH** | **MEDIUM** |
| **AST-03** | **Administrative Credentials & Sessions** | Admin credentials (email, hashed/plaintext passwords) and HMAC-signed session cookies allowing full store control. | **CRITICAL** | **CRITICAL** | **HIGH** |
| **AST-04** | **Payment & Transaction Records** | Manual Mobile Financial Service (MFS) transaction IDs (bKash, Nagad, Rocket), amounts, sender numbers, and verification logs. | **HIGH** | **HIGH** | **MEDIUM** |
| **AST-05** | **Primary Database (SQLite)** | File-based SQLite database (`prisma/dev.db`) storing active product catalogs, customer accounts, orders, and key pools. | **CRITICAL** | **CRITICAL** | **CRITICAL** |
| **AST-06** | **Secondary Database (Supabase PostgreSQL)** | Remote PostgreSQL database in Supabase synchronized with store catalog, user accounts, and completed orders. | **CRITICAL** | **CRITICAL** | **HIGH** |
| **AST-07** | **Storefront Availability & Integrity** | Next.js server runtime, product pricing integrity, coupon validation logic, and frontend availability. | **MEDIUM** | **CRITICAL** | **CRITICAL** |

---

## 3. Trust Boundaries

```
[ Public Internet / Untrusted Zone ]
        │
        ▼ (HTTPS / HTTP Web Requests)
┌────────────────────────────────────────────────────────────────────────┐
│ Trust Boundary 1: Edge & Application Perimeter                        │
│ - Browser Client (Customer / Admin UI / Scrapers)                      │
│ - Entry Points: Next.js API Routes, Server Actions, Public SSR Pages  │
└────────────────────────────────────────────────────────────────────────┘
        │
        ▼ (In-Process Server Execution)
┌────────────────────────────────────────────────────────────────────────┐
│ Trust Boundary 2: Next.js Server Runtime (Node.js)                    │
│ - Route Handlers (`src/app/api/*`)                                     │
│ - Server Actions (`src/app/actions/*`, `src/app/admin/actions.ts`)     │
│ - Session Verification (`admin-auth.ts`, `customer-auth.ts`)          │
└────────────────────────────────────────────────────────────────────────┘
        │                                 │
        ▼ (Local IPC / File System)       ▼ (Outbound TLS TCP)
┌───────────────────────────────┐ ┌──────────────────────────────────────┐
│ Trust Boundary 3: Local DB    │ │ Trust Boundary 4: Remote Supabase    │
│ - Prisma Client (SQLite)      │ │ - Node `pg` Client                   │
│ - Local file `prisma/dev.db`  │ │ - Remote Supabase PostgreSQL Pooler  │
└───────────────────────────────┘ └──────────────────────────────────────┘
                                          │
                                          ▼ (Direct Browser-to-Cloud)
                                  ┌──────────────────────────────────────┐
                                  │ Trust Boundary 5: Supabase Client    │
                                  │ - Browser Supabase JS Client         │
                                  │ - Supabase PostgREST & Auth APIs     │
                                  └──────────────────────────────────────┘
```

1. **Trust Boundary 1 (Client <-> Next.js Server):** Unauthenticated and authenticated clients send HTTP requests, cookies, and multipart form payloads. All incoming request data must be treated as untrusted.
2. **Trust Boundary 2 (Server Internal Subsystems):** Next.js Server Components, Server Actions, and Route Handlers interact with authentication helper functions (`getAdminSession`, `getCustomerSession`). Inconsistent session enforcement between actions and route handlers crosses this boundary.
3. **Trust Boundary 3 (Server <-> Local SQLite Storage):** Next.js server accesses `prisma/dev.db`. Any file-read access or file disclosure compromises all data without network-level access control.
4. **Trust Boundary 4 (Server <-> Supabase PostgreSQL):** Node.js server initiates external database queries using `pg.Client` to synchronize users and catalog data.
5. **Trust Boundary 5 (Browser <-> Supabase Direct Access):** Frontend contains `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Any permissive Row Level Security (RLS) policy allows anonymous clients to bypass the Next.js server entirely.

---

## 4. Threat Actors & Motivations

| Threat Actor | Capabilities | Motivation | Target Assets |
|---|---|---|---|
| **Anonymous External Attacker** | Web traffic manipulation, parameter tampering, automated credential stuffing, bot scraping, cookie forgery. | Financial gain (theft of license keys), inventory exhaustion, coupon abuse. | AST-01, AST-03, AST-07 |
| **Malicious Customer** | Authenticated customer account, access to order placement and profile editing. | Acquiring software keys without paying, claiming other users' past orders, price tampering. | AST-01, AST-02, AST-04 |
| **Rogue / Compromised Staff (`SUPPORT` Role)** | Valid staff administrative session with limited operational scope. | Unauthorized data export, deleting catalog items, unauthorized key injection or retrieval. | AST-01, AST-02, AST-05 |
| **Insider / Code Repository Visitor** | Access to git commit history, local development machines, or source code. | Credential harvesting, accessing hardcoded keys, database hijacking. | AST-03, AST-05, AST-06 |

---

## 5. System Entry Points

1. **Public REST APIs:**
   - `POST /api/orders` — Public order placement and MFS transaction submission.
   - `GET /api/orders` — Order query (differentiated by admin session, customer session, or guest `orderNumber` + `email`/`phone`).
   - `GET /api/auth/me` — Customer session status verification.
2. **Public Server Actions:**
   - `loginCustomerAction`, `registerCustomerAction`, `logoutCustomerAction` (`src/app/actions/customer-auth.ts`).
   - `updateCustomerProfileAction` (`src/app/actions/customer-auth.ts`).
   - `subscribeNewsletterAction`, `submitContactMessageAction` (`src/app/actions/marketing.ts`).
3. **Admin REST APIs:**
   - `GET/POST /api/admin/keys` — Bulk license key upload and inventory query.
   - `GET/POST /api/admin/orders` — Order listing, payment verification, and manual key allocation.
   - `GET/POST/PUT/DELETE /api/admin/products` — Catalog CRUD.
   - `POST /api/admin/products/import` — CSV / JSON bulk product catalog ingestion.
   - `GET /api/admin/products/export` — Catalog data export.
   - `GET /api/admin/products/template` — Import template retrieval.
4. **Admin Server Actions:**
   - `loginAdminAction`, `logoutAdminAction` (`src/app/admin/actions.ts`).
   - `updateOrderStatus`, `verifyPayment` (`src/app/admin/actions.ts`).
   - `createProductAction`, `deleteProductAction`, `updateProductAction`, `updateProductSortOrderAction`, `updateProductSlugAction` (`src/app/admin/actions.ts`).
   - `uploadLicenseKeys` (`src/app/admin/actions.ts`).
   - `createCategoryAction`, `deleteCategoryAction`, `updateCategoryAction` (`src/app/admin/actions.ts`).
   - `toggleSubscriberAction`, `toggleUserSuspensionAction`, `updateUserRoleAction` (`src/app/admin/actions.ts`).
5. **Direct Third-Party Interfaces:**
   - Supabase PostgREST endpoints exposed via `NEXT_PUBLIC_SUPABASE_URL`.
   - Next.js Image Optimization API (`/_next/image`).

---

## 6. STRIDE Threat Analysis

### 6.1 Spoofing

* **T-SPOOF-01: Session Forgery via Hardcoded Fallback Secrets**
  * *Threat:* An attacker crafts an HMAC-SHA256 signed session cookie (`sbd_admin_session` or `sbd_customer_session`) using the hardcoded default fallback secrets found in code.
  * *Evidence:* `src/lib/admin-auth.ts` line 16 (`sbd_admin_signing_secret_2026_super_secure`) and `src/lib/customer-auth.ts` line 16 (`sbd_customer_signing_secret_2026_secure`). Neither `.env`, `.env.example`, nor `.env.local` define `SESSION_SECRET`.
  * *Impact:* Complete administrative takeover or customer account impersonation without knowing user passwords.
  * *Likelihood:* High.
  * *Severity:* **CRITICAL**.

* **T-SPOOF-02: Guest Account Takeover via Unverified Registration**
  * *Threat:* When a user places a guest order with email `victim@example.com`, an attacker can register an account with `victim@example.com`. The registration action claims the existing user record and gains immediate access to previous order history and license keys.
  * *Evidence:* `src/app/actions/customer-auth.ts` lines 50–66 (`registerCustomerAction` re-claims unlinked user record matching email).
  * *Impact:* Unauthorized access to purchased license keys and personal customer data.
  * *Likelihood:* Medium.
  * *Severity:* **HIGH**.

### 6.2 Tampering

* **T-TAMP-01: Direct Supabase Data Tampering via Overly Permissive RLS**
  * *Threat:* Anyone with the public publishable key can read, update, or delete all records in the Supabase `public.users` table because Row Level Security was configured with an unconditional `ALL USING (true) WITH CHECK (true)` policy.
  * *Evidence:* `scripts/sync-supabase.mjs` lines 44–47: `CREATE POLICY "Public and admin full access to users" ON public.users FOR ALL USING (true) WITH CHECK (true);`.
  * *Impact:* Malicious modification of user balances, roles, suspension statuses, or account details.
  * *Likelihood:* High.
  * *Severity:* **CRITICAL**.

* **T-TAMP-02: Man-in-the-Middle on External PostgreSQL Sync**
  * *Threat:* PostgreSQL connections to Supabase disable TLS certificate verification, allowing an attacker positioned on the network to intercept or alter database queries and credentials in transit.
  * *Evidence:* `src/lib/sync-user-supabase.ts` line 14: `ssl: { rejectUnauthorized: false }`.
  * *Impact:* Credential interception, user status manipulation.
  * *Likelihood:* Low-to-Medium (depending on deployment network environment).
  * *Severity:* **MEDIUM**.

* **T-TAMP-03: Unauthorized Catalog Deletion by Support Role**
  * *Threat:* Staff members with the `SUPPORT` role can invoke `deleteProductAction` or `/api/admin/products/import` to delete or overwrite production catalog data, bypassing the RBAC restrictions enforced on other admin endpoints.
  * *Evidence:* `src/app/admin/actions.ts` line 419 (`deleteProductAction` only checks `!session`, not `session.role`).
  * *Impact:* Accidental or malicious destruction of catalog data.
  * *Likelihood:* Medium.
  * *Severity:* **MEDIUM**.

### 6.3 Repudiation

* **T-REP-01: Absence of Audit Logging for License Key Allocation & Export**
  * *Threat:* Administrative actions such as downloading product exports (`/api/admin/products/export`), viewing delivered keys, or manually allocating keys lack persistent audit logging recording IP address, timestamp, and actor identity.
  * *Evidence:* No `AuditLog` table exists in `prisma/schema.prisma`. Actions execute silently without immutable audit trails.
  * *Impact:* Inability to identify rogue staff members who export customer or key data.
  * *Likelihood:* Medium.
  * *Severity:* **MEDIUM**.

### 6.4 Information Disclosure

* **T-INFO-01: Plaintext Storage of Digital License Keys**
  * *Threat:* License keys in `LicenseKey.keyCode` and `Order.deliveredKeys` are stored as unencrypted plaintext in the SQLite database and Supabase PostgreSQL tables.
  * *Evidence:* `prisma/schema.prisma` lines 91 and 114.
  * *Impact:* Any database backup compromise, unauthorized file read, or SQL injection immediately exposes the entire inventory of commercial keys.
  * *Likelihood:* Medium.
  * *Severity:* **HIGH**.

* **T-INFO-02: Hardcoded Production Credentials in Scripts and Git History**
  * *Threat:* Administrative database connection strings, passwords, and plaintext account credentials are hardcoded into maintenance scripts and committed into Git revision history.
  * *Evidence:* `scripts/add-admin-user.mjs` lines 10 & 49, `scripts/remove-old-admin.mjs` line 49, `scripts/sync-supabase.mjs` lines 7–8, `prisma/seed.js` lines 433 & 441, and Git commit `2c8d04b8` committing `.env`.
  * *Impact:* Complete compromise of external Supabase database and admin accounts if source control is accessed.
  * *Likelihood:* High.
  * *Severity:* **CRITICAL**.

* **T-INFO-03: Plaintext Password Legacy Fallback and Timing Side-Channel**
  * *Threat:* If a user record contains a non-colon-delimited string, authentication falls back to direct plaintext string comparison (`password === combinedHash`), which does not run in constant time.
  * *Evidence:* `src/lib/customer-auth.ts` lines 48–50 and `src/app/admin/actions.ts` line 32.
  * *Impact:* Timing disparity between plaintext and scrypt-hashed password validation, facilitating side-channel password enumeration.
  * *Likelihood:* Low.
  * *Severity:* **LOW**.

### 6.5 Denial of Service

* **T-DOS-01: Unbounded File Ingestion in Admin Product Import**
  * *Threat:* The `/api/admin/products/import` endpoint reads the entire uploaded file into server memory via `file.text()` without enforcing a payload size limit or streaming parser, risking Node.js process out-of-memory crashes.
  * *Evidence:* `src/app/api/admin/products/import/route.ts` line 103 (`rawContent = await file.text()`).
  * *Impact:* Denial of service for the Next.js server instance.
  * *Likelihood:* Low-to-Medium.
  * *Severity:* **MEDIUM**.

* **T-DOS-02: Lack of Rate Limiting on Authentication and Order Submissions**
  * *Threat:* Login endpoints (`loginCustomerAction`, `loginAdminAction`), registration, and order creation (`POST /api/orders`) have no IP-based or account-based rate limiting, enabling brute-force attacks and database connection exhaustion.
  * *Evidence:* No rate limiting middleware or Redis/token bucket logic exists in `src/app/api/orders/route.ts` or auth actions.
  * *Impact:* System unresponsiveness, credential stuffing attacks.
  * *Likelihood:* High.
  * *Severity:* **HIGH**.

* **T-DOS-03: Next.js Image Optimization SSRF / Resource Amplification**
  * *Threat:* `next.config.mjs` permits remote image fetching from any HTTPS host (`hostname: '**'`), allowing attackers to abuse `/_next/image` to perform external HTTP scanning or exhaust server CPU and bandwidth.
  * *Evidence:* `next.config.mjs` lines 6–11.
  * *Impact:* Server resource exhaustion, server-side request forgery (SSRF) amplification.
  * *Likelihood:* Medium.
  * *Severity:* **MEDIUM**.

### 6.6 Elevation of Privilege

* **T-ELEV-01: Disconnected Authentication Middleware**
  * *Threat:* The middleware implementation in `src/lib/middleware.ts` is not wired into the application root (`middleware.ts` or `src/middleware.ts`). As a result, Next.js does not execute middleware on any route.
  * *Evidence:* Absence of `middleware.ts` in repo root and `src/middleware.ts`.
  * *Impact:* Protection relies solely on individual handler checks. If any developer omits a check in a future route, it is completely unprotected.
  * *Likelihood:* Medium.
  * *Severity:* **HIGH**.

* **T-ELEV-02: Role Enforcement Disparity Between Actions and API Routes**
  * *Threat:* Role-based access control (RBAC) is inconsistently applied: while `src/app/api/admin/products/route.ts` limits deletions and mutations to `OWNER` and `ADMIN`, `deleteProductAction` in `src/app/admin/actions.ts` permits any valid admin session (including `SUPPORT`) to delete products.
  * *Evidence:* `src/app/admin/actions.ts` line 419 vs `src/app/api/admin/products/route.ts` line 124.
  * *Impact:* Support tier accounts can execute actions reserved for higher-tier administrators.
  * *Likelihood:* Medium.
  * *Severity:* **HIGH**.

---

## 7. Concrete Attack Scenarios

### Scenario 1: Forging Admin Session via Known Default Secret
1. An attacker discovers or deduces that `SESSION_SECRET` is omitted from the deployment environment variables.
2. The attacker extracts the default signing key `'sbd_admin_signing_secret_2026_super_secure'` from `src/lib/admin-auth.ts`.
3. The attacker constructs a session payload:
   `{"id":"attacker-id","email":"admin@target.com","name":"Super Admin","role":"OWNER"}`
4. The attacker computes `HMAC-SHA256(base64Payload, 'sbd_admin_signing_secret_2026_super_secure')`.
5. The attacker sets the cookie `sbd_admin_session=<base64Payload>.<signature>` in their browser.
6. The attacker navigates to `/admin` or invokes `/api/admin/keys`, gaining unrestricted administrative control over all products, orders, and license keys.

### Scenario 2: Direct Exfiltration of User Accounts via Supabase RLS Bypass
1. An attacker inspects client-side network traffic or source bundles on `solutionsbd.com` and extracts `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
2. The attacker uses curl or the Supabase JavaScript client to query the PostgREST endpoint:
   `GET https://[PROJECT_ID].supabase.co/rest/v1/users?select=*`
3. Because `scripts/sync-supabase.mjs` executed `CREATE POLICY ... FOR ALL USING (true) WITH CHECK (true)`, Supabase returns all records from `public.users` including customer emails, names, phone numbers, and stored password hashes.

### Scenario 3: Unauthorized Access to License Keys via Guest Order Takeover
1. Attacker observes an unauthenticated purchase or creates an order for a known victim's email `victim@domain.com` without signing in.
2. The attacker uses `registerCustomerAction` to register an account with `victim@domain.com`.
3. Because the user record was initially created without a password, the system associates the attacker's newly supplied password with that user record.
4. The attacker signs in and visits `/account` or queries `GET /api/orders`.
5. The system returns all previous orders and digital license keys associated with `victim@domain.com`.

---

## 8. Existing Mitigations vs Missing Mitigations

| Security Domain | Existing Mitigation in Codebase | Missing Mitigation Required |
|---|---|---|
| **SQL Injection** | Prisma ORM parameterization used for local SQLite queries; parameterized `$1, $2` queries used in `pg.Client`. | Raw SQL query strings in `scripts/sync-supabase.mjs` for DDL statements. |
| **Password Hashing** | Salted scrypt key derivation (`crypto.scryptSync`) with constant-time verification (`crypto.timingSafeEqual`) in `src/lib/customer-auth.ts`. | Legacy plaintext fallback is still supported; legacy accounts are not forced to reset on login. |
| **Price Tampering** | Server-side price recalculation: `POST /api/orders` ignores client-submitted prices and recalculates subtotal from DB `ProductVariant.price`. | Minimum order threshold is not enforced on zero-cost edge cases after coupon application. |
| **Client Error Leaks** | `src/lib/errorSanitizer.ts` strips database internals, SQL strings, and Prisma keywords from client-facing toast alerts. | Server-side route handlers still return raw `error.message` in 500 responses (e.g., `src/app/api/orders/route.ts` line 197). |
| **Clickjacking** | `X-Frame-Options: SAMEORIGIN` configured in `next.config.mjs`. | Content-Security-Policy (`frame-ancestors`) header is missing. |
| **Session Integrity** | Cookies configured with `httpOnly: true`, `sameSite: 'lax'`, `secure: true` in production. | Session signing relies on insecure fallback string when environment variable is unset; no server-side session revocation table exists. |
| **Rate Limiting** | None. | No rate limiting on login, registration, contact forms, or order creation. |
| **Secret Management** | `.env*.local` included in `.gitignore`. | `.env` was committed to git; secrets hardcoded in maintenance scripts. |
| **Database Encryption** | None. SQLite database is unencrypted at rest. | Encryption-at-rest for digital keys (`LicenseKey.keyCode`) is absent. |

---

## 9. Threat Model Maintenance & Verification

This threat model must be updated whenever:
1. New third-party payment gateways (e.g., automated bKash/Nagad checkout APIs) are added.
2. The database architecture transitions from SQLite to hosted PostgreSQL.
3. Automated key generation or external vendor webhook integrations are implemented.

