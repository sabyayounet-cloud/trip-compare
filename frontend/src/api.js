/**
 * ValueTrip API client – all data and actions go through these API calls.
 * No hardcoded config or content in the frontend; backend is the single source of truth.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getUrl(path, params = null) {
  const url = new URL(path, API_BASE)
  if (params && typeof params === 'object') {
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== '') url.searchParams.set(k, String(v))
    })
  }
  return url.toString()
}

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const text = await res.text()
  if (!res.ok) {
    let msg = text
    try {
      const j = JSON.parse(text)
      msg = j.detail || j.message || text
    } catch (_) {}
    throw new Error(msg)
  }
  try {
    return JSON.parse(text)
  } catch (_) {
    return text
  }
}

// ---- Config & content (API-first) ----
export async function getConfig() {
  return request(getUrl('/api/config'))
}

export async function getContent() {
  return request(getUrl('/api/content'))
}

// ---- Search ----
export async function getAirports(q = null) {
  return request(getUrl('/api/airports', q ? { q } : {}))
}

export async function searchFlights(params) {
  return request(getUrl('/api/search/flights', params))
}

export async function searchHotels(params) {
  return request(getUrl('/api/search/hotels', params))
}

export async function searchFlightHotel(params) {
  return request(getUrl('/api/search/flight-hotel', params))
}

export async function searchTrains(params) {
  return request(getUrl('/api/search/trains', params))
}

export async function searchBuses(params) {
  return request(getUrl('/api/search/buses', params))
}

export async function searchCars(params) {
  return request(getUrl('/api/search/cars', params))
}

export async function searchCampers(params) {
  return request(getUrl('/api/search/campers', params))
}

// ---- Providers ----
export async function getGds() {
  return request(getUrl('/api/gds'))
}

// ---- Community ----
export async function getCommunityTips(location = null) {
  return request(getUrl('/api/community/tips', location ? { location } : {}))
}

export async function postCommunityTip(body) {
  return request(getUrl('/api/community/tips'), {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// ---- Complaints ----
export async function getComplaints(providerId = null) {
  return request(getUrl('/api/complaints', providerId ? { provider_id: providerId } : {}))
}

export async function postComplaint(body) {
  return request(getUrl('/api/complaints'), {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// ---- Reviews ----
export async function getVerifiedReviews(providerId = null, limit = 20) {
  return request(getUrl('/api/reviews/verified', { provider_id: providerId, limit }))
}

export async function postReview(body) {
  return request(getUrl('/api/reviews'), {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// ---- Root / health ----
export async function getRoot() {
  return request(getUrl('/'))
}

export { API_BASE, getUrl, request }
