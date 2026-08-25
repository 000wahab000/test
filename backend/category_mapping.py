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
    """
    Maps a frontend business category string to one of the 4 backend keys:
    'dairy', 'retail', 'agro-processing', 'other'.
    If the category is already one of the 4 keys, returns it directly.
    """
    if not category_input:
        return "other"
    
    cat_lower = category_input.strip().lower()
    if cat_lower in ("dairy", "retail", "agro-processing", "other"):
        return cat_lower
        
    return CATEGORY_MAP.get(category_input.strip(), "other")
