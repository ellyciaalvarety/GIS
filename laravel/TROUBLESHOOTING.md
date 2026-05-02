# ❓ FAQ & TROUBLESHOOTING

## ❓ Frequently Asked Questions

### Q1: Do I need MySQL or PostgreSQL?

**A:** No! The project uses SQLite which is included. The database file (`database.sqlite`) will be created automatically during setup.

### Q2: How long does setup take?

**A:** Usually 2-3 minutes depending on internet speed (downloading composer packages takes most time).

### Q3: Can I run this on Windows?

**A:** Yes! Run `setup.bat` or follow manual setup steps.

### Q4: Can I run this on macOS/Linux?

**A:** Yes! Run `setup.sh` or follow manual setup steps.

### Q5: What PHP version is needed?

**A:** PHP 8.1 or higher. Check with: `php --version`

### Q6: Do I need Composer?

**A:** Yes. Download from: https://getcomposer.org

### Q7: What port does the app use?

**A:** Default is 8000. Change with: `php artisan serve --port=8001`

### Q8: How many provinces are included?

**A:** 34 Indonesian provinces with data for 2 semesters each (68 total records).

### Q9: Can I modify the data?

**A:** Yes! Edit `database/seeders/PovertyStatisticsSeeder.php` and run `php artisan migrate:fresh --seed`

### Q10: Is this production-ready?

**A:** The code structure is production-ready, but add authentication before deploying.

---

## 🔧 TROUBLESHOOTING

### ❌ "PHP command not found"

**Problem:** Windows/Mac can't find PHP

**Solutions:**

1. **Install PHP:** Download from https://www.php.net/downloads
2. **Add to PATH:**
   - Windows: Add PHP folder to System Environment Variables
   - macOS: Use Homebrew: `brew install php`
   - Linux: Use package manager: `sudo apt install php`
3. **Verify:** Run `php --version`

---

### ❌ "Composer command not found"

**Problem:** Composer is not installed

**Solution:**

1. Download Composer from https://getcomposer.org/download/
2. Follow installation instructions
3. Verify: `composer --version`

---

### ❌ "Permission denied" (Linux/macOS)

**Problem:** `setup.sh` is not executable

**Solution:**

```bash
chmod +x setup.sh
./setup.sh
```

---

### ❌ "Port 8000 already in use"

**Problem:** Another application is using port 8000

**Solutions:**

```bash
# Use different port
php artisan serve --port=8001

# Find process using port 8000
netstat -tulpn | grep 8000

# Or on Windows
netstat -ano | findstr :8000
```

---

### ❌ Database migration fails

**Problem:** "Unable to open database file" or similar

**Solutions:**

1. **Create database folder:**

   ```bash
   mkdir -p database
   touch database/database.sqlite
   ```

2. **Check permissions:**

   ```bash
   chmod 755 database
   ```

3. **Run fresh migrations:**
   ```bash
   php artisan migrate:fresh --seed
   ```

---

### ❌ "Class not found" errors

**Problem:** Autoloader out of sync

**Solution:**

```bash
composer dump-autoload
```

---

### ❌ "SQLSTATE[HY000]: General error"

**Problem:** SQLite not properly configured

**Solutions:**

1. Delete `database/database.sqlite`
2. Run: `php artisan migrate --seed`
3. If still fails, run: `php artisan config:clear`

---

### ❌ API returns 404

**Problem:** Route not found

**Solutions:**

```bash
# Check all routes
php artisan route:list

# Clear route cache
php artisan route:cache

# Regenerate cache
php artisan cache:clear
```

---

### ❌ "Symfony\Component\Console\Exception\CommandNotFoundException"

**Problem:** Laravel can't find a command

**Solution:**

```bash
composer dump-autoload
php artisan cache:clear
```

---

### ❌ "Call to undefined function" error

**Problem:** Missing package or wrong namespace

**Solutions:**

1. Check composer.json for package
2. Run: `composer install`
3. Run: `composer dump-autoload`

---

### ❌ Seeder doesn't import data

