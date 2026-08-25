import React, { useState, useEffect } from 'react'

function Tooltip({ text }) {
  return (
    <span className="relative group inline-flex items-center ml-1.5 cursor-pointer">
      <span className="text-slate-400 hover:text-slate-600 text-xs font-semibold">ℹ️</span>
      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-64 p-3 bg-slate-900 text-white text-[11px] font-normal rounded-xl shadow-2xl z-50 leading-tight border border-slate-700 pointer-events-none">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></span>
      </span>
    </span>
  )
}

function DistanceBadge({ distance }) {
  const dist = parseFloat(distance || 0)
  let badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-300'
  let label = 'Near'
  if (dist > 25) {
    badgeColor = 'bg-rose-50 text-rose-800 border-rose-300'
    label = 'Far'
  } else if (dist >= 10) {
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-300'
    label = 'Moderate'
  }

  return (
    <span className={`text-xs font-extrabold px-3 py-1 rounded-full border shadow-2xs ${badgeColor}`}>
      {label} ({dist} km)
    </span>
  )
}

export default function Report({ data, onBack, onBackToLanding, onCheckAnother }) {
  if (!data) return null

  const { input, financial_summary, repayment_schedule, village_context, fit_result } = data
  const { scheme } = financial_summary
  const pop = village_context?.total_population || 0

  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'market' | 'financial' | 'schemes' | 'insights'
  const [language, setLanguage] = useState('en')
  const [narrativeData, setNarrativeData] = useState(null)
  const [loadingNarrative, setLoadingNarrative] = useState(false)

  const [rankingData, setRankingData] = useState([])
  const [loadingRanking, setLoadingRanking] = useState(false)

  useEffect(() => {
    fetchNarrative(language)
  }, [language, data])

  useEffect(() => {
    if (input?.business_category) {
      setLoadingRanking(true)
      fetch(`http://localhost:8000/pincode-ranking?category=${encodeURIComponent(input.business_category)}`)
        .then(res => res.json())
        .then(resData => setRankingData(resData))
        .catch(err => console.error('Failed to load pincode ranking:', err))
        .finally(() => setLoadingRanking(false))
    }
  }, [input?.business_category])

  function getOrdinal(n) {
    if (!n || n <= 0) return ''
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return n + (s[(v - 20) % 10] || s[v] || s[0])
  }

  const fetchNarrative = (lang) => {
    setLoadingNarrative(true)
    fetch('http://localhost:8000/narrative', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        financial_summary,
        village_context,
        fit_result,
        language: lang
      })
    })
      .then(res => res.json())
      .then(resData => setNarrativeData(resData))
      .catch(err => console.error('Failed to load AI narrative:', err))
      .finally(() => setLoadingNarrative(false))
  }

  const fitBadgeConfig = {
    match: { color: 'bg-emerald-100 text-emerald-900 border-emerald-300 shadow-xs', text: 'GOOD FIT', icon: '✅' },
    partial: { color: 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs', text: 'RISKY FIT', icon: '⚠️' },
    mismatch: { color: 'bg-rose-100 text-rose-900 border-rose-300 shadow-xs', text: 'NOT RECOMMENDED', icon: '❌' }
  }[fit_result?.fit] || { color: 'bg-slate-100 text-slate-900 border-slate-300', text: (fit_result?.fit || '').toUpperCase(), icon: '🔍' }

  const moratoriumQuarters = Math.floor(scheme.moratorium_months / 3)

  return (
    <div className="bg-slate-100/80 min-h-screen rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden text-slate-900 font-sans">
      
      {/* 1. Header Bar: Logo & Navigation */}
      <div className="bg-white border-b-2 border-slate-200/90 py-4 px-6 md:px-8 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        {/* Left: GramBiz Brand Logo & Back Button */}
        <div className="flex items-center space-x-4">
          <div
            onClick={onBackToLanding || onBack}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <img src="/logo.png" alt="GramBiz Logo" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
            <span className="text-2xl font-black text-slate-900 tracking-tight">GramBiz</span>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          <button
            onClick={onBack}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 font-extrabold text-xs px-4 py-2 rounded-full shadow-2xs transition-all flex items-center space-x-2 cursor-pointer"
          >
            <span>←</span>
            <span>Back to Input Form</span>
          </button>
        </div>

        {/* Right: Check Another Business CTA Button */}
        <div>
          <button
            onClick={onCheckAnother || onBack}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-full shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <span>Check Another Business</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* 2. Report Title Section Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 px-6 md:px-8 flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="space-y-1 text-left">
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              OFFICIAL FEASIBILITY REPORT
            </span>
            <span className="text-slate-400 text-xs font-semibold">• Census 2011 Data</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Feasibility Dashboard & Analysis</h2>
          <p className="text-xs sm:text-sm text-slate-300 font-semibold flex flex-wrap items-center gap-2 pt-0.5">
            <span>📍 {input.village}, {input.district}, {input.state}</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">🏪 {input.business_category}</span>
          </p>
        </div>

        {/* Profile Avatar & Input Form Control */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="text-xs font-black text-slate-900 bg-white hover:bg-slate-100 border border-white px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center space-x-1.5"
          >
            <span>✏️</span>
            <span>Input Form</span>
          </button>

          <div className="flex items-center space-x-3 bg-slate-800/90 border border-slate-700 p-2 px-3.5 rounded-2xl shadow-inner">
            <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-md border-2 border-emerald-400">
              GB
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-black text-white leading-none">Entrepreneur</p>
              <p className="text-[10px] font-bold text-emerald-400 leading-none mt-1">Verified Profile</p>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Main Dashboard Body: Left Sidebar + Right Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-[650px]">
        
        {/* Left Navigation Sidebar */}
        <aside className="lg:col-span-3 bg-white border-r-2 border-slate-200/90 p-5 space-y-6 text-left">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">DASHBOARD NAVIGATION</span>
            <h3 className="text-sm font-black text-slate-900">Analysis Sections</h3>
          </div>

          <nav className="space-y-1.5">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: '📊' },
              { id: 'market', label: 'Market & Vicinity', icon: '📍' },
              { id: 'financial', label: 'Financial Structuring', icon: '🪙' },
              { id: 'schemes', label: 'Government Schemes', icon: '🏛️' },
              { id: 'insights', label: 'AI SWOT & Insights', icon: '🤖' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left p-3.5 rounded-2xl transition-all font-black text-xs flex items-center justify-between cursor-pointer border ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                    : 'bg-white text-slate-700 border-transparent hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                </div>
                {activeTab === tab.id && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
              </button>
            ))}
          </nav>

          {/* Selected Capital Card at Sidebar Bottom */}
          <div className="bg-gradient-to-b from-slate-50 to-emerald-50/40 border-2 border-emerald-200/80 p-4.5 rounded-2xl space-y-2.5 shadow-xs">
            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">OWN MARGIN CAPITAL</span>
            <p className="text-2xl font-black text-slate-900">₹{financial_summary.capital.toLocaleString('en-IN')}</p>
            <div className="pt-2 border-t border-emerald-200/60 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Total Project Cost:</span>
                <span className="font-black text-slate-900">₹{financial_summary.project_cost.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-700 font-bold">90% Govt Loan:</span>
                <span className="font-black text-emerald-700">₹{financial_summary.loan_amount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Main Analysis Content */}
        <main className="lg:col-span-9 p-6 sm:p-8 space-y-6 text-left bg-slate-50/70">
          
          {/* 4. Local Business Fit Verdict Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-1.5">
                <span>Local Business Fit Verdict</span>
                <Tooltip text="Evaluates how well your chosen business matches village population, land type, and infrastructure based on official 2011 census data." />
              </h3>
              <span className={`text-xs font-black uppercase px-4 py-1.5 rounded-full border flex items-center space-x-1.5 ${fitBadgeConfig.color}`}>
                <span>{fitBadgeConfig.icon}</span>
                <span>{fitBadgeConfig.text}</span>
              </span>
            </div>

            <p className="text-lg font-black text-slate-900 leading-snug">
              {fit_result?.headline || fit_result?.reason}
            </p>

            {fit_result?.supporting_data && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 text-xs font-extrabold text-slate-700 leading-relaxed">
                <span className="text-slate-400 block text-[10px] uppercase font-black tracking-wider mb-0.5">CENSUS DATA EVIDENCE</span>
                {fit_result.supporting_data}
              </div>
            )}
          </div>

          {/* 5. Financial Analysis & Structuring Section (6 Harmonized Stat Cards) */}
          {(activeTab === 'overview' || activeTab === 'financial') && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block">FINANCIAL MARGIN MATH</span>
                  <h3 className="text-xl font-black text-slate-900">Financial Structuring & Loan Details</h3>
                </div>
              </div>

              {narrativeData?.narrative && (
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-1 text-left">
                  <p className="text-xs font-extrabold text-slate-700">Practical Summary for Entrepreneurs</p>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{narrativeData.narrative}</p>
                </div>
              )}



              {/* 6 Grid Metric Cards (Uniform Height, Sizing, Hierarchy) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* 1. Total Project Cost */}
                <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200/90 shadow-2xs space-y-1.5">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block flex items-center">
                    <span>Total Project Cost</span>
                    <Tooltip text="Calculated as Savings / 0.1 (10% Own Contribution)." />
                  </span>
                  <p className="text-2xl font-black text-slate-900">
                    ₹{financial_summary.project_cost.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] font-bold text-slate-400 block">Savings / 0.1</span>
                </div>

                {/* 2. Govt Loan Amount (90%) */}
                <div className="bg-emerald-50/80 p-5 rounded-2xl border-2 border-emerald-300/90 shadow-2xs space-y-1.5">
                  <span className="text-[11px] font-extrabold text-emerald-900 uppercase tracking-wider block flex items-center">
                    <span>90% Govt Loan Amount</span>
                    <Tooltip text="90% of total project cost funded via government credit scheme." />
                  </span>
                  <p className="text-2xl font-black text-emerald-700">
                    ₹{financial_summary.loan_amount.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] font-bold text-emerald-800 block">90% Financed</span>
                </div>

                {/* 3. Scheme Program */}
                <div className="bg-amber-50/80 p-5 rounded-2xl border-2 border-amber-300/90 shadow-2xs space-y-1.5">
                  <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider block">
                    Scheme Program
                  </span>
                  <p className="text-lg font-black text-amber-950 capitalize truncate">
                    {scheme.scheme_name.replace('_', ' ')}
                  </p>
                  <span className="text-[10px] font-bold text-amber-800 block">Max Ceiling: ₹{scheme.max_loan.toLocaleString('en-IN')}</span>
                </div>

                {/* 4. Interest Rate */}
                <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200/90 shadow-2xs space-y-1.5">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Interest Rate
                  </span>
                  <p className="text-2xl font-black text-slate-900">
                    {(scheme.interest_rate * 100).toFixed(1)}% p.a.
                  </p>
                  <span className="text-[10px] font-bold text-slate-400 block">Concessional Annual Rate</span>
                </div>

                {/* 5. Tenure */}
                <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200/90 shadow-2xs space-y-1.5">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Repayment Tenure
                  </span>
                  <p className="text-2xl font-black text-slate-900">
                    {scheme.tenure_years} Years
                  </p>
                  <span className="text-[10px] font-bold text-slate-400 block">Equal Quarterly Installments</span>
                </div>

                {/* 6. Moratorium */}
                <div className="bg-indigo-50/80 p-5 rounded-2xl border-2 border-indigo-300/90 shadow-2xs space-y-1.5">
                  <span className="text-[11px] font-extrabold text-indigo-900 uppercase tracking-wider block">
                    Moratorium Period
                  </span>
                  <p className="text-2xl font-black text-indigo-950">
                    {scheme.moratorium_months} Months
                  </p>
                  <span className="text-[10px] font-bold text-indigo-800 block">Interest-Only Initial Phase</span>
                </div>

              </div>

              {/* 6. Quarterly Repayment Schedule Table */}
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-black text-slate-900">Quarterly Repayment Schedule</h4>
                  <span className="text-xs text-slate-500 font-bold">{repayment_schedule.length} Total Quarters</span>
                </div>

                <div className="overflow-x-auto max-h-72 border-2 border-slate-200 rounded-2xl shadow-inner">
                  <table className="w-full text-xs text-left text-slate-700 font-medium border-collapse">
                    <thead className="bg-slate-900 text-white font-black sticky top-0 z-10 shadow-xs">
                      <tr>
                        <th className="p-3.5 px-4">Quarter</th>
                        <th className="p-3.5 px-4">Principal (₹)</th>
                        <th className="p-3.5 px-4">Interest (₹)</th>
                        <th className="p-3.5 px-4">Total Payment (₹)</th>
                        <th className="p-3.5 px-4">Remaining Balance (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {repayment_schedule.map((q) => (
                        <tr key={q.quarter} className="hover:bg-slate-100/70 transition-colors">
                          <td className="p-3.5 px-4 font-black text-slate-900">
                            Q{q.quarter} {q.quarter <= moratoriumQuarters && <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-extrabold border border-amber-200 ml-1">Moratorium</span>}
                          </td>
                          <td className="p-3.5 px-4 font-semibold">₹{q.principal.toLocaleString('en-IN')}</td>
                          <td className="p-3.5 px-4 font-semibold text-slate-600">₹{q.interest.toLocaleString('en-IN')}</td>
                          <td className="p-3.5 px-4 font-black text-slate-900 bg-slate-50/50">₹{q.total_payment.toLocaleString('en-IN')}</td>
                          <td className="p-3.5 px-4 font-semibold text-slate-500">₹{q.remaining_balance.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MARKET & VICINITY ANALYSIS */}
          {(activeTab === 'overview' || activeTab === 'market') && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 shadow-sm space-y-5">
                <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
                  <span>📍 Village Infrastructure & Market Access</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200 space-y-3">
                    <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Proximity & Connectivity</p>
                    <div className="space-y-2 text-xs font-semibold">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Nearest Town Distance</span>
                        <DistanceBadge distance={village_context.nearest_town_distance} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Sub-District HQ Distance</span>
                        <DistanceBadge distance={village_context.sub_district_hq_distance} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200 space-y-3">
                    <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Market Access</p>
                    <div className="space-y-2 text-xs font-semibold">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Mandi / Weekly Haat</span>
                        <span className="font-black text-slate-900">
                          {village_context.mandis_market_status === '1' || village_context.weekly_haat_status === '1' ? '✅ Available' : '❌ Missing'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">PDS Outlet Access</span>
                        <span className="font-black text-slate-900">
                          {village_context.pds_status === '1' ? '✅ Available' : '❌ Missing'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registered MSME Business Density Ranking Across Pincodes */}
              {(() => {
                const currentPin = village_context?.pincode || ''
                const currentRankIndex = rankingData.findIndex(r => r.pincode === currentPin)
                const currentRank = currentRankIndex >= 0 ? currentRankIndex + 1 : null
                const totalPincodes = rankingData.length
                const maxCount = rankingData[0]?.count || 1

                return (
                  <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 shadow-sm space-y-5">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                        <span>📊 Registered Business Density by Pincode (Udyam/MSME Data)</span>
                      </h3>
                      <p className="text-xs text-slate-600 font-semibold mt-1 leading-relaxed">
                        <span className="capitalize">{input.business_category}</span> enterprise density across Jalgaon district — your village's pincode <span className="font-extrabold text-slate-900">({currentPin || 'N/A'})</span> ranks <span className="font-black text-emerald-700">{currentRank ? getOrdinal(currentRank) : 'N/A'}</span> of {totalPincodes} pincodes.
                      </p>
                    </div>

                    {loadingRanking ? (
                      <div className="p-6 text-center text-xs text-slate-400 font-bold">
                        <span className="inline-block animate-spin">⏳</span> Loading pincode density ranking...
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                        {rankingData.map((item, idx) => {
                          const isCurrent = item.pincode === currentPin
                          const pct = Math.max((item.count / maxCount) * 100, 3)
                          return (
                            <div
                              key={item.pincode}
                              className={`p-3 rounded-2xl border transition-all flex items-center gap-3 text-xs ${
                                isCurrent
                                  ? 'bg-emerald-50/90 border-emerald-500 shadow-xs font-bold text-emerald-950 ring-2 ring-emerald-400/50'
                                  : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span className="w-8 text-[11px] font-black text-slate-400 text-right">#{idx + 1}</span>
                              <div className="w-20 font-mono font-bold flex items-center gap-1">
                                <span>{item.pincode}</span>
                                {isCurrent && (
                                  <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-sans uppercase font-extrabold shadow-2xs">YOU</span>
                                )}
                              </div>
                              <div className="flex-1 bg-slate-200/80 h-3.5 rounded-full overflow-hidden relative">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isCurrent ? 'bg-emerald-600' : 'bg-slate-500'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="w-16 text-right font-black text-slate-900">
                                {item.count.toLocaleString('en-IN')} units
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          )}

          {/* TAB 3: AI SWOT & INSIGHTS */}
          {(activeTab === 'overview' || activeTab === 'insights') && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <span>🤖 AI SWOT & Narrative Recommendations</span>
                </h3>
                <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`text-xs font-black px-3.5 py-1 rounded-lg transition-all ${language === 'en' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage('hi')}
                    className={`text-xs font-black px-3.5 py-1 rounded-lg transition-all ${language === 'hi' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    हिंदी
                  </button>
                </div>
              </div>

              {loadingNarrative ? (
                <div className="p-8 text-center text-xs font-bold text-slate-400 animate-pulse">Loading grounded AI insights...</div>
              ) : narrativeData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-emerald-50/80 p-5 rounded-2xl border-2 border-emerald-200 text-xs space-y-2">
                      <p className="font-black text-emerald-900 text-sm flex items-center space-x-1">
                        <span>💪 Key Strengths</span>
                      </p>
                      <ul className="list-disc pl-4 space-y-1.5 text-emerald-950 font-semibold leading-relaxed">
                        {narrativeData.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div className="bg-amber-50/80 p-5 rounded-2xl border-2 border-amber-200 text-xs space-y-2">
                      <p className="font-black text-amber-900 text-sm flex items-center space-x-1">
                        <span>⚠️ Key Risk Factors & Weaknesses</span>
                      </p>
                      <ul className="list-disc pl-4 space-y-1.5 text-amber-950 font-semibold leading-relaxed">
                        {narrativeData.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200 text-xs space-y-2">
                    <p className="font-black text-slate-900 text-sm">Practical Summary for Entrepreneur</p>
                    <p className="text-slate-800 leading-relaxed font-semibold">{narrativeData.narrative}</p>
                  </div>
                </div>
              ) : null}
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
