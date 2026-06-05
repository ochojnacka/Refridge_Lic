# 📋 ANALIZA STRUKTURY PROJEKTU - Refridge B2B

**Data**: 4 czerwca 2026  
**Cel**: Identyfikacja zbędnych plików i struktury dla pracy licencjackiej  
**Deadline**: 7 dni

---

## 1. ZBĘDNE PLIKI (Consumer Fridge App - poprzedni projekt)

### Frontend Screens - USUŃ (16 plików):

| Plik                                   | Powód                              | Akcja                       |
| -------------------------------------- | ---------------------------------- | --------------------------- |
| `src/screens/SuggestionsScreen.tsx`    | Consumer: szukanie przepisów       | ❌ USUŃ                     |
| `src/screens/LandingScreen.tsx`        | Consumer onboarding (intro screen) | ❌ USUŃ + zmień entry point |
| `src/screens/InventoryScreen.tsx`      | Consumer: zapisane przepisy        | ❌ USUŃ                     |
| `src/screens/TabsScreen.tsx`           | Consumer: twoja lodówka            | ❌ USUŃ                     |
| `src/screens/MainMenuScreen.tsx`       | Consumer: główne menu              | ❌ USUŃ                     |
| `src/screens/RecipeCreationScreen.tsx` | Consumer: tworzenie przepisów      | ❌ USUŃ                     |
| `src/screens/AddToFridgeModal.tsx`     | Consumer: dodawanie do lodówki     | ❌ USUŃ                     |
| `src/screens/RecipeModal.tsx`          | Consumer: szczegóły przepisu       | ❌ USUŃ                     |

### Frontend Components - USUŃ (6 plików):

| Plik                                | Powód           | Akcja                                                 |
| ----------------------------------- | --------------- | ----------------------------------------------------- |
| `src/components/CategoryFilter.tsx` | Consumer UI     | ❌ USUŃ                                               |
| `src/components/MealTypeFilter.tsx` | Consumer UI     | ❌ USUŃ                                               |
| `src/components/EmojiPicker.tsx`    | Consumer UI     | ❌ USUŃ                                               |
| `src/components/RecipeCard.tsx`     | Consumer UI     | ⚠️ ZACHOWAĆ (może być przydatny dla menu suggestions) |
| `src/components/AppHeader.tsx`      | Consumer header | ⚠️ ZACHOWAĆ (może być reuse dla B2B screens)          |

### Frontend Data - USUŃ (1 plik):

| Plik                  | Powód                      | Akcja   |
| --------------------- | -------------------------- | ------- |
| `src/data/recipes.ts` | Hardcoded consumer recipes | ❌ USUŃ |

### Frontend Hooks - USUŃ (2 pliki):

| Plik                                     | Powód             | Akcja   |
| ---------------------------------------- | ----------------- | ------- |
| `src/hooks/useKeyboardDismissGesture.ts` | Consumer specific | ❌ USUŃ |
| `src/hooks/useSwipeGestures.ts`          | Consumer specific | ❌ USUŃ |

**RAZEM PLIKÓW DO USUNIĘCIA**: ~26 plików

---

## 2. PLIKI DO ZACHOWANIA (B2B workflow)

### ✅ Frontend Screens - ZACHOWAĆ (6 plików):

```
src/screens/
  ├─ LoginScreen.tsx         ✅ B2B: Manager/Chef login
  ├─ RegisterScreen.tsx      ✅ B2B: Restaurant registration
  ├─ DashboardScreen.tsx     ✅ B2B: Manager analytics
  ├─ InventoryScreen.tsx     ✅ B2B: Inventory CRUD
  ├─ MenuSuggestionsScreen.tsx ✅ B2B: AI menu recommendations
  └─ AccountScreen.tsx       ✅ B2B: User profile/settings
```

### ✅ Frontend Internals - ZACHOWAĆ:

