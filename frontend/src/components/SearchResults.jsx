import React from 'react'
import './SearchResults.css'

const IMG_FLIGHT = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=320&q=80'
const IMG_HOTEL = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=320&q=80'
const IMG_BUNDLE = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=320&q=80'

function formatPrice(value, currency) {
  if (typeof value === 'number' && Number.isFinite(value)) return `${currency} ${value.toFixed(2)}`
  if (value == null) return `${currency} —`
  return `${currency} ${value}`
}

function buildWhiteLabelUrl(type, data, whiteLabel) {
  const domain = whiteLabel?.domain || window.location.host
  const scheme = domain.startsWith('localhost') || domain.startsWith('127.0.0.1') ? 'http' : 'https'
  const base = `${scheme}://${domain}`
  const paths = {
    flight: '',
    flight_hotel: '',
    hotel: '/hotels',
    train: '/trains',
    bus: '/buses',
    car: '/cars',
    camper: '/campers',
  }
  const path = paths[type] ?? ''
  const params = new URLSearchParams()

  if (type === 'car' || type === 'camper') {
    params.set('location', data.location || data.origin || '')
    params.set('dropoff_location', data.dropoff_location || '')
    params.set('pickup_date', data.pickup_date || data.out_date || '')
    params.set('dropoff_date', data.dropoff_date || data.return_date || '')
  } else {
    params.set('origin', data.origin || '')
    params.set('destination', data.destination || '')
    params.set('out_date', data.out_date || data.check_in || '')
    if (data.return_date || data.check_out) params.set('return_date', data.return_date || data.check_out || '')
    params.set('type', type)
  }

  const qs = params.toString()
  return `${base}${path}${qs ? `?${qs}` : ''}`
}

function buildInternalBookingUrl(type, option, data) {
  const base = `${window.location.origin}/booking`
  const qs = new URLSearchParams()
  if (type === 'car' || type === 'camper') {
    qs.set('location', data.location || option.origin || '')
    qs.set('dropoff_location', data.dropoff_location || '')
    qs.set('pickup_date', data.pickup_date || option.out_date || '')
    qs.set('dropoff_date', data.dropoff_date || option.return_date || '')
  } else {
    qs.set('origin', option.origin || data.origin || '')
    qs.set('destination', option.destination || data.destination || '')
    qs.set('out_date', option.out_date || data.out_date || '')
    if (option.return_date || data.return_date) qs.set('return_date', option.return_date || data.return_date || '')
    qs.set('type', type)
  }
  qs.set('page', 'booking')
  return `${base}?${qs.toString()}`
}

