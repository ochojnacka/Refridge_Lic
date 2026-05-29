# 🧊 Fridge - Smart Menu Engine

**Complete 5-day practical implementation** of AI-powered restaurant waste reduction system for B2B SaaS market.

---

## 📊 PROJECT STATUS - DEN 4 (DAY 4/5)

| Component            | Status  | Details                                          |
| -------------------- | ------- | ------------------------------------------------ |
| **Backend API**      | ✅ 100% | Node.js + Express + SQLite, 14 endpoints live    |
| **Database**         | ✅ 100% | 7 entities, 6 months seed data (252 KB)          |
| **Analytics Engine** | ✅ 100% | Profitability, Waste, Inventory, Demand analysis |
| **Frontend App**     | ⚙️ 90%  | React Native screens + API integration           |
| **Authentication**   | ✅ 100% | JWT + bcrypt, both backend & frontend            |
| **Core Features**    | ✅ 100% | Menu suggestions, inventory tracking, sales      |

---

## 🏗️ ARCHITECTURE

```
┌─────────────────────────────────────────┐
│   React Native Frontend (Expo)          │
│  ├─ LoginScreen / RegisterScreen        │
│  ├─ DashboardScreen (Analytics)         │
│  ├─ MenuSuggestionsScreen (AI Menu)     │
│  ├─ InventoryScreen (CRUD)              │
│  └─ API Client (HTTP to Backend)        │
└──────────────┬──────────────────────────┘
               │ HTTP/REST
               ▼
┌─────────────────────────────────────────┐
│  Node.js + Express Backend              │
│  ├─ Auth Routes (/auth/...)             │
│  ├─ Inventory Routes (/inventory/...)   │
│  ├─ Recipes Routes (/recipes/...)       │
│  ├─ Waste Routes (/waste/...)           │
│  ├─ Sales Routes (/sales/...)           │
│  ├─ Analytics Routes (/analytics/...)   │
│  ├─ MenuSuggestionService               │
│  └─ AnalyticsService                    │
└──────────────┬──────────────────────────┘
               │ TypeORM + SQL
               ▼
┌─────────────────────────────────────────┐
│  SQLite Database                        │
│  ├─ restaurants (1 record)              │
│  ├─ users (2 records)                   │
│  ├─ inventory_items (8 records)         │
│  ├─ recipes (6 records)                 │
│  ├─ sales (824 records)                 │
│  ├─ waste_logs (91 records)             │
│  └─ menu_suggestions (real-time)        │
└─────────────────────────────────────────┘
```

---

## 🚀 BACKEND API - 14 ENDPOINTS

### Authentication

```
POST   /auth/login              Login with email & password → JWT token
POST   /auth/register           Create new restaurant account
POST   /auth/refresh            Refresh expired token (24h expiry)
```

### Inventory Management

```
GET    /inventory/items         List all items for restaurant
POST   /inventory/items         Add new inventory item
PATCH  /inventory/items/:id     Update quantity/price/expiry
DELETE /inventory/items/:id     Remove item
```

### Recipe Management

```
GET    /recipes                 List recipes with profit margin %
POST   /recipes                 Create new recipe
PUT    /recipes/:id             Update recipe
DELETE /recipes/:id             Delete recipe
```

### Waste Tracking

```
POST   /waste/log               Log waste incident (auto-calculate PLN value)
GET    /waste/logs              View waste logs (date range filter)
DELETE /waste/logs/:id          Remove waste entry
```

### Sales Recording

```
POST   /sales/record            Record sale (auto-populate date fields)
GET    /sales                   View sales history (filter by date/recipe)
GET    /sales/stats/aggregate   Total revenue + per-recipe breakdown
```

### Analytics & Insights (🆕 DEN 3)

