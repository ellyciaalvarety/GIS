<!-- Use this file to provide workspace-specific custom instructions to Copilot. -->

# Laravel Poverty Statistics Application

This is a Laravel application for analyzing Indonesian poverty statistics data.

## Setup Instructions

1. **Requirements**: PHP 8.1+, Composer, MySQL/SQLite
2. **Install dependencies**: `composer install`
3. **Copy environment**: `cp .env.example .env`
4. **Generate app key**: `php artisan key:generate`
5. **Run migrations**: `php artisan migrate --seed`
6. **Start development server**: `php artisan serve`
7. **Access application**: http://localhost:8000

## Project Structure

- Models: `app/Models/` - Eloquent models for data
- Controllers: `app/Http/Controllers/` - Application logic
- Migrations: `database/migrations/` - Database schema
- Seeders: `database/seeders/` - CSV data import
- Routes: `routes/web.php` and `routes/api.php`

## Clean Code Practices

- Single Responsibility Principle applied to all classes
- Dependency Injection in controllers
- Repository pattern for data access
- Validation in Form Requests
- Resource classes for API responses
