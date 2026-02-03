#!/usr/bin/env python3
"""
Travelpayouts Integration Test Script

Tests the real API integration with your Travelpayouts token.
Run this after setting up your .env file to verify everything works.

Usage: python test_travelpayouts.py
"""

import asyncio
import httpx
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
API_BASE = "http://localhost:8000"
TRAVELPAYOUTS_TOKEN = os.getenv("TRAVELPAYOUTS_TOKEN")
TRAVELPAYOUTS_MARKER = os.getenv("TRAVELPAYOUTS_MARKER", "tripcompare")

print("=" * 60)
print("TripCompare - Travelpayouts Integration Test")
print("=" * 60)
print(f"\nToken configured: {'Yes' if TRAVELPAYOUTS_TOKEN else 'NO - Set TRAVELPAYOUTS_TOKEN in .env!'}")
print(f"Affiliate marker: {TRAVELPAYOUTS_MARKER}")
print()


async def test_api():
    """Test all Travelpayouts API endpoints."""

    async with httpx.AsyncClient(timeout=30.0) as client:
        tests_passed = 0
        tests_failed = 0

        # Test 1: Health Check
        print("[1/6] Testing API Health...")
        try:
            r = await client.get(f"{API_BASE}/health")
            if r.status_code == 200:
                print("    ✅ API is healthy")
                tests_passed += 1
            else:
                print(f"    ❌ API returned {r.status_code}")
                tests_failed += 1
        except httpx.ConnectError:
            print("    ❌ Cannot connect to API. Start it with: uvicorn api.main:app --reload")
            return

        # Test 2: Widget Config
        print("\n[2/6] Testing Widget Configuration...")
        try:
            r = await client.get(f"{API_BASE}/search/widget/config")
            data = r.json()
            if data.get("token_configured"):
                print(f"    ✅ Token configured, marker: {data.get('marker')}")
                tests_passed += 1
            else:
                print("    ⚠️  Token not configured - API will work but won't fetch real prices")
                tests_failed += 1
        except Exception as e:
            print(f"    ❌ Error: {e}")
            tests_failed += 1

        # Test 3: Flight Search URL Generation
        print("\n[3/6] Testing Flight Search URL Generation...")
        try:
            r = await client.post(
                f"{API_BASE}/search/flights",
                json={
                    "origin": "LON",
                    "destination": "BCN",
                    "departure_date": "2025-06-15",
                    "return_date": "2025-06-22",
                    "travelers": 2,
                    "cabin_class": "economy"
                }
            )
            data = r.json()
            if "search_url" in data and "marker=" in data["search_url"]:
                print(f"    ✅ Search URL generated: {data['search_url'][:60]}...")
                print(f"    ✅ Affiliate tracking: marker={TRAVELPAYOUTS_MARKER}")
                tests_passed += 1
            else:
                print(f"    ❌ Invalid response: {data}")
                tests_failed += 1
        except Exception as e:
            print(f"    ❌ Error: {e}")
            tests_failed += 1

        # Test 4: Popular Destinations (Real API)
        print("\n[4/6] Testing Popular Destinations (Real Travelpayouts API)...")
        try:
            r = await client.get(f"{API_BASE}/search/flights/popular?origin=LON")
            data = r.json()
            if data.get("success") and data.get("destinations"):
                dest_count = len(data["destinations"])
                print(f"    ✅ Got {dest_count} popular destinations from LON")
                if dest_count > 0:
                    first = data["destinations"][0]
                    print(f"    ✅ Top route: LON → {first.get('destination')} for €{first.get('price')}")
                tests_passed += 1
            else:
                print(f"    ⚠️  No destinations returned (API may be rate limited)")
                tests_failed += 1
        except Exception as e:
            print(f"    ❌ Error: {e}")
            tests_failed += 1

        # Test 5: Hotel Search URL Generation
        print("\n[5/6] Testing Hotel Search URL Generation...")
        try:
            r = await client.post(
                f"{API_BASE}/search/hotels",
                json={
                    "destination": "Barcelona",
                    "check_in": "2025-06-15",
                    "check_out": "2025-06-20",
                    "guests": 2,
                    "rooms": 1
                }
            )
            data = r.json()
            if "search_url" in data and "marker=" in data["search_url"]:
                print(f"    ✅ Hotel URL generated: {data['search_url'][:60]}...")
                print(f"    ✅ Affiliate tracking included")
                tests_passed += 1
            else:
                print(f"    ❌ Invalid response: {data}")
                tests_failed += 1
        except Exception as e:
            print(f"    ❌ Error: {e}")
            tests_failed += 1

        # Test 6: Hotel Prices (Real API)
        print("\n[6/6] Testing Hotel Prices (Real Hotellook API)...")
        try:
            r = await client.get(
                f"{API_BASE}/search/hotels/prices",
                params={
                    "location": "Barcelona",
                    "check_in": "2025-06-15",
                    "check_out": "2025-06-20",
                    "adults": 2
                }
            )
            data = r.json()
            if data.get("success") and data.get("hotels"):
                hotel_count = len(data["hotels"])
                print(f"    ✅ Got {hotel_count} hotels in Barcelona")
                if hotel_count > 0:
                    first = data["hotels"][0]
                    print(f"    ✅ Example: {first.get('hotelName', 'Hotel')} - €{first.get('priceFrom', 'N/A')}")
                tests_passed += 1
            else:
                print(f"    ⚠️  No hotels returned (API may be rate limited)")
                tests_failed += 1
        except Exception as e:
            print(f"    ❌ Error: {e}")
            tests_failed += 1

        # Summary
        print("\n" + "=" * 60)
        print(f"RESULTS: {tests_passed} passed, {tests_failed} failed")
        print("=" * 60)

        if tests_passed >= 4:
            print("\n🎉 Travelpayouts integration is working!")
            print("\nYour affiliate links will track commissions when users book.")
            print(f"Dashboard: https://www.travelpayouts.com/programs")
        else:
            print("\n⚠️  Some tests failed. Check your configuration.")
            print("\nTroubleshooting:")
            print("1. Ensure TRAVELPAYOUTS_TOKEN is set in .env")
            print("2. Make sure the API is running: uvicorn api.main:app --reload")
            print("3. Check Travelpayouts dashboard for API access")


if __name__ == "__main__":
    asyncio.run(test_api())
