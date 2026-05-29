# Refridge Pro - Backend (B2B Manager Dashboard)

## Overview

Backend API for the Refridge Pro B2B smart menu engine. Built with Node.js, Express, TypeScript, and PostgreSQL.

## Architecture

```
├─ src/
│  ├─ models/       (TypeORM entities)
│  ├─ routes/       (API endpoints)
│  ├─ services/     (Business logic)
│  ├─ middleware/   (Auth, validation)
│  ├─ websocket/    (Real-time sync)
│  ├─ database.ts   (DB connection)
│  └─ server.ts     (Express app)
├─ seed/            (Mock data)
└─ package.json
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your DATABASE_URL (Railway.app)
```

### 3. Database setup (Railway.app)

1. Go to railway.app
2. Create new project
3. Add PostgreSQL service
4. Copy DATABASE_URL to .env

### 4. Run development server

```bash
npm run dev
```

Server will start on `http://localhost:3000`

### 5. Seed with mock data

```bash
npm run seed
```

## API Endpoints (to be implemented)

### Authentication

- POST `/auth/register` - Create new manager
- POST `/auth/login` - Manager login
- POST `/auth/refresh` - Refresh JWT token

### Inventory

- GET `/inventory/items` - List items
- POST `/inventory/items` - Add item
- PATCH `/inventory/items/:id` - Update item
- DELETE `/inventory/items/:id` - Delete item

### Recipes

- GET `/recipes` - List recipes
- POST `/recipes` - Create recipe
- PUT `/recipes/:id` - Update recipe
- DELETE `/recipes/:id` - Delete recipe

### Waste

- POST `/waste/log` - Log waste
- GET `/waste/logs` - Get waste history
- DELETE `/waste/logs/:id` - Delete log

### Analytics

- GET `/analytics/waste-report` - Waste statistics
- GET `/analytics/profitability` - Profit by recipe
- GET `/analytics/inventory-health` - Stock alerts
- GET `/analytics/demand-pattern` - Sales patterns

### Menu Suggestions

- GET `/menu/suggestions` - Get today's recommendations

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express 4.x
- **Language**: TypeScript 5.x
- **ORM**: TypeORM 0.3.x
- **Database**: PostgreSQL 14+
- **Real-time**: Socket.io 4.x
- **Auth**: JWT + bcryptjs
- **Validation**: class-validator

## Development Commands

```bash
npm run dev              # Development server with hot reload
npm run build            # Build for production
npm start                # Run production build
npm run db:migrate       # Run migrations
npm run db:generate      # Generate migration
npm run seed             # Seed database
npm run lint             # Format code
```

## Database Models (to be created)

- Restaurant
- User
- InventoryItem
- Recipe
- WasteLog
- Sale
- MenuSuggestion

## Next Steps

1. Create database models (Day 1.2)
2. Implement authentication (Day 1.3)
3. Create CRUD endpoints (Day 1.4 - 2)
4. Implement business logic (Day 3)
5. Add WebSocket sync (Day 3)
6. Build frontend screens (Day 4)
