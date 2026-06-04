# 🆘 TROUBLESHOOTING - Rozwiązywanie Problemów

Najczęstsze problemy i dokładne rozwiązania.

---

## ❌ PROBLEM 1: "psql: command not found"

### Diagnoza:

```powershell
psql --version
# Output: psql: command not found
```

### Przyczyna:

PostgreSQL nie dodane do PATH systemu.

### Rozwiązanie A: Tymczasowy fix (na jedną sesję PowerShell)

```powershell
# Dodaj PostgreSQL do PATH:
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"

# Sprawdź czy działa:
psql --version
# Output: psql (PostgreSQL) 16.1 ✅
```

### Rozwiązanie B: Trwały fix (na zawsze)

1. Kliknij **Start**
2. Wpisz: `environment variables`
3. Kliknij **"Edit the system environment variables"**
4. Kliknij **"Environment Variables"** (przycisk)
5. W **"System variables"** - kliknij **"Path"** i **"Edit"**
6. Kliknij **"New"**
7. Wpisz: `C:\Program Files\PostgreSQL\16\bin`
8. Kliknij **"OK"** 3 razy
9. **Restart PowerShell** (zamknij i otwórz nowe)
10. Test: `psql --version` ✅

---

## ❌ PROBLEM 2: "password authentication failed"

### Diagnoza:

```powershell
psql -U postgres
# Output: password authentication failed for user "postgres"
```

### Przyczyna:

Zły password.

### Rozwiązanie:

#### Opcja A: Resetuj password admina (postgres)

Jeśli zapomnisz password dla `postgres` user-a:

1. Otwórz **C:\Program Files\PostgreSQL\16\data\pg_hba.conf** (notepad)
2. Znajdź linię:
   ```
   # IPv4 local connections:
   host    all             all             127.0.0.1/32            md5
   ```
3. Zmień `md5` na `trust`:
   ```
   host    all             all             127.0.0.1/32            trust
   ```
4. Zapisz plik
5. Restart PostgreSQL:
   ```powershell
   Restart-Service -Name postgresql-x64-16
   ```
6. Teraz zaloguj się bez password:
   ```powershell
   psql -U postgres
   ```
7. W PostgreSQL, resetuj password:
   ```sql
   ALTER USER postgres WITH PASSWORD 'newpassword123';
   \q
   ```
8. Zmień z powrotem **pg_hba.conf**: `trust` → `md5`
9. Restart:
   ```powershell
   Restart-Service -Name postgresql-x64-16
   ```

#### Opcja B: Sprawdź czy wpisałeś dobrze

Pamiętaj:

- Administrator (postgres) ma inny password niż refridge_user
- `refridge_user` password to: `SecurePass123!`
- `postgres` password to: `postgres` (chyba że zmieniłeś)

### Weryfikacja:

```powershell
# Zaloguj się dobrze:
psql -U postgres
# Password: postgres

# Wewnątrz PostgreSQL:
\du
# Powinna widzieć listy user-ów - check czy refridge_user istnieje
# Jeśli go brakuje - przejdź do KROK 4 z głównego guide-u

\q
```

---

## ❌ PROBLEM 3: "could not connect to server"

### Diagnoza:

```powershell
psql -U postgres
# Output: could not connect to server: No such file or directory
#         Is the server running locally and accepting connections
#         on Unix domain socket "/var/run/postgresql/.s.PGSQL.5432"?
```

### Przyczyna:

PostgreSQL service nie uruchomiony.

### Rozwiązanie:

```powershell
# Sprawdź status:
Get-Service -Name postgresql-x64-16

# Status: Stopped? Uruchom go:
Start-Service -Name postgresql-x64-16

# Czekaj ~5 sekund

# Sprawdź czy uruchomiony:
Get-Service -Name postgresql-x64-16
# Status powinien być: Running ✅

# Teraz spróbuj logowania:
psql -U postgres
```

---

## ❌ PROBLEM 4: "database refridge_dev already exists"

### Diagnoza:

```
ERROR: database "refridge_dev" already exists
```

### Przyczyna:

Baza już istnieje (np. z poprzedniej instalacji).

### Rozwiązanie:

To nie problem! Po prostu:

```powershell
# Przejdź bezpośrednio do kroku 13:
npm run dev

# Backend się podłączy do istniejącej bazy
```

**JEŚLI** chcesz wyczyścić bazę i zacząć od nowa:

