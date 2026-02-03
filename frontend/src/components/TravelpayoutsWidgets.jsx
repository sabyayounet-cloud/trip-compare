/**
 * Travelpayouts Embedded Widgets
 *
 * These widgets are provided by Travelpayouts and include:
 * - Flight search widget
 * - Hotel search widget
 * - Calendar widget
 * - Map widget
 *
 * All widgets use your affiliate marker for commission tracking.
 */
import React, { useEffect, useRef, useState } from 'react';

// Get marker from environment or use default
const TRAVELPAYOUTS_MARKER = import.meta.env.VITE_TRAVELPAYOUTS_MARKER || 'tripcompare';

/**
 * Aviasales Flight Search Widget
 * Full-featured flight search form that redirects to Aviasales
 */
export function FlightSearchWidget({
  locale = 'en',
  currency = 'EUR',
  origin = '',
  destination = '',
  onSearch
}) {
  const containerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Load Travelpayouts widget script
    const script = document.createElement('script');
    script.src = '//www.travelpayouts.com/widgets/ddc5fe0d0d5f0b1b7d8d3a9a9a1a2b3c.js?v=2418';
    script.async = true;
    script.charset = 'utf-8';

    script.onload = () => setLoaded(true);

    // Initialize widget configuration
    window.TP_WIDGET_CONFIG = {
      marker: TRAVELPAYOUTS_MARKER,
      locale: locale,
      currency: currency,
      origin: origin,
      destination: destination,
    };

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [locale, currency, origin, destination]);

  return (
    <div className="travelpayouts-widget flight-widget" ref={containerRef}>
      {!loaded && (
        <div className="flex items-center justify-center py-8">
          <div className="spinner"></div>
          <span className="ml-3 text-gray-500">Loading flight search...</span>
        </div>
      )}
      <div
        id="tp-flight-widget"
        data-marker={TRAVELPAYOUTS_MARKER}
        data-locale={locale}
        data-currency={currency}
      ></div>
    </div>
  );
}

/**
 * Hotellook Hotel Search Widget
 * Full-featured hotel search form that redirects to Hotellook
 */
export function HotelSearchWidget({
  locale = 'en',
  currency = 'EUR',
  destination = ''
}) {
  const containerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Load Hotellook widget script
    const script = document.createElement('script');
    script.src = '//www.travelpayouts.com/widgets/hotel_widget.js';
    script.async = true;
    script.charset = 'utf-8';

    script.onload = () => {
      setLoaded(true);
      // Initialize hotel widget
      if (window.HotelWidget) {
        window.HotelWidget.init({
          marker: TRAVELPAYOUTS_MARKER,
          locale: locale,
          currency: currency,
        });
      }
    };

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [locale, currency, destination]);

  return (
    <div className="travelpayouts-widget hotel-widget" ref={containerRef}>
      {!loaded && (
        <div className="flex items-center justify-center py-8">
          <div className="spinner"></div>
          <span className="ml-3 text-gray-500">Loading hotel search...</span>
        </div>
      )}
      <div
        id="tp-hotel-widget"
        data-marker={TRAVELPAYOUTS_MARKER}
        data-locale={locale}
        data-currency={currency}
      ></div>
    </div>
  );
}

/**
 * Price Calendar Widget
 * Shows cheapest prices for each day of the month
 */
export function PriceCalendarWidget({
  origin,
  destination,
  currency = 'EUR'
}) {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/search/flights/calendar?origin=${origin}&destination=${destination}&depart_date=${currentMonth.toISOString().split('T')[0]}&currency=${currency}`
        );
        const data = await response.json();
        if (data.success && data.prices) {
          setPrices(data.prices);
        }
      } catch (e) {
        console.error('Failed to fetch price calendar:', e);
      } finally {
        setLoading(false);
      }
    };

    if (origin && destination) {
      fetchPrices();
    }
  }, [origin, destination, currentMonth, currency]);

  // Generate calendar days
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty slots for days before first of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="price-calendar bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          ←
        </button>
        <h3 className="text-xl font-bold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-gray-500 text-sm font-medium py-2">{day}</div>
        ))}

        {days.map((day, index) => {
          if (!day) return <div key={index} />;

          const dateStr = day.toISOString().split('T')[0];
          const price = prices[dateStr];
          const isToday = day.toDateString() === new Date().toDateString();
          const isPast = day < new Date();

          return (
            <div
              key={index}
              className={`
                p-2 rounded-lg cursor-pointer transition-colors
                ${isPast ? 'opacity-50' : 'hover:bg-blue-50'}
                ${isToday ? 'ring-2 ring-blue-500' : ''}
                ${price ? 'bg-green-50' : ''}
              `}
            >
              <div className="text-sm">{day.getDate()}</div>
              {price && !isPast && (
                <div className="text-xs font-bold text-green-600">€{price}</div>
              )}
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="text-center mt-4 text-gray-500">
          <span className="spinner inline-block mr-2"></span>
          Loading prices...
        </div>
      )}
    </div>
  );
}

/**
 * Popular Routes Map Widget
 * Visual map showing popular destinations from origin
 */
export function PopularRoutesMap({ origin, onDestinationSelect }) {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopular = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search/flights/popular?origin=${origin}`);
        const data = await response.json();
        if (data.success && data.destinations) {
          setDestinations(data.destinations);
        }
      } catch (e) {
        console.error('Failed to fetch popular routes:', e);
      } finally {
        setLoading(false);
      }
    };

    if (origin) {
      fetchPopular();
    }
  }, [origin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="popular-routes">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {destinations.map((dest, index) => (
          <button
            key={index}
            onClick={() => onDestinationSelect(dest)}
            className="p-4 bg-white rounded-xl shadow hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-lg font-bold text-blue-600">{dest.destination}</div>
            <div className="text-sm text-gray-500">{dest.origin} → {dest.destination}</div>
            <div className="text-xl font-extrabold text-green-600 mt-2">€{dest.price}</div>
            {dest.transfers === 0 && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Direct
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default {
  FlightSearchWidget,
  HotelSearchWidget,
  PriceCalendarWidget,
  PopularRoutesMap
};
