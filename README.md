# Inventory & Order Management System

Production-ready full-stack assessment project with a React frontend, FastAPI backend API, PostgreSQL database, and Docker Compose orchestration.

## Features

- Product CRUD with unique SKU validation and non-negative stock.
- Customer create/list/detail/delete with unique email validation.
- Order create/list/detail/delete with backend-calculated totals.
- Inventory is reduced when an order is created and restored when an order is canceled.
- Dashboard summary for total products, customers, orders, and low-stock products.
- Responsive React UI with form validation and clear status messages.

## Tech Stack

- Frontend: React, Vite, JavaScript
- Backend: Python, FastAPI, SQLAlchemy
- Database: PostgreSQL
- Containers: Docker, Docker Compose

## Local Development

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
DATABASE_URL=sqlite:///./inventory.db uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8000 npm run dev
```

Docker Compose:

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

The frontend runs at `http://localhost:5173` and the backend API runs at `http://localhost:8000`.

## API Endpoints

- `POST /products`, `GET /products`, `GET /products/{id}`, `PUT /products/{id}`, `DELETE /products/{id}`
- `POST /customers`, `GET /customers`, `GET /customers/{id}`, `DELETE /customers/{id}`
- `POST /orders`, `GET /orders`, `GET /orders/{id}`, `DELETE /orders/{id}`
- `GET /dashboard`
- `GET /health`

## Deployment Notes

Backend can be deployed to Render with `render.yaml`. Configure `CORS_ORIGINS` to include the live Vercel frontend URL.

Frontend can be deployed to Vercel from the `frontend` directory. Set `VITE_API_URL` to the live backend API URL before deploying.

Required submission links after deployment:

- GitHub repository URL
- Docker Hub backend image URL
- Live frontend URL
- Live backend API URL