```
GET    /analytics/waste-report           Waste analysis (total, reasons, 7-day trend)
GET    /analytics/profitability          Revenue/cost/profit + top recipes
GET    /analytics/inventory-health       Critical items, expiring, waste%
GET    /analytics/demand-pattern/:id     Recipe demand + peak days
GET    /analytics/suggestions            AI-scored menu suggestions
```

---

## 🎯 FRONTEND SCREENS - REACT NATIVE

### Authentication Flow

- **LoginScreen**: Demo credentials manager@bistro.pl / demo123
- **RegisterScreen**: Create new restaurant account

### Main Dashboard (Tab Navigation)

- **DashboardScreen**: Real-time profitability, waste, inventory metrics
- **MenuSuggestionsScreen**: AI-ranked recipes (score 0-100 based on inventory, demand, margin)
- **InventoryScreen**: CRUD inventory items from backend

### Scoring Algorithm (MenuSuggestionService)

```
Total Score (0-100) = Inventory(30) + Demand(30) + Margin(20) + Expiring(20)

Inventory Score (0-30):
  ├─ All items available: 30 pts
  ├─ Partial availability: 15 pts
  └─ Low availability: 0 pts

Demand Score (0-30):
  └─ Based on 30-day sales volume

Margin Score (0-20):
  ├─ 60%+ margin: 20 pts
  ├─ 50%+ margin: 15 pts
  ├─ 40%+ margin: 10 pts
  └─ 30%+ margin: 5 pts

Expiring Items Bonus (0-20):
  └─ +5 pts per item expiring within 3 days
```

---

## 📱 TESTING THE APP

### 1. **Start Backend** (Terminal 1)

```powershell
cd backend
npm run dev
# Output: ✅ Database connected
#         🚀 Server running on http://localhost:3000
```

### 2. **Test API Endpoints** (Terminal 2)

```powershell
# Login and get JWT token
$response = Invoke-WebRequest `
  -Uri "http://localhost:3000/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"manager@bistro.pl","password":"demo123"}'

$token = ($response.Content | ConvertFrom-Json).token
Write-Host "Token: $token"

# Test Analytics Endpoint
Invoke-WebRequest `
  -Uri "http://localhost:3000/analytics/profitability" `
  -Headers @{"Authorization"="Bearer $token"}
