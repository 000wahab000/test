# Installation & Setup Guide

This guide provides step-by-step instructions to set up, seed data, run locally, and deploy the **Hyper-Local Business Feasibility Prototype**.

---

## Prerequisites

Before starting, ensure you have the following installed on your machine:

- **Python**: 3.10 or higher
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: Latest version

---

## Project Structure

```text
├── backend/
│   ├── data/
│   │   └── raw/             # Seeded census CSV (Jalgaon District)
│   ├── scripts/
│   │   └── load_census.py   # Deterministic SQLite DB ingestion script
│   ├── db.py                # Database connection setup
│   ├── finance.py           # Financial structuring engine
│   ├── fit.py               # Rule-based fit scoring engine
│   ├── main.py              # FastAPI REST endpoints
│   ├── narrative.py         # Grounded SWOT & narrative builder
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Root container component
│   │   ├── Form.jsx         # Screen 1: Input form
│   │   └── Report.jsx       # Screen 2: Feasibility report & insights
│   ├── package.json         # Node dependencies
│   └── vite.config.js       # Vite configuration
└── README.md
```

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/hyperlocal-feasibility-prototype.git
cd hyperlocal-feasibility-prototype
```

---

## Step 2: Backend Setup

### 1. Create a Python Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Python Dependencies
```bash
pip install -r backend/requirements.txt
```

### 3. Seed Census Data into Database
Run the deterministic loader script to populate the database with the Jalgaon district census dataset:
```bash
python backend/scripts/load_census.py
```
*Output verification:*
```text
Loaded 1513 rows into villages table in feasibility.db
```

### 4. (Optional) Set Gemini API Key
For live LLM responses via Google Gemini, set your API key:
```bash
# Windows PowerShell
$env:GEMINI_API_KEY="your_gemini_api_key_here"

# macOS/Linux
export GEMINI_API_KEY="your_gemini_api_key_here"
```
*Note: If no API key is set, the application automatically uses a deterministic, rule-based plain-language narrative fallback builder.*

### 5. Start the FastAPI Backend Server
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend server will run at: `http://127.0.0.1:8000`

---

## Step 3: Frontend Setup

Open a new terminal window:

### 1. Install Node Dependencies
```bash
cd frontend
npm install
```

### 2. Start the Vite Dev Server
```bash
npm run dev
```
The web application will run at: `http://localhost:5173/`

---

## Step 4: Verification & Testing

1. Open your browser and navigate to `http://localhost:5173/`.
2. Select a village (e.g., `Lasur` or `Morchida`).
3. Select a business category (`Dairy`, `Retail`, or `Agro-processing`).
4. Enter margin capital (minimum `₹10,000`).
5. Click **Generate Report**.
6. Verify:
   - Financial Engine Output (Project Cost, Loan Amount, Scheme, Repayment Schedule).
   - Local Business Fit Verdict (Good Fit / Risky / Not Recommended).
   - Grounded AI Business Insights (SWOT + Practical Summary).
   - English / Hindi language toggle.
   - Interactive Tooltips (ℹ️) on 8 key metric labels.

---

## Environment Variables Summary

| Variable | Description | Required | Default |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API key for live LLM narrative generation | No | Fallback builder |
| `DATABASE_URL` | SQLAlchemy connection string | No | `sqlite:///feasibility.db` |
