# TradeForge — Master Implementation Plan

TradeForge is a production-style, institutional-fidelity paper trading and personal finance platform. This document outlines the roadmap across all phases of implementation.

---

## Roadmap Overview

```
Phase 0 ──► Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4 ──► Phase 5 ──► Phase 6 ──► Phase 7 ──► Phase 8
Foundation   Auth & RBAC  Wallet &      Market Data  Paper Trading Personal     Analytics &   Alerts &     Hardening &
(Current)                 Ledger        Engine       Engine        Finance      Dashboard     Audit        Deploy
```

---

## Phase 0: Monorepo Foundation & Core Infrastructure (Current)
- [x] Monorepo structure configured with npm workspaces and Turborepo.
- [x] `@tradeforge/config` shared TypeScript base configurations.
- [x] `@tradeforge/types` domain enums, base entity interfaces, and API response contracts.
- [x] `@tradeforge/validation` shared Zod validation schemas (monetary precision, pagination, IDs).
- [x] NestJS 11 backend scaffold in `apps/api` with global API prefix, CORS, and health check.
- [x] Prisma ORM integration targeting PostgreSQL 18 with exact `Decimal` precision schema.
- [x] Next.js 15 frontend scaffold in `apps/web` with Tailwind CSS, dark aesthetic, and TanStack Query provider.
- [x] Project invariants in `AGENTS.md` and Windows development setup in `README.md`.

---

## Phase 1: Authentication, Authorization & User Management
**Objective:** Secure, server-side authentication with role-based access control (RBAC).

### Key Deliverables:
1. **Backend (`apps/api`):**
   - Argon2 / bcrypt password hashing service.
   - JWT Access Token + HTTP-Only Refresh Token authentication flow.
   - User registration with email uniqueness validation.
   - Login, logout, and token rotation endpoints.
   - NestJS Guards: `JwtAuthGuard`, `RolesGuard` (`ADMIN`, `TRADER`, `VIEWER`).
2. **Frontend (`apps/web`):**
   - Authentication context and state management.
   - Server-side cookie handling for Next.js SSR/middleware.
   - Sign In, Sign Up, and Forgot Password UI components using React Hook Form + Zod.
3. **Database Schema:**
   - Refresh token rotation table or token revocation blacklist table.

---

## Phase 2: Double-Entry Wallet & Cash Ledger Engine
**Objective:** Institutional-grade paper cash management preventing negative balances and double-spend.

### Key Deliverables:
1. **Backend (`apps/api`):**
   - Account creation service (default $100,000 paper balance or customizable).
   - Deposit and withdrawal simulation endpoints.
   - Strict double-entry ledger: every balance adjustment generates an immutable `Transaction` row.
   - Database row-level locking / atomic transactions (`prisma.$transaction`) to prevent race conditions.
   - Ledger integrity validation checks (sum of transactions == current balance).
2. **Frontend (`apps/web`):**
   - Wallet overview card (available cash, allocated capital, total equity).
   - Fund simulation modal (deposit/withdraw paper money).
   - Real-time transaction history table with pagination and category filtering.

---

## Phase 3: Market Data Engine & Asset Catalog
**Objective:** Real-time and historical multi-asset pricing engine with provider abstraction.

### Key Deliverables:
1. **Backend (`apps/api`):**
   - Provider abstraction layer (`MarketDataProvider` interface).
   - Seeded asset registry (US Equities, ETFs, major Cryptocurrencies).
   - Simulated ticker price generator for development (random walk / geometric Brownian motion) to test without external API rate limits.
   - Real market data adapter integration (e.g. Polygon.io, AlphaVantage, or Yahoo Finance) with fallback caching.
   - Historical candle retrieval endpoint (1m, 5m, 1h, 1d intervals).
2. **Frontend (`apps/web`):**
   - Asset search and watchlist drawer.
   - Interactive candlestick and area charts using Recharts.
   - Real-time ticker tape header.

---

## Phase 4: Paper Trading & Order Matching Engine
**Objective:** Simulation of market, limit, and stop orders with realistic execution slippage and portfolio tracking.

### Key Deliverables:
1. **Backend (`apps/api`):**
   - Order validation service (verifying margin/buying power, order side, and tick size).
   - Market order execution: immediate fill against current asset price.
   - Limit and stop order queue: background worker or scheduled evaluation against incoming ticks.
   - Position engine: calculates weighted average cost basis (`averageCost`) and unrealized P&L.
   - Order cancellation and replacement endpoints.
   - All executions wrapped in strict ACID transactions updating orders, positions, balances, and ledger.
2. **Frontend (`apps/web`):**
   - Order ticket component (Buy/Sell, Market/Limit/Stop, Quantity, Estimated Cost).
   - Open orders manager (canceling open orders).
   - Active positions table (Holdings, Avg Cost, Current Price, Unrealized P&L, Actions).

---

## Phase 5: Personal Finance & Expense Tracker
**Objective:** Dual-purpose personal finance integration tracking income, expenses, and savings goals.

### Key Deliverables:
1. **Backend (`apps/api`):**
   - Expense creation, update, and deletion endpoints.
   - Category budget engine (monthly budget limits, threshold alerts).
   - Recurring expenses scheduler (simulated recurring debits).
   - Expense aggregations by category, month, and payment method.
