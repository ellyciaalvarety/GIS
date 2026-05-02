# Project Structure

```
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/ProvinceController.php
│   │   ├── Requests/
│   │   └── Resources/
│   │       ├── ProvinceResource.php
│   │       └── ProvinceCollection.php
│   ├── Models/
│   │   ├── Province.php
│   │   └── Semester.php
│   ├── Services/
│   │   └── ProvinceService.php
│   ├── Repositories/
│   │   ├── ProvinceRepositoryInterface.php
│   │   └── ProvinceRepository.php
│   └── Providers/
│       └── AppServiceProvider.php
├── database/
│   ├── migrations/
│   │   ├── 2024_01_01_000001_create_provinces_table.php
│   │   └── 2024_01_01_000002_create_semesters_table.php
│   └── seeders/
│       ├── DatabaseSeeder.php
│       └── PovertyStatisticsSeeder.php
├── routes/
│   ├── api.php
│   └── web.php
├── config/
│   ├── app.php
│   ├── database.php
│   ├── cache.php
│   ├── mail.php
│   └── queue.php
├── bootstrap/
│   └── app.php
├── resources/
│   └── views/
│       └── welcome.html
├── storage/
│   └── (framework cache, logs, etc)
├── .env.example
├── composer.json
├── artisan
└── README.md
```

## Architecture Patterns

### 1. Repository Pattern

- Abstraction layer for data access
- Easy to test and swap implementations
- Dependency injection through interface

### 2. Service Layer

- Business logic separation
- Reusable services for controllers
- Complex operations encapsulation

### 3. Resource Classes

- Consistent API response formatting
- Data transformation and filtering
- Type-safe responses

### 4. Dependency Injection

- Constructor injection in controllers
- Container bindings in AppServiceProvider
- Loose coupling and high testability

## API Responses

### Success Response

```json
{
  "data": [
    {
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
  ],
  "meta": {
    "total": 34
  }
}
```

### Statistics Response

```json
{
  "data": {
    "total_provinces": 34,
    "total_population": 5838000,
    "semester_1": {
      "misery_count": 21234567,
      "percentage": 364.02
    },
    "semester_2": {
      "misery_count": 22456789,
      "percentage": 384.67
    },
    "trend": 5.74
  }
}
```

## Database Schema

### Provinces Table

- id (PK)
- name (unique)
- population
- created_at
- updated_at

### Semesters Table

- id (PK)
- province_id (FK → provinces)
- semester (1 or 2)
- year
- misery_count
- created_at
- updated_at

Unique constraint: (province_id, semester, year)
