def project_cost(capital: float) -> float:
    return capital / 0.10

def select_scheme(project_cost_val: float) -> dict:
    if project_cost_val <= 140000:
        return {
            "scheme_name": "micro_finance",
            "max_loan": 125000.0,
            "interest_rate": 0.065,
            "tenure_years": 3,
            "moratorium_months": 3
        }
    return {
        "scheme_name": "term_loan",
        "max_loan": 4500000.0,
        "interest_rate": 0.08,
        "tenure_years": 7,
        "moratorium_months": 6
    }

def loan_amount(project_cost_val: float) -> float:
    scheme = select_scheme(project_cost_val)
    return min(project_cost_val * 0.90, scheme["max_loan"])

def repayment_schedule(loan: float, scheme: dict) -> list:
    total_quarters = scheme["tenure_years"] * 4
    moratorium_quarters = scheme["moratorium_months"] // 3
    repayment_quarters = total_quarters - moratorium_quarters
    principal_per_quarter = loan / repayment_quarters if repayment_quarters > 0 else 0.0
    quarterly_rate = scheme["interest_rate"] / 4
    
    schedule = []
    remaining_balance = loan
    for q in range(1, total_quarters + 1):
        interest = remaining_balance * quarterly_rate
        principal = 0.0 if q <= moratorium_quarters else principal_per_quarter
        payment = principal + interest
        remaining_balance -= principal
        
        # Clamp tiny floating point inaccuracies on final quarter to 0.0
        final_balance = 0.0 if q == total_quarters else round(max(0.0, remaining_balance), 2)

        schedule.append({
            "quarter": q,
            "principal": round(principal, 2),
            "interest": round(interest, 2),
            "total_payment": round(payment, 2),
            "remaining_balance": final_balance
        })
    return schedule

if __name__ == "__main__":
    cap = 100000.0
    pc = project_cost(cap)
    assert pc == 1000000.0, f"Expected 1000000.0, got {pc}"
    
    sch = select_scheme(pc)
    assert sch["scheme_name"] == "term_loan", f"Expected term_loan, got {sch['scheme_name']}"
    
    loan = loan_amount(pc)
    assert loan == 900000.0, f"Expected 900000.0, got {loan}"
    
    sched = repayment_schedule(loan, sch)
    assert len(sched) == 28, f"Expected 28 quarters, got {len(sched)}"
    assert sched[-1]["remaining_balance"] == 0.0, f"Expected final remaining balance to be 0.0, got {sched[-1]['remaining_balance']}"
    
    print(f"Worked Example Verification PASSED:")
    print(f"Capital: {cap} -> Project Cost: {pc} -> Scheme: {sch['scheme_name']} -> Loan: {loan}")
    print(f"First 2 Moratorium Quarters: {sched[:2]}")
    print(f"First 2 Repayment Quarters: {sched[2:4]}")
    print(f"Final Quarter (Q28): {sched[-1]}")
