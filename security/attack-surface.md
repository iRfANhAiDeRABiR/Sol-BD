# Solutions BD — Attack Surface Analysis

**Document Version:** 1.0.0  
**Target Application:** Solutions BD (Next.js 16 Web Application)  
**Assessment Date:** October 2026  
**Status:** Baseline Security Assessment  

---

## 1. Executive Summary

This document maps all reachable attack surfaces of the Solutions BD e-commerce platform. It categorizes entry vectors across network endpoints, server actions, authentication surfaces, user inputs, database channels, file handlers, background sync routines, and third-party integrations.

---

## 2. Public Network Endpoints & API Routes

The following endpoints are accessible without authentication over the public internet:

### 2.1 REST API Routes

| Endpoint | Method | Input Parameters | Authentication / Authorization | Function & Risk Analysis |
|---|---|---|---|---|
| `/api/orders` | `POST` | `customerName`, `customerEmail`, `customerPhone`, `items` (array of `variantId`, `quantity`), `paymentMethod`, `paymentTrxId`, `senderPhone`, `couponCode`, `userId` | None (Public) | **Order Placement & Payment Submission:** Recalculates subtotal server-side. Vulnerable to automated submission spam due to lack of rate limiting or CAPTCHA. |
| `/api/orders` | `GET` | `orderNumber`, `email`, `phone` (query params) | Optional (Branching logic) | **Order Lookup:** If guest, requires `orderNumber` AND (`email` OR `phone`). If session present, scopes to authenticated user. High-volume order tracking queries can be attempted if order numbers are guessed. |
| `/api/auth/me` | `GET` | Cookie: `sbd_customer_session` | Authenticated (Customer) | **Session Verification:** Reads HMAC cookie and returns customer profile. Fails closed with 401 if unauthenticated. |

### 2.2 Public Server Actions

Next.js Server Actions are exposed as POST endpoints reachable by direct HTTP invocation via `Next-Action` headers:

| Server Action | Source Location | Input Payload | Risk Surface |
|---|---|---|---|
| `loginCustomerAction` | `src/app/actions/customer-auth.ts:9` | `FormData` (`email`, `password`) | Credential brute-force, account enumeration via timing disparity on legacy passwords. |
| `registerCustomerAction` | `src/app/actions/customer-auth.ts:46` | `FormData` (`name`, `email`, `phone`, `password`) | Account creation spam, guest account takeover if email matches prior unlinked guest order. |
| `logoutCustomerAction` | `src/app/actions/customer-auth.ts:167` | None | Session cookie invalidation. |
| `subscribeNewsletterAction` | `src/app/actions/marketing.ts:6` | `email: string` | Database spam / subscriber table flooding. |
| `submitContactMessageAction` | `src/app/actions/marketing.ts:39` | `{ name, email, subject, message }` | Unauthenticated contact form spam, potential database bloat. |

---

## 3. Administrative Surface & Internal Endpoints

Administrative functions are guarded by `getAdminSession()`, which parses the `sbd_admin_session` cookie.

### 3.1 Admin REST API Routes

| Endpoint | Method | Allowed Roles | Function & Attack Surface |
|---|---|---|---|
| `/api/admin/keys` | `GET` | `OWNER`, `ADMIN`, `SUPPORT` | Queries license key inventory by variant. Exposes total stock metrics. |
| `/api/admin/keys` | `POST` | `OWNER`, `ADMIN`, `SUPPORT` | Bulk upload of raw license keys (`keysText` string). Accessible to `SUPPORT` tier. |
| `/api/admin/orders` | `GET` | `OWNER`, `ADMIN`, `SUPPORT` | Lists all customer orders, delivered keys, and transaction IDs. |
| `/api/admin/orders` | `POST` | `OWNER`, `ADMIN`, `SUPPORT` | Manual order approval, cancellation, and manual key allocation. |
| `/api/admin/products` | `GET` | `OWNER`, `ADMIN`, `SUPPORT` | Lists all catalog products, variants, and stock counts. |
| `/api/admin/products` | `POST`, `PUT` | `OWNER`, `ADMIN` | Catalog product creation and modification. |
| `/api/admin/products` | `DELETE` | `OWNER`, `ADMIN` | Deletes product and associated variants. |
| `/api/admin/products/import` | `POST` | Any valid Admin (`OWNER`, `ADMIN`, `SUPPORT`) | Ingests multipart CSV or raw JSON to bulk upsert catalog. **Notice:** Missing role check for `SUPPORT`. |
| `/api/admin/products/export` | `GET` | `OWNER`, `ADMIN`, `SUPPORT` | Dumps complete catalog in CSV or JSON format. |
| `/api/admin/products/template` | `GET` | Any | Returns sample CSV template for import. |

