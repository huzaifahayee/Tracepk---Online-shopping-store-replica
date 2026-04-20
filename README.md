# TRACE.PK — Online Clothing Brand (E‑Commerce Web App)

A full‑stack e‑commerce application for a Pakistani streetwear brand.

- **Frontend:** React 18 + TypeScript + Vite + Tailwind (Arctic Teal theme)
- **Backend:** Node.js + Express REST API
- **Database:** Microsoft SQL Server (MSSQL)
- **Auth:** JWT (separate scopes for Customer and Admin)

---

## Contents

1. [Prerequisites](#1-prerequisites)
2. [Quick Setup (TL;DR)](#2-quick-setup-tldr)
3. [Step‑by‑Step Setup](#3-stepbystep-setup)
   - [3.1 Clone the repo](#31-clone-the-repo)
   - [3.2 Database setup (MSSQL)](#32-database-setup-mssql)
   - [3.3 Configure environment variables](#33-configure-environment-variables)
   - [3.4 Install dependencies](#34-install-dependencies)
   - [3.5 Run the migration](#35-run-the-migration)
   - [3.6 Seed the database](#36-seed-the-database)
   - [3.7 Create an admin account](#37-create-an-admin-account)
   - [3.8 Start the servers](#38-start-the-servers)
4. [Accessing the App](#4-accessing-the-app)
5. [Project Structure](#5-project-structure)
6. [API Endpoints](#6-api-endpoints)
7. [Admin Helper Scripts](#7-admin-helper-scripts)
8. [Troubleshooting](#8-troubleshooting)
9. [Git Workflow Notes](#9-git-workflow-notes)

---

## 1. Prerequisites

Install these on your machine **before** starting.

| Tool | Version | Notes |
|---|---|---|
| **Node.js** | v18 or v20 LTS | <https://nodejs.org> — bundled npm is fine |
| **Microsoft SQL Server** | 2019+ (Express is fine) | Make sure the `SQLEXPRESS` instance is running |
| **SQL Server Management Studio (SSMS)** | Latest | To run the schema and seed SQL files |
| **ODBC Driver 18 for SQL Server** | Only if using **Windows Authentication** | Download from Microsoft |
| **Git** | Latest | For cloning and pulling |

> ✅ **Check everything is ready:**
> ```powershell
> node -v       # v18+ or v20+
> npm -v        # 9+ or 10+
> git --version
> ```

---

## 2. Quick Setup (TL;DR)

For teammates who've done this kind of setup before. Detailed explanations are in [Step‑by‑Step Setup](#3-stepbystep-setup).

```powershell
# 1. Clone
git clone https://github.com/huzaifahayee/Tracepk---Online-shopping-store-replica.git
cd Tracepk---Online-shopping-store-replica

# 2. DB: create a database called OnlineClothingBrand in SSMS, then run SQLQueries.sql

# 3. Env files
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
# ...then edit backend\.env with your local DB credentials + JWT secret

# 4. Install deps
cd backend;  npm install
cd ..\frontend; npm install
cd ..

# 5. Migrate + seed
cd backend
node scripts/migrateAddCategoryImageUrl.js
node seedCategories.js
node seedMockProducts.js
node scripts/createAdmin.js admin admin@trace.pk YourPassword123 "TRACE Admin"
cd ..

# 6. Run (in two terminals)
cd backend;  npm run dev   # http://localhost:5000
cd frontend; npm run dev   # http://localhost:5173
```

---

## 3. Step‑by‑Step Setup

### 3.1 Clone the repo

```powershell
git clone https://github.com/huzaifahayee/Tracepk---Online-shopping-store-replica.git
cd Tracepk---Online-shopping-store-replica
```

### 3.2 Database setup (MSSQL)

1. Open **SSMS** and connect to your local SQL Server instance (typically `localhost\SQLEXPRESS` or `YOUR_PC_NAME\SQLEXPRESS`).
2. Create a new database called exactly:
   ```sql
   OnlineClothingBrand
   ```
3. Open `SQLQueries.sql` from the repo root in SSMS and execute it against the `OnlineClothingBrand` database.
   This creates all base tables (`Users`, `Admins`, `Categories`, `Products`, `Orders`, `Order_Items`, `Shopping_Cart`, etc.), constraints, indexes, and stored procedures.
4. *(Optional)* Run `ProductPolish.sql` for minor schema polish.

> 💡 If the script fails partway through, drop the DB, re-create it, and re-run. `SQLQueries.sql` is idempotent only for `CREATE TABLE IF NOT EXISTS`-style statements, so a clean DB is safest.

### 3.3 Configure environment variables

Both `backend` and `frontend` have `.env.example` files. **Copy them to `.env`** and fill in your values. `.env` files are **not** tracked by git (each teammate has their own).

#### Backend (`backend/.env`)

**Option A — SQL Login (easiest for most teammates):**

```env
PORT=5000
DB_AUTH_MODE=sql
DB_SERVER=localhost\SQLEXPRESS
DB_NAME=OnlineClothingBrand
DB_USER=sa
DB_PASSWORD=your_sa_password
JWT_SECRET=replace_with_any_long_random_string_at_least_32_chars
CLIENT_ORIGIN=http://localhost:5173
```

- Make sure **SQL Server Authentication** is enabled on your instance and the `sa` user has a password set. (In SSMS: Server → right‑click → *Properties* → *Security* → *SQL Server and Windows Authentication mode*.)
- `JWT_SECRET` can be anything — just keep it consistent. Example: paste the output of `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

**Option B — Windows Authentication (if you can't enable `sa`):**

```env
PORT=5000
DB_AUTH_MODE=windows
DB_SERVER=YOUR_PC_NAME\SQLEXPRESS
DB_NAME=OnlineClothingBrand
DB_ODBC_DRIVER=ODBC Driver 18 for SQL Server
JWT_SECRET=replace_with_any_long_random_string_at_least_32_chars
CLIENT_ORIGIN=http://localhost:5173
```

Find `YOUR_PC_NAME` by running `hostname` in PowerShell.

Requires the **ODBC Driver 18 for SQL Server** installed on your machine.

#### Frontend (`frontend/.env`)

The default works for local development:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3.4 Install dependencies

Run `npm install` in **both** folders. This is required even on fresh clones because node modules include platform‑specific native binaries (e.g. `sqlserverv8.node`, `esbuild.exe`) that must be built for your machine.

```powershell
cd backend
npm install

cd ..\frontend
npm install

cd ..
```

### 3.5 Run the migration

This adds the `image_url` column to the `Categories` table. Safe to run multiple times.

```powershell
cd backend
node scripts/migrateAddCategoryImageUrl.js
```

### 3.6 Seed the database

Populate categories and products (~30+ items with images). Run in this order:

```powershell
# still inside the backend folder
node seedCategories.js
node seedMockProducts.js
```

Expected output: "Seeded N categories", "Inserted N products".

### 3.7 Create an admin account

Use the proper admin creation script — it hashes the password with bcrypt:

```powershell
node scripts/createAdmin.js admin admin@trace.pk YourPassword123 "TRACE Admin"
```

Arguments: `<username> <email> <password> "<full_name>"`.

To manage admins later, see [Admin Helper Scripts](#7-admin-helper-scripts).

> ⚠️ Do **not** use `insertAdmin.js` in the backend root — it stores the password unhashed and is kept only as a legacy reference. Use `scripts/createAdmin.js`.

### 3.8 Start the servers

Open **two** terminals.

**Terminal 1 — Backend:**

```powershell
cd backend
npm run dev
```

Expected:
```
Connected to MSSQL
Server running on http://localhost:5000
```

**Terminal 2 — Frontend:**

```powershell
cd frontend
npm run dev
```

Expected:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

## 4. Accessing the App

| URL | Who |
|---|---|
| <http://localhost:5173> | Customer storefront (home, shop, cart, checkout) |
| <http://localhost:5173/signup> | Register a new customer |
| <http://localhost:5173/login> | Customer login |
| <http://localhost:5173/admin/login> | Admin panel login |
| <http://localhost:5000/api/health> | Backend health check (should return JSON) |

Default admin credentials (after step 3.7 with the example password):
- Email: `admin@trace.pk`
- Password: whatever you passed to `createAdmin.js`

---

## 5. Project Structure

```
Trace.pk/
├── backend/
│   ├── src/
│   │   ├── config/         # db.js, env.js  (connection pool + env validation)
│   │   ├── middleware/     # auth, adminAuth, errorHandler, uploadProductImage
│   │   ├── routes/         # authRoutes, productRoutes, cartRoutes, orderRoutes,
│   │   │                     adminRoutes, adminProductRoutes, adminAuthRoutes,
│   │   │                     settingsRoutes
│   │   ├── utils/          # apiError, asyncHandler, listCategories
│   │   ├── app.js          # Express app wiring
│   │   └── server.js       # Entry point (npm run dev)
│   ├── scripts/            # createAdmin, listAdmins, resetAdminPassword,
│   │                         migrateAddCategoryImageUrl, inspectUser, listUsers
│   ├── public/             # Static files served by Express (product images)
│   ├── seedCategories.js   # Seed category rows
│   ├── seedMockProducts.js # Seed product catalogue
│   └── .env.example        # Copy → .env
│
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios instance + endpoint wrappers
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── stores/         # Zustand stores (auth, cart)
│   │   ├── pages/
│   │   │   ├── HomePage, ShopPage, ProductDetailPage, CartPage,
│   │   │   │   CheckoutPage, OrderConfirmationPage, TrackOrderPage,
│   │   │   │   LoginPage, SignupPage, ForgotPasswordPage
│   │   │   ├── account/    # ProfilePage, AddressesPage, OrdersPage, etc.
│   │   │   └── admin/      # AdminLoginPage, OverviewPage, AnalyticsPage,
│   │   │                     AdminProductsPage, CategoriesPage, AdminOrdersPage,
│   │   │                     CustomersPage, InventoryPage, DiscountCodesPage,
│   │   │                     SettingsPage
│   │   ├── types/
│   │   └── App.tsx
│   ├── public/images/      # Product images served by Vite
│   └── .env.example        # Copy → .env
│
├── SQLQueries.sql          # Main schema — run first in SSMS
├── ProductPolish.sql       # Optional schema polish
├── SRS_Group2.docx         # Software Requirements Specification
└── README.md               # This file
```

---

## 6. API Endpoints

All routes are prefixed with `/api`. Requests marked 🔐 require a `Authorization: Bearer <token>` header.

### Public / Auth
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/register` | Customer registration |
| POST | `/api/login` | Customer login (returns JWT) |
| POST | `/api/admin/login` | Admin login (returns admin‑scoped JWT) |

### Products & Categories (public)
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/products` | List with `?search`, `?category`, `?sort`, `?page`, `?limit` |
| GET | `/api/products/:id` | Product detail |
| GET | `/api/categories` | List categories (via admin/settings routes) |

### Cart (customer 🔐)
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/cart` | View my cart |
| POST | `/api/cart` | Add item |
| PUT | `/api/cart/:cartId` | Update quantity |
| DELETE | `/api/cart/:cartId` | Remove item |

### Orders (customer 🔐)
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/orders` | Place order (transactional) |
| GET | `/api/orders` | My order history |
| GET | `/api/orders/:id` | Single order |

### Admin 🔐 (requires admin JWT)
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/admin/dashboard` | Analytics: revenue, top sellers, low stock |
| GET/POST/PUT/DELETE | `/api/admin/products/...` | Product CRUD |
| GET/POST/PUT/DELETE | `/api/admin/categories/...` | Category CRUD |
| GET/PUT | `/api/admin/orders/...` | View + update status |
| GET/DELETE | `/api/admin/users/...` | User management |

Health check: `GET /api/health` — returns `{ success: true, message: "Backend running" }`.

---

## 7. Admin Helper Scripts

Run from inside the `backend` folder.

```powershell
# List all admin accounts
node scripts/listAdmins.js

# Create a new admin (bcrypt‑hashed password)
node scripts/createAdmin.js <username> <email> <password> "<full_name>"

# Reset an existing admin's password
node scripts/resetAdminPassword.js <email> <newPassword>

# Debugging customer accounts
node scripts/listUsers.js
node scripts/inspectUser.js <email>
```

---

## 8. Troubleshooting

| Symptom | Fix |
|---|---|
| `Cannot find module 'multer'` (or similar) | Re‑run `npm install` in the folder that errored. |
| `Missing required env var: DB_SERVER` | You didn't create `backend/.env`, or it's missing required keys. Copy from `.env.example` again. |
| `ConnectionError: Login failed for user 'sa'` | SQL Login isn't enabled, or the password is wrong. Either fix `sa` in SSMS, or switch to `DB_AUTH_MODE=windows`. |
| `Windows DB auth requires 'msnodesqlv8'` | You set `DB_AUTH_MODE=windows` but `npm install` didn't build the native binary. Delete `node_modules` and run `npm install` again. |
| Categories don't load on homepage | Run the migration (`scripts/migrateAddCategoryImageUrl.js`) and re‑run `seedCategories.js`. |
| Product images are broken | Re‑run `seedMockProducts.js` so `image_url` fields get populated. |
| Port 5000 or 5173 already in use | Change `PORT` in `backend/.env`, or kill the stuck Node process: `Get-Process node \| Stop-Process`. |
| `Invalid token scope` on admin routes | You're logged in as a customer. Log out and log back in at `/admin/login`. |
| CORS error in browser console | `CLIENT_ORIGIN` in `backend/.env` must exactly match the Vite URL (default `http://localhost:5173`). |
| Build errors after a git pull | `rm -r frontend/node_modules, backend/node_modules` then `npm install` in each. Native binaries are platform‑specific and may need rebuilding. |

---

## 9. Git Workflow Notes

### What's in the repo
- All source code, SQL, and `.env.example` templates.
- `node_modules/`, build output (`frontend/dist/`), and `.env` files are intentionally **not** tracked — each teammate has their own locals.

### Before committing
- **Never commit `backend/.env` or `frontend/.env`.** `.gitignore` already protects against this. If you ever see `.env` show up in `git status`, stop and remove it from staging.
- Don't commit `node_modules/`, `dist/`, or `*.tsbuildinfo`.
- Run the app end‑to‑end at least once before pushing a feature.

### Branching (suggested)
```powershell
git checkout -b feature/your-feature-name
# ...make changes...
git add .
git commit -m "short, meaningful message"
git push -u origin feature/your-feature-name
# Then open a pull request on GitHub
```

---

**Group 2 — TRACE.PK**
FAST NUCES Lahore · BS Software Engineering · Batch 24 · Section 4B
Muhammad Huzaifa (24L‑3019) · Syed Saad Ali (24L‑2549) · Muhammad Abdullah Rasheed (24L‑3002)
