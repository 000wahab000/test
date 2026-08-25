import React, { useState } from 'react'

const SCHEMES = [
  {
    id: 1,
    name: 'NSFDC Special Loan Scheme for SC Entrepreneurs',
    category: 'Targeted SC Category (Income < ₹5 Lakh)',
    maxLoan: 'Up to ₹5 Lakh - ₹15 Lakh',
    fundingCover: '90% Project Cost Financed',
    subsidy: 'Concessional Interest (4% - 6% p.a.)',
    collateral: 'No Hard Collateral Required',
    icon: '🏛️',
    color: 'from-amber-600 to-orange-700',
    bgColor: 'bg-amber-50 border-amber-300',
    description: 'National Scheduled Castes Finance & Development Corporation scheme providing concessional credit for SC micro-entrepreneurs with annual household income below ₹5 Lakh.'
  },
  {
    id: 2,
    name: 'PM-AJAY (Pradhan Mantri Anusuchit Jaati Abhyuday Yojana)',
    category: 'SC Self-Employment & Income Generation',
    maxLoan: 'Up to ₹10 Lakh',
    fundingCover: '90% Scheme Support',
    subsidy: '50% Financial Grant / Subsidy',
    collateral: 'Government Backed Guarantee',
    icon: '🌾',
    color: 'from-emerald-600 to-teal-700',
    bgColor: 'bg-emerald-50 border-emerald-300',
    description: 'Special central scheme empowering Scheduled Caste families below ₹5 Lakh income through grant-in-aid, skill training, and credit support for rural business setups.'
  },
  {
    id: 3,
    name: 'VCF-SC (Venture Capital Fund for Scheduled Castes)',
    category: 'SC Micro & Small Business Promotion',
    maxLoan: 'Up to ₹15 Lakh - ₹5 Crore',
    fundingCover: '75% Financial Support',
    subsidy: 'Soft Loan @ 6% Interest',
    collateral: 'Asset Hypothecation Only',
    icon: '🏭',
    color: 'from-purple-600 to-indigo-700',
    bgColor: 'bg-purple-50 border-purple-300',
    description: 'Government fund specifically promoting entrepreneurship among Scheduled Castes who want to establish manufacturing, processing, or service units.'
  },
  {
    id: 4,
    name: 'PMEGP Special Category for SC / Low Income',
    category: 'Rural SC Special Subsidy',
    maxLoan: 'Up to ₹50 Lakh',
    fundingCover: '90% - 95% Bank Financing',
    subsidy: '35% Rural Capital Subsidy for SC',
    collateral: 'CGTMSE Cover Eligible',
    icon: '🛡️',
    color: 'from-blue-600 to-indigo-700',
    bgColor: 'bg-blue-50 border-blue-300',
    description: 'Prime Minister Employment Generation Programme providing enhanced 35% capital subsidy in rural areas for SC borrowers with minimal margin contribution (5%).'
  },
  {
    id: 5,
    name: 'Stand-Up India Scheme (SC / ST / Women)',
    category: 'SC Greenfield Business Setup',
    maxLoan: '₹10 Lakh to ₹1 Crore',
    fundingCover: '75% Composite Loan',
    subsidy: 'Margin Money Support',
    collateral: 'Credit Guarantee Scheme Cover',
    icon: '🚀',
    color: 'from-indigo-600 to-purple-700',
    bgColor: 'bg-indigo-50 border-indigo-300',
    description: 'Mandatory bank lending scheme specifically reserving credit for SC & ST entrepreneurs to establish new enterprises in manufacturing, services, or trading.'
  }
]

export default function SchemeCarousel({ onSelectScheme }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SCHEMES.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SCHEMES.length) % SCHEMES.length)
  }

  const activeScheme = SCHEMES[currentIndex]

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl p-6 sm:p-8 space-y-6 text-left relative overflow-hidden">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-100 pb-5">
        <div>
          <span className="text-xs font-black text-amber-600 tracking-widest uppercase block flex items-center space-x-1">
            <span>🇮🇳</span>
            <span>TARGETED SC SCHEMES (INCOME &lt; ₹5 LAKH)</span>
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Government Loan Schemes for SC Entrepreneurs</h3>
        </div>

        {/* Arrow Navigation Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrev}
            className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-black flex items-center justify-center transition-all cursor-pointer shadow-xs border border-slate-300"
            title="Previous Scheme"
          >
            ←
          </button>
          <span className="text-sm font-black text-slate-700">
            {currentIndex + 1} / {SCHEMES.length}
          </span>
          <button
            onClick={handleNext}
            className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-black flex items-center justify-center transition-all cursor-pointer shadow-xs border border-slate-300"
            title="Next Scheme"
          >
            →
          </button>
        </div>
      </div>

      {/* Active Scheme Display Card */}
      <div className={`rounded-3xl border-2 ${activeScheme.bgColor} p-6 sm:p-8 transition-all duration-300 relative overflow-hidden shadow-md`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black bg-white text-amber-900 border border-amber-300 px-3.5 py-1 rounded-full shadow-xs">
                {activeScheme.category}
              </span>
              <span className="text-xs font-black bg-emerald-700 text-white px-3.5 py-1 rounded-full shadow-xs">
                {activeScheme.fundingCover}
              </span>
            </div>

            <h4 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {activeScheme.name}
            </h4>

            <p className="text-base text-slate-800 leading-relaxed font-semibold">
              {activeScheme.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 font-bold block">MAX LOAN CEILING</span>
                <span className="text-base font-black text-slate-900">{activeScheme.maxLoan}</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 font-bold block">GOVT SUBSIDY / SUPPORT</span>
                <span className="text-base font-black text-emerald-700">{activeScheme.subsidy}</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-500 font-bold block">COLLATERAL NORMS</span>
                <span className="text-base font-black text-indigo-700">{activeScheme.collateral}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center space-y-4 border-t lg:border-t-0 lg:border-l-2 border-slate-200/80 pt-6 lg:pt-0 lg:pl-8">
            <div className="w-24 h-24 rounded-3xl bg-white text-4xl flex items-center justify-center shadow-lg border-2 border-slate-200">
              {activeScheme.icon}
            </div>

            <button
              onClick={onSelectScheme}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-sm py-4 px-6 rounded-2xl shadow-lg transition-all cursor-pointer"
            >
              Check Feasibility for Scheme →
            </button>
          </div>
        </div>
      </div>

      {/* Slide Dot Indicators */}
      <div className="flex justify-center items-center space-x-2 pt-2">
        {SCHEMES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrentIndex(idx)}
            className={`h-3 rounded-full transition-all cursor-pointer ${
              currentIndex === idx ? 'w-10 bg-amber-600' : 'w-3 bg-slate-200 hover:bg-slate-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
