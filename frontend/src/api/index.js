/**
 * TripCompare API Client
 *
 * Centralized API service for communicating with the FastAPI backend.
 * All API calls go through this module for consistency and error handling.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // GET request
  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url);
  }

  // POST request
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

const api = new ApiClient(API_BASE_URL);

// ============== API Methods ==============

// Health Check
export const checkHealth = () => api.get('/health');

// Subscribers
export const subscriberApi = {
  subscribe: (email, name = '', source = 'website') =>
    api.post('/subscribers/', { email, name, source }),

  unsubscribe: (email) =>
    api.delete(`/subscribers/${email}`),

  getSubscriber: (email) =>
    api.get(`/subscribers/${email}`),

  updatePreferences: (email, preferences) =>
    api.patch(`/subscribers/${email}`, { preferences }),

  getCount: () =>
    api.get('/subscribers/count/total'),
};

// Destinations
export const destinationApi = {
  getAll: (params = {}) =>
    api.get('/destinations/', params),

  getFeatured: (limit = 8) =>
    api.get('/destinations/featured', { limit }),

  search: (query, limit = 10) =>
    api.get('/destinations/search', { q: query, limit }),

  getById: (id) =>
    api.get(`/destinations/${id}`),

  getDeals: (id, limit = 10) =>
    api.get(`/destinations/${id}/deals`, { limit }),

  create: (data) =>
    api.post('/destinations/', data),

  update: (id, data) =>
    api.patch(`/destinations/${id}`, data),
};

// Deals
export const dealApi = {
  getAll: (params = {}) =>
    api.get('/deals/', params),

  getFeatured: (limit = 6) =>
    api.get('/deals/featured', { limit }),

  getHot: (limit = 10) =>
    api.get('/deals/hot', { limit }),

  getFlights: (limit = 10) =>
    api.get('/deals/flights', { limit }),

  getHotels: (limit = 10) =>
    api.get('/deals/hotels', { limit }),

  getPackages: (limit = 10) =>
    api.get('/deals/packages', { limit }),

  getById: (id) =>
    api.get(`/deals/${id}`),

  trackClick: (id) =>
    api.post(`/deals/${id}/click`),

  getRedirectUrl: (id) =>
    api.get(`/deals/${id}/redirect`),

  create: (data) =>
    api.post('/deals/', data),

  update: (id, data) =>
    api.patch(`/deals/${id}`, data),
};

// Experiences
export const experienceApi = {
  getAll: (params = {}) =>
    api.get('/experiences/', params),

  getTopRated: (limit = 10) =>
    api.get('/experiences/top-rated', { limit }),

  getCategories: () =>
    api.get('/experiences/categories'),

  getById: (id) =>
    api.get(`/experiences/${id}`),

  trackClick: (id) =>
    api.post(`/experiences/${id}/click`),

  create: (data) =>
    api.post('/experiences/', data),
};

// Search - Integrated with Travelpayouts
export const searchApi = {
  // Generate affiliate booking link for flights
  flights: (data) =>
    api.post('/search/flights', data),

  // Get real flight prices from Travelpayouts API
  getFlightPrices: (origin, destination, departDate, returnDate = null, currency = 'EUR') =>
    api.get('/search/flights/prices', {
      origin,
      destination,
      depart_date: departDate,
      return_date: returnDate,
      currency
    }),

  // Get flight price calendar for flexible dates
  getFlightCalendar: (origin, destination, departDate, currency = 'EUR') =>
    api.get('/search/flights/calendar', {
      origin,
      destination,
      depart_date: departDate,
      currency
    }),

  // Get popular destinations with prices from an origin
  getPopularDestinations: (origin, currency = 'EUR') =>
    api.get('/search/flights/popular', { origin, currency }),

  // Generate affiliate booking link for hotels
  hotels: (data) =>
    api.post('/search/hotels', data),

  // Get real hotel prices from Hotellook API
  getHotelPrices: (location, checkIn, checkOut, adults = 2, currency = 'EUR') =>
    api.get('/search/hotels/prices', {
      location,
      check_in: checkIn,
      check_out: checkOut,
      adults,
      currency
    }),

  // Get widget configuration for embedding Travelpayouts widgets
  getWidgetConfig: () =>
    api.get('/search/widget/config'),

  experiences: (params) =>
    api.get('/search/experiences', params),

  cars: (params) =>
    api.get('/search/cars', params),

  packages: (params) =>
    api.post('/search/packages', params),
};

// Analytics
export const analyticsApi = {
  getDashboard: (days = 30) =>
    api.get('/analytics/dashboard', { days }),

  getClicks: (days = 30) =>
    api.get('/analytics/clicks', { days }),

  getSubscribers: () =>
    api.get('/analytics/subscribers'),

  getDestinations: (limit = 10) =>
    api.get('/analytics/destinations', { limit }),

  estimateRevenue: (params) =>
    api.get('/analytics/revenue-estimate', params),

  createPriceAlert: (data) =>
    api.post('/analytics/price-alerts', data),

  getPriceAlerts: (email) =>
    api.get(`/analytics/price-alerts/${email}`),

  deletePriceAlert: (alertId, email) =>
    api.delete(`/analytics/price-alerts/${alertId}?email=${email}`),
};

// Seed database (dev only)
export const seedDatabase = () => api.post('/seed');

export default api;
