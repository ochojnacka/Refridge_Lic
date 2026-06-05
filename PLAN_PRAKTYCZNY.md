# PLAN DZIAŁANIA - CZĘŚĆ PRAKTYCZNA (Zmian w Aplikacji)

**Łączny czas**: ~5 dni intensywnie (6-8 godzin dziennie)  
**Deadline**: Koniec 10 dni  
**Tech Stack**: Node.js + Express, PostgreSQL, React Native (existing), WebSocket

---

## ARCHITEKTURA KOŃCOWA

```
┌─────────────────────────────────────────────────────────────┐
│  REACT NATIVE APP (iOS/Android)                             │
│  ├─ LoginScreen                                              │
│  ├─ DashboardScreen (KPIs)                                   │
│  ├─ WasteAnalyticsScreen (charts)                            │
│  ├─ MenuSuggestionsScreen                                    │
│  ├─ InventoryScreen                                          │
│  └─ WasteLoggingScreen                                       │
└────────────┬──────────────────────────────────────────────────┘
             │ HTTP/WebSocket
┌────────────▼──────────────────────────────────────────────────┐
│  BACKEND (Node.js + Express + TypeScript)                     │
│  ├─ routes/auth.ts                                            │
│  ├─ routes/inventory.ts                                       │
│  ├─ routes/recipes.ts                                         │
│  ├─ routes/waste.ts                                           │
│  ├─ routes/analytics.ts                                       │
│  ├─ services/MenuSuggestionService.ts                         │
│  ├─ services/AnalyticsService.ts                              │
│  └─ websocket/sync.ts                                         │
└────────────┬──────────────────────────────────────────────────┘
             │ SQL
┌────────────▼──────────────────────────────────────────────────┐
│  PostgreSQL DATABASE                                          │
│  ├─ restaurants                                               │
│  ├─ users                                                     │
│  ├─ inventory_items                                           │
│  ├─ recipes                                                   │
│  ├─ waste_logs                                                │
│  ├─ sales                                                     │
│  └─ menu_suggestions                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## SZCZEGÓŁOWY PLAN CZASU - CZĘŚĆ PRAKTYCZNA

### **DEN 1 (5-6 godzin): Backend Foundation**

#### TASK 1.1: Backend Project Setup (1 h)

```
✅ Inicjalizacja:
   └─ npm init → package.json
   └─ npm install: express, typescript, typeorm, pg, cors, bcrypt, jsonwebtoken

✅ Struktura folderów:
backend/
├─ src/
│  ├─ models/
│  │  ├─ Restaurant.ts
│  │  ├─ User.ts
│  │  ├─ InventoryItem.ts
│  │  ├─ Recipe.ts
│  │  ├─ WasteLog.ts
│  │  └─ Sale.ts
│  ├─ routes/
│  │  ├─ auth.ts
│  │  ├─ inventory.ts
│  │  ├─ recipes.ts
│  │  ├─ waste.ts
│  │  └─ analytics.ts
│  ├─ services/
│  │  ├─ MenuSuggestionService.ts
│  │  └─ AnalyticsService.ts
│  ├─ middleware/
│  │  ├─ auth.ts
│  │  └─ errorHandler.ts
│  ├─ database.ts
│  └─ server.ts
├─ .env.example
├─ tsconfig.json
└─ package.json

✅ GitHub push
```

#### TASK 1.2: Database & Models (2 h)

```
✅ PostgreSQL setup:
   └─ Create database: refridge_pro_db
   └─ Connection string in .env

✅ TypeORM entities:

Restaurant.ts:
├─ id: UUID
├─ name: string
├─ city: string
├─ seats: number
├─ avgCoversPerDay: number
└─ createdAt: timestamp

User.ts:
├─ id: UUID
├─ restaurantId: UUID (FK)
├─ email: string
├─ passwordHash: string
├─ role: enum ("manager" | "chef" | "admin")
├─ name: string
└─ createdAt: timestamp

