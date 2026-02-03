# 🚀 Deploy TripCompare - Let's Do This Together!

I'll guide you through each step. Follow along and you'll be live in 10 minutes!

---

## 🎯 What We're Doing

Deploying your app to **2 free platforms**:
1. **Render.com** - Backend API (FREE)
2. **Netlify** - Frontend app (FREE)

**Cost:** $0
**Time:** 10 minutes
**Result:** Fully working travel booking site!

---

## STEP 1: Create GitHub Account & Repository (3 minutes)

### 1.1 Create GitHub Account (if you don't have one)

1. Go to: **https://github.com/signup**
2. Enter your email
3. Create password
4. Choose username
5. Verify email

### 1.2 Create New Repository

1. Go to: **https://github.com/new**
2. Fill in:
   ```
   Repository name: trip-compare
   Description: Travel booking platform with affiliate marketing
   ✓ Public (must be public for free Render deployment)
   ✗ Do NOT check "Add a README"
   ```
3. Click **"Create repository"**

### 1.3 Push Your Code to GitHub

GitHub will show you commands. Copy and run them in your terminal:

```bash
# Make sure you're in the trip-compare directory
cd /Users/swagatikamishra/trip-compare

# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/trip-compare.git

# Push code
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME`** with your GitHub username!

If it asks for credentials:
- Username: your GitHub username
- Password: create a Personal Access Token at https://github.com/settings/tokens

✅ **Verify:** Refresh GitHub page - you should see all your files!

---

## STEP 2: Deploy Backend to Render (3 minutes)

### 2.1 Create Render Account

1. Go to: **https://render.com**
2. Click **"Get Started for Free"**
3. Sign up with GitHub (easiest) or email
4. Verify your email

### 2.2 Create Web Service

1. Go to: **https://dashboard.render.com**
2. Click **"New +"** (top right)
3. Click **"Web Service"**
4. If first time, click **"Connect account"** → Allow GitHub access
5. Find **"trip-compare"** in the list
6. Click **"Connect"**

### 2.3 Configure Service

Fill in these **exact** settings:

```
Name: tripcompare-api
Region: Oregon (US West) - or closest to you
Branch: main
Root Directory: (leave blank)
Runtime: Python 3

Build Command:
pip install -r requirements.txt

Start Command:
uvicorn api.main:app --host 0.0.0.0 --port $PORT

Instance Type: Free
```

### 2.4 Add Environment Variables

Scroll down to **"Environment Variables"**

Click **"Add Environment Variable"** and add these **one by one**:

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

### 2.5 Deploy!

1. Click **"Create Web Service"** (bottom)
2. Wait 3-5 minutes (watch the logs)
3. When you see **"Live"** with green dot → Success! 🎉

### 2.6 Get Your API URL

At the top, you'll see your URL:
```
https://tripcompare-api-RANDOM.onrender.com
```

**COPY THIS URL** - you'll need it for the frontend!

### 2.7 Test Backend

Click on your URL and add `/health`:
```
https://tripcompare-api-RANDOM.onrender.com/health
```

You should see:
```json
{"status":"healthy","database":"connected","version":"1.0.0"}
```

✅ **Backend deployed!** Copy your full URL for next step.

---

## STEP 3: Deploy Frontend to Netlify (3 minutes)

### 3.1 Create Netlify Account

1. Go to: **https://www.netlify.com**
2. Click **"Sign up"**
3. Choose **"GitHub"** (easiest)
4. Authorize Netlify

### 3.2 Deploy Site

1. Go to: **https://app.netlify.com**
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"Deploy with GitHub"**
4. Click **"Configure Netlify on GitHub"** (if first time)
5. Select **"Only select repositories"**
6. Choose **"trip-compare"**
7. Click **"Install"**

### 3.3 Configure Build

You'll see the repository. Click on **"trip-compare"**

Fill in:

