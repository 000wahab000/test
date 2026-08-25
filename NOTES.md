# Scope Notes & Excluded Features

## Out-of-Scope Requests Logged (AGENTS.md Hard Constraints)

- **User Accounts / Auth / Logout**: Requested user profile picture, top-right pfp, logout button, and settings window. 
  - *Status*: **Banned by Hard Constraint 6** (`No auth, no accounts, no dashboard, no save/history`).
- **Dashboard Sidebar / Compare Businesses**: Requested multi-section sidebar dashboard with compare businesses view and settings window.
  - *Status*: **Banned by Hard Constraint 6 & Constraint 2**. 
- **Current Allowed Architecture**:
  - Exactly 2 core screens: Input Form (`Form.jsx`) & Feasibility Report (`Report.jsx`).
  - Report screen organizes analysis into tabs/sections (Market Analysis, Financial Analysis, Scheme Matching, AI Insights).