```
src/
  ├─ api/client.ts           ✅ HTTP API client
  ├─ components/
  │  ├─ Layout.tsx           ✅ Uniwersalny layout component
  │  ├─ RecipeCard.tsx       ✅ Może być reuse dla menu
  │  └─ AppHeader.tsx        ✅ Może być reuse dla B2B
  ├─ navigation/
  │  ├─ RootNavigator.tsx    ✅ Tab/Stack navigation
  │  ├─ types.ts            ✅ Navigation types
  │  └─ HeaderContext.ts    ⚠️ PRZENAZWANIE na HeaderContextProvider.ts
  ├─ state/AppStateContext.tsx ✅ Global state
  ├─ storage/persistence.ts ✅ AsyncStorage
  ├─ theme.ts               ✅ Design system (COLORS, RADIUS, etc.)
  ├─ types/domain.ts        ✅ Core TypeScript types
  └─ utils/
     ├─ formatting.ts       ✅ PLN formatting, etc.
     └─ recipeMatching.ts   ⚠️ Może być reuse dla menu scoring
```

### ✅ Backend - PEŁNIE ZACHOWAĆ:

```
backend/src/
  ├─ models/                ✅ 7 encji (User, Restaurant, etc.)
  ├─ routes/                ✅ 6 route modules (auth, inventory, etc.)
  ├─ services/              ✅ MenuSuggestionService, AnalyticsService
  ├─ middleware/            ✅ Auth JWT
  ├─ database.ts            ⚠️ Zmiana SQLite → PostgreSQL
  └─ server.ts              ✅ Express + WebSocket setup
```

---

## 3. NOWE PLIKI DO STWORZENIA

### 🆕 Dla pracy licencjackiej:

| Screen                                       | Cel                                                        | Deadline |
| -------------------------------------------- | ---------------------------------------------------------- | -------- |
| **WasteLoggingScreen.tsx**                   | Kitchen staff logs waste incidents                         | DEN 2-3  |
| **DetailedKPIScreen.tsx**                    | Manager views advanced analytics (before/after case study) | DEN 3-4  |
| **AlertsScreen.tsx** or AlertBadge component | Real-time expiry/waste alerts                              | DEN 4    |

---

## 4. ZMIANY W PLIKÓW ISTNIEJĄCYCH

### Navigation - Entry Point:

**Obecnie**: App.tsx → RootNavigator → [LandingScreen, LoginScreen, ...]
**Zmiana**: App.tsx → RootNavigator → LoginScreen (as entry point)

- Usuń LandingScreen z RootNavigator
- Ustaw LoginScreen jako default screen
- Plik: `src/navigation/RootNavigator.tsx`

### Database Configuration:

**Obecnie**: SQLite
**Zmiana**: PostgreSQL

- Plik: `backend/src/database.ts`
- Dodaj `pg` driver do `backend/package.json` (już istnieje)
- Zmień DSN z `sqlite://` na `postgres://`

### React Navigation - Types:

Usuń z `src/navigation/types.ts`:

```typescript
// Usuń te screens z RootStackParamList
"Suggestions";
"Landing";
"Inventory";
"Tabs";
"MainMenu";
"RecipeCreation";
"AddToFridge";
"RecipeModal";
```

Zachowaj:

```typescript
"Login";
"Register";
"Dashboard";
"Inventory";
"Suggestions";
"Account";
"WasteLogging"; // Nowy
"DetailedKPI"; // Nowy
"Alerts"; // Nowy
```

---

## 5. FILE STRUCTURE - BEFORE & AFTER

### BEFORE (Consumer + B2B mixed):

```
src/
  screens/          (15 screens - MIX)
    ├─ Consumer:    SuggestionsScreen, LandingScreen, InventoryScreen, ...
    └─ B2B:         DashboardScreen, InventoryScreen, LoginScreen, ...
  components/       (6 components - MIX)
    ├─ Consumer:    CategoryFilter, MealTypeFilter, EmojiPicker
    └─ B2B:         Layout, RecipeCard
  data/             (1 file)
    ├─ Consumer:    recipes.ts
  hooks/            (2 hooks)
    ├─ Consumer:    useKeyboardDismissGesture, useSwipeGestures
```

### AFTER (B2B only):