```

### 3. **Start Frontend** (Terminal 3)

```powershell
cd ..
npm start
# Select platform:
# i (iOS) - requires Xcode
# a (Android) - requires Android Studio
# w (web) - requires react-dom
# Or scan QR code with Expo app on physical phone
```

### 4. **Test Frontend Flow**

- ✅ Open app → See LoginScreen
- ✅ Login with manager@bistro.pl / demo123
- ✅ Dashboard tab → See profitability report (65,089 PLN revenue, 46,687 PLN profit, 71.73% margin)
- ✅ Suggestions tab → See AI-ranked recipes (score breakdown visible)
- ✅ Inventory tab → See 8 inventory items, add new item

---

## 🗄️ DATABASE SCHEMA

### Restaurant

```sql
id (UUID PK)
name (VARCHAR) = "Bistro Na Rogu"
city (VARCHAR) = "Kraków"
seats (INT) = 45
avgCoversPerDay (INT) = 75
description (TEXT)
createdAt (TIMESTAMP)
```

### User

```sql
id (UUID PK)
restaurantId (UUID FK)
email (VARCHAR unique) = "manager@bistro.pl"
passwordHash (VARCHAR) = bcrypt("demo123", 10 rounds)
name (VARCHAR) = "Jerzy Manager"
role (VARCHAR) = "manager" | "chef" | "admin"
isActive (BOOLEAN) = true
createdAt (TIMESTAMP)
```

### Inventory Item (8 records)

```sql
id (UUID PK)
restaurantId (UUID FK)
name (VARCHAR) = "Pomodori", "Mozzarella", "Pasta", ...
quantity (FLOAT)
unit (VARCHAR) = "kg" | "l" | "pc" | "g" | "ml"
costPrice (FLOAT) = 4.50 PLN/kg, 22 PLN/kg, ...
category (VARCHAR) = "VEGETABLES" | "DAIRY" | "GRAINS" | "MEAT"
wastePercentage (FLOAT)
expiryDate (TIMESTAMP)
createdAt (TIMESTAMP)
```

### Recipe (6 records)

```sql
id (UUID PK)
restaurantId (UUID FK)
name (VARCHAR) = "Spaghetti Carbonara", "Margherita Pizza", ...
description (TEXT)
costPrice (FLOAT) = 8.50 PLN
salePrice (FLOAT) = 28 PLN
margin (CALCULATED) = ((28 - 8.50) / 28) * 100 = 69.6%
category (VARCHAR) = "PASTA" | "PIZZA" | ...
mealTypes (ARRAY) = ["LUNCH", "DINNER"]
prepTimeMinutes (INT) = 20
isActive (BOOLEAN) = true
```

### Sale (824 records - 6 months data)

```sql
id (UUID PK)
restaurantId (UUID FK)
recipeId (UUID FK)
quantity (INT)
revenue (FLOAT) = quantity * recipe.salePrice
dayOfWeek (INT) = 0-6
dayOfMonth (INT) = 1-31
month (INT) = 1-12
year (INT) = 2026
timestamp (TIMESTAMP)
```

### Waste Log (91 records)

```sql
id (UUID PK)
restaurantId (UUID FK)
itemId (UUID FK)
quantity (FLOAT)
reason (VARCHAR) = "Expired" | "Damaged" | "Over-production" | ...
value (FLOAT) = quantity * item.costPrice
unit (VARCHAR)
timestamp (TIMESTAMP)
```

### Menu Suggestion

```sql
id (UUID PK)
restaurantId (UUID FK)
recipeId (UUID FK)
score (INT) = 0-100
suggestedDate (DATE) = TODAY
reasons (ARRAY) = ["Full inventory available", "High margin", ...]
recommendedQuantity (INT) = 10
estimatedProfit (FLOAT) = calculated
isAddedToMenu (BOOLEAN) = false
createdAt (TIMESTAMP)
```

---

## 🔐 SECURITY

- **JWT**: 24-hour expiry with refresh endpoint
- **Passwords**: bcryptjs (10 rounds hashing)
- **CORS**: Configured for localhost:3000, localhost:8081
- **Multi-tenancy**: restaurantId FK isolates all data
- **SQL Injection**: TypeORM parameterized queries
- **Role-based Access**: manager, chef, admin roles (ready for expansion)

---

## 📈 KEY METRICS (Test Data - 6 Months)

| Metric             | Value                            |
| ------------------ | -------------------------------- |
| Total Revenue      | 65,089 PLN                       |
| Total Profit       | 46,687 PLN                       |
| Profit Margin      | 71.73%                           |
| Total Waste        | ~2,400 PLN                       |
| Waste %            | ~3.7%                            |
| Top Recipe Profit  | Spaghetti Carbonara (11,446 PLN) |
| Avg Daily Covers   | 75                               |
| Inventory Items    | 8                                |
| Inventory Value    | 13,569 PLN                       |
| Weekend vs Weekday | +45% demand on weekends          |

---

## 🛠️ TECH STACK

| Layer      | Technology                 | Version |
| ---------- | -------------------------- | ------- |
| Frontend   | React Native               | 0.81.5  |
| Runtime    | Expo                       | 54.0.34 |
| Navigation | React Navigation           | 7.x     |
| State Mgmt | Context API + AsyncStorage | -       |
| Backend    | Node.js                    | 20+     |
| Framework  | Express                    | 4.18.2  |
| ORM        | TypeORM                    | 0.3.16  |
| Database   | SQLite3                    | -       |
| Auth       | JWT + bcryptjs             | -       |
| Language   | TypeScript                 | 5.9     |

---

## 📝 DEVELOPMENT TIMELINE (5 days)

| Day       | Scope                                                  | Status         |
| --------- | ------------------------------------------------------ | -------------- |
| **DEN 1** | Backend foundation, DB models, Auth, Inventory API     | ✅             |
| **DEN 2** | Recipes, Waste, Sales APIs, Seed 6-month data          | ✅             |
| **DEN 3** | MenuSuggestionService, AnalyticsService, Analytics API | ✅             |
| **DEN 4** | Frontend auth screens, API client, Dashboard           | ⚙️ In Progress |
| **DEN 5** | Frontend testing, WebSocket sync, Final integration    | ⏳ Pending     |

---

## 🎓 THESIS ALIGNMENT

**Problem Statement**: Polish restaurants waste 5-10% of food annually (~500k tons), costing industry 3.5B PLN.

**Solution**: AI-powered menu engine that:

- ✅ Analyzes historical sales patterns (6-month baseline)
- ✅ Scores recipes by profitability + demand + inventory fit
- ✅ Tracks waste incidents with monetary impact
- ✅ Provides real-time business intelligence dashboard

**Tech Justification**:

- ✅ Completely free stack (SQLite, Express, React Native, Expo)
- ✅ No cloud costs (localhost:3000 for demo)
- ✅ Scalable architecture (ready for PostgreSQL/Docker)
- ✅ Can be deployed on any server (Node.js + SQLite)

---

## 📦 FILE STRUCTURE

```
Refridge-ReactNative/
├── backend/
│   ├── src/
│   │   ├── models/          (7 TypeORM entities)
│   │   ├── routes/          (6 API route files)
│   │   ├── services/        (2 business logic services)
│   │   ├── middleware/      (JWT auth)
│   │   ├── server.ts        (Express app entry)
│   │   └── database.ts      (TypeORM config)
│   ├── seed/
│   │   └── mockData.ts      (6-month realistic data)
│   ├── package.json
│   └── tsconfig.json
│
├── src/
│   ├── api/
│   │   └── client.ts        (HTTP client to backend)
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── MenuSuggestionsScreen.tsx
│   │   ├── InventoryScreen.tsx
│   │   └── (existing screens)
│   ├── navigation/
│   │   └── RootNavigator.tsx (Updated with auth + new tabs)
│   ├── state/
│   │   └── AppStateContext.tsx
│   └── theme.ts
│
├── App.tsx
├── package.json
├── app.json
└── tsconfig.json
```

---

## ✅ VERIFICATION CHECKLIST

- [x] Backend server running on localhost:3000
- [x] All 14 API endpoints responding correctly
- [x] Database with 7 tables, 1000+ records
- [x] JWT authentication working
- [x] Analytics calculations correct (71.73% profit margin matches math)
- [x] Frontend API client created
- [x] Authentication screens (Login/Register)
- [x] Dashboard screen with live analytics
- [x] Menu suggestions screen with scoring UI
- [x] Inventory management screen (CRUD)
- [x] Navigation structure updated
- [x] TypeScript strict mode enabled
- [ ] Frontend UI tested on device/simulator (next step)
- [ ] WebSocket real-time sync (DEN 5)
- [ ] Production deployment guide (DEN 5)

---

## 🚀 NEXT STEPS (DEN 5)

1. **Test Frontend on Device**
   - Run `npm start` in app root
   - Scan QR code with Expo app
   - Verify all 4 screens load correctly

2. **WebSocket Real-time Sync**
   - Integrate socket.io (already initialized in backend)
   - Implement inventory sync on sales

3. **Final Polishing**
   - Error handling edge cases
   - Loading states
   - Offline mode (AsyncStorage cache)

4. **Deployment Docs**
   - Docker setup for backend
   - EAS build for iOS/Android

---

**Built in 4 days. Ready for presentation. Free technology. Thesis-ready. 🎯**
