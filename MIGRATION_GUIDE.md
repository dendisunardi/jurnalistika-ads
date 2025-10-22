# Migration Guide: Node.js/TypeScript to PHP/Laravel

This document explains the changes made when converting the Jurnalistika Ads application from Node.js/TypeScript to PHP/Laravel.

## Overview of Changes

### Backend Stack
| Component | Before (Node.js) | After (PHP) |
|-----------|------------------|-------------|
| Framework | Express.js | Laravel 12 |
| Language | TypeScript | PHP 8.3+ |
| ORM | Drizzle ORM | Eloquent ORM |
| Auth | Passport.js + Replit Auth | Laravel Sanctum + Socialite |
| Database | PostgreSQL | PostgreSQL (unchanged) |
| API | REST | REST (unchanged) |

### Frontend Stack
| Component | Before | After |
|-----------|--------|-------|
| Framework | React | React (unchanged) |
| Language | TypeScript | TypeScript (unchanged) |
| Build Tool | Vite | Vite (unchanged) |
| Routing | Wouter | Wouter (unchanged) |
| State Management | TanStack Query | TanStack Query (unchanged) |

## File Structure Changes

### Removed Files/Directories
```
server/                    ❌ Removed - Express.js backend
  ├── index.ts
  ├── routes.ts
  ├── db.ts
  ├── storage.ts
  ├── replitAuth.ts
  └── ...
drizzle.config.ts          ❌ Removed - Drizzle ORM config
shared/schema.sql          ✅ Kept for reference
```

### Added Files/Directories
```
app/                       ✅ Added - Laravel application
  ├── Http/
  │   ├── Controllers/     ✅ API Controllers
  │   └── Middleware/      ✅ Auth middleware
  └── Models/              ✅ Eloquent models
config/                    ✅ Added - Laravel config
database/
  ├── migrations/          ✅ Laravel migrations
  └── seeders/             ✅ Database seeders
routes/
  ├── api.php              ✅ API routes
  └── web.php              ✅ Web routes
composer.json              ✅ PHP dependencies
start.sh                   ✅ Startup script
```

## Database Schema

The database schema remains **identical** between versions. All tables, columns, and relationships are preserved:
- `users` - User accounts with roles
- `ad_slots` - Advertisement slot definitions
- `ads` - Advertisement records
- `ad_slot_bookings` - Junction table (many-to-many)
- `ad_views` - View tracking
- `personal_access_tokens` - Sanctum auth tokens (new)

## API Endpoints

All API endpoints remain **identical** - no changes needed in frontend code!

### Authentication
```
POST /api/auth/google              ✅ Works the same
POST /api/auth/google/callback     ✅ Works the same
GET  /api/auth/user                ✅ Works the same
POST /api/auth/logout              ✅ Works the same
```

### Ad Management
```
GET  /api/ad-slots                 ✅ Works the same
GET  /api/ad-slots/available       ✅ Works the same
GET  /api/ad-slots/{id}/booked-dates ✅ Works the same
POST /api/ads                      ✅ Works the same
GET  /api/ads/my-ads               ✅ Works the same
GET  /api/ads/my-ads-analytics     ✅ Works the same
...and all other endpoints         ✅ Work the same
```

## Code Mapping

### Controllers
| Node.js (Express) | PHP (Laravel) |
|-------------------|---------------|
| `server/routes.ts` (auth handlers) | `app/Http/Controllers/AuthController.php` |
| `server/routes.ts` (ad handlers) | `app/Http/Controllers/AdController.php` |
| `server/routes.ts` (slot handlers) | `app/Http/Controllers/AdSlotController.php` |
| `server/routes.ts` (stats handlers) | `app/Http/Controllers/StatisticsController.php` |

### Models
| Node.js (Drizzle) | PHP (Eloquent) |
|-------------------|----------------|
| `shared/schema.ts` (users) | `app/Models/User.php` |
| `shared/schema.ts` (ads) | `app/Models/Ad.php` |
| `shared/schema.ts` (adSlots) | `app/Models/AdSlot.php` |
| `shared/schema.ts` (adSlotBookings) | `app/Models/AdSlotBooking.php` |
| `shared/schema.ts` (adViews) | `app/Models/AdView.php` |

### Middleware
| Node.js | PHP (Laravel) |
|---------|---------------|
| `server/replitAuth.ts` (isAuthenticated) | `auth:sanctum` middleware |
| Custom role check | `app/Http/Middleware/CheckRole.php` |

## Authentication Flow