InventoryItem.ts:
├─ id: UUID
├─ restaurantId: UUID (FK)
├─ name: string
├─ quantity: number
├─ unit: enum ("kg" | "l" | "pc" | "g" | "ml")
├─ costPrice: number (PLN)
├─ expiryDate: date
├─ category: enum ("vegetables" | "meat" | "dairy" | "bread" | "other")
├─ lastUpdated: timestamp
└─ suppliedBy: string

Recipe.ts:
├─ id: UUID
├─ restaurantId: UUID (FK)
├─ name: string
├─ ingredientIds: UUID[] (FK array)
├─ costPrice: number
├─ salePrice: number
├─ margin: number (calculated)
├─ category: enum ("main" | "side" | "dessert" | "drink")
└─ createdAt: timestamp

WasteLog.ts:
├─ id: UUID
├─ restaurantId: UUID (FK)
├─ itemId: UUID (FK to InventoryItem)
├─ quantity: number
├─ reason: string
├─ value: number (PLN)
└─ timestamp: datetime

Sale.ts:
├─ id: UUID
├─ restaurantId: UUID (FK)
├─ recipeId: UUID (FK)
├─ quantity: number
├─ revenue: number
├─ timestamp: datetime
└─ dayOfWeek: number

✅ Migrations:
   └─ npx typeorm migration:generate
   └─ npx typeorm migration:run

✅ Test connection
```

#### TASK 1.3: Authentication (1.5 h)

```
✅ JWT setup:
├─ generateToken(user)
├─ verifyToken(token)
└─ refreshToken(token)

✅ Routes:

POST /auth/register
├─ Body: { email, password, restaurantId, name, role }
├─ Response: { token, user }

POST /auth/login
├─ Body: { email, password }
├─ Response: { token, user, restaurantId }

POST /auth/refresh
├─ Body: { refreshToken }
├─ Response: { token }

✅ Middleware:
├─ authenticateToken (checks JWT)
├─ authorizeRole("manager") (checks user.role)
└─ errorHandler (catches exceptions)

✅ Test with Postman
```

#### TASK 1.4: Inventory API - Skeleton (1.5 h)

```
✅ Routes (no business logic yet):

GET /inventory/items?restaurantId=ABC123
└─ Response: InventoryItem[]

POST /inventory/items
├─ Body: { restaurantId, name, quantity, unit, costPrice, expiryDate, category }
└─ Response: InventoryItem (created)

PATCH /inventory/items/:id
├─ Body: { quantity, expiryDate } (partial)
└─ Response: InventoryItem (updated)

DELETE /inventory/items/:id
└─ Response: { success: true }

✅ Controllers:
├─ getInventory(req, res)
├─ createInventoryItem(req, res)
├─ updateInventoryItem(req, res)
├─ deleteInventoryItem(req, res)

✅ Services:
├─ InventoryService.getItems(restaurantId)
├─ InventoryService.addItem(data)
├─ InventoryService.updateItem(id, data)
└─ InventoryService.deleteItem(id)

✅ Test all endpoints
```

**💾 CHECKPOINT - DEN 1:**

- Backend compiles ✓
- Database connected ✓
- 3 API endpoints working ✓
- GitHub push ✓

---

### **DEN 2 (5-6 godzin): REST API Completeness**

#### TASK 2.1: Recipes API (1.5 h)

```
✅ Routes:

GET /recipes?restaurantId=ABC123
└─ Response: Recipe[] (with margins calculated)

POST /recipes
├─ Body: { restaurantId, name, ingredients[], costPrice, salePrice, category }
└─ Response: Recipe (created with margin: (salePrice - costPrice) / salePrice)

PUT /recipes/:id
├─ Body: { name, ingredients[], costPrice, salePrice, category }
└─ Response: Recipe (updated)

DELETE /recipes/:id

✅ Controllers & Services
✅ Test endpoints
```

#### TASK 2.2: Waste Logging API (1.5 h)

```
✅ Routes:

