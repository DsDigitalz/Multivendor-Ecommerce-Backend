# Multi-Vendor E-Commerce Platform Backend

Enterprise-grade modular backend architecture built with **Node.js**, **Express 5**, **TypeScript**, and **MongoDB/Mongoose**.

---

## Architecture Overview

This project implements a **Modular Domain-Driven Architecture**. Each business domain is self-contained with its own routes, controllers, services, models, interfaces, and validation schemas.

### Request Flow
```
Client Request
      │
      ▼
┌──────────────┐
│  Middleware  │ ── (CORS, Helmet, Rate Limiter, Logger, Cookie/Body Parsers)
└──────┬───────┘
      │
      ▼
┌──────────────┐
│    Router    │ ── (Endpoint definition & RBAC Authorization Guards)
└──────┬───────┘
      │
      ▼
┌──────────────┐
│  Validator   │ ── (Zod request schema validation for body, query, params)
└──────┬───────┘
      │
      ▼
┌──────────────┐
│  Controller  │ ── (HTTP unpacking & ApiResponse formatting)
└──────┬───────┘
      │
      ▼
┌──────────────┐
│   Service    │ ── (Domain business logic, transactions, commissions)
└──────┬───────┘
      │
      ▼
┌──────────────────┐
│ Model/Repository │ ── (Mongoose Schema, compound indexes, validations)
└──────┬───────────┘
      │
      ▼
┌──────────────┐
│   Database   │ ── (MongoDB)
└──────┬───────┘
      │
      ▼
┌──────────────┐
│ Api Response │ ── (Standardized JSend-style envelope)
└──────────────┘
```

---

## Directory Structure

```text
src/
├── app.ts                         # Express application setup & middleware assembly
├── server.ts                      # Server entry point, DB bootstrap, graceful shutdown
│
├── config/                        # Global system configurations
│   ├── env.config.ts              # Type-safe environment variables validated with Zod
│   ├── database.config.ts         # Mongoose connection & lifecycle manager
│   ├── logger.config.ts           # Pino logger configuration
│   ├── cloudinary.config.ts       # Cloudinary media storage setup
│   └── constants.ts               # Roles, order/payment statuses, HTTP status codes
│
├── middleware/                    # Global Express middlewares
│   ├── auth.middleware.ts         # JWT token extraction & verification
│   ├── role.middleware.ts         # Role-based access control (Admin, Vendor, Customer)
│   ├── validate.middleware.ts     # Generic Zod validation middleware
│   ├── error.middleware.ts        # Centralized error handler (AppError, Mongo, Zod)
│   ├── rate-limiter.middleware.ts # API rate limiter
│   └── upload.middleware.ts       # Multer file upload handler
│
├── utils/                         # Reusable helpers & abstractions
│   ├── api-response.ts            # Standardized API response builder
│   ├── app-error.ts               # Custom operational error classes
│   ├── async-handler.ts           # Express async try/catch wrapper
│   ├── jwt.util.ts                # Token sign & verify utilities
│   └── password.util.ts           # Bcrypt password hashing & comparison
│
├── modules/                       # Domain Modules
│   ├── auth/                      # Registration, login, refresh tokens, passwords
│   ├── users/                     # User profiles, addresses, roles
│   ├── vendors/                   # Vendor store onboarding, approval, management
│   ├── categories/                # Hierarchical product categories & slugs
│   ├── products/                  # Multi-vendor catalog, variants, stock, search
│   ├── cart/                      # Shopping cart, stock validation, vendor grouping
│   ├── orders/                    # Multi-vendor checkout, sub-orders, commission
│   ├── payments/                  # Payment transactions & order status updates
│   ├── reviews/                   # Verified purchase ratings & automatic averages
│   └── admin/                     # Platform governance, metrics, vendor approval
│
├── routes/
│   └── index.ts                   # Central router mounting all modules under /api/v1
│
└── docs/
    └── swagger.config.ts          # OpenAPI/Swagger configuration (/api/docs)
```

---

## Core Domain Modules

| Module | Route Prefix | Key Endpoints | Roles |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/v1/auth` | `/register`, `/login`, `/refresh`, `/logout`, `/change-password` | Public / All |
| **Users** | `/api/v1/users` | `/profile`, `/addresses`, `/addresses/:id` | Customer, Vendor, Admin |
| **Vendors** | `/api/v1/vendors` | `/`, `/store/:slug`, `/register`, `/me`, `/:vendorId/status` | Public, Vendor, Admin |
| **Categories**| `/api/v1/categories` | `/`, `/:slug`, `POST /`, `PATCH /:id`, `DELETE /:id` | Public, Admin |
| **Products** | `/api/v1/products` | `/` (filters, text search), `/:slug`, `POST /`, `PATCH /:id`, `DELETE /:id` | Public, Vendor, Admin |
| **Cart** | `/api/v1/cart` | `/`, `POST /items`, `PATCH /items/:itemId`, `DELETE /items/:itemId` | Customer |
| **Orders** | `/api/v1/orders` | `/checkout`, `/my-orders`, `/vendor-orders`, `/:orderId/sub-orders` | Customer, Vendor, Admin |
| **Payments** | `/api/v1/payments` | `/process`, `/:orderId` | Customer, Admin |
| **Reviews** | `/api/v1/reviews` | `/product/:productId`, `POST /`, `DELETE /:id` | Public, Customer, Admin |
| **Admin** | `/api/v1/admin` | `/metrics`, `/vendors/:vendorId/approval`, `/users/:userId/role`, `/orders` | Admin |

---

## Getting Started

### 1. Environment Variables
Copy `.env.example` to `.env` and fill in your settings:
```bash
cp .env.example .env
```

### 2. Development Mode
```bash
npm run dev
```

### 3. Production Build
```bash
npm run build
npm start
```

### 4. Interactive API Documentation
Once running, visit:
```
http://localhost:5000/api/docs
```
Health Check:
```
http://localhost:5000/api/v1/health
```
