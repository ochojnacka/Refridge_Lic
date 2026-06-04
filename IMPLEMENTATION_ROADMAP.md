# 📅 PLAN DZIAŁANIA - 7 DNI (Refridge B2B dla Pracy Licencjackiej)

**Deadline**: 7 dni  
**Scope**: Cleanup + SQLite→PostgreSQL + 3 nowe screens + Case study  
**Testowanie**: Każdy dzień - testy na koniec dnia

---

## 🚀 DEN 1-2: FOUNDATION (Cleanup + Database Migration)

### DEN 1: CLEANUP - Usunąć zbędne pliki (4-5 godzin)

#### Zadania:

1. **Usuń consumer screens** (1.5 h)
   - [ ] FindRecipeScreen.tsx
   - [ ] LandingScreen.tsx
   - [ ] SavedRecipesScreen.tsx
   - [ ] YourFridgeScreen.tsx
   - [ ] MainMenuScreen.tsx
   - [ ] RecipeCreationScreen.tsx
   - [ ] AddToFridgeModal.tsx
   - [ ] RecipeModal.tsx

2. **Usuń consumer components** (0.5 h)
   - [ ] CategoryFilter.tsx
   - [ ] MealTypeFilter.tsx
   - [ ] EmojiPicker.tsx
   - [ ] Usuń katalog `src/data/`
   - [ ] Usuń katalog `src/hooks/`

3. **Zaktualizuj navigation** (1.5 h)
   - [ ] `src/navigation/RootNavigator.tsx` - usuń consumer screens z import/exports
   - [ ] Ustaw `LoginScreen` jako initial route (zamiast LandingScreen)
   - [ ] Usuń wszystkie consumer route definitions
   - [ ] Dodaj placeholder dla nowych screens: WasteLogging, DetailedKPI, Alerts

4. **Zaktualizuj types** (0.5 h)
   - [ ] `src/navigation/types.ts` - usuń consumer screen types z RootStackParamList
   - [ ] Dodaj nowe types: `WasteLogging`, `DetailedKPI`, `Alerts`

5. **Przenazwij pliki** (0.5 h)
   - [ ] `src/navigation/HeaderContext.ts` → `src/navigation/HeaderContextProvider.ts`
   - [ ] Zaktualizuj imports wszędzie

6. **Build test** (0.5 h)
   - [ ] `npm install` w root
   - [ ] `tsc --noEmit` (sprawdź TS errors)
   - [ ] Brak import errors?

**OUTPUT**: Czysty projekt bez consumer code, gotowy do nowych features

---

### DEN 1-2: DATABASE MIGRATION - SQLite → PostgreSQL (3-4 godziny)

#### Zadania:

1. **Zmień database DSN** (0.5 h)
   - [ ] Edytuj `backend/src/database.ts`
   - [ ] Zmień typ z `'sqlite'` na `'postgres'`
   - [ ] Zmień database path na connection string
   - [ ] Dodaj env variables: POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB

2. **Utwórz .env file** (0.25 h)

   ```env
   # backend/.env
   NODE_ENV=development
   PORT=3000
   CORS_ORIGIN=http://localhost:3000,http://localhost:8081,http://localhost:19000

   # PostgreSQL
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_USER=refridge_user
   POSTGRES_PASSWORD=securepassword123
   POSTGRES_DB=refridge_dev

   # JWT
   JWT_SECRET=your-secret-key-change-in-production
   JWT_EXPIRY=24h
   ```

3. **Zainstaluj PostgreSQL** (1 h) - LOCAL/DEV:
   - [ ] Pobierz PostgreSQL Community Edition (free)
   - [ ] Instalacja na localhost:5432
   - [ ] Utwórz user: `refridge_user` + password
   - [ ] Utwórz database: `refridge_dev`
   - [ ] Test connection: `psql -U refridge_user -d refridge_dev -h localhost`

4. **Generuj TypeORM migracje** (1 h)
   - [ ] `backend/npm run db:generate` (jeśli migracje były zmieniane)
   - [ ] `backend/npm run db:migrate` (run migracje)
   - [ ] Sprawdź czy tabele zostały stworzone w PostgreSQL

5. **Seed data** (0.5 h)
   - [ ] `backend/npm run seed` (najpierw restart database)
   - [ ] Sprawdź czy data załadowała się prawidłowo

