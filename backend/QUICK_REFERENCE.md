# ⚡ QUICK REFERENCE - PostgreSQL Setup (Copy/Paste)

**Czas**: ~15 minut | **Aplikacja**: PowerShell | **Folder**: Dowolny na start, potem `backend/`

---

## 📋 QUICK STEPS

### Terminal 1: Setup Database

```powershell
# 1. Loguj się jako admin PostgreSQL
psql -U postgres
# Password: postgres (lub to co ustawiłeś)

# Teraz jesteś w PostgreSQL (postgres=#)
# Wklej całość i wciśnij ENTER po każdej linijce:

CREATE USER refridge_user WITH PASSWORD 'SecurePass123!';
ALTER ROLE refridge_user WITH CREATEDB;
CREATE DATABASE refridge_dev OWNER refridge_user;

# Weryfikacja (powinnaś widzieć refridge_dev):
\l

# Wyjdź:
\q
```

### Terminal 1: Test Połączenia

```powershell
# Test czy user się mówi zalogować:
psql -U refridge_user -d refridge_dev -h localhost
# Password: SecurePass123!

# Jeśli widzisz "refridge_dev=>" - SUCCESS!
# Wyjdź:
\q
```

### Terminal 1: Uruchom Backend

```powershell
# Przejdź do backend:
cd Desktop/Refridge_Licencjat/Refridge_Lic/backend

# Zainstaluj dependencies:
npm install

# Uruchom backend:
npm run dev

# Powinna zobaczyć:
# ✅ PostgreSQL Database connected successfully
# 🚀 Server running on http://localhost:3000

# Teraz backend wisi w tym terminallu - normalnie!
```

### Terminal 2 (NOWY PowerShell!): Seed Data

```powershell
# W NOWYM PowerShell (nie w tym co backend):
cd Desktop/Refridge_Licencjat/Refridge_Lic/backend

# Załaduj 6 miesięcy syntetycznych danych:
npm run seed

# Czekaj ~20 sekund, powinna zobaczyć:
# ✅ Seeding completed successfully!
# ✅ Total Revenue: 65,089 PLN
```

---

## ✅ Sukces Criteria

| Komenda                    | Spodziewany Output                        |
| -------------------------- | ----------------------------------------- |
| `psql -U postgres`         | `postgres=#`                              |
| `CREATE USER...`           | `CREATE ROLE`                             |
| `CREATE DATABASE...`       | `CREATE DATABASE`                         |
| `\l`                       | `refridge_dev \| refridge_user` na liście |
| `psql -U refridge_user...` | `refridge_dev=>`                          |
| `npm run dev`              | `✅ PostgreSQL Database connected`        |
| `npm run seed`             | `✅ Seeding completed successfully!`      |

---

## 🆘 Błędy + Fixes

| Błąd                             | Fix                                                   |
| -------------------------------- | ----------------------------------------------------- |
| `psql: command not found`        | `$env:Path += ";C:\Program Files\PostgreSQL\16\bin"`  |
| `password authentication failed` | Sprawdź password w .env (SecurePass123!) vs installer |
| `could not connect to server`    | `Start-Service -Name postgresql-x64-16`               |
| `database already exists`        | OK, idź do `npm run dev`                              |

---

## 🎯 Next: DEN 2-3 WasteLoggingScreen

Po sukcesie seed-owania - powiemy:

- Stworzenie WasteLoggingScreen.tsx
- Kitchen staff loguje marnotrawstwo
- API integration

---

**Copy/paste komendy wyżej i daj znać jak skończysz!** ✅