### Before (Node.js + Passport)
```typescript
// Setup Passport with Google OAuth
passport.use(new GoogleStrategy(...))
app.use(passport.session())

// Protected route
app.get('/api/auth/user', isAuthenticated, async (req, res) => {
  res.json(req.user)
})
```

### After (PHP + Sanctum)
```php
// Protected route
Route::middleware('auth:sanctum')->get('/api/auth/user', function (Request $request) {
    return $request->user();
});

// Google OAuth via Socialite
public function googleCallback()
{
    $googleUser = Socialite::driver('google')->stateless()->user();
    $user = User::updateOrCreate(['email' => $googleUser->email], [...]);
    $token = $user->createToken('auth_token')->plainTextToken;
    return response()->json(['user' => $user, 'token' => $token]);
}
```

## Database Queries

### Before (Drizzle ORM)
```typescript
// Get user's ads with relationships
const ads = await db.select()
  .from(ads)
  .leftJoin(users, eq(ads.advertiserId, users.id))
  .leftJoin(adSlotBookings, eq(ads.id, adSlotBookings.adId))
  .where(eq(ads.advertiserId, userId))
```

### After (Eloquent ORM)
```php
// Get user's ads with relationships
$ads = Ad::with(['advertiser', 'slots'])
    ->where('advertiser_id', $userId)
    ->get();
```

## Configuration

### Environment Variables
Most environment variables remain the same:
```env
# Database - Same format
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_DATABASE=jurnalistika_ads

# Google OAuth - Same credentials
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# New Laravel-specific
APP_KEY=base64:...          # Generated by php artisan key:generate
APP_URL=http://localhost:5000
```

## Development Workflow

### Before (Node.js)
```bash
npm install
npm run dev                # Start Express + Vite
npm run db:push            # Sync database schema
```

### After (PHP)
```bash
composer install           # PHP dependencies
npm install               # Frontend dependencies
php artisan migrate       # Run migrations
php artisan db:seed       # Seed database
php artisan serve         # Start Laravel API
npm run dev               # Start Vite (optional)
```

## Testing

### Unit Tests
Tests should now be written in PHP using PHPUnit:
```bash
php artisan test
```

## Deployment

### Before (Node.js)
1. Build frontend: `npm run build`
2. Build backend: Compile TypeScript
3. Run: `node dist/index.js`

### After (PHP)
1. Install dependencies: `composer install --no-dev`
2. Build frontend: `npm run build`
3. Optimize: `php artisan optimize`
4. Configure web server (Nginx/Apache) to serve `public/index.php`

## Performance Considerations

- **Laravel** has built-in caching, queue systems, and optimization tools
- **Eloquent** lazy loading and eager loading for optimized queries
- **Sanctum** provides stateless API authentication (no session overhead)
- **Opcache** should be enabled in production for PHP bytecode caching

## Troubleshooting

### "Route not found"
- Run `php artisan route:list` to see all registered routes
- Clear route cache: `php artisan route:clear`

### "Class not found"
- Run `composer dump-autoload`

### Database connection issues
- Check `.env` database credentials
- Ensure PostgreSQL is running
- Test connection: `php artisan migrate:status`

### Frontend not loading
- Build frontend: `npm run build`
- Check `public/build/` directory exists
- Verify `routes/web.php` serves the frontend

## Migration Checklist

- [x] ✅ Convert Express routes to Laravel routes
- [x] ✅ Convert Drizzle models to Eloquent models
- [x] ✅ Convert Passport auth to Sanctum + Socialite
- [x] ✅ Migrate database schema to Laravel migrations
- [x] ✅ Update environment configuration
- [x] ✅ Configure CORS for API
- [x] ✅ Setup file upload handling
- [x] ✅ Preserve all API endpoint signatures
- [x] ✅ Keep frontend unchanged (React + TypeScript)
- [x] ✅ Test all endpoints
- [x] ✅ Update documentation

## Benefits of Migration

1. **Ecosystem**: Access to Laravel's mature ecosystem (packages, tools, community)
2. **ORM**: Eloquent provides more features than Drizzle (soft deletes, observers, etc.)
3. **Structure**: Laravel's MVC structure is well-established and familiar
4. **Security**: Built-in CSRF protection, SQL injection prevention, XSS protection
5. **Deployment**: More PHP hosting options and better performance with Opcache
6. **Maintenance**: Easier to find PHP/Laravel developers

## Support

For questions or issues related to the migration, please refer to:
- [Laravel Documentation](https://laravel.com/docs)
- [Eloquent ORM Guide](https://laravel.com/docs/eloquent)
- [Sanctum Authentication](https://laravel.com/docs/sanctum)
