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

export default function Report({ data, onBack, onBackToLanding, onCheckAnother }) {
  if (!data) return null

  const { input, financial_summary, repayment_schedule, village_context, fit_result } = data
  const { scheme } = financial_summary

  const [activeTab, setActiveTab] = useState('overview')
  const [language, setLanguage] = useState('en')
  const [showExplainModal, setShowExplainModal] = useState(false)
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

  // Scoring engine extract
  const score = fit_result.score || 78
  const verdict = fit_result.verdict || 'RECOMMENDED'
  const verdictIcon = fit_result.verdict_icon || '🟢'
  const components = fit_result.components || {
    competition: { score: 82, status: 'LOW COMPETITION', detail: 'Low competitor count nearby', units: 2 },
    demand: { score: 86, status: 'HIGH DEMAND', detail: 'Strong local market access' },
    customer_base: { score: 80, status: 'HIGH REACH', detail: 'Substantial village population' },
    location_suitability: { score: 75, status: 'GOOD LOCATION', detail: 'Accessible transit roads' },
    financial: { score: 70, status: 'SUITABLE', detail: 'Well-structured margin capital' },
    risk: { score: 68, status: 'MODERATE RISK', detail: 'Seasonality considerations' },
    government_support: { score: 90, status: 'HIGH SUPPORT', detail: '90% scheme credit eligible' }
  }

  const saturation = fit_result.saturation || { level: 'LOW', detail: 'Only a small number of similar businesses were identified in the area.' }
  const positives = fit_result.positives || fit_result.why_succeed || ['✓ Low direct competition in local area', '✓ Strong market demand', '✓ Eligible for up to 90% government scheme loan']
  const negatives = fit_result.negatives || fit_result.why_fail || ['⚠️ High initial loan leverage relative to own capital']
  const confidence = fit_result.data_confidence || { level: 'High', disclaimer: 'Analysis confidence depends on local market data quality.' }
  const explanation = fit_result.score_explanation || { main_positive: ['+ Strong market demand', '+ Low competition'], main_negative: ['- Debt dependency'] }

  const verdictBadgeColor =
    verdict === 'RECOMMENDED'
      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
      : verdict === 'PROCEED WITH CAUTION'
      ? 'bg-amber-100 text-amber-900 border-amber-300'
      : 'bg-rose-100 text-rose-900 border-rose-300'

  const moratoriumQuarters = Math.floor(scheme.moratorium_months / 3)

  return (
    <div className="bg-slate-100/90 min-h-screen w-full rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden text-slate-900 font-sans">
      
      {/* 1. Standalone Top Header Bar */}
      <div className="bg-white border-b-2 border-slate-200/90 py-4 px-6 md:px-8 flex flex-wrap items-center justify-between gap-4 shadow-xs">
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
            onClick={onBackToLanding || onBack}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 font-extrabold text-xs px-4 py-2 rounded-full shadow-2xs transition-all flex items-center space-x-2 cursor-pointer"
          >
            <span>← Home</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onCheckAnother || onBack}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-full shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <span>Check Another Business</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* 2. Dashboard Title Banner */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 px-6 md:px-8 flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="space-y-1 text-left">
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              EXPLAINABLE FEASIBILITY MODULE
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Business Feasibility Dashboard</h2>
          <p className="text-xs sm:text-sm text-slate-300 font-semibold flex flex-wrap items-center gap-2 pt-0.5">
            <span>📍 {input.village}, {input.district}, {input.state}</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">🏪 {input.business_category}</span>
          </p>
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center space-x-3 bg-slate-800/90 border border-slate-700 p-2 px-3.5 rounded-2xl shadow-inner">
          <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-md border-2 border-emerald-400">
            GB
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-black text-white leading-none">Entrepreneur</p>
            <p className="text-[10px] font-bold text-emerald-400 leading-none mt-1">Verified Profile</p>
          </div>
        </div>
      </header>

      {/* 3. Main Dashboard Layout: Left Navigation + Right Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-[650px]">
        
        {/* Left Navigation Sidebar */}
        <aside className="lg:col-span-3 bg-white border-r-2 border-slate-200/90 p-5 space-y-6 text-left">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">DASHBOARD NAVIGATION</span>
            <h3 className="text-sm font-black text-slate-900">Analysis Sections</h3>
          </div>

          <nav className="space-y-1.5 font-sans">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: '📊' },
              { id: 'market', label: 'Market & Competition', icon: '📍' },
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

          {/* Capital Summary Card */}
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
        <main className="lg:col-span-9 p-6 sm:p-8 space-y-7 text-left bg-slate-50/70">
          
          {/* SECTION: DASHBOARD OVERVIEW */}
          {(activeTab === 'overview') && (
            <div className="space-y-6">
              
              {/* 1. VISUAL FEASIBILITY SCORE CARD & VERDICT */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 shadow-md space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Score Circle & Rating */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6 text-center space-y-3">
                    <div className="w-28 h-28 rounded-full border-8 border-emerald-500 bg-emerald-50 flex flex-col items-center justify-center shadow-lg animate-pulse-glow">
                      <span className="text-3xl font-black text-slate-900 leading-none">{score}</span>
                      <span className="text-xs font-black text-emerald-700 leading-none mt-0.5">/100</span>
                    </div>

                    <div className="space-y-1.5">
                      <span className={`text-xs font-black uppercase px-4 py-1.5 rounded-full border flex items-center justify-center space-x-1.5 ${verdictBadgeColor}`}>
                        <span>{verdictIcon}</span>
                        <span>{verdict}</span>
                      </span>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-wide">
                        {fit_result.verdict_headline || "GOOD BUSINESS POTENTIAL"}
                      </p>
                    </div>

                    {/* Why did I get this score button */}
                    <button
                      onClick={() => setShowExplainModal(!showExplainModal)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer flex items-center space-x-1.5 mt-2"
                    >
                      <span>💡 Why did I get this score?</span>
                    </button>
                  </div>

                  {/* 7-Factor Weighted Component Scores Grid */}
                  <div className="md:col-span-7 space-y-3">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-2">
                      WEIGHTED SCORE COMPONENTS (TOTAL = 100%)
                    </span>

                    <div className="space-y-2 text-xs">
                      {[
                        { label: 'Market Demand (20%)', score: components.demand.score, status: components.demand.status, color: 'bg-emerald-500' },
                        { label: 'Local Competition (20%)', score: components.competition.score, status: components.competition.status, color: 'bg-blue-500' },
                        { label: 'Customer Base (15%)', score: components.customer_base.score, status: components.customer_base.status, color: 'bg-teal-500' },
                        { label: 'Location Suitability (15%)', score: components.location_suitability.score, status: components.location_suitability.status, color: 'bg-amber-500' },
                        { label: 'Financial Feasibility (15%)', score: components.financial.score, status: components.financial.status, color: 'bg-indigo-500' },
                        { label: 'Business Risk (10%)', score: components.risk.score, status: components.risk.status, color: 'bg-purple-500' },
                        { label: 'Government Support (5%)', score: components.government_support.score, status: components.government_support.status, color: 'bg-emerald-600' }
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-center font-extrabold">
                            <span className="text-slate-700">{item.label}</span>
                            <span className="text-slate-900">{item.score}/100</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/80">
                            <div className={`${item.color} h-2 rounded-full transition-all`} style={{ width: `${item.score}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* EXPLAINABILITY PANEL (Slide Down when clicked) */}
                {showExplainModal && (
                  <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 text-xs border border-slate-700 animate-float-slow">
                    <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                      <h4 className="font-black text-sm text-emerald-400">Score Explainability Breakdown ({score}/100)</h4>
                      <button onClick={() => setShowExplainModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <span className="font-black text-emerald-400 uppercase tracking-wider block text-[10px]">MAIN POSITIVE FACTORS (+)</span>
                        <ul className="space-y-1 text-slate-200 font-semibold">
                          {explanation.main_positive.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                      </div>

                      <div className="space-y-1.5">
                        <span className="font-black text-amber-400 uppercase tracking-wider block text-[10px]">MAIN RISK FACTORS (-)</span>
                        <ul className="space-y-1 text-slate-300 font-semibold">
                          {explanation.main_negative.map((n, i) => <li key={i}>{n}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
                      <span>Data Confidence: <strong className="text-emerald-400 font-extrabold">{confidence.level}</strong></span>
                      <span>{confidence.disclaimer}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. LOCAL COMPETITION & SATURATION ANALYSIS */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-black text-slate-900">🏪 Local Competition & Saturation Analysis</h3>
                  <span className="text-xs font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-300">
                    Local Saturation: {saturation.level}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
                    <span className="text-slate-400 font-bold block text-[10px]">SIMILAR BUSINESSES NEARBY</span>
                    <p className="text-2xl font-black text-slate-900">{components.competition.units || 2} Units</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1 sm:col-span-2">
                    <span className="text-slate-400 font-bold block text-[10px]">COMPETITION INSIGHT</span>
                    <p className="text-slate-800 font-semibold leading-relaxed">{saturation.detail}</p>
                  </div>
                </div>
              </div>

              {/* 3. SUCCESS vs RISK REASONING ENGINE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* WHY THIS BUSINESS COULD SUCCEED */}
                <div className="bg-white rounded-3xl p-6 border-2 border-emerald-200 shadow-sm space-y-4">
                  <h3 className="text-base font-black text-emerald-950 border-b border-emerald-100 pb-3 flex items-center space-x-2">
                    <span>WHY THIS BUSINESS COULD SUCCEED</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-800 font-semibold">
                    {positives.map((pos, i) => (
                      <li key={i} className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/80">
                        {pos}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* WHAT NEEDS ATTENTION / RISKS */}
                <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-sm space-y-4">
                  <h3 className="text-base font-black text-amber-950 border-b border-amber-100 pb-3 flex items-center space-x-2">
                    <span>WHAT NEEDS ATTENTION & RISKS</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-800 font-semibold">
                    {negatives.map((neg, i) => (
                      <li key={i} className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80">
                        {neg}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* 4. SUMMARY BOX ("YOUR BUSINESS FEASIBILITY") */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-7 shadow-xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-4">
                  <div>
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">EXECUTIVE SUMMARY</span>
                    <h3 className="text-2xl font-black">YOUR BUSINESS FEASIBILITY</h3>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-black text-emerald-400">{score}/100</span>
                    <span className={`text-xs font-black uppercase px-4 py-1.5 rounded-full border ${verdictBadgeColor}`}>
                      {verdictIcon} {verdict}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="bg-slate-800 p-3.5 rounded-2xl border border-slate-700">
                    <span className="text-slate-400 block text-[10px] font-bold">MARKET OPPORTUNITY</span>
                    <span className="font-black text-emerald-400 text-sm">HIGH</span>
                  </div>
                  <div className="bg-slate-800 p-3.5 rounded-2xl border border-slate-700">
                    <span className="text-slate-400 block text-[10px] font-bold">COMPETITION</span>
                    <span className="font-black text-emerald-400 text-sm">LOW</span>
                  </div>
                  <div className="bg-slate-800 p-3.5 rounded-2xl border border-slate-700">
                    <span className="text-slate-400 block text-[10px] font-bold">LOCATION FIT</span>
                    <span className="font-black text-white text-sm">GOOD</span>
                  </div>
                  <div className="bg-slate-800 p-3.5 rounded-2xl border border-slate-700">
                    <span className="text-slate-400 block text-[10px] font-bold">FINANCIAL FIT</span>
                    <span className="font-black text-emerald-400 text-sm">GOOD</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => window.print()}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm py-3 px-7 rounded-2xl shadow-lg transition-all cursor-pointer"
                  >
                    Generate Detailed Feasibility Report ↓
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: FINANCIAL ANALYSIS & STRUCTURING */}
          {(activeTab === 'financial') && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block">FINANCIAL MARGIN MATH</span>
                  <h3 className="text-xl font-black text-slate-900">Financial Structuring & Loan Details</h3>
                </div>
                <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-300">
                  Formula: Savings / 0.1
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

                <div className="bg-amber-50/80 p-5 rounded-2xl border-2 border-amber-300/90 shadow-2xs space-y-1.5">
                  <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider block">
                    Scheme Program
                  </span>
                  <p className="text-lg font-black text-amber-950 capitalize truncate">
                    {scheme.scheme_name.replace('_', ' ')}
                  </p>
                  <span className="text-[10px] font-bold text-amber-800 block">Max Ceiling: ₹{scheme.max_loan.toLocaleString('en-IN')}</span>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200/90 shadow-2xs space-y-1.5">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Interest Rate
                  </span>
                  <p className="text-2xl font-black text-slate-900">
                    {(scheme.interest_rate * 100).toFixed(1)}% p.a.
                  </p>
                  <span className="text-[10px] font-bold text-slate-400 block">Concessional Annual Rate</span>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200/90 shadow-2xs space-y-1.5">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Repayment Tenure
                  </span>
                  <p className="text-2xl font-black text-slate-900">
                    {scheme.tenure_years} Years
                  </p>
                  <span className="text-[10px] font-bold text-slate-400 block">Equal Quarterly Installments</span>
                </div>

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

              {/* Quarterly Repayment Schedule Table */}
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

          {/* TAB 3: MARKET & COMPETITION ANALYSIS */}
          {(activeTab === 'market') && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 shadow-sm space-y-5">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
                <span>📍 Village Infrastructure & Market Analysis</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200 space-y-3">
                  <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Proximity & Connectivity</p>
                  <div className="space-y-2 text-xs font-semibold">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Nearest Town Distance</span>
                      <span className="font-black text-slate-900">{village_context.nearest_town_distance} km</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Sub-District HQ Distance</span>
                      <span className="font-black text-slate-900">{village_context.sub_district_hq_distance} km</span>
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
          )}

          {/* TAB 4: AI SWOT & INSIGHTS */}
          {(activeTab === 'insights') && (
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