```
src/
  screens/          (9 screens - CLEAN B2B)
    ├─ Auth:        LoginScreen, RegisterScreen
    ├─ Manager:     DashboardScreen, DetailedKPIScreen, AlertsScreen
    ├─ Inventory:   InventoryScreen
    ├─ Suggestions: MenuSuggestionsScreen
    ├─ Kitchen:     WasteLoggingScreen
    └─ Account:     AccountScreen
  components/       (3 components - REUSABLE)
    ├─ Layout.tsx
    ├─ RecipeCard.tsx    (reuse dla menu suggestions)
    └─ AppHeader.tsx     (reuse dla B2B screens)
  navigation/       (CLEAN)
    ├─ RootNavigator.tsx
    ├─ types.ts
    └─ HeaderContextProvider.ts (renamed)
  api/              (1 file)
    └─ client.ts
  state/            (1 file)
    └─ AppStateContext.tsx
  storage/          (1 file)
    └─ persistence.ts
  types/            (1 file)
    └─ domain.ts
  theme.ts          (1 file)
  utils/            (2 files)
    ├─ formatting.ts
    └─ recipeMatching.ts
```

---

## 6. BACKEND STRUCTURE - No changes needed

Backend jest czysty i B2B-focused. Jedyna zmiana to SQLite → PostgreSQL (konfiguracja, nie struktura).

```
backend/
  src/
    ├─ models/                ✅ 7 encji
    ├─ routes/                ✅ 6 modules
    ├─ services/              ✅ 2 services
    ├─ middleware/            ✅ Auth JWT
    ├─ database.ts            ⚠️ SQLite → PostgreSQL (DSN change only)
    └─ server.ts              ✅ Express + WebSocket
```

---

## 7. DOKŁADNA LISTA AKCJI CLEANUP

### Krok 1: Usuń zbędne pliki

```bash
# Screens
rm src/screens/SuggestionsScreen.tsx
rm src/screens/LandingScreen.tsx
rm src/screens/InventoryScreen.tsx
rm src/screens/TabsScreen.tsx
rm src/screens/MainMenuScreen.tsx
rm src/screens/RecipeCreationScreen.tsx
rm src/screens/AddToFridgeModal.tsx
rm src/screens/RecipeModal.tsx

# Components
rm src/components/CategoryFilter.tsx
rm src/components/MealTypeFilter.tsx
rm src/components/EmojiPicker.tsx

# Data
rm src/data/recipes.ts
rm -rf src/data

# Hooks
rm src/hooks/useKeyboardDismissGesture.ts
rm src/hooks/useSwipeGestures.ts
rm -rf src/hooks
```

### Krok 2: Zmień navigation

- Edytuj: `src/navigation/RootNavigator.tsx`
- Usuń: imports wszystkich consumer screens
- Ustaw: LoginScreen jako default/initial route

### Krok 3: Zmień types

- Edytuj: `src/navigation/types.ts`
- Usuń: wszystkie consumer screen types z `RootStackParamList`
- Dodaj: `WasteLogging`, `DetailedKPI`, `Alerts`

### Krok 4: Zmień database

- Edytuj: `backend/src/database.ts`
- Zmień: DSN z SQLite na PostgreSQL

---

## 8. IMPACT ASSESSMENT

| Zmiana                     | Impact                        | Ryzyko  | Difficulty |
| -------------------------- | ----------------------------- | ------- | ---------- |
| Usuwanie consumer screens  | Wysoki - zmniejsza complexity | Niskie  | Łatwe      |
| Migracja SQLite→PostgreSQL | Średni - konfiguracja         | Średnie | Średnie    |
| Dodanie WasteLoggingScreen | Krytyczny - nowy feature      | Niskie  | Średnie    |
| Dodanie DetailedKPIScreen  | Wysokie - dla case study      | Niskie  | Trudne     |
| Zmiana entry point         | Niski - tylko navigation      | Niskie  | Łatwe      |

**Całkowity czas**: ~3-4 godziny cleanup + 15-20 godzin nowych features = 18-24 godziny

---

## 9. CHECKLIST GOTOWOŚCI DO PRACY

Po cleanup-ie, projekt będzie gotów gdy:

- [ ] Wszystkie consumer screens usunięte
- [ ] Wszystkie consumer components usunięte
- [ ] Navigation zaktualizowana (LoginScreen entry point)
- [ ] database.ts używa PostgreSQL
- [ ] Nowe screens stworzone (Waste, KPI, Alerts)
- [ ] WebSocket zintegrowany z UI
- [ ] Case study data seeded
- [ ] Wszystkie flows testowane (auth → dashboard → kpi)

---

**Status**: Gotów do implementacji  
**Kolejny krok**: Plan działania - 7-dniowy roadmap (DEN 1-7)
