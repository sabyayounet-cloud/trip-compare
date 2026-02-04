# 🔧 Update Render Environment Variables - CRITICAL FIX

## ⚠️ IMPORTANT: This Fix is Required for Affiliate Links to Work!

The "Booking link not configured" error appears because the `TRAVELPAYOUTS_MARKER` environment variable on Render is set to `YOUR_MARKER_ID` instead of `tripcompare`.

---

## 🎯 Quick Fix (5 Minutes)

### **Step 1: Log into Render Dashboard**
1. Go to: https://dashboard.render.com
2. Log in with your account
3. Click on your service: **trip-compare**

### **Step 2: Update Environment Variable**
1. Click: **Environment** (left sidebar)
2. Find: `TRAVELPAYOUTS_MARKER`
3. Current value: `YOUR_MARKER_ID` ❌
4. Change to: `tripcompare` ✅
5. Click: **Save Changes**

### **Step 3: Trigger Redeployment**
After saving the environment variable:
1. Render will automatically redeploy your backend
2. Wait 2-3 minutes for deployment to complete
3. Check deployment status in the **Events** tab

### **Step 4: Re-seed Database**
The database needs fresh data with proper affiliate links:

**Option A: Via API (Easiest)**
Open this URL in your browser:
```
https://trip-compare.onrender.com/seed
```

You should see:
```json
{"message": "Database seeded successfully!"}
```

**Option B: Via Curl**
```bash
curl https://trip-compare.onrender.com/seed
```

### **Step 5: Verify Fix**
1. Go to: https://scintillating-dango-c2bea3.netlify.app/ (use Incognito window)
2. Click on any deal card (e.g., "Barcelona Beach Escape")
3. Should now redirect to Aviasales/Hotellook with `?marker=tripcompare` ✅
4. No more "Booking link not configured" error! 🎉

---

## 📋 Complete Environment Variables Reference

Here are ALL the environment variables that should be set on Render:

### **Required (Already Set):**
```
APP_NAME=TripCompare API
APP_VERSION=1.0.0
DEBUG=False
DATABASE_URL=sqlite:///./tripcompare.db
```

### **Travelpayouts (CRITICAL - Update These!):**
```
TRAVELPAYOUTS_TOKEN=fa478c260b19fb84ecba1b41be11cde1
TRAVELPAYOUTS_MARKER=tripcompare              ← CHANGE THIS!
TRAVELPAYOUTS_HOST=https://tripcompare.eu
```

### **CORS (Already Set):**
```
CORS_ORIGINS=["https://scintillating-dango-c2bea3.netlify.app"]
```

### **Optional (Can Add Later):**
```
BOOKING_AFFILIATE_ID=
GETYOURGUIDE_PARTNER_ID=
HOSTELWORLD_AFFILIATE_ID=
BREVO_API_KEY=
```

---

## 🔍 How to Verify It's Working

### **Test 1: Check Widget Config**
```bash
curl https://trip-compare.onrender.com/search/widget/config
```

Should return:
```json
{
  "token_configured": true,
  "marker": "tripcompare",    ← Should say "tripcompare", NOT "YOUR_MARKER_ID"
  ...
}
```

### **Test 2: Check Deals**
```bash
curl https://trip-compare.onrender.com/deals/featured
```

Each deal should have:
```json
{
  "affiliate_link": "https://www.aviasales.com/search/...?marker=tripcompare",
  "affiliate_provider": "aviasales",
  ...
}
```

**Before fix:**
```json
"affiliate_link": null  ❌
```

**After fix:**
```json
"affiliate_link": "https://www.aviasales.com/search/LON0415BCN04221?marker=tripcompare"  ✅
```

### **Test 3: Click a Deal**
1. Open frontend: https://scintillating-dango-c2bea3.netlify.app/
2. Click "Barcelona Beach Escape" deal
3. Should redirect to: `https://www.aviasales.com/search/LON0415BCN04221?marker=tripcompare`
4. Check URL contains: `marker=tripcompare` ✅

---

## 🎯 Why This Matters

### **Affiliate Tracking:**
- The `marker` parameter tracks YOUR commissions
- Without it, bookings won't be credited to you
- Example: `?marker=tripcompare` tells Travelpayouts this booking came from you

### **Revenue Impact:**
- ❌ Before: No marker → No commissions
- ✅ After: Correct marker → You earn 3-5% on every booking!

### **How It Works:**
1. User clicks deal on your site
2. Redirects to Aviasales/Hotellook with `?marker=tripcompare`
3. Travelpayouts tracks the referral
4. User books travel
5. You earn commission! 💰

---

## 🚨 Common Issues & Solutions

### **Issue 1: Still Shows "Booking link not configured"**

**Cause:** Old data in database with `null` affiliate links

**Solution:**
```bash
curl https://trip-compare.onrender.com/seed
```

This reseeds the database with proper affiliate links.

---

### **Issue 2: Marker Still Shows "YOUR_MARKER_ID"**

**Cause:** Render didn't reload the environment variable