```
Site name: (leave default or choose custom)
Branch to deploy: main
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

### 3.4 Add Environment Variable

**BEFORE clicking Deploy:**

1. Click **"Show advanced"**
2. Click **"New variable"**
3. Add:
   ```
   Key: VITE_API_URL
   Value: https://tripcompare-api-RANDOM.onrender.com
   ```
   **Use YOUR Render URL from Step 2.6!**

### 3.5 Deploy!

1. Click **"Deploy [your-username]/trip-compare"**
2. Wait 2-3 minutes (watch the build log)
3. When done, you'll see your site URL:
   ```
   https://random-name-12345.netlify.app
   ```

### 3.6 Test Frontend

Click on your Netlify URL. You should see:
- TripCompare homepage
- Search form for flights
- Deals section

Try searching: LON → BCN

✅ **Frontend deployed!**

---

## STEP 4: Update Backend CORS (1 minute)

Now connect backend and frontend:

1. Go back to **Render dashboard**
2. Click on **"tripcompare-api"** service
3. Click **"Environment"** tab (left sidebar)
4. Find **"CORS_ORIGINS"**
5. Click the pencil icon to edit
6. Change value to:
   ```
   ["https://your-actual-netlify-url.netlify.app"]
   ```
   **Use YOUR Netlify URL!**
7. Click **"Save Changes"**
8. Wait 1-2 minutes for automatic redeploy

✅ **CORS updated!**

---

## 🎉 YOU'RE LIVE!

Your TripCompare is now deployed:

### Your URLs:
- **Backend API:** `https://tripcompare-api-RANDOM.onrender.com`
- **Frontend App:** `https://your-site.netlify.app`
- **API Docs:** `https://tripcompare-api-RANDOM.onrender.com/docs`

### Test Everything:
1. Open your Netlify URL
2. Search for flights (LON → BCN)
3. Click on a deal
4. Verify affiliate link opens with marker
5. Try newsletter signup

---

## 📊 Monitor Your App

**Render Dashboard:**
- https://dashboard.render.com
- Check logs, uptime, memory

**Netlify Dashboard:**
- https://app.netlify.com
- View analytics, deploys

**Travelpayouts Dashboard:**
- https://www.travelpayouts.com/programs
- Track clicks and commissions

---

## 🔧 Optional: Custom Domain

### For Netlify (Frontend):

1. Go to Netlify site settings
2. Click **"Domain settings"**
3. Click **"Add custom domain"**
4. Follow DNS setup instructions

Free SSL included!

---

## 🆘 Common Issues

### "Build failed" on Render
- Check logs for Python version errors
- Verify requirements.txt has all dependencies
- Solution: Usually just retry the build

### "Build failed" on Netlify
- Check if Node.js version is compatible
- Verify package.json is correct
- Solution: Set Node version in Site settings

### "API not found" on frontend
- Check VITE_API_URL is correct
- Verify Render backend is deployed
- Solution: Rebuild Netlify with correct URL

### CORS error in browser
- Update CORS_ORIGINS on Render
- Use array format: ["https://..."]
- Wait for Render to redeploy

---

## 🎯 What to Do Next

1. **Share your site!** Post on social media
2. **Monitor earnings** at Travelpayouts dashboard
3. **Customize branding** (colors, logo, content)
4. **Add to WordPress** (follow WORDPRESS_INTEGRATION.md)
5. **Drive traffic** to start earning!

---

## 💰 Free Tier Limits

**Render (Backend):**
- 750 hours/month (always on)
- Spins down after 15 min inactivity
- First request after sleep: 30-60 sec
- Upgrade to $7/mo for always-on

**Netlify (Frontend):**
- 100GB bandwidth/month
- 300 build minutes/month
- Always fast, no spin-down
- Upgrade at $19/mo if needed

---

## ✅ Deployment Complete!

You now have:
- ✅ Free backend hosting
- ✅ Free frontend hosting
- ✅ Automatic HTTPS
- ✅ GitHub auto-deploy
- ✅ Affiliate tracking working
- ✅ Ready to earn commissions!

**Total Cost: $0/month**
**Total Time: ~10 minutes**

🎉 **Congratulations! You're live!** 🎉

Start promoting and earning! 💰
