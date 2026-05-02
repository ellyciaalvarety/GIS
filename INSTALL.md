# Installation & Running Guide

## Prerequisites

- **PHP 8.1+** - [Download](https://www.php.net/downloads)
- **Composer** - [Download](https://getcomposer.org/download/)
- **Git** (optional)

## Quick Start

### 1. Automatic Setup (Recommended)

**Windows:**

```bash
cd c:\semester 4\Ws. SIG\informasik
setup.bat
```

**macOS/Linux:**

```bash
cd "c:\semester 4\Ws. SIG\informasik"
chmod +x setup.sh
./setup.sh
```

### 2. Manual Setup

```bash
# 1. Install dependencies
composer install

# 2. Copy environment file
cp .env.example .env

# 3. Generate application key
php artisan key:generate

# 4. Create database
mkdir -p database
touch database/database.sqlite

# 5. Run migrations
php artisan migrate

# 6. Seed data
php artisan db:seed
```

### 3. Start Development Server

```bash
php artisan serve
```

The application will be available at: **http://localhost:8000**

## API Endpoints

### Get All Provinces

```bash
curl http://localhost:8000/api/provinces
```

### Get Specific Province

```bash
curl http://localhost:8000/api/provinces/1
```

### Search Provinces

```bash
curl http://localhost:8000/api/provinces/search?q=Aceh
```

### Get Top Provinces by Poverty

```bash
# Semester 1, top 10
curl http://localhost:8000/api/provinces/top?semester=1&limit=10

# Semester 2, top 5
curl http://localhost:8000/api/provinces/top?semester=2&limit=5
```

### Get Statistics Summary

```bash
curl http://localhost:8000/api/statistics/summary
```

## Using with Postman

1. Open Postman
2. Create a new request collection
3. Add requests:

| Method | URL                                                | Description   |
| ------ | -------------------------------------------------- | ------------- |
| GET    | http://localhost:8000/api/provinces                | List all      |
| GET    | http://localhost:8000/api/provinces/1              | Get by ID     |
| GET    | http://localhost:8000/api/provinces/search?q=java  | Search        |
| GET    | http://localhost:8000/api/provinces/top?semester=1 | Top provinces |
| GET    | http://localhost:8000/api/statistics/summary       | Summary       |

## Troubleshooting

### Issue: "PHP command not found"

**Solution:** Install PHP or add it to your PATH environment variable

### Issue: "Composer command not found"

**Solution:** Install Composer from https://getcomposer.org

### Issue: Database migration fails

**Solution:** Ensure the `database` folder exists and is writable:

```bash
mkdir -p database
chmod 755 database
```

### Issue: "Class not found" errors

**Solution:** Regenerate autoloader:

```bash
composer dump-autoload
```

### Issue: Port 8000 already in use

**Solution:** Use a different port:

```bash
php artisan serve --port=8001
```

## Useful Commands

```bash
# View all routes
php artisan route:list

# Run fresh migrations (careful!)
php artisan migrate:fresh --seed

# Clear all caches
php artisan cache:clear

# Clear routes cache
php artisan route:cache

# Start tinker (interactive shell)
php artisan tinker

# View application health
curl http://localhost:8000/up
```

## Development Tips

1. **Enable Query Logging** - Add to routes/api.php:

```php
\DB::listen(function ($query) {
    \Log::info($query->sql, $query->bindings);
});
```

2. **API Testing** - Use Thunder Client VS Code extension or Postman

3. **Database Reset** - Start fresh:

```bash
php artisan migrate:fresh --seed
```

4. **View Eloquent Queries** - Enable debug mode in .env:

```
APP_DEBUG=true
```

## Production Deployment

For production deployment:

1. Set `APP_ENV=production` in .env
2. Set `APP_DEBUG=false` in .env
3. Run: `composer install --no-dev --optimize-autoloader`
4. Run: `php artisan config:cache`
5. Run: `php artisan route:cache`

## Support Files

- **README.md** - Project overview
- **ARCHITECTURE.md** - Code architecture and patterns
- **composer.json** - Dependencies
- **.env.example** - Environment variables template
- **setup.bat** - Windows setup script
- **setup.sh** - Linux/macOS setup script
