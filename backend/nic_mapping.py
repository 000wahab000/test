"""
NIC Code to Business Category Deterministic Mapping.

Categories:
- dairy
- retail
- agro-processing
- other

Bypasses LLM, strictly deterministic lookup based on 2-digit NIC prefixes
and specific 3-digit / 5-digit sub-code overrides.
"""

# ponytail: static dict lookup for 4 categories; upgrade: database table mapping if taxonomy expands beyond 3 business categories
# Static 2-digit prefix mapping based on the 81 distinct prefixes in Jalgaon MSME dataset
NIC_PREFIX_2DIGIT_MAP = {
    "01": "agro-processing",  # Crop and animal production (except dairy sub-codes)
    "10": "agro-processing",  # Food products manufacturing (except 105 dairy manufacturing)
    "47": "retail",           # Retail trade (except 47211 dairy retail)
}

# Specific 3-digit, 4-digit, or 5-digit sub-code overrides
NIC_EXPLICIT_SUBCODE_MAP = {
    # Dairy Overrides
    "0141": "dairy",      # Raising of dairy cattle / buffaloes
    "01411": "dairy",     # Raising of dairy cattle
    "01412": "dairy",     # Raising of buffaloes
    "0142": "dairy",      # Animal production n.e.c. (dairy support)
    "105": "dairy",       # Manufacture of dairy products (3-digit)
    "1050": "dairy",      # Manufacture of dairy products (4-digit)
    "10501": "dairy",     # Pasteurised milk
    "10502": "dairy",     # Milk powder / condensed milk
    "10503": "dairy",     # Ice cream / kulfi
    "10504": "dairy",     # Cream, butter, cheese, curd, ghee, khoya
    "10509": "dairy",     # Other dairy products
    "46302": "dairy",     # Wholesale of raw milk & dairy products
    "47211": "dairy",     # Retail sale of dairy products

    # Division 11 Agro-processing Overrides (Genuinely agricultural linked)
    "11033": "agro-processing", # Manufacture of grain malt
}


def map_nic_code(nic_code: str) -> str:
    """
    Deterministically maps a 5-digit (or variable length) NIC code to one of:
    - 'dairy'
    - 'retail'
    - 'agro-processing'
    - 'other'
    """
    code_str = str(nic_code).strip()
    if not code_str:
        return "other"
    
    # 1. Check exact 5-digit / 4-digit / 3-digit specific overrides first
    for length in range(min(5, len(code_str)), 2, -1):
        sub = code_str[:length]
        if sub in NIC_EXPLICIT_SUBCODE_MAP:
            return NIC_EXPLICIT_SUBCODE_MAP[sub]

    # 2. Check 2-digit prefix fallback
    prefix2 = code_str[:2].zfill(2)
    return NIC_PREFIX_2DIGIT_MAP.get(prefix2, "other")


# --- 10 Manual Test Assertions Verified Against Real CSV Rows ---
if __name__ == "__main__":
    test_cases = [
        # (Row Index / Enterprise Name, NIC Code, Description, Expected Category)
        ("Row 33: Datta Dairy", "10504", "Manufacture of cream, butter, cheese, curd, ghee, khoya etc.", "dairy"),
        ("Row 90: SHREE SUSHIL DAIRY", "10501", "Manufacture of pasteurised milk whether or not in bottles/ polythene packs etc.", "dairy"),
        ("Row 165533: Vaishnavi Provijan", "46302", "Wholesale of raw milk & dairy products", "dairy"),
        ("Row 36: Shri Ganesh Agro Center", "47737", "Retail sale of seeds, fertilisers, pesticides, machinery equipments and hand tools", "retail"),
        ("Row 45: M/S SUMUKH ENTERPRISES", "47190", "Other retail sale in non-specialized stores", "retail"),
        ("Row 54: VIDHI IMPORTED SHOPEE", "47722", "Retail sale of perfumery and cosmetic articles", "retail"),
        ("Row 5: JAI MATA DI GOAT FARM", "10109", "Production, processing and preserving of other meat and meat products n.e.c.", "agro-processing"),
        ("Row 27: MINAL PRODUCT", "10306", "Manufacture of pickles, chutney etc.", "agro-processing"),
        ("Row 40: SADGURU AVLI BABA FLOUR MILL", "10611", "Flour milling", "agro-processing"),
        ("Row 21: VITTHAL AGRO INDUSTRY", "11043", "Manufacture of mineral water", "other"),
        ("Row 2: V K POINT", "63992", "Activities of cyber café", "other"),
    ]

    print("Running Manual Test Assertions against backend/nic_mapping.py...\n")
    for name, nic_code, desc, expected in test_cases:
        result = map_nic_code(nic_code)
        assert result == expected, f"FAILED for {name}: expected {expected}, got {result}"
        print(f"[PASS] {name} | NIC {nic_code} -> '{result}' (Matches expected '{expected}')")
    
    print("\nAll assertions passed successfully!")
