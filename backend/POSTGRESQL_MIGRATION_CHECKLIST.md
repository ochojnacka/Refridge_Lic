# ✅ POSTĘP DEN 1-2: PostgreSQL Migration

**Status**: 3/4 done ✓

---

## ✅ Ukończone:

### 1. Update `.env` file (DONE ✓)

```env
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=refridge_user
DATABASE_PASSWORD=SecurePass123!
DATABASE_NAME=refridge_dev
```

### 2. Update `backend/src/database.ts` (DONE ✓)

- Zmieniono typ z `sqlite` na `postgres`
- Konfiguracja z `.env` zmiennych
- TypeScript kompilacja: ✅ OK

---

## ⏳ TODO: Instalacja PostgreSQL (Krok 4)

Teraz musisz zainstalować PostgreSQL na swoim komputerze.

### OPCJA A: Instalacja z GUI (2-5 minut)

**1. Pobierz PostgreSQL:**

- Wejdź: https://www.postgresql.org/download/windows/
- Pobierz najnowszą wersję (16.x)
- Plik: `postgresql-16.X-windows-x64.exe`

**2. Uruchom installer:**

```
postgresql-16.X-windows-x64.exe
```

**3. Konfiguracja (GUI wizard):**

- Port: 5432 (default)
- Password dla `postgres` user: `postgres` (pamiętaj!)
- Locale: [Default locale]
- Instalacja zajmie ~2 minuty

**4. Finish**

---

### OPCJA B: Instalacja via Chocolatey (1 minuta)

Jeśli masz Chocolatey:

```powershell
choco install postgresql --params '/Password:postgres'
```

---

## Krok 2: Utwórz User + Database

Po instalacji otwórz **PowerShell** i:

```powershell
# Połącz się z PostgreSQL (default admin)
psql -U postgres

# Jeśli pyta o password: wpisz "postgres" (lub inny co ustawiłeś)
```

W PostgreSQL prompt wpisz:

```sql
-- Utwórz user dla aplikacji
CREATE USER refridge_user WITH PASSWORD 'SecurePass123!';

-- Daj uprawnienia
ALTER ROLE refridge_user WITH CREATEDB;

-- Utwórz database
CREATE DATABASE refridge_dev OWNER refridge_user;

-- Weryfikacja (powinnaś zobaczyć refridge_dev na liście)
\l

-- Wyjdź
\q
```

---

## Krok 3: Test Połączenia

W PowerShell:

```powershell
# Połącz się nowym user-em (nie postgres)
psql -U refridge_user -d refridge_dev -h localhost

# Jeśli się połączysz, zobaczysz:
# refridge_dev=>

# Wyjdź:
\q
```

Jeśli te 3 komendy się powiodły ✅ - PostgreSQL jest prawidłowo skonfigurowany!

---

## Krok 4: Backend Test

```powershell
cd backend
npm run dev

# Powinnaś zobaczyć:
# ✅ PostgreSQL Database connected successfully
# 📊 Database: refridge_dev @ localhost:5432
# 🚀 Server running on http://localhost:3000
```

---

## Troubleshooting

| Błąd                                            | Rozwiązanie                                          |
| ----------------------------------------------- | ---------------------------------------------------- |
| `psql: command not found`                       | Dodaj PostgreSQL do PATH (patrz POSTGRESQL_SETUP.md) |
| `password authentication failed`                | Sprawdź password w .env vs co ustawiłeś w GUI        |
| `could not connect to server`                   | Uruchom: `Start-Service -Name postgresql-x64-16`     |
| `ERROR: database "refridge_dev" already exists` | Dobry sign! Skip kroku "CREATE DATABASE"             |

---

## Co Dalej (Po sukcesie)?

Jak się podłączy do PostgreSQL:

```powershell
cd backend

# Seed 6 miesięcy danych dla case study
npm run seed

# Powinnaś zobaczyć:
# ✅ Database initialized for seeding
# ✅ 1 restaurant created
# ✅ 2 users created
# ✅ 8 inventory items created
# ... itd
```

Jeśli `npm run seed` działa = **BACKEND READY** ✓

---

## Następny Krok: DEN 2-3

Po sukcesie PostgreSQL + seed:

- [ ] DEN 2-3: Stworzyć **WasteLoggingScreen** dla kitchen staff

---

**🚀 Jesteś gotów na PostgreSQL instalację?**

Gdy skończysz setup, wróć tutaj i daj mi znać "Done" - wtedy przejdziemy do seed-owania danych!
