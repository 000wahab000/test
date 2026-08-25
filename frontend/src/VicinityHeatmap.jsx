import React, { useState } from 'react'

const HEATMAP_DATA = {
  grocery: {
    title: 'Grocery & Provision Stores Density',
    totalUnits: 14,
    density: 'High Competition in Market Square',
    recommendation: 'West Sector (High Customer Demand, Only 1 Shop)',
    spots: [
      { id: 1, name: 'Main Mandi Market', count: '8 Shops', type: 'high', top: '35%', left: '42%' },
      { id: 2, name: 'Bus Stand Junction', count: '4 Shops', type: 'medium', top: '55%', left: '60%' },
      { id: 3, name: 'West Sector Residential', count: '1 Shop', type: 'low', top: '25%', left: '20%' },
      { id: 4, name: 'Highway Bypass', count: '1 Shop', type: 'low', top: '75%', left: '78%' }
    ]
  },
  tiles: {
    title: 'Tiles, Bricks & Hardware Units Density',
    totalUnits: 3,
    density: 'Low Competition (High Opportunity)',
    recommendation: 'Highway Bypass (Ideal for Heavy Loading & Transport)',
    spots: [
      { id: 1, name: 'Highway Bypass Junction', count: '2 Depots', type: 'medium', top: '70%', left: '72%' },
      { id: 2, name: 'Sub-District Road', count: '1 Unit', type: 'low', top: '30%', left: '35%' },
      { id: 3, name: 'North Agricultural Hub', count: '0 Units', type: 'opportunity', top: '20%', left: '65%' }
    ]
  },
  flour: {
    title: 'Flour Mills (Atta Chakki) Density',
    totalUnits: 5,
    density: 'Moderate Competition',
    recommendation: 'East Grain Market (Close to Wheat Harvesting Belts)',
    spots: [
      { id: 1, name: 'East Grain Haat', count: '3 Mills', type: 'medium', top: '40%', left: '68%' },
      { id: 2, name: 'Central Village Road', count: '2 Mills', type: 'medium', top: '50%', left: '45%' }
    ]
  },
  dairy: {
    title: 'Dairy Farming & Milk Collection Centers',
    totalUnits: 8,
    density: 'Moderate to High in Irrigated Belt',
    recommendation: 'South Canal Area (Year-Round Fodder & Water Supply)',
    spots: [
      { id: 1, name: 'South Irrigation Canal', count: '5 Collection Centers', type: 'high', top: '65%', left: '40%' },
      { id: 2, name: 'North Grazing Lands', count: '3 Centers', type: 'medium', top: '22%', left: '55%' }
    ]
  }
}

