#!/usr/bin/env node

/**
 * test script to demonstrate improved geocoding
 * run with: node scripts/test-geocoding.js
 */

require('dotenv').config()

const mapboxApiKey = process.env.NEXT_PUBLIC_MAPBOX_API

if (!mapboxApiKey) {
  console.error('Missing NEXT_PUBLIC_MAPBOX_API environment variable')
  process.exit(1)
}

// test cases that should now work better
const testCases = [
  {
    name: "City + State (US)",
    address: { city: "San Francisco", state: "CA", country: "" }
  },
  {
    name: "City + State + Country",
    address: { city: "Portland", state: "OR", country: "United States" }
  },
  {
    name: "City + Country (Original)",
    address: { city: "London", state: "", country: "United Kingdom" }
  },
  {
    name: "International City + State",
    address: { city: "Toronto", state: "Ontario", country: "Canada" }
  },
  {
    name: "City Only",
    address: { city: "Paris", state: "", country: "" }
  },
  {
    name: "Small Town + State",
    address: { city: "Blue Lake", state: "CA", country: "" }
  }
]

// improved geocoding function (same logic as the API)
async function geocodeAddress(address) {
  const geocodeAttempts = []
  
  // attempt 1: city, state, country (most specific)
  if (address.city && address.state && address.country) {
    geocodeAttempts.push(`${address.city}, ${address.state}, ${address.country}`)
  }
  
  // attempt 2: city, country (original logic)
  if (address.city && address.country) {
    geocodeAttempts.push(`${address.city}, ${address.country}`)
  }
  
  // attempt 3: city, state (for US addresses without explicit country)
  if (address.city && address.state) {
    geocodeAttempts.push(`${address.city}, ${address.state}`)
    // also try with US as country for state abbreviations
    geocodeAttempts.push(`${address.city}, ${address.state}, United States`)
  }
  
  // attempt 4: just city as last resort
  if (address.city) {
    geocodeAttempts.push(address.city)
  }
  
  console.log(`  🔍 trying ${geocodeAttempts.length} geocoding attempts...`)
  
  // try each geocoding attempt until one succeeds
  for (let i = 0; i < geocodeAttempts.length; i++) {
    const searchQuery = geocodeAttempts[i]
    console.log(`    ${i + 1}. "${searchQuery}"`)
    
    try {
      const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        searchQuery,
      )}.json?access_token=${mapboxApiKey}&limit=1`
      
      const response = await fetch(endpoint)
      const data = await response.json()
      
      if (data.features && data.features.length > 0) {
        const [longitude, latitude] = data.features[0].center
        const placeName = data.features[0].place_name
        console.log(`    ✅ SUCCESS! → ${latitude}, ${longitude}`)
        console.log(`    📍 Full location: ${placeName}`)
        return { longitude, latitude, placeName, query: searchQuery }
      } else {
        console.log(`    ❌ no results`)
      }
    } catch (err) {
      console.log(`    ⚠️  error: ${err.message}`)
    }
    
    // small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  console.log(`  ❌ ALL ATTEMPTS FAILED`)
  return null
}

async function runTests() {
  console.log('🧪 Testing Improved Geocoding Logic\n')
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    console.log(`[${i + 1}/${testCases.length}] ${testCase.name}`)
    console.log(`  📫 Address: ${JSON.stringify(testCase.address)}`)
    
    const result = await geocodeAddress(testCase.address)
    
    if (result) {
      console.log(`  🎉 GEOCODED with query: "${result.query}"`)
    } else {
      console.log(`  💀 FAILED to geocode`)
    }
    
    console.log('') // blank line
  }
  
  console.log('✅ Test complete!')
}

runTests().catch(console.error)