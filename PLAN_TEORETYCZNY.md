# PLAN DZIAŁANIA - CZĘŚĆ TEORETYCZNA (Pracy Licencjackiej)

**Łączny czas**: ~5 dni intensywnie (6-8 godzin dziennie)  
**Deadline**: Koniec 10 dni  
**Format**: ~25 stron + diagramy UML

---

## STRUKTURA PRACY (ROAD MAP)

```
WSTĘP (1.5 strony)
    ├─ Hook: "W Polsce marnujemy 9 mln ton żywności rocznie"
    ├─ Problem statement: Restauracje tracą 5-15% przychodów na marnotrawstwie
    ├─ Cel pracy: Opracować system IT do redukcji food waste w HoReCa
    ├─ Pytanie badawcze: Jak inteligentne dopasowywanie menu zmniejszy
    │                     marnowanie i zwiększy marżę?
    └─ Struktura pracy (krótko)

│
ROZDZIAŁ 1: PRZEGLĄD LITERATURY (4 strony)
│   ├─ 1.1 Marnowanie żywności - skala problemu
│   │   └─ TABELA 1: Food Waste Statistics
│   │   └─ TABELA 2: HoReCa Financial Impact
│   │
│   ├─ 1.2 Zarządzanie łańcuchem dostaw w gastronomii
│   │   └─ TABELA 9: Supply Chain Integration Points
│   │
│   ├─ 1.3 Metody prognozowania popytu
│   │   └─ TABELA 3: Demand Forecasting Methods
│   │
│   ├─ 1.4 Revenue Management & Menu Engineering
│   │   └─ TABELA 4: Revenue Management Strategies
│   │
│   └─ 1.5 Regulacje i compliance
│       └─ TABELA 10: Regulatory Compliance

│
ROZDZIAŁ 2: ANALIZA PROBLEMU BIZNESOWEGO (2 strony)
│   ├─ 2.1 Stan branży HoReCa w Polsce
│   │   ├─ Liczba restauracji (dane GUS)
│   │   ├─ Średnia rentowność
│   │   └─ Główne wyzwania
│   │
│   ├─ 2.2 Konkretne problemy restauracji
│   │   ├─ Brak widoczności zapasów
│   │   ├─ Statyczne menu
│   │   ├─ Wysoki waste
│   │   ├─ Brak insight w rentowność
│   │   └─ Brak standaryzacji
│   │
│   ├─ 2.3 Brakujące rozwiązania rynkowe
│   │   ├─ Istniejące systemy (ograniczenia)
│   │   ├─ Luka w rynku
│   │   └─ Szansa biznesowa
│   │
│   └─ 2.4 Potencjał rynkowy
│       └─ TAM/SAM/SOM analysis

│
ROZDZIAŁ 3: METODOLOGIA & ROZWIĄZANIE (4 strony)
│   ├─ 3.1 Architektura systemu (z diagramami UML)
│   │   ├─ USE CASE DIAGRAM (1 strona)
│   │   ├─ CLASS DIAGRAM (1 strona)
│   │   ├─ ER DIAGRAM (0.5 strony)
│   │   ├─ TABELA 5: System Implementation Checklist
│   │   └─ TABELA 7: Technology Stack Evaluation
│   │
│   ├─ 3.2 Moduły funkcjonalne
│   │   ├─ Inventory Management
│   │   ├─ Recipe Database
│   │   ├─ Waste Tracking
│   │   ├─ Smart Menu Suggestions
│   │   └─ Analytics & Reporting
│   │
│   ├─ 3.3 Algorytm rekomendacji menu
│   │   ├─ Scoring system (pseudokod)
│   │   ├─ Czynniki (stock, expiry, margin, demand)
│   │   ├─ TABELA 8: Waste Reduction Methods
│   │   └─ Przykłady kalkulacji
│   │
│   └─ 3.4 Integrations (future roadmap)
│       ├─ POS systems
│       ├─ Supplier APIs
│       └─ Kitchen Display Systems

│
ROZDZIAŁ 4: IMPLEMENTACJA - MVP (2 strony)
│   ├─ 4.1 Tech Stack (backend, frontend, database)
│   │   ├─ Node.js + Express
│   │   ├─ React Native (existing)
│   │   ├─ PostgreSQL
│   │   └─ Uwagi na temat wyboru
│   │
│   ├─ 4.2 Kluczowe komponenty
│   │   ├─ Authentication
│   │   ├─ Inventory API
│   │   ├─ Menu Suggestion Engine
│   │   └─ Analytics Service
│   │
│   ├─ 4.3 Interfejs użytkownika
│   │   ├─ Manager Dashboard (screenshot)
│   │   ├─ Waste Analytics (screenshot)
│   │   ├─ Menu Suggestions (screenshot)
│   │   └─ Inventory View (screenshot)
│   │
│   └─ 4.4 Wdrażanie w praktyce
│       └─ Kroky rollout (training, adoption)

│
ROZDZIAŁ 5: CASE STUDY - WALIDACJA (3 strony)
│   ├─ 5.1 Opis scenariusza (Bistro Na Rogu)
│   │   ├─ Charakterystyka restauracji
│   │   ├─ Menu (35 dań)
│   │   ├─ Персонаl (5 osób)
│   │   └─ Dane historyczne (6 miesięcy - syntetyczne)
│   │
│   ├─ 5.2 Baseline - Stan przed systemem
│   │   ├─ Waste: 8%
│   │   ├─ Margin: 60%
│   │   ├─ Monthly revenue: 25,000 PLN
│   │   ├─ Monthly waste cost: 2,560 PLN
│   │   └─ Identyfikacja problemów
│   │
│   ├─ 5.3 Wdrożenie systemu (symulacja)
│   │   ├─ Faza 1-2: Setup data
│   │   ├─ Faza 3-4: Włączenie rekomendacji
│   │   ├─ Faza 5-6: Analytics & learning
│   │   └─ Timeline (6 monthly phases)
│   │
│   ├─ 5.4 Wyniki (po 6 miesiącach z systemem)
│   │   ├─ TABELA 6: KPI Metrics Before/After
│   │   ├─ Waste reduction: 8% → 5% (-3% = -960 PLN/month)
│   │   ├─ Margin improvement: 60% → 62% (+500 PLN/month)
│   │   ├─ Revenue from better decisions: +1,500 PLN/month
│   │   ├─ Staff efficiency: +200 PLN/month
│   │   └─ Total benefit: +2,160 PLN/month
│   │
│   ├─ 5.5 Analiza ROI
│   │   ├─ System cost Year 1: 10,600 PLN
│   │   ├─ System benefit Year 1: 26,000 PLN
│   │   ├─ Net benefit: 15,400 PLN
│   │   ├─ Payback period: 3-4 miesiące
│   │   ├─ ROI Year 1: 145%
│   │   └─ Break-even analysis
│   │
│   └─ 5.6 Wnioski z case study
│       ├─ Walidacja hipotezy
│       ├─ Ograniczenia studium
│       └─ Skalowalna do innych restauracji?

│
ROZDZIAŁ 6: MODEL BIZNESOWY (1.5 strony)
│   ├─ 6.1 Go-to-Market Strategy
│   │   ├─ Segment docelowy: restauracje 50-200 pokryć/dzień
│   │   ├─ Pricing model: SaaS 300-500 PLN/miesiąc/location
│   │   ├─ Customer acquisition (partnerships, word of mouth)
│   │   └─ Timeline ekspansji
│   │
│   ├─ 6.2 Competitive Advantage
│   │   ├─ Proprietary algorithms
│   │   ├─ Real-time data integration
│   │   ├─ Easy implementation (work with existing data)
│   │   └─ Proven ROI
│   │
│   ├─ 6.3 Monetization Beyond SaaS
│   │   ├─ Data insights (anonymized, sold to suppliers)
│   │   ├─ Supply chain optimization reports
│   │   ├─ Integration fees
│   │   └─ Premium features (ML forecasting, etc.)
│   │
│   └─ 6.4 Ryzyka i mitigation
│       ├─ Data privacy (GDPR)
│       ├─ Integration challenges
│       ├─ User adoption
│       └─ Regulatory changes

│
PODSUMOWANIE & REKOMENDACJE (1.5 strony)
│   ├─ 6.1 Główne rezultaty
│   │   ├─ System może zmniejszyć waste o 20-30%
│   │   ├─ ROI 140-150% w Year 1
│   │   ├─ Payback 2-4 miesiące
│   │   └─ Skalowalne na wiele restauracji
│   │
│   ├─ 6.2 Dalsze możliwości
│   │   ├─ ML forecasting (z więcej danych)
│   │   ├─ Multi-location chains
│   │   ├─ Catering & event management
│   │   └─ Sustainability reporting
│   │
│   ├─ 6.3 Perspektywy biznesowe
│   │   ├─ TAM: miliardowy rynek HoReCa
│   │   ├─ Primeira mover advantage w Polsce
│   │   ├─ Potencjał ekspansji międzynarodowej
│   │   └─ Szansa dla tech startupów
│   │
│   └─ 6.4 Rekomendacje dla kolejnych prac
│       ├─ Real-world pilot w restauracji
│       ├─ Rozszerzenie do ML modelów
│       ├─ Sustainability impact study
│       └─ Multi-location case studies

│
BIBLIOGRAFIA (1-2 strony)
│   └─ 25-30 pozycji (academic papers + industry reports)
│       ├─ FAO publications
│       ├─ EU regulations
│       ├─ Supply Chain Management journals
│       ├─ Revenue Management papers
│       ├─ Case studies HoReCa
│       └─ Tech reports (Node.js, PostgreSQL, React)
```

