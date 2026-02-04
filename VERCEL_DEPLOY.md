# Deploy TripCompare to Vercel - Step by Step

## 🎯 Goal: Deploy to Vercel (FREE) and use your domain s3riekart.nl

---

## STEP 1: Sign Up for Vercel (2 minutes)

1. Go to: https://vercel.com/signup
2. Click: **"Continue with GitHub"**
3. Log in with your GitHub credentials
4. Click: **"Authorize Vercel"** when asked
5. ✅ You're now in Vercel Dashboard!

---

## STEP 2: Import Your Project (3 minutes)

### 2.1: Start Import
1. In Vercel Dashboard, click: **"Add New..."** button (top right)
2. Click: **"Project"** from dropdown

### 2.2: Select Repository
1. You'll see a list of your GitHub repositories
2. Find: **"trip-compare"** in the list
3. Click: **"Import"** button next to it

### 2.3: Configure Project

You'll see a configuration form. Fill it in exactly like this:

**Project Name:**
```
tripcompare
```
(or leave the default)

**Framework Preset:**
```
Vite
```
(Select from dropdown)

**Root Directory:**
- Click **"Edit"** next to Root Directory
- Type: `frontend`
- Click **"Continue"**

**Build and Output Settings:**
```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```
(These should be auto-detected)

**Environment Variables:**
Click **"Add Environment Variable"**

Add this variable:
```
Name:  VITE_API_URL
Value: https://trip-compare.onrender.com
```

Click **"Add"** to save it.

### 2.4: Deploy!
1. Click the big blue **"Deploy"** button
2. Wait 1-2 minutes (you'll see a build progress animation)
3. ✅ Success! You'll see "Congratulations!" message

---

## STEP 3: Get Your Vercel URL (1 minute)

1. After deployment, you'll see: "Visit" button
2. Click **"Visit"** to see your live site
3. Your site is now live at: `https://tripcompare.vercel.app` (or similar)
4. **Test it:** Make sure it loads properly!

---

## STEP 4: Add Custom Domain s3riekart.nl (5 minutes)

### 4.1: Add Domain in Vercel
1. In your Vercel project dashboard
2. Click **"Settings"** tab at top
3. Click **"Domains"** in left sidebar
4. In the input box, type: `s3riekart.nl`
5. Click **"Add"**

### 4.2: Also Add www Subdomain
1. In the same domain input
2. Type: `www.s3riekart.nl`
3. Click **"Add"**

### 4.3: Get DNS Records
Vercel will show you DNS records to add. You'll see something like:

**For s3riekart.nl (apex domain):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www.s3riekart.nl:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Write these down or keep the tab open!**

---

## STEP 5: Configure DNS in GoDaddy (5 minutes)

### 5.1: Go to GoDaddy DNS Settings
1. Go to: https://dashboard.godaddy.com/
2. Click: **"My Products"**
3. Click on: **"s3riekart.nl"** domain
4. Click: **"DNS"** button (or "Manage DNS")

### 5.2: Delete Old Records (if any)
1. Look for existing A records or CNAME records
2. Delete any A record for `@` (apex)
3. Delete any CNAME for `www`

### 5.3: Add New A Record
1. Click **"Add"** button (or "+ Add Record")
2. Select: **"A"** from Type dropdown
3. Fill in:
   ```
   Type: A
   Name: @
   Value: [IP from Vercel - e.g., 76.76.21.21]
   TTL: 600 seconds (or default)
   ```
4. Click **"Save"**

### 5.4: Add New CNAME Record
1. Click **"Add"** button again
2. Select: **"CNAME"** from Type dropdown
3. Fill in:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com (or whatever Vercel showed)
   TTL: 600 seconds (or default)
   ```
4. Click **"Save"**

### 5.5: Done!
✅ DNS records configured in GoDaddy!

---

## STEP 6: Wait for DNS Propagation (5-15 minutes)

1. DNS changes take 5-15 minutes to propagate
2. Go back to Vercel Dashboard
3. Vercel will automatically verify the DNS records
4. When verified, you'll see green checkmarks ✅

---

## STEP 7: Test Your Live Site! (1 minute)

After DNS propagates (wait 10-15 minutes):

1. Open incognito/private browser window
2. Go to: **https://s3riekart.nl**
3. Also try: **https://www.s3riekart.nl**

**What you should see:**
✅ TripCompare homepage loads
✅ URL shows your custom domain
✅ Padlock icon (HTTPS/SSL) - Secure!
✅ Search forms work
✅ Everything styled properly

---

## Automatic Updates

Now whenever you push code to GitHub:
1. Vercel automatically detects the change
2. Builds new version
3. Deploys automatically
4. ✅ Your site updates in 1-2 minutes!

---

## Check DNS Propagation Status

Visit: https://www.whatsmydns.net/#A/s3riekart.nl

This shows if your DNS has propagated worldwide.

---

## Troubleshooting

### Problem: "Invalid Configuration"
**Solution:** Make sure Root Directory is set to `frontend`

### Problem: "Build Failed"
**Solution:**
- Check that Environment Variable is added: `VITE_API_URL`
- Make sure Build Command is: `npm run build`

### Problem: "Domain verification failed"
**Solution:**
- Double-check DNS records in GoDaddy
- Make sure A record points to correct Vercel IP
- Wait 15 minutes for DNS propagation

### Problem: "Site shows 404"
**Solution:**
- Check Output Directory is set to: `dist`
- Redeploy from Vercel dashboard

---

## Summary

✅ Vercel account created
✅ Project imported from GitHub
✅ Environment variables configured
✅ Deployed to Vercel URL
✅ Custom domain added: s3riekart.nl
✅ DNS configured in GoDaddy
✅ Free SSL certificate active
✅ Auto-deploy from GitHub enabled

**Total time: 15-20 minutes**
**Cost: $0 - Completely FREE!** 🎉

Your site is live at: **https://s3riekart.nl**

---

## Next Steps

1. Test all functionality (search, booking links)
2. Share your affiliate links
3. Start earning commissions! 💰

---

## Need Help?

If you get stuck at any step, let me know:
- What step number you're on
- What you see on screen
- Any error messages

I'm here to help! 🚀
