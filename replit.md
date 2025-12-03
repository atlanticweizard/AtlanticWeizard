# Atlantic Weizard - E-Commerce Platform

## Overview

Atlantic Weizard is a full-stack e-commerce platform built with Express.js, React, and PostgreSQL. The application provides a complete online shopping experience with product catalog, shopping cart, checkout flow, PayU payment gateway integration, and a comprehensive admin dashboard for managing products, orders, and transactions. The platform supports multi-currency display (INR/USD) and uses session-based authentication for admin users.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and API caching
- React Hook Form with Zod for form validation

**UI Component System**
- shadcn/ui components (Radix UI primitives with Tailwind CSS)
- Custom theme system with CSS variables for light/dark mode support
- Responsive design patterns for mobile, tablet, and desktop

**State Management**
- Context API for global state (Currency, Cart, Authentication)
- Local storage persistence for cart items and currency preference
- Session-based authentication state synchronized with backend

**Key Frontend Features**
- Shopping cart with slide-over panel
- Multi-step checkout form with validation
- Currency switcher (INR ↔ USD with automatic conversion)
- Admin dashboard with protected routes
- Product catalog with search and filtering capabilities

### Backend Architecture

**Server Framework**
- Express.js with TypeScript
- HTTP server created via Node's `http` module
- Custom middleware for logging and request handling
- Session-based authentication using `express-session`

**API Design**
- RESTful API endpoints under `/api` prefix
- Admin routes protected with authentication middleware
- Product, order, and transaction CRUD operations
- PayU payment integration endpoints

**Authentication & Authorization**
- Session management with PostgreSQL session store (`connect-pg-simple`)
- bcrypt for password hashing
- Role-based access control (admin, superadmin roles)
- Session cookies for authentication state

**Payment Processing**
- PayU payment gateway integration (TEST/LIVE modes)
- Hash generation and verification for transaction security
- Support for multi-currency transactions (INR/USD)
- Transaction tracking and status management

### Data Storage

**Database**
- PostgreSQL as the primary database
- Drizzle ORM for type-safe database queries and migrations
- Connection pooling via `pg` library

**Schema Design**
- Products table: catalog items with pricing, stock, images
- Orders table: customer orders with status tracking
- Order Items table: line items with product references
- PayU Transactions table: payment gateway transaction records
- Admin Users table: authentication and role management
- Session table: server-side session storage

**Data Models**
- Normalized schema with foreign key relationships
- Enums for status fields (order_status, transaction_status, currency, admin_role)
- Timestamps for created/updated tracking
- Numeric precision for financial data (10,2)

### Build & Deployment

**Build Process**
- Client: Vite bundles React application to static assets
- Server: esbuild bundles TypeScript server code to single CommonJS file
- Selective dependency bundling (allowlist) to reduce cold start times
- Automated build script (`script/build.ts`)

**Development Environment**
- Vite dev server with HMR (Hot Module Replacement)
- Middleware mode integration with Express
- Automatic template reloading for development

**Production Deployment**
- EC2 deployment guide included
- PM2 process manager for server orchestration
- Nginx reverse proxy configuration
- Environment-based configuration (development/production)

## External Dependencies

### Payment Gateway
- **PayU**: Primary payment processor
  - Supports TEST and LIVE modes via environment configuration
  - Hash-based transaction security (SHA-512)
  - Merchant key and salt for authentication
  - Success/failure callback URLs

### Database
- **PostgreSQL**: Production database
  - Requires `DATABASE_URL` environment variable
  - Used with Drizzle ORM for schema management
  - Connection pooling for performance

### Authentication
- **Session Store**: PostgreSQL-backed sessions
  - `connect-pg-simple` for session persistence
  - Requires `SESSION_SECRET` environment variable
  - Cookie-based session management

### Third-Party Services
- **Neon Database** (`@neondatabase/serverless`): Serverless PostgreSQL option
- **shadcn/ui**: UI component library built on Radix UI
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework

### Development Tools
- **TypeScript**: Type checking and compilation
- **Drizzle Kit**: Database schema migrations
- **esbuild**: Fast JavaScript bundler for server code
- **Vite**: Frontend build tool and dev server