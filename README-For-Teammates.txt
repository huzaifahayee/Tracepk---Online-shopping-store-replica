Hello!

To run this project on a fresh clone, follow these steps in order.
Each step is required — skipping any of them is the usual reason "it doesn't work".

────────────────────────────────────────────────────────────────────
1. SETUP THE DATABASE
────────────────────────────────────────────────────────────────────
   - Create a database called `OnlineClothingBrand` in your local SQL Server.
   - Run the `OnlineClothingBrand.sql` file (in the `database` folder)
     to create all base tables.

────────────────────────────────────────────────────────────────────
2. CREATE YOUR .env FILES (DO NOT COMMIT THEM)
────────────────────────────────────────────────────────────────────
   Backend: copy `backend/.env.example` to `backend/.env` and fill in YOUR
   local values (DB password, JWT secret, etc.).

   Frontend: copy `frontend/.env.example` to `frontend/.env`.
   The default `VITE_API_URL=http://localhost:5000/api` is correct for
   local dev.

────────────────────────────────────────────────────────────────────
3. INSTALL DEPENDENCIES (REQUIRED — even if node_modules looks present)
────────────────────────────────────────────────────────────────────
   Why: the repo ships with platform-specific native binaries
   (e.g. `sqlserverv8.node`) that may not match your machine.
   `npm install` rebuilds them correctly and fetches any new packages
   that have been added since the last clone.

   In `backend/`:   npm install
   In `frontend/`:  npm install

────────────────────────────────────────────────────────────────────
4. RUN MIGRATIONS (SCHEMA ADD-ONS)
────────────────────────────────────────────────────────────────────
   These are idempotent — safe to run multiple times.

   In `backend/`:
     node scripts/migrateAddCategoryImageUrl.js

────────────────────────────────────────────────────────────────────
5. SEED THE DATABASE (recommended for fresh installs)
────────────────────────────────────────────────────────────────────
   In `backend/`:
     node src/seed_groovy.js

   This populates 30+ products, categories, and image URLs.

────────────────────────────────────────────────────────────────────
6. START THE SERVERS
────────────────────────────────────────────────────────────────────
   Frontend: in `frontend/`,  npm run dev    (http://localhost:5173)
   Backend:  in `backend/`,   npm run dev    (http://localhost:5000)

────────────────────────────────────────────────────────────────────
7. ADMIN LOGIN
────────────────────────────────────────────────────────────────────
   Each developer's admin password is local. To check what admins exist:
     node scripts/listAdmins.js

   To create a new admin:
     node scripts/createAdmin.js <username> <email> <password> "<full_name>"

   To reset an existing admin's password:
     node scripts/resetAdminPassword.js <email> <newPassword>

────────────────────────────────────────────────────────────────────
TROUBLESHOOTING
────────────────────────────────────────────────────────────────────
   • "Cannot find module 'multer'" or similar  → re-run `npm install`
   • Categories not loading                    → run the migration in step 4
   • Product images broken                     → run the seed in step 5
   • SQL connection error                      → check `backend/.env` DB_*
     vars match your SQL Server setup (server name, auth mode, password)
   • "Invalid token scope" on admin routes     → log out and log in again at
     /admin/login; auth state was hardened to prevent role mixups
