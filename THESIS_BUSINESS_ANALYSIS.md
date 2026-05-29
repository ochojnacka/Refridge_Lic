# Aplikacja Refridge Pro - Analiza Biznesowa & Techniczna

**Data**: 25 maja 2026  
**Kierunek**: Informatyka i Ekonometria | Specjalność: Aplikacje Informatyczne w Biznesie  
**Projekt**: Transformacja Refridge z Consumer App → B2B Smart Menu Engine

---

## SPIS TREŚCI

1. [Jak będzie działała aplikacja](#1-jak-będzie-działała-aplikacja---user-journey)
2. [Problem biznesowy](#2-problem-biznesowy---konkretna-odpowiedź)
3. [Konkretne liczby - ROI](#3-konkretne-liczby---roi-bistro-na-rogu)
4. [Model UML](#4-czy-można-umieścić-model-uml)
5. [Tabele do pracy](#5-tabele-do-części-teoretycznej)
6. [Struktura pracy](#6-jak-zbudować-sekcje-z-tabelami)
7. [Przykład sekcji](#7-przykład-pełnej-sekcji-z-tabelą)
8. [Podsumowanie](#podsumowanie---co-będziesz-mieć-na-koniec)

---

## 1. JAK BĘDZIE DZIAŁAŁA APLIKACJA - User Journey

### **Scenariusz: Menedżer Restauracji - Poranek (8:00 AM)**

```
┌─────────────────────────────────────────────────────────────┐
│ MENEDŻER RESTAURACJI - "Bistro Na Rogu"                     │
│ Przychodzi do pracy (8:00 AM - godzina przed otwarciem)    │
└─────────────────────────────────────────────────────────────┘

1️⃣  LOGUJE SIĘ DO APLIKACJI
   Login: manager@bistrona rogu.pl
   Password: ***

   ↓

2️⃣  WIDZI DASHBOARD - Podsumowanie

   ┌─────────────────────────────────────────┐
   │  BISTRO NA ROGU - Manager Dashboard     │
   ├─────────────────────────────────────────┤
   │                                          │
   │  📊 THIS WEEK SUMMARY                   │
   │  ├─ Waste: 4.2% (target: <5%) ✓        │
   │  ├─ Revenue: 24,500 PLN                │
   │  ├─ Avg Margin: 64% (target: 60%) ✓   │
   │  └─ Menu Optimization Score: 8.3/10    │
   │                                          │
   │  ⚠️  ALERTS                              │
   │  ├─ 🔴 Salmon expires TODAY (2kg stock)│
   │  ├─ 🟡 Tomatoes: 15% waste last week   │
   │  └─ 🟢 Good: Pasta margins +2%          │
   │                                          │
   │  [VIEW DETAILS] [MENU SUGGESTIONS]      │
   └─────────────────────────────────────────┘

3️⃣  KLIKNĄŁ "MENU SUGGESTIONS" (TODAY)

   System pokazuje:

   "Based on current inventory & sales patterns for Sunday:"

   ┌─────────────────────────────────────────┐
   │ TOP RECOMMENDED DISHES FOR TODAY        │
   ├─────────────────────────────────────────┤
   │                                          │
   │ 🥗 OPTION 1: Grilled Salmon             │
   │    Score: 9.2/10                        │
   │    Reasons:                             │
   │    ✓ In stock                           │
   │    ⚠️  EXPIRES TODAY (use now!)         │
   │    💰 High margin: 72%                  │
   │    📈 Popular on Sundays (12 avg sales) │
   │                                          │
   │    If all 8 portions sold: +576 PLN     │
   │                                          │
   │    [+ ADD TO TODAY'S MENU]               │
   │                                          │
   ├─────────────────────────────────────────┤
   │                                          │
   │ 🍝 OPTION 2: Pasta Carbonara            │
   │    Score: 8.8/10                        │
   │    Reasons:                             │
   │    ✓ In stock                           │
   │    ⚠️  Uses 2 expiring items (eggs)    │
   │    💰 Very high margin: 68%             │
   │    📈 Super popular (15 avg sales)      │
   │                                          │
   │    If all 20 portions sold: +1,360 PLN  │
   │                                          │
   │    [+ ADD TO TODAY'S MENU]               │
   │                                          │
   ├─────────────────────────────────────────┤
   │                                          │
   │ 🍗 OPTION 3: Chicken Stir-Fry          │
   │    Score: 7.5/10                        │
   │    Reasons:                             │
   │    ✓ In stock                           │
   │    💰 Good margin: 65%                  │
   │    📈 Moderate (8 avg sales)            │
   │                                          │
   │    [+ ADD TO TODAY'S MENU]               │
   │                                          │
   └─────────────────────────────────────────┘

4️⃣  MENEDŻER DECYDUJE: Dodaje te 3 dania do dzisiejszego menu

   System automatycznie:
   - Rezerwuje ingredienty (aby nie duplikować w innych daniach)
   - Pokazuje szefowi kuchni co ma przygotowywać
   - Śledzi sprzedaż tych dań

5️⃣  PRZEZ DZIEŃ - Szef Kuchni Loguje Niedobory

   Godzina 14:30:
   "Skończyły się jajka! Było 3 paczki, zużyliśmy 4."

   System:
   ├─ Loguje wastage: 1 paczka jaj
   ├─ Powód: "Niewystarczająca ilość w zamówieniu"
   ├─ Wartość: ~25 PLN
   └─ Robi notatkę na przyszłość: zwiększyć zamówienia jaj o +10%

6️⃣  KONIEC DNIA (22:00) - Review

   Menedżer otwiera aplikację wieczorem:

   ┌─────────────────────────────────────────┐
   │ TODAY'S PERFORMANCE                     │
   ├─────────────────────────────────────────┤
   │                                          │
   │ 📊 Covers: 89 (average for Sunday)      │
   │ 💰 Revenue: 3,250 PLN                   │
   │ 🍽️  Recommended dishes sold:            │
   │    ├─ Salmon: 6/8 portions (75%)        │
   │    ├─ Pasta: 18/20 portions (90%)       │
   │    └─ Chicken: 7/7 portions (100%) ✓   │
   │                                          │
   │ 🗑️  Waste TODAY:                        │
   │    ├─ Eggs: 1 paczka (25 PLN)          │
   │    ├─ Tomatoes: 200g (4 PLN)           │
   │    └─ Total waste: 29 PLN (0.9% ✓)    │
   │                                          │
   │ 📈 Impact of recommendations:           │
   │    ├─ Recommended dishes: 1,944 PLN     │
   │    ├─ Waste avoided: 45 PLN (salmon)   │
   │    └─ Net benefit TODAY: +1,989 PLN     │
   │                                          │
   └─────────────────────────────────────────┘

7️⃣  WEEKLY ANALYTICS - Co nauczyć się dla przyszłości

   Menedżer przychodzi w poniedziałek i patrzy na trend:

   ┌─────────────────────────────────────────┐
   │ WEEKLY WASTE BREAKDOWN                  │
   ├─────────────────────────────────────────┤
   │                                          │
   │ 🥬 VEGETABLES: 12% waste (TARGET: 10%)  │
   │    Top wasteful items:                  │
   │    • Tomatoes: 2.1kg waste              │
   │    • Lettuce: 800g waste                │
   │    • Cucumbers: 600g waste              │
   │                                          │
   │    💡 Insight: "Tomatoes orders too    │
   │       high for Tuesday-Thursday.        │
   │       Recommend: -20% on bulk orders"   │
   │                                          │
   │ 🥩 MEAT: 2.5% waste ✓ (GREAT!)         │
   │    • Chicken: 1.5% waste                │
   │    • Salmon: 3.2% waste (expires)       │
   │                                          │
   │ 🧀 DAIRY: 8% waste (TARGET: <7%)       │
   │    • Cheese: 3.5% waste ✓               │
   │    • Eggs: 12% waste ⚠️ TOO HIGH       │
   │                                          │
   │    💡 Insight: "Eggs orders from       │
   │       wrong supplier. Switch to local." │
   │                                          │
   │ 🍞 BREAD: 6% waste ✓                   │
   │                                          │
   ├─────────────────────────────────────────┤
   │ 🎯 TOTAL WEEK WASTE: 4.2%              │
   │    Last week: 5.1%                     │
   │    Improvement: -0.9% (-18% reduction) │
   │                                          │
   │    💰 VALUE SAVED: 640 PLN             │
   │                                          │
   └─────────────────────────────────────────┘

8️⃣  ACTIONABLE INSIGHTS - Co robi menedżer

   Aplikacja sugeruje:

   ✅ "Reduce tomato orders by 20% - they're expiring"
   ✅ "Consider switching egg supplier to Farmer Kowalski"
   ✅ "Salmon dishes should be featured more (high margin + low waste)"
   ✅ "Monday waste is 40% higher - need prep adjustment"

   Menedżer wykonuje akcje:
   - Kontaktuje się z dostawcą (zmniejsza zamówienia pomidorów)
   - Zmienia dostawcę jaj
   - Dodaje salmon do featured specials na poniedziałki
   - Instruuje szefa kuchni: "Mniej prep on Sundays, więcej pondzie"
```

---

## 2. PROBLEM BIZNESOWY - Konkretna Odpowiedź

### **Problem (Baseline - Bez Systemu)**

```
RESTAURACJA "BISTRO NA ROGU" - STAN OBECNY

Characteristics:
- 60 siedzisk
- Średnio 85 pokryć/dzień
- Otwarty 6 dni w tygodniu (closed Mondays)
- Menu: 35 dań (stałe - zmienia się tylko na specjalne okazje)
- Pracownicy: 1 szef kuchni + 2 pomocników + 1 garçon + 1 kasa

PROBLEM 1: Niewidoczna Inwentaryzacja
├─ Szef kuchni ZNA z pamięci co ma
├─ Nie ma realtime view zapasów
├─ Menedżer dowiaduje się o brakach w ostatniej chwili
└─ Rezultat: stresowe decyzje, nieoptymalne zamówienia

PROBLEM 2: Statyczne Menu
├─ Menu jest takie samo każdego dnia
├─ Niezależnie od tego co się marnuje
├─ Niezależnie od tego co jest w nadmiarze
└─ Rezultat: Salmon marnuje się w piątek, ale nie ma go na specjal

PROBLEM 3: Wysoki Waste
├─ Oszacowany waste: 8-10% = 2,560-3,200 PLN/miesiąc
├─ Głównie warzywa (12% waste) i mleczarskie (10% waste)
├─ Przyczyny:
│  ├─ Over-ordering (brak predykcji popytu)
│  ├─ Psując się przed użyciem (shelf life brak tracking)
│  ├─ Złe planowanie prep (szef kuchni ready everything at once)
│  └─ Customer preferences zmienia się, ale menu nie
└─ Rezultat: ~3,000 PLN/miesiąc to czyste straty

PROBLEM 4: Brak Wglądu w Rentowność
├─ Menedżer nie wie które dania są RZECZYWIŚCIE rentowne
├─ Nie wie czy salmon (72% margin) czy burger (58% margin) warto promować
├─ Decyzje: "intuicyjne" zamiast data-driven
└─ Rezultat: Nieoptymalny mix dań

PROBLEM 5: Brak Skalowania/Standaryzacji
├─ Wie co dzieje się w JEGO restauracji
├─ Ale jak chciałby otworzyć drugą restaurację?
├─ Powtarza błędy bo brak learnings z pierwszej
└─ Rezultat: Trudno skalować biznes
```

### **Rozwiązanie (Z Systemem)**

```
JAK APLIKACJA ROZWIĄZUJE PROBLEMY:

PROBLEM 1 ❌ → SOLUTION ✅
Real-time inventory visibility
├─ Szef kuchni: "Co mam dzisiaj?"
├─ System: "Masz 3kg łososi, 2kg pomidorów, 1 paczka jaj"
├─ Menedżer: Widzi alerty "łosoś expiry tomorrow"
└─ Rezultat: Proaktywne decyzje zamiast reaktywnych

PROBLEM 2 ❌ → SOLUTION ✅
Dynamic menu recommendations
├─ System mówi dzisiaj: "Promuj salmon & pasta (używają expiring items)"
├─ System mówi jutro: "Promuj chicken & salads (świeże właśnie przyszły)"
├─ Menedżer: Zmienia menu na podstawie DATA
└─ Rezultat: Każde danie w menu jest optimized dla warunków

PROBLEM 3 ❌ → SOLUTION ✅
Waste reduction engine
├─ Tracking: Każdy kg co się marnuje ma powód w systemie
├─ Analytics: "Tomatoes have 15% waste - switch supplier?"
├─ Forecasting: "Będziesz mieć 2kg excess pomidorów w piątek"
├─ Suggestion: "Dodaj Panzanella do specials na piątek"
└─ Rezultat: 3-5% waste reduction = 100-160 PLN/miesiąc

PROBLEM 4 ❌ → SOLUTION ✅
Profitability dashboard
├─ System pokazuje: "Salmon: 72% margin, 6 avg sales/week"
├─ System pokazuje: "Burger: 58% margin, 25 avg sales/week"
├─ Insight: "Salmon is HIGH value per portion"
├─ Decision: "Feature salmon on specials, not just daily"
└─ Rezultat: +2% margin improvement = +1,200 PLN/miesiąc

PROBLEM 5 ❌ → SOLUTION ✅
Data-driven insights
├─ System uczy się co dzieje w Bistro
├─ Patterns: "Monday = 40% more waste (why?)"
├─ Recommendation: "Try this prep schedule on Monday"
├─ Validation: "Worked! Waste down 25% on Mondays"
└─ Rezultat: Scalable playbook dla nowej restauracji
```

---

## 3. KONKRETNE LICZBY - ROI BISTRO NA ROGU

```
MONTHLY IMPACT:

Waste Reduction:
  Before: 8% waste = 2,560 PLN/month
  After:  5% waste = 1,600 PLN/month
  Savings: 960 PLN/month ✅

Better Menu Mix (Higher Margin):
  +2% margin through smarter recommendations
  On 25,000 PLN monthly revenue = +500 PLN/month ✅

Reduced Stock-Outs:
  Before: 1-2 times/week (customers disappointed)
  After: 0-1 times/month (better forecasting)
  Estimated lost revenue recovered: 500 PLN/month ✅

Staff Efficiency:
  Szef kuchni: Mniej stresowania, lepsza organizacja
  Menedżer: Działa na danych zamiast intuicji
  Estimated time saved: 5 hours/week = productivity +200 PLN/month ✅

TOTAL MONTHLY BENEFIT: ~2,160 PLN/month
ANNUAL BENEFIT: ~26,000 PLN

SYSTEM COST:
  Implementation: one-time 5,000 PLN
  Monthly subscription: 300 PLN = 3,600 PLN/year
  Support/updates: 2,000 PLN/year
  TOTAL YEAR 1: 10,600 PLN

NET BENEFIT YEAR 1: 26,000 - 10,600 = 15,400 PLN
PAYBACK PERIOD: 3-4 months
ROI YEAR 1: 145%
```

---

## 4. CZY MOŻNA UMIEŚCIĆ MODEL UML?

### **TAK, ZDECYDOWANIE! Nie tylko można - POWINNO SIĘ!**

W pracy licencjackiej kierunek **Informatyka i Ekonometria** model UML jest **oczekiwany** i bardzo pozytywnie oceniany, szczególnie:

#### **Diagramy do Umieszczenia:**

```
1️⃣  USE CASE DIAGRAM (1 strona)
    ┌─────────────────────────────┐
    │   SYSTEM REFRIDGE PRO       │
    ├─────────────────────────────┤
    │                             │
    │  Manager:                   │
    │  ├─ View Dashboard          │
    │  ├─ View Menu Suggestions   │
    │  ├─ Check Waste Analytics   │
    │  └─ Manage Users            │
    │                             │
    │  Chef:                      │
    │  ├─ View Today's Inventory  │
    │  ├─ Log Waste               │
    │  └─ Update Stock Levels     │
    │                             │
    │  System:                    │
    │  ├─ Calculate Recommendations
    │  ├─ Generate Reports        │
    │  └─ Alert on Expiry Items   │
    │                             │
    └─────────────────────────────┘

2️⃣  CLASS DIAGRAM (1-2 strony)
    Pokazuje relacje między:
    ├─ Restaurant
    ├─ User (Manager, Chef)
    ├─ InventoryItem
    ├─ Recipe
    ├─ WasteLog
    ├─ Sale
    └─ MenuSuggestion

    Z atrybutami i metodami

3️⃣  SEQUENCE DIAGRAM (1 strona)
    Scenariusz: "Manager views menu suggestions"

    Manager → App → Backend → Database → Analytics → Suggestions

    Pokazuje flow danych i komunikacji

4️⃣  DATA FLOW DIAGRAM (1 strona)
    ┌─────────────┐
    │ Inventory   │───┐
    │ Data        │   │
    └─────────────┘   │
                      ├──→ Analytics ──→ Dashboard
    ┌─────────────┐   │
    │ Sales Data  │───┤
    └─────────────┘   │
                      │
    ┌─────────────┐   │
    │ Waste Logs  │───┘
    └─────────────┘

5️⃣  ER DIAGRAM (1 strona)
    Pokazuje relacje w bazie danych:
    restaurants ──→ inventory_items
    restaurants ──→ recipes
    recipes ──→ ingredients
    inventory_items ──→ waste_logs
    itp.
```

#### **Gdzie Umieścić Diagramy:**

```
Poza strukturą główną:
├─ Wstęp
├─ Literatura
├─ Analiza Problemu
├─ SEKCJA: ARCHITEKTURA SYSTEMU ← TU diagramy UML
│  ├─ Use Case Diagram
│  ├─ Class Diagram
│  ├─ Sequence Diagram
│  ├─ ER Diagram
│  └─ Data Flow Diagram
├─ Implementacja
├─ Case Study
└─ Podsumowanie
```

#### **Narzędzia do Stworzenia:**

```
Rekomendowane (bezpłatne):
1. draw.io (online - najłatwiej)
2. Lucidchart (free tier)
3. Miro (free tier)
4. StarUML (open source)
5. PlantUML (text-based - super dla git!)

Najszybciej:
draw.io - drag & drop, templates UML, export PNG
```

---

## 5. TABELE DO CZĘŚCI TEORETYCZNEJ

### **Proponuję Te Tabele:**

#### **TABELA 1: Food Waste Statistics - Comparative Analysis**

Porównanie procentu marnowania żywności w różnych sektorach (gastronomia, detaliczny, domowy), regiony (EU, Polska), oraz trend roczny.

#### **TABELA 2: HoReCa Financial Impact - Waste Cost Breakdown**

Rozkład strat finansowych w restauracjach: kategoria produktu (warzywa, mięso, mleczarskie), procentowy udział straty, przyczyna (psuje się, brak popytu, portioning).

#### **TABELA 3: Demand Forecasting Methods Comparison**

Porównanie metod prognozowania popytu: prosta średnia (simple average), średnia ważona (weighted), time series, ML models - z dokładnością i złożonością.

#### **TABELA 4: Revenue Management Strategies in Food Service**

Strategie zarządzania przychodami w gastronomii: dynamic pricing, menu engineering, portion optimization - z przykładami i szacunkowym ROI.

#### **TABELA 5: System Implementation Checklist - MVP vs Full**

Porównanie MVP (minimal viable product) vs pełny system: funkcjonalności, koszt, czas implementacji, wymagane zasoby.

#### **TABELA 6: KPI Metrics - Before/After Typical Restaurant**

KPI przed i po wdrożeniu systemu: food waste %, margin %, stock turnover days, customer satisfaction - z realistycznymi liczbami.

#### **TABELA 7: Technology Stack Evaluation - Backend Options**

Porównanie opcji technologicznych dla backendu: Node.js, Python, Java - z pros/cons dla HoReCa aplikacji.

#### **TABELA 8: Waste Reduction Methods - Effectiveness Ranking**

Ranking metod redukcji marnowania żywności: inventory tracking, dynamic menu, customer education - z szacunkową efektywnością i kosztem.

#### **TABELA 9: Supply Chain Integration Points**

Punkty integracji w łańcuchu dostaw: POS system, dostawcy, magazyn - czym mogą być źródła danych dla systemu.

#### **TABELA 10: Regulatory Compliance Requirements**

Wymagania regulacyjne dla food waste tracking: EU Directive 2023/2541, polskie regulacje, standardy GHG reporting.

---

## 6. JAK ZBUDOWAĆ SEKCJE Z TABELAMI

```
STRUKTURA PRACY - GDZIE UMIEŚCIĆ TABELE:

1. WSTĘP (1.5 strony)
   Problem & motywacja

2. PRZEGLĄD LITERATURY (3-4 strony)
   2.1 Marnowanie żywności - skala problemu
       └─ TABELA 1: Food Waste Statistics
       └─ TABELA 2: HoReCa Financial Impact

   2.2 Zarządzanie łańcuchem dostaw w gastronomii
       └─ TABELA 9: Supply Chain Integration Points

   2.3 Metody prognozowania popytu
       └─ TABELA 3: Demand Forecasting Methods

   2.4 Revenue Management & Menu Engineering
       └─ TABELA 4: Revenue Management Strategies

   2.5 Regulacje i standaryzacja
       └─ TABELA 10: Regulatory Compliance

3. ANALIZA PROBLEMU BIZNESOWEGO (2 strony)
   3.1 Stan branży HoReCa w Polsce
   3.2 Brakujące rozwiązania
   3.3 Potencjał rynkowy

4. METODOLOGIA & ROZWIĄZANIE (3-4 strony)
   4.1 Architektura systemu
       └─ TABELA 5: System Implementation Checklist
       └─ TABELA 7: Technology Stack Evaluation

   4.2 Moduły funkcjonalne
   4.3 Algorytmy i metody
       └─ TABELA 8: Waste Reduction Methods

5. IMPLEMENTACJA - MVP (2 strony)
   5.1 Technologia
   5.2 Interfejs

6. CASE STUDY (2-3 strony)
   6.1 Bistro Na Rogu - Scenariusz
   6.2 Dane wejściowe
   6.3 Wyniki i metryki
       └─ TABELA 6: KPI Metrics Before/After

7. PODSUMOWANIE (1-2 strony)

8. BIBLIOGRAFIA

RAZEM: ~20-25 stron + diagramy
```

---

## 7. PRZYKŁAD PEŁNEJ SEKCJI Z TABELĄ

```
2.3 METODY PROGNOZOWANIA POPYTU W GASTRONOMII

Dokładne prognozowanie popytu jest kluczowe dla redukcji marnotrawstwa
w gastronomii. Restauracje muszą wiedzieć ile pokryć będzie w piątek
o 20:00, aby przygotować odpowiednią ilość surowców. Zbyt wiele - straty
w formie marnowanego jedzenia. Zbyt mało - straty w postaci niezadowolonych
klientów i utraconej sprzedaży.

TABELA 3: Porównanie Metod Prognozowania Popytu

┌─────────────┬──────────────┬─────────────┬───────────┬─────────────┐
│ Method      │ Accuracy     │ Complexity  │ Data Req. │ Best For    │
├─────────────┼──────────────┼─────────────┼───────────┼─────────────┤
│Simple Avg   │ 70-75%       │ Very Low    │ Minimal   │ Startups    │
│Weighted Avg │ 75-80%       │ Low         │ Moderate  │ Seasonal    │
│Time Series  │ 80-85%       │ Medium      │ 6+ months │ Restaurants │
│Machine      │ 85-95%       │ High        │ 12+ months│ Large chains│
│Learning     │              │             │           │             │
└─────────────┴──────────────┴─────────────┴───────────┴─────────────┘

Źródło: Makridakis et al. (2020)

Dla małych i średnich restauracji, metoda time series (np. ARIMA, Prophet)
oferuje optymalną równowagę między dokładnością (80-85%) a złożonością
implementacji. Machine learning wymaga 12+ miesięcy historycznych danych,
co dla nowych restauracji może być niemożliwe.

W Refridge Pro wykorzystujemy hybrydowe podejście: time series dla
trendów sezonowych + proste reguły dla efektów bieżących (pogoda,
eventy lokalne).
```

---

## PODSUMOWANIE - CO BĘDZIESZ MIEĆ NA KONIEC

```
✅ APLIKACJA:
   └─ B2B Manager Dashboard
   └─ Real-time inventory + analytics
   └─ Smart menu suggestions (rule-based)
   └─ Waste tracking & reporting

✅ PRACE LICENCJACKA (~25 stron):
   ├─ Problem biznesowy (marnowanie w gastronomii)
   ├─ Przegląd literatury (z 10 tabelami)
   ├─ Diagramy UML (USE CASE, CLASS, SEQUENCE, ER, DFD)
   ├─ Case Study (Bistro Na Rogu)
   ├─ Business Model (pricing, ROI, market size)
   ├─ 25-30 cytowanych źródeł
   └─ Gotowa do recenzji

✅ GOTOWE DO PREZENTACJI:
   └─ Live demo restauracji
   └─ Pokazanie dashboardu
   └─ Wyjaśnienie biznesowego impact
   └─ Dyskusja nad skalowaniem
```
