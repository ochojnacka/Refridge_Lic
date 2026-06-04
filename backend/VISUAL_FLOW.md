# 📊 VISUAL FLOW - PostgreSQL Setup

```
┌─────────────────────────────────────────────────────────────────┐
│                    POSTGRESQL SETUP FLOW                         │
└─────────────────────────────────────────────────────────────────┘

ETAP 1: PostgreSQL Installation
═════════════════════════════════════════════════════════════════

    Download PostgreSQL             [Pobranie]
         ↓
    postgresql-16.x-windows-x64.exe [Installer]
         ↓
    Uruchom installer
    ├─ Port: 5432 ✓
    ├─ Admin password: postgres ✓
    └─ Language: English ✓
         ↓
    ✅ PostgreSQL installed


ETAP 2: Create Database + User (PowerShell Terminal 1)
═════════════════════════════════════════════════════════════════

    PS C:\Users\oliwi>
         ↓
    psql -U postgres
         ├─ Password: postgres
         ↓
    postgres=#
         ├─ CREATE USER refridge_user WITH PASSWORD 'SecurePass123!';
         ├─ ✅ CREATE ROLE
         ↓
    postgres=#
         ├─ ALTER ROLE refridge_user WITH CREATEDB;
         ├─ ✅ ALTER ROLE
         ↓
    postgres=#
         ├─ CREATE DATABASE refridge_dev OWNER refridge_user;
         ├─ ✅ CREATE DATABASE
         ↓
    postgres=#
         ├─ \l  (sprawdź listę - powinna być refridge_dev)
         ├─ ✅ refridge_dev | refridge_user
         ↓
    \q
         ↓
    PS C:\Users\oliwi>


ETAP 3: Test Connection
═════════════════════════════════════════════════════════════════

    PS C:\Users\oliwi>
         ↓
    psql -U refridge_user -d refridge_dev -h localhost
         ├─ Password: SecurePass123!
         ↓
    refridge_dev=>
         ├─ ✅ SUCCESS! (jesteś zalogowany)
         ↓
    \q
         ↓
    PS C:\Users\oliwi>


ETAP 4: Backend Setup (Terminal 1)
═════════════════════════════════════════════════════════════════

    PS C:\Users\oliwi>
         ↓
    cd Desktop/Refridge_Licencjat/Refridge_Lic/backend
         ↓
    PS ...\backend>
         ├─ npm install
         ├─ (~2 min czekania...)
         ├─ ✅ up to date
         ↓
    npm run dev
         ├─ (~5 sec czekania...)
         ├─ ✅ PostgreSQL Database connected successfully
         ├─ 📊 Database: refridge_dev @ localhost:5432
         ├─ 🚀 Server running on http://localhost:3000
         ↓
    [Backend wciąż running w tym terminallu]


ETAP 5: Seed Data (Terminal 2 - NOWY PowerShell!)
═════════════════════════════════════════════════════════════════

    [Otwórz DRUGI PowerShell]
         ↓
    PS C:\Users\oliwi>
         ↓
    cd Desktop/Refridge_Licencjat/Refridge_Lic/backend
         ↓
    PS ...\backend>
         ├─ npm run seed
         ├─ (~20 sec czekania...)
         ├─ ✅ 1 restaurant created: Bistro Na Rogu
         ├─ ✅ 2 users created
         ├─ ✅ 8 inventory items created
         ├─ ✅ 6 recipes created
         ├─ ✅ 824 sales records created (6 months!)
         ├─ ✅ 91 waste logs created
         ├─ 📊 Total Revenue: 65,089 PLN
         ├─ 📊 Profit Margin: 71.73%
         ├─ ✅ Seeding completed successfully!
         ↓
    [Seed data załadowana do PostgreSQL]


═════════════════════════════════════════════════════════════════
✅ ALL DONE! Backend ready with 6 months of data!
═════════════════════════════════════════════════════════════════

Terminal 1: Backend running (npm run dev)
Terminal 2: Seed completed
PostgreSQL: refridge_dev database z danymi
API ready: http://localhost:3000

Next: DEN 2-3 - WasteLoggingScreen
```

---

## 📱 Terminal View - Jak to wygląda w praktyce

### Terminal 1 - Backend:

```
PS C:\Users\oliwi\Desktop\Refridge_Licencjat\Refridge_Lic\backend> npm run dev

> refridge-pro-backend@1.0.0 dev
> ts-node-dev --respawn src/server.ts

[INFO] ts-node-dev ver. 2.0.0 (using ts-node ver. 10.9.1, typescript ver. 5.2.2)
[INFO] Running in single-file mode

✅ PostgreSQL Database connected successfully
📊 Database: refridge_dev @ localhost:5432
🚀 Server running on http://localhost:3000

✅ Health check: GET http://localhost:3000/health
```

### Terminal 2 - Seed:

```
PS C:\Users\oliwi\Desktop\Refridge_Licencjat\Refridge_Lic\backend> npm run seed

> refridge-pro-backend@1.0.0 seed
> ts-node seed/mockData.ts

📊 Database initialized for seeding

✅ 1 restaurant created: Bistro Na Rogu
✅ 2 users created:
   - manager@bistro.pl (role: manager)
   - chef@bistro.pl (role: chef)

✅ 8 inventory items created:
   - Pomodori (kg) - 10.50 PLN/kg
   - Mozzarella (kg) - 22.00 PLN/kg
   - Pasta (kg) - 2.80 PLN/kg
   - Salmon (kg) - 45.00 PLN/kg
   - Chicken (kg) - 18.00 PLN/kg
   - Eggs (pcs) - 0.50 PLN/pc
   - Olive Oil (l) - 25.00 PLN/l
   - Tomatoes (kg) - 4.50 PLN/kg

✅ 6 recipes created:
   - Spaghetti Carbonara (69.6% margin)
   - Margherita Pizza (72.4% margin)
   - Grilled Salmon (71.3% margin)
   - Chicken Stir-Fry (68.5% margin)
   - House Salad (65.0% margin)
   - Risotto (70.2% margin)

✅ 824 sales records created (6 months of data)
   - Mon-Thu: 20-30 covers/day
   - Fri-Sun: 40-60 covers/day
   - Peak: Saturday 18:00-21:00 (50 covers)

✅ 91 waste logs created
   - Vegetables: 8-12% waste/week
   - Dairy: 10-15% waste/week
   - Meat: 5-10% waste/week

📊 Summary:
   Total Revenue: 65,089 PLN
   Total Profit: 46,687 PLN
   Profit Margin: 71.73%
   Total Waste: ~2,400 PLN (~3.7%)

✅ Seeding completed successfully!
PS C:\Users\oliwi\Desktop\Refridge_Licencjat\Refridge_Lic\backend>
```

---

## 🎯 Checkpoint

Gdy skończysz, powinna mieć:

✅ PostgreSQL uruchomiony na localhost:5432  
✅ refridge_dev database z refridge_user  
✅ Backend running na http://localhost:3000  
✅ 6 miesięcy syntetycznych danych załadowanych  
✅ 824 sale records do analizy  
✅ 91 waste logs do case study

**Wszystko gotowe do DEN 2-3: WasteLoggingScreen** 🚀
