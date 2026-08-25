CATEGORY_MAP = {
    "Grocery Store & Provision Shop": "retail",
    "Tiles, Bricks & Building Materials Unit": "other",
    "Flour Mill (Atta Chakki)": "agro-processing",
    "Dairy Farm & Milk Collection Center": "dairy",
    "Clothing, Textile & Tailoring Shop": "retail",
    "Poultry Farming & Hatchery": "other",
    "Edible Oil Extraction Unit": "agro-processing",
    "Seed, Fertilizer & Agricultural Shop": "retail",
    "Electronics & Mobile Repair Shop": "retail",
    "Bakery, Sweets & Confectionery Unit": "agro-processing",
    "Carpentry & Wooden Furniture Workshop": "other",
    "Auto, Tractor & Machinery Repair Shop": "retail",
    "Medical & Pharmacy Retail Store": "retail",
    "Spice Processing & Grinding Unit": "agro-processing",
    "Goat & Livestock Husbandry": "dairy",
    "Welding & Hardware Fabrication Shop": "other",
    "General Hardware & Electrical Store": "retail",
}

def map_category(category_input: str) -> str:
    if not category_input:
        return "other"
    val = category_input.strip()
    return val.lower() if val.lower() in ("dairy", "retail", "agro-processing", "other") else CATEGORY_MAP.get(val, "other")
