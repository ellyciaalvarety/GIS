@echo off
REM Laravel Poverty Statistics Setup Script for Windows

echo.
echo ========================================
echo Laravel Poverty Statistics Setup
echo ========================================
echo.

REM Check if Composer is installed
composer --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Composer is not installed or not in PATH
    echo Please install Composer from: https://getcomposer.org
    pause
    exit /b 1
)

REM Check if PHP is installed
php --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PHP is not installed or not in PATH
    echo Please install PHP 8.1 or higher
    pause
    exit /b 1
)

echo [1/6] Installing Composer dependencies...
call composer install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [2/6] Creating .env file...
if not exist .env (
    copy .env.example .env
    echo .env file created
) else (
    echo .env file already exists
)

echo [3/6] Generating application key...
call php artisan key:generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate app key
    pause
    exit /b 1
)

echo [4/6] Creating database file...
if not exist database\database.sqlite (
    type nul > database\database.sqlite
    echo Database file created
) else (
    echo Database file already exists
)

echo [5/6] Running migrations...
call php artisan migrate --force
if %errorlevel% neq 0 (
    echo ERROR: Failed to run migrations
    pause
    exit /b 1
)

echo [6/6] Seeding database with poverty statistics...
call php artisan db:seed --force
if %errorlevel% neq 0 (
    echo ERROR: Failed to seed database
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the development server, run:
echo   php artisan serve
echo.
echo Then visit: http://localhost:8000
echo.
pause