function FlightCard({ option, currency, searchType, data }) {
  const price = option.cheapest_price != null ? option.cheapest_price : option.prices_by_source?.[0]?.price
  const feeAssistant = option.fee_assistant
  const displayPrice = feeAssistant?.estimated_total != null ? feeAssistant.estimated_total : price
  const cashback = option.cashback
  const effective = cashback?.effective != null && cashback?.cashback_pct > 0 ? cashback.effective : null
  const sources = option.prices_by_source || []
  const duration = option.duration_mins ? `${Math.floor(option.duration_mins / 60)}h ${option.duration_mins % 60}m` : '—'
  const ai = option.ai_predictor || option.ai_prediction
  const hidden = option.hidden_deal
  const risky = option.risky_connection
  const riskTimeline = option.risk_timeline
  const gdsSource = option.gds_source
  const gdsName = option.prices_by_source?.[0]?.source_name || gdsSource
  const otaRisk = option.ota_risk
  const cardImage = option.airline_image_url || IMG_FLIGHT
  return (
    <div className="result-card flight-card">
      <div className="card-photo" style={{ backgroundImage: `url(${cardImage})` }} aria-hidden="true" />
      <div className="card-body">
      <div className="card-badges">
        {gdsSource && <span className="badge gds-source">From {gdsName}</span>}
        {option.value_score != null && <span className="badge value-score">ValueScore {option.value_score}/10</span>}
        {option.verified_gem && <span className="badge verified-gem">Verified Value Gem</span>}
        {option.eco_score != null && option.eco_hybrid !== false && <span className="badge eco">Eco {Math.round(option.eco_score * 100)}%</span>}
        {hidden && <span className="badge hidden-deal" title={hidden.warning}>{hidden.label} · {hidden.support_rating}/5</span>}
        {risky?.is_risky && <span className="badge risky-connection" title={risky.message}>⚠ Risky connection</span>}
      </div>
      <div className="card-main">
        <div className="carrier">{option.carrier}{option.airline_name ? ` · ${option.airline_name}` : ''}</div>
        <div className="route">{option.origin} → {option.destination}</div>
        <div className="meta">
          {option.stops != null && (
            <span className="stops-badge" title="Number of stops">
              {option.stops === 0 ? 'Direct' : option.stops === 1 ? '1 stop' : `${option.stops} stops`}
            </span>
          )}
          {option.out_date} · {duration}
        </div>
        {ai && <div className="ai-predictor">{ai.message} · Delay risk: {ai.delay_risk}</div>}
        {riskTimeline && <div className="risk-timeline">{riskTimeline}</div>}
        {risky?.recommendation && !risky?.is_risky && <div className="connection-tip">{risky.recommendation}</div>}
      </div>
      <div className="card-price">
        <span className="price">{formatPrice(displayPrice, currency)}</span>
        {option.price_note && (
          <span className="fee-assistant-breakdown">{option.price_note}</span>
        )}
        {feeAssistant && (feeAssistant.carry_on_fee > 0 || feeAssistant.checked_fee > 0) && (
          <span className="fee-assistant-breakdown" title="Fee Assistant: estimated total with bags">
            Base {currency} {feeAssistant.base_price?.toFixed(2)} + bags
          </span>
        )}
        {effective != null && effective < displayPrice && <span className="effective-price">After {cashback.cashback_pct}% cash-back: {currency} {effective.toFixed(2)}</span>}
        <div className="book-links">
          {(() => {
            const primaryUrl = option.book_url || sources.find((p) => p.url)?.url
            if (!primaryUrl) return <span className="fee-assistant-breakdown">Booking link unavailable</span>
            const nextUrl = buildInternalBookingUrl(data.search_type || searchType, option, data)
            return (
              <button
                type="button"
                className="book-btn"
                onClick={() => window.location.assign(nextUrl)}
              >
                Book
              </button>
            )
          })()}
        </div>
      </div>
      </div>
    </div>
  )
}