6. **Test backend** (1 h)
   ```bash
   cd backend
   npm run dev
   # Sprawdź:
   # - Server runs on http://localhost:3000
   # - Health endpoint: GET http://localhost:3000/health
   # - Login endpoint: POST http://localhost:3000/auth/login
   ```

**OUTPUT**: PostgreSQL running locally, backend podłączony, seed data załadowana

---

## 📱 DEN 2-3: NEW SCREENS PART 1 (WasteLoggingScreen)

### DEN 2-3: WasteLoggingScreen - Kitchen Staff Module (6-8 godzin)

**Cel**: Pozwolić personelowi kuchni szybko logować marnotrawstwo produktów

#### Zadania:

1. **Stworzy\u0107 WasteLoggingScreen.tsx** (3-4 h)

```typescript
// src/screens/WasteLoggingScreen.tsx - MOCKUP

interface WasteLoggingScreenProps {
  navigation: any;
}

export function WasteLoggingScreen({ navigation }: WasteLoggingScreenProps) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState<'Expired' | 'Damaged' | 'Over-production' | 'Other'>('Expired');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Logika:
  // 1. Załaduj listę produktów z inventory API
  // 2. User wybiera produkt z dropdown
  // 3. Wpisuje ilość (kg/l/pc)
  // 4. Wybiera przyczynę z lista
  // 5. System auto-kalkuluje wartość PLN (quantity * costPrice)
  // 6. Submit: POST /waste/log
  // 7. WebSocket event: sync z innymi użytkownikami
  // 8. Toast: "Waste logged successfully"
  // 9. Reset form

  return (
    <SafeAreaView>
      {/* Header */}
      {/* Dropdown: Select item */}
      {/* Input: Quantity */}
      {/* Dropdown: Select reason */}
      {/* Display: Estimated waste value (PLN) */}
      {/* Button: Log waste */}
      {/* Button: View waste history */}
    </SafeAreaView>
  );
}
```

- [ ] Create form state (selectedItem, quantity, reason, loading)
- [ ] Load inventory items on mount (GET /inventory/items)
- [ ] Dropdown component z produktami
- [ ] Input field na ilość (qty + unit)
- [ ] Dropdown na przyczyny waste
- [ ] Auto-display: wartość PLN (quantity × item.costPrice)
- [ ] Submit button: POST /waste/log
- [ ] Success toast message
- [ ] Error handling
- [ ] WebSocket event listener (real-time sync)

2. **API Integration** (1 h)
   - [ ] Sprawdź `backend/src/routes/waste.ts` - POST /waste/log endpoint
   - [ ] Upewnij się że endpoint przyjmuje:
     ```json
     {
       "itemId": "uuid",
       "quantity": 2.5,
       "reason": "Expired",
       "unit": "kg"
     }
     ```
   - [ ] Endpoint powinien zwracać value w PLN
   - [ ] Test endpoint w Postman/curl

3. **WebSocket Integration** (1.5 h)
   - [ ] Connect do WebSocket w component (onMount)
   - [ ] Listen event: `waste:logged`
   - [ ] Refresh inventory list gdy ktoś zalogu\u0142 waste
   - [ ] Show real-time badge: "New waste logged 30s ago"

4. **Unit Tests na DEN 3** (1 h)
   - [ ] Test: form validation (quantity > 0)
   - [ ] Test: API integration (POST /waste/log)
   - [ ] Test: WebSocket event handling
   - [ ] Manual test: Log waste, check data in backend

**OUTPUT**: Fully functional WasteLoggingScreen, personel kuchni może logować waste

---

## 📊 DEN 3-4: NEW SCREENS PART 2 (DetailedKPIScreen)

### DEN 3-4: DetailedKPIScreen - Manager Advanced Analytics (8-10 godzin)

**Cel**: Pokazać managerowi KPI before/after dla case study (Tabela 3.1 z pracy)

#### Zadania:

1. **Sprecyzuj wymagane KPIs** (1 h)

   Z planu pracy (Tabela 3.1):
   - Food Waste % (before: 8%, after: 5%)
   - Profit Margin % (before: 60%, after: 62%)
   - Stock Turnover Days (before: 14, after: 10)
   - Revenue (daily/monthly)
   - Top/Bottom recipes (by profitability)
   - Waste by category (Vegetables, Dairy, Meat)
   - Trend graph (7/30 dni)

2. **Stworzy\u0107 DetailedKPIScreen.tsx** (4-5 h)

