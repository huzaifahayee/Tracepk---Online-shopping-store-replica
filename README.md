# TRACE.PK - Development Bootstrap

This repo now contains your complete scope implementation (Huzaifa part) with a runnable full-stack baseline:

- `backend`: Node.js + Express + MSSQL
- `frontend`: React + Vite (Arctic Teal theme)

## Implemented Functionalities (Your 1/3 scope)

- `FR-AUTH-01` Customer Register
- `FR-AUTH-02` Customer Login
- `FR-AUTH-04` Logout (frontend token clear)
- `FR-PROD-01` Product listing (search/sort/pagination)
- `FR-PROD-02` Product detail
- `FR-CART-01` View cart
- `FR-CART-02` Add to cart
- `FR-CART-03` Update cart quantity
- `FR-CART-04` Remove cart item
- `FR-ORD-01` Place order with DB transaction

## Folder Structure

```text
backend/
  src/
    config/
    middleware/
    routes/
    utils/
frontend/
  src/
    api/
    components/
    context/
    pages/
    styles/
```

## Backend Setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Update database and JWT values.
3. Ensure DB schema from `SQLQueries.sql` is executed.
4. Run:

```bash
cd backend
npm install
npm run dev
```

Backend runs at `http://localhost:5000`.

### Windows Auth (recommended for your machine)

Use this in `backend/.env`:

```env
PORT=5000
DB_AUTH_MODE=windows
DB_SERVER=HUZAIFAHAYEE\SQLEXPRESS
DB_NAME=OnlineClothingBrand
JWT_SECRET=replace_with_long_secret
CLIENT_ORIGIN=http://localhost:5173
```

### SQL Login mode (teammate-friendly fallback)

```env
DB_AUTH_MODE=sql
DB_SERVER=localhost\SQLEXPRESS
DB_NAME=OnlineClothingBrand
DB_USER=sa
DB_PASSWORD=your_password
```

## Frontend Setup

1. Copy `frontend/.env.example` to `frontend/.env`.
2. Run:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## API Routes Included

- `POST /api/register`
- `POST /api/login`
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/cart` (auth)
- `POST /api/cart` (auth)
- `PUT /api/cart/:cartId` (auth)
- `DELETE /api/cart/:cartId` (auth)
- `POST /api/orders` (auth)

## Teammate Handoff Guidance

- Teammate 2 can build admin routes in `backend/src/routes/admin*` and add frontend admin pages.
- Teammate 3 can add order history/profile/dashboard modules in both backend and frontend.
- Keep response shape: `{ success, data }` for successful requests and SRS error format for failures.