POST /waste/log
├─ Body: { restaurantId, itemId, quantity, reason }
├─ Auto-calculates: value = quantity * InventoryItem.costPrice
└─ Response: WasteLog (created)

GET /waste/logs?restaurantId=ABC123&dateFrom=...&dateTo=...
├─ Query: supports date filtering
└─ Response: WasteLog[]

DELETE /waste/logs/:id

✅ Service:
├─ logWaste(restaurantId, itemId, quantity, reason)
└─ Auto-reduce inventory after logging

✅ Test endpoints
```

#### TASK 2.3: Sales Tracking API (1.5 h)

```
✅ Routes:

POST /sales/record
├─ Body: { restaurantId, recipeId, quantity, revenue }
├─ Auto-captures: timestamp, dayOfWeek
└─ Response: Sale (created)

GET /sales?restaurantId=ABC123&dateFrom=...&dateTo=...
└─ Response: Sale[]

✅ Service:
├─ recordSale(restaurantId, recipeId, quantity, revenue)
├─ aggregateSalesByRecipe(restaurantId, dateRange)
└─ getDemandPattern(restaurantId, recipeId) → { avgSalesPerDay, byDayOfWeek }

✅ Test endpoints
```

#### TASK 2.4: Seed Data (1 h)

```
✅ Mock Data Script:

seed/mockData.ts:
├─ Create restaurant: "Bistro Na Rogu"
├─ Create users: 1 manager + 1 chef
├─ Create 40 recipes (Polish cuisine)
├─ Create 6 months of:
│  ├─ Inventory items (daily snapshots)
│  ├─ Sales (realistic patterns)
│  │  └─ Weekdays: lower
│  │  └─ Fridays/Saturdays: higher
│  │  └─ Seasonal variations
│  └─ Waste logs (realistic)
│     └─ Vegetables: 12% waste
│     └─ Meat: 3% waste
│     └─ Dairy: 10% waste
│     └─ Bread: 5% waste
│
└─ npm run seed (loads all data)

✅ Verify data in DB
```

**💾 CHECKPOINT - DEN 2:**

- All CRUD endpoints working ✓
- Mock data seeded ✓
- Postman collection saved ✓
- GitHub push ✓

---

### **DEN 3 (5-6 godzin): Analytics & Smart Suggestions**

#### TASK 3.1: Analytics Service (2.5 h)

```
✅ Services/AnalyticsService.ts:

getWasteReport(restaurantId, dateRange) → {
  totalWasteValue: number,
  wastePercentage: number,
  byCategory: {
    vegetables: { waste%: 12, value: "2400 PLN" },
    meat: { waste%: 3, value: "800 PLN" },
    dairy: { waste%: 10, value: "1800 PLN" },
    bread: { waste%: 5, value: "900 PLN" }
  },
  byItem: [
    { name: "tomatoes", waste: "15kg", value: "300 PLN", trend: "+2%" }
  ],
  trends: { lastWeek: "+2%", lastMonth: "-1.5%" }
}

getProfitabilityByRecipe(restaurantId) → [
  { recipeId, name, margin%, avgSalesPerWeek, totalProfit }
]

getInventoryHealth(restaurantId) → {
  itemsExpiringToday: InventoryItem[],
  itemsExpiringThisWeek: InventoryItem[],
  lowStockAlerts: InventoryItem[]
}

getDemandPattern(restaurantId, recipeId) → {
  avgPerDay,
  byDayOfWeek: { mon: 5, tue: 6, ... },
  avgSalesLastMonth,
  trend: "increasing" | "stable" | "decreasing"
}

✅ Routes:

GET /analytics/waste-report?restaurantId=...&dateFrom=...&dateTo=...
GET /analytics/profitability?restaurantId=...
GET /analytics/inventory-health?restaurantId=...
GET /analytics/demand-pattern?restaurantId=...&recipeId=...