```typescript
// src/screens/DetailedKPIScreen.tsx - MOCKUP

interface KPIMetrics {
  wastePercent: number;
  profitMargin: number;
  stockTurnoverDays: number;
  monthlyRevenue: number;
  topRecipes: Recipe[];
  bottomRecipes: Recipe[];
  wasteByCategory: Record<string, number>;
  trend7Days: Array<{date: string, waste: number, revenue: number}>;
}

export function DetailedKPIScreen({ navigation }: any) {
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'all'>('30days');
  const [loading, setLoading] = useState(true);

  // Logika:
  // 1. Load KPI data z /analytics/waste-report, /analytics/profitability
  // 2. Calculate metric values
  // 3. Display w cards + charts
  // 4. Implement tabs: Waste / Revenue / Profitability / Recipes
  // 5. Allow filter by date range

  return (
    <SafeAreaView>
      {/* Header: "Analytics" */}
      {/* Segment Control: 7 Days / 30 Days / All Time */}

      {/* Tab 1: Waste Analytics */}
      {/* - Waste % (big card) */}
      {/* - Waste by Category (pie chart) */}
      {/* - Trend (line chart) */}

      {/* Tab 2: Revenue & Profitability */}
      {/* - Monthly Revenue (card) */}
      {/* - Profit Margin % (card) */}
      {/* - Revenue Trend (line chart) */}

      {/* Tab 3: Recipe Performance */}
      {/* - Top 5 Recipes by profit (list) */}
      {/* - Bottom 5 Recipes (list) */}
      {/* - Profitability breakdown (bar chart) */}

      {/* Tab 4: Inventory */}
      {/* - Stock Turnover Days (card) */}
      {/* - Critical Items (list) */}
    </SafeAreaView>
  );
}
```

- [ ] Create state for metrics, timeRange, loading
- [ ] Load data: GET /analytics/waste-report?range=30days
- [ ] Load data: GET /analytics/profitability?range=30days
- [ ] Create tabs: Waste / Revenue / Recipes / Inventory
- [ ] Tab 1 - Waste:
  - [ ] Waste % (large card)
  - [ ] Pie chart: waste by category
  - [ ] Line chart: waste trend over time
- [ ] Tab 2 - Revenue:
  - [ ] Monthly revenue (large card)
  - [ ] Profit margin % (large card)
  - [ ] Line chart: revenue trend
- [ ] Tab 3 - Recipes:
  - [ ] Top 5 recipes (list with profit amount)
  - [ ] Bottom 5 recipes (list)
  - [ ] Bar chart: recipe profitability
- [ ] Tab 4 - Inventory:
  - [ ] Stock turnover days (large card)
  - [ ] Critical items (low stock)
- [ ] Segment control: date range filter
- [ ] Refresh control (pull to refresh)
- [ ] Error handling

3. **Backend - Wzmocnij Analytics Endpoints** (2-3 h)
   - [ ] Sprawdź `backend/src/services/AnalyticsService.ts`
   - [ ] Implementuj metody:
     ```typescript
     getWasteReport(restaurantId, range); // waste %, by category, trend
     getProfitabilityReport(restaurantId, range); // revenue, margin, per-recipe
     getRecipePerformance(restaurantId, range); // top/bottom recipes
     getInventoryHealth(restaurantId); // turnover, critical items
     ```
   - [ ] API routes w `backend/src/routes/analytics.ts`
   - [ ] Test endpoints w Postman

4. **Charts Library** (1-2 h)
   - [ ] Wybierz library: `react-native-chart-kit` (lightweight)
   - [ ] Add do `package.json`: `"react-native-chart-kit": "^6.12.0"`
   - [ ] Implementuj: LineChart, BarChart, PieChart
   - [ ] Styling to match theme

5. **Unit Tests na DEN 4** (1 h)
   - [ ] Test: data loading
   - [ ] Test: metrics calculations
   - [ ] Test: time range filtering
   - [ ] Manual test: View all tabs, verify data accuracy

**OUTPUT**: Fully functional DetailedKPIScreen, manager widzi metrics dla case study

---

## 🔔 DEN 4: NEW SCREEN PART 3 (Alerts) + WebSocket

### DEN 4A: AlertsScreen / AlertBadge - Real-time Notifications (4 godziny)

**Cel**: Pokazać alerty o terminach ważności i marnotrawstwie

#### Zadania:

1. **Stworzy\u0107 AlertsScreen.tsx** (2-3 h)

