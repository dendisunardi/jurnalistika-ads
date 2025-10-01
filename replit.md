# Jurnalistika Ads - Advertising Platform

## Overview
Jurnalistika Ads is a web application for managing advertising services on Jurnalistika.id media platform. The system serves two user types: advertisers (who can create and manage ads) and admins (who approve ads and monitor the platform).

## Tech Stack
- **Frontend**: React with TypeScript, Wouter for routing, TanStack Query for data fetching, Shadcn UI components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Authentication**: Replit Auth (supports Google, GitHub, email/password)
- **Storage**: Object Storage for ad images

## Database Schema

### Users
- id (varchar, UUID)
- email, firstName, lastName, profileImageUrl
- role (enum: 'advertiser', 'admin')
- companyName
- createdAt, updatedAt

### Ad Slots
- id (varchar, UUID)
- name, adType (enum: 'banner', 'sidebar', 'inline', 'popup')
- position (enum: 'top', 'bottom', 'right', 'middle')
- location (varchar, e.g., 'homepage', 'article')
- isAvailable (integer: 1=available, 0=not available)
- pricePerDay, pricePerView (decimal)
- createdAt

### Ads
- id (varchar, UUID)
- advertiserId (references users.id)
- slotId (references ad_slots.id)
- title, imageUrl
- adType, paymentType (enum: 'period', 'view')
- startDate, endDate
- budget, targetViews, currentViews
- status (enum: 'pending', 'approved', 'rejected', 'active', 'paused', 'completed')
- estimatedCost, actualCost
- rejectionReason
- createdAt, updatedAt

## Features

### Advertiser Features
- **Dashboard**: View overview of ads (active, pending)
- **Create Ad**: 
  - Select ad type (banner, sidebar, inline, popup)
  - Choose payment type (per period or per view)
  - Select from available ad slots
  - Upload ad image
  - Set budget, dates, target views
  - Real-time cost estimation with tax calculation
- **My Ads**: View all created ads with status badges

### Admin Features
- **Dashboard**: 
  - Statistics (pending ads, active ads, advertiser count, monthly revenue)
  - Pending Ads tab: Approve or reject ads with rejection reason
  - Active Ads tab: View and manage active ads
- **Ad Approval**: Review ads with images, details, and pricing

## Authentication & Authorization
- Uses Replit Auth with OIDC integration
- Role-based access control (advertiser vs admin)
- Routes protected based on user role
- Auto-redirects to appropriate dashboard based on role

## Payment Types
1. **Per Period**: Daily rate-based pricing (e.g., Rp 50,000/day)
2. **Per View**: Impression-based pricing (e.g., Rp 50/view)

## Cost Calculation
- Base cost = (pricePerDay × days) OR (pricePerView × targetViews)
- Tax = 11% of base cost
- Total = Base cost + Tax
- Minimum 1 day even if start/end dates are the same

## Current Ad Slots
1. Banner Atas Homepage - Rp 50,000/day, Rp 50/view
2. Banner Bawah Homepage - Rp 40,000/day, Rp 40/view
3. Sidebar Kanan Homepage - Rp 35,000/day, Rp 35/view
4. Inline Artikel - Posisi Atas - Rp 60,000/day, Rp 60/view
5. Inline Artikel - Posisi Tengah - Rp 75,000/day, Rp 75/view
6. Inline Artikel - Posisi Bawah - Rp 55,000/day, Rp 55/view
7. Pop-up Homepage - Rp 100,000/day, Rp 100/view
8. Pop-up Artikel - Rp 120,000/day, Rp 120/view

## API Endpoints

### Authentication
- GET /api/auth/user - Get current user
- POST /api/login - Login redirect
- POST /api/logout - Logout

### Ad Slots
- GET /api/ad-slots/available - Get available ad slots

### Ads
- GET /api/ads/my-ads - Get current user's ads
- POST /api/ads - Create new ad
- GET /api/ads/pending - Get pending ads (admin only)
- GET /api/ads/active - Get active ads (admin only)
- PATCH /api/ads/:id/status - Update ad status (admin only)

### Object Storage
- POST /api/objects/upload - Get presigned upload URL
- GET /objects/:objectPath - Get object file
- POST /api/objects/set-acl - Set object ACL

### Statistics
- GET /api/statistics - Get admin dashboard statistics

## Development
- Run: `npm run dev` (starts Express + Vite on port 5000)
- Database: `npm run db:push` (sync schema)
- Database URL is automatically configured via environment variables

## Notes
- Image uploads use Uppy with AWS S3-compatible object storage
- Forms use react-hook-form with Zod validation
- All components have data-testid attributes for testing
- Dark mode not yet implemented
