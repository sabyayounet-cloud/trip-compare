#!/bin/bash

# TripCompare - Deploy to GoDaddy Script
# This script builds the production frontend for deployment

set -e  # Exit on error

echo "🚀 TripCompare Deployment Script"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Navigate to frontend directory
echo -e "${BLUE}Step 1: Navigating to frontend directory...${NC}"
cd "$(dirname "$0")/frontend"

# Step 2: Install dependencies (if needed)
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Step 2: Installing dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

# Step 3: Build production bundle
echo -e "${BLUE}Step 3: Building production bundle...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful!${NC}"
else
    echo -e "${RED}✗ Build failed!${NC}"
    exit 1
fi

# Step 4: Show next steps
echo ""
echo -e "${GREEN}=================================="
echo "✅ Production build complete!"
echo "==================================${NC}"
echo ""
echo "📦 Built files are in: frontend/dist/"
echo ""
echo "Next steps:"
echo "1. Go to GoDaddy Dashboard: https://dashboard.godaddy.com/"
echo "2. Navigate to Web Hosting → File Manager"
echo "3. Upload all files from frontend/dist/ to public_html/"
echo "4. Or use FTP to upload the files"
echo ""
echo "Alternative (Recommended):"
echo "1. Use Netlify with custom domain"
echo "2. Follow instructions in DEPLOY_GODADDY.md"
echo ""
echo "Your site will be live at: https://s3riekart.nl"
echo ""

# Step 5: List built files
echo -e "${BLUE}Built files:${NC}"
ls -lh dist/

echo ""
echo -e "${GREEN}🎉 Ready to deploy!${NC}"
