"use client"

import { useEffect, useRef, useState } from "react"
import { setOptions, importLibrary } from "@googlemaps/js-api-loader"
import { MapPin } from "lucide-react"

interface MapViewProps {
  lat?: number | null
  lng?: number | null
  className?: string
}

export function MapView({ lat, lng, className = "h-40" }: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const ref = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!apiKey || lat == null || lng == null) return
    let cancelled = false
    setOptions({ key: apiKey, v: "weekly" })
    Promise.all([importLibrary("maps"), importLibrary("marker")])
      .then(() => {
        if (cancelled || !ref.current) return
        const pos = { lat, lng }
        const map = new google.maps.Map(ref.current, {
          center: pos,
          zoom: 15,
          disableDefaultUI: true,
        })
        new google.maps.Marker({ position: pos, map })
      })
      .catch(() => setFailed(true))
    return () => {
      cancelled = true
    }
  }, [apiKey, lat, lng])

  if (lat == null || lng == null) {
    return (
      <div className={`flex w-full items-center justify-center rounded-lg border bg-muted text-muted-foreground ${className}`}>
        <span className="text-sm">No location set</span>
      </div>
    )
  }

  if (!apiKey || failed) {
    return (
      <div className={`flex w-full flex-col items-center justify-center gap-1 rounded-lg border bg-muted text-muted-foreground ${className}`}>
        <MapPin className="size-5" />
        <span className="text-xs">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </span>
      </div>
    )
  }

  return <div ref={ref} className={`w-full overflow-hidden rounded-lg border ${className}`} />
}
