import React, { useEffect, useRef, useState } from 'react'

export default function PincodeMap({ category, currentPincode }) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [mapData, setMapData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!category) return
    setLoading(true)
    fetch(`http://localhost:8000/pincode-map?category=${encodeURIComponent(category)}`)
      .then(res => res.json())
      .then(data => {
        setMapData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load pincode map coordinates:', err)
        setLoading(false)
      })
  }, [category])

  useEffect(() => {
    if (!mapContainerRef.current || !window.L || loading) return

    // Clean up existing map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    // Default center Jalgaon district [21.0044, 75.5645]
    let centerLat = 21.0044
    let centerLon = 75.5645
    let zoomLevel = 10

    const currentItem = mapData.find(d => d.pincode === currentPincode)
    if (currentItem && currentItem.latitude && currentItem.longitude) {
      centerLat = currentItem.latitude
      centerLon = currentItem.longitude
    }

    const map = window.L.map(mapContainerRef.current).setView([centerLat, centerLon], zoomLevel)
    mapInstanceRef.current = map

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    if (mapData.length === 0) return

    const bounds = []
    const maxCount = Math.max(...mapData.map(d => d.count), 1)

    mapData.forEach(item => {
      if (!item.latitude || !item.longitude) return

      const isCurrent = item.pincode === currentPincode
      bounds.push([item.latitude, item.longitude])

      // Radius scaled by count
      const radius = isCurrent ? 14 : Math.max(6, Math.min(20, (item.count / maxCount) * 18 + 5))
      const color = isCurrent ? '#047857' : (item.count > 30 ? '#b45309' : '#1d4ed8')
      const fillColor = isCurrent ? '#10b981' : (item.count > 30 ? '#f59e0b' : '#3b82f6')

      const marker = window.L.circleMarker([item.latitude, item.longitude], {
        radius,
        color,
        fillColor,
        fillOpacity: isCurrent ? 0.95 : 0.65,
        weight: isCurrent ? 3.5 : 1.5
      }).addTo(map)

      const postOfficeText = item.office_name ? item.office_name : 'N/A'
      const villagesText = item.localities ? item.localities : 'N/A'

      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 12px; line-height: 1.5; color: #1e293b; min-width: 190px;">
          <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
            📍 Pincode: ${item.pincode}
          </div>
          <div style="margin-bottom: 2px;">
            <span style="color: #64748b; font-weight: 600;">Category:</span> <b>${category}</b>
          </div>
          <div style="margin-bottom: 2px;">
            <span style="color: #64748b; font-weight: 600;">Business Count:</span> <b style="color: #047857;">${item.count}</b>
          </div>
          <div style="margin-bottom: 2px;">
            <span style="color: #64748b; font-weight: 600;">Post Office:</span> ${postOfficeText}
          </div>
          <div style="margin-bottom: 4px;">
            <span style="color: #64748b; font-weight: 600;">Covered Villages/Localities:</span> ${villagesText}
          </div>
          ${isCurrent ? `
            <div style="margin-top: 6px; color: #047857; font-weight: 800; background: #ecfdf5; padding: 4px 8px; border-radius: 6px; border: 1px solid #a7f3d0; text-align: center;">
              📍 Selected Village Pincode
            </div>
          ` : ''}
        </div>
      `
      marker.bindPopup(popupContent)

      if (isCurrent) {
        marker.openPopup()
      }
    })

    if (bounds.length > 0 && !currentItem) {
      map.fitBounds(bounds, { padding: [30, 30] })
    }
  }, [mapData, currentPincode, loading, category])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-base font-black text-slate-900 flex items-center space-x-2">
            <span>🗺️ Geographic Business Density Map</span>
          </h4>
          <p className="text-xs text-slate-500 font-semibold">
            Visualizing MSME registered business concentrations across pincodes.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-[11px] font-extrabold">
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-700" />
            <span>Selected Village</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>High Density</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Moderate / Low</span>
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner bg-slate-100">
        {loading ? (
          <div className="h-96 flex items-center justify-center text-xs font-black text-slate-400 animate-pulse">
            Loading map coordinates...
          </div>
        ) : (
          <div ref={mapContainerRef} className="h-96 w-full z-0" />
        )}
      </div>

      {/* CRITICAL: Explicit Non-Removable Caption */}
      <div id="pincode-map-caption" className="bg-amber-50 border-2 border-amber-300/80 rounded-2xl p-3 px-4 text-xs text-amber-950 font-extrabold flex items-center justify-center space-x-2 text-center shadow-xs">
        <span className="text-base leading-none">ℹ️</span>
        <span>Pincode locations from public dataset (India Post pincode boundaries) — approximate, for reference only.</span>
      </div>
    </div>
  )
}

