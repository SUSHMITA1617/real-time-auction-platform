# Real-Time Auction Platform

This is a full-stack auction app with live bidding.  
Users can sign up, log in, view auctions, and place bids in real time. Admin users can create, edit, and delete auctions.

The codebase has two apps:
- `client/` for the Next.js frontend
- `server/` for the Express + Prisma backend

## What this project uses
- Next.js + React + TypeScript (frontend)
- Express + TypeScript (backend)
- PostgreSQL + Prisma (database)
- JWT for auth
- Socket.IO for real-time bid updates

## Before you start
Make sure you have:
- Node.js 18+ (Node 20 is ideal)
- npm
- PostgreSQL running locally (or a hosted Postgres instance)

## Quick setup (from scratch)
1. Clone the repo:
```bash
git clone <your-repo-url>
cd real-time-auction-platform
```

2. Install backend dependencies:
```bash
cd server
npm install
```

3. Install frontend dependencies:
```bash
cd ../client
npm install
```

## Environment variables (`.env`)
The backend needs a local `.env` file, and it is intentionally not committed to git.

That is expected and important:
- `.env` usually contains secrets
- pushing it to GitHub is a security risk
- this repo is configured to ignore env files

Create your env file:

Mac/Linux:
```bash
cd server
cp .env.example .env
```

Windows PowerShell:
```powershell
cd server
Copy-Item .env.example .env
```

Then update `server/.env` with real values.

Required keys:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/auction_db?schema=public"
JWT_SECRET="change_this_to_a_long_random_secret"
PORT=5000
```

## Database setup
From the `server/` folder:
```bash
npx prisma generate
npx prisma db push
```

Optional:
```bash
npx prisma studio
```
`prisma studio` is handy if you want to inspect data or change a user's role to `ADMIN`.

## Run locally
Open two terminals.

Terminal 1 (backend):
```bash
cd server
npm run dev
```
Backend starts on `http://localhost:5000`.

Terminal 2 (frontend):
```bash
cd client
npm run dev
```
Frontend starts on `http://localhost:3000`.

## How to use it
1. Open `http://localhost:3000/login`
2. Register a user
3. Log in
4. Browse auctions and place bids

If you need admin features, promote a user in Prisma Studio by setting `role` to `ADMIN`.

## API overview
Auth:
- `POST /api/auth/register`
- `POST /api/auth/login`

Auctions:
- `GET /api/auctions`
- `GET /api/auctions/ongoing`
- `GET /api/auctions/upcoming`
- `GET /api/auctions/completed`
- `GET /api/auctions/:id`
- `POST /api/auctions` (admin)
- `PUT /api/auctions/:id` (admin)
- `DELETE /api/auctions/:id` (admin)

Bids:
- `POST /api/bids` (authenticated user)

## Common local issues
- Database connection errors:
  - check `DATABASE_URL`
  - confirm Postgres is running
- Unauthorized errors:
  - log in again and retry
  - confirm both apps are running on expected ports
- Port conflict:
  - change `PORT` in `server/.env`
  - restart the backend

## Final note
If someone clones this project and creates `server/.env` from `server/.env.example`, they should be able to run everything locally without extra setup surprises.
