#!/usr/bin/env node

/**
 * backfill coordinates for alumni who have addresses but missing lat/lng
 * run with: node scripts/backfill-coordinates.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const mapboxApiKey = process.env.NEXT_PUBLIC_MAPBOX_API

if (!supabaseUrl || !supabaseKey || !mapboxApiKey) {
  console.error('Missing required environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_MAPBOX_API')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// geocode a single address with multiple fallback attempts
async function geocodeAddress(address) {
  const geocodeAttempts = []
  
  // attempt 1: city, state, country (most specific)
  if (address.city && address.state && address.country) {
    geocodeAttempts.push(`${address.city}, ${address.state}, ${address.country}`)
  }
  
  // attempt 2: city, country
  if (address.city && address.country) {
    geocodeAttempts.push(`${address.city}, ${address.country}`)
  }
  
  // attempt 3: city, state (for US addresses)
  if (address.city && address.state) {
    geocodeAttempts.push(`${address.city}, ${address.state}`)
    geocodeAttempts.push(`${address.city}, ${address.state}, United States`)
  }
  
  // attempt 4: just city
  if (address.city) {
    geocodeAttempts.push(address.city)
  }
  
  // try each attempt
  for (const searchQuery of geocodeAttempts) {
    try {
      const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        searchQuery
      )}.json?access_token=${mapboxApiKey}&limit=1`
      
      const response = await fetch(endpoint)
      const data = await response.json()
      
      if (data.features && data.features.length > 0) {
        const [longitude, latitude] = data.features[0].center
        console.log(`✓ geocoded "${searchQuery}" -> ${latitude}, ${longitude}`)
        return { latitude, longitude }
      }
    } catch (err) {
      console.warn(`⚠ geocoding failed for "${searchQuery}":`, err.message)
    }
  }
  
  console.log(`✗ all geocoding attempts failed for address:`, address)
  return null
}

async function main() {
  console.log('🚀 starting coordinate backfill...')
  
  // find alumni with addresses but missing coordinates
  const { data: alumni, error } = await supabase
    .from('alumni')
    .select('id, firstName, lastName, address')
    .not('address', 'is', null)
  
  if (error) {
    console.error('error fetching alumni:', error)
    process.exit(1)
  }
  
  console.log(`📊 found ${alumni.length} alumni with address data`)
  
  // filter to those missing coordinates
  const missingCoords = alumni.filter(alum => 
    alum.address && 
    alum.address.city && 
    (!alum.address.latitude || !alum.address.longitude)
  )
  
  console.log(`🎯 ${missingCoords.length} alumni missing coordinates`)
  
  if (missingCoords.length === 0) {
    console.log('✅ all alumni already have coordinates!')
    return
  }
  
  let successCount = 0
  let failCount = 0
  
  // process each alumni record
  for (let i = 0; i < missingCoords.length; i++) {
    const alum = missingCoords[i]
    console.log(`\n[${i + 1}/${missingCoords.length}] processing ${alum.firstName} ${alum.lastName}`)
    console.log(`  address: ${JSON.stringify(alum.address)}`)
    
    const coords = await geocodeAddress(alum.address)
    
    if (coords) {
      // update the alumni record with coordinates
      const updatedAddress = {
        ...alum.address,
        latitude: coords.latitude,
        longitude: coords.longitude
      }
      
      const { error: updateError } = await supabase
        .from('alumni')
        .update({ address: updatedAddress })
        .eq('id', alum.id)
      
      if (updateError) {
        console.error(`  ✗ failed to update database:`, updateError)
        failCount++
      } else {
        console.log(`  ✅ updated coordinates in database`)
        successCount++
      }
    } else {
      failCount++
    }
    
    // add small delay to be respectful to mapbox api
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log('\n📈 backfill complete!')
  console.log(`✅ success: ${successCount}`)
  console.log(`❌ failed: ${failCount}`)
  console.log(`📊 total processed: ${missingCoords.length}`)
}

main().catch(console.error)