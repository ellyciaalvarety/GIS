# Quick Reference - Laravel Poverty Statistics API

## Installation (Choose ONE)

### Option 1: Windows Users

```cmd
setup.bat
```

### Option 2: macOS/Linux Users

```bash
chmod +x setup.sh && ./setup.sh
```

### Option 3: Manual Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
```

## Run the Application

```bash
php artisan serve
```

Then visit: **http://localhost:8000**

## Test the API

### Using curl:

```bash
# Get all provinces
curl http://localhost:8000/api/provinces

# Get specific province
curl http://localhost:8000/api/provinces/1

# Search provinces
curl http://localhost:8000/api/provinces/search?q=java

# Get top provinces
curl http://localhost:8000/api/provinces/top?semester=1

# Get statistics
curl http://localhost:8000/api/statistics/summary
```

### Using Postman:

1. Create new collection
2. Add GET requests to:
   - http://localhost:8000/api/provinces
   - http://localhost:8000/api/provinces/1
   - http://localhost:8000/api/provinces/search?q=aceh
   - http://localhost:8000/api/statistics/summary

## Project Structure

```
app/
  ├── Http/Controllers/Api/ProvinceController.php   (API endpoints)
  ├── Http/Resources/                               (Response formatting)
  ├── Models/Province.php, Semester.php             (Database models)
  ├── Services/ProvinceService.php                  (Business logic)
  ├── Repositories/                                 (Data access)
  └── Providers/AppServiceProvider.php              (DI bindings)

database/
  ├── migrations/                                   (Schema)
  ├── seeders/                                      (CSV data import)
  └── database.sqlite                               (SQLite database)

routes/
  ├── api.php                                       (API routes)
  └── web.php                                       (Web routes)

config/
  ├── database.php                                  (DB config)
  ├── app.php                                       (App config)
  └── cache.php, mail.php, queue.php

resources/
  └── views/welcome.html                            (Home page)
```

## Key Files

- **README.md** - Project overview
- **INSTALL.md** - Detailed installation guide
- **ARCHITECTURE.md** - Code architecture
- **PROJECT_SUMMARY.md** - Complete project summary
- **setup.bat** - Windows automatic setup
- **setup.sh** - Linux/macOS automatic setup
- **data/poverty-statistics.csv** - Original CSV data

## Database Info

- **Type:** SQLite (no external DB needed)
- **File:** database/database.sqlite
- **Tables:** provinces, semesters
- **Records:** 34 provinces × 2 semesters = 68 records
- **Year:** 2025 (Semester 1: March, Semester 2: September)

## API Response Example

```json
{
  "data": {
    "id": 1,
    "name": "Aceh",
    "population": 56959,
    "semester_1": {
      "misery_count": 676247,
      "percentage": 1188.89
    },
    "semester_2": {
      "misery_count": 715103,
      "percentage": 1255.09
    }
  }
}
```

## Useful Commands

```bash
php artisan route:list              # View all routes
php artisan migrate:fresh --seed    # Reset database
php artisan tinker                  # Interactive shell
php artisan serve --port=8001       # Use different port
composer dump-autoload              # Regenerate autoloader
```

## Architecture Patterns

1. **Repository Pattern** - Data access abstraction
2. **Service Layer** - Business logic encapsulation
3. **Resource Classes** - API response formatting
4. **Dependency Injection** - Constructor injection
5. **Eloquent ORM** - Object-relational mapping

## Support

- PHP 8.1+
- Composer installed
- 200MB disk space minimum
- No MySQL/PostgreSQL needed (SQLite included)

## Status

✅ Ready to run
✅ All dependencies included in composer.json
✅ All data pre-seeded
✅ Complete API implementation
✅ Clean code architecture

---

**Questions?** Check INSTALL.md or ARCHITECTURE.md
