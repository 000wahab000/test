import React, { useState, useEffect } from 'react'

export default function Form({ onSubmit, isLoading }) {
  const [locations, setLocations] = useState({ states: [], districts: [], villages: [] })
  const [selectedState, setSelectedState] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedVillage, setSelectedVillage] = useState('')
  const [category, setCategory] = useState('agro-processing')
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
      capital: val
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">1</span>
        <h2 className="text-lg font-bold text-slate-800">Your Inputs</h2>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value)
              const availDistricts = locations.districts.filter(d => d.state === e.target.value)
              if (availDistricts.length > 0) setSelectedDistrict(availDistricts[0].district)
            }}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {locations.states.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">District</label>
          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value)
              const availVillages = locations.villages.filter(v => v.district === e.target.value)
              if (availVillages.length > 0) setSelectedVillage(availVillages[0].village)
            }}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {filteredDistricts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Village</label>
          <select
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {filteredVillages.map(v => (
              <option key={v.id || v.village} value={v.village}>{v.village}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">Business Category</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'dairy', label: 'Dairy', icon: '🐄' },
              { id: 'retail', label: 'Retail', icon: '🛒' },
              { id: 'agro-processing', label: 'Agro-processing', icon: '🌱' }
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`p-3 rounded-lg border text-center text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                  category === cat.id
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Available Margin Capital (₹)</label>
          <input
            type="number"
            min="10000"
            value={capital}
            onChange={(e) => {
              setCapital(e.target.value)
              setError('')
            }}
            placeholder="Min ₹10,000"
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 px-4 rounded-lg shadow transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
        >
          {isLoading ? (
            <span>Generating Report...</span>
          ) : (
            <>
              <span>✨</span>
              <span>Generate Report</span>
            </>
          )}
        </button>
      </form>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-600">Decision Support Only</p>
        <p>This tool provides decision support only. It is not a loan guarantee. Eligibility is subject to scheme verification.</p>
      </div>
    </div>
  )
}
