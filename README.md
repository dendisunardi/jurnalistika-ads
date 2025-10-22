# Jurnalistika Ads - PHP/Laravel Version

## Overview
Jurnalistika Ads is a web application for managing advertising services on Jurnalistika.id media platform. This version is built with PHP using Laravel framework.

## Tech Stack
- **Backend**: Laravel 12 (PHP 8.3+)
- **Database**: PostgreSQL with Eloquent ORM
- **Authentication**: Laravel Sanctum + Google OAuth (via Socialite)
- **Frontend**: React (kept from original version, communicates via API)

## Requirements
- PHP 8.3 or higher
- Composer
- PostgreSQL
- Node.js & npm (for frontend only)

## Quick Start

Use the startup script for the easiest setup:
```bash
./start.sh
```

## Manual Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd jurnalistika-ads
```

### 2. Install dependencies
```bash
# Install PHP dependencies
composer install

# Install Node.js dependencies (for frontend)
npm install
```

### 3. Setup environment
```bash
cp .env.example .env
php artisan key:generate
```

### 4. Configure database
Edit `.env` file and set your PostgreSQL credentials:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=jurnalistika_ads
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 5. Configure Google OAuth
Get your OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/):
1. Create a new project or select existing one
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`

Edit `.env` and add your credentials:
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
```

### 6. Run migrations and seeders
```bash
php artisan migrate
php artisan db:seed --class=AdSlotSeeder
```

### 7. Start the application

**Option A: Laravel only (API + built frontend)**
```bash
# Build frontend first
npm run build

# Start Laravel server
php artisan serve --host=0.0.0.0 --port=5000
```

**Option B: Development mode (Laravel + Vite dev server)**
```bash
# Terminal 1: Start Laravel API
php artisan serve --host=0.0.0.0 --port=5000

# Terminal 2: Start Vite dev server
npm run dev
```

The application will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/google` - Initiate Google OAuth
- `POST /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/user` - Get current user (requires auth)
- `POST /api/auth/logout` - Logout (requires auth)

### Ad Slots
- `GET /api/ad-slots` - Get all ad slots (requires auth)
- `GET /api/ad-slots/available` - Get available ad slots (requires auth)
- `GET /api/ad-slots/{id}/booked-dates` - Get booked dates for slot (requires auth)

### Ads
- `GET /api/ads/my-ads` - Get current user's ads (requires auth)
- `GET /api/ads/my-ads-analytics` - Get ads with analytics (requires auth)
- `POST /api/ads` - Create new ad (requires auth)
- `GET /api/ads/{id}/analytics` - Get ad analytics (requires auth)
- `POST /api/ads/{id}/track-view` - Track ad view (public)

### Admin Only
- `GET /api/ads/pending` - Get pending ads (admin only)
- `GET /api/ads/active` - Get active ads (admin only)
- `PATCH /api/ads/{id}/status` - Update ad status (admin only)
- `GET /api/statistics` - Get dashboard statistics (admin only)

### File Upload
- `POST /api/blob/upload` - Upload ad image (requires auth)

## Database Schema

### Users
- `id` (UUID)
- `email`, `first_name`, `last_name`, `profile_image_url`
- `role` (enum: 'advertiser', 'admin')
- `company_name`
- `created_at`, `updated_at`

### Ad Slots
- `id` (UUID)
- `name`, `ad_type`, `position`, `location`
- `is_available`, `price_per_day`, `price_per_view`
- `created_at`

### Ads
- `id` (UUID)
- `advertiser_id` (foreign key to users)
- `title`, `image_url`, `ad_type`, `payment_type`
- `start_date`, `end_date`, `budget`
- `target_views`, `current_views`, `status`
- `estimated_cost`, `actual_cost`, `rejection_reason`
- `created_at`, `updated_at`

### Ad Slot Bookings (Many-to-Many)
- `id` (UUID)
- `ad_id` (foreign key to ads)
- `slot_id` (foreign key to ad_slots)
- `created_at`

### Ad Views
- `id` (UUID)
- `ad_id` (foreign key to ads)
- `viewed_at`, `ip_address`, `user_agent`, `referrer`

## Development

### Run migrations
```bash
php artisan migrate
```

### Rollback migrations
```bash
php artisan migrate:rollback
```

### Seed database
```bash
php artisan db:seed
```

### Clear cache
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### Run tests
```bash
php artisan test
```

## Production Deployment

1. Set `APP_ENV=production` in `.env`
2. Set `APP_DEBUG=false` in `.env`
3. Run `composer install --optimize-autoloader --no-dev`
4. Run `php artisan config:cache`
5. Run `php artisan route:cache`
6. Run `php artisan view:cache`
7. Set up a web server (Nginx/Apache) to serve the application
8. Configure queue workers for background jobs (if needed)

## Features

### Advertiser Features
- Create ads with multiple slot selection
- Upload ad images
- View ad analytics and performance
- Track views and budget

### Admin Features
- Approve/reject ads
- View all ads and statistics
- Monitor platform revenue
- Manage ad slots

## Cost Calculation
- **Per Period**: Base cost = SUM of (slot price per day × days) for all selected slots + 11% tax
- **Per View**: Base cost = SUM of (slot price per view × target views) for all selected slots + 11% tax
- Server-side validation ensures accurate cost calculation

## Support
For issues or questions, please open an issue on the repository.
