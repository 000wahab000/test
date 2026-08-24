# Hyper-Local Business Feasibility Prototype 🚀

A decision-support application designed to evaluate micro-business feasibility across rural villages in India. It combines **deterministic financial math**, **real census village amenities data**, **rule-based fit scoring**, and **grounded AI narratives (English & Hindi)** for rural entrepreneurs.

---

## Key Features

- 📍 **Seeded Census Integration**: Grounded in real Census 2011 Village Amenities data for Jalgaon district, Maharashtra (1,513 villages).
- 💰 **Financial Structuring Engine**: Deterministically computes Project Cost, Loan Amount, Scheme qualification (Micro Finance vs Term Loan), and 7-year Quarterly Repayment Schedules.
- 🎯 **Category-Isolated Fit Verdicts**: Evaluates feasibility for 3 business categories (**Dairy**, **Retail**, **Agro-processing**) with plain-language headlines (`GOOD FIT`, `RISKY`, `NOT RECOMMENDED`).
- 🤖 **Grounded AI Business Insights**: Generates plain-language SWOT analysis and practical summaries translating infrastructure gaps into real-world business impacts.
- 🌐 **Bilingual Support**: Toggle seamlessly between **English** and **Hindi**.
- ℹ️ **Interactive Tooltips**: Clear, non-technical explanations for 8 key financial and data metrics.

---

## Technology Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: FastAPI, Python 3.10+, SQLAlchemy Core, SQLite / PostgreSQL
- **LLM Integration**: Google Gemini API (`gemini-2.5-flash`) via `google-genai` with deterministic fallback

---

## Quick Start

### 1. Clone & Setup Backend
```bash
git clone https://github.com/your-username/hyperlocal-feasibility-prototype.git
cd hyperlocal-feasibility-prototype

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate  # Windows (or 'source venv/bin/activate' on Mac/Linux)

# Install dependencies
pip install -r backend/requirements.txt

# Seed census data
python backend/scripts/load_census.py

# Start FastAPI backend
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

### 2. Setup Frontend
```bash
# Open new terminal
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173/` in your browser.

For detailed setup instructions, see [.agents/INSTALLATION.md](.agents/INSTALLATION.md).

---

## Legal & Compliance Disclaimer

> **Decision support only. Not a loan guarantee. Eligibility subject to scheme verification.**
