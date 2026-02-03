# 🚀 TripCompare Deployment Checklist

Use this checklist to ensure smooth deployment to production.

## ✅ Pre-Deployment Checklist

### 1. Code Cleanup
- [x] Remove unused backend/ directory
- [x] Remove standalone index.html
- [x] Remove Python cache files (__pycache__, *.pyc)
- [x] Remove .DS_Store files
- [x] Update .gitignore file
- [x] Add comprehensive logging

### 2. Configuration
- [ ] Update `.env.production` with actual credentials
- [ ] Set `DEBUG=False` in production
- [ ] Configure CORS_ORIGINS with actual frontend URL
- [ ] Verify TRAVELPAYOUTS_TOKEN is set
- [ ] Verify TRAVELPAYOUTS_MARKER is set

### 3. Code Review
- [x] All API endpoints working locally
- [x] Logging system implemented
- [x] Error handling in place
- [ ] Test all search functionality
- [ ] Verify affiliate links generate correctly

### 4. Git Repository
- [ ] Push code to GitHub
- [ ] Verify .gitignore prevents credential commits
- [ ] Add meaningful commit messages
- [ ] Tag the release (optional)

---

## 🌐 Backend Deployment (Render.com)

### Step 1: Create Web Service
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Name**: `tripcompare-api`
   - **Environment**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`

### Step 2: Environment Variables
Add these in Render dashboard:
```
DEBUG=False
DATABASE_URL=sqlite:///./tripcompare.db
TRAVELPAYOUTS_TOKEN=<your_token>
TRAVELPAYOUTS_MARKER=<your_marker>
TRAVELPAYOUTS_HOST=https://tripcompare.eu
CORS_ORIGINS=["*"]
RATE_LIMIT_PER_MINUTE=60
```

### Step 3: Verify Deployment
```bash
# Get your Render URL (e.g., https://tripcompare-api.onrender.com)
curl https://your-app.onrender.com/health

# Should return:
# {"status":"healthy","database":"connected","version":"1.0.0"}
```

---

## 🎨 Frontend Deployment (Netlify)

### Step 1: Deploy from GitHub
1. Go to [netlify.com](https://www.netlify.com)
2. "Add new site" → "Import an existing project"
3. Choose GitHub repository
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

### Step 2: Environment Variables
Add in Netlify dashboard:
```
VITE_API_URL=https://tripcompare-api.onrender.com
```

### Step 3: Update Backend CORS
After getting Netlify URL, update Render environment:
```
CORS_ORIGINS=["https://your-app.netlify.app"]
```

---

## 🧪 Post-Deployment Testing

### Backend Tests
```bash
# Health check
curl https://your-api.onrender.com/health

# Flight search
curl -X POST https://your-api.onrender.com/search/flights \
  -H "Content-Type: application/json" \
  -d '{"origin":"LON","destination":"BCN","departure_date":"2025-06-15","travelers":2}'

# Popular destinations
curl https://your-api.onrender.com/search/flights/popular?origin=LON

# Widget config
curl https://your-api.onrender.com/search/widget/config
```

### Frontend Tests
- [ ] Open Netlify URL in browser
- [ ] Test flight search functionality
- [ ] Test hotel search functionality
- [ ] Verify affiliate links open correctly
- [ ] Check browser console for errors
- [ ] Test newsletter subscription
- [ ] Test responsive design (mobile/tablet)

### Affiliate Link Verification
- [ ] Click on a deal → Check URL contains `marker=YOUR_MARKER`
- [ ] Search for flights → Verify redirects to Aviasales with marker
- [ ] Search for hotels → Verify redirects to Hotellook with marker

---

## 📊 Monitoring Setup

### 1. Render Monitoring
- Check Render dashboard for:
  - [ ] Service uptime
  - [ ] Response times
  - [ ] Error logs
  - [ ] Memory usage

### 2. Application Logs
- [ ] Check `/logs` directory for errors
- [ ] Monitor API request logs
- [ ] Track external API call latencies

### 3. Uptime Monitoring (Optional)
Use [UptimeRobot](https://uptimerobot.com) (free):
- Monitor: `https://your-api.onrender.com/health`
- Alert on downtime
- Check interval: 5 minutes

---

## 🔧 Troubleshooting

### Common Issues

**Issue**: Backend returns 502/503 errors
- **Cause**: Render free tier spins down after 15 min inactivity
- **Solution**: First request after inactivity takes 30-60 seconds

**Issue**: CORS errors in browser
- **Cause**: Frontend URL not in CORS_ORIGINS
- **Solution**: Update CORS_ORIGINS environment variable on Render

**Issue**: Affiliate links don't work
- **Cause**: Missing or incorrect TRAVELPAYOUTS_MARKER
- **Solution**: Check environment variable is set correctly

**Issue**: Database resets
- **Cause**: SQLite file not persisting
- **Solution**: Render free tier has ephemeral storage; use PostgreSQL for production

---

## 🎯 Production Optimization (Optional)

### Performance
- [ ] Enable Render Redis caching
- [ ] Implement CDN for static assets
- [ ] Add database connection pooling
- [ ] Optimize image loading

### Security
- [ ] Add rate limiting per IP
- [ ] Implement API key authentication
- [ ] Enable HTTPS everywhere
- [ ] Add security headers

### SEO
- [ ] Submit sitemap to Google Search Console
- [ ] Verify robots.txt is accessible
- [ ] Add structured data markup
- [ ] Optimize meta tags

---

## 📈 Growth Checklist

### Marketing
- [ ] Share on social media
- [ ] Submit to travel deal aggregators
- [ ] Create blog content
- [ ] Email marketing campaigns

### Monetization
- [ ] Track Travelpayouts commissions
- [ ] Apply for additional affiliate programs
- [ ] Optimize conversion rates
- [ ] A/B test landing pages

### Analytics
- [ ] Set up Google Analytics
- [ ] Track affiliate click rates
- [ ] Monitor popular destinations
- [ ] Analyze user behavior

---

## 🎉 Deployment Complete!

Once all checkboxes are completed:

✅ Backend deployed to Render
✅ Frontend deployed to Netlify
✅ All tests passing
✅ Monitoring enabled
✅ Ready to earn commissions!

**Next Steps:**
1. Start promoting your site
2. Monitor traffic and conversions
3. Optimize based on data
4. Scale up when needed

**Support Resources:**
- [Render Documentation](https://render.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Travelpayouts Dashboard](https://www.travelpayouts.com)
- [FastAPI Documentation](https://fastapi.tiangolo.com)

Good luck! 🚀