export default function VicinityHeatmap() {
  const [activeCategory, setActiveCategory] = useState('grocery')
  const [selectedSpot, setSelectedSpot] = useState(null)

  const currentData = HEATMAP_DATA[activeCategory]

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6 text-left relative overflow-hidden">
      {/* Top Controls & Category Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="text-xs font-black text-emerald-600 tracking-widest uppercase block">SIMULATED VICINITY HEATMAP</span>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Google Maps Vicinity Business Density</h3>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'grocery', label: '🛒 Grocery Stores' },
            { id: 'tiles', label: '🧱 Tiles & Hardware' },
            { id: 'flour', label: '🌾 Flour Mills' },
            { id: 'dairy', label: '🐄 Dairy Outlets' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id)
                setSelectedSpot(null)
              }}
              className={`text-xs font-extrabold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Simulated Map Canvas */}
        <div className="lg:col-span-8 bg-slate-900 rounded-3xl border-2 border-slate-800 h-96 relative overflow-hidden shadow-inner group">
          {/* Simulated Google Maps Base Terrain Styling */}
          <div className="absolute inset-0 bg-[#0f172a] opacity-95">
            {/* Simulated Roads Grid */}
            <svg className="w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 100 Q 200 120 400 90 T 800 130" stroke="#94a3b8" strokeWidth="8" fill="none" />
              <path d="M250 0 L 250 400" stroke="#64748b" strokeWidth="6" fill="none" />
              <path d="M500 0 L 500 400" stroke="#64748b" strokeWidth="5" fill="none" strokeDasharray="6,6" />
              <path d="M0 260 L 800 260" stroke="#94a3b8" strokeWidth="10" fill="none" />
              <circle cx="250" cy="260" r="30" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4,4" />
            </svg>

            {/* Simulated River / Canal */}
            <div className="absolute top-0 bottom-0 left-[20%] w-12 bg-blue-500/20 blur-sm transform -rotate-12" />
          </div>

          {/* Animated Heatmap Blobs Overlay */}
          {currentData.spots.map(spot => {
            const isSelected = selectedSpot?.id === spot.id
            const glowColor =
              spot.type === 'high'
                ? 'bg-rose-500/50 shadow-[0_0_50px_#f43f5e]'
                : spot.type === 'medium'
                ? 'bg-amber-500/45 shadow-[0_0_40px_#f59e0b]'
                : spot.type === 'opportunity'
                ? 'bg-blue-500/40 shadow-[0_0_35px_#3b82f6]'
                : 'bg-emerald-500/40 shadow-[0_0_35px_#10b981]'

            return (
              <div
                key={spot.id}
                style={{ top: spot.top, left: spot.left }}
                onClick={() => setSelectedSpot(spot)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group/spot ${
                  isSelected ? 'z-30 scale-125' : 'z-20'
                }`}
              >
                {/* Radial Glowing Heat Heatmap Circle */}
                <div className={`w-24 h-24 rounded-full ${glowColor} animate-heat-pulse opacity-80 blur-md pointer-events-none`} />

                {/* Pin Point Marker */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-white text-slate-900 font-black text-xs flex items-center justify-center shadow-lg border-2 border-slate-900 group-hover/spot:scale-125 transition-transform">
                    {spot.type === 'high' ? '🔥' : spot.type === 'opportunity' ? '⭐' : '📍'}
                  </div>
                </div>

                {/* Hover Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap pointer-events-none border border-slate-700 opacity-90 group-hover/spot:opacity-100 transition-opacity">
                  <p>{spot.name}</p>
                  <p className="text-emerald-400 font-bold">{spot.count}</p>
                </div>
              </div>
            )
          })}

          {/* Map Top Badge */}
          <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3.5 py-1.5 rounded-xl text-white text-xs font-black flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{currentData.title}</span>
          </div>

          {/* Map Legend Bottom Right */}
          <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-2.5 rounded-xl text-[10px] font-bold text-white space-y-1">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>High Density (8+ Shops)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Moderate (3-7 Shops)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Low Density (0-2 Shops)</span>
            </div>
          </div>
        </div>

        {/* Heatmap Insights Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-3">
            <span className="text-[11px] font-black text-slate-400 uppercase block tracking-wider">LOCAL VICINITY ANALYSIS</span>
            <div className="space-y-1">
              <p className="text-xs text-slate-500 font-bold">Total Existing Units</p>
              <p className="text-2xl font-black text-slate-900">{currentData.totalUnits} Units Registered</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500 font-bold">Density Level</p>
              <p className="text-sm font-extrabold text-amber-700">{currentData.density}</p>
            </div>
          </div>

          <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200 space-y-2">
            <p className="text-xs font-black text-emerald-900 flex items-center space-x-1">
              <span>🎯 Optimal Site Recommendation</span>
            </p>
            <p className="text-sm font-bold text-emerald-950 leading-relaxed">
              {currentData.recommendation}
            </p>
          </div>

          {selectedSpot && (
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200 text-xs space-y-1 animate-float-slow">
              <p className="font-extrabold text-indigo-900">Selected Location: {selectedSpot.name}</p>
              <p className="text-indigo-800">Density: {selectedSpot.count}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