### 3.2 Admin Server Actions

Defined in `src/app/admin/actions.ts`:
* `loginAdminAction` (Line 15): Publicly callable authentication handler. Accepts `email`, `password`.
* `logoutAdminAction` (Line 69): Clears admin cookie.
* `updateOrderStatus` (Line 78): Updates order state (`COMPLETED`, `CANCELLED`). Allocates keys on completion.
* `verifyPayment` (Line 180): Approves payment transactions and links verifier admin ID.
* `createProductAction` (Line 315), `updateProductAction` (Line 514): Catalog editing.
* `deleteProductAction` (Line 418): **Disparity Alert:** Deletes product without checking role (accessible to `SUPPORT`).
* `updateProductSortOrderAction` (Line 437), `updateProductSlugAction` (Line 461): Catalog arrangement.
* `uploadLicenseKeys` (Line 708): Bulk key insertion.
* `createCategoryAction` (Line 756), `deleteCategoryAction` (Line 786), `updateCategoryAction` (Line 813): Taxonomy management.
* `toggleSubscriberAction` (Line 867): Toggles newsletter subscriber status.
* `toggleUserSuspensionAction` (Line 894): Suspends or restores customer account; asynchronously syncs to Supabase.
* `updateUserRoleAction` (Line 937): Promotes/demotes user roles (`CUSTOMER`, `SUPPORT`, `ADMIN`). Properly restricted to `OWNER` and `ADMIN`.

---

## 4. Authentication & Authorization Surfaces

### 4.1 Session Mechanism & Cookie Structure
Both customer and admin authentication use custom signed cookies:
* Cookie Names: `sbd_customer_session`, `sbd_admin_session`.
* Cookie Structure: `base64url(JSON_payload) + '.' + HMAC-SHA256(base64url(JSON_payload), SESSION_SECRET)`.
* Cookie Options:
  * `httpOnly: true` (prevents JavaScript `document.cookie` access).
  * `secure: process.env.NODE_ENV === 'production'` (HTTPS only in production).
  * `sameSite: 'lax'` (CSRF mitigation for standard GET navigations).
  * `path: '/'`.
  * `maxAge: 7 * 24 * 60 * 60` (7 days).

### 4.2 Architectural Vulnerability: Unwired Middleware
* The project implements a session validation and redirect routine in `src/lib/middleware.ts` (`updateSession`).
* **Critical Finding:** There is **no root `middleware.ts` or `src/middleware.ts` file**. Next.js App Router requires `middleware.ts` to be located in the project root or directly inside `src/`.
* As a result, `src/lib/middleware.ts` is dead code. All route authorization depends entirely on localized checks inside individual page components, actions, or route handlers.

---

## 5. User Input Validation & Parsing Surface

| Input Channel | Input Fields | Parsing / Validation Mechanism | Risk / Observations |
|---|---|---|---|
| **Checkout API** (`/api/orders`) | `customerName`, `customerEmail`, `customerPhone`, `items`, `paymentTrxId` | Trimmed, basic type checking, quantity clamped `[1, 100]`. Variant price is queried from DB. | Good server-side price validation; phone and transaction IDs are stored without strict regex format checks. |
| **Product Import API** (`/api/admin/products/import`) | Multipart CSV file or JSON body | Custom RFC-4180 CSV parser (`parseCsvRows`) and JSON parser in memory. | No file size limit enforced prior to `file.text()`. Potential memory exhaustion via oversized file upload. |
| **Admin License Key Bulk Upload** (`uploadLicenseKeys`) | `rawKeysText` string | Split by newline `\n`, trimmed, empty lines discarded. | Keys are stored directly into SQLite and Supabase in plaintext. |
| **Contact Form** (`submitContactMessageAction`) | `name`, `email`, `subject`, `message` | Basic presence and `@` check. | No sanitization of subject or message; stored in DB. |
| **URL Search Parameters** (`/api/orders`, `/shop`) | `orderNumber`, `email`, `phone`, `category`, `search`, `sort` | Prisma parameterized queries. | Safe from SQL injection via Prisma query builder. |

