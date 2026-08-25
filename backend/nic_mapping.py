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
    "05": "other",            # Mining of coal
    "06": "other",            # Crude petroleum & natural gas
    "07": "other",            # Mining of metal ores
    "08": "other",            # Other mining & quarrying
    "09": "other",            # Mining support service
    "10": "agro-processing",  # Food products manufacturing (except 105 dairy manufacturing)
    "11": "other",            # Beverage manufacturing (mineral water, soft drinks, aerated drinks, alcohol)
    "12": "other",            # Tobacco products
    "13": "other",            # Manufacture of textiles
    "14": "other",            # Wearing apparel
    "15": "other",            # Leather products
    "16": "other",            # Wood products
    "17": "other",            # Paper products
    "18": "other",            # Printing & reproduction
    "19": "other",            # Coke & refined petroleum
    "20": "other",            # Chemical products
    "21": "other",            # Pharmaceuticals
    "22": "other",            # Rubber & plastics
    "23": "other",            # Non-metallic mineral products
    "24": "other",            # Basic metals
    "25": "other",            # Fabricated metal products
    "26": "other",            # Computer & electronic products
    "27": "other",            # Electrical equipment
    "28": "other",            # Machinery & equipment
    "29": "other",            # Motor vehicles
    "30": "other",            # Other transport equipment
    "31": "other",            # Furniture
    "32": "other",            # Other manufacturing
    "33": "other",            # Repair & installation of machinery
    "35": "other",            # Electricity, gas, steam supply
    "36": "other",            # Water collection & supply
    "37": "other",            # Sewerage
    "38": "other",            # Waste collection & treatment
    "39": "other",            # Remediation activities
    "41": "other",            # Construction of buildings
    "42": "other",            # Civil engineering
    "43": "other",            # Specialized construction
    "45": "other",            # Wholesale/retail of motor vehicles
    "46": "other",            # Wholesale trade (except 46302 dairy wholesale)
    "47": "retail",           # Retail trade (except 47211 dairy retail)
    "49": "other",            # Land transport
    "50": "other",            # Water transport
    "51": "other",            # Air transport
    "52": "other",            # Warehousing & transport support
    "53": "other",            # Postal & courier activities
    "55": "other",            # Accommodation / Hotels
    "56": "other",            # Food & beverage service / Restaurants
    "58": "other",            # Publishing activities
    "59": "other",            # Motion picture & TV
    "60": "other",            # Programming & broadcasting
    "61": "other",            # Telecommunications
    "62": "other",            # Computer programming & IT consultancy
    "63": "other",            # Information service activities
    "64": "other",            # Financial service activities
    "65": "other",            # Insurance & pension funding
    "66": "other",            # Financial auxiliary activities
    "68": "other",            # Real estate activities
    "69": "other",            # Legal & accounting activities
    "70": "other",            # Management consultancy
    "71": "other",            # Architectural & engineering
    "72": "other",            # Scientific research & development
    "73": "other",            # Advertising & market research
    "74": "other",            # Professional, scientific & technical
    "75": "other",            # Veterinary activities
    "77": "other",            # Rental & leasing
    "78": "other",            # Employment activities
    "79": "other",            # Travel agency & tour operator
    "80": "other",            # Security & investigation
    "81": "other",            # Services to buildings & landscape
    "82": "other",            # Office administrative & support
    "84": "other",            # Public administration
    "85": "other",            # Education
    "86": "other",            # Human health activities
    "87": "other",            # Residential care
    "88": "other",            # Social work activities
    "90": "other",            # Creative, arts & entertainment
    "91": "other",            # Libraries, archives, museums
    "93": "other",            # Sports & amusement
    "94": "other",            # Membership organizations
    "95": "other",            # Repair of computers & personal goods
    "96": "other",            # Personal service activities
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
