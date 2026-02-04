# Deploy TripCompare to GoDaddy (s3riekart.nl)

## Overview
This guide walks you through deploying your TripCompare application to your GoDaddy domain **s3riekart.nl**.

## Architecture
- **Frontend**: Static React app (can be hosted on GoDaddy or Netlify with custom domain)
- **Backend**: FastAPI on Render.com (already deployed)
- **Domain**: s3riekart.nl (GoDaddy)

## Deployment Options

### Option 1: Host Frontend on Netlify + Point Domain to Netlify (RECOMMENDED)

This is the easiest option since your frontend is already on Netlify.

#### Step 1: Configure Custom Domain on Netlify

1. Go to Netlify Dashboard: https://app.netlify.com/
2. Select your site: `scintillating-dango-c2bea3`
3. Go to **Site settings** → **Domain management**
4. Click **Add custom domain**
5. Enter: `s3riekart.nl`
6. Click **Verify**
7. Netlify will provide DNS records to configure

#### Step 2: Configure DNS on GoDaddy

1. Go to GoDaddy Dashboard: https://dashboard.godaddy.com/
2. Navigate to **My Products** → **Domains**
3. Click on **s3riekart.nl** → **DNS**
4. Add these records:

**A Record (for apex domain):**
```
Type: A
Name: @
Value: 75.2.60.5
TTL: 600 seconds
```

**CNAME Record (for www subdomain):**
```
Type: CNAME
Name: www
Value: scintillating-dango-c2bea3.netlify.app
TTL: 600 seconds
```

**Alternative: ALIAS or ANAME Record** (if GoDaddy supports it)
```
Type: ALIAS
Name: @
Value: scintillating-dango-c2bea3.netlify.app
TTL: 600 seconds
```

#### Step 3: Enable HTTPS on Netlify

1. Go back to Netlify → **Domain settings**
2. Under **HTTPS**, click **Verify DNS configuration**
3. Once verified, click **Provision certificate**
4. Wait 1-2 minutes for SSL to activate

#### Step 4: Update Environment Variables

Make sure your frontend `.env` has:
```bash
VITE_API_URL=https://trip-compare.onrender.com
```

This is already configured, so no changes needed!

#### Step 5: Test Your Domain

Wait 5-10 minutes for DNS propagation, then visit:
- https://s3riekart.nl
- https://www.s3riekart.nl

Both should show your TripCompare application!

---

### Option 2: Host Frontend Directly on GoDaddy

If you want to host the frontend on GoDaddy's hosting, follow these steps:

#### Step 1: Build Production Frontend

```bash
cd /Users/swagatikamishra/trip-compare/frontend
npm run build
```

This creates a `dist/` folder with optimized production files.

#### Step 2: Upload to GoDaddy

1. Go to GoDaddy Dashboard → **Web Hosting**
2. Click **Manage** on your hosting plan
3. Open **File Manager** or use **FTP**
4. Navigate to `public_html` directory
5. Upload all files from `frontend/dist/` to `public_html/`

#### Step 3: Configure .htaccess for React Router

Create a `.htaccess` file in `public_html/`:

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

# Gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/x-javascript
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

#### Step 4: Test Your Site

Visit https://s3riekart.nl - your app should be live!

---

## Backend Configuration (Already Done)

Your backend is already deployed on Render.com:
- URL: https://trip-compare.onrender.com
- Status: ✅ Healthy
- CORS: Configured to accept requests from any domain

---

## DNS Propagation Time

After updating DNS records:
- **Initial propagation**: 5-15 minutes
- **Full propagation**: Up to 24-48 hours worldwide
- **Check propagation**: https://www.whatsmydns.net/#A/s3riekart.nl

---

## Troubleshooting

### Issue: "Site can't be reached"
**Solution**: Wait for DNS propagation (5-15 minutes)

### Issue: HTTP not HTTPS
**Solution**:
- Option 1 (Netlify): Enable SSL in Netlify settings
- Option 2 (GoDaddy): Purchase/enable SSL certificate in GoDaddy

### Issue: API calls fail (CORS errors)
**Solution**: Already configured! Backend accepts all origins.

### Issue: Blank page on refresh
**Solution**:
- Option 1: Add `.htaccess` redirect rules (see above)
- Option 2: Use Netlify (handles this automatically with `_redirects` file)

---

## Recommendation: Use Option 1 (Netlify + Custom Domain)

**Why?**
- ✅ Free SSL certificate (HTTPS)
- ✅ Automatic deployments from GitHub
- ✅ CDN for faster loading worldwide
- ✅ React Router handled automatically
- ✅ No manual file uploads needed
- ✅ Rollback to previous versions easily

**GoDaddy is great for domains, but Netlify is better for hosting React apps!**

---

## Next Steps

1. Choose Option 1 or Option 2 above
2. Follow the steps for your chosen option
3. Wait for DNS propagation
4. Test your live site at https://s3riekart.nl
5. Share your affiliate links and start earning! 💰

---

## Support

If you encounter issues:
1. Check DNS propagation: https://www.whatsmydns.net/
2. Verify Netlify SSL status
3. Check browser console for errors
4. Test backend health: https://trip-compare.onrender.com/health

---

**Your TripCompare affiliate travel site will be live at: https://s3riekart.nl** 🎉
