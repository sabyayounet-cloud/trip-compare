import React, { useState, useEffect, useRef } from 'react'
import * as api from '../api'
import './SearchForm.css'

const today = () => new Date().toISOString().slice(0, 10)

function AirportAutocomplete({ value, onChange, placeholder, id, disabled }) {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    if (!inputValue || inputValue.length < 2) {
      setSuggestions([])
      setOpen(!!inputValue)
      return
    }
    const q = inputValue.trim()
    setLoading(true)
    api.getAirports(q)
      .then((data) => {
        setSuggestions(data.airports || [])
        setOpen(true)
      })
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false))
  }, [inputValue])

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (airport) => {
    setInputValue(airport.code)
    onChange(airport.code)
    setOpen(false)
  }

  const handleInputChange = (e) => {
    const v = e.target.value
    setInputValue(v)
    if (v.length === 3 && /^[A-Z]{3}$/i.test(v)) onChange(v.toUpperCase())
    else if (v.length <= 3) onChange(v.toUpperCase())
    else onChange(v)
  }

  const handleFocus = () => {
    if (inputValue.length < 2) {
      api.getAirports(inputValue || null)
        .then((data) => {
          setSuggestions(data.airports || [])
          setOpen(true)
        })
        .catch(() => setSuggestions([]))
    } else setOpen(true)
  }

  const displayList = suggestions.length > 0 ? suggestions : []

  return (
    <div className="autocomplete-wrap" ref={wrapperRef}>
      <input
        type="text"
        id={id}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={disabled ? 'Anywhere' : placeholder}
        autoComplete="off"
        className="autocomplete-input"
        disabled={disabled}
      />
      {open && (
        <ul className="autocomplete-list" role="listbox">
          {loading && <li className="autocomplete-item muted">Loading…</li>}
          {!loading && displayList.length === 0 && inputValue.length >= 2 && (
            <li className="autocomplete-item muted">No airports found</li>
          )}
          {!loading &&
            displayList.map((a) => (
              <li
                key={a.code}
                role="option"
                className="autocomplete-item"
                onClick={() => handleSelect(a)}
              >
                <span className="ac-code">{a.code}</span>
                <span className="ac-name">{a.name}</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}

export default function SearchForm({ searchType, onSubmit, loading, defaults = {} }) {
  const [origin, setOrigin] = useState(defaults.origin || 'LHR')
  const [destination, setDestination] = useState(defaults.destination || 'EDI')
  const [outDate, setOutDate] = useState(today())
  const [returnDate, setReturnDate] = useState('')
  const [nights, setNights] = useState(3)
  const [maxStops, setMaxStops] = useState('')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  // Advanced: layover & connection
  const [maxLayoverMins, setMaxLayoverMins] = useState('')
  const [excludedLayover, setExcludedLayover] = useState('')
  const [minConnectionMins, setMinConnectionMins] = useState('')
  // Fee Assistant & baggage
  const [carryOnBags, setCarryOnBags] = useState(0)
  const [checkedBags, setCheckedBags] = useState(0)
  const [avoidBasicEconomy, setAvoidBasicEconomy] = useState(false)
  // Service-Safe
  const [minServiceRating, setMinServiceRating] = useState('')
  const [serviceSafeMode, setServiceSafeMode] = useState(false)
  const [exploreAnywhere, setExploreAnywhere] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const o = origin.trim()
    const d = exploreAnywhere ? 'ANY' : destination.trim()
    const originCode = o.length >= 2 ? o.toUpperCase().slice(0, 3) : o
    const destCode = exploreAnywhere ? 'ANY' : (d.length >= 2 ? d.toUpperCase().slice(0, 3) : d)
    const payload = {
      origin: originCode,
      destination: destCode,
      out_date: outDate,
      return_date: returnDate || undefined,
      nights,
    }
    if (maxStops !== '' && (searchType === 'flight' || searchType === 'flight_hotel')) payload.max_stops = parseInt(maxStops, 10)
    if (searchType === 'flight') {
      if (maxLayoverMins !== '') payload.max_layover_mins = parseInt(maxLayoverMins, 10)
      if (excludedLayover.trim()) payload.excluded_layover = excludedLayover.trim()
      if (minConnectionMins !== '') payload.min_connection_mins = parseInt(minConnectionMins, 10)
      payload.carry_on_bags = carryOnBags
      payload.checked_bags = checkedBags
      payload.avoid_basic_economy = avoidBasicEconomy
      if (minServiceRating !== '') payload.min_service_rating = parseFloat(minServiceRating)
      payload.service_safe_mode = serviceSafeMode
    }
    onSubmit(payload)
  }

  const originLabel = searchType === 'car' ? 'Pickup location' : 'From (city/airport)'
  const destinationLabel = searchType === 'car' ? 'Drop-off location (optional)' : 'To (city/airport)'
  const fromPlaceholder = searchType === 'car' ? 'e.g. LHR or London' : 'e.g. LHR or London'
  const toPlaceholder = searchType === 'car' ? 'e.g. LGW or London' : 'e.g. EDI or Edinburgh'

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label>
          <span>{originLabel}</span>
          <AirportAutocomplete
            value={origin}
            onChange={setOrigin}
            placeholder={fromPlaceholder}
            id="origin"
          />
        </label>
        <label>
          <span>{destinationLabel}</span>
          <AirportAutocomplete
            value={destination}
            onChange={setDestination}
            placeholder={toPlaceholder}
            id="destination"
            disabled={exploreAnywhere}
          />
        </label>
        {searchType === 'flight' && (
          <label className="checkbox-label explore-anywhere">
            <input
              type="checkbox"
              checked={exploreAnywhere}
              onChange={(e) => setExploreAnywhere(e.target.checked)}
            />
            <span>Explore anywhere (flexible destination)</span>
          </label>
        )}
      </div>
      <div className="form-row">
        {(searchType === 'flight' || searchType === 'flight_hotel') && (
          <label>
            <span>Max stops</span>
            <select
              value={maxStops}
              onChange={(e) => setMaxStops(e.target.value)}
              className="max-stops-select"
            >
              <option value="">Any</option>
              <option value="0">Direct only</option>
              <option value="1">Up to 1 stop</option>
              <option value="2">Up to 2 stops</option>
            </select>
          </label>
        )}
        <label>
          <span>{searchType === 'car' ? 'Pickup date' : 'Outbound'}</span>
          <input
            type="date"
            value={outDate}
            onChange={(e) => setOutDate(e.target.value)}
            min={today()}
          />
        </label>
        <label>
          <span>{searchType === 'car' ? 'Drop-off date (optional)' : 'Return (optional)'}</span>
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            min={outDate || today()}
          />
        </label>
        {searchType === 'flight_hotel' && (
          <label>
            <span>Nights</span>
            <select value={nights} onChange={(e) => setNights(Number(e.target.value))}>
              {(defaults.nights_options || [1, 2, 3, 4, 5, 7, 10, 14]).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {searchType === 'flight' && (
        <div className="advanced-filters">
          <button
            type="button"
            className="advanced-toggle"
            onClick={() => setAdvancedOpen((v) => !v)}
            aria-expanded={advancedOpen}
          >
            {advancedOpen ? '▼' : '▶'} Advanced: layover, baggage, service-safe
          </button>
          {advancedOpen && (
            <div className="advanced-fields">
              <div className="form-row">
                <label>
                  <span>Max layover (min)</span>
                  <input
                    type="number"
                    min={0}
                    max={600}
                    value={maxLayoverMins}
                    onChange={(e) => setMaxLayoverMins(e.target.value)}
                    placeholder="e.g. 120"
                  />
                </label>
                <label>
                  <span>Excluded layover cities (IATA)</span>
                  <input
                    type="text"
                    value={excludedLayover}
                    onChange={(e) => setExcludedLayover(e.target.value)}
                    placeholder="e.g. CDG, AMS"
                  />
                </label>
                <label>
                  <span>Min connection time (min)</span>
                  <input
                    type="number"
                    min={0}
                    max={300}
                    value={minConnectionMins}
                    onChange={(e) => setMinConnectionMins(e.target.value)}
                    placeholder="e.g. 60"
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                  <span>Carry-on bags</span>
                  <select value={carryOnBags} onChange={(e) => setCarryOnBags(Number(e.target.value))}>
                    {[0, 1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Checked bags</span>
                  <select value={checkedBags} onChange={(e) => setCheckedBags(Number(e.target.value))}>
                    {[0, 1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={avoidBasicEconomy}
                    onChange={(e) => setAvoidBasicEconomy(e.target.checked)}
                  />
                  <span>Avoid basic economy</span>
                </label>
              </div>
              <div className="form-row">
                <label>
                  <span>Min service rating (0–5)</span>
                  <select value={minServiceRating} onChange={(e) => setMinServiceRating(e.target.value)}>
                    <option value="">Any</option>
                    {[3, 3.5, 4, 4.5, 5].map((r) => (
                      <option key={r} value={r}>{r}+</option>
                    ))}
                  </select>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={serviceSafeMode}
                    onChange={(e) => setServiceSafeMode(e.target.checked)}
                  />
                  <span>Service-Safe mode (high-resolution only)</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? 'Searching…' : 'Compare prices & ValueScore'}
      </button>
    </form>
  )
}