```powershell
# W PostgreSQL jako admin:
psql -U postgres

# Wewnątrz:
DROP DATABASE refridge_dev;
# Output: DROP DATABASE ✅

# Teraz utwórz nową:
CREATE DATABASE refridge_dev OWNER refridge_user;
# Output: CREATE DATABASE ✅

\q
```

---

## ❌ PROBLEM 5: "npm run seed" nie znajduje API

### Diagnoza:

```
Error: connect ECONNREFUSED 127.0.0.1:3000
```

### Przyczyna:

Backend nie uruchomiony.

### Rozwiązanie:

```powershell
# Upewnij się że Terminal 1 ma `npm run dev` uruchomiony
# Jeśli nie:

cd backend
npm run dev

# Czekaj aż zobaczysz:
# ✅ PostgreSQL Database connected successfully
# 🚀 Server running on http://localhost:3000

# POTEM w Terminal 2:
npm run seed
```

---

## ❌ PROBLEM 6: "Cannot find module 'typeorm'"

### Diagnoza:

```
Error: Cannot find module 'typeorm'
```

### Przyczyna:

Dependencies nie zainstalowane.

### Rozwiązanie:

```powershell
cd backend
npm install

# Czekaj ~2 min
# Output: up to date, audited 730 packages ✅

npm run dev
```

---

## ❌ PROBLEM 7: "Port 3000 already in use"

### Diagnoza:

```
Error: listen EADDRINUSE: address already in use :::3000
```

### Przyczyna:

Inny proces już zajmuje port 3000.

### Rozwiązanie:

```powershell
# Znajdź co zajmuje port 3000:
netstat -ano | findstr :3000

# Output będzie coś jak:
# TCP  0.0.0.0:3000  0.0.0.0:0  LISTENING  12345

# Zabij proces (12345 to PID):
taskkill /PID 12345 /F

# Teraz spróbuj:
npm run dev
```

---

## ❌ PROBLEM 8: Seed data nie załadowała się całkowicie

### Diagnoza:

```
Seeding completed successfully!
✅ 1 restaurant created
❌ Ale brakuje danych...
```

### Przyczyna:

Seed script się przerwa/skrzyżował z backendem.

### Rozwiązanie:

```powershell
# Opcja A: Clearuj bazę i restart
psql -U postgres

postgres=# DROP DATABASE refridge_dev;
postgres=# CREATE DATABASE refridge_dev OWNER refridge_user;
postgres=# \q

# Teraz:
npm run seed
```

---

## ✅ WERYFIKACJA - Jak sprawdzić czy wszystko działa

### Test 1: PostgreSQL running?

```powershell
psql -U refridge_user -d refridge_dev -h localhost
# Password: SecurePass123!
# Powinnaś widzieć: refridge_dev=>
\q
```

### Test 2: Backend running?

```powershell
# Otwórz przeglądarkę:
http://localhost:3000/health

# Powinna zobaczyć:
# {"status":"OK","timestamp":"2026-06-04T10:00:00.000Z"}
```

### Test 3: Database ma dane?

```powershell
psql -U refridge_user -d refridge_dev

# Wewnątrz:
SELECT COUNT(*) FROM restaurants;
# Output: 1 ✅

SELECT COUNT(*) FROM sales;
# Output: 824 ✅

SELECT COUNT(*) FROM waste_logs;
# Output: 91 ✅

\q
```

---

## 🆘 Jeśli nic nie pomaga:

1. Restart komputera
2. Odinstaluj PostgreSQL:
   - Control Panel > Uninstall a program > PostgreSQL
   - Kliknij "Uninstall"
   - Restart komputer
3. Zainstaluj PostgreSQL od nowa (patrz główny guide)
4. Przejdź przez setup od początku

---

## 📞 Debug Info - Zbierz informacje

Jeśli problem się nie rozwiąże, zbierz:

```powershell
# 1. PostgreSQL version:
psql --version

# 2. PostgreSQL status:
Get-Service -Name postgresql-x64-16

# 3. Backend logs (Terminal 1):
# Skopiuj ostatnie 20 linii z "npm run dev"

# 4. Seed logs (Terminal 2):
# Skopiuj wyjście z "npm run seed"

# Wyślij mi te info
```

---

**🎯 Jeśli problem się nie rozwiąże - daj znać, przejdziemy razem!** 💪
