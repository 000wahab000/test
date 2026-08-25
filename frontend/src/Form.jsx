import React, { useState, useEffect } from 'react'
import { SC_SCHEMES } from './scSchemes'

function Tooltip({ text }) {
  return (
    <span className="relative group inline-flex items-center ml-1.5 cursor-pointer">
      <span className="text-slate-400 hover:text-slate-600 text-xs font-semibold">ℹ️</span>
      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-64 p-3 bg-slate-900 text-white text-[11px] font-normal rounded-xl shadow-2xl z-50 leading-tight border border-slate-700 pointer-events-none normal-case">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></span>
      </span>
    </span>
  )
}

export const BUSINESS_CATEGORIES = [
  { id: 'Grocery Store & Provision Shop', label: '🛒 Grocery Store & Provision Shop' },
  { id: 'Tiles, Bricks & Building Materials Unit', label: '🧱 Tiles, Bricks & Building Materials Unit' },
  { id: 'Flour Mill (Atta Chakki)', label: '🌾 Flour Mill (Atta Chakki)' },
  { id: 'Dairy Farm & Milk Collection Center', label: '🐄 Dairy Farm & Milk Collection Center' },
  { id: 'Clothing, Textile & Tailoring Shop', label: '👕 Clothing, Textile & Tailoring Shop' },
  { id: 'Poultry Farming & Hatchery', label: '🐔 Poultry Farming & Hatchery' },
  { id: 'Edible Oil Extraction Unit', label: '🛢️ Edible Oil Extraction Unit' },
  { id: 'Seed, Fertilizer & Agricultural Shop', label: '🌱 Seed, Fertilizer & Agricultural Shop' },
  { id: 'Electronics & Mobile Repair Shop', label: '📱 Electronics & Mobile Repair Shop' },
  { id: 'Bakery, Sweets & Confectionery Unit', label: '🍞 Bakery, Sweets & Confectionery Unit' },
  { id: 'Carpentry & Wooden Furniture Workshop', label: '🪵 Carpentry & Wooden Furniture Workshop' },
  { id: 'Auto, Tractor & Machinery Repair Shop', label: '🚜 Auto, Tractor & Machinery Repair Shop' },
  { id: 'Medical & Pharmacy Retail Store', label: '💊 Medical & Pharmacy Retail Store' },
  { id: 'Spice Processing & Grinding Unit', label: '🌶️ Spice Processing & Grinding Unit' },
  { id: 'Goat & Livestock Husbandry', label: '🐐 Goat & Livestock Husbandry' },
  { id: 'Welding & Hardware Fabrication Shop', label: '🛠️ Welding & Hardware Fabrication Shop' },
  { id: 'General Hardware & Electrical Store', label: '🔌 General Hardware & Electrical Store' }
]

export default function Form({ onSubmit, isLoading, onBackToHome }) {
  const [locations, setLocations] = useState({ states: [], districts: [], villages: [] })
  const [selectedState, setSelectedState] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedVillage, setSelectedVillage] = useState('')
  const [category, setCategory] = useState(BUSINESS_CATEGORIES[0].id)
  const [selectedScheme, setSelectedScheme] = useState(SC_SCHEMES[0].name)
  const [capital, setCapital] = useState('100000')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('http://localhost:8000/locations')
      .then(res => res.json())
      .then(data => {
        setLocations(data)
        if (data.states && data.states.length > 0) setSelectedState(data.states[0])
        if (data.districts && data.districts.length > 0) setSelectedDistrict(data.districts[0].district)
        if (data.villages && data.villages.length > 0) setSelectedVillage(data.villages[0].village)
      })
      .catch(err => console.error('Failed to load locations:', err))
  }, [])

  const filteredDistricts = Array.from(new Set(
    locations.districts
      .filter(d => !selectedState || d.state === selectedState)
      .map(d => d.district)
  ))

  const filteredVillages = locations.villages
    .filter(v => (!selectedState || v.state === selectedState) && (!selectedDistrict || v.district === selectedDistrict))

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const val = parseFloat(capital)
    if (isNaN(val) || val < 10000) {
      setError('Minimum margin capital amount is ₹10,000.')
      return
    }
    if (!selectedState || !selectedDistrict || !selectedVillage) return
    onSubmit({
      state: selectedState,
      district: selectedDistrict,
      village: selectedVillage,
      business_category: category,
      capital: val,
      government_scheme: selectedScheme
    })
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 space-y-6 max-w-xl mx-auto text-left">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">1</span>
          <h2 className="text-xl font-extrabold text-slate-900">Your Inputs</h2>
        </div>
        {onBackToHome && (
          <button
            type="button"
            onClick={onBackToHome}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
          >
            ← Back to Home
          </button>
        )}
      </div>

      <p className="text-xs text-slate-500 font-normal">
        Select your location, business type, and available margin capital to compute financial feasibility and local market suitability.
      </p>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3.5 rounded-xl">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">State</label>
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value)
              const availDistricts = locations.districts.filter(d => d.state === e.target.value)
              if (availDistricts.length > 0) setSelectedDistrict(availDistricts[0].district)
            }}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
          >
            {locations.states.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">District</label>
          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value)
              const availVillages = locations.villages.filter(v => v.district === e.target.value)
              if (availVillages.length > 0) setSelectedVillage(availVillages[0].village)
            }}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
          >
            {filteredDistricts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Village / Place</label>
          <select
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
          >
            {filteredVillages.map(v => (
              <option key={v.id || v.village} value={v.village}>{v.village}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Business Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
          >
            {BUSINESS_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
            <span>Government Scheme (SC category)</span>
            <Tooltip text="Eligibility and income limits vary by scheme and state — verify on the Gov. Schemes section" />
          </label>
          <select
            value={selectedScheme}
            onChange={(e) => setSelectedScheme(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
          >
            {SC_SCHEMES.map(sch => (
              <option key={sch.id} value={sch.name}>
                {sch.name} ({sch.criteria})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Available Margin Capital (₹)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
            <input
              type="number"
              min="10000"
              value={capital}
              onChange={(e) => {
                setCapital(e.target.value)
                setError('')
              }}
              placeholder="Min ₹10,000"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#1e293b] hover:bg-[#0f172a] text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <span>Evaluating Feasibility...</span>
          ) : (
            <>
              <span>✨</span>
              <span>Generate Feasibility Report</span>
            </>
          )}
        </button>
      </form>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">Decision Support Only</p>
        <p>This tool provides decision support only. It is not a loan guarantee. Eligibility is subject to scheme verification.</p>
      </div>
    </div>
  )
}
