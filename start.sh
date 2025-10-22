#!/bin/bash

# Jurnalistika Ads - Laravel Startup Script

echo "Starting Jurnalistika Ads (Laravel + React)..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please configure your .env file before continuing."
    exit 1
fi

# Check if vendor directory exists
if [ ! -d vendor ]; then
    echo "Installing PHP dependencies..."
    composer install
fi

# Generate application key if not set
if ! grep -q "APP_KEY=base64:" .env; then
    echo "Generating application key..."
    php artisan key:generate
fi

# Run migrations
echo "Running database migrations..."
php artisan migrate --force

# Seed database if needed
read -p "Do you want to seed the database with initial ad slots? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    php artisan db:seed --class=AdSlotSeeder
fi

# Clear caches
echo "Clearing caches..."
php artisan config:clear
php artisan route:clear
php artisan cache:clear

# Start Laravel server
echo "Starting Laravel server on http://localhost:5000..."
php artisan serve --host=0.0.0.0 --port=5000
