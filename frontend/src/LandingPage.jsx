import React from 'react'
import VicinityHeatmap from './VicinityHeatmap'
import SchemeCarousel from './SchemeCarousel'

export default function LandingPage({ onGoToForm, onThemeClick }) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 font-sans min-h-screen relative overflow-hidden">
      {/* Hero Section with Compact Horizontal 60/40 Layout & Indian Flag Background */}
      <section className="relative pt-6 pb-8 sm:py-10 px-6 md:px-10 max-w-7xl mx-auto rounded-3xl bg-indian-flag border-2 border-slate-200/80 shadow-md my-3 overflow-hidden">
        
        {/* Saffron, White, Green Indicator Stripes Top Border */}
        <div className="absolute top-0 left-0 right-0 h-2 flex">
          <div className="w-1/3 bg-[#FF9933]" />
          <div className="w-1/3 bg-white" />
          <div className="w-1/3 bg-[#138808]" />
        </div>

        {/* 24-Spoke Ashoka Chakra Watermark Centered in Hero Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.07] z-0">
          <svg className="w-[360px] h-[360px] animate-spin-slow" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" stroke="#000080" strokeWidth="2" />
            <circle cx="50" cy="50" r="8" fill="#000080" />
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i * 15 * Math.PI) / 180
              const x2 = 50 + 45 * Math.cos(angle)
              const y2 = 50 + 45 * Math.sin(angle)
              return (
                <line
                  key={i}
                  x1="50"
                  y1="50"
                  x2={x2}
                  y2={y2}
                  stroke="#000080"
                  strokeWidth="1.2"
                />
              )
            })}
          </svg>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 pt-2">
          {/* Hero Left Column */}
          <div className="lg:col-span-7 space-y-4 text-left relative z-10">
            
            {/* Indian National Flag Ticker Pill */}
            <div className="inline-flex items-center space-x-2.5 bg-white/95 backdrop-blur-md border border-slate-300 text-slate-900 text-xs font-black px-3.5 py-1.5 rounded-full shadow-xs">
              <span className="text-base leading-none">🇮🇳</span>
              <span className="tracking-wide text-slate-900">BHARAT • RURAL PRE-LOAN ADVISOR</span>
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            </div>

            {/* Hero Heading with High-Contrast Blue "You" */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-snug">
              Know Your Business <br />
              <span className="text-[#FF9933]">Before</span>{' '}
              <span className="text-[#2563EB]">You</span>{' '}
              <span className="text-[#138808]">Borrow.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-800 font-semibold leading-relaxed max-w-xl">
              GramBiz helps entrepreneurs understand their local village market, financial feasibility, business risks, and suitable government financing schemes — before taking a loan.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={onGoToForm}
                className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm py-3 px-7 rounded-full shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center space-x-2 group cursor-pointer"
              >
                <span>Check My Business</span>
                <span className="group-hover:translate-x-1.5 transition-transform text-base">→</span>
              </button>

              <button
                onClick={() => scrollToSection('how-it-works')}
                className="bg-white/95 hover:bg-slate-50 text-slate-900 font-extrabold text-xs py-3 px-6 rounded-full border border-slate-300 shadow-xs hover:border-slate-400 transition-all cursor-pointer"
              >
                See How It Works
              </button>
            </div>

            {/* Trust Metrics Checklist */}
            <div className="flex flex-wrap items-center gap-5 pt-3 text-xs font-extrabold text-slate-800 border-t border-slate-300/80">
              <span className="flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-black">✓</span>
                <span>Data-Driven Support</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-black">✓</span>
                <span>Hyper-Local Insights</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-black">✓</span>
                <span>Government Scheme Guidance</span>
              </span>
            </div>
          </div>

          {/* Hero Right Column (Compact Card) */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white/95 rounded-3xl p-6 shadow-xl shadow-slate-300/70 border border-slate-200 relative backdrop-blur-md transition-all">
              
              {/* Badges Inside Card Header */}
              <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-slate-100">
                <span className="text-[11px] font-black text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-full">
                  Targeted SC Schemes
                </span>
                <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  90% Govt Loan
                </span>
              </div>

              {/* Main Card Content */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase block">FEASIBILITY SNAPSHOT</span>
                  <h3 className="text-xl font-black text-slate-900">Tailoring & Textile Unit</h3>
                  <p className="text-xs font-bold text-slate-500 flex items-center space-x-1 mt-0.5">
                    <span className="text-emerald-600">📍</span>
                    <span>Jaipur, Rajasthan</span>
                  </p>
                </div>
                {/* Feasibility Circular Score */}
                <div className="w-14 h-14 rounded-full border-4 border-emerald-500 bg-emerald-50 flex flex-col items-center justify-center text-center shadow-md">
                  <span className="text-sm font-black text-emerald-900 leading-none">78</span>
                  <span className="text-[8px] font-bold text-emerald-600 leading-none">/100</span>
                </div>
              </div>

              {/* Status Pill */}
              <div className="inline-flex items-center space-x-1 text-emerald-900 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full text-xs font-extrabold mb-4">
                <span className="text-xs">🛡️</span>
                <span>GOOD POTENTIAL</span>
              </div>

              {/* Live Metric Grid */}
              <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-xs">
                  <span className="text-[9px] text-slate-400 block font-bold">Market Demand</span>
                  <span className="font-black text-emerald-600 text-sm">HIGH</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-xs">
                  <span className="text-[9px] text-slate-400 block font-bold">Competition</span>
                  <span className="font-black text-amber-600 text-sm">MEDIUM</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-xs">
                  <span className="text-[9px] text-slate-400 block font-bold">Location Fit</span>
                  <span className="font-black text-slate-900 text-sm">GOOD</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-xs">
                  <span className="text-[9px] text-slate-400 block font-bold">Financial Fit</span>
                  <span className="font-black text-emerald-600 text-sm">GOOD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vicinity Heatmap Simulation Section */}
      <section id="heatmap" className="py-16 px-4 max-w-7xl mx-auto">
        <VicinityHeatmap />
      </section>

      {/* 4 Pillars Ribbon */}
      <section className="bg-white border-y-2 border-slate-200 py-10 px-4 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex items-center space-x-4 hover:border-emerald-400 transition-all">
            <span className="p-3 bg-blue-100 text-blue-800 rounded-2xl text-2xl font-bold">📍</span>
            <div>
              <h4 className="text-base font-black text-slate-900">Hyper-Local</h4>
              <p className="text-xs text-slate-600 font-semibold">Market Intelligence</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex items-center space-x-4 hover:border-emerald-400 transition-all">
            <span className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl text-2xl font-bold">🤖</span>
            <div>
              <h4 className="text-base font-black text-slate-900">AI-Powered</h4>
              <p className="text-xs text-slate-600 font-semibold">Business Analysis</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex items-center space-x-4 hover:border-emerald-400 transition-all">
            <span className="p-3 bg-amber-100 text-amber-800 rounded-2xl text-2xl font-bold">📊</span>
            <div>
              <h4 className="text-base font-black text-slate-900">Data-Driven</h4>
              <p className="text-xs text-slate-600 font-semibold">Decision Support</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex items-center space-x-4 hover:border-emerald-400 transition-all">
            <span className="p-3 bg-purple-100 text-purple-800 rounded-2xl text-2xl font-bold">🏛️</span>
            <div>
              <h4 className="text-base font-black text-slate-900">Government</h4>
              <p className="text-xs text-slate-600 font-semibold">Scheme Guidance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Value Proposition */}
      <section className="py-24 px-4 max-w-7xl mx-auto text-center space-y-16 relative z-10">
        <div className="max-w-4xl mx-auto space-y-5">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Taking a Business Loan <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
              Shouldn't Be a Guess.
            </span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-700 font-semibold">
            Entrepreneurs often know how much they can borrow — but not whether they should.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-sm hover:shadow-2xl hover:border-emerald-400 transition-all text-left space-y-4 group">
            <div className="w-16 h-16 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center text-3xl font-bold group-hover:scale-110 transition-transform">
              🔍
            </div>
            <h3 className="text-2xl font-black text-slate-900">Is there enough demand?</h3>
            <p className="text-base text-slate-700 leading-relaxed font-semibold">
              Local market conditions determine whether a business succeeds or struggles. Without village census data, borrowing is a financial gamble.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-sm hover:shadow-2xl hover:border-emerald-400 transition-all text-left space-y-4 group">
            <div className="w-16 h-16 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center text-3xl font-bold group-hover:scale-110 transition-transform">
              🏪
            </div>
            <h3 className="text-2xl font-black text-slate-900">Who are my competitors?</h3>
            <p className="text-base text-slate-700 leading-relaxed font-semibold">
              Existing weekly markets, mandis, pricing, and infrastructure accessibility matter before committing your savings.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-sm hover:shadow-2xl hover:border-emerald-400 transition-all text-left space-y-4 group">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center text-3xl font-bold group-hover:scale-110 transition-transform">
              🪙
            </div>
            <h3 className="text-2xl font-black text-slate-900">How much should I invest?</h3>
            <p className="text-base text-slate-700 leading-relaxed font-semibold">
              If a person has ₹1 Lakh savings, total project cost is ₹10 Lakh (Savings / 0.1), and 90% is financed via government schemes.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Process / How It Works */}
      <section id="how-it-works" className="py-24 px-4 max-w-7xl mx-auto text-left space-y-16 relative z-10">
        <div className="space-y-4">
          <span className="text-xs font-black text-emerald-600 tracking-widest uppercase block">PROCESS</span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight">
            From Business Idea <br />
            <span className="text-emerald-600">to Informed Decision.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 relative group">
            <div className="flex items-center justify-between">
              <span className="text-3xl p-3 bg-amber-50 rounded-2xl">💡</span>
              <span className="text-4xl font-black text-slate-200 group-hover:text-emerald-500 transition-colors">01</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">Tell Us Your Idea</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-semibold">
              Enter your business type, savings capital, state, district, and village.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 relative group">
            <div className="flex items-center justify-between">
              <span className="text-3xl p-3 bg-blue-50 rounded-2xl">🗺️</span>
              <span className="text-4xl font-black text-slate-200 group-hover:text-emerald-500 transition-colors">02</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">Understand Your Market</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-semibold">
              Analyze village infrastructure, irrigated land, market access, and crop availability.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 relative group">
            <div className="flex items-center justify-between">
              <span className="text-3xl p-3 bg-emerald-50 rounded-2xl">📊</span>
              <span className="text-4xl font-black text-slate-200 group-hover:text-emerald-500 transition-colors">03</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">Check Your Feasibility</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-semibold">
              Evaluate financial structuring, loan suitability, business risks, and fit verdict.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 relative group">
            <div className="flex items-center justify-between">
              <span className="text-3xl p-3 bg-purple-50 rounded-2xl">📄</span>
              <span className="text-4xl font-black text-slate-200 group-hover:text-emerald-500 transition-colors">04</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">Get Your Action Plan</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-semibold">
              Discover eligible government financing schemes and grounded AI narrative recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Financial Indicators & SC Government Schemes Carousel */}
      <section id="insights" className="py-24 bg-slate-100/90 border-t-2 border-slate-200 px-4 relative z-10 space-y-16">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* 1. Financial Indicators Formula Card */}
          <div className="space-y-6 text-left max-w-4xl">
            <span className="text-xs font-black text-emerald-600 tracking-widest uppercase block">FINANCIAL STRUCTURING FORMULA</span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Know What the Numbers Say.
            </h2>
            <p className="text-lg text-slate-700 font-semibold">
              GramBiz uses deterministic financial margin math: Your Savings represent the 10% required margin money, structuring your total Project Cost at <strong>Savings / 0.1</strong> with <strong>90% Government Scheme Financing</strong>.
            </p>

            {/* Formula Example Box */}
            <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-md space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <span className="text-lg font-black text-slate-900">Financial Structuring Example</span>
                <span className="text-xs text-emerald-800 bg-emerald-50 font-black px-3.5 py-1.5 rounded-full border border-emerald-300">
                  Formula: Savings / 0.1
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs text-slate-500 block font-bold">1. Own Savings (Margin)</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">₹1,00,000</span>
                  <span className="text-[10px] text-slate-500 font-bold">(10% Required Contribution)</span>
                </div>

                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                  <span className="text-xs text-emerald-900 block font-bold">2. Total Project Cost</span>
                  <span className="text-2xl font-black text-emerald-700 mt-1 block">₹10,00,000</span>
                  <span className="text-[10px] text-emerald-700 font-bold">(Savings / 0.1)</span>
                </div>

                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                  <span className="text-xs text-amber-900 block font-bold">3. Govt Scheme Loan (90%)</span>
                  <span className="text-2xl font-black text-amber-700 mt-1 block">₹9,00,000</span>
                  <span className="text-[10px] text-amber-700 font-bold">(90% Financed by Scheme)</span>
                </div>

                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200">
                  <span className="text-xs text-indigo-900 block font-bold">4. Repayment Tenure</span>
                  <span className="text-2xl font-black text-indigo-900 mt-1 block">5 Years</span>
                  <span className="text-[10px] text-indigo-700 font-bold">(Moratorium Included)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Targeted SC Government Schemes Carousel */}
          <div id="gov-schemes" className="pt-6">
            <SchemeCarousel onSelectScheme={onGoToForm} />
          </div>

        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-24 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Ready to Check Your Business Feasibility?
          </h2>
          <p className="text-slate-300 text-lg sm:text-xl font-medium">
            Select your location, business category, and available savings capital to get an instant, census-grounded feasibility report.
          </p>
          <div>
            <button
              onClick={onGoToForm}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xl py-5 px-10 rounded-full shadow-2xl hover:scale-105 transition-all cursor-pointer"
            >
              Check My Business Now →
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