---

## 6. File Uploads & Client-Side Image Processing

### 6.1 Direct Server File Uploads
* The only server-side file upload endpoint is `/api/admin/products/import`, accepting `multipart/form-data` with a single file parameter named `file` (expected to be CSV or JSON).
* Files are read into memory using `await file.text()` and are **never** written to the local server disk or storage bucket.
* **Risk:** Memory exhaustion / DoS from excessively large uploads.

### 6.2 Client-Side Image Processing
* `src/lib/imageProcessing.ts` contains utilities for client-side image manipulation (resizing, watermark application, meme text, canvas drawing).
* All operations execute in the client's web browser using HTML5 Canvas (`document.createElement('canvas')`).
* No server-side image processing libraries (e.g. ImageMagick, Sharp) are directly exposed to untrusted user input on the backend.

### 6.3 Next.js Image Optimization Proxy
* `next.config.mjs` configures:
  ```javascript
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  }
  ```
* **Risk Surface:** Any user or bot can request `/_next/image?url=https://malicious-target.com/image.png&w=640&q=75`. Because `hostname: '**'` matches every host, an attacker can use the Next.js server as an open proxy or amplification agent.

---

## 7. Database Access Surface

### 7.1 SQLite (Primary Database)
* Connection: Local file path `prisma/dev.db` via `@prisma/client`.
* Interaction: Fully mediated by Prisma ORM. No raw SQL template literals (`prisma.$queryRawUnsafe`) are used in the codebase.
* Physical Exposure: The database file resides on the local filesystem. If an attacker achieves local file inclusion (LFI) or server-side arbitrary file read, the entire database is compromised.

### 7.2 Supabase PostgreSQL (Secondary / Sync Database)
* Connection: Initiated via `pg.Client` using connection string `SUPABASE_DATABASE_URL` (or hardcoded fallback).
* Operations:
  * Catalog sync (`scripts/sync-supabase.mjs`): Re-creates schema and syncs tables.
  * Customer suspension sync (`src/lib/sync-user-supabase.ts`): Parameterized query:
    `UPDATE public.users SET is_active = $1, updated_at = NOW() WHERE email = $2;`
* **Vulnerability:** `ssl: { rejectUnauthorized: false }` disables TLS certificate verification, exposing the database connection to TLS MITM attacks.

---

## 8. Third-Party Integrations & External Reachability

### 8.1 Supabase Browser Exposure
* Frontend exposes:
  * `NEXT_PUBLIC_SUPABASE_URL`
  * `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
* Attackers can directly access PostgREST endpoints at `https://[PROJECT].supabase.co/rest/v1/`.
* Because `scripts/sync-supabase.mjs` line 45 applies `CREATE POLICY ... FOR ALL USING (true) WITH CHECK (true);` to `public.users`, this external interface represents an active data exfiltration vulnerability.

### 8.2 bKash Payment Gateway Integration
* Environment variables `BKASH_APP_KEY`, `BKASH_APP_SECRET`, `BKASH_USERNAME`, and `BKASH_PASSWORD` are defined for tokenized sandbox/live integration.
* Active checkout flow in `src/app/api/orders/route.ts` uses manual MFS transaction reporting (`paymentTrxId`, `senderPhone`).
* Automated bKash webhook listeners are not currently active in `src/app/api`.

---

## 9. Dependency & Supply Chain Surface