2. **Frontend (`apps/web`):**
   - Expense tracking dashboard.
   - Monthly budget progress bars.
   - Category breakdown pie chart and monthly trend bar chart using Recharts.
   - Quick expense logging drawer.

---

## Phase 6: Portfolio Analytics & Performance Dashboard
**Objective:** Comprehensive quantitative performance metrics and visual dashboards.

### Key Deliverables:
1. **Backend (`apps/api`):**
   - Portfolio equity snapshot service (daily equity curve data points).
   - Quantitative performance metrics calculation:
     - Total Return (ROI) & Annualized Return
     - Daily P&L and Max Drawdown (MDD)
     - Win Rate, Profit Factor, and Sharpe Ratio approximations.
   - Asset allocation breakdown calculation.
2. **Frontend (`apps/web`):**
   - Master trader dashboard overview.
   - Equity curve line chart with benchmark comparison (e.g. S&P 500 baseline).
   - Asset allocation donut chart.
   - Performance KPI metrics cards (Win Rate, Total P&L, Sharpe Ratio).

---

## Phase 7: Real-time Alerts, Notifications & Audit Logging
**Objective:** Proactive alerts and complete security/audit compliance trail.

### Key Deliverables:
1. **Backend (`apps/api`):**
   - Price alert triggers (e.g. notify when AAPL > $250).
   - Order fill notifications.
   - Security audit logging for sensitive actions (password change, large withdrawals, role changes).
   - WebSocket gateway for instant push notifications to active sessions.
2. **Frontend (`apps/web`):**
   - Notification center popover with read/unread status.
   - Toast notification alerts for real-time order executions.
   - Alert management modal.

---

## Phase 8: Production Hardening, CI/CD & Deployment
**Objective:** Production-grade security, rate limiting, and automated deployment pipelines.

### Key Deliverables:
1. **Security & Reliability:**
   - Express rate limiting (`@nestjs/throttler`) across auth and trading endpoints.
   - Helmet security headers and CORS whitelisting.
   - Structured JSON logging (Pino or Winston).
2. **Testing:**
   - Unit tests for financial calculations and precision rounding.
   - Integration tests with Testcontainers / PostgreSQL for ACID transaction validation.
   - End-to-end Cypress or Playwright tests for trade execution flow.
3. **Deployment:**
   - Optimized Next.js standalone build.
   - NestJS production bundle optimization.
   - GitHub Actions CI/CD workflow (typecheck, lint, test, build).

---

## Future Improvements & Scalability (Post-Launch)
While the core MVP is complete, the following architectural and feature improvements have been identified for future iteration to scale the application to a true enterprise standard:

1. **Enterprise Identity & OAuth Login:**
   - **Current State:** JWT authentication with Argon2 password hashing stored in PostgreSQL.
   - **Improvement:** Migrate to a third-party Identity Provider (IdP) like **Auth.js (NextAuth)**, **Clerk**, or **Auth0**.
   - **Why:** Offloads the massive security liability of storing user credentials. Enables frictionless onboarding via "Continue with Google" or "Continue with GitHub", which is the expected standard for modern financial applications.

2. **Email Verification & Password Reset Flows:**
   - **Current State:** Accounts are created instantly without verifying the email address.
   - **Improvement:** Integrate an email service provider (e.g., **Resend** or **SendGrid**) to handle magic links, email verification, and secure password resets.
   - **Why:** This is a fundamental requirement for any real-world application to prevent spam accounts and ensure users can recover access to their finances safely.

3. **Data Caching layer (Redis):**
   - **Current State:** Every balance check or portfolio query hits the PostgreSQL database directly.
   - **Improvement:** Implement **Redis** to cache frequently accessed, read-heavy data (like the user's current account balance or top asset prices).
   - **Why:** Shows a deep understanding of System Design and how to scale an application to handle thousands of concurrent users without melting the primary database.

4. **Pagination & Infinite Scroll for Ledgers:**
   - **Current State:** The transaction ledger and notification dropdowns fetch a fixed limit of recent items.
   - **Improvement:** Implement cursor-based pagination on the backend and an "Infinite Scroll" UI on the frontend.
   - **Why:** If a user makes 10,000 trades over a year, loading all of them at once would crash the app. Pagination is a core data-handling skill that interviewers always look for.

5. **Real-Time Market Data Integration:**
   - **Current State:** A Node.js background process simulating price ticks based on geometric Brownian motion.
   - **Improvement:** Integrate a live WebSocket connection to a real financial API provider (e.g., **Polygon.io**, **Alpaca**, or **CoinGecko**).
   - **Why:** Transitions the platform from a theoretical simulator to a live paper-trading engine that reacts to real-world market news and volatility.

6. **Dockerization & Container Orchestration:**
   - **Current State:** Native local execution via TurboRepo scripts (`npm run dev`).
   - **Improvement:** Write a complete `docker-compose.yml` to containerize the PostgreSQL database, NestJS API, and Next.js frontend into isolated, easily deployable microservices.
   - **Why:** Ensures "it works on my machine" translates flawlessly to production environments (AWS ECS / Kubernetes).

7. **Advanced Charting & Historical Analytics:**
   - **Current State:** Real-time current balance and portfolio value.
   - **Improvement:** Implement highly interactive canvas-based charting libraries like **TradingView Lightweight Charts**.
   - **Why:** Allows users to visualize their portfolio growth over 30/90/365 day periods, providing a dramatically better user experience for tracking personal finance goals.
