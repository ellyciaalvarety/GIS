# Laravel 11 Project Diagnostic Checklist

Run this checklist to verify all fixes are applied:

## ✅ REQUIRED FILES (Must Exist)

### Bootstrap Files
- [ ] `bootstrap/app.php` exists - Run: `test -f bootstrap/app.php`
- [ ] `bootstrap/providers.php` exists - Run: `test -f bootstrap/providers.php`
- [ ] `bootstrap/cache/config.php` exists - Run: `test -f bootstrap/cache/config.php`

### Configuration Files
- [ ] `config/app.php` exists
- [ ] `config/database.php` exists
- [ ] `config/csrf.php` exists
- [ ] `config/logging.php` exists
- [ ] `config/session.php` exists

### Application Files
- [ ] `app/Providers/AppServiceProvider.php` exists
- [ ] `app/Repositories/ProvinceRepositoryInterface.php` exists
- [ ] `app/Repositories/ProvinceRepository.php` exists
- [ ] `app/Services/ProvinceService.php` exists
- [ ] `app/Http/Controllers/Api/ProvinceController.php` exists
- [ ] `app/Models/Province.php` exists
- [ ] `app/Models/Semester.php` exists

### Storage Directories
- [ ] `storage/app/` directory exists
- [ ] `storage/app/public/` directory exists
- [ ] `storage/framework/` directory exists
- [ ] `storage/framework/cache/` directory exists
- [ ] `storage/framework/sessions/` directory exists
- [ ] `storage/framework/views/` directory exists
- [ ] `storage/logs/` directory exists

### Environment Files
- [ ] `.env.example` exists
- [ ] `.env` exists (created from .env.example)
- [ ] `APP_KEY` is set in `.env`

---

## 🔍 CODE VERIFICATION

### 1. Check `bootstrap/app.php` Contains:
```
->withProviders(require __DIR__ . '/providers.php')
```

### 2. Check `bootstrap/providers.php` Contains:
```php
return [
    // ... base providers
    \App\Providers\AppServiceProvider::class,
];
```

### 3. Check `app/Providers/AppServiceProvider.php` Contains:
```php
$this->app->bind(
    \App\Repositories\ProvinceRepositoryInterface::class,
    \App\Repositories\ProvinceRepository::class
);
```

### 4. Check `app/Repositories/ProvinceRepository.php` paginate() Method:
```php
public function paginate(int $perPage = 15): LengthAwarePaginator
{
    return $this->model->with('semesters')->paginate($perPage);
}
```

---

## 🧪 RUNTIME TESTS

### Test 1: Composer Autoloader
```bash
composer dump-autoload
echo "✓ Autoloader updated"
```

### Test 2: Cache Clear
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
echo "✓ Caches cleared"
```

### Test 3: Database Connection
```bash
php artisan tinker
>>> DB::connection()->getPdo()
>>> Province::count()
>>> exit()
```

### Test 4: Provider Loading
```bash
php artisan tinker
>>> app(\App\Repositories\ProvinceRepositoryInterface::class)
>>> exit()
```

### Test 5: Route Check
```bash
php artisan route:list | grep provinces
```

### Test 6: Health Check
```bash
curl http://localhost:8000/api/health
```

---

## 🚀 FINAL SETUP

Run in order:

```bash
# 1. Copy environment
cp .env.example .env

# 2. Generate key
php artisan key:generate

# 3. Clear caches
php artisan cache:clear && php artisan config:clear

# 4. Update autoloader
composer dump-autoload

# 5. Run migrations
php artisan migrate --seed

# 6. Start server
php artisan serve
```

---

## ✅ SUCCESS INDICATORS

You'll know it's working when:
- ✅ `php artisan serve` starts without errors
- ✅ No `BindingResolutionException` in console
- ✅ API endpoints return data at http://localhost:8000/api/provinces
- ✅ Database queries work in Tinker
- ✅ `php artisan route:list` shows all 5 API routes

---

## 🆘 IF TESTS FAIL

| Error | Fix |
|-------|-----|
| BindingResolutionException | Check bootstrap/providers.php exists with AppServiceProvider |
| Class not found | Run `composer dump-autoload` |
| Database error | Run `php artisan migrate --seed` |
| Port in use | Run `php artisan serve --port=8001` |
| .env not found | Run `cp .env.example .env` |

---

## 📝 QUICK COMMAND REFERENCE

```bash
# Clear everything and restart
php artisan cache:clear && php artisan config:clear && composer dump-autoload

# Generate fresh database
php artisan migrate:fresh --seed

# Test a single class resolution
php artisan tinker
>>> app(\App\Repositories\ProvinceRepositoryInterface::class)

# View all registered providers
php artisan config:show providers
```

---

**If all checks pass, your project is fixed and ready to run!** ✅
