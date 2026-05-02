#!/bin/bash

# Laravel 11 Project Recovery Script
# This script fixes all binding resolution and missing files issues

echo ""
echo "========================================"
echo "Laravel 11 Project Recovery"
echo "========================================"
echo ""

echo "[1/6] Clearing all caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
echo "✓ Caches cleared"

echo ""
echo "[2/6] Dumping autoloader..."
composer dump-autoload
echo "✓ Autoloader dumped"

echo ""
echo "[3/6] Creating .env file from example..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ .env file created"
else
    echo "- .env file already exists"
fi

echo ""
echo "[4/6] Generating application key..."
php artisan key:generate
echo "✓ Application key generated"

echo ""
echo "[5/6] Running migrations..."
php artisan migrate --force
echo "✓ Migrations completed"

echo ""
echo "[6/6] Seeding database..."
php artisan db:seed --force
echo "✓ Database seeded"

echo ""
echo "========================================"
echo "Recovery Complete!"
echo "========================================"
echo ""
echo "Your Laravel 11 project is now fixed."
echo ""
echo "To start the development server, run:"
echo "  php artisan serve"
echo ""
echo "Then visit: http://localhost:8000"
echo ""
