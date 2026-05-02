#!/bin/bash

echo ""
echo "========================================"
echo "Laravel Poverty Statistics Setup"
echo "========================================"
echo ""

# Check if Composer is installed
if ! command -v composer &> /dev/null; then
    echo "ERROR: Composer is not installed"
    echo "Please install Composer from: https://getcomposer.org"
    exit 1
fi

# Check if PHP is installed
if ! command -v php &> /dev/null; then
    echo "ERROR: PHP is not installed"
    echo "Please install PHP 8.1 or higher"
    exit 1
fi

echo "[1/6] Installing Composer dependencies..."
composer install || exit 1

echo "[2/6] Creating .env file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo ".env file created"
else
    echo ".env file already exists"
fi

echo "[3/6] Generating application key..."
php artisan key:generate || exit 1

echo "[4/6] Creating database file..."
mkdir -p database
touch database/database.sqlite

echo "[5/6] Running migrations..."
php artisan migrate --force || exit 1

echo "[6/6] Seeding database with poverty statistics..."
php artisan db:seed --force || exit 1

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "To start the development server, run:"
echo "  php artisan serve"
echo ""
echo "Then visit: http://localhost:8000"
echo ""