```typescript
// src/screens/AlertsScreen.tsx

interface Alert {
  id: string;
  type: 'expiry' | 'waste' | 'low-stock' | 'high-margin';
  severity: 'critical' | 'warning' | 'info'; // red, yellow, blue
  message: string;
  itemName: string;
  value?: number; // kg, PLN, etc.
  timestamp: Date;
}

export function AlertsScreen({ navigation }: any) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'all' | 'expiry' | 'waste' | 'low-stock'>('all');

  // Logika:
  // 1. WebSocket connection: listen alerts
  // 2. Display alerts w list
  // 3. Filter by type
  // 4. Dismiss alert (remove from list)
  // 5. Click alert → navigate to relevant screen (Inventory, WasteLogging)

  return (
    <SafeAreaView>
      {/* Header: "Alerts" */}
      {/* Segment: All / Expiry / Waste / Low Stock */}
      {/* FlatList: alerts */}
      {/* - Red badge: Expiry today */}
      {/* - Yellow badge: Expiry this week */}
      {/* - Blue badge: Low stock warnings */}
      {/* - Green badge: High-margin recommendations */}
    </SafeAreaView>
  );
}
```

- [ ] Create state for alerts, filter
- [ ] WebSocket listener: emit('alerts:subscribe')
- [ ] Listen events: 'alert:new', 'alert:dismiss'
- [ ] Display alerts w color-coded badges
- [ ] Filter by type
- [ ] Swipe to dismiss action
- [ ] Tap to navigate to relevant screen

2. **AlertBadge Component** (1 h) - Alternative (jeśli AlertsScreen za heavy)
   - [ ] Dodaj badge do DashboardScreen (top-right corner)
   - [ ] Badge shows count of active alerts
   - [ ] Tap badge → navigate to AlertsScreen

3. **WebSocket Alert Events** (1 h) - Backend
   - [ ] Sprawdź `backend/src/websocket/` setup
   - [ ] Implementuj events:
     - `alert:subscribe` - client subscribes to alerts
     - `alert:new` - broadcast nowy alert do všech clients
     - `alert:dismiss` - client dismisses alert
   - [ ] Test connection w frontend

**OUTPUT**: Real-time alerts system working, manager widzi expiry warnings

---

### DEN 4B: WebSocket Full Integration (2-3 godziny)

**Cel**: Sync all screens real-time (inventory, waste, suggestions)

#### Zadania:

1. **Backend WebSocket Events** (1.5 h)
   - [ ] Sprawdzaj `backend/src/websocket/` - czy socket.io initialized?
   - [ ] Implementuj events:

     ```typescript
     // Client connects
     socket.on('subscribe:inventory', (restaurantId) => {
       // Add client to room
     })

     // When inventory changes
     POST /inventory/items → emit('inventory:updated', item)

     // When waste logged
     POST /waste/log → emit('waste:logged', log)

     // When sales recorded
     POST /sales/record → emit('sales:updated', sale)
     ```

2. **Frontend WebSocket Connection** (1 h)
   - [ ] Dodaj WebSocket client w `src/api/client.ts`
   - [ ] Connect on app mount
   - [ ] Listen inventory, waste, sales events
   - [ ] Update state w response

3. **Real-time UI Updates** (0.5 h)
   - [ ] DashboardScreen - refresh KPI w realtime
   - [ ] InventoryScreen - update quantities
   - [ ] MenuSuggestionsScreen - refresh suggestions
   - [ ] WasteLoggingScreen - update available items

**OUTPUT**: WebSocket fully integrated, UI syncs real-time

---

## 🧪 DEN 5: Testing + Data Seeding

### DEN 5A: Case Study Data Generation (3-4 godziny)

**Cel**: Generate realistic 6-month data dla "Bistro Na Rogu" case study

#### Zadania:

1. **Seed Script - Expand mockData.ts** (2 h)
   - [ ] Edytuj `backend/seed/mockData.ts`
   - [ ] Generate 6 months of realistic data (180 days):
     ```
     - Sales: 30-50 per day (varies by day of week)
     - Waste: 3-5 incidents per day
     - Inventory: 8 base items, rotating levels
     - Recipes: 6 base recipes, used daily
     ```
   - [ ] Implement demand patterns:
     ```
     - Weekends: +40% traffic
     - Mondays: -20% traffic
     - Lunch time: high pasta sales
     - Dinner time: high meat sales
     ```
   - [ ] Implement waste patterns:
     ```
     - Vegetables: 10-15% waste per week
     - Dairy: 8-12% waste per week
     - Meat: 5-10% waste per week
     ```