**Solution:**
1. Go to Render dashboard
2. Click: **Manual Deploy** → **Deploy latest commit**
3. Wait 2-3 minutes
4. Check again: `curl https://trip-compare.onrender.com/search/widget/config`

---

### **Issue 3: Affiliate Link Opens But No Marker**

**Cause:** Frontend caching issue or old seed data

**Solution:**
1. Hard refresh frontend (Ctrl+Shift+R)
2. Re-seed database (curl to /seed endpoint)
3. Click deal again

---

## 📊 Monitoring Your Earnings

### **Travelpayouts Dashboard:**
1. Go to: https://www.travelpayouts.com
2. Log in to your account
3. Navigate to: **Statistics** → **My earnings**
4. Filter by marker: `tripcompare`
5. View clicks, conversions, and revenue!

### **What You'll See:**
- **Clicks:** Number of users who clicked your affiliate links
- **Bookings:** Number of completed bookings
- **Revenue:** Your commission earnings
- **Conversion Rate:** Clicks → Bookings percentage

### **Typical Earnings:**
- **Flights:** 1-3% commission (avg. €0.50 - €2 per booking)
- **Hotels:** 3-5% commission (avg. €2 - €5 per booking)
- **Packages:** 5-10% commission (avg. €5 - €20 per booking)

---

## ✅ Post-Fix Checklist

After updating the Render environment variable:

- [ ] Environment variable updated to `tripcompare`
- [ ] Render redeployed (check Events tab)
- [ ] Database re-seeded (visited `/seed` endpoint)
- [ ] Widget config shows correct marker (tested with curl)
- [ ] Featured deals have affiliate links (tested with curl)
- [ ] Frontend deals redirect properly (clicked in browser)
- [ ] URLs contain `?marker=tripcompare` parameter
- [ ] No more "Booking link not configured" errors!

---

## 🎓 Understanding the Code Changes

### **What Changed:**

**1. .env File (Local):**
```diff
- TRAVELPAYOUTS_MARKER=YOUR_MARKER_ID
+ TRAVELPAYOUTS_MARKER=tripcompare
```

**2. Seed Data (api/main.py):**
```diff
models.Deal(
    title="Barcelona Beach Escape",
    ...
-   affiliate_provider="skyscanner",
+   affiliate_provider="aviasales",
+   affiliate_link="https://www.aviasales.com/search/LON0415BCN04221?marker=tripcompare",
    ...
)
```

**3. Render Environment (Dashboard):**
```diff
- TRAVELPAYOUTS_MARKER=YOUR_MARKER_ID
+ TRAVELPAYOUTS_MARKER=tripcompare
```

### **How Affiliate Links Are Generated:**

**Flight Deals:**
- Format: `https://www.aviasales.com/search/{ORIGIN}{DDMM}{DEST}{DDMM}{PAX}?marker=tripcompare`
- Example: `LON0415BCN04221` = London to Barcelona, Apr 15-22, 1 passenger

**Hotel Deals:**
- Format: `https://search.hotellook.com?destination={CITY}&checkIn={DATE}&checkOut={DATE}&adults={NUM}&marker=tripcompare`
- Example: Amsterdam, May 15-18, 2 adults

---

## 🚀 Next Steps After Fix

### **1. Test All Features:**
- ✅ Flight search redirects correctly
- ✅ Hotel search redirects correctly
- ✅ Deal clicks redirect correctly
- ✅ Popular routes redirect correctly

### **2. Drive Traffic:**
- Share your site on social media
- SEO optimization
- Content marketing
- Email campaigns

### **3. Monitor & Optimize:**
- Check Travelpayouts dashboard weekly
- Identify popular routes
- Update deals with high-converting destinations
- A/B test different deal presentations

### **4. Scale Up:**
- Add more destinations
- Include seasonal deals
- Create email newsletters
- Add blog content

---

## 📞 Need Help?

If you're stuck or the affiliate links still aren't working:

### **Quick Debug Commands:**

**Check marker:**
```bash
curl https://trip-compare.onrender.com/search/widget/config | grep marker
```

**Check deals:**
```bash
curl https://trip-compare.onrender.com/deals/featured | grep affiliate_link
```

**Re-seed database:**
```bash
curl https://trip-compare.onrender.com/seed
```

### **Screenshot Required Info:**
- Render environment variables page
- Output of widget config curl command
- Output of deals featured curl command
- Browser console when clicking a deal

---

## 🎊 Success!

Once you complete these steps:
- ✅ Affiliate links will work
- ✅ Marker will be tracked
- ✅ You'll start earning commissions
- ✅ No more error messages!

**Your TripCompare platform is now fully monetized!** 🌍✈️💰

---

## 📚 Reference Links

- **Render Dashboard:** https://dashboard.render.com
- **Travelpayouts Dashboard:** https://www.travelpayouts.com
- **Frontend:** https://scintillating-dango-c2bea3.netlify.app/
- **Backend:** https://trip-compare.onrender.com
- **GitHub:** https://github.com/sabyayounet-cloud/trip-compare
