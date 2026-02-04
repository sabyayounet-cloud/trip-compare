/**
 * TripCompare - API-First Travel Booking App
 *
 * This React app consumes the FastAPI backend for all data operations.
 */
import React, { useState, useEffect } from 'react';
import {
  subscriberApi,
  destinationApi,
  dealApi,
  experienceApi,
  searchApi,
  analyticsApi,
  checkHealth,
  seedDatabase
} from './api/index.js';
import './index.css';

// Icons (using emoji for simplicity - in production use lucide-react)
const Icons = {
  Plane: () => '✈️',
  Hotel: () => '🏨',
  Suitcase: () => '🧳',
  Hiking: () => '🥾',
  Search: () => '🔍',
  Star: () => '⭐',
  Shield: () => '🛡️',
  Bell: () => '🔔',
  Tag: () => '🏷️',
  Map: () => '🗺️',
};

// =============================================================================
// COMPONENTS
// =============================================================================

// Navbar Component
function Navbar({ onSubscribeClick }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-md px-8 py-4 flex justify-between items-center">
      <a href="#" className="text-2xl font-extrabold text-blue-500 flex items-center gap-2">
        ✈️ TripCompare
      </a>
      <div className="hidden md:flex items-center gap-8">
        <a href="#deals" className="font-medium text-gray-700 hover:text-blue-500 transition-colors">Deals</a>
        <a href="#destinations" className="font-medium text-gray-700 hover:text-blue-500 transition-colors">Destinations</a>
        <a href="#experiences" className="font-medium text-gray-700 hover:text-blue-500 transition-colors">Experiences</a>
        <button onClick={onSubscribeClick} className="btn btn-primary">
          Get Deal Alerts
        </button>
      </div>
    </nav>
  );
}

// Popular cities data - shared across components
const POPULAR_CITIES = [
  { code: 'LON', name: 'London', country: 'United Kingdom' },
  { code: 'PAR', name: 'Paris', country: 'France' },
  { code: 'BCN', name: 'Barcelona', country: 'Spain' },
  { code: 'ROM', name: 'Rome', country: 'Italy' },
  { code: 'AMS', name: 'Amsterdam', country: 'Netherlands' },
  { code: 'BER', name: 'Berlin', country: 'Germany' },
  { code: 'MAD', name: 'Madrid', country: 'Spain' },
  { code: 'VIE', name: 'Vienna', country: 'Austria' },
  { code: 'PRG', name: 'Prague', country: 'Czech Republic' },
  { code: 'LIS', name: 'Lisbon', country: 'Portugal' },
  { code: 'DUB', name: 'Dublin', country: 'Ireland' },
  { code: 'ATH', name: 'Athens', country: 'Greece' },
  { code: 'IST', name: 'Istanbul', country: 'Turkey' },
  { code: 'NYC', name: 'New York', country: 'United States' },
  { code: 'LAX', name: 'Los Angeles', country: 'United States' },
  { code: 'MIA', name: 'Miami', country: 'United States' },
  { code: 'DXB', name: 'Dubai', country: 'UAE' },
  { code: 'SIN', name: 'Singapore', country: 'Singapore' },
  { code: 'BKK', name: 'Bangkok', country: 'Thailand' },
  { code: 'TYO', name: 'Tokyo', country: 'Japan' },
];

// Helper function to convert airport code to city name
const getCityNameFromCode = (code) => {
  const city = POPULAR_CITIES.find(c => c.code === code);
  return city ? city.name : code;
};

