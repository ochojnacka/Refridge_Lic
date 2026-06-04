# PostgreSQL Setup Guide - Windows

## Opcja 1: Zainstaluj PostgreSQL Community Edition (Recommended)

### Pobranie:

1. Wejdź na https://www.postgresql.org/download/windows/
2. Kliknij "Download the installer"
3. Pobierz najnowszą wersję (15.x lub 16.x)

### Instalacja:

1. Uruchom installer: `postgresql-16.1-1-windows-x64.exe`
2. Kliknij "Next" przez wszystkie kroki
3. **WAŻNE**: Gdy pyta o password dla `postgres` user:
   - Wpisz: `postgres` (lub cokolwiek, zapamiętaj!)
4. Port: Pozostaw 5432 (default)
5. Locale: `[Default locale]`
6. Kliknij "Install"
7. Po instalacji: Uncheck "Stack Builder" i kliknij "Finish"

### Weryfikacja instalacji:

```powershell
psql --version
# Output: psql (PostgreSQL) 16.1
```

---

## Opcja 2: Zainstaluj PostgreSQL via Chocolatey (Fast)

Jeśli masz Chocolatey zainstalowane:

```powershell
choco install postgresql --params '/Password:postgres'
```

Czekaj ~5 minut na instalację...

---

## Krok 2: Utwórz Database User + Database

Otwórz PowerShell i uruchom:

```powershell
# Połącz się z PostgreSQL jako admin
psql -U postgres

# Teraz jesteś w PostgreSQL prompt (postgres=#)
```

W PostgreSQL prompt wpisz te komendy:

```sql
-- Utwórz user
CREATE USER refridge_user WITH PASSWORD 'SecurePass123!';

-- Daj mu uprawnienia
ALTER ROLE refridge_user WITH CREATEDB;

-- Utwórz database
CREATE DATABASE refridge_dev OWNER refridge_user;

-- Weryfikacja
\l
# Powinnaś zobaczyć: refridge_dev | refridge_user

-- Wyjdź
\q
```

---

## Krok 3: Test Połączenia

```powershell
psql -U refridge_user -d refridge_dev -h localhost

# Jeśli się połączysz pomyślnie, zobaczysz prompt:
# refridge_dev=>

# Wyjdź:
\q
```

---

## Troubleshooting

### Błąd: "psql: command not found"

**Rozwiązanie**: Dodaj PostgreSQL do PATH

```powershell
# Dodaj do PATH:
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"

# Lub na stałe: System Properties > Environment Variables > PATH
```

### Błąd: "password authentication failed"

**Rozwiązanie**:

1. Sprawdź czy password w .env zgadza się z tym co ustawiłeś
2. Lub resetuj password:

```sql
ALTER USER refridge_user WITH PASSWORD 'NewPassword123!';
```

I zaktualizuj .env

### Błąd: "could not connect to server"

**Rozwiązanie**: Sprawdź czy PostgreSQL service jest uruchomiony

```powershell
Get-Service -Name postgresql-x64-16

# Jeśli nie uruchomiony:
Start-Service -Name postgresql-x64-16
```

---

## Krok 4: Test Backend Connection

Teraz zmień do backend/ i spróbuj:

```powershell
cd backend
npm run dev

# Powinnaś zobaczyć:
# ✅ PostgreSQL Database connected successfully
# 📊 Database: refridge_dev @ localhost:5432
# 🚀 Server running on http://localhost:3000
```

Jeśli to widzisz - **SUCCESS!** ✅

---

## Dane do seed-owania (po testowaniu connection):

```powershell
npm run seed
# To załaduje 6 months syntetycznych danych dla Bistro Na Rogu
```

---

## Polecane Tools (Optional):

### pgAdmin 4 (Visual Database Browser)

```powershell
choco install pgadmin4
# Otwiera UI do zarządzania PostgreSQL
# URL: http://localhost:5050
```

### DBeaver (IDE dla SQL)

```powershell
choco install dbeaver-community
# Superny SQL editor z visual query builder
```

---

**Status**: Ready to connect to PostgreSQL