2. **Run seed script** (1 h)

   ```bash
   cd backend
   npm run seed  # Generate data
   # Sprawdź dane w PostgreSQL
   ```

3. **Verify data** (1 h)
   - [ ] Check Tables w PostgreSQL:
     - [ ] restaurants (1 record: Bistro Na Rogu)
     - [ ] users (2 records: manager, chef)
     - [ ] recipes (6 records: Carbonara, Margherita, Salmon, Chicken, Salad, Risotto)
     - [ ] sales (~5400 records: 180 days × 30 avg/day)
     - [ ] waste_logs (~900 records: 180 days × 5 avg/day)
     - [ ] inventory_items (8 records: with current stock levels)
   - [ ] Verify KPI calculations:
     - [ ] Total revenue ~180k PLN (estimated)
     - [ ] Waste % ~7-8% (matches real restaurant)
     - [ ] Profit margin ~65% (matches restaurant industry)

### DEN 5B: Manual Testing - All Flows (2-3 godziny)

**Checklist - Test każdy flow:**

1. **Authentication Flow** (0.5 h)
   - [ ] Start backend: `cd backend && npm run dev`
   - [ ] Start frontend: `cd .. && npm start`
   - [ ] Login z demo credentials: manager@bistro.pl / demo123
   - [ ] Check token stored w AsyncStorage
   - [ ] Logout → Login again

2. **Dashboard Flow** (1 h)
   - [ ] Dashboard loads w <2 seconds
   - [ ] KPI metrics display: revenue, margin, waste %
   - [ ] Time range filter works (Today / Week / Month)
   - [ ] Pull-to-refresh works
   - [ ] Real-time update from WebSocket (check console logs)

3. **Inventory Flow** (1 h)
   - [ ] Inventory Screen loads all 8 items
   - [ ] Add new item (POST /inventory/items)
   - [ ] Edit item quantity (PATCH /inventory/items/:id)
   - [ ] Delete item (DELETE /inventory/items/:id)
   - [ ] Real-time update z WebSocket

4. **Menu Suggestions Flow** (1 h)
   - [ ] MenuSuggestionsScreen loads suggestions
   - [ ] Suggestions sorted by score (0-100)
   - [ ] Each suggestion shows: score breakdown, estimated profit
   - [ ] Tap suggestion → shows details

5. **Waste Logging Flow** (1 h)
   - [ ] WasteLoggingScreen loads inventory items
   - [ ] Select item → select reason → enter quantity
   - [ ] Submit → POST /waste/log
   - [ ] Verify waste logged w backend database
   - [ ] Real-time notification in AlertsScreen

6. **Detailed KPI Flow** (1 h)
   - [ ] DetailedKPIScreen loads metrics
   - [ ] All 4 tabs work: Waste / Revenue / Recipes / Inventory
   - [ ] Date range filter works
   - [ ] Charts display correctly
   - [ ] Numbers match database queries

7. **WebSocket Sync** (0.5 h)
   - [ ] Open app na 2 devices (phone + emulator)
   - [ ] Log waste na device #1
   - [ ] Check real-time update na device #2
   - [ ] Check console logs: WebSocket events firing

**OUTPUT**: Wszystkie flows testowane, zero bugs znalezione

---

## 📖 DEN 6-7: Documentation + Final Polish

### DEN 6: Documentation (4-5 godzin)

**Cel**: Przygotować dokumentację dla pracy licencjackiej

#### Zadania:

1. **UML Diagramy** (3 h) - Use draw.io
   - [ ] Use Case Diagram (1 h)
     ```
     Actors: Manager, Chef
     Use Cases:
       - Login
       - View Dashboard
       - View Menu Suggestions
       - Manage Inventory
       - Log Waste
       - View Advanced Analytics
       - Export Reports
     ```
   - [ ] ER Diagram (1 h)
     ```
     Entities: User, Restaurant, Recipe, InventoryItem, Sale, WasteLog, MenuSuggestion
     Relations: FK references
     ```
   - [ ] Class Diagram (0.5 h)
     ```
     Classes: MenuSuggestionService, AnalyticsService, APIClient
     Methods + Properties
     ```
   - [ ] Export PNG → embed w pracy

2. **Code Listings** (1 h)
   - [ ] Listing 3.1: MenuSuggestionService algorithm
   - [ ] Listing 3.2: Backend Express + WebSocket setup
   - [ ] Format: code blocks z line numbers

