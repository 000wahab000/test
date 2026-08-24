import React, { useState } from 'react'
import Form from './Form'
import Report from './Report'

export default function App() {
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
    } catch (err) {
      console.error('Error evaluating feasibility:', err)
      setError('Failed to fetch feasibility report. Please check backend API server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🌿</span>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight">RuralBiz PreLoan Advisor</h1>
              <p className="text-[11px] text-slate-400 font-medium">Pre-Loan Feasibility for Rural Entrepreneurs</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 font-medium">Source: Census 2011 | LGD</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {!reportData ? (
          <div className="max-w-xl mx-auto">
            <Form onSubmit={handleFormSubmit} isLoading={loading} />
          </div>
        ) : (
          <Report data={reportData} onBack={() => setReportData(null)} />
        )}
      </main>
    </div>
  )
}
