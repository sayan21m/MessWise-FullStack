# MessWise

Full-stack mess management project. Backend is Node.js + Express, frontend is React (Vite), and PostgreSQL runs in Docker with Prisma.

## Structure

```text
apps/backend/src/
  config/        # Prisma client, CORS
  controllers/   # Request handlers
  middleware/    # Shared Express middleware
  models/        # Placeholder (Prisma is the source of truth)
  modules/       # Feature modules
  routes/        # API routes
  services/      # Business logic
  utils/         # Helpers
  validators/    # Zod schemas
apps/frontend/   # React + Vite
prisma/          # Schema and migrations
docker-compose.yml
```

## Setup

1. Start PostgreSQL:

   ```bash
   npm run db:up
   ```

2. Install dependencies:

   ```bash
   npm install
   npm install --prefix apps/frontend
   ```

3. Copy env files if needed (already present for local use):

   ```bash
   cp .env.example .env
   cp apps/frontend/.env.example apps/frontend/.env
   ```

4. Generate Prisma client (also runs after `npm install`):

   ```bash
   npm run prisma:generate
   ```

5. Run the API and frontend:

   ```bash
   npm run dev
   npm run dev:frontend
   ```

API: http://localhost:3000  
Health: http://localhost:3000/api/v1/health  
Frontend: http://localhost:5173

When you add models in `prisma/schema.prisma`, create the first migration with:

```bash
npm run prisma:migrate
```
