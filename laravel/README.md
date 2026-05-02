# Laravel Poverty Statistics Application

A clean, production-ready Laravel application for analyzing Indonesian poverty statistics data.

## Features

- **RESTful API** for poverty data access
- **Interactive Dashboard** displaying statistics by province
- **Data Visualization** with semester comparisons
- **Responsive Design** for all devices
- **Clean Code Architecture** following SOLID principles

## Quick Start

```bash
# 1. Install dependencies
composer install

# 2. Setup environment
cp .env.example .env
php artisan key:generate

# 3. Setup database
php artisan migrate --seed

# 4. Start development server
php artisan serve
```

Visit `http://localhost:8000` to access the application.

## API Endpoints

- `GET /api/provinces` - List all provinces with statistics
- `GET /api/provinces/{id}` - Get specific province data
- `GET /api/provinces/search?q=query` - Search provinces
- `GET /api/statistics/summary` - Get overall statistics

## Database Schema

### Provinces Table

- `id` - Primary key
- `name` - Province name
- `population` - Population in thousands
- `created_at` - Timestamp

### Semesters Table

- `id` - Primary key
- `province_id` - Foreign key
- `semester` - Semester number (1 or 2)
- `year` - Year
- `misery_count` - Count of misery statistics
- `created_at` - Timestamp

## Project Structure

```
app/
├── Models/              # Eloquent models
├── Http/
│   ├── Controllers/     # API and Web controllers
│   └── Resources/       # API response formatting
├── Services/            # Business logic
└── Repositories/        # Data access layer

database/
├── migrations/          # Schema definitions
└── seeders/            # Data seeders

routes/
├── api.php             # API routes
└── web.php             # Web routes
```

## Architecture

- **Repository Pattern** for data access abstraction
- **Service Layer** for business logic
- **Form Request Validation** for input validation
- **Resource Classes** for consistent API responses
- **Dependency Injection** throughout the application

## Technologies

- **Laravel 11** - Framework
- **SQLite** - Database (configurable)
- **Composer** - Package manager
- **PHP 8.1+** - Runtime

## License

MIT
