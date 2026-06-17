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
3. Set `CORS_ORIGINS` to the deployed Vercel frontend URL after the frontend deploy finishes.
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

Deploy from the `frontend` directory.

Set this environment variable before production deployment:

```bash
VITE_API_URL=https://YOUR_RENDER_API_URL
```

Then deploy:

```bash
cd frontend
npx vercel --prod
```

After Vercel gives you the production URL, return to Render and update `CORS_ORIGINS` to that URL.

## Required Submission Links

- GitHub repository: https://github.com/sangamyo/inventory-management
- Backend API URL: Render service URL after Blueprint deploy
- Frontend URL: Vercel production URL after frontend deploy
- Docker Hub backend image URL: publish `backend/Dockerfile` image if the assessment requires an explicit registry image
