# Todo App

A simple full-stack todo list. Create tasks, mark them done, filter/sort, and delete them.

- **Frontend:** React + Vite + Mantine
- **Backend:** NestJS + TypeORM
- **Database:** PostgreSQL

## Requirements

- Node.js 20+ and npm
- PostgreSQL (hosted or local)
- Docker (optional, for a local Postgres via Compose)

## Environment

Create a `.env` file in the project root:

```env
NODE_ENV=development
BACKEND_PORT=3000
FRONTEND_PORT=5173
FRONTEND_URL=http://localhost:5173

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=todo
POSTGRES_SSL=false
DB_SYNCHRONIZE=true
```

Create `frontend/.env`:

```env
VITE_BASE_API_URL=http://localhost:3000
VITE_FRONTEND_PORT=5173
```

To run Postgres locally with Docker:

```bash
docker compose --profile local-db up db -d
```

## Run in development

Install dependencies and start both apps (two terminals):

```bash
# Backend (http://localhost:3000)
cd backend
npm install
npm run start:dev

# Frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).
