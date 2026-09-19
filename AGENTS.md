# TradeForge — Agent & Engineering Development Rules

This document governs all architectural, engineering, and coding practices across the **TradeForge** repository. Any AI agent or human contributor working on this codebase must strictly adhere to these rules.

---

## 1. Architectural Invariants

### 1.1 Backend Ownership of Business Logic
- **All business logic, validations, calculations, and data persistence belong strictly in `apps/api` (NestJS).**
- `apps/web` (Next.js) is a presentation and client state layer only.
- Under **NO circumstances** may `apps/web` import `@prisma/client`, connect directly to PostgreSQL, or perform raw database queries. All communication with the data store must go through authenticated REST endpoints provided by `apps/api`.

### 1.2 Financial Precision Standard (Zero Floating-Point Drift)
- **NEVER use IEEE 754 floating-point types (`number` in TS, `FLOAT`/`REAL` in SQL) for currency, account balances, order prices, transaction amounts, or asset quantities.**
- In PostgreSQL / Prisma:
  - Cash / Account balances / Transaction amounts: `Decimal @db.Decimal(18, 4)`
  - Order prices & execution prices: `Decimal @db.Decimal(18, 4)`
  - Asset quantities (including fractional crypto): `Decimal @db.Decimal(24, 8)`
- In TypeScript backend logic:
  - Perform financial arithmetic exclusively using `decimal.js` or Prisma's built-in `Decimal` class.
- In DTOs & API boundaries:
  - Transport financial amounts as decimal strings (e.g. `"10500.5000"`). Validate using `@tradeforge/validation` schemas (`positiveDecimalStringSchema`, `monetaryDecimalStringSchema`).

### 1.3 Database Transactions
- **All multi-step financial and portfolio operations must be wrapped in ACID transactions (`prisma.$transaction`).**
- Examples requiring explicit transactions:
  - Order placement (verifying funds + deducting available balance + creating order record).
  - Order execution (updating position + creating ledger transaction + updating cash balance).
  - Wallet deposit/withdrawal (updating account balance + inserting immutable transaction ledger entry).

### 1.4 Authentication & Authorization
- Auth tokens (JWT / session) must be issued and cryptographically verified server-side in `apps/api`.
- Client route protection in `apps/web` is for UX only; every backend endpoint must independently authenticate and authorize (`RolesGuard`, `JwtAuthGuard`).

---

## 2. Monorepo Organization & Boundaries

```
TradeForge/
├── apps/
│   ├── api/                 # NestJS Backend API (Prisma, PostgreSQL, business logic)
│   └── web/                 # Next.js 15 Frontend (App Router, Tailwind, TanStack Query)
├── packages/
│   ├── config/              # Shared compiler and linter configurations
│   ├── types/               # Pure TypeScript contracts, enums, DTOs
│   └── validation/          # Shared Zod validation schemas
├── .env.example             # Template for local environment variables
├── AGENTS.md                # Development invariants and guidelines (this file)
├── PROJECT_PLAN.md          # Complete phased implementation roadmap
└── README.md                # Windows local-development instructions
```

### Dependency Rules:
- `packages/types` must NOT depend on any UI library or server framework. It is pure TypeScript.
- `packages/validation` depends only on `zod` and `packages/types`.
- `apps/api` may import `@tradeforge/types`, `@tradeforge/validation`, and server-side utilities.
- `apps/web` may import `@tradeforge/types`, `@tradeforge/validation`, and client-side UI libraries.
- Neither app may import source files directly across `apps/`. Cross-boundary code must live in `packages/*`.

---

## 3. Technology Guardrails & Constraints

- **No Docker**: All local services run natively on the host machine. PostgreSQL 18 runs on `localhost:5432`.
- **No SQLite**: PostgreSQL is the sole relational database.
- **No Redis (Yet)**: Do not introduce Redis or other cache servers until explicitly specified in Phase 7/8.
- **No Third-Party Market APIs (Yet)**: Real financial APIs (Polygon, AlphaVantage, Alpaca) will be introduced in Phase 3 under dedicated provider adapters.
- **No Mock Data Faking**: Do not create hardcoded mock arrays to simulate backend endpoints. Backend services must execute against real PostgreSQL tables via Prisma.

---

## 4. Code Style & Conventions

- **TypeScript**: Strict mode enabled (`strict: true`). No explicit `any` without an documented rationale.
- **Naming**:
  - Files: `kebab-case.ts` / `kebab-case.tsx`
  - React Components: `PascalCase`
  - NestJS Services / Controllers / Modules: `PascalCase`
  - Enums: `PascalCase` with `UPPER_SNAKE_CASE` keys
  - Prisma Models: `PascalCase` (mapped to `snake_case` database tables using `@@map`)
- **Formatting**: Adhere to `.prettierrc` (single quotes, trailing commas, 100 character print width).

---

## 5. Security & Secret Management

- **NEVER hardcode passwords, API keys, or JWT secrets in source code, documentation, or git commits.**
- `.env` files are git-ignored. Always add placeholders to `.env.example` when introducing new environment variables.