Review of `package.json` identifies the following key dependencies and exposure points:
* `next@^16.3.4`: Modern Next.js version with React 19. Ensure Next.js security advisories are monitored.
* `@prisma/client@^5.20.0` & `prisma@^5.20.0`: Database abstraction layer.
* `pg@^8.23.0`: PostgreSQL client driver used for Supabase sync.
* `pdf-lib@^1.17.1`: Used for PDF generation (ensure memory limits on large document rendering).
* `@supabase/ssr@^0.12.6` & `@supabase/supabase-js@^2.115.0`: Supabase client libraries.
* `recharts@^3.10.1`: Admin analytics charting.

---

## 10. Specific Attack Surface Findings

### Finding ATK-01: Inactive Authentication Middleware
* **Classification:** Confirmed vulnerability
* **Severity:** HIGH
* **Evidence:** `src/lib/middleware.ts` exists, but there is no `middleware.ts` in the project root or `src/middleware.ts`.
* **Risk:** Next.js completely skips middleware execution. Any route or page that relies on middleware for protection is left unguarded.
* **Affected location:** Project root / `src/middleware.ts` (missing file)
* **Why it matters:** The defense-in-depth perimeter is inoperative; route protection is entirely decentralized.
* **Recommended fix:** Place a standard `middleware.ts` in the project root or `src/` directory that exports a Next.js middleware function with explicit path matching (e.g. `/admin/:path*`, `/account/:path*`), excluding public assets and marketing pages.

---

### Finding ATK-02: Role-Based Access Control Bypass on Product Deletion
* **Classification:** Security weakness
* **Severity:** HIGH
* **Evidence:**
  - `src/app/api/admin/products/route.ts`, line 124:
    ```typescript
    if (!['OWNER', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Access denied: Requires ADMIN or OWNER role' }, { status: 403 });
    }
    ```
  - `src/app/admin/actions.ts`, line 419 (`deleteProductAction`):
    ```typescript
    const session = await getAdminSession();
    if (!session) return { error: 'Unauthorized.' };
    // No role check!
    await prisma.product.delete({ where: { id: productId } });
    ```
* **Risk:** A staff user with the `SUPPORT` role cannot delete products via `/api/admin/products`, but can successfully invoke `deleteProductAction` to permanently delete any product from the catalog.
* **Affected location:** `src/app/admin/actions.ts:418-435`
* **Why it matters:** Inconsistent authorization logic breaks the principle of least privilege.
* **Recommended fix:** Enforce `if (!['OWNER', 'ADMIN'].includes(session.role))` inside `deleteProductAction` before executing database mutations.

---

### Finding ATK-03: Next.js Image Optimization Open SSRF / Proxy Surface
* **Classification:** Security weakness
* **Severity:** MEDIUM
* **Evidence:** `next.config.mjs`, lines 6–11:
  ```javascript
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  }
  ```
* **Risk:** The server's internal image optimizer will attempt to fetch and process images from any arbitrary internet domain, allowing attackers to perform external port scanning or resource exhaustion.
* **Affected location:** `next.config.mjs:6-11`
* **Why it matters:** Image proxy endpoints can be abused for distributed denial-of-service or internal network reconnaissance.
* **Recommended fix:** Restrict `remotePatterns` to trusted image CDNs (e.g., Unsplash, Cloudinary, Supabase Storage) rather than the `**` wildcard.

---

### Finding ATK-04: Unbounded CSV/JSON File Ingestion in Admin Import
* **Classification:** Missing control
* **Severity:** MEDIUM
* **Evidence:** `src/app/api/admin/products/import/route.ts`, lines 95–109. No payload size check or chunk limit is applied to the incoming multipart or JSON payload before calling `file.text()`.
* **Risk:** An authenticated admin or support user could upload a 500MB+ file, consuming Node.js heap memory and crashing the server process.
* **Affected location:** `src/app/api/admin/products/import/route.ts:82-113`
* **Why it matters:** Lack of input volume bounds enables memory exhaustion denial-of-service.
* **Recommended fix:** Check `file.size` or `Content-Length` header and reject files exceeding a reasonable threshold (e.g. 5 MB) with HTTP 413 Payload Too Large.

