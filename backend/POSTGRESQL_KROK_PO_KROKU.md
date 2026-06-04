# 📖 SZCZEGÓŁOWY KROK PO KROKU - PostgreSQL Setup + Seed Data

**Dla**: Po zainstalowaniu PostgreSQL Community Edition  
**Czas**: ~15 minut  
**Trudność**: Łatwe - wystarczy kopij/wklej komendy

---

## 🔴 KROK 1: Otwórz PowerShell

### Gdzie?

1. **Kliknij Start** (lewy dolny róg)
2. Wpisz: `powershell`
3. Kliknij **"Windows PowerShell"** (NOT ISE)
4. Czekaj aż się otwiera terminal

**Terminal powinien wyglądać tak:**

```
PS C:\Users\oliwi>
```

✅ **Sukces**: Widzisz `PS C:\Users\oliwi>` = PowerShell otwarty

---

## 🔴 KROK 2: Sprawdź czy PostgreSQL się zainstalował

### Komenda:

```powershell
psql --version
```

### Co się powinno stać?

Powinna zobaczyć:

```
psql (PostgreSQL) 16.1
```

(Wersja może być inna: 15.x, 16.x, 17.x - OK)

**❌ JEŚLI:** `psql: command not found` - PostgreSQL nie zainstalowana prawidłowo

- **Rozwiązanie**: Dodaj do PATH (patrz sekcja "Troubleshooting")

✅ **Sukces**: Widzisz numer wersji

---

## 🟢 KROK 3: Połącz się z PostgreSQL jako admin

### Komenda:

```powershell
psql -U postgres
```

### Co się powinno stać?

Pyta o password. Wpisz password jaki ustawiłeś podczas instalacji.

**Jeśli podczas instalacji ustawiłeś password na "postgres":**

```
Password for user postgres: postgres
```

Po wpisaniu (nie zobaczysz znaków) kliknij **ENTER**.

### Czy się udało?

Powinna zobaczyć:

```
postgres=#
```

(Prompt zmienił się z `PS C:\...>` na `postgres=#`)

✅ **Sukces**: Jesteś zalogowany w PostgreSQL

---

## 🟢 KROK 4: Utwórz nowego użytkownika

### Jesteś w: `postgres=#`

### Komenda 1 - Utwórz user:

```sql
CREATE USER refridge_user WITH PASSWORD 'SecurePass123!';
```

**WAŻNE**:

- Całe `'SecurePass123!'` musi być w cudzysłowach
- Średnik `;` na koniec
- Copy/paste dokładnie

### Co się powinno stać?

```
CREATE ROLE
```

✅ **Sukces**: Zobaczysz `CREATE ROLE`

---

## 🟢 KROK 5: Daj uprawnienia użytkownikowi

### Jesteś w: `postgres=#`

### Komenda:

```sql
ALTER ROLE refridge_user WITH CREATEDB;
```

### Co się powinno stać?

```
ALTER ROLE
```

✅ **Sukces**: Zobaczysz `ALTER ROLE`

---

## 🟢 KROK 6: Utwórz bazę danych

### Jesteś w: `postgres=#`

### Komenda:

```sql
CREATE DATABASE refridge_dev OWNER refridge_user;
```

### Co się powinno stać?

```
CREATE DATABASE
```

✅ **Sukces**: Zobaczysz `CREATE DATABASE`

---

## 🟢 KROK 7: Weryfikacja - wylistuj wszystkie bazy

### Jesteś w: `postgres=#`

### Komenda:

```
\l
```

(To jest backslash + małe L, NOT jedynka)

### Co się powinno stać?

Zobaczysz tabelę ze wszystkimi bazami. Powinna byś znaleźć:

```
Name        │ Owner
────────────┼──────────────
refridge_dev│ refridge_user  ← TEJ SZUKASZ!
postgres    │ postgres
template0   │ postgres
template1   │ postgres
```

✅ **Sukces**: Widzisz `refridge_dev` na liście z owner `refridge_user`

---

## 🟢 KROK 8: Wyjdź z PostgreSQL