✅ Test all endpoints
```

#### TASK 3.2: Menu Suggestion Engine (2 h)

````
✅ Services/MenuSuggestionService.ts:

suggestMenuForToday(restaurantId) → {
  suggestions: [{
    recipe: Recipe,
    score: number,
    reasons: string[], // ["In stock", "Expires today", "High margin", "Popular today"]
    recommendedQuantity: number,
    estimatedProfit: number
  }],
  totalPotentialRevenue: number
}

Algorithm:
```typescript
function scoreRecipe(recipe, inventory, salesHistory) {
  let score = 0;
  let factors = [];

  // Factor 1: Can make it? (all ingredients in stock)
  if (canMakeRecipe(recipe, inventory)) {
    score += 100;
    factors.push("✓ In stock");
  }

  // Factor 2: Expiring items (priority use)
  const expiringIngredients = recipe.ingredients
    .map(ing => inventory.find(inv => inv.id === ing.id))
    .filter(inv => inv.expiryDate < tomorrow());

  score += expiringIngredients.length * 50;
  if (expiringIngredients.length)
    factors.push(`⚠️ Uses ${expiringIngredients.length} expiring items`);

  // Factor 3: Margin
  const margin = recipe.margin;
  score += margin * 100;
  factors.push(`💰 Margin: ${(margin * 100).toFixed(0)}%`);

  // Factor 4: Demand pattern (today)
  const dayOfWeek = new Date().getDay();
  const demandToday = salesHistory
    .filter(s => new Date(s.timestamp).getDay() === dayOfWeek)
    .filter(s => s.recipeId === recipe.id)
    .length;

  score += demandToday;
  if (demandToday > 5)
    factors.push(`📈 Popular today (${demandToday} avg sales)`);

  return { score, factors };
}
````

✅ Route:

GET /menu/suggestions?restaurantId=...
└─ Response: MenuSuggestion[] (sorted by score, top 5)

✅ Test with mock data

```

#### TASK 3.3: Real-Time Sync with WebSocket (1 h)
```

✅ Setup WebSocket:

socket.on('inventory-updated', (restaurantId, itemId, newQuantity) => {
// Broadcast to all users of this restaurant
io.to(`restaurant-${restaurantId}`).emit('inventory-updated', {
itemId,
newQuantity,
timestamp: now()
});
});

socket.on('waste-logged', (restaurantId, wasteLog) => {
io.to(`restaurant-${restaurantId}`).emit('waste-logged', wasteLog);
});

socket.on('sale-recorded', (restaurantId, sale) => {
io.to(`restaurant-${restaurantId}`).emit('sale-recorded', sale);
});

✅ Test with 2 clients

```

**💾 CHECKPOINT - DEN 3:**
- All analytics endpoints working ✓
- Menu suggestions generating correctly ✓
- WebSocket sync working ✓
- Tested with mock data ✓
- GitHub push ✓

---

### **DEN 4 (5-6 godzin): React Native Frontend Integration**

#### TASK 4.1: Login & Multi-Tenant Setup (1 h)
```

✅ Add to React Native:

screens/LoginScreen.tsx
├─ Email input
├─ Password input
├─ Login button
├─ Call: POST /auth/login
├─ Store: token in AsyncStorage
├─ Store: restaurantId in AsyncStorage
└─ Navigation: → DashboardScreen

✅ AuthContext.tsx
├─ Manage global auth state
├─ Token refresh on app start
└─ Logout function

✅ Update RootNavigator:
├─ Conditional rendering: LoginScreen vs MainTabs
└─ Pass restaurantId to all screens via context

```

#### TASK 4.2: Dashboard Screen (1 h)
```

✅ screens/DashboardScreen.tsx

Components:
├─ KPI Summary Box:
│ ├─ Waste this week: %
│ ├─ Revenue: PLN
│ ├─ Margin: %
│ └─ Menu optimization score
│
├─ Alerts:
│ ├─ 🔴 Items expiring today
│ ├─ 🟡 High waste categories
│ └─ 🟢 Good metrics (celebrating wins)
│
└─ Quick Actions:
├─ View waste analytics
├─ See menu suggestions
└─ Manage inventory