function HotelCard({ option, currency }) {
  const price = option.cheapest_price != null ? option.cheapest_price : option.prices_by_source?.[0]?.price
  const cashback = option.cashback
  const effective = cashback?.effective != null && cashback?.cashback_pct > 0 ? cashback.effective : null
  const sources = option.prices_by_source || []
  const gdsSource = option.gds_source
  const gdsName = option.prices_by_source?.[0]?.source_name || gdsSource
  return (
    <div className="result-card hotel-card">
      <div className="card-photo" style={{ backgroundImage: `url(${IMG_HOTEL})` }} aria-hidden="true" />
      <div className="card-body">
      <div className="card-badges">
        {gdsSource && <span className="badge gds-source">From {gdsName}</span>}
        {option.value_score != null && <span className="badge value-score">ValueScore {option.value_score}/10</span>}
        {option.verified_gem && <span className="badge verified-gem">Verified Value Gem</span>}
      </div>
      <div className="card-main">
        <div className="name">{option.name}</div>
        <div className="meta">{option.nights} night(s) · ★ {option.rating}</div>
        {option.ai_predictor && <div className="ai-predictor">{option.ai_predictor.message}</div>}
      </div>
      <div className="card-price">
        <span className="price">{formatPrice(price, currency)}</span>
        {effective != null && effective < price && <span className="effective-price">After {cashback.cashback_pct}% cash-back: {currency} {effective.toFixed(2)}</span>}
        <div className="book-links">
          {sources.map((p, i) => (p.url && (
            <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="book-btn">Book on {p.source_name || 'Travelpayouts'}</a>
          )))}
          {sources.length === 0 && (
            <a href={option.book_url || 'https://www.travelpayouts.com'} target="_blank" rel="noopener noreferrer" className="book-btn">Book</a>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}

function BundleCard({ deal, currency, nights }) {
  const price = deal.cheapest_price
  const cashback = deal.cashback
  const effective = cashback?.effective != null && cashback?.cashback_pct > 0 ? cashback.effective : null
  const fl = deal.flight
  const ht = deal.hotel
  const ai = deal.ai_prediction
  const hidden = deal.hidden_deal
  const n = nights ?? ht?.nights ?? 1
  const sources = fl?.prices_by_source || []
  return (
    <div className="result-card bundle-card">
      <div className="card-photo" style={{ backgroundImage: `url(${IMG_BUNDLE})` }} aria-hidden="true" />
      <div className="card-body">
      <div className="card-badges">
        {fl?.gds_source && <span className="badge gds-source">From {fl.prices_by_source?.[0]?.source_name || fl.gds_source}</span>}
        {deal.value_score != null && <span className="badge value-score">ValueScore {deal.value_score}/10</span>}
        {deal.verified_gem && <span className="badge verified-gem">Verified Value Gem</span>}
        {hidden && <span className="badge hidden-deal">{hidden.label} · {hidden.support_rating}/5</span>}
      </div>
      <div className="card-main">
        <div className="bundle-flight">{fl?.carrier}{fl?.airline_name ? ` · ${fl.airline_name}` : ''} · {fl?.origin} → {fl?.destination} · {fl?.out_date}</div>
        <div className="bundle-hotel">{ht?.name} · {n} night(s) · ★ {ht?.rating}</div>
        {ai && <div className="ai-predictor">{ai.message}</div>}
      </div>
      <div className="card-price">
        <span className="price">{formatPrice(price, currency)}</span>
        {effective != null && effective < price && <span className="effective-price">After {cashback.cashback_pct}% cash-back: {currency} {effective.toFixed(2)}</span>}
        <span className="label">Flight + Hotel</span>
        <div className="book-links">
          {(() => {
            const primaryUrl = deal.book_url || fl?.book_url || sources.find((p) => p.url)?.url
            if (!primaryUrl) return <span className="fee-assistant-breakdown">Booking link unavailable</span>
            const nextUrl = buildInternalBookingUrl(data.search_type || searchType, deal, data)
            return (
              <button
                type="button"
                className="book-btn"
                onClick={() => window.location.assign(nextUrl)}
              >
                Book
              </button>
            )
          })()}
        </div>
      </div>
      </div>
    </div>
  )
}

export default function SearchResults({ searchType, data, config, onRefresh, lastParams, refreshing }) {
  if (!data) return null

  const currency = data.currency || 'GBP'
  const ecoHybrid = data.eco_hybrid ?? data.include_eco
  if (data.options) data.options.forEach(o => { o.eco_hybrid = ecoHybrid })

  const freshness = data.search_freshness ? new Date(data.search_freshness).toLocaleString() : null

  if (searchType === 'flight') {
    const options = data.options || []
    const sourcesNames = data.sources_returned_names || (data.sources_returned || []).map(s => s)
    return (
      <section className="search-results">
        <h2>Flights · {data.origin} → {data.destination}{data.explore_anywhere ? ' (Explore anywhere)' : ''}</h2>
        <div className="results-meta">
          {data.live && (
            <p className="live-badge">
              Live prices{sourcesNames.length ? ` from: ${sourcesNames.join(', ')}` : ''}
            </p>
          )}
          {freshness && (
            <p className="freshness">Prices verified at {freshness}</p>
          )}
          {onRefresh && lastParams?.type === 'flight' && (
            <button type="button" className="refresh-verify-btn" onClick={onRefresh} disabled={refreshing}>
              {refreshing ? 'Refreshing…' : 'Refresh & Verify'}
            </button>
          )}
        </div>
        {ecoHybrid && <p className="eco-badge">Eco-Service Hybrid on</p>}
        {data.message && <p className="results-message">{data.message}</p>}
        <div className="results-list">
          {options.map((opt) => (
            <FlightCard key={opt.id} option={opt} currency={currency} searchType={searchType} data={data} />
          ))}
        </div>
      </section>
    )
  }

  if (searchType === 'flight_hotel') {
    const deals = data.deals || []
    const flightOptions = data.flight_options || []
    const hotelOptions = data.hotel_options || []
    const sourcesNames = data.sources_returned_names || []
    return (
      <section className="search-results">
        <h2>Flight + Hotel deals · {data.origin} → {data.destination}</h2>
        <div className="results-meta">
          {data.live && sourcesNames.length > 0 && (
            <p className="live-badge">Live data from: {sourcesNames.join(', ')}</p>
          )}
          {freshness && <p className="freshness">Prices verified at {freshness}</p>}
          {onRefresh && lastParams?.type === 'flight_hotel' && (
            <button type="button" className="refresh-verify-btn" onClick={onRefresh} disabled={refreshing}>
              {refreshing ? 'Refreshing…' : 'Refresh & Verify'}
            </button>
          )}
        </div>
        <p className="results-desc">Best combined price; ValueScore, cash-back, hidden deals. Book on Travelpayouts partners or airline.</p>
        {ecoHybrid && <p className="eco-badge">Eco-Service Hybrid on</p>}
        {data.message && <p className="results-message">{data.message}</p>}
        <div className="results-list">
          {deals.map((deal) => (
            <BundleCard key={deal.id} deal={deal} currency={currency} nights={data.nights} />
          ))}
        </div>
        {(flightOptions.length > 0 || hotelOptions.length > 0) && (
          <div className="sections-extra">
            {flightOptions.length > 0 && (
              <div className="section-block">
                <h3>Flights only (for comparison)</h3>
                {flightOptions.slice(0, 3).map((opt) => (
                  <FlightCard key={opt.id} option={{ ...opt, eco_hybrid: ecoHybrid }} currency={currency} searchType="flight" data={data} />
                ))}
              </div>
            )}
            {hotelOptions.length > 0 && (
              <div className="section-block">
                <h3>Hotels only (for comparison)</h3>
                {hotelOptions.slice(0, 3).map((opt) => (
                  <HotelCard key={opt.id} option={opt} currency={currency} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    )
  }

  if (searchType === 'train' || searchType === 'bus') {
    const options = data.options || []
    const typeLabel = searchType === 'train' ? 'Trains' : 'Buses'
    return (
      <section className="search-results">
        <h2>{typeLabel} · {data.origin} → {data.destination}</h2>
        <div className="results-meta">
          {data.live && (
            <p className="live-badge">
              Booking via Travelpayouts
            </p>
          )}
          {freshness && <p className="freshness">Prices verified at {freshness}</p>}
        </div>
        {ecoHybrid && <p className="eco-badge">Eco-Service Hybrid on</p>}
        {data.message && <p className="results-message">{data.message}</p>}
        <div className="results-list">
          {options.map((opt) => (
            <FlightCard key={opt.id} option={opt} currency={currency} searchType={searchType} data={data} />
          ))}
        </div>
      </section>
    )
  }

  if (searchType === 'car' || searchType === 'camper') {
    const options = data.options || []
    const label = searchType === 'car' ? 'Car rentals' : 'Campers'
    return (
      <section className="search-results">
        <h2>{label} · {data.location}{data.dropoff_location ? ` → ${data.dropoff_location}` : ''}</h2>
        <div className="results-meta">
          {data.live && (
            <p className="live-badge">
              Booking via Travelpayouts
            </p>
          )}
          {freshness && <p className="freshness">Prices verified at {freshness}</p>}
        </div>
        {ecoHybrid && <p className="eco-badge">Eco-Service Hybrid on</p>}
        {data.message && <p className="results-message">{data.message}</p>}
        <div className="results-list">
          {options.map((opt) => (
            <FlightCard key={opt.id} option={opt} currency={currency} searchType={searchType} data={data} />
          ))}
        </div>
      </section>
    )
  }

  return null
}
