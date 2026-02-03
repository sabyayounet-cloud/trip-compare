# ⚡ Quick Deploy Guide - 5 Minutes to Production

Deploy TripCompare to free hosting in 5 simple steps.

## 📦 What You Need

- GitHub account
- Render.com account (free)
- Netlify.com account (free)
- Travelpayouts credentials (token + marker)

---

## 🚀 Step 1: Push to GitHub (1 min)

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit - TripCompare ready for deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/trip-compare.git
git branch -M main
git push -u origin main
```

---

## 🔧 Step 2: Deploy Backend to Render (2 min)

1. Go to **[render.com](https://render.com)** → Sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Fill in:
   ```
   Name: tripcompare-api
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn api.main:app --host 0.0.0.0 --port $PORT
   ```
5. Add environment variables:
   ```
   TRAVELPAYOUTS_TOKEN=your_token_here
   TRAVELPAYOUTS_MARKER=your_marker_here
   DEBUG=False
   CORS_ORIGINS=["*"]
   ```
6. Click **"Create Web Service"**
7. Copy your URL: `https://tripcompare-api-XXXX.onrender.com`

---

## 🎨 Step 3: Deploy Frontend to Netlify (2 min)

1. Go to **[netlify.com](https://netlify.com)** → Sign in
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose your GitHub repo
4. Configure:
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```
5. Add environment variable:
   ```
   VITE_API_URL=https://tripcompare-api-XXXX.onrender.com
   ```
   (Use your Render URL from Step 2)
6. Click **"Deploy site"**
7. Copy your URL: `https://YOUR_SITE.netlify.app`

---

## ✅ Step 4: Update CORS (30 sec)

1. Go back to Render.com
2. Open your `tripcompare-api` service
3. Go to **Environment** tab
4. Update `CORS_ORIGINS`:
   ```
   ["https://YOUR_SITE.netlify.app"]
   ```
5. Save (service will redeploy automatically)

---

## 🧪 Step 5: Test Everything (30 sec)

Open your Netlify URL in browser:

✅ Search for a flight (LON → BCN)
✅ Click on a deal
✅ Verify affiliate link opens with your marker
✅ Subscribe to newsletter

**Check API health:**
```bash
curl https://your-api.onrender.com/health
```

---

## 🎉 Done! You're Live!

Your TripCompare site is now:
- ✅ Deployed on free hosting
- ✅ Using real Travelpayouts data
- ✅ Tracking affiliate commissions
- ✅ Ready to make money!

**Your Links:**
- Frontend: `https://YOUR_SITE.netlify.app`
- Backend API: `https://tripcompare-api-XXXX.onrender.com`
- API Docs: `https://tripcompare-api-XXXX.onrender.com/docs`

---

## 🔍 Quick Troubleshooting

**Frontend shows API error?**
- Wait 1-2 minutes for Render to finish deploying
- Check VITE_API_URL is correct in Netlify

**CORS error in browser console?**
- Update CORS_ORIGINS on Render with your Netlify URL

**Affiliate links don't have marker?**
- Check TRAVELPAYOUTS_MARKER is set on Render

**Backend slow on first request?**
- Normal! Render free tier spins down after 15min inactivity
- First request takes 30-60 seconds to wake up

---

## 📊 Next Steps

1. **Monitor Travelpayouts Dashboard**
   - https://www.travelpayouts.com/programs
   - Track clicks and commissions

2. **Customize Your Site**
   - Add your logo
   - Update copy/content
   - Add more destinations

3. **Drive Traffic**
   - Share on social media
   - Create content/blog posts
   - SEO optimization

4. **Scale Up** (when ready)
   - Upgrade Render to $7/mo (no spin down)
   - Add custom domain
   - Implement analytics

---

## 🆘 Need Help?

- Check logs on Render dashboard
- Test API at `/docs` endpoint
- Review `DEPLOYMENT_GUIDE.md` for details
- Check `DEPLOYMENT_CHECKLIST.md` for comprehensive testing

**Happy earning! 💰**
