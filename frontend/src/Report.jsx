import React, { useState, useEffect } from 'react'

function Tooltip({ text }) {
  return (
    <span className="relative group inline-flex items-center ml-1 cursor-pointer">
      <span className="text-slate-400 hover:text-slate-600 text-xs font-normal">ℹ️</span>
      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-64 p-2.5 bg-slate-800 text-white text-[11px] font-normal rounded-lg shadow-lg z-50 leading-tight transition-opacity pointer-events-none">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></span>
      </span>
    </span>
  )
}

function DistanceBadge({ distance }) {
  const dist = parseFloat(distance || 0)
  let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300'
  let label = 'Near'
  if (dist > 25) {
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-300'
    label = 'Far'
  } else if (dist >= 10) {
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300'
    label = 'Moderate'
  }

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
      {label} ({dist} km)
    </span>
  )
}

export default function Report({ data, onBack }) {
  if (!data) return null

  const { input, financial_summary, repayment_schedule, village_context, fit_result } = data
  const { scheme } = financial_summary

  const [language, setLanguage] = useState('en')
  const [narrativeData, setNarrativeData] = useState(null)
  const [loadingNarrative, setLoadingNarrative] = useState(false)

  useEffect(() => {
    fetchNarrative(language)
  }, [language, data])

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

  const fitBadgeColor = {
    match: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    partial: 'bg-amber-100 text-amber-800 border-amber-300',
    mismatch: 'bg-rose-100 text-rose-800 border-rose-300'
  }[fit_result?.fit] || 'bg-slate-100 text-slate-800'

  const fitBadgeText = {
    match: 'GOOD FIT',
    partial: 'RISKY',
    mismatch: 'NOT RECOMMENDED'
  }[fit_result?.fit] || (fit_result?.fit || '').toUpperCase()

  const moratoriumQuarters = Math.floor(scheme.moratorium_months / 3)
  const activeRepaymentQuarters = repayment_schedule.length - moratoriumQuarters
  const moratoriumPayment = repayment_schedule[0]?.interest || 0
  const activePayment = repayment_schedule[moratoriumQuarters]?.total_payment || 0

  const pop = floatVal(village_context.total_population)
  const townDist = floatVal(village_context.nearest_town_distance)
  const irri = floatVal(village_context.irrigated_area)

  function floatVal(v) {
    const p = parseFloat(v)
    return isNaN(p) ? 0 : p
  }

  return (
    <div className="space-y-6">
      {/* Top Bar / Location Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-lg">📍</span>
            <div>
              <p className="text-xs text-slate-400">Location</p>
              <p className="text-sm font-bold text-slate-800">{input.village}, {input.district}, {input.state}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-lg">🌱</span>
            <div>
              <p className="text-xs text-slate-400">Business</p>
              <p className="text-sm font-bold text-slate-800 capitalize">{input.business_category}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-lg">₹</span>
            <div>
              <p className="text-xs text-slate-400">Margin Capital</p>
              <p className="text-sm font-bold text-slate-800">₹{financial_summary.capital.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        <button
          onClick={onBack}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 border border-emerald-300 rounded-lg px-3 py-1.5 hover:bg-emerald-50 transition-all"
        >
          ← Change Inputs
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Fit Verdict Banner */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center space-x-1">
                <span>Local Business Fit Verdict</span>
                <Tooltip text="how well your chosen business matches this village's land and infrastructure, based on real census data. match/partial/mismatch reflects data comparison, not a guarantee of success — always verify locally before investing." />
              </h3>
              <span className={`text-xs font-extrabold uppercase px-3 py-1 rounded-full border ${fitBadgeColor}`}>
                {fitBadgeText}
              </span>
            </div>

            {/* Plain language conclusion sentence */}
            <p className="text-sm font-semibold text-slate-900 leading-relaxed">
              {fit_result?.headline || fit_result?.reason}
            </p>

            {/* Secondary supporting numbers */}
            {fit_result?.supporting_data && (
              <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                {fit_result.supporting_data}
              </p>
            )}
          </div>

          {/* 2. Financial Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
              2. Financial Summary
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-400 flex items-center">
                  <span>Project Cost</span>
                  <Tooltip text="the total cost of your business, calculated as your capital divided by 10%. this assumes your savings are the 10% margin money the scheme requires." />
                </p>
                <p className="text-base font-extrabold text-slate-900 mt-1">₹{financial_summary.project_cost.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">(Capital / 10%)</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-400 flex items-center">
                  <span>Loan Amount</span>
                  <Tooltip text="the maximum you can borrow: 90% of project cost, capped at the scheme's limit. this is a ceiling, not a recommendation — borrow less if your business doesn't need the full amount." />
                </p>
                <p className="text-base font-extrabold text-emerald-700 mt-1">₹{financial_summary.loan_amount.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">(90% of Project Cost)</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-400 flex items-center">
                  <span>Scheme Name</span>
                  <Tooltip text="which government loan program you qualify for, based on your project cost. micro finance covers smaller projects at a lower rate; term loan covers larger ones with a longer repayment period." />
                </p>
                <p className="text-base font-extrabold text-amber-700 capitalize mt-1">{scheme.scheme_name.replace('_', ' ')}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">(Max ₹{scheme.max_loan.toLocaleString('en-IN')})</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-400">Interest Rate</p>
                <p className="text-sm font-bold text-slate-800 mt-1">{(scheme.interest_rate * 100).toFixed(1)}%</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Per Annum</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-400">Tenure</p>
                <p className="text-sm font-bold text-slate-800 mt-1">{scheme.tenure_years} Years</p>
                <p className="text-[10px] text-slate-400 mt-0.5">({scheme.tenure_years * 4} Quarters)</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-400 flex items-center">
                  <span>Moratorium</span>
                  <Tooltip text="a grace period at the start of the loan where you only pay interest, not principal. gives your business time to start earning before full repayment kicks in." />
                </p>
                <p className="text-sm font-bold text-slate-800 mt-1">{scheme.moratorium_months} Months</p>
                <p className="text-[10px] text-slate-400 mt-0.5">({Math.floor(scheme.moratorium_months / 3)} Quarters)</p>
              </div>
            </div>
          </div>

          {/* 3. Quarterly Repayment Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-bold text-slate-800 flex items-center">
                <span>3. Quarterly Repayment Schedule</span>
                <Tooltip text="how much you pay every three months once full repayment starts, split between principal (reducing what you owe) and interest." />
              </h3>
              <span className="text-xs text-slate-400">Moratorium: {scheme.moratorium_months} Months</span>
            </div>

            {/* Plain-language repayment summary sentence */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 leading-relaxed font-medium">
              💡 For the first {scheme.moratorium_months} months (moratorium), you pay interest only (₹{moratoriumPayment.toLocaleString('en-IN')}/quarter). Starting Quarter {moratoriumQuarters + 1}, full repayment of ₹{activePayment.toLocaleString('en-IN')}/quarter begins across the remaining {activeRepaymentQuarters} quarters.
            </div>

            <div className="overflow-x-auto max-h-60 border border-slate-200 rounded-lg">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                  <tr>
                    <th className="p-2 border-b">Quarter</th>
                    <th className="p-2 border-b">Principal (₹)</th>
                    <th className="p-2 border-b">Interest (₹)</th>
                    <th className="p-2 border-b">Total Payment (₹)</th>
                    <th className="p-2 border-b">Remaining Balance (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {repayment_schedule.map((q) => (
                    <tr key={q.quarter} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-2 font-medium">Q{q.quarter} {q.quarter <= moratoriumQuarters ? '(Moratorium)' : ''}</td>
                      <td className="p-2">₹{q.principal.toLocaleString('en-IN')}</td>
                      <td className="p-2">₹{q.interest.toLocaleString('en-IN')}</td>
                      <td className="p-2 font-semibold">₹{q.total_payment.toLocaleString('en-IN')}</td>
                      <td className="p-2 text-slate-500">₹{q.remaining_balance.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              * Interest during moratorium is payable quarterly. Principal repayment begins after moratorium.
            </p>
          </div>

          {/* 5. AI-Powered Business Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                <span>🤖 5. AI-Powered Business Insights</span>
              </h3>
              
              {/* Language Toggle */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setLanguage('en')}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all ${
                    language === 'en' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all ${
                    language === 'hi' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  हिंदी
                </button>
              </div>
            </div>

            {loadingNarrative ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <div className="inline-block animate-spin text-lg">⏳</div>
                <p>Generating AI SWOT and Grounded Narrative...</p>
              </div>
            ) : narrativeData ? (
              <div className="space-y-4">
                {/* SWOT 4 Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3 space-y-1.5">
                    <p className="text-xs font-bold text-emerald-800 flex items-center space-x-1">
                      <span>💪 Strengths</span>
                    </p>
                    <ul className="text-xs text-emerald-900 space-y-1 list-disc pl-4">
                      {narrativeData.strengths?.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 space-y-1.5">
                    <p className="text-xs font-bold text-amber-800 flex items-center space-x-1">
                      <span>⚠️ Weaknesses</span>
                    </p>
                    <ul className="text-xs text-amber-900 space-y-1 list-disc pl-4">
                      {narrativeData.weaknesses?.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-3 space-y-1.5">
                    <p className="text-xs font-bold text-blue-800 flex items-center space-x-1">
                      <span>🚀 Opportunities</span>
                    </p>
                    <ul className="text-xs text-blue-900 space-y-1 list-disc pl-4">
                      {narrativeData.opportunities?.map((o, idx) => (
                        <li key={idx}>{o}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-rose-50/60 border border-rose-200 rounded-lg p-3 space-y-1.5">
                    <p className="text-xs font-bold text-rose-800 flex items-center space-x-1">
                      <span>🛡️ Threats</span>
                    </p>
                    <ul className="text-xs text-rose-900 space-y-1 list-disc pl-4">
                      {narrativeData.threats?.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Narrative Summary Paragraph */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-1">
                  <p className="text-xs font-bold text-slate-700">Practical Summary for Entrepreneurs</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{narrativeData.narrative}</p>
                </div>
              </div>
            ) : null}
          </div>

        </div>

        {/* Right Sidebar Column (1/3 width) - Village Context */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>🏛️ 4. District / Village Context</span>
            </h3>

            {/* Visual Distance Strip */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2">
              <p className="text-xs font-bold text-slate-700">📍 Proximity & Transit Distances</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Sub-District HQ</span>
                  <DistanceBadge distance={village_context.sub_district_hq_distance} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">District HQ</span>
                  <DistanceBadge distance={village_context.district_hq_distance} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Nearest Town</span>
                  <DistanceBadge distance={village_context.nearest_town_distance} />
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="py-1 border-b border-slate-50 space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Population</span>
                  <span className="font-semibold">{pop ? pop.toLocaleString('en-IN') : 'N/A'}</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {pop >= 2000 ? 'Sizable village population — good base of local customers.' : 'Small village population — limited local customer base.'}
                </p>
              </div>

              <div className="py-1 border-b border-slate-50 space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Distance to Nearest Town</span>
                  <span className="font-semibold">{village_context.nearest_town_distance} km</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {townDist > 25
                    ? 'This is far — expect delays and added transport cost for supplies and sales.'
                    : townDist >= 10
                    ? 'Moderate distance — manageable weekly travel for stock.'
                    : 'Close to town — convenient daily supplies and quick market access.'}
                </p>
              </div>

              <div className="py-1 border-b border-slate-50 space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">All Weather Road</span>
                  <span className="font-semibold">{village_context.all_weather_road === '1' ? 'Yes' : 'No'}</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {village_context.all_weather_road === '1'
                    ? 'Paved road allows delivery vehicles year-round.'
                    : 'Unpaved road can be muddy and blocked during monsoon.'}
                </p>
              </div>

              <div className="py-1 border-b border-slate-50 space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Regular Market / Haat</span>
                  <span className="font-semibold">{village_context.mandis_market_status === '1' || village_context.weekly_haat_status === '1' ? 'Yes' : 'No'}</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {village_context.mandis_market_status === '1' || village_context.weekly_haat_status === '1'
                    ? 'Active local trading hub for daily shoppers.'
                    : 'No local market hub — requires travel to sell or trade.'}
                </p>
              </div>

              <div className="py-1 border-b border-slate-50 space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">PDS Outlet</span>
                  <span className="font-semibold">{village_context.pds_status === '1' ? 'Yes' : 'No'}</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {village_context.pds_status === '1'
                    ? 'Brings regular monthly ration card footfall.'
                    : 'No PDS footfall anchor.'}
                </p>
              </div>

              <div className="py-1 border-b border-slate-50 space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Commercial Bank / SHG</span>
                  <span className="font-semibold">{village_context.commercial_bank_status === '1' || village_context.shg_status === '1' ? 'Yes' : 'No'}</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {village_context.commercial_bank_status === '1' || village_context.shg_status === '1'
                    ? 'Convenient local banking or active SHG credit.'
                    : 'No local bank — requires travel to town for cash handling.'}
                </p>
              </div>

              <div className="py-1 border-b border-slate-50 space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center">
                    <span>Net Area Sown</span>
                    <Tooltip text="total hectares actually under cultivation in this village. a rough indicator of how agriculture-dependent the local economy is." />
                  </span>
                  <span className="font-semibold">{village_context.net_area_sown} ha</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {floatVal(village_context.net_area_sown) > 300 ? 'Heavy agriculture focus in the local economy.' : 'Moderate agricultural activity.'}
                </p>
              </div>

              <div className="py-1 border-b border-slate-50 space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center">
                    <span>Irrigated Area</span>
                    <Tooltip text="hectares of farmland in this village with a water source for year-round cultivation. higher irrigated area generally means more reliable agricultural output." />
                  </span>
                  <span className="font-semibold text-emerald-700">{village_context.irrigated_area} ha</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {irri >= 550.7
                    ? 'Abundant water supply for year-round farming.'
                    : irri >= 174.1
                    ? 'Moderate water — dry season supply management needed.'
                    : 'Low water availability — dry season crop risk.'}
                </p>
              </div>

              <div className="py-1 space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Primary Commodity</span>
                  <span className="font-semibold text-slate-800">{village_context.agricultural_commodities_1st || 'N/A'}</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {village_context.agricultural_commodities_1st ? 'Key local product produced in the village.' : 'No specialized primary commodity registered.'}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-center text-xs text-amber-800 font-medium">
        Decision support only. Not a loan guarantee. Eligibility subject to scheme verification.
      </div>
    </div>
  )
}