---

## SZCZEGÓŁOWY PLAN CZASU - CZĘŚĆ TEORETYCZNA

### **DEN 1 (4-6 godzin): Research & Struktura**

```
📋 ZADANIA:
1. ✅ Zebranie 25-30 źródeł (15 min)
   └─ FAO, EU Directive, academic papers (Google Scholar), HoReCa reports
2. ✅ Wstęp (30 min) - hook + problem statement + pytanie badawcze
3. ✅ Część teoretyczna - skeleton (2 h)
   └─ Przeczytać abstracts, wybrać kluczowe punkty
4. ✅ Tabele 1-2-9-10 (1 h)
   └─ Stworzyć draft ze statystykami
5. ✅ Przygotowanie danych do case study (1 h)
   └─ Wybrać KPIs, dane wejściowe Bistro

💾 OUTPUT:
- Google Doc draft z wstępem
- Folder z 25-30 PDF źródeł
- Spreadsheet z KPI danymi
```

### **DEN 2 (5-6 godzin): Zaawansowana Teoria**

```
📋 ZADANIA:
1. ✅ Rozdział 1: Przegląd Literatury (3 h)
   ├─ 1.1 Marnowanie żywności (0.5 h)
   │   └─ Dane statystyczne + TABELA 1
   ├─ 1.2 Supply Chain (0.5 h)
   │   └─ TABELA 9
   ├─ 1.3 Forecasting (0.5 h)
   │   └─ TABELA 3
   ├─ 1.4 Revenue Management (0.5 h)
   │   └─ TABELA 4
   └─ 1.5 Regulatory (0.5 h)
       └─ TABELA 10

2. ✅ Rozdział 2: Analiza Problemu (2 h)
   ├─ Stan branży HoReCa
   ├─ 5 problemów restauracji
   ├─ Brakujące rozwiązania
   └─ Potencjał rynkowy (TAM/SAM)

💾 OUTPUT:
- 4 strony napisanego tekstu (1.1-1.5 + 2.1-2.4)
- 5 wypełnionych tabel
- 10-15 zaznaczonych źródeł
```

