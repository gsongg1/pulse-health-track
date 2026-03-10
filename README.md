# Pulse Health Track

Pulse Health Track is a privacy-first preventive health web app for employer wellness programs. Employees complete lightweight check-ins about sleep, stress, movement, focus, and workload, then receive explainable recommendations and optional team challenges. Admins and managers only see anonymized, aggregate insights instead of private individual health data.

## Features

- Employee onboarding, sign-in, check-ins, recommendations, history, profile, and privacy controls
- Admin dashboards for anonymized wellness trends, participation, and challenge insights
- Deterministic recommendation engine with transparent scoring logic
- Seeded demo data so the app is runnable without external auth or database setup
- Prisma schema and seed script for a future PostgreSQL-backed version

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Prisma
- Recharts
- Zod

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm

### Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000).

### Optional database setup

The current MVP runs on seeded in-memory demo data, so a database is not required for local development. If you want to prepare the Prisma/PostgreSQL path:

1. Create a `.env` file with a `DATABASE_URL`.
2. Generate the Prisma client:

   ```bash
   npm run prisma:generate
   ```

3. Push the schema to your database:

   ```bash
   npm run prisma:push
   ```

4. Seed the database:

   ```bash
   npm run seed
   ```

## Demo Routes

- `/sign-in` for seeded employee, manager, and admin accounts
- `/sign-up` to create a fresh employee and complete onboarding
- `/app/dashboard` for the employee experience
- `/admin/dashboard` for the admin overview

## Notes

- Demo authentication is cookie-based, so no external auth provider is required to explore the app
- Live app reads currently use seeded in-memory data; Prisma and PostgreSQL are scaffolded for the next iteration
- This project is a product prototype and not a medical device