**Problem:** Data not appearing after `php artisan db:seed`

**Solutions:**

1. Check seeder file exists:

   ```bash
   php artisan db:seed --class=PovertyStatisticsSeeder
   ```

2. Fresh start:

   ```bash
   php artisan migrate:fresh --seed
   ```

3. Verify database:
   ```bash
   php artisan tinker
   >>> Province::count()
   ```

---

### ❌ "Method not found" in API

**Problem:** Wrong HTTP method or endpoint

**Solution:**

```bash
# View all routes
php artisan route:list

# Check your URL matches exactly
curl http://localhost:8000/api/provinces  # Correct
curl http://localhost:8000/api/province   # Wrong (missing 's')
```

---

### ❌ CORS error in browser

**Problem:** "Access-Control-Allow-Origin" error

**Note:** This is expected with browser requests to API. Use:

- Postman (no CORS restriction)
- curl (command line)
- Same-domain requests only
- Add CORS middleware if needed

---

### ❌ Changes not appearing

**Problem:** Code changes not reflected

**Solutions:**

```bash
# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:cache

# Restart server
# Ctrl+C to stop
php artisan serve
```

---

## ✅ VERIFICATION COMMANDS

### Check Installation

```bash
# Check PHP version
php --version

# Check Composer version
composer --version

# Check Laravel installation
php artisan --version

# List all routes
php artisan route:list

# Check database connection
php artisan tinker
>>> DB::connection()->getPdo()
>>> exit()
```

### Test Database

```bash
php artisan tinker
>>> Province::count()        # Should return 34
>>> Semester::count()        # Should return 68
>>> Province::first()->name  # Should return "Aceh"
>>> exit()
```

### Test API

```bash
# Using curl
curl http://localhost:8000/api/provinces

# Or using browser
# Visit: http://localhost:8000/api/provinces
```

---

## 🆘 GETTING HELP

1. **Check documentation:**
   - START_HERE.md
   - INSTALL.md
   - ARCHITECTURE.md

2. **Check Laravel docs:** https://laravel.com/docs

3. **Check error message carefully:**
   - Google the exact error
   - Check file paths
   - Check file permissions

4. **Try resetting:**

   ```bash
   composer install
   php artisan migrate:fresh --seed
   php artisan cache:clear
   ```

5. **Last resort:**
   - Delete vendor/ folder
   - Delete database/database.sqlite
   - Run setup.bat or setup.sh again

---

## ⚡ QUICK FIXES

| Issue              | Quick Fix                                    |
| ------------------ | -------------------------------------------- |
| Port in use        | `php artisan serve --port=8001`              |
| Class not found    | `composer dump-autoload`                     |
| Database error     | `php artisan migrate:fresh --seed`           |
| Cache issue        | `php artisan cache:clear`                    |
| Route not working  | `php artisan route:cache`                    |
| Seeder not working | `php artisan db:seed --class=DatabaseSeeder` |
| Permission denied  | `chmod +x setup.sh`                          |
| Can't find file    | `composer install`                           |

---

## 🎯 COMMON SOLUTIONS SUMMARY

```bash
# If something breaks, try this sequence:

# 1. Clear caches
php artisan cache:clear
php artisan config:clear

# 2. Regenerate autoloader
composer dump-autoload

# 3. Refresh database
php artisan migrate:fresh --seed

# 4. Check routes
php artisan route:list

# 5. Restart server
# Ctrl+C then
php artisan serve
```

---

## 📞 SUPPORT FILES

- **START_HERE.md** - Main guide
- **INSTALL.md** - Detailed setup
- **ARCHITECTURE.md** - Code structure
- **API_EXAMPLES.md** - API usage
- **README.md** - Project overview
- **QUICKSTART.md** - Quick reference

---

## ✨ YOU'RE COVERED

Every issue has a solution documented. If you encounter something:

1. Check this file
2. Check documentation
3. Check Laravel documentation
4. Try the "common solutions" above

**Everything is solvable!** 🚀
