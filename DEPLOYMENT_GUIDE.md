# 🚀 TripCompare Deployment Guide

Complete guide to deploy your TripCompare application to free hosting platforms.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Render)](#backend-deployment-render)
3. [Frontend Deployment (Netlify)](#frontend-deployment-netlify)
4. [Environment Configuration](#environment-configuration)
5. [Testing Deployment](#testing-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ GitHub account (for code hosting)
- ✅ Render.com account (free - for backend API)
- ✅ Netlify account (free - for frontend)
- ✅ Travelpayouts API credentials (your token and marker)
- ✅ Git installed on your machine

---

## Backend Deployment (Render)

### Step 1: Push Code to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - TripCompare app ready for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/trip-compare.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Render

1. **Go to [Render.com](https://render.com)** and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

   ```
   Name: tripcompare-api
   Environment: Python
   Region: Choose closest to your users
   Branch: main
   Root Directory: (leave empty)
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn api.main:app --host 0.0.0.0 --port $PORT
   ```

5. **Set Environment Variables** (under "Environment" tab):
   ```
   DEBUG=False
   DATABASE_URL=sqlite:///./tripcompare.db
   TRAVELPAYOUTS_TOKEN=your_actual_token
   TRAVELPAYOUTS_MARKER=your_actual_marker
   TRAVELPAYOUTS_HOST=https://tripcompare.eu
   CORS_ORIGINS=["*"]
   ```

6. Click **"Create Web Service"**

7. Wait for deployment (5-10 minutes). You'll get a URL like:
   ```
   https://tripcompare-api.onrender.com
   ```

### Step 3: Verify Backend

Test your API:
```bash
curl https://tripcompare-api.onrender.com/health
```

You should see:
```json
{"status":"healthy","database":"connected","version":"1.0.0"}
```

---

## Frontend Deployment (Netlify)

### Option A: Deploy from GitHub (Recommended)

1. **Go to [Netlify.com](https://www.netlify.com)** and sign in
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and select your repository
4. Configure build settings:

   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```

5. **Set Environment Variables**:
   ```
   VITE_API_URL=https://tripcompare-api.onrender.com
   ```

6. Click **"Deploy site"**

7. Your site will be live at:
   ```
   https://random-name-12345.netlify.app
   ```

8. **Custom Domain (Optional)**:
   - Go to Site Settings → Domain Management
   - Click "Add custom domain"
   - Follow instructions to connect your domain

### Option B: Deploy via CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build the frontend
cd frontend
npm install
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

---

## Environment Configuration

### Update Backend CORS

After getting your Netlify URL, update the backend CORS settings on Render:

```
CORS_ORIGINS=["https://your-app.netlify.app", "https://tripcompare.eu"]
```

### Update Frontend API URL

If not using environment variables, update `frontend/src/api.js`:

```javascript
const API_BASE = 'https://tripcompare-api.onrender.com'
```

---

## Testing Deployment

### 1. Test Backend API

```bash
# Health check
curl https://tripcompare-api.onrender.com/health

# Get deals
curl https://tripcompare-api.onrender.com/deals/featured

# Search flights
curl -X POST https://tripcompare-api.onrender.com/search/flights \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "LON",
    "destination": "BCN",
    "departure_date": "2025-06-15",
    "travelers": 2
  }'
```

### 2. Test Frontend

1. Open your Netlify URL in a browser
2. Try searching for flights
3. Check browser console for any errors
4. Verify affiliate links work correctly

### 3. Monitor Logs

**Render Logs:**
- Go to your service → Logs tab
- Watch for errors or warnings

**Netlify Logs:**
- Go to your site → Deploys tab
- Check function logs if using Netlify functions

---

## Troubleshooting

### Backend Issues

**Problem: Database errors**
```
Solution: SQLite persists between deploys on Render free tier
```

**Problem: CORS errors**
```
Solution: Add your Netlify URL to CORS_ORIGINS environment variable
```

**Problem: Slow response times**
```
Solution: Render free tier spins down after inactivity
First request may take 30-60 seconds
```

### Frontend Issues

**Problem: API calls fail**
```
Solution: Check VITE_API_URL is set correctly
Rebuild and redeploy after changing environment variables
```

**Problem: 404 on page refresh**
```
Solution: Ensure netlify.toml redirects are configured correctly
```

### Monitoring

**Set up monitoring:**
1. Render provides basic monitoring on dashboard
2. Use UptimeRobot (free) for uptime monitoring
3. Check logs regularly for errors

---

## Cost Breakdown

### Free Tier Limits

**Render (Backend):**
- ✅ 750 hours/month (always on)
- ✅ Automatic HTTPS
- ✅ Continuous deployment
- ⚠️ Spins down after 15 min inactivity

**Netlify (Frontend):**
- ✅ 100GB bandwidth/month
- ✅ Unlimited sites
- ✅ Automatic HTTPS
- ✅ Continuous deployment

### Upgrade Path

When you outgrow free tier:
- Render: $7/month (no spin down, more resources)
- Netlify: $19/month (analytics, more builds)

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Netlify
3. ✅ Test all functionality
4. 🔄 Set up custom domain
5. 📊 Monitor performance and errors
6. 💰 Start earning affiliate commissions!

---

## Support

For issues:
- Check logs on Render/Netlify dashboards
- Review API documentation at `/docs`
- Test endpoints individually

**Happy Deploying! 🚀**
