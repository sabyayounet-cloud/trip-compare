# Affiliate Program Setup Guide

## Quick Start Checklist

Complete these steps to start earning money from your travel site:

- [ ] Sign up for Travelpayouts (flights, hotels, all-in-one)
- [ ] Sign up for Booking.com Affiliate Partner
- [ ] Sign up for GetYourGuide Affiliate
- [ ] Sign up for Hostelworld Affiliate
- [ ] Set up email marketing (Mailchimp/Brevo)
- [ ] Add Google Analytics
- [ ] Add your affiliate IDs to the website code

---

## 1. Travelpayouts (RECOMMENDED FIRST STEP)

**What it is:** All-in-one affiliate platform that gives you access to multiple travel brands through one account.

**Commission:** Varies by partner (typically 50-70% of the booking commission)

**Partners included:**
- Skyscanner (flights)
- Booking.com (hotels)
- Rentalcars.com (car rental)
- Kiwi.com (flights)
- 12Go (transportation in Asia)

### Sign Up Steps:
1. Go to: **https://www.travelpayouts.com/**
2. Click "Join for Free"
3. Fill in your website details
4. Wait for approval (usually 24-48 hours)

### Get Your Widgets:
1. Once approved, go to Dashboard → Tools → Widgets
2. Choose "Flight Search Widget" or "Hotel Search Widget"
3. Customize colors to match your site
4. Copy the embed code

### Integration Code for index.html:

Replace the flight search form with Travelpayouts widget:
```html
<!-- Add this in your <head> section -->
<script src="https://tp.media/content?currency=eur&trs=YOUR_MARKER_ID&shmarker=YOUR_MARKER&powered_by=true&locale=en&searchUrl=www.jetradar.com%2Fflights&promo_id=4132&campaign_id=100" async></script>

<!-- Add this where you want the search widget -->
<div id="tp-search-widget"></div>
```

---

## 2. Booking.com Affiliate Partner

**What it is:** Direct affiliate program from Booking.com

**Commission:** 25-40% of Booking.com's commission (typically €15-40 per booking)

### Sign Up Steps:
1. Go to: **https://www.booking.com/affiliate-program/**
2. Click "Join Now"
3. Enter your website URL and details
4. Wait for approval (1-3 business days)

### Get Your Links:
1. Log into your affiliate dashboard
2. Go to "Link Generator"
3. Create deep links to specific destinations
4. Copy your affiliate ID (aid=XXXXXXX)

### Integration Example:
```javascript
// In your index.html, replace the hotel form handler:
document.getElementById('hotels-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const destination = document.getElementById('hotel-destination').value;
    const checkin = document.getElementById('hotel-checkin').value;
    const checkout = document.getElementById('hotel-checkout').value;

    // REPLACE XXXXXXX with your actual affiliate ID
    const affiliateId = 'XXXXXXX';
    const searchUrl = `https://www.booking.com/searchresults.html?aid=${affiliateId}&ss=${encodeURIComponent(destination)}&checkin=${checkin}&checkout=${checkout}`;
    window.open(searchUrl, '_blank');
});
```

---

## 3. GetYourGuide Affiliate Program

**What it is:** Tours and activities affiliate program

**Commission:** 8% of booking value

### Sign Up Steps:
1. Go to: **https://partner.getyourguide.com/**
2. Click "Become a Partner"
3. Choose "Content Partner / Affiliate"
4. Submit your website for review

### Get Your Links:
1. Use the Link Generator in your dashboard
2. Create links to specific activities or destination pages
3. Add your partner ID to all links

### Integration Example:
```javascript
// Replace experience card links:
const gygPartnerId = 'YOUR_PARTNER_ID';
const experienceLinks = {
    'colosseum': `https://www.getyourguide.com/rome-l33/colosseum-skip-the-line-tour-t12345/?partner_id=${gygPartnerId}`,
    'eiffel': `https://www.getyourguide.com/paris-l16/eiffel-tower-summit-access-t67890/?partner_id=${gygPartnerId}`,
    // Add more...
};
```

---

## 4. Hostelworld Affiliate Program

**What it is:** Budget accommodation affiliate program

**Commission:** Up to 50% of Hostelworld's commission

### Sign Up:
1. Go to: **https://www.hostelworld.com/affiliate**
2. Complete the application
3. Get approved and receive your tracking code

---

## 5. World Nomads Travel Insurance

**What it is:** Travel insurance affiliate program

**Commission:** €5-20 per policy sold

### Sign Up:
1. Go to: **https://www.worldnomads.com/affiliate-program**
2. Apply for partnership
3. Add insurance comparison/purchase links to your site

---

## 6. Email Marketing Setup (Lead Generation)

### Option A: Mailchimp (Free up to 500 contacts)
1. Go to: **https://mailchimp.com/**
2. Create free account
3. Create an "Audience" for travel subscribers
4. Get your signup form embed code

### Option B: Brevo/Sendinblue (Free up to 300 emails/day)
1. Go to: **https://www.brevo.com/**
2. Create free account
3. Set up your first campaign

### Integrate Newsletter Form:
```javascript
// Replace the newsletter form handler with your Mailchimp/Brevo integration
document.getElementById('newsletter-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;

    // Option 1: Mailchimp (replace URL with your form action URL)
    // You'll get this from Mailchimp → Audience → Signup forms → Embedded forms

    // Option 2: Direct API call to your backend that connects to email service
    try {
        await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        alert('Thanks for subscribing!');
    } catch (err) {
        alert('Error subscribing. Please try again.');
    }
});
```

---

## 7. Google Analytics Setup

### Steps:
1. Go to: **https://analytics.google.com/**
2. Create a new property for your website
3. Get your Measurement ID (G-XXXXXXXXXX)
4. Add to your index.html in the <head> section:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Track Affiliate Clicks:
```javascript
// Add click tracking to affiliate links
document.querySelectorAll('.deal-card .btn').forEach(btn => {
    btn.addEventListener('click', () => {
        gtag('event', 'affiliate_click', {
            'event_category': 'Affiliate',
            'event_label': btn.closest('.deal-card').querySelector('.deal-destination').textContent
        });
    });
});
```

---

## 8. Free Deployment Options

### Netlify (Recommended)
1. Go to: **https://www.netlify.com/**
2. Sign up with GitHub
3. Drag and drop your `trip-compare` folder
4. Your site will be live at `yoursite.netlify.app`

**Custom domain:** Free SSL included, just point your domain

### Vercel
1. Go to: **https://vercel.com/**
2. Import your project
3. Deploy instantly

### GitHub Pages
1. Create a GitHub repository
2. Push your code
3. Enable GitHub Pages in settings

---

## Revenue Tracking Spreadsheet

Create a simple spreadsheet to track your earnings:

| Date | Source | Clicks | Bookings | Revenue |
|------|--------|--------|----------|---------|
| Jan 1 | Booking.com | 150 | 5 | €125 |
| Jan 1 | Skyscanner | 200 | 8 | €80 |
| Jan 1 | GetYourGuide | 75 | 3 | €36 |

---

## Expected Timeline

| Week | Task | Expected Outcome |
|------|------|------------------|
| 1 | Sign up for all affiliates | Accounts approved |
| 2 | Integrate affiliate links | Site ready to earn |
| 3-4 | Start content creation | First 10 blog posts |
| Month 2 | SEO + Social media | 1,000+ monthly visitors |
| Month 3 | Scale content | First €100-500 earned |
| Month 6 | Optimize conversions | €1,000-2,000/month |
| Month 12 | Full scale | €5,000-10,000/month |

---

## Pro Tips

1. **Track everything** - Use UTM parameters on all your links
2. **Test different placements** - A/B test button colors, positions
3. **Focus on high-intent content** - "Best hotels in Barcelona" converts better than "Barcelona travel guide"
4. **Build email list aggressively** - It's your most valuable asset
5. **Be patient** - SEO takes 3-6 months to show results

Good luck! 🚀
