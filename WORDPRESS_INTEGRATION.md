# 🔌 WordPress Integration Guide for TripCompare

Complete guide to embed TripCompare into your WordPress site.

---

## 📋 Overview

You can integrate TripCompare into WordPress in three ways:

1. **Full Page Embed** - Entire page dedicated to TripCompare
2. **Widget Embed** - Search widget on any post/page
3. **Sidebar Widget** - Compact widget in sidebar

All methods work with your WordPress site: **https://sabyayounet-brvqt.wordpress.com**

---

## ✅ Prerequisites

Before integrating with WordPress, you MUST:

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Netlify
3. ✅ Get your Netlify URL (e.g., `https://your-site.netlify.app`)

**Follow `DEPLOY_NOW.md` first if you haven't deployed yet!**

---

## 🎯 Option 1: Full Page Embed (Recommended)

Creates a dedicated page on WordPress with full TripCompare experience.

### Step 1: Deploy First

Make sure you've deployed to Netlify and have your URL.

### Step 2: Create WordPress Page

1. Go to: https://sabyayounet-brvqt.wordpress.com/wp-admin/post-new.php?post_type=page
2. Click **"+"** (Add block)
3. Search for **"Custom HTML"**
4. Click on it

### Step 3: Add Embed Code

Copy the code from `wordpress-embed-fullpage.html`:

```html
<style>
  .tripcompare-fullpage {
    width: 100%;
    min-height: 100vh;
    height: 100vh;
    margin: 0;
    padding: 0;
    position: relative;
    overflow: hidden;
  }
  .tripcompare-fullpage iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
  }
  .tripcompare-loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }
  .tripcompare-spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>

<div class="tripcompare-fullpage">
  <div class="tripcompare-loading" id="tripcompare-loader">
    <div class="tripcompare-spinner"></div>
    <p style="color: #666;">Loading TripCompare...</p>
  </div>
  <iframe
    id="tripcompare-iframe"
    src="https://YOUR-SITE-URL.netlify.app"
    title="TripCompare - Travel Search"
    allow="fullscreen"
    onload="document.getElementById('tripcompare-loader').style.display='none';">
  </iframe>
</div>
```

**IMPORTANT:** Replace `YOUR-SITE-URL.netlify.app` with your actual Netlify URL!

### Step 4: Publish

1. Give the page a title: "Travel Search" or "Book Flights"
2. Click **"Publish"** (top right)
3. View your page!

✅ **Done!** You now have a full TripCompare page on WordPress.

---

## 🎨 Option 2: Widget Embed

Embed TripCompare as a widget within any blog post or page.

### Step 1: Create or Edit Post/Page

1. Go to any post/page editor
2. Click **"+"** where you want the widget
3. Search for **"Custom HTML"**
4. Click on it

### Step 2: Add Widget Code

Copy code from `wordpress-embed-widget.html`:

```html
<style>
  .tripcompare-widget {
    width: 100%;
    max-width: 1200px;
    margin: 30px auto;
  }
  .tripcompare-widget-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 12px 12px 0 0;
    text-align: center;
  }
  .tripcompare-widget-container {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0 0 12px 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  .tripcompare-widget-frame {
    width: 100%;
    height: 600px;
    border: none;
  }
</style>

<div class="tripcompare-widget">
  <div class="tripcompare-widget-header">
    <h3>✈️ Find the Best Travel Deals</h3>
    <p>Compare flights, hotels, and experiences</p>
  </div>
  <div class="tripcompare-widget-container">
    <iframe
      class="tripcompare-widget-frame"
      src="https://YOUR-SITE-URL.netlify.app"
      title="TripCompare Widget"
      allow="fullscreen">
    </iframe>
  </div>
</div>
```

**Replace the URL** with your Netlify URL!

### Step 3: Publish

Click **"Update"** or **"Publish"**

✅ **Widget embedded!** Works great in blog posts about travel.

---

## 📌 Option 3: Sidebar Widget

Add a compact TripCompare widget to your WordPress sidebar.

### Step 1: Go to Widgets

1. Go to: https://sabyayounet-brvqt.wordpress.com/wp-admin/widgets.php
2. Or: Appearance → Widgets

### Step 2: Add Custom HTML Widget

1. Find **"Custom HTML"** in available widgets
2. Drag it to your sidebar (or footer)
3. Click to expand it

### Step 3: Add Sidebar Code

Copy code from `wordpress-embed-sidebar.html`:

```html
<style>
  .tripcompare-sidebar-widget {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
  }
  .tripcompare-sidebar-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px;
    text-align: center;
  }
  .tripcompare-sidebar-link {
    display: inline-block;
    background: #3b82f6;
    color: white !important;
    padding: 12px 24px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
  }
</style>

<div class="tripcompare-sidebar-widget">
  <div class="tripcompare-sidebar-header">
    <h4>✈️ Travel Deals</h4>
  </div>
  <div style="padding: 16px; text-align: center;">
    <a href="https://YOUR-SITE-URL.netlify.app"
       target="_blank"
       class="tripcompare-sidebar-link">
      Search Flights & Hotels
    </a>
  </div>
</div>
```

