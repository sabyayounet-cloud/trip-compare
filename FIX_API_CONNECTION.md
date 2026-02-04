# 🔧 Fix API Connection - Frontend to Backend

## ✅ **GOOD NEWS:**
- ✅ Your frontend is NOW loading at https://scintillating-dango-c2bea3.netlify.app/
- ✅ Your backend API is working at https://trip-compare.onrender.com

## ❌ **THE PROBLEM:**
Frontend shows "API Not Connected" because:
1. Netlify environment variable `VITE_API_URL` is not set
2. Backend CORS doesn't allow requests from your Netlify URL

## 🔧 **QUICK FIX (5 minutes):**

### Step 1: Add Environment Variable to Netlify

1. **Go to:** https://app.netlify.com
2. **Click** on your site: `scintillating-dango-c2bea3`
3. **Go to:** Site settings → Build & deploy → Environment
4. **Click:** "Add a variable" or "Edit variables"
5. **Add:**
   ```
   Key: VITE_API_URL
   Value: https://trip-compare.onrender.com
   ```
6. **Click:** "Save"
7. **Trigger redeploy:**
   - Go to "Deploys" tab
   - Click "Trigger deploy" → "Clear cache and deploy site"

**Wait 2-3 minutes for rebuild**

### Step 2: Update CORS on Backend (Render)

1. **Go to:** https://dashboard.render.com
2. **Click** on your service: `tripcompare-api`
3. **Click:** "Environment" (left sidebar)
4. **Find:** `CORS_ORIGINS`
5. **Click** the pencil icon to edit
6. **Change value to:**
   ```
   ["https://scintillating-dango-c2bea3.netlify.app"]
   ```
7. **Click:** "Save Changes"

**Wait 1-2 minutes for automatic redeploy**

---

## 🎯 **AFTER BOTH STEPS:**

1. **Wait 3-5 minutes total** for both services to redeploy
2. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
3. **Refresh:** https://scintillating-dango-c2bea3.netlify.app/
4. **You should see:** Working TripCompare app with data!

---

## ✅ **VERIFICATION:**

After fixing, you should see:
- ✅ TripCompare homepage loads
- ✅ Deals section shows 4 deals
- ✅ Destinations section populated
- ✅ Search form working
- ✅ No "API Not Connected" error

---

## 🆘 **TROUBLESHOOTING:**

### Still seeing "API Not Connected"?

**Check 1: Verify Environment Variable**
```bash
# The frontend should be making requests to:
https://trip-compare.onrender.com

# NOT to:
http://localhost:8000
```

**Check 2: Browser Console**
1. Press F12 in browser
2. Go to Console tab
3. Look for errors like:
   - "CORS error" → Backend CORS not updated
   - "Failed to fetch" → Environment variable not set
   - "net::ERR_NAME_NOT_RESOLVED" → Wrong API URL

**Check 3: Network Tab**
1. Press F12 → Network tab
2. Refresh page
3. Look for request to `/health`
4. Check if it goes to `trip-compare.onrender.com`

### Quick Test Commands:

**Test Backend Directly:**
```bash
curl https://trip-compare.onrender.com/health
# Should return: {"status":"healthy"...}
```

**Test from Browser:**
Open browser console and run:
```javascript
fetch('https://trip-compare.onrender.com/health')
  .then(r => r.json())
  .then(console.log)
```

If this works → Environment variable issue
If this fails with CORS → Backend CORS issue

---

## 🎬 **STEP-BY-STEP VISUAL GUIDE:**

### Netlify Environment Variable:

1. **Login to Netlify:** https://app.netlify.com
   ```
   → Sites
   → scintillating-dango-c2bea3
   → Site settings
   ```

2. **Navigate to Environment:**
   ```
   → Build & deploy (left menu)
   → Environment (expand section)
   → Environment variables
   ```

3. **Add Variable:**
   ```
   → Click "Add a variable" or "Edit variables"
   → Key: VITE_API_URL
   → Value: https://trip-compare.onrender.com
   → Save
   ```

4. **Redeploy:**
   ```
   → Deploys (top menu)
   → Trigger deploy (button)
   → Clear cache and deploy site
   → Wait 2-3 min
   ```

### Render CORS Update:

1. **Login to Render:** https://dashboard.render.com
   ```
   → Services
   → tripcompare-api
   ```

2. **Update Environment:**
   ```
   → Environment (left menu)
   → Find: CORS_ORIGINS
   → Click pencil icon
   → Value: ["https://scintillating-dango-c2bea3.netlify.app"]
   → Save Changes
   → Wait 1-2 min for auto-redeploy
   ```

---

## 📊 **CURRENT STATUS:**

```
✅ Backend API: LIVE & HEALTHY
   URL: https://trip-compare.onrender.com
   Status: {"status":"healthy","database":"connected"}

✅ Frontend: LIVE BUT NOT CONNECTED
   URL: https://scintillating-dango-c2bea3.netlify.app
   Issue: Missing VITE_API_URL + CORS not updated

⏳ NEXT: Apply both fixes above
```

---

## 🎯 **EXPECTED RESULT:**

After applying both fixes and waiting 3-5 minutes:

**Your site will show:**
```
✅ TripCompare homepage
✅ Featured deals (Barcelona, Rome, Amsterdam, Paris)
✅ Trending destinations with images
✅ Working search form
✅ Newsletter signup
✅ All connected to backend API
```

**Test it:**
```
1. Search: LON → BCN
2. Click "Search Flights"
3. Should redirect to Aviasales with marker=tripcompare
```

---

## 💡 **WHY THIS HAPPENS:**

**Environment Variables:**
- Vite (your build tool) needs `VITE_API_URL` at BUILD TIME
- This tells the frontend where the backend is
- Without it, frontend tries `localhost:8000` (doesn't exist in production)

**CORS (Cross-Origin Resource Sharing):**
- Backend needs to explicitly allow requests from your frontend domain
- Without it, browser blocks requests for security
- This is a security feature, not a bug

---

## ✅ **CHECKLIST:**

After fixes are applied:

- [ ] Environment variable added to Netlify
- [ ] Netlify redeployed with new environment variable
- [ ] CORS updated on Render backend
- [ ] Render redeployed with new CORS
- [ ] Waited 3-5 minutes total
- [ ] Cleared browser cache
- [ ] Refreshed https://scintillating-dango-c2bea3.netlify.app/
- [ ] Site shows data from backend
- [ ] No more "API Not Connected" error
- [ ] Flight search works
- [ ] Deals are visible

---

## 🚀 **ONCE IT WORKS:**

You'll have:
- ✅ Full TripCompare application live
- ✅ Frontend: https://scintillating-dango-c2bea3.netlify.app
- ✅ Backend: https://trip-compare.onrender.com
- ✅ Both connected and working
- ✅ Ready for WordPress integration
- ✅ Ready to earn affiliate commissions!

---

**Apply the 2 fixes above, wait 5 minutes, then refresh!** 🎉
