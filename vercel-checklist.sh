#!/bin/bash

# Vercel Pre-Deployment Checklist Script
# Run this before deploying to Vercel

echo "🔍 Vercel Deployment Checklist"
echo "================================"
echo ""

# Check if vercel CLI is installed
echo "1. Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo "   ❌ Vercel CLI not found"
    echo "   Install with: npm install -g vercel"
    exit 1
else
    echo "   ✅ Vercel CLI installed"
fi

# Check if logged in to Vercel
echo ""
echo "2. Checking Vercel authentication..."
if vercel whoami &> /dev/null; then
    echo "   ✅ Logged in to Vercel as $(vercel whoami)"
else
    echo "   ❌ Not logged in to Vercel"
    echo "   Run: vercel login"
    exit 1
fi

# Check if required environment variables are in .env
echo ""
echo "3. Checking .env file..."
required_vars=("DATABASE_URL" "SESSION_SECRET" "GOOGLE_CLIENT_ID" "GOOGLE_CLIENT_SECRET" "BLOB_READ_WRITE_TOKEN")
missing_vars=()

if [ -f .env ]; then
    echo "   ✅ .env file exists"
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" .env; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -eq 0 ]; then
        echo "   ✅ All required environment variables present"
    else
        echo "   ⚠️  Missing environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "      - $var"
        done
    fi
else
    echo "   ❌ .env file not found"
fi

# Check if dependencies are installed
echo ""
echo "4. Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules exists"
else
    echo "   ⚠️  node_modules not found"
    echo "   Run: npm install"
fi

# Check if required packages are installed
echo ""
echo "5. Checking required packages..."
required_packages=("jose" "@vercel/node" "@vercel/blob")
for pkg in "${required_packages[@]}"; do
    if grep -q "\"$pkg\"" package.json; then
        echo "   ✅ $pkg installed"
    else
        echo "   ❌ $pkg not found in package.json"
        echo "      Run: npm install $pkg"
    fi
done

# Check TypeScript compilation
echo ""
echo "6. Checking TypeScript..."
if npm run check &> /dev/null; then
    echo "   ✅ TypeScript compilation successful"
else
    echo "   ⚠️  TypeScript compilation has warnings/errors"
    echo "   Run: npm run check"
fi

# Check if vercel.json exists
echo ""
echo "7. Checking Vercel configuration..."
if [ -f "vercel.json" ]; then
    echo "   ✅ vercel.json exists"
else
    echo "   ❌ vercel.json not found"
fi

# Check if API directory exists
echo ""
echo "8. Checking API directory..."
if [ -d "api" ]; then
    api_files=$(find api -name "*.ts" | wc -l)
    echo "   ✅ api/ directory exists with $api_files TypeScript files"
else
    echo "   ❌ api/ directory not found"
fi

echo ""
echo "================================"
echo "📋 Deployment Readiness Summary"
echo "================================"
echo ""
echo "Before deploying, make sure to:"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Update Google OAuth redirect URIs"
echo "3. Update APP_DOMAINS environment variable"
echo "4. Run database migrations if needed"
echo ""
echo "To deploy:"
echo "  - Test locally:     vercel dev"
echo "  - Deploy preview:   vercel"
echo "  - Deploy production: vercel --prod"
echo ""