### Jesteś w: `postgres=#`

### Komenda:

```
\q
```

### Co się powinno stać?

Wróciłeś do PowerShell:

```
PS C:\Users\oliwi>
```

✅ **Sukces**: Jesteś z powrotem w normalnym PowerShell

---

## 🟢 KROK 9: Test - połącz się nowym user-em

### Jesteś w: `PS C:\Users\oliwi>`

### Komenda:

```powershell
psql -U refridge_user -d refridge_dev -h localhost
```

**Rozłożenie komendy:**

- `-U refridge_user` = user: refridge_user
- `-d refridge_dev` = database: refridge_dev
- `-h localhost` = host: localhost (twój komputer)

### Co się powinno stać?

Pyta o password:

```
Password for user refridge_user:
```

Wpisz: `SecurePass123!`

(Znowu nie zobaczysz znaków - to normalnie)

### Czy się udało?

Powinna zobaczyć:

```
refridge_dev=>
```

✅ **Sukces**: Jesteś zalogowany jako refridge_user do refridge_dev

---

## 🟢 KROK 10: Wyjdź z tego logowania

### Jesteś w: `refridge_dev=>`

### Komenda:

```
\q
```

### Co się powinno stać?

Wróciłeś do PowerShell:

```
PS C:\Users\oliwi>
```

✅ **Sukces**: Powrót do PowerShell

---

## 🟢 KROK 11: Przejdź do folderu backend

### Jesteś w: `PS C:\Users\oliwi>`

### Komenda:

```powershell
cd Desktop/Refridge_Licencjat/Refridge_Lic/backend
```

### Co się powinno stać?

Prompt zmienił się na:

```
PS C:\Users\oliwi\Desktop\Refridge_Licencjat\Refridge_Lic\backend>
```

✅ **Sukces**: Jesteś w folderze backend/

---

## 🟢 KROK 12: Zainstaluj zależności

### Jesteś w: `PS ...\backend>`

### Komenda:

```powershell
npm install
```

### Co się powinno stać?

Instalacja będzie trwać 1-2 minuty. Na koniec:

```
up to date, audited 730 packages in 4s
```

✅ **Sukces**: npm install sukces

---

## 🟢 KROK 13: Uruchom backend w trybie development

### Jesteś w: `PS ...\backend>`

### Komenda:

```powershell
npm run dev
```

### Co się powinno stać?

Backend uruchamia się. Czekaj ~5 sekund na to:

```
✅ PostgreSQL Database connected successfully
📊 Database: refridge_dev @ localhost:5432
🚀 Server running on http://localhost:3000
```

✅ **SUPER Sukces**: Backend działa na PostgreSQL!

**⚠️ WAŻNE**: Backend teraz wisi w terminallu - to normalnie. Będzie wysyłać logi.

---

## 🟢 KROK 14: Otwórz DRUGI PowerShell (niezbędny!)

### Gdzie?

1. **Kliknij Start**
2. Wpisz: `powershell`
3. Kliknij **"Windows PowerShell"** (nowe okno)

Teraz masz 2 PowerShelle otwarte:

- **Terminal 1**: Backend wciąż running (`npm run dev`)
- **Terminal 2**: Nowy - tutaj będziemy seedować

✅ **Sukces**: 2 PowerShelle otwarte

---

## 🟢 KROK 15: Przejdź do folderu backend (w Terminal 2)

### Jesteś w: `PS C:\Users\oliwi>` (w Terminal 2)

### Komenda:

```powershell
cd Desktop/Refridge_Licencjat/Refridge_Lic/backend
```

### Co się powinno stać?

```
PS C:\Users\oliwi\Desktop\Refridge_Licencjat\Refridge_Lic\backend>
```

✅ **Sukces**: Jesteś w backend/ (Terminal 2)

---

## 🟢 KROK 16: Załaduj seed data (6 miesięcy danych dla case study)

### Jesteś w: `PS ...\backend>` (Terminal 2)

### Komenda:

```powershell
npm run seed
```