### **DEN 3 (5-6 godzin): Architektura & UML**

```
📋 ZADANIA:
1. ✅ Diagramy UML (3 h)
   ├─ USE CASE DIAGRAM (0.5 h) - draw.io
   ├─ CLASS DIAGRAM (1 h) - draw.io
   ├─ ER DIAGRAM (0.5 h) - draw.io
   ├─ SEQUENCE DIAGRAM (0.5 h) - draw.io
   └─ DATA FLOW DIAGRAM (0.5 h) - draw.io

2. ✅ Rozdział 3: Metodologia (2 h)
   ├─ 3.1 Architektura + diagramy + TABELA 5, 7
   ├─ 3.2 Moduły funkcjonalne (opisowo)
   ├─ 3.3 Algorytm + TABELA 8 + pseudokod
   └─ 3.4 Future integrations

3. ✅ Export diagrams (0.5 h)
   └─ PNG + embedding w Word/Google Docs

💾 OUTPUT:
- 4 diagramy UML (PNG)
- 3 tabele (5, 7, 8)
- 3 strony tekstu Rozdziału 3
- Pseudokod algorytmu
```

### **DEN 4 (5-6 godzin): Case Study & ROI**

```
📋 ZADANIA:
1. ✅ Case Study - Część 1 (2 h)
   ├─ 5.1 Opis Bistro Na Rogu (30 min)
   ├─ 5.2 Baseline data & problemy (0.5 h)
   ├─ 5.3 Symulacja wdrożenia (1 h)
   └─ Przygotowanie danych do kalkulacji

2. ✅ Case Study - Część 2 (2 h)
   ├─ 5.4 Wyniki (z TABELA 6)
   ├─ 5.5 Analiza ROI (kalkulacje)
   └─ 5.6 Wnioski

3. ✅ Model Biznesowy - Szkic (1 h)
   ├─ 6.1 Go-to-market
   ├─ 6.2 Competitive advantage
   ├─ 6.3 Monetization
   └─ 6.4 Ryzyka

💾 OUTPUT:
- 3 strony Case Study
- TABELA 6 z danymi
- 1 strona Model Biznesowy (draft)
- Kalkulacje ROI w Excelu
```

