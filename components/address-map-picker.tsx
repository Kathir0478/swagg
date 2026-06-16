"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { setOptions, importLibrary } from "@googlemaps/js-api-loader"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { MapPin, LocateFixed } from "lucide-react"

export interface LocationValue {
  address: string
  lat: number | null
  lng: number | null
}

interface AddressMapPickerProps {
  value: LocationValue
  onChange: (value: LocationValue) => void
  label?: string
}

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 } // India centroid as a neutral default

export function AddressMapPicker({ value, onChange, label = "Address" }: AddressMapPickerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const mapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mapObj = useRef<google.maps.Map | null>(null)
  const markerObj = useRef<google.maps.Marker | null>(null)
  const geocoder = useRef<google.maps.Geocoder | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // keep latest onChange without re-initializing the map
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const placeMarker = useCallback((lat: number, lng: number) => {
    if (!mapObj.current) return
    const pos = { lat, lng }
    if (markerObj.current) {
      markerObj.current.setPosition(pos)
    } else {
      markerObj.current = new google.maps.Marker({ position: pos, map: mapObj.current, draggable: true })
      markerObj.current.addListener("dragend", () => {
        const p = markerObj.current!.getPosition()
        if (!p) return
        const nlat = p.lat()
        const nlng = p.lng()
        geocoder.current?.geocode({ location: { lat: nlat, lng: nlng } }, (res, status) => {
          const addr = status === "OK" && res?.[0] ? res[0].formatted_address : value.address
          onChangeRef.current({ address: addr, lat: nlat, lng: nlng })
        })
      })
    }
    mapObj.current.setCenter(pos)
    mapObj.current.setZoom(15)
  }, [value.address])

  useEffect(() => {
    if (!apiKey) {
      setError("missing-key")
      return
    }
    let cancelled = false
    setOptions({ key: apiKey, v: "weekly" })
    Promise.all([importLibrary("maps"), importLibrary("marker"), importLibrary("places"), importLibrary("geocoding")])
      .then(() => {
        if (cancelled || !mapRef.current) return
        geocoder.current = new google.maps.Geocoder()
        const start = value.lat && value.lng ? { lat: value.lat, lng: value.lng } : DEFAULT_CENTER
        mapObj.current = new google.maps.Map(mapRef.current, {
          center: start,
          zoom: value.lat ? 15 : 4,
          disableDefaultUI: true,
          zoomControl: true,
        })
        if (value.lat && value.lng) placeMarker(value.lat, value.lng)

        mapObj.current.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return
          const lat = e.latLng.lat()
          const lng = e.latLng.lng()
          placeMarker(lat, lng)
          geocoder.current?.geocode({ location: { lat, lng } }, (res, status) => {
            const addr = status === "OK" && res?.[0] ? res[0].formatted_address : ""
            onChangeRef.current({ address: addr, lat, lng })
          })
        })

        if (inputRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
            fields: ["formatted_address", "geometry"],
          })
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace()
            if (!place.geometry?.location) return
            const lat = place.geometry.location.lat()
            const lng = place.geometry.location.lng()
            placeMarker(lat, lng)
            onChangeRef.current({ address: place.formatted_address || "", lat, lng })
          })
        }
        setReady(true)
      })
      .catch((e: unknown) => {
        console.log("[v0] google maps load error:", e instanceof Error ? e.message : String(e))
        setError("load-failed")
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey])

  const useMyLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      placeMarker(lat, lng)
      geocoder.current?.geocode({ location: { lat, lng } }, (res, status) => {
        const addr = status === "OK" && res?.[0] ? res[0].formatted_address : ""
        onChangeRef.current({ address: addr, lat, lng })
      })
    })
  }

  // Fallback UI when no API key is configured.
  if (error === "missing-key") {
    return (
      <div className="space-y-2">
        <Label htmlFor="address-fallback">{label}</Label>
        <Input
          id="address-fallback"
          placeholder="Enter your full address"
          value={value.address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            step="any"
            placeholder="Latitude"
            value={value.lat ?? ""}
            onChange={(e) => onChange({ ...value, lat: e.target.value ? Number(e.target.value) : null })}
          />
          <Input
            type="number"
            step="any"
            placeholder="Longitude"
            value={value.lng ?? ""}
            onChange={(e) => onChange({ ...value, lng: e.target.value ? Number(e.target.value) : null })}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Add a NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable address search and the map view.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="address-search">{label}</Label>
        <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={useMyLocation}>
          <LocateFixed className="size-3.5" />
          Use my location
        </Button>
      </div>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          id="address-search"
          className="pl-9"
          placeholder="Search for your address"
          defaultValue={value.address}
        />
      </div>
      <div
        ref={mapRef}
        className="h-56 w-full overflow-hidden rounded-lg border bg-muted"
        aria-label="Map for selecting location"
      />
      {error === "load-failed" && (
        <p className="text-xs text-destructive">Could not load Google Maps. Check your API key configuration.</p>
      )}
      {value.lat != null && value.lng != null && (
        <p className="text-xs text-muted-foreground">
          Selected: {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
        </p>
      )}
      {!ready && !error && <p className="text-xs text-muted-foreground">Loading map…</p>}
    </div>
  )
}
