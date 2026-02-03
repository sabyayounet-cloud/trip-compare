# 🚀 Deploy TripCompare NOW - Complete Guide

Your code is committed and ready! Follow these exact steps to deploy.

---

## 📋 Prerequisites

Before starting, create FREE accounts at:
1. **GitHub** - https://github.com/signup
2. **Render** - https://render.com (sign up with GitHub)
3. **Netlify** - https://netlify.com (sign up with GitHub)

**Time Required:** 10 minutes total

---

## STEP 1: Push to GitHub (2 minutes)

### 1.1 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `trip-compare`
3. Description: `Travel booking comparison platform with affiliate marketing`
4. Set to **Public** (required for free Render deployment)
5. **DO NOT** initialize with README (you already have one)
6. Click **"Create repository"**

### 1.2 Push Your Code

Copy the commands shown on GitHub (under "push an existing repository"), they'll look like this:

```bash
git remote add origin https://github.com/YOUR_USERNAME/trip-compare.git
git branch -M main
git push -u origin main
```

Run them in your terminal from the `/Users/swagatikamishra/trip-compare` directory.

✅ **Verification:** Refresh GitHub page - you should see all your files!

---

## STEP 2: Deploy Backend to Render (3 minutes)

### 2.1 Create Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect a repository"** → Find and select `trip-compare`
4. Click **"Connect"**

### 2.2 Configure Service

Fill in these **exact** settings:

```
Name: tripcompare-api
Region: Oregon (US West) or closest to you
Branch: main
Root Directory: (leave empty)
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn api.main:app --host 0.0.0.0 --port $PORT
Instance Type: Free
```

### 2.3 Add Environment Variables

Click **"Advanced"** → Scroll to **"Environment Variables"**

Add these variables one by one:

```
Key: DEBUG
Value: False

Key: DATABASE_URL
Value: sqlite:///./tripcompare.db

Key: TRAVELPAYOUTS_TOKEN
Value: fa478c260b19fb84ecba1b41be11cde1

Key: TRAVELPAYOUTS_MARKER
Value: tripcompare

Key: TRAVELPAYOUTS_HOST
Value: https://tripcompare.eu

Key: CORS_ORIGINS
Value: ["*"]

Key: RATE_LIMIT_PER_MINUTE
Value: 60
```

### 2.4 Deploy!

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for build to complete
3. You'll see "Live" with a green dot when ready

**Your API URL will be:** `https://tripcompare-api-XXXX.onrender.com`

### 2.5 Test Backend

Click on your service URL and add `/health` to test:
```
https://tripcompare-api-XXXX.onrender.com/health
```

You should see:
```json
{"status":"healthy","database":"connected","version":"1.0.0"}
```

✅ **Backend deployed successfully!** Copy this URL - you'll need it for the frontend.

---

## STEP 3: Deploy Frontend to Netlify (3 minutes)

### 3.1 Create New Site

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"Deploy with GitHub"**
4. Find and click on `trip-compare` repository
5. Click **"Deploy [your-username]/trip-compare"**

### 3.2 Configure Build Settings

Fill in these settings:

```
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

### 3.3 Add Environment Variable

**BEFORE deploying**, click **"Show advanced"** → **"New variable"**

```
Key: VITE_API_URL
Value: https://tripcompare-api-XXXX.onrender.com
```
*(Use YOUR Render URL from Step 2.4)*

### 3.4 Deploy!

1. Click **"Deploy [your-username]/trip-compare"**
2. Wait 2-3 minutes for build
3. You'll get a URL like: `https://random-name-12345.netlify.app`

### 3.5 Test Frontend

1. Click on the Netlify URL
2. You should see your TripCompare homepage
3. Try searching for a flight: LON → BCN

✅ **Frontend deployed successfully!**

---

## STEP 4: Update CORS (1 minute)

Now that you have your Netlify URL, update the backend CORS:

1. Go back to **Render dashboard**
2. Click on **tripcompare-api** service
3. Click **"Environment"** tab
4. Find **CORS_ORIGINS** and click **"Edit"**
5. Change value to:
   ```
   ["https://your-actual-site.netlify.app"]
   ```
   *(Replace with YOUR Netlify URL)*
6. Click **"Save Changes"**
7. Wait 1-2 minutes for redeployment

✅ **CORS updated!**

---

## STEP 5: WordPress Integration (1 minute)

### 5.1 Get Your Netlify URL

Copy your full Netlify URL, for example:
```
https://wonderful-tribble-abc123.netlify.app
```