### **DEN 5 (4-5 godzin): Finalizacja & Bibliografia**

```
📋 ZADANIA:
1. ✅ Uzupełnienie modelu biznesowego (1 h)
   └─ Pełne 1.5 strony

2. ✅ Podsumowanie & Rekomendacje (1 h)
   └─ 1.5 strony

3. ✅ Bibliografia (1 h)
   ├─ Zbieranie wszystkich 25-30 źródeł
   ├─ Formatowanie (APA/Harvard)
   └─ Cross-references w tekście

4. ✅ Proofreading & Polish (1-1.5 h)
   ├─ Gramatyka
   ├─ Spójność
   ├─ Numery stron
   ├─ Spis treści
   └─ Formatting

5. ✅ Final checks
   ├─ Wszystkie diagramy embedded
   ├─ Wszystkie tabele sformatowane
   ├─ Wszystkie linki do źródeł
   └─ PDF export

💾 OUTPUT:
- Kompletna praca (~25 stron)
- 10 tabel
- 5 diagramów UML
- 30 cytowanych źródeł
- PDF final version
```

---

## DELIVERABLES - CZĘŚĆ TEORETYCZNA

```
✅ WSTĘP (1.5 strony)
✅ ROZDZIAŁ 1 - Przegląd Literatury (4 strony + 5 tabel)
✅ ROZDZIAŁ 2 - Analiza Problemu (2 strony)
✅ ROZDZIAŁ 3 - Metodologia (4 strony + 5 diagramów UML + 3 tabele)
✅ ROZDZIAŁ 4 - Implementacja MVP (2 strony + screenshots)
✅ ROZDZIAŁ 5 - Case Study (3 strony + 1 tabela)
✅ ROZDZIAŁ 6 - Model Biznesowy (1.5 strony)
✅ PODSUMOWANIE (1.5 strony)
✅ BIBLIOGRAFIA (1-2 strony, 30 źródeł)

RAZEM: ~25 stron + 10 tabel + 5 diagramów UML
```

---

## NARZĘDZIA & ZASOBY

```
📝 Writing:
- Google Docs (albo Word - choice yours)
- Grammarly (free version)

📊 Tabele & Wykresy:
- Google Sheets (lub Excel)
- Pode eksportować do PNG

📐 Diagramy UML:
- draw.io (https://draw.io)
- Albo Lucidchart free tier

📚 Źródła:
- Google Scholar (scholar.google.com)
- FAO Food Loss Portal
- ResearchGate
- Academia.edu
- Government statistics (GUS - główny urząd statystyczny)

📖 Templates:
- University thesis template (twoja uczelnia powinna mieć)
- Cytat style: APA albo Harvard (sprawdź wymogi)
```

---

## CHECKPOINT - KONTROLA JAKOŚCI

```
PRZED ODDANIEM:

□ Czy każdy rozdział ma wyraźne wstępy i podsumowania?
□ Czy wszystkie tabele są odsyłane w tekście?
□ Czy wszystkie diagramy UML są opisane?
□ Czy każde dane/statystyki mają źródło?
□ Czy bibliografia ma 25-30 pozycji?
□ Czy spis treści jest autoupdate?
□ Czy numery stron są poprawne?
□ Czy case study jest realistyczne?
□ Czy ROI kalkulacje są sprawdzalne?
□ Czy język jest akademicki ale zrozumiały?
□ Czy praca odpowiada na wstępne pytania badawcze?
```
