# TradeForge

A production-style full-stack paper-trading and personal-finance platform.

---

## Architecture Overview

```
TradeForge (Monorepo)
├── apps/
│   ├── api/          # NestJS 11 Backend API (PostgreSQL 18, Prisma ORM, Decimal precision)
│   └── web/          # Next.js 15 Frontend (App Router, Tailwind CSS, TanStack Query, shadcn/ui)
└── packages/
    ├── config/       # Shared TypeScript & Tooling configurations
    ├── types/        # Shared TypeScript domain contracts & enums
    └── validation/   # Shared Zod validation schemas
```

---

## Prerequisites (Windows Local Development)

- **Node.js**: v20+ or v24+ (Node v24.21.0 recommended)
- **npm**: v10+ or v11+ (npm v11.19.0 recommended)
- **PostgreSQL 18**: Installed locally and running as a Windows Service on `localhost:5432`
- **PowerShell**: Windows PowerShell or PowerShell 7

---

## Getting Started

### 1. Configure Local Environment Variables

TradeForge uses a root `.env` file for local development.

1. If not already present, create `.env` from `.env.example`:
   ```powershell
   Copy-Item .env.example .env
   ```

2. Open `.env` in your editor and replace `<PASSWORD>` with your local `postgres` user password:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@localhost:5432/tradeforge"
   ```

> [!WARNING]
> Never commit `.env` to Git. It is included in `.gitignore` by default.

---

### 2. Install Dependencies

From the repository root, install all monorepo dependencies across all workspaces:

```powershell
npm install
```

---

### 3. Initialize Prisma & PostgreSQL Database

1. **Validate Prisma Schema**:
   ```powershell
   npm run prisma:validate
   ```

2. **Generate Prisma Client**:
   ```powershell
   npm run prisma:generate
   ```

3. **Push Schema to PostgreSQL Database** (run after configuring password in `.env`):
   ```powershell
   npm run prisma:push
   ```

---

### 4. Running the Applications

#### Option A: Run All Services Concurrently (Recommended)
Run Turborepo to start both backend API and frontend web application simultaneously:

```powershell
npm run dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:4000/api](http://localhost:4000/api)
- **API Health Check**: [http://localhost:4000/api/health](http://localhost:4000/api/health)

#### Option B: Run Backend API Independently
```powershell
npm run dev:api
```

#### Option C: Run Frontend Web Independently
```powershell
npm run dev:web
```

---

## Monorepo Commands Reference

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts all applications concurrently via Turborepo |
| `npm run dev:api` | Starts only the NestJS backend API (`apps/api`) |
| `npm run dev:web` | Starts only the Next.js web application (`apps/web`) |
| `npm run build` | Builds all packages and applications |
| `npm run build:api` | Compiles the NestJS backend |
| `npm run build:web` | Creates Next.js production build |
| `npm run prisma:validate` | Validates `schema.prisma` syntax |
| `npm run prisma:generate` | Generates `@prisma/client` bindings |
| `npm run prisma:push` | Synchronizes Prisma schema directly to PostgreSQL |
| `npm run check-types` | Typechecks all workspaces without emitting files |
| `npm run format` | Runs Prettier code formatting across the repository |

---

## Core Engineering Invariants

1. **Zero Floating-Point Drift**: All currency, cash balances, and trade executions are represented and stored as exact PostgreSQL `Decimal` types (`@db.Decimal(18, 4)` or `@db.Decimal(24, 8)`).
2. **Backend Isolation**: `apps/web` has zero direct database connectivity. All data access occurs over authenticated REST endpoints in `apps/api`.
3. **Database Transactions**: Any mutation involving balances, positions, or order fills must be wrapped in `prisma.$transaction`.
4. **No Docker / SQLite**: The application is tailored to run directly against local Windows services and PostgreSQL 18.