### 5.2 Add to WordPress

1. Go to your WordPress admin: https://sabyayounet-brvqt.wordpress.com/wp-admin/
2. Create a **new page** or **edit existing page**
3. Add a **"Custom HTML"** block
4. Paste this code (replace URL with yours):

```html
<!-- TripCompare Full Page Embed -->
<style>
  .tripcompare-container {
    width: 100%;
    height: 100vh;
    min-height: 800px;
    border: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  .tripcompare-frame {
    width: 100%;
    height: 100%;
    border: none;
  }
</style>

<div class="tripcompare-container">
  <iframe
    class="tripcompare-frame"
    src="https://YOUR-SITE.netlify.app"
    title="TripCompare - Travel Search"
    allow="fullscreen"
    loading="lazy">
  </iframe>
</div>
```

5. Click **"Publish"** or **"Update"**

### 5.3 Alternative: Widget Embed (Smaller)

For a smaller embedded widget on any page:

```html
<!-- TripCompare Widget Embed -->
<div style="width: 100%; max-width: 1200px; margin: 20px auto;">
  <iframe
    src="https://YOUR-SITE.netlify.app"
    style="width: 100%; height: 600px; border: 1px solid #e0e0e0; border-radius: 8px;"
    title="TripCompare Search Widget"
    loading="lazy">
  </iframe>
</div>
```

✅ **WordPress integration complete!**

---

## 🎉 You're LIVE!

### Your Deployed URLs:

- **Backend API:** `https://tripcompare-api-XXXX.onrender.com`
- **Frontend App:** `https://your-site.netlify.app`
- **API Docs:** `https://tripcompare-api-XXXX.onrender.com/docs`
- **WordPress Page:** Your chosen WordPress page URL

### Test Everything:

1. ✅ Open your Netlify URL
2. ✅ Search for flights (LON → BCN)
3. ✅ Click on a deal (should open with affiliate tracking)
4. ✅ Subscribe to newsletter
5. ✅ Check WordPress page with embed

---

## 📊 Track Your Earnings

Go to Travelpayouts dashboard:
- https://www.travelpayouts.com/programs
- Monitor clicks and commissions
- All affiliate links have your marker ID

---

## 🔧 Important Notes

### Free Tier Limitations:

**Render (Backend):**
- ⚠️ Spins down after 15 minutes of inactivity
- First request after sleep: 30-60 seconds to wake up
- Solution: Upgrade to $7/month for always-on service

**Netlify (Frontend):**
- ✅ Always fast and available
- 100GB bandwidth/month on free tier

### Custom Domain (Optional):

**For Netlify:**
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Follow DNS instructions

**For WordPress:**
- Your WordPress site already has its domain
- The embed will work on any WordPress page

---

## 🆘 Troubleshooting

**Frontend shows "API Error":**
- Wait 2 minutes for Render to finish deploying
- Check VITE_API_URL is correct in Netlify
- Rebuild Netlify: Deploys → Trigger deploy

**CORS Error in Browser:**
- Update CORS_ORIGINS on Render with Netlify URL
- Make sure it's in array format: ["https://..."]

**Affiliate links missing marker:**
- Check TRAVELPAYOUTS_MARKER is set on Render
- Verify marker in Travelpayouts dashboard

**WordPress embed not showing:**
- Make sure you're using Custom HTML block (not Code block)
- Check iframe URL is correct
- Try opening Netlify URL directly to verify it works

---

## 📈 Next Steps

1. **Customize Your Site:**
   - Add your logo
   - Update colors/branding
   - Add more destinations

2. **Drive Traffic:**
   - Share on social media
   - Create blog posts on WordPress
   - SEO optimization

3. **Monitor & Optimize:**
   - Check Travelpayouts dashboard weekly
   - Monitor Render logs for errors
   - Track which destinations are popular

4. **Scale Up:**
   - When you get regular traffic, upgrade Render to $7/mo
   - Add custom domain
   - Implement advanced features

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed to Render
- [ ] Backend health check passing
- [ ] Frontend deployed to Netlify
- [ ] Frontend opens in browser
- [ ] CORS updated with Netlify URL
- [ ] Flight search working
- [ ] Affiliate links contain marker
- [ ] WordPress embed added
- [ ] All tests passing

---

## 🎯 Success!

Your TripCompare platform is now:
- ✅ Live and accessible worldwide
- ✅ Hosted 100% free
- ✅ Integrated with WordPress
- ✅ Earning affiliate commissions
- ✅ Ready to scale

**Start sharing and earning! 💰**
