# Quick Start: Vercel Deployment

## 🚀 Deploy in 3 Steps

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
vercel login
```

### Step 2: Test Locally
```bash
# Install new dependencies (already done)
npm install

# Run Vercel dev server
vercel dev
```

The app will be available at `http://localhost:3000`

### Step 3: Deploy to Production
```bash
# Deploy
vercel --prod
```

---

## 📝 Environment Variables Setup

After running `vercel`, set these in your Vercel Dashboard:

1. Go to: https://vercel.com/your-username/jurnalistika-ads/settings/environment-variables

2. Add these variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | Your Neon PostgreSQL URL | Already have it |
| `SESSION_SECRET` | Random string (32+ chars) | Use for JWT signing |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console | Already have it |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console | Already have it |
| `BLOB_READ_WRITE_TOKEN` | Your Vercel Blob token | Already have it |
| `APP_DOMAINS` | your-app.vercel.app | Your Vercel domain |
| `NODE_ENV` | production | For production builds |

---

## 🔑 Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client
3. Add to **Authorized redirect URIs**:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
4. Add to **Authorized JavaScript origins**:
   ```
   https://your-app.vercel.app
   ```
5. Replace `your-app` with your actual Vercel subdomain

---

## ✅ What's Been Changed

### Architecture
- ✅ Converted from Express server → Vercel serverless functions
- ✅ Changed from session-based auth → JWT tokens
- ✅ Migrated from Replit Object Storage → Vercel Blob
- ✅ Updated client to work with new auth system

### New Files Created
```
api/
├── _middleware/
│   └── auth.ts              # JWT authentication
├── auth/
│   ├── user.ts              # Get current user
│   ├── google.ts            # Google OAuth start
│   ├── logout.ts            # Logout
│   └── callback/
│       └── google.ts        # OAuth callback
├── ads/
│   ├── index.ts             # List/create ads
│   └── [id].ts              # Get/update/delete ad
├── ad-slots.ts              # Ad slots API
├── admin/
│   ├── stats.ts             # Admin statistics
│   ├── ads.ts               # All ads (admin)
│   └── ads/[id]/status.ts   # Update ad status
└── blob/
    └── upload.ts            # File upload

vercel.json                   # Vercel configuration
.vercelignore                 # Files to ignore
VERCEL_DEPLOYMENT.md         # Full deployment guide
MIGRATION_SUMMARY.md         # Complete migration details
vercel-checklist.sh          # Pre-deployment checklist
```

---

## 🧪 Testing Checklist

Before deploying to production, test these features:

- [ ] Login with Google OAuth
- [ ] Create a new ad
- [ ] Upload ad image
- [ ] View ads list
- [ ] Edit an ad
- [ ] Delete an ad
- [ ] Admin: View all ads
- [ ] Admin: Approve/reject ads
- [ ] Logout

---

## 🐛 Common Issues

### Issue: "Unauthorized" errors
**Solution**: 
- Clear cookies
- Check SESSION_SECRET is set in Vercel
- Verify Google OAuth redirect URI is correct

### Issue: Image upload fails
**Solution**:
- Check BLOB_READ_WRITE_TOKEN is set
- Verify token has write permissions
- Check file size < 10MB

### Issue: Database connection errors
**Solution**:
- Verify DATABASE_URL includes `?sslmode=require`
- Check Neon database is running
- Use pooler connection string

---

## 📚 Important Documentation

1. **VERCEL_DEPLOYMENT.md** - Complete deployment guide with all details
2. **MIGRATION_SUMMARY.md** - Full list of changes and architecture comparison
3. This file (QUICKSTART.md) - Fast deployment instructions

---

## 🆘 Need Help?

1. Check logs: `vercel logs`
2. View deployments: `vercel ls`
3. Read full guide: `VERCEL_DEPLOYMENT.md`
4. Run checklist: `./vercel-checklist.sh`

---

## 🎉 You're Ready!

Your project is now configured for Vercel. Just run:

```bash
vercel --prod
```

Good luck! 🚀
