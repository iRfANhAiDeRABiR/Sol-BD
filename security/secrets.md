# Solutions BD — Secrets Management Assessment

**Document Version:** 1.0.0  
**Target Application:** Solutions BD  
**Assessment Date:** October 2026  
**Status:** Baseline Security Assessment  

---

## 1. Overview & Expected Secrets Inventory

Solutions BD relies on configuration variables and cryptographic secrets across several distinct services and architectural components. Below is the complete catalog of expected secrets, their intended purpose, and exposure boundaries.

| Variable Name | Secret Type / Sensitivity | Expected Location | Exposure Boundary | Intended Consumer |
|---|---|---|---|---|
| `DATABASE_URL` | Local File Path / Connection String | `.env` / Process Env | Server Only | Prisma Client (SQLite) |
| `SESSION_SECRET` | HMAC Signing Key (High Entropy) | `.env` / Cloud Secrets Manager | Server Only | Session Signing (`admin-auth.ts`, `customer-auth.ts`) |
| `BKASH_APP_KEY` | API Key (Payment Gateway) | Cloud Secrets / `.env` | Server Only | bKash Tokenized Checkout |
| `BKASH_APP_SECRET` | Shared Secret (Payment Gateway) | Cloud Secrets / `.env` | Server Only | bKash Tokenized Checkout |
| `BKASH_USERNAME` | API Identity Credential | Cloud Secrets / `.env` | Server Only | bKash Tokenized Checkout |
| `BKASH_PASSWORD` | API Secret Credential | Cloud Secrets / `.env` | Server Only | bKash Tokenized Checkout |
| `BKASH_BASE_URL` | Service URL (Sandbox/Live) | `.env` | Server Only | bKash REST Client |
| `SUPABASE_DATABASE_URL` | PostgreSQL Connection URI with Password | Cloud Secrets / `.env` | Server Only | Direct PostgreSQL Sync (`pg.Client`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project Gateway URL | `.env` / Public Runtime | Client & Server | Supabase SSR / Browser Client |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Anon / Publishable Key | `.env` / Public Runtime | Client & Server | Supabase SSR / Browser Client |
| `NEXT_PUBLIC_BKASH_PERSONAL_NUMBER` | Public MFS Receiving Phone Number | `.env` / Public Runtime | Client & Server | Checkout UI Display |
| `NEXT_PUBLIC_NAGAD_PERSONAL_NUMBER` | Public MFS Receiving Phone Number | `.env` / Public Runtime | Client & Server | Checkout UI Display |
| `NEXT_PUBLIC_ROCKET_PERSONAL_NUMBER` | Public MFS Receiving Phone Number | `.env` / Public Runtime | Client & Server | Checkout UI Display |

---

## 2. Environment & Configuration Handling

### 2.1 Configuration Hierarchy in Next.js
Next.js loads environment variables in the following order of precedence:
1. `process.env` (system runtime environment)
2. `.env.production.local` / `.env.development.local` / `.env.local`
3. `.env.production` / `.env.development`
4. `.env`

### 2.2 Current Project Environment State
Inspection of the current repository reveals:
* `.env.example`: Provides placeholder templates for database paths, bKash credentials, and Supabase keys. Does **not** declare `SESSION_SECRET`.
* `.env`: Exists in the local directory and contains active local/staging parameters.
* `.env.local`: Exists locally and contains Supabase URLs and direct database credentials.

---

## 3. Git & History Exposure Risks

### 3.1 Unprotected `.env` in `.gitignore`
* **Evidence:** `.gitignore` line 23 contains:
  ```gitignore
  # local env files
  .env*.local
  ```
  Notice that while `.env*.local` is explicitly ignored, `.env` itself is **omitted** from `.gitignore`.
* **Git History Tracking:**
  Inspection of Git commit logs (`git log --all --full-history -- ".env"`) proves that `.env` was committed directly into Git repository history in commit `2c8d04b812eb4c9d9145533eb4e1c4509d3049b9` ("baseline without remote").
* **Risk:** Anyone with clone access to this repository (or any future public mirror) can extract historical versions of `.env`, compromising payment credentials, database paths, and sensitive administrative phone numbers.

---

## 4. Hardcoded Secrets in Source Code & Scripts

### 4.1 Insecure Session Fallback Secrets
When `process.env.SESSION_SECRET` is not provided in the environment, both administrative and customer authentication modules fall back to static, hardcoded plaintext strings:
* Administrative Session Secret: `src/lib/admin-auth.ts` line 16:
  `const SESSION_SECRET = process.env.SESSION_SECRET || '[REDACTED_FALLBACK_ADMIN_KEY]';`
* Customer Session Secret: `src/lib/customer-auth.ts` line 16:
  `const SESSION_SECRET = process.env.SESSION_SECRET || '[REDACTED_FALLBACK_CUSTOMER_KEY]';`

Because neither `.env` nor `.env.local` currently specifies `SESSION_SECRET`, the active application is executing in production with these hardcoded default keys.

### 4.2 Hardcoded Database URIs and Administrative Passwords in Maintenance Scripts
Three maintenance scripts contain hardcoded remote Supabase database connection URIs containing cleartext database passwords:
1. `scripts/add-admin-user.mjs`:
   * Line 10: Cleartext administrative password `password: '[REDACTED_ADMIN_PASSWORD]'`
   * Line 49: Cleartext PostgreSQL connection URI `postgresql://postgres.[REDACTED_PROJECT_REF]:[REDACTED_DB_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`
2. `scripts/remove-old-admin.mjs`:
   * Line 49: Identical hardcoded Supabase connection URI containing `[REDACTED_DB_PASSWORD]`.
3. `scripts/sync-supabase.mjs`:
   * Lines 7–8: Identical hardcoded Supabase connection URI containing `[REDACTED_DB_PASSWORD]`.
4. `prisma/seed.js`:
   * Lines 433 and 441: Cleartext owner password `[REDACTED_ADMIN_PASSWORD]`.

---

## 5. Client-Side Exposure Risks (`NEXT_PUBLIC_` Prefix)

Next.js embeds all environment variables prefixed with `NEXT_PUBLIC_` into the client-side JavaScript bundle distributed to all website visitors.

1. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: This key is designed to be public. However, its safety is strictly contingent upon database Row Level Security (RLS). Because RLS policies in `scripts/sync-supabase.mjs` grant unconditional access (`USING (true) WITH CHECK (true)`), publishing this key completely compromises table contents.
2. `NEXT_PUBLIC_SUPPORT_PHONE` & Personal MFS Numbers: Exposed deliberately for customer contact and manual payments. While public by design, these represent targets for social engineering and SIM-swapping.
3. Server-Only Secrets Leaking Check: Verified that `BKASH_APP_SECRET`, `BKASH_PASSWORD`, and `SUPABASE_DATABASE_URL` do **not** have the `NEXT_PUBLIC_` prefix and are not referenced inside client components (`'use client'`).

---

## 6. Logging & Error Exposure Risks

### 6.1 Server Console Logs
* Several API routes and server actions log error objects directly:
  * `console.error('Order creation error:', error)` (`src/app/api/orders/route.ts` line 195)
  * `console.error('Toggle suspension error:', err)` (`src/app/admin/actions.ts` line 932)
* If database queries fail, database connection strings (containing passwords) or query fragments containing delivered license keys can be dumped into stdout/stderr.
* In containerized environments (Docker, Vercel, AWS ECS), unredacted stdout is captured by logging aggregators (Datadog, CloudWatch, Logflare), creating an external persistence layer for leaked secrets.

### 6.2 Defensive Mitigations Present
* `src/lib/errorSanitizer.ts`: Provides a client-side defensive filter. When database errors occur, it intercepts terms like `prisma`, `sql`, `supabase`, `column`, `jwt`, and `bearer`, replacing them with generic fallback messages before they are rendered in toast notifications.

---

## 7. Secret Rotation Procedures (Operational Guidance)

If any secret is suspected of exposure, the following rotation procedure must be executed:

1. **Supabase Database Password:**
   - Log into Supabase Dashboard -> Project Settings -> Database.
   - Reset database password.
   - Update `SUPABASE_DATABASE_URL` in hosting provider environment variables.
   - Purge scripts containing the hardcoded URI.
2. **Session Secret (`SESSION_SECRET`):**
   - Generate a 64-character cryptographically secure random string: `node -e "console.log(crypto.randomBytes(32).toString('hex'))"`.
   - Set `SESSION_SECRET` in production environment settings.
   - Note: Rotating this key will immediately invalidate all active admin and customer sessions, requiring re-login.
3. **bKash Payment Gateway Credentials:**
   - Contact bKash Merchant Operations to rotate `BKASH_APP_KEY`, `BKASH_APP_SECRET`, and `BKASH_PASSWORD`.
   - Update production environment variables and restart server process.
4. **Git Repository Sanitization:**
   - Use `git filter-repo` or BFG Repo-Cleaner to rewrite history and excise `.env` and hardcoded credentials.
   - Add `.env` to `.gitignore`.

---

## 8. Specific Findings with Concrete Evidence

### Finding SEC-01: Hardcoded Default Session Signing Secrets in Production Fallback
* **Classification:** Confirmed vulnerability
* **Severity:** CRITICAL
* **Evidence:**
  - `src/lib/admin-auth.ts`, line 16:
    ```typescript
    const SESSION_SECRET = process.env.SESSION_SECRET || 'sbd_admin_signing_secret_2026_super_secure';
    ```
  - `src/lib/customer-auth.ts`, line 16:
    ```typescript
    const SESSION_SECRET = process.env.SESSION_SECRET || 'sbd_customer_signing_secret_2026_secure';
    ```
  - `SESSION_SECRET` is absent from `.env`, `.env.example`, and `.env.local`.
* **Risk:** Complete administrative session forgery. Any actor knowing these repository strings can forge valid `sbd_admin_session` cookies with arbitrary roles (e.g. `OWNER`) without authenticating.
* **Affected location:** `src/lib/admin-auth.ts:16`, `src/lib/customer-auth.ts:16`
* **Why it matters:** Eliminates the security boundary between unauthenticated public users and root store administrators.
* **Recommended fix:** Remove hardcoded fallback strings. Throw a fatal error on application startup if `process.env.SESSION_SECRET` is not set. Ensure `SESSION_SECRET` is defined in production environment variables with high cryptographic entropy.

---

### Finding SEC-02: Hardcoded Supabase Database Connection URI and Passwords in Maintenance Scripts
* **Classification:** Confirmed vulnerability
* **Severity:** CRITICAL
* **Evidence:**
  - `scripts/add-admin-user.mjs`, line 49:
    ```javascript
    const connectionUrl = process.env.SUPABASE_DATABASE_URL ||
      'postgresql://postgres.[REDACTED_PROJECT_REF]:[REDACTED_DB_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';
    ```
  - `scripts/remove-old-admin.mjs`, line 49 (identical fallback).
  - `scripts/sync-supabase.mjs`, lines 7–8 (identical fallback).
* **Risk:** Direct remote access to the production Supabase PostgreSQL instance, enabling total database exfiltration or deletion.
* **Affected location:** `scripts/add-admin-user.mjs:49`, `scripts/remove-old-admin.mjs:49`, `scripts/sync-supabase.mjs:7-8`
* **Why it matters:** The database password is exposed to anyone who reads the repository source code.
* **Recommended fix:** Immediately rotate the Supabase database password in the Supabase management console. Remove the fallback URI string from all scripts, requiring `process.env.SUPABASE_DATABASE_URL` to be passed at runtime.

---

### Finding SEC-03: Hardcoded Administrative Passwords in Scripts and Seed Files
* **Classification:** Confirmed vulnerability
* **Severity:** HIGH
* **Evidence:**
  - `scripts/add-admin-user.mjs`, line 10:
    ```javascript
    password: '[REDACTED_ADMIN_PASSWORD]',
    ```
  - `prisma/seed.js`, lines 433 & 441:
    ```javascript
    password: '[REDACTED_ADMIN_PASSWORD]',
    ```
* **Risk:** The default administrative account `solutionsbd247@gmail.com` can be accessed using credentials committed directly into the repository.
* **Affected location:** `scripts/add-admin-user.mjs:10`, `prisma/seed.js:433,441`
* **Why it matters:** Administrative access gives full control over orders, customer accounts, payment approvals, and digital license keys.
* **Recommended fix:** Rotate the administrator account password immediately. Remove hardcoded passwords from seed scripts and generate passwords dynamically from environment variables during database seeding.

---

### Finding SEC-04: `.env` Tracked in Git Repository History
* **Classification:** Security weakness
* **Severity:** HIGH
* **Evidence:**
  - Commit `2c8d04b812eb4c9d9145533eb4e1c4509d3049b9` committed `.env` to Git.
  - `.gitignore` line 23 ignores `.env*.local` but does not include `.env`.
* **Risk:** Deployment secrets, payment gateway configurations, and local credentials are permanently preserved in Git object history.
* **Affected location:** `.gitignore:23`, Git commit history (`.env`)
* **Why it matters:** Any developer or third party with repository access can retrieve all historical secrets.
* **Recommended fix:** Add `.env` and `.env.*` to `.gitignore` (except `.env.example`). Scrub historical commits from Git history using tools such as `git filter-repo`.

---

### Finding SEC-05: Missing `SESSION_SECRET` in `.env.example`
* **Classification:** Missing control
* **Severity:** MEDIUM
* **Evidence:** `.env.example` lists variables like `DATABASE_URL`, `BKASH_APP_KEY`, and `NEXT_PUBLIC_SUPABASE_URL`, but omits `SESSION_SECRET`.
* **Risk:** Developers and system administrators deploying the project will not be aware that `SESSION_SECRET` is required, inadvertently triggering the insecure hardcoded fallback.
* **Affected location:** `.env.example`
* **Why it matters:** Poor security documentation leads directly to insecure deployment configurations in production.
* **Recommended fix:** Add `SESSION_SECRET="generate-a-secure-random-64-character-hex-string"` to `.env.example` with clear instructions on its security impact.

