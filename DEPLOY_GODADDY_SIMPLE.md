# Deploy TripCompare to GoDaddy - Simple Guide

## 🎯 Goal
Host your TripCompare travel booking site at **https://s3riekart.nl** using GoDaddy hosting.

---

## Prerequisites

✅ GoDaddy domain: `s3riekart.nl` (you have this)
✅ GoDaddy web hosting plan (check if you have this)
✅ Backend running on Render.com (already deployed)

---

## Step-by-Step Deployment

### Step 1: Check Your GoDaddy Hosting

1. Go to: https://dashboard.godaddy.com/
2. Click **"My Products"**
3. Look for **"Web Hosting"** section

**If you see web hosting:**
- ✅ Great! Proceed to Step 2

**If you DON'T see web hosting:**
- You need to purchase hosting first
- OR use alternative free options (Vercel, GitHub Pages)
- Let me know and I'll guide you!

---

### Step 2: Build Production Files

Open Terminal and run:

```bash
cd /Users/swagatikamishra/trip-compare
./deploy-to-godaddy.sh
```

This will:
- Install dependencies
- Build optimized production bundle
- Create files in `frontend/dist/` folder

**Expected output:** "✅ Production build complete!"

---

### Step 3: Access GoDaddy File Manager

1. Go to: https://dashboard.godaddy.com/
2. Click **"My Products"**
3. Under **"Web Hosting"**, click **"Manage"**
4. Click **"File Manager"** button
5. A new window opens with your files

---

### Step 4: Upload Files to GoDaddy

#### Option A: Using File Manager (Easiest)

1. In File Manager, navigate to `public_html` folder
2. **Delete all existing files** in `public_html` (if any)
3. Click **"Upload"** button
4. Select ALL files from your local:
   `/Users/swagatikamishra/trip-compare/frontend/dist/`
5. Upload everything (index.html, assets folder, etc.)
6. Wait for upload to complete

#### Option B: Using FTP (Advanced)

1. In GoDaddy Hosting panel, find FTP credentials
2. Use FileZilla or another FTP client:
   - Host: `ftp.s3riekart.nl` (or IP from GoDaddy)
   - Username: (from GoDaddy panel)
   - Password: (from GoDaddy panel)
   - Port: 21
3. Upload all files from `frontend/dist/` to `public_html/`

---

### Step 5: Create .htaccess File

This is **critical** for React Router to work!

In File Manager, create a new file in `public_html/`:

**Filename:** `.htaccess`

**Contents:**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

**How to create .htaccess:**
1. Click **"+ File"** in File Manager
2. Name it: `.htaccess`
3. Right-click → **"Edit"**
4. Paste the content above
5. Save

---

### Step 6: Configure DNS (Already Done?)

Your domain `s3riekart.nl` should already point to GoDaddy hosting by default.

**To verify:**
1. Go to GoDaddy Dashboard
2. My Products → Domains → s3riekart.nl → DNS
3. Check if you have an **A Record** pointing to GoDaddy's IP

**Default GoDaddy DNS:**
```
A Record:
Name: @
Points to: [GoDaddy server IP - usually auto-configured]
```

If NOT configured, check your hosting panel for the correct IP address.

---

### Step 7: Enable HTTPS/SSL

For secure connections (https://):

1. Go to GoDaddy Hosting panel
2. Look for **"SSL Certificates"**
3. If you see a free SSL option, enable it
4. If not available, you may need to purchase SSL ($$$)

**Alternative (Free SSL):**
- Use Cloudflare (free plan)
- Point DNS to Cloudflare
- Get free SSL certificate
- Cloudflare proxies to GoDaddy

---

### Step 8: Test Your Site

Visit your site:
- http://s3riekart.nl
- http://www.s3riekart.nl

**What you should see:**
✅ TripCompare homepage loads
✅ Search forms work
✅ Can navigate between tabs (Flights, Hotels)
✅ API calls work (search functionality)

**Troubleshooting:**
- If blank page: Check .htaccess file
- If API errors: Check browser console
- If 404 errors: Re-upload files
- If slow: Wait for DNS propagation (5-15 min)

---

## Verify Everything Works

### Test Checklist:
- [ ] Homepage loads at s3riekart.nl
- [ ] Can switch between Flights/Hotels tabs
- [ ] Search form fields work
- [ ] City autocomplete works
- [ ] Search button works
- [ ] Results display (or redirect to booking)
- [ ] "Book Now" buttons have affiliate tracking
- [ ] Deals section shows deals
- [ ] Email subscription works

---

## Backend Status (No Changes Needed)

Your backend is already live and configured:
- ✅ URL: https://trip-compare.onrender.com
- ✅ CORS: Accepts all domains
- ✅ API: Working properly

No backend changes needed! 🎉

---

## File Structure on GoDaddy

After upload, `public_html/` should look like:

```
public_html/
├── .htaccess
├── index.html
├── assets/
│   ├── index-abc123.js
│   ├── index-xyz789.css
│   └── [other asset files]
└── [other files from dist/]
```

---

## Updating Your Site Later

When you make changes:

1. Edit code locally
2. Run: `./deploy-to-godaddy.sh`
3. Upload new files from `frontend/dist/` to GoDaddy
4. Overwrite old files
5. Clear browser cache and refresh

**Tip:** Keep your GitHub repo updated so you don't lose changes!

---

## Cost Summary

**Current costs:**
- ✅ Domain: Already paid (GoDaddy)
- ✅ Backend: Free (Render.com free tier)
- ❓ Frontend hosting: Check if included with domain
- ❓ SSL certificate: May need to purchase or use Cloudflare

**Total: $0 - $80/year** (depending on hosting plan)

---

## Alternative: Free Hosting Options

If GoDaddy hosting is too expensive:

### Vercel (Recommended - Free)
- Free hosting for frontend
- Automatic deployments
- Free SSL
- Custom domain support
- Similar to Netlify but you can keep using it

### GitHub Pages (Free)
- Free for public repos
- Easy setup with gh-pages
- Custom domain support
- No SSL by default (use Cloudflare)

Let me know if you want instructions for these!

---

## Need Help?

**Common Issues:**

1. **"I don't have web hosting on GoDaddy"**
   → Let's use Vercel (free) instead

2. **"Files won't upload"**
   → Try FTP instead of File Manager

3. **"Site shows 404 error"**
   → Check .htaccess file is present and correct

4. **"Search doesn't work"**
   → Check browser console for API errors

5. **"No HTTPS (no padlock)"**
   → Enable SSL in GoDaddy or use Cloudflare

Ask me if you need help with any step! 🚀
