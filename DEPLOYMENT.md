# Deployment Checklist

## GitHub Repository

Repository: https://github.com/sangamyo/inventory-management

## Backend on Render

The backend and PostgreSQL database are configured in `render.yaml`.

Open this Render Blueprint link:

https://dashboard.render.com/blueprint/new?repo=https://github.com/sangamyo/inventory-management

Then:

1. Connect GitHub if Render asks for access.
2. Confirm the Blueprint services:
   - `inventory-api`
   - `inventory-db`
3. Confirm `CORS_ORIGINS` is set to the Vercel frontend URL.
4. Apply the Blueprint and wait for the API service to become live.
5. Verify the backend:

```bash
curl https://YOUR_RENDER_API_URL/health
```

Expected response:

```json
{"status":"ok"}
```

## Frontend on Vercel

Production URL:

https://frontend-ooedf0zg9-hari-om-kasaundhans-projects.vercel.app

Deploy from the `frontend` directory.

Set this environment variable before production deployment:

```bash
VITE_API_URL=https://inventory-api.onrender.com
```

Then deploy:

```bash
cd frontend
npx vercel --prod
```

`VITE_API_URL` has already been added to the Vercel production environment for this project. If Render gives the API a different hostname, update `VITE_API_URL` in Vercel and redeploy.

## Required Submission Links

- GitHub repository: https://github.com/sangamyo/inventory-management
- GitHub Actions CI: https://github.com/sangamyo/inventory-management/actions
- Backend API URL: `https://inventory-api.onrender.com` after Blueprint deploy
- Frontend URL: https://frontend-ooedf0zg9-hari-om-kasaundhans-projects.vercel.app
- Docker Hub backend image URL: publish `backend/Dockerfile` image if the assessment requires an explicit registry image

## Figma

Editable FigJam architecture diagram:

https://www.figma.com/board/2wZ2CK76ZWwmWKBzHYacEU?utm_source=codex&utm_content=edit_in_figjam&oai_id=&request_id=d4fd3a61-2398-4c18-b65d-5e839f02dc51&architecture=true
