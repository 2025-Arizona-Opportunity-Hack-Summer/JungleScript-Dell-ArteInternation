"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import useSWR from "swr"
import { debounce } from "lodash"

interface Address {
  street: string
  city: string
  state: string
  country: string
}

interface AddressAutofillProps {
  value: Address
  onChange: (address: Address) => void
  apiKey: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AddressAutofill({ value, onChange, apiKey }: AddressAutofillProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isFocused, setIsFocused] = useState(false)

  const { data } = useSWR(
    query ? `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${apiKey}&types=address,postcode,place` : null,
    fetcher
  )

  useEffect(() => {
    if (data?.features) {
      setSuggestions(data.features)
    }
  }, [data])

  const debouncedSetQuery = useCallback(debounce(setQuery, 300), [])

  const handleSelect = (feature: any) => {
    const context = feature.context
    const street = feature.text || ""
    const city = context?.find((c: any) => c.id.startsWith("place"))?.text || ""
    const state = context?.find((c: any) => c.id.startsWith("region"))?.text || ""
    const country = context?.find((c: any) => c.id.startsWith("country"))?.text || ""

    onChange({ street, city, state, country })
    setQuery(`${street}, ${city}, ${state}, ${country}`)
    setSuggestions([])
  }

  const handleManualChange = (field: keyof Address, fieldValue: string) => {
    const newAddress = { ...value, [field]: fieldValue }
    onChange(newAddress)
    setQuery(`${newAddress.street}, ${newAddress.city}, ${newAddress.state}, ${newAddress.country}`)
  }
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Label>Address</Label>
        <Input
          placeholder="Start typing your address..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            debouncedSetQuery(e.target.value)
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />
        {isFocused && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            {suggestions.map((feature) => (
              <div
                key={feature.id}
                className="p-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSelect(feature)}
              >
                {feature.place_name}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input placeholder="City" value={value.city} onChange={(e) => handleManualChange("city", e.target.value)} />
        <Input placeholder="State/Province" value={value.state} onChange={(e) => handleManualChange("state", e.target.value)} />
        <Input placeholder="Country" value={value.country} onChange={(e) => handleManualChange("country", e.target.value)} />
      </div>
    </div>
  )
} 