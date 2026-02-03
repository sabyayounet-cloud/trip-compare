# TripCompare - API-First Travel Booking Platform

**Goal: €10,000/month with Zero Investment**

A professional travel booking platform built with an API-first architecture. Compare flights, hotels, and experiences while earning through affiliate commissions.

---

## 🚀 Quick Start

### Option 1: Run Both (Recommended)

```bash
# Terminal 1 - Start API
cd trip-compare
pip install -r requirements.txt
uvicorn api.main:app --reload

# Terminal 2 - Start Frontend
cd trip-compare/frontend
npm install
npm run dev
```

- **API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Frontend:** http://localhost:5173

### Option 2: Docker

```bash
docker-compose up
```

---

## 📁 Project Structure

```
trip-compare/
├── api/                    # FastAPI Backend
│   ├── main.py            # Application entry point
│   ├── config.py          # Configuration & environment
│   ├── database.py        # SQLite database setup
│   ├── models.py          # SQLAlchemy models
│   ├── schemas.py         # Pydantic schemas
│   ├── crud.py            # Database operations
│   └── routers/           # API endpoints
│       ├── subscribers.py # Newsletter management
│       ├── destinations.py# Destination data
│       ├── deals.py       # Travel deals
│       ├── experiences.py # Tours & activities
│       ├── search.py      # Affiliate search URLs
│       └── analytics.py   # Click tracking & stats
├── frontend/              # React Frontend
│   ├── src/
│   │   ├── api/          # API client
│   │   ├── App.jsx       # Main application
│   │   └── index.css     # Styles
│   └── package.json
├── requirements.txt       # Python dependencies
├── .env.example          # Environment template
├── Dockerfile            # Container config
├── docker-compose.yml    # Multi-container setup
└── render.yaml           # Render.com deployment
```

---

## 🔌 API Endpoints

### Health & Info
- `GET /` - API info and available endpoints
- `GET /health` - Health check

### Subscribers (Newsletter)
- `POST /subscribers/` - Subscribe to newsletter
- `GET /subscribers/` - List all subscribers
- `GET /subscribers/{email}` - Get subscriber
- `PATCH /subscribers/{email}` - Update preferences
- `DELETE /subscribers/{email}` - Unsubscribe

### Destinations
- `GET /destinations/` - List all destinations
- `GET /destinations/featured` - Featured destinations
- `GET /destinations/search?q=` - Search destinations
- `GET /destinations/{id}` - Get destination details
- `GET /destinations/{id}/deals` - Deals for destination

### Deals
- `GET /deals/` - List all deals
- `GET /deals/featured` - Featured deals
- `GET /deals/hot` - Highest discount deals
- `GET /deals/flights` - Flight deals only
- `GET /deals/hotels` - Hotel deals only
- `POST /deals/{id}/click` - Track click
- `GET /deals/{id}/redirect` - Get affiliate link

### Experiences
- `GET /experiences/` - List experiences
- `GET /experiences/top-rated` - Top rated
- `GET /experiences/categories` - Available categories

### Search (Affiliate URLs)
- `POST /search/flights` - Generate flight search URL
- `POST /search/hotels` - Generate hotel search URL
- `GET /search/experiences` - Generate experience search URL
- `GET /search/cars` - Generate car rental URL

### Analytics
- `GET /analytics/dashboard` - Overview stats
- `GET /analytics/clicks` - Click statistics
- `GET /analytics/revenue-estimate` - Revenue calculator
- `POST /analytics/price-alerts` - Create price alert

---

## 💰 Revenue Model

### Affiliate Commissions (Target: €6,000/month)
| Partner | Commission | Monthly Target |
|---------|-----------|----------------|
| Booking.com | €15-40/booking | €2,500 |
| Skyscanner | €0.50-2/click | €1,500 |
| GetYourGuide | 8% | €1,000 |
| Hostelworld | Up to 50% | €500 |
| Travel Insurance | €5-20/policy | €500 |

### Lead Generation (Target: €2,500/month)
- Email subscribers → Deal alerts
- 500 leads × €5 = €2,500

### Advertising (Target: €1,500/month)
- Google AdSense
- Direct ad sales
- Sponsored deals

---

## 🔧 Configuration

Copy `.env.example` to `.env` and configure:

```env
# Affiliate API Keys
TRAVELPAYOUTS_TOKEN=your_token
TRAVELPAYOUTS_MARKER=your_marker
BOOKING_AFFILIATE_ID=your_aid
GETYOURGUIDE_PARTNER_ID=your_id

# Email Marketing
BREVO_API_KEY=your_key

# CORS (add your frontend URL)
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com
```

---

## 🚢 Deployment (Free Options)

### Render.com (Recommended)
1. Push code to GitHub
2. Connect to Render.com
3. Create new "Blueprint"
4. Select your repo
5. Deploy automatically

### Railway
```bash
railway login
railway init
railway up
```

### Docker
```bash
docker build -t tripcompare-api .
docker run -p 8000:8000 tripcompare-api
```

---

## 📊 Analytics Dashboard

Access at `/analytics/dashboard`:

```json
{
  "total_subscribers": 1250,
  "total_clicks": 8500,
  "total_deals": 45,
  "top_destinations": [
    {"name": "Barcelona", "searches": 1200},
    {"name": "Rome", "searches": 980}
  ],
  "clicks_by_provider": {
    "booking": 4500,
    "skyscanner": 3200,
    "getyourguide": 800
  }
}
```

---

## 📚 Documentation

- **Business Strategy:** [BUSINESS_STRATEGY.md](./BUSINESS_STRATEGY.md)
- **Affiliate Setup:** [AFFILIATE_SETUP.md](./AFFILIATE_SETUP.md)
- **SEO & Marketing:** [SEO_MARKETING_GUIDE.md](./SEO_MARKETING_GUIDE.md)
- **API Docs:** http://localhost:8000/docs (Swagger UI)
- **API Redoc:** http://localhost:8000/redoc

---

## 🎯 Roadmap to €10K/month

| Month | Traffic | Revenue |
|-------|---------|---------|
| 1-2 | 1,000-5,000 | €50-200 |
| 3-4 | 5,000-15,000 | €200-800 |
| 5-6 | 15,000-40,000 | €800-2,500 |
| 7-9 | 40,000-80,000 | €2,500-5,000 |
| 10-12 | 80,000-150,000 | €5,000-10,000 |

---

## 🛠 Tech Stack

- **Backend:** Python 3.11+, FastAPI, SQLAlchemy, SQLite
- **Frontend:** React 18, Vite, TailwindCSS
- **Deployment:** Docker, Render.com, Netlify

---

## 📄 License

MIT License - Free to use and modify.

---

Built with ❤️ for the €10K challenge.