// City Autocomplete Component
function CityAutocomplete({ value, onChange, placeholder, label }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const popularCities = POPULAR_CITIES;

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value.toUpperCase();
    setInputValue(newValue);
    onChange(newValue); // Always update parent form state

    if (newValue.length >= 2) {
      // Filter popular cities based on input
      const filtered = popularCities.filter(city =>
        city.name.toLowerCase().includes(newValue.toLowerCase()) ||
        city.code.toLowerCase().includes(newValue.toLowerCase()) ||
        city.country.toLowerCase().includes(newValue.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectCity = (city) => {
    setInputValue(city.code);
    onChange(city.code);
    setShowSuggestions(false);
  };

  return (
    <div className="flex flex-col gap-1 relative">
      <label className="text-sm font-semibold text-gray-500">{label}</label>
      <input
        type="text"
        className="input"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => inputValue.length >= 2 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        required
        minLength={3}
        maxLength={3}
        pattern="[A-Z]{3}"
        title="Enter a 3-letter airport code (e.g., LON, BCN)"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
          {suggestions.map((city) => (
            <div
              key={city.code}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleSelectCity(city)}
            >
              <div className="font-semibold text-gray-800">{city.name}</div>
              <div className="text-sm text-gray-500">{city.code} · {city.country}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Hero Section with Search
function HeroSection({ onSearch, loading }) {
  const [activeTab, setActiveTab] = useState('flights');
  const [searchLoading, setSearchLoading] = useState(false);
  const [flightPrices, setFlightPrices] = useState(null);
  const [hotelPrices, setHotelPrices] = useState(null);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    adults: 1,
    children: 0,
    childAges: [],
    rooms: 1,
    checkIn: '',
    checkOut: '',
    language: 'en',
    currency: 'EUR',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    setFlightPrices(null);
    setHotelPrices(null);

    // Calculate total travelers/guests (adults + children)
    const totalTravelers = formData.adults + formData.children;

    try {
      if (activeTab === 'flights') {
        // Fetch real prices from Travelpayouts to show on page
        const prices = await searchApi.getFlightPrices(
          formData.origin,
          formData.destination,
          formData.departureDate,
          formData.returnDate || null
        );

        if (prices.success && prices.data) {
          setFlightPrices(prices.data);
          // Scroll to results
          setTimeout(() => {
            document.getElementById('search-results')?.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }, 100);
        } else {
          // If no API results, generate direct booking link
          const result = await searchApi.flights({
            origin: formData.origin,
            destination: formData.destination,
            departure_date: formData.departureDate,
            return_date: formData.returnDate || null,
            travelers: totalTravelers,
            adults: formData.adults,
            children: formData.children,
            child_ages: formData.childAges,
            cabin_class: 'economy',
            language: formData.language,
            currency: formData.currency,
          });
          if (result.search_url) {
            window.open(result.search_url, '_blank');
          }
        }
      } else if (activeTab === 'hotels') {
        // Convert airport code to city name for hotel search
        const cityName = getCityNameFromCode(formData.destination);

        // Try to fetch hotel prices
        try {
          const prices = await searchApi.getHotelPrices(
            cityName,
            formData.checkIn,
            formData.checkOut,
            totalTravelers
          );

          if (prices.success && prices.hotels && prices.hotels.length > 0) {
            setHotelPrices(prices.hotels);
            // Scroll to results
            setTimeout(() => {
              document.getElementById('search-results')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
            }, 100);
          } else {
            throw new Error('No hotels found');
          }
        } catch (hotelError) {
          // If price API fails, generate direct booking link
          const result = await searchApi.hotels({
            destination: cityName,
            check_in: formData.checkIn,
            check_out: formData.checkOut,
            guests: totalTravelers,
            adults: formData.adults,
            children: formData.children,
            child_ages: formData.childAges,
            rooms: formData.rooms,
            language: formData.language,
            currency: formData.currency,
          });
          if (result.search_url) {
            window.open(result.search_url, '_blank');
          }
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again or adjust your search criteria.');
    } finally {
      setSearchLoading(false);
    }
  };

  const tabs = [
    { id: 'flights', label: 'Flights', icon: <Icons.Plane /> },
    { id: 'hotels', label: 'Hotels', icon: <Icons.Hotel /> },
    { id: 'packages', label: 'Packages', icon: <Icons.Suitcase /> },
    { id: 'experiences', label: 'Experiences', icon: <Icons.Hiking /> },
  ];

  return (
    <section className="min-h-screen hero-gradient flex items-center justify-center px-4 pt-24 pb-16">
      <div className="text-center text-white max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 drop-shadow-lg">
          Discover Your Perfect Trip at the Best Price
        </h1>
        <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
          Compare flights, hotels, and experiences from hundreds of travel sites. Find deals you won't see anywhere else.
        </p>

        {/* Search Box */}
        <div className="bg-white rounded-2xl p-6 shadow-2xl text-left text-gray-800 max-w-3xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b-2 border-gray-100 pb-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`search-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          {/* Flight Search Form */}
          {activeTab === 'flights' && (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <CityAutocomplete
                  label="From"
                  placeholder="City or Airport"
                  value={formData.origin}
                  onChange={(code) => setFormData({ ...formData, origin: code })}
                />
                <CityAutocomplete
                  label="To"
                  placeholder="City or Airport"
                  value={formData.destination}
                  onChange={(code) => setFormData({ ...formData, destination: code })}
                />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-500">Departure</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.departureDate}
                    onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-500">Return</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.returnDate}
                    onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-500">Adults</label>
                  <select
                    className="input"
                    value={formData.adults}
                    onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Children Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-500">Children (0-17)</label>
                  <select
                    className="input"
                    value={formData.children}
                    onChange={(e) => {
                      const numChildren = parseInt(e.target.value);
                      setFormData({
                        ...formData,
                        children: numChildren,
                        childAges: Array(numChildren).fill(5)
                      });
                    }}
                  >
                    {[0, 1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>{n} {n === 0 ? 'Children' : n === 1 ? 'Child' : 'Children'}</option>
                    ))}
                  </select>
                </div>

                {formData.children > 0 && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-500">Children Ages</label>
                    <div className="flex gap-2">
                      {Array.from({ length: formData.children }).map((_, index) => (
                        <select
                          key={index}
                          className="input flex-1"
                          value={formData.childAges[index] || 5}
                          onChange={(e) => {
                            const newAges = [...formData.childAges];
                            newAges[index] = parseInt(e.target.value);
                            setFormData({ ...formData, childAges: newAges });
                          }}
                        >
                          {Array.from({ length: 18 }, (_, i) => i).map((age) => (
                            <option key={age} value={age}>{age} yr</option>
                          ))}
                        </select>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Language and Currency Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-500">Language</label>
                  <select
                    className="input"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  >
                    <option value="en">🇬🇧 English</option>
                    <option value="nl">🇳🇱 Dutch</option>
                    <option value="de">🇩🇪 German</option>
                    <option value="fr">🇫🇷 French</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-500">Currency</label>
                  <select
                    className="input"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    <option value="EUR">€ Euro (EUR)</option>
                    <option value="USD">$ US Dollar (USD)</option>
                    <option value="GBP">£ British Pound (GBP)</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full text-lg" disabled={loading}>
                {loading ? <span className="spinner mx-auto"></span> : <><Icons.Search /> Search Flights</>}
              </button>
            </form>
          )}

          {/* Hotel Search Form */}
          {activeTab === 'hotels' && (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <CityAutocomplete
                    label="Destination"
                    placeholder="City, Hotel, or Region"
                    value={formData.destination}
                    onChange={(code) => setFormData({ ...formData, destination: code })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-500">Check-in</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-500">Check-out</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Adults and Children */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-500">Adults</label>
                  <select
                    className="input"
                    value={formData.adults}
                    onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-500">Children (0-17)</label>
                  <select
                    className="input"
                    value={formData.children}
                    onChange={(e) => {
                      const numChildren = parseInt(e.target.value);
                      setFormData({
                        ...formData,
                        children: numChildren,
                        childAges: Array(numChildren).fill(5)
                      });
                    }}
                  >
                    {[0, 1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>{n} {n === 0 ? 'Children' : n === 1 ? 'Child' : 'Children'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Children Ages */}
              {formData.children > 0 && (
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-500">Children Ages</label>
                    <div className="flex gap-2">
                      {Array.from({ length: formData.children }).map((_, index) => (
                        <select
                          key={index}
                          className="input flex-1"
                          value={formData.childAges[index] || 5}
                          onChange={(e) => {
                            const newAges = [...formData.childAges];
                            newAges[index] = parseInt(e.target.value);
                            setFormData({ ...formData, childAges: newAges });
                          }}
                        >
                          {Array.from({ length: 18 }, (_, i) => i).map((age) => (
                            <option key={age} value={age}>{age} yr</option>
                          ))}
                        </select>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Language and Currency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-500">Language</label>
                  <select
                    className="input"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  >
                    <option value="en">🇬🇧 English</option>
                    <option value="nl">🇳🇱 Dutch</option>
                    <option value="de">🇩🇪 German</option>
                    <option value="fr">🇫🇷 French</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-500">Currency</label>
                  <select
                    className="input"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    <option value="EUR">€ Euro (EUR)</option>
                    <option value="USD">$ US Dollar (USD)</option>
                    <option value="GBP">£ British Pound (GBP)</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full text-lg" disabled={loading}>
                {loading ? <span className="spinner mx-auto"></span> : <><Icons.Search /> Search Hotels</>}
              </button>
            </form>
          )}

          {/* Packages Tab */}
          {activeTab === 'packages' && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">Package search coming soon!</p>
              <p className="text-sm mt-2">Sign up for alerts to be notified.</p>
            </div>
          )}

          {/* Experiences Tab */}
          {activeTab === 'experiences' && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">Experience search coming soon!</p>
              <p className="text-sm mt-2">Browse our featured experiences below.</p>
            </div>
          )}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-8 mt-8 text-white/90">
          {[
            { icon: <Icons.Shield />, text: 'Secure Booking' },
            { icon: <Icons.Tag />, text: 'Best Price Guarantee' },
            { icon: <Icons.Bell />, text: '24/7 Support' },
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xl">{badge.icon}</span>
              <span className="font-medium">{badge.text}</span>
            </div>
          ))}
        </div>

        {/* Search Results Section */}
        {(flightPrices || hotelPrices) && (
          <div id="search-results" className="mt-12 bg-white rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto">
            {/* Flight Results */}
            {flightPrices && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  ✈️ Flight Results: {formData.origin} → {formData.destination}
                </h2>
                <p className="text-gray-600 mb-6">
                  {formData.departureDate} {formData.returnDate && `- ${formData.returnDate}`} • {formData.travelers} traveler{formData.travelers > 1 ? 's' : ''}
                </p>
                <div className="grid gap-4">
                  {Object.entries(flightPrices).slice(0, 10).map(([dest, flights]) =>
                    Object.entries(flights).slice(0, 5).map(([key, flight]) => (
                      <div key={`${dest}-${key}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg font-semibold text-gray-800">
                                {formData.origin} → {dest}
                              </span>
                              {flight.transfers === 0 && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                  Direct
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>📅 Depart: {new Date(flight.departure_at).toLocaleDateString()}</p>
                              {flight.return_at && (
                                <p>📅 Return: {new Date(flight.return_at).toLocaleDateString()}</p>
                              )}
                              {flight.airline && <p>✈️ Airline: {flight.airline}</p>}
                              {flight.transfers > 0 && <p>🔄 {flight.transfers} stop{flight.transfers > 1 ? 's' : ''}</p>}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-blue-600 mb-2">
                              €{flight.price || flight.value}
                            </div>
                            <a
                              href={flight.booking_link || `https://www.aviasales.com/search/${formData.origin}${formData.destination}?marker=tripcompare`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-primary text-sm"
                            >
                              Book Now →
                            </a>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-6 text-center">
                  <a
                    href={`https://www.aviasales.com/search/${formData.origin}${formData.destination}?marker=tripcompare`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    View all flights on Aviasales →
                  </a>
                </div>
              </div>
            )}

            {/* Hotel Results */}
            {hotelPrices && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  🏨 Hotel Results: {getCityNameFromCode(formData.destination)}
                </h2>
                <p className="text-gray-600 mb-6">
                  {formData.checkIn} - {formData.checkOut} • {formData.guests} guest{formData.guests > 1 ? 's' : ''}
                </p>
                <div className="grid gap-4">
                  {hotelPrices.slice(0, 10).map((hotel, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {hotel.name || hotel.hotelName || `Hotel ${index + 1}`}
                          </h3>
                          <div className="text-sm text-gray-600 space-y-1">
                            {hotel.stars && (
                              <p>⭐ {hotel.stars} star{hotel.stars > 1 ? 's' : ''}</p>
                            )}
                            {hotel.location && <p>📍 {hotel.location}</p>}
                            {hotel.distance && <p>🚶 {hotel.distance} from center</p>}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-blue-600 mb-2">
                            €{hotel.price || hotel.priceFrom || 'N/A'}
                          </div>
                          <p className="text-xs text-gray-500 mb-2">per night</p>
                          <a
                            href={hotel.booking_link || `https://search.hotellook.com?destination=${getCityNameFromCode(formData.destination)}&marker=tripcompare`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary text-sm"
                          >
                            Book Now →
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <a
                    href={`https://search.hotellook.com?destination=${getCityNameFromCode(formData.destination)}&marker=tripcompare`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    View all hotels on Hotellook →
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// Deals Section
function DealsSection({ deals, loading, onDealClick }) {
  if (loading) {
    return (
      <section className="section bg-white" id="deals">
        <h2 className="section-title">🔥 Today's Hottest Deals</h2>
        <div className="flex justify-center py-12">
          <div className="spinner"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="section bg-white" id="deals">
      <h2 className="section-title">🔥 Today's Hottest Deals</h2>
      <p className="section-subtitle">Limited-time offers on flights and hotels across Europe</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {deals.map((deal) => (
          <div key={deal.id} className="card cursor-pointer" onClick={() => onDealClick(deal)}>
            <div
              className="h-48 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${deal.image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'})` }}
            >
              {deal.discount_percentage && (
                <span className="deal-badge">-{deal.discount_percentage}%</span>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{deal.title}</h3>
              <p className="text-gray-500 text-sm mb-4">
                {deal.origin_city ? `From ${deal.origin_city} • ` : ''}{deal.travel_dates || 'Flexible dates'}
              </p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-extrabold text-blue-500">€{deal.deal_price}</span>
                {deal.original_price > deal.deal_price && (
                  <span className="text-gray-400 line-through">€{deal.original_price}</span>
                )}
              </div>
              <button className="btn btn-primary w-full">View Deal</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Destinations Section
function DestinationsSection({ destinations, loading }) {
  if (loading || destinations.length === 0) return null;

  return (
    <section className="section bg-gray-50" id="destinations">
      <h2 className="section-title">Trending Destinations</h2>
      <p className="section-subtitle">Most popular places to visit this season</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {destinations.map((dest) => (
          <div key={dest.id} className="relative h-72 rounded-2xl overflow-hidden cursor-pointer group">
            <img
              src={dest.image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'}
              alt={dest.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-xl font-bold">{dest.name}</h3>
              <p className="opacity-90">
                {dest.avg_flight_price ? `Flights from €${dest.avg_flight_price}` : dest.country}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Popular Destinations with REAL Travelpayouts Prices
function PopularFlightsSection({ popularDestinations, loading, onDestinationClick }) {
  if (loading) {
    return (
      <section className="section bg-blue-50" id="popular-flights">
        <h2 className="section-title">Popular Flight Routes</h2>
        <div className="flex justify-center py-12">
          <div className="spinner"></div>
        </div>
      </section>
    );
  }

  if (!popularDestinations || popularDestinations.length === 0) return null;

  // City code to name mapping
  const cityNames = {
    'BCN': 'Barcelona', 'PAR': 'Paris', 'ROM': 'Rome', 'AMS': 'Amsterdam',
    'LIS': 'Lisbon', 'PRG': 'Prague', 'VIE': 'Vienna', 'ATH': 'Athens',
    'DUB': 'Dublin', 'CPH': 'Copenhagen', 'BER': 'Berlin', 'MAD': 'Madrid',
    'MIL': 'Milan', 'LON': 'London', 'BUD': 'Budapest', 'WAW': 'Warsaw'
  };

  // City images
  const cityImages = {
    'BCN': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600',
    'PAR': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
    'ROM': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600',
    'AMS': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600',
    'LIS': 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600',
    'PRG': 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=600',
    'VIE': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=600',
    'ATH': 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=600',
  };

  return (
    <section className="section bg-blue-50" id="popular-flights">
      <h2 className="section-title">✈️ Popular Flight Routes</h2>
      <p className="section-subtitle">Real-time prices from major European airports</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {popularDestinations.slice(0, 8).map((route, index) => (
          <div
            key={index}
            className="card cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => onDestinationClick(route)}
          >
            <div
              className="h-36 bg-cover bg-center relative"
              style={{
                backgroundImage: `url(${cityImages[route.destination] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'})`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-3 left-4 text-white">
                <h3 className="font-bold text-lg">
                  {cityNames[route.destination] || route.destination}
                </h3>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500 text-sm">
                  {route.origin} → {route.destination}
                </span>
                {route.transfers === 0 && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Direct
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-blue-600">
                  €{route.price}
                </span>
                <span className="text-gray-400 text-sm">round trip</span>
              </div>
              {route.airline && (
                <p className="text-gray-500 text-xs mt-1">via {route.airline}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-gray-500 text-sm">
          💡 Prices powered by Travelpayouts • Updated in real-time
        </p>
      </div>
    </section>
  );
}

// Experiences Section
function ExperiencesSection({ experiences, loading }) {
  if (loading || experiences.length === 0) return null;

  return (
    <section className="section bg-white" id="experiences">
      <h2 className="section-title">Unforgettable Experiences</h2>
      <p className="section-subtitle">Book tours and activities at the best prices</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {experiences.map((exp) => (
          <div key={exp.id} className="card cursor-pointer">
            <div
              className="h-44 bg-cover bg-center"
              style={{ backgroundImage: `url(${exp.image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500'})` }}
            ></div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-500"><Icons.Star /></span>
                <span className="font-semibold">{exp.rating || '4.5'}</span>
                <span className="text-gray-400 text-sm">({exp.review_count || 0} reviews)</span>
              </div>
              <h4 className="font-bold mb-2 line-clamp-2">{exp.title}</h4>
              <p className="text-blue-500 font-bold">From €{exp.price} per person</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Newsletter Section
function NewsletterSection({ onSubscribe, loading, success }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubscribe(email);
    setEmail('');
  };

  return (
    <section className="section hero-gradient text-white text-center">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
        Get Exclusive Deals in Your Inbox
      </h2>
      <p className="text-xl opacity-90 mb-8">
        Join 500,000+ travelers who get our weekly deal alerts
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
        <input
          type="email"
          placeholder="Enter your email"
          className="flex-1 px-6 py-4 rounded-full text-gray-800 text-lg focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="px-8 py-4 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition-colors"
          disabled={loading}
        >
          {loading ? 'Subscribing...' : 'Subscribe Free'}
        </button>
      </form>

      {success && (
        <p className="mt-4 text-green-200 font-medium">
          ✓ Thanks for subscribing! Check your inbox.
        </p>
      )}

      <p className="mt-4 text-sm opacity-75">
        We respect your privacy. Unsubscribe anytime.
      </p>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16 px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 md:col-span-1">
          <a href="#" className="text-2xl font-extrabold text-blue-400 flex items-center gap-2 mb-4">
            ✈️ TripCompare
          </a>
          <p className="text-gray-400 text-sm">
            Your trusted partner for finding the best travel deals across Europe.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-blue-400 mb-4">Travel</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">Flights</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Hotels</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Car Rental</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Experiences</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-blue-400 mb-4">Destinations</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">Barcelona</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Rome</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Paris</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Amsterdam</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-blue-400 mb-4">Company</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-blue-400 mb-4">Support</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
        <p>© 2025 TripCompare. All rights reserved. Powered by FastAPI.</p>
      </div>
    </footer>
  );
}

// =============================================================================
// MAIN APP
// =============================================================================

export default function App() {
  const [deals, setDeals] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [apiConnected, setApiConnected] = useState(null);
  const [error, setError] = useState(null);
  const [userOrigin, setUserOrigin] = useState('LON'); // Default origin for popular routes

  // Check API health and load data
  useEffect(() => {
    const initApp = async () => {
      try {
        // Check if API is running
        await checkHealth();
        setApiConnected(true);

        // Seed database with sample data (dev only)
        try {
          await seedDatabase();
        } catch (e) {
          // Ignore - might already be seeded
        }

        // Load all data in parallel
        const [dealsData, destinationsData, experiencesData] = await Promise.all([
          dealApi.getAll(20).catch(() => []), // Load ALL deals (up to 20)
          destinationApi.getFeatured(4).catch(() => []),
          experienceApi.getTopRated(4).catch(() => []),
        ]);

        setDeals(dealsData);
        setDestinations(destinationsData);
        setExperiences(experiencesData);

        // Load popular destinations with REAL prices from Travelpayouts
        try {
          const popularData = await searchApi.getPopularDestinations(userOrigin);
          if (popularData.success && popularData.destinations) {
            setPopularDestinations(popularData.destinations);
          }
        } catch (e) {
          console.log('Popular destinations not available:', e);
        }
      } catch (e) {
        console.error('API Error:', e);
        setApiConnected(false);
        setError('Unable to connect to API. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, [userOrigin]);

  // Handle newsletter subscription
  const handleSubscribe = async (email) => {
    setSubscribeLoading(true);
    setSubscribeSuccess(false);

    try {
      await subscriberApi.subscribe(email);
      setSubscribeSuccess(true);
    } catch (e) {
      // Check if already subscribed
      if (e.message.includes('already subscribed')) {
        setSubscribeSuccess(true);
      } else {
        alert('Subscription failed. Please try again.');
      }
    } finally {
      setSubscribeLoading(false);
    }
  };

  // Handle deal click - track and redirect
  const handleDealClick = async (deal) => {
    try {
      await dealApi.trackClick(deal.id);
      const result = await dealApi.getRedirectUrl(deal.id);
      if (result.affiliate_link && result.affiliate_link !== '#') {
        window.open(result.affiliate_link, '_blank');
      } else {
        alert('Booking link not configured. Set up your affiliate links!');
      }
    } catch (e) {
      console.error('Deal click error:', e);
    }
  };

  // Handle popular destination click - redirect to Aviasales with affiliate tracking
  const handlePopularDestinationClick = async (route) => {
    try {
      // Get the next reasonable date (2 weeks from now)
      const departDate = new Date();
      departDate.setDate(departDate.getDate() + 14);
      const returnDate = new Date(departDate);
      returnDate.setDate(returnDate.getDate() + 7);

      const result = await searchApi.flights({
        origin: route.origin,
        destination: route.destination,
        departure_date: departDate.toISOString().split('T')[0],
        return_date: returnDate.toISOString().split('T')[0],
        travelers: 1,
        cabin_class: 'economy',
      });

      if (result.search_url) {
        window.open(result.search_url, '_blank');
      }
    } catch (e) {
      console.error('Popular destination click error:', e);
    }
  };

  // API not connected view
  if (apiConnected === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">API Not Connected</h1>
          <p className="text-gray-600 mb-6">
            The FastAPI backend is not running. Please start it with:
          </p>
          <code className="block bg-gray-100 p-4 rounded-lg text-sm mb-6">
            cd api && uvicorn main:app --reload
          </code>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar onSubscribeClick={() => document.getElementById('newsletter').scrollIntoView({ behavior: 'smooth' })} />

      <HeroSection loading={loading} />

      <DealsSection
        deals={deals}
        loading={loading}
        onDealClick={handleDealClick}
      />

      <PopularFlightsSection
        popularDestinations={popularDestinations}
        loading={loading}
        onDestinationClick={handlePopularDestinationClick}
      />

      <DestinationsSection
        destinations={destinations}
        loading={loading}
      />

      <ExperiencesSection
        experiences={experiences}
        loading={loading}
      />

      <div id="newsletter">
        <NewsletterSection
          onSubscribe={handleSubscribe}
          loading={subscribeLoading}
          success={subscribeSuccess}
        />
      </div>

      <Footer />
    </div>
  );
}
