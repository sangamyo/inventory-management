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

Frontend is deployed on Vercel at `https://frontend-ooedf0zg9-hari-om-kasaundhans-projects.vercel.app`. Set `VITE_API_URL` to the live backend API URL before redeploying.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the GitHub repo URL, Render Blueprint deeplink, and final deployment checklist.

FigJam architecture diagram: `https://www.figma.com/board/2wZ2CK76ZWwmWKBzHYacEU?utm_source=codex&utm_content=edit_in_figjam&oai_id=&request_id=d4fd3a61-2398-4c18-b65d-5e839f02dc51&architecture=true`

GitHub Actions CI validates backend tests, frontend build, and backend Docker image build on every push.

Required submission links after deployment:

- GitHub repository URL
- Docker Hub backend image URL
- Live frontend URL
- Live backend API URL
