import React, { useState } from 'react'
import LandingPage from './LandingPage'
import Form from './Form'
import Report from './Report'

export default function App() {
  const [view, setView] = useState('landing') // 'landing' | 'form' | 'report'
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFormSubmit = async (formData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:8000/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`)
      }

      const result = await response.json()
      setReportData(result)
      setView('report')
    } catch (err) {
      console.error('Error evaluating feasibility:', err)
      setError('Failed to fetch feasibility report. Please check backend API server.')
    } finally {
      setLoading(false)
    }
  }

  const handleThemeClick = () => {
    alert('Theme switching is disabled for now. (Default Light theme active)')
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col relative selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Top Header / Navigation Bar (Rendered ONLY on Homepage and Form View) */}
      {view !== 'report' && (
        <header className="bg-white/95 border-b-2 border-slate-200/90 sticky top-0 z-50 shadow-xs backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
            {/* Logo */}
            <div
              onClick={() => setView('landing')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <img
                src="/logo.png"
                alt="GramBiz Logo"
                className="h-11 w-auto object-contain rounded-xl shadow-xs group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight">GramBiz</span>
              </div>
            </div>

            {/* Landing Page Navbar Links */}
            <nav className="hidden md:flex items-center space-x-8 text-sm font-extrabold text-slate-700">
              <button
                onClick={() => setView('landing')}
                className={`transition-colors cursor-pointer ${view === 'landing' ? 'text-emerald-700 font-black' : 'hover:text-emerald-600'}`}
              >
                Home
              </button>
              <button
                onClick={() => {
                  setView('landing')
                  setTimeout(() => {
                    const el = document.getElementById('heatmap')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }, 100)
                }}
                className="hover:text-emerald-600 transition-colors cursor-pointer"
              >
                Vicinity Heatmap
              </button>
              <button
                onClick={() => {
                  setView('landing')
                  setTimeout(() => {
                    const el = document.getElementById('how-it-works')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }, 100)
                }}
                className="hover:text-emerald-600 transition-colors cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={() => {
                  setView('landing')
                  setTimeout(() => {
                    const el = document.getElementById('insights')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }, 100)
                }}
                className="hover:text-emerald-600 transition-colors cursor-pointer"
              >
                Insights
              </button>
              <button
                onClick={() => {
                  setView('landing')
                  setTimeout(() => {
                    const el = document.getElementById('gov-schemes')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }, 100)
                }}
                className="hover:text-emerald-600 transition-colors cursor-pointer"
              >
                Gov. Schemes
              </button>
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleThemeClick}
                title="Change Theme (Disabled)"
                className="p-2 px-3.5 rounded-full border-2 border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-black flex items-center space-x-1.5 cursor-not-allowed opacity-80"
              >
                <span>🌙</span>
                <span className="hidden sm:inline text-xs">Theme</span>
              </button>

              <button
                onClick={() => setView('form')}
                className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm py-3 px-6 rounded-full shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
              >
                <span>Check My Business</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Global Active Report Banner (Only on Landing Page when a report exists) */}
      {reportData && view === 'landing' && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white py-3.5 px-4 text-center text-sm font-black shadow-md flex items-center justify-center space-x-3">
          <span>✨ Active Feasibility Report generated for {reportData.input?.village}, {reportData.input?.district}!</span>
          <button
            onClick={() => setView('report')}
            className="bg-white text-slate-900 font-black px-4 py-1.5 rounded-full text-xs shadow-xs hover:bg-slate-100 cursor-pointer"
          >
            View Full Report →
          </button>
        </div>
      )}

      {/* Global Error Banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 pt-4 w-full">
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold p-4 rounded-2xl flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700">✕</button>
          </div>
        </div>
      )}

      {/* Page Content */}
      <main className="flex-1">
        {view === 'landing' && (
          <LandingPage
            onGoToForm={() => setView('form')}
            onThemeClick={handleThemeClick}
          />
        )}

        {view === 'form' && (
          <div className="py-12 px-4 max-w-7xl mx-auto">
            <Form
              onSubmit={handleFormSubmit}
              isLoading={loading}
              onBackToHome={() => setView('landing')}
            />
          </div>
        )}

        {view === 'report' && reportData && (
          <div className="py-4 px-2 sm:px-6 md:px-8 w-full">
            <Report
              data={reportData}
              onBack={() => setView('form')}
              onBackToLanding={() => setView('landing')}
              onCheckAnother={() => setView('form')}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-slate-200 py-8 text-center text-sm text-slate-600 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="GramBiz Logo" className="h-8 w-auto object-contain" />
            <span className="font-black text-slate-900 text-base">GramBiz</span>
            <span>— Know Your Business Before You Borrow</span>
          </div>
          <div>
            <span className="font-semibold text-xs text-slate-500">Data Source: Census 2011 | LGD | Deterministic Financial Engine</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