3. **Screenshots** (1 h)
   - [ ] Screenshot 1: LoginScreen
   - [ ] Screenshot 2: DashboardScreen
   - [ ] Screenshot 3: WasteLoggingScreen
   - [ ] Screenshot 4: DetailedKPIScreen
   - [ ] Screenshot 5: MenuSuggestionsScreen
   - [ ] Annotate w descriptions

### DEN 6: Case Study Analysis (2-3 godziny)

**Cel**: Stwórz Case Study analysis dla "Bistro Na Rogu"

#### Struktura (z planu pracy):

1. **3.3 - Studium Przypadku** (Tabela 3.1, Wykres 3.2)
   - [ ] Before metrics (baseline):
     - Waste: 8%
     - Margin: 60%
     - Turnover: 14 days
     - Revenue: 25,000 PLN/month
   - [ ] After metrics (z simulated data):
     - Waste: 5% (-3%)
     - Margin: 62% (+2%)
     - Turnover: 10 days (-4)
     - Revenue: 25,750 PLN/month (+3%)
   - [ ] ROI analysis:
     - System cost: 300 PLN/month (SaaS model)
     - Savings: 960 PLN/month (waste reduction)
     - Margin improvement: 750 PLN/month
     - Net benefit: 1,410 PLN/month
     - Payback: ~1 week

2. **Graphs**:
   - [ ] Wykres 3.2 - Line chart: waste trend over 6 months
   - [ ] Export from DetailedKPIScreen or create in Excel

### DEN 7: Final Polish + Submission (3-4 godziny)

**Checklist - Pre-submission:**

1. **Code Quality** (1 h)
   - [ ] Run TypeScript compiler: `npm run build` (no errors)
   - [ ] Check for console.log debugs (remove)
   - [ ] Check for TODO comments (resolve or add to Future Work)
   - [ ] Format code: `prettier --write src/**/*.tsx`

2. **Testing** (1.5 h)
   - [ ] All screens load correctly
   - [ ] No crashes on navigation
   - [ ] API errors handled gracefully (error messages show)
   - [ ] WebSocket reconnects on network loss
   - [ ] Offline mode works (AsyncStorage cache)

3. **Thesis Alignment** (1 h)
   - [ ] Verify all Tabele z planu są w pracy
   - [ ] Verify all Rysunki z planu są w pracy
   - [ ] Verify all Listingi z planu są w pracy
   - [ ] Verify case study results align z expectations

4. **Submission Package** (0.5 h)
   - [ ] Create deployment guide (README.md)
   - [ ] Create demo video (5 min)
   - [ ] Create source code archive (git bundle)
   - [ ] Submit!

**OUTPUT**: Thesis ready for submission

---

## 📊 TIMELINE OVERVIEW

| Dzień       | Zadania                                   | Godziny         | Status |
| ----------- | ----------------------------------------- | --------------- | ------ |
| **DEN 1**   | Cleanup (8 consumer screens + components) | 4-5             | P0     |
| **DEN 1-2** | SQLite → PostgreSQL migration             | 3-4             | P0     |
| **DEN 2-3** | WasteLoggingScreen creation               | 6-8             | P0     |
| **DEN 3-4** | DetailedKPIScreen creation                | 8-10            | P1     |
| **DEN 4**   | AlertsScreen + WebSocket integration      | 6-7             | P1     |
| **DEN 5**   | Testing + Case study data seeding         | 5-7             | P1     |
| **DEN 6-7** | Documentation + Final polish              | 6-8             | P2     |
| **TOTAL**   |                                           | **44-50 hours** | ✓      |

**Estimated**: 6-7 godzin pracy dziennie

---

## ✅ SUCCESS CRITERIA

Projekt będzie gotów do oddania pracy gdy:

- [ ] Wszystkie consumer code usunięty
- [ ] PostgreSQL running, seed data loaded
- [ ] WasteLoggingScreen fully functional
- [ ] DetailedKPIScreen shows case study metrics
- [ ] AlertsScreen wyświetla alerty real-time
- [ ] WebSocket syncing inventory, waste, suggestions
- [ ] All 5 flows tested z zero bugs
- [ ] Case study analysis complete (KPIs, ROI)
- [ ] UML diagramy + Screenshots w pracy
- [ ] Code compiluje bez errors/warnings
- [ ] README.md + deployment guide written

---

**Status**: Ready for implementation  
**Next**: Zaproponuję konkretne zmiany w kodzie - strand 1 to DEN 1 cleanup
