# Vercel Deployment Guide

## Prerequisites

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

## Environment Variables

Add the following environment variables in your Vercel project settings:

### Required Variables:
- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `SESSION_SECRET` - Strong random string for JWT signing
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token
- `APP_DOMAINS` - Your production domain (e.g., your-app.vercel.app)
- `NODE_ENV` - Set to "production"

### Optional Variables:
- `PORT` - Not needed for Vercel (serverless)
- `REPLIT_SIDECAR_ENDPOINT` - Not needed (replaced with Vercel Blob)
- `PUBLIC_OBJECT_SEARCH_PATHS` - Not needed (replaced with Vercel Blob)
- `PRIVATE_OBJECT_DIR` - Not needed (replaced with Vercel Blob)

## Deployment Steps

### 1. Initial Deployment
```bash
vercel
```

### 2. Set Environment Variables
```bash
# Set via CLI
vercel env add DATABASE_URL production
vercel env add SESSION_SECRET production
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
vercel env add BLOB_READ_WRITE_TOKEN production
vercel env add APP_DOMAINS production

# Or set via Vercel Dashboard:
# https://vercel.com/your-username/your-project/settings/environment-variables
```

### 3. Update Google OAuth Settings
Update your Google Cloud Console OAuth 2.0 credentials:
- Add authorized redirect URI: `https://your-app.vercel.app/api/auth/callback/google`
- Add authorized JavaScript origins: `https://your-app.vercel.app`

### 4. Deploy to Production
```bash
vercel --prod
```

## Key Changes Made

### 1. Architecture Migration
- ✅ Converted Express routes to Vercel serverless functions in `/api` directory
- ✅ Replaced express-session with JWT-based authentication
- ✅ Migrated to Vercel Blob storage (from Replit object storage)

### 2. Authentication Flow
- Uses JWT tokens stored in HTTP-only cookies
- Tokens expire after 7 days
- Google OAuth flow updated for serverless

### 3. File Structure
```
api/
├── _middleware/
│   └── auth.ts          # JWT auth middleware
├── auth/
│   ├── user.ts          # Get current user
│   ├── google.ts        # Google OAuth initiate
│   ├── callback/
│   │   └── google.ts    # Google OAuth callback
│   └── logout.ts        # Logout endpoint
├── ads/
│   ├── index.ts         # List/create ads
│   └── [id].ts          # Get/update/delete specific ad
├── ad-slots.ts          # Ad slots management
├── admin/
│   └── stats.ts         # Admin statistics
└── blob/
    └── upload.ts        # File upload to Vercel Blob
```

## Testing Locally

To test serverless functions locally:

```bash
# Install Vercel CLI
npm install -g vercel

# Run development server
vercel dev
```

## Important Notes

1. **Database Connection**: Neon PostgreSQL works perfectly with Vercel serverless
2. **WebSocket Support**: The `ws` package is used for Neon's serverless driver
3. **Session Management**: JWT-based, no server-side session storage needed
4. **File Uploads**: Now uses Vercel Blob instead of Replit object storage
5. **Cold Starts**: First request may be slower (serverless nature)

## Monitoring

- Check function logs: `vercel logs`
- View deployment status: `vercel ls`
- Check build logs in Vercel Dashboard

## Troubleshooting

### Issue: Database connection errors
- Ensure DATABASE_URL includes `?sslmode=require`
- Verify Neon database is accessible from Vercel IPs

### Issue: Authentication not working
- Check SESSION_SECRET is set
- Verify Google OAuth redirect URIs match your domain
- Check cookies are being set (HTTPS required in production)

### Issue: File upload fails
- Verify BLOB_READ_WRITE_TOKEN is correct
- Check file size limits (10MB default)

## Next Steps

1. Deploy to Vercel: `vercel --prod`
2. Set all environment variables
3. Test authentication flow
4. Test file uploads
5. Monitor for errors in Vercel dashboard