### Co się powinno stać?

Seed script uruchamia się. Czekaj ~10-20 sekund. Na koniec powinna zobaczyć:

```
📊 Database initialized for seeding

✅ 1 restaurant created: Bistro Na Rogu
✅ 2 users created: manager@bistro.pl, chef@bistro.pl

✅ 8 inventory items created:
   - Pomodori (kg)
   - Mozzarella (kg)
   - Pasta (kg)
   - ...

✅ 6 recipes created:
   - Spaghetti Carbonara
   - Margherita Pizza
   - Grilled Salmon
   - ...

✅ 824 sales records created (6 months of data)
✅ 91 waste logs created

📊 Summary:
   - Total Revenue: 65,089 PLN
   - Total Profit: 46,687 PLN
   - Profit Margin: 71.73%
   - Total Waste: 2,400 PLN (~3.7%)

✅ Seeding completed successfully!
```

✅ **SUPER Sukces**: 6 miesięcy danych załadowane do PostgreSQL!

---

## 🟢 KROK 17: Weryfikuj że backend działa

### Usuń: Terminal 1 (gdzie `npm run dev` wisi)

W Terminal 1 (backend):

- Powinnaś widzieć logi że aplikacja żyje
- Jeśli coś się zawiesiło, wciśnij **Ctrl+C** aby zatrzymać

### Wznów backend po seedowaniu:

W Terminal 1, wciśnij **Ctrl+C** aby zatrzymać, a potem:

```powershell
npm run dev
```

Powinnaś zobaczyć:

```
✅ PostgreSQL Database connected successfully
📊 Database: refridge_dev @ localhost:5432
🚀 Server running on http://localhost:3000
```

✅ **Sukces**: Backend restartował się i wciąż żyje

---

## 📋 PODSUMOWANIE - CO ZROBIŁEŚ

| Krok | Komenda                                    | Co robi                       |
| ---- | ------------------------------------------ | ----------------------------- |
| 1-3  | `psql -U postgres`                         | Logowanie jako admin          |
| 4    | `CREATE USER refridge_user...`             | Tworzenie nowego user-a       |
| 5    | `ALTER ROLE refridge_user...`              | Daj uprawnienia               |
| 6    | `CREATE DATABASE refridge_dev...`          | Tworzenie bazy                |
| 7    | `\l`                                       | Weryfikacja listy baz         |
| 9    | `psql -U refridge_user -d refridge_dev...` | Test nowy user                |
| 13   | `npm run dev`                              | Uruchomienie backend-u        |
| 16   | `npm run seed`                             | Załadowanie 6 miesięcy danych |

---

## ✅ JESTEŚ GOTÓW NA DEN 2-3?

Po sukcesie seed-owania - **DEN 2-3: Stworzenie WasteLoggingScreen** 🎯

Co wtedy będziemy robić:

- Stworzenie nowego screen-u w React Native dla kitchen staff
- Logowanie marnotrawstwa produktów
- Integracja z API

**Status DEN 1-2**: ✅ **COMPLETE**

---

## 🆘 TROUBLESHOOTING

### Błąd: "psql: command not found"

```powershell
# Dodaj PostgreSQL do PATH tymczasowo:
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"

# Potem spróbuj:
psql --version
```

### Błąd: "password authentication failed"

```
# Sprawdź czy password zgadza się:
# - W .env: SecurePass123!
# - To co wpisałeś w installer: postgres (dla admin)

# Resetuj password user-a:
psql -U postgres
ALTER USER refridge_user WITH PASSWORD 'SecurePass123!';
\q
```

### Błąd: "database refridge_dev already exists"

```
# To OK - baza już istnieje
# Przejdź do KROKU 13 (npm run dev)
```

### Błąd: "could not connect to server"

```powershell
# PostgreSQL service nie uruchomiony
# Uruchom:
Start-Service -Name postgresql-x64-16

# Czekaj 5 sekund i spróbuj:
psql -U postgres
```

---

**✅ Powodzenia! Daj mi znać jak seed się powiódł!** 🚀