**Replace the URL** with your Netlify URL!

### Step 4: Save

Click **"Save"** button

✅ **Sidebar widget active!** Appears on all pages.

---

## 🎨 Customization Tips

### Change Colors

In the CSS, modify these values:

```css
/* Primary gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Change to your brand colors */
background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);

/* Button color */
background: #3b82f6;  /* Change this */
```

### Adjust Height

For widget embed, change iframe height:

```html
<iframe
  style="height: 800px;"  <!-- Change from 600px -->
  ...>
</iframe>
```

### Add Your Branding

In widget header, update text:

```html
<h3>✈️ Find Your Next Adventure</h3>
<p>Exclusive deals from [Your Site Name]</p>
```

---

## 🔍 WordPress.com Limitations

**Important:** WordPress.com has restrictions based on your plan:

### Free Plan
- ❌ Cannot add Custom HTML blocks
- ❌ Cannot use iframes
- **Solution:** Upgrade to WordPress.com Business plan ($25/month)

### Personal Plan ($4/month)
- ❌ Still cannot add Custom HTML
- **Solution:** Upgrade to Business plan

### Business Plan ($25/month)
- ✅ Can add Custom HTML blocks
- ✅ Can embed iframes
- ✅ Full control over content

### Alternative for Free Plan Users

If you're on the free plan, create a simple text link instead:

1. Create a new page/post
2. Add a **Button** block
3. Set link to your Netlify URL
4. Text: "Search Flights & Hotels"

Users will be redirected to your full TripCompare site on Netlify.

---

## 🚀 Best Practices

### 1. Page Template

For full-page embed, use a **Full Width** template:
- Edit page → Settings → Template → Full Width

### 2. Remove Sidebar

For better UX on full-page embed:
- Edit page → Settings → Hide sidebar

### 3. SEO Optimization

Add meta description to your WordPress page:
```
Find the best travel deals on flights, hotels, and experiences across Europe. Compare prices from 100+ providers and save money on your next trip.
```

### 4. Menu Link

Add to navigation menu:
- Appearance → Menus
- Add your TripCompare page
- Label: "Search Flights" or "Travel Deals"

---

## 🧪 Testing Checklist

After embedding, verify:

- [ ] iframe loads correctly
- [ ] Search functionality works
- [ ] Affiliate links contain your marker
- [ ] Responsive on mobile devices
- [ ] No console errors (F12 → Console)
- [ ] Fast loading time
- [ ] Links open in new tab

---

## 🆘 Troubleshooting

### Issue: "Custom HTML" block not available

**Cause:** WordPress.com Free/Personal plan
**Solution:** Upgrade to Business plan or use direct link instead

### Issue: iframe showing "Connection refused"

**Cause:** Netlify URL incorrect or not deployed
**Solution:**
1. Verify Netlify deployment is live
2. Check URL spelling (no typos)
3. Ensure URL starts with `https://`

### Issue: Page not loading inside iframe

**Cause:** X-Frame-Options blocking
**Solution:** This shouldn't happen with Netlify, but if it does:
1. Check Netlify deployment settings
2. Verify no custom headers blocking iframes

### Issue: Widget too small/large

**Solution:** Adjust height in CSS:
```css
height: 600px;  /* Change to 800px or any value */
```

---

## 📈 Analytics Integration

### Track Iframe Interactions

Add this JavaScript to track when users interact with TripCompare:

```html
<script>
window.addEventListener('message', function(event) {
  // Only track messages from your Netlify site
  if (event.origin === 'https://YOUR-SITE.netlify.app') {
    // Track with Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'tripcompare_interaction', {
        'event_category': 'Widget',
        'event_label': event.data
      });
    }
  }
});
</script>
```

---

## 🎯 Recommended Setup

For best results:

1. **Create dedicated page** using Full Page Embed
2. **Add to main menu** - "Search Flights"
3. **Add sidebar widget** - for all pages
4. **Mention in blog posts** - with widget embed

This maximizes visibility and affiliate earnings!

---

## 📞 Support

If you encounter issues:

1. Check WordPress plan (must be Business for Custom HTML)
2. Verify Netlify deployment is live
3. Test Netlify URL directly in browser
4. Check browser console for errors (F12)
5. Review WordPress theme compatibility

---

## ✅ Quick Start Summary

**Fastest way to get TripCompare on WordPress:**

1. Deploy to Netlify (follow `DEPLOY_NOW.md`)
2. Copy your Netlify URL
3. Create new WordPress page
4. Add Custom HTML block
5. Paste full-page embed code
6. Replace URL with yours
7. Publish!

**Total time:** 5 minutes after deployment

---

🎉 **Your TripCompare is now integrated with WordPress!**

Start earning affiliate commissions from your WordPress traffic! 💰