✅ Calls API:
├─ GET /analytics/waste-report
├─ GET /analytics/profitability
├─ GET /analytics/inventory-health
└─ WebSocket subscribe to updates

✅ Real-time updates via WebSocket

```

#### TASK 4.3: Waste Analytics Screen (1.5 h)
```

✅ screens/WasteAnalyticsScreen.tsx

Visualizations:
├─ Pie Chart (waste by category)
│ ├─ Vegetables: 45%
│ ├─ Dairy: 35%
│ ├─ Meat: 12%
│ └─ Bread: 8%
│
├─ Line Chart (7-day trend)
│ └─ Shows daily waste % (green if <5%, red if >8%)
│
├─ Table (top 5 waste items)
│ ├─ Item name
│ ├─ Waste quantity
│ ├─ Waste %
│ ├─ Value (PLN)
│ └─ Suggestion (e.g., "reduce orders by 20%")
│
└─ Cost Impact
└─ Total waste value this week (PLN)

✅ API call:
GET /analytics/waste-report?restaurantId=...&dateFrom=...&dateTo=...

✅ Use react-native-chart-kit for charts

```

#### TASK 4.4: Menu Suggestions Screen (1 h)
```

✅ screens/MenuSuggestionsScreen.tsx

For Today:
├─ Header: "Based on current inventory & sales patterns for [DAY]"
│
├─ Card 1: Top Recommendation
│ ├─ Dish name + image
│ ├─ Score: 9.2/10
│ ├─ Reasons:
│ │ ├─ ✓ In stock
│ │ ├─ ⚠️ Expires today
│ │ ├─ 💰 Margin: 72%
│ │ └─ 📈 Popular today
│ ├─ Profit if all sold: +576 PLN
│ └─ [ADD TO TODAY'S MENU] button
│
├─ Card 2: Second recommendation
├─ Card 3: Third recommendation
│
└─ Expandable: Show all 10 suggestions

✅ API call:
GET /menu/suggestions?restaurantId=...

✅ Button action: Save to menu (optional: backend could track this)

```

#### TASK 4.5: Inventory Screen Refactor (1 h)
```

✅ Refactor TabsScreen → InventoryScreen

Changes:
├─ Add "Cost Price" column
├─ Add "Supplier" field
├─ Add "Expiry Alert" indicator (🔴 today, 🟡 this week)
├─ Add "Waste Risk" indicator
├─ Remove ingredient matching (that was consumer feature)
├─ Add real-time sync via WebSocket
└─ Add quick update buttons

UI:
├─ Search/Filter by category
├─ Sort by: name, expiry date, quantity
├─ Each item row:
│ ├─ Name
│ ├─ Quantity + Unit
│ ├─ Cost Price
│ ├─ Expiry Date (with color coding)
│ ├─ Waste Risk %
│ └─ Edit button (swipe or tap)

✅ Connect to API:
GET /inventory/items?restaurantId=...
PATCH /inventory/items/:id

✅ WebSocket listeners for real-time updates

```

**💾 CHECKPOINT - DEN 4:**
- LoginScreen working ✓
- DashboardScreen shows real KPIs ✓
- WasteAnalyticsScreen with charts ✓
- MenuSuggestionsScreen showing top 5 ✓
- InventoryScreen refactored ✓
- WebSocket live updates ✓
- GitHub push ✓

---

### **DEN 5 (4-5 godzin): Testing, Deployment, Polish**

#### TASK 5.1: End-to-End Testing (1.5 h)
```

✅ Scenarios:

Scenario 1: Manager Views Dashboard
├─ Logs in
├─ Sees KPI summary
├─ Sees alerts
└─ Everything loads <2 seconds

Scenario 2: Manager Views Menu Suggestions
├─ Clicks "Menu Suggestions"
├─ Sees top 5 recommendations
├─ Each recommendation has score & reasons
└─ Can click to view details

Scenario 3: Real-time Waste Log
├─ Chef logs waste in app
├─ Manager sees dashboard update (via WebSocket)
├─ Analytics recalculate
└─ No page refresh needed

Scenario 4: Multi-User Sync
├─ Two devices open same restaurant
├─ One updates inventory
├─ Other receives update instantly (WebSocket)
└─ Both show same data

✅ Test on emulator + physical device
✅ Check performance (slow network simulation)

```

#### TASK 5.2: Backend Deployment (1 h)
```

✅ Deploy to Railway or Render:

1. Create account on Railway.app (or Render.com)
2. Connect GitHub repo
3. Set environment variables:
   ├─ DATABASE_URL
   ├─ JWT_SECRET
   ├─ NODE_ENV=production
   └─ CORS_ORIGIN=mobile-app-domain

4. Deploy backend
5. Test endpoints: https://your-backend.railway.app/health

✅ Database migration on production (automatic)
✅ Seed production with demo data

✅ Note: Frontend stays on user's device (React Native)

```

#### TASK 5.3: Demo Data Preparation (1 h)
```

✅ Create realistic scenarios:

Bistro Na Rogu - 6 months historical:
├─ 180 days × 85 covers/day average
├─ Weekday pattern: lower covers
├─ Weekend pattern: higher covers
├─ Seasonal variations (summer +15%, winter -10%)
├─ Realistic waste patterns:
│ ├─ Monday: 40% higher (weekend inventory not used)
│ ├─ Friday: lowest waste (cleaned for weekend)
│ └─ By category: vegetables 12%, meat 3%, dairy 10%, bread 5%
├─ 40 recipes with realistic:
│ ├─ Margins (55-75%)
│ ├─ Costs (recipes 50-200 PLN)
│ ├─ Sales patterns (demand by day)
│ └─ Ingredients (5-15 per recipe)
└─ Synthetic but realistic

✅ npm run seed:production → loads to deployed DB

```

#### TASK 5.4: Screenshots & Documentation (1 h)
```

✅ Screenshots for presentation:

1. LoginScreen
2. DashboardScreen (showing KPIs)
3. WasteAnalyticsScreen (pie chart)
4. WasteAnalyticsScreen (line chart trend)
5. MenuSuggestionsScreen (top 5)
6. InventoryScreen (with alerts)
7. Architecture diagram

✅ Create README.md:

## Refridge Pro - B2B Manager Dashboard

### Features:

- Real-time inventory tracking
- AI-powered menu suggestions
- Waste analytics & reporting
- Multi-user access (Manager, Chef)
- Real-time sync (WebSocket)

### Tech Stack:

- Backend: Node.js + Express + TypeORM
- Frontend: React Native (existing)
- Database: PostgreSQL
- Deploy: Railway + React Native build

### Setup:

```bash
# Backend
cd backend
npm install
npm run db:migrate
npm run seed:production
npm run dev

# Frontend
cd ../
npm install
npm start
```

### API Documentation:

See BACKEND_API.md

### Demo Credentials:

- Email: manager@bistro.pl
- Password: demo123

✅ Push to GitHub

```

#### TASK 5.5: Final Polish (0.5 h)
```

✅ Code cleanup:
├─ Remove console.logs
├─ Remove unused imports
├─ Format code (prettier)
└─ TypeScript strict checks

✅ Performance:
├─ API response times <300ms
├─ App cold start <3 seconds
├─ No memory leaks
└─ Efficient queries (index missing fields)

✅ Error handling:
├─ Network errors (show retry)
├─ Invalid token (logout + redirect)
├─ Server errors (show friendly message)
└─ Validation errors (show in UI)

✅ Security:
├─ No hardcoded secrets
├─ HTTPS only for production
├─ Password hashed (bcrypt)
├─ JWT secure (httpOnly if web)
└─ CORS configured

```

**💾 FINAL CHECKPOINT - DEN 5:**
- E2E testing complete ✓
- Backend deployed & working ✓
- Demo data loaded ✓
- Screenshots captured ✓
- Documentation complete ✓
- Code cleaned up ✓
- GitHub final push ✓

---

## DELIVERABLES - CZĘŚĆ PRAKTYCZNA

```

✅ BACKEND (Node.js):
├─ /src (with all models, routes, services)
├─ /seed (mock data script)
├─ .env.example
├─ package.json
├─ tsconfig.json
├─ Deployed on Railway
└─ API endpoints all working

✅ FRONTEND (React Native):
├─ LoginScreen (NEW)
├─ DashboardScreen (NEW)
├─ WasteAnalyticsScreen (NEW)
├─ MenuSuggestionsScreen (NEW)
├─ InventoryScreen (REFACTORED)
├─ AuthContext (NEW)
├─ WebSocket integration (NEW)
└─ All screens connected to backend

✅ DATABASE:
├─ PostgreSQL on Railway
├─ 7 tables with proper relations
├─ 6 months of realistic mock data
├─ Seeding script
└─ Migrations (TypeORM)

✅ DOCUMENTATION:
├─ README.md (setup + features)
├─ BACKEND_API.md (all endpoints)
├─ FRONTEND_SCREENS.md (UI components)
├─ DEPLOYMENT.md (how to deploy)
├─ Architecture diagram
└─ Screenshots (7 key screens)

✅ WORKING APP:
├─ Live on user's phone/emulator
├─ Connected to real backend
├─ Real-time updates
├─ Loaded with demo Bistro data
├─ Ready for live demo
└─ Production-ready code quality

```

---

## TECH STACK SZCZEGÓŁY

```

Backend:
├─ Framework: Express.js 4.18+
├─ ORM: TypeORM 0.3+
├─ Database: PostgreSQL 14+
├─ Auth: JWT + bcrypt
├─ Real-time: Socket.io
├─ Validation: class-validator
├─ Env: dotenv
└─ Language: TypeScript 5+

Frontend:
├─ Framework: React Native 0.72+
├─ Navigation: React Navigation 7.x (existing)
├─ Charts: react-native-chart-kit
├─ State: Context API (existing)
├─ Storage: AsyncStorage (existing)
├─ HTTP: fetch API (existing)
├─ WebSocket: socket.io-client
└─ Animations: React Native Reanimated (existing)

Database:
├─ Engine: PostgreSQL 14
├─ Migrations: TypeORM
├─ Hosting: Railway.app (free tier)
└─ Backup: automatic

Deployment:
├─ Backend: Railway
├─ Frontend: local build (APK/IPA for distribution)
└─ Database: managed by Railway

```

---

## CHECKPOINTS - VALIDATION

```

✅ DEN 1 END:

- Backend compiles
- DB connected
- 3 API endpoints work

✅ DEN 2 END:

- All CRUD endpoints work
- Mock data loaded
- Postman collection complete

✅ DEN 3 END:

- Analytics endpoints working
- Menu suggestions generating
- WebSocket syncing

✅ DEN 4 END:

- All 5 screens built
- Connected to backend
- Real data loading

✅ DEN 5 END:

- E2E testing passed
- Deployed to production
- Ready for live demo

```

---

## GOTOWOŚĆ DO PREZENTACJI

```

✅ Co pokazać:

1. Live app on phone/emulator
   ├─ Login (manager@bistro.pl / demo123)
   ├─ Dashboard (KPIs live from backend)
   ├─ Menu suggestions (algorithm explaining)
   ├─ Waste analytics (charts interactive)
   └─ Inventory (real-time updates)

2. Architecture explanation
   ├─ Backend structure
   ├─ API flow
   ├─ Database schema
   └─ WebSocket real-time

3. ROI demo with case study data
   ├─ Waste reduction impact
   ├─ Revenue gain
   ├─ Payback calculation
   └─ Profitability improvement

4. Code walkthrough (if asked)
   ├─ Menu suggestion algorithm
   ├─ Analytics calculations
   └─ API endpoints

```

```
