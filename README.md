# SolutionsBD — Bangladeshi Digital Software & License Key E-Commerce Platform

A production-ready, high-converting digital e-commerce website modeled after [shahedstore.com.bd](https://shahedstore.com.bd/), built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**.

Designed specifically for the Bangladeshi digital goods market (Windows, Office 365, IDM Lifetime, Antivirus, Adobe, VPN) with **instant automated key delivery** and **bKash / Nagad / Rocket payment integration**.

---

## 🚀 Key Features

- **⚡ Instant 10-Second Automated Key Delivery**: License keys are atomically reserved, marked as sold, revealed immediately on-screen with 1-click copy-to-clipboard, and emailed to the customer.
- **💳 Local Bangladeshi Payment Ecosystem**:
  - **bKash Tokenized Online Payment Gateway** (Instant auto-release)
  - **bKash Personal Send Money (Manual MFS)** with TrxID & Sender Phone submission
  - **Nagad Send Money (Manual MFS)**
  - **Rocket & DBBL Bank Transfer**
- **🔑 Digital License Key Vault (`/my-licenses`)**: Customers can look up any past order using their email or order number (`SBD-2026-XXXX`) to retrieve active keys and activation guides anytime.
- **🛡️ Comprehensive Admin Dashboard (`/admin`)**:
  - Live revenue (৳), total orders, pending review queue, and inventory stock monitor
  - **1-Click Manual TrxID Verification**: Approve customer's manual payment to instantly release the license key
  - **Bulk Key Pool Importer**: Paste dozens or hundreds of raw license keys to instantly restock any product variant
- **🏷️ High-Conversion Storefront**:
  - Glassmorphic floating header navbar & top announcement marquee
  - Hero Deals Carousel with official reseller badges
  - Flash sales with real-time ticking countdown timer
  - Category filters (`Windows`, `Office`, `Antivirus`, `Utility`, `Creative`, `VPN`)
  - Bengali & English bilingual copy and activation instructions
  - Live WhatsApp support floating button (`wa.me`)

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Glassmorphism, CSS Animations
- **Icons**: Lucide React
- **State Management**: Zustand
- **Database / ORM**: Prisma ORM with SQLite (local development zero-config) or PostgreSQL (Supabase / Neon ready)
- **Toast Notifications**: Sonner

---

## 🏁 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database & Seed Initial Catalog
The project comes pre-configured with a zero-config SQLite database (`prisma/dev.db`) populated with popular Bangladeshi software products (Windows 11 Pro, Office 2021, IDM Lifetime, Kaspersky, NordVPN, Adobe):
```bash
# Push schema to database
npx prisma db push

# Seed products and license keys
node prisma/seed.js
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Key Routes

- `/` — Homepage (Hero carousel, Categories, Flash sales, Best sellers, Trust signals, FAQ)
- `/shop` — Catalog page with instant search and category filters
- `/product/[slug]` — Product detail page with variant selection, activation instructions, and instant Buy Now
- `/checkout` — Streamlined single-page checkout with bKash online & manual Send Money TrxID support
- `/order-success/[orderNumber]` — Instant license key reveal screen with copy button and invoice printable view
- `/my-licenses` — Customer license key lookup vault
- `/admin` — Admin management center for orders, manual approvals, and bulk key inventory uploads

---

## ⚙️ Environment Variables (`.env`)

```env
DATABASE_URL="file:./dev.db"

NEXT_PUBLIC_APP_NAME="SolutionsBD"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SUPPORT_PHONE="+8801840000000"
NEXT_PUBLIC_SUPPORT_EMAIL="support@solutionsbd.com"
NEXT_PUBLIC_WHATSAPP_NUMBER="8801840000000"

# Manual MFS Numbers displayed at checkout
NEXT_PUBLIC_BKASH_PERSONAL_NUMBER="01840000000"
NEXT_PUBLIC_NAGAD_PERSONAL_NUMBER="01840000000"
NEXT_PUBLIC_ROCKET_PERSONAL_NUMBER="01840000000"

# bKash Automated Gateway (Tokenized API)
BKASH_APP_KEY="your_bkash_app_key"
BKASH_APP_SECRET="your_bkash_app_secret"
BKASH_USERNAME="your_bkash_username"
BKASH_PASSWORD="your_bkash_password"
BKASH_BASE_URL="https://tokenized.sandbox.bka.sh/v2"
```

---

## 🔄 Switching to PostgreSQL / Supabase for Production

To connect to a live Supabase or PostgreSQL database:
1. Open `prisma/schema.prisma` and change:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `DATABASE_URL` in `.env` with your Supabase connection string.
3. Run `npx prisma db push` and `node prisma/seed.js`.

