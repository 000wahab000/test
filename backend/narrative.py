import json
import os

PROMPT_VERBATIM_INSTRUCTION = (
    "Only use the facts provided below. Do not invent statistics, prices, numbers, "
    "or counts not present in the input. Output SWOT as 4 short bullet groups and a 3-4 sentence narrative."
)

def generate_narrative(financial_summary: dict, village_context: dict, fit_result: dict, language: str = "en") -> dict:
    api_key = os.getenv("GEMINI_API_KEY")
    lang_instruction = "Write entirely in simple Hindi." if language.lower() in ("hi", "hindi") else "Write entirely in simple English."
    
    business_category = (village_context.get("business_category") or "selected business").lower()
    
    facts = {
        "business_category": business_category,
        "financial_summary": financial_summary,
        "village_context": village_context,
        "fit_result": fit_result
    }
    
    prompt = f"""{PROMPT_VERBATIM_INSTRUCTION}

{lang_instruction}

TONE & STYLE GUIDELINES:
- Write for a rural entrepreneur with no business or finance background.
- Use short, simple, plain-language sentences.
- Avoid formal corporate jargon or meta-language (NEVER mention "census", "data", "algorithm", "fit math", "methodology", or "structuring").
- NO BOILERPLATE SUFFIX: DO NOT append generic fixed closing sentences (e.g. "be sure to visit personally..."). Vary the closing sentence naturally based on the verdict:
  * For GOOD FIT: suggest checking machinery supplier quotes or buyer contracts.
  * For RISKY: warn to verify summer fodder prices or transport costs before investing.
  * For NOT RECOMMENDED: warn that this location carries high financial risk and suggest considering better-suited villages.

STRICT CATEGORY DIFFERENTIATION:
1. RETAIL:
   - Reason ONLY from store footfall, mandis, weekly haats, PDS outlets, population, banks, and road access.
   - ZERO references to farmland, irrigation, crops, or net area sown.
2. DAIRY:
   - Focus specifically on cattle feed, green fodder, livestock drinking water, chilling/milk transport, and veterinary/bank access.
3. AGRO-PROCESSING:
   - Focus specifically on raw crop output (CITE THE ACTUAL LOCAL CROP/COMMODITY BY NAME if available, e.g. Cotton, Banana, Wooden Furniture), processing machinery raw material needs, and access to mandis/markets to sell processed goods.

Output valid JSON matching this exact structure:
{{
  "strengths": ["bullet 1", "bullet 2"],
  "weaknesses": ["bullet 1", "bullet 2"],
  "opportunities": ["bullet 1", "bullet 2"],
  "threats": ["bullet 1", "bullet 2"],
  "narrative": "3-4 simple sentences explaining what this location means for running their business."
}}

FACTS:
{json.dumps(facts, indent=2)}
"""

    if api_key:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config={"response_mime_type": "application/json"}
            )
            data = json.loads(response.text)
            return data
        except Exception as e:
            print(f"Gemini API call failed: {e}. Falling back to plain-language builder.")

    # Plain-Language Grounded Fallback Builder (Differentiated Category Reasoning & Verdict-Varying Closers)
    is_hi = language.lower() in ("hi", "hindi")
    v_name = village_context.get("village", "")
    d_name = village_context.get("district", "")
    cat = str(village_context.get("business_category", "") or "business").lower()
    
    scheme_name = financial_summary.get("scheme", {}).get("scheme_name", "").replace("_", " ")
    loan_amt = financial_summary.get("loan_amount", 0)
    fit_status = fit_result.get("fit", "")
    fit_headline = fit_result.get("headline", fit_result.get("reason", ""))
    
    irrigated = float(village_context.get("irrigated_area", 0) or 0)
    net_sown = float(village_context.get("net_area_sown", 0) or 0)
    pop = float(village_context.get("total_population", 0) or 0)
    town_dist = float(village_context.get("nearest_town_distance", 0) or 0)
    
    comm = village_context.get("agricultural_commodities_1st") or village_context.get("manufacturers_commodities_1st") or ""
    if str(comm).upper() in ("NA", "N/A", "NONE", "NULL"):
        comm = ""

    road_avail = str(village_context.get("all_weather_road", "")) == "1"
    mandi_avail = str(village_context.get("mandis_market_status", "")) == "1" or str(village_context.get("weekly_haat_status", "")) == "1"
    pds_avail = str(village_context.get("pds_status", "")) == "1"
    bank_avail = str(village_context.get("commercial_bank_status", "")) == "1" or str(village_context.get("shg_status", "")) == "1"

    strengths = []
    weaknesses = []
    opportunities = []
    threats = []

    if cat == "retail":
        # 1. RETAIL: Footfall, Mandi, PDS, Bank, Population, Road. ZERO land/crop references.
        if is_hi:
            if mandi_avail:
                strengths.append("स्थानीय बाजार और साप्ताहिक हाट होने से ग्राहक रोज खरीदारी के लिए आते हैं।")
            if pds_avail:
                strengths.append("राशन की दुकान (PDS) होने से गाँव के लोग नियमित रूप से आते-जाते हैं।")
            if road_avail:
                strengths.append("पक्की सड़क होने से दुकान का सामान लाना आसान रहेगा।")
            if bank_avail:
                strengths.append("स्थानीय बैंक या बचत समूह से दैनिक नकदी लेनदेन आसान रहेगा।")

            if not mandi_avail:
                weaknesses.append("गाँव में कोई नियमित बाजार नहीं है। ग्राहक सीमित रहेंगे और बिक्री में समय लग सकता है।")
            if not bank_avail:
                weaknesses.append("गाँव में बैंक या एटीएम नहीं है। आपको पैसे जमा करने के लिए शहर जाना पड़ेगा, जिसमें समय और जोखिम लगेगा।")

            opportunities.append(f"{scheme_name.title()} योजना के तहत ₹{loan_amt:,.0f} तक का लोन दुकान का सामान भरने के लिए मिल सकता है।")
            threats.append("आस-पास के बड़े शहर की दुकानों से ग्राहक टूट सकते हैं।")

            closer = (
                "स्थानीय बाजार में दुकान की जगह और ग्राहक मांग की जांच करके काम आगे बढ़ाएं।" if fit_status == "match"
                else "सामान का स्टॉक खरीदने से पहले पास के शहर के मंडी दामों और परिवहन खर्च की जांच करें।" if fit_status == "partial"
                else "कम ग्राहक संख्या के कारण इस गाँव में दुकान खोलना जोखिम भरा है, अन्य स्थान पर विचार करें।"
            )

            narrative = (
                f"{v_name} गाँव में रिटेल दुकान शुरू करने का मूल्यांकन: {fit_headline}. "
                f"इस योजना के तहत दुकान के सामान के लिए ₹{loan_amt:,.0f} तक की बैंक मदद मिल सकती है। "
                f"{closer}"
            )
        else:
            if mandi_avail:
                strengths.append("Active local mandi and weekly haat bring steady daily retail shoppers into the village center.")
            if pds_avail:
                strengths.append("PDS ration outlet brings regular monthly customer footfall right past shop storefronts.")
            if pop >= 2000:
                strengths.append(f"Sizable village population of {pop:,.0f} residents provides a strong local consumer base.")
            if road_avail:
                strengths.append("All-weather paved roads allow wholesale delivery trucks to supply shop inventory year-round.")

            if not mandi_avail:
                weaknesses.append("No regular local market or weekly haat. Customer traffic is limited, requiring extra marketing efforts to attract shoppers.")
            if not bank_avail:
                weaknesses.append("No local bank or ATM nearby. You will need to travel to town for cash handling, adding travel time and safety risks.")

            opportunities.append(f"Access up to ₹{loan_amt:,.0f} in bank loan support under the {scheme_name.title()} scheme to stock retail inventory.")
            threats.append("Local customers might travel to bigger town markets for cheaper bulk retail goods.")

            closer = (
                "Since market footfall is promising, finalize your store location and compare wholesale supplier rates." if fit_status == "match"
                else "Before investing margin capital, calculate whether monthly PDS footfall alone can generate enough store sales." if fit_status == "partial"
                else "Due to weak customer traffic, opening a retail store here carries high financial risk — consider villages with active markets."
            )

            narrative = (
                f"Starting a retail shop in {v_name}: {fit_headline}. "
                f"You can apply for up to ₹{loan_amt:,.0f} in loan support under the {scheme_name.title()} scheme to stock inventory. "
                f"{closer}"
            )

    elif cat == "dairy":
        # 2. DAIRY: Feed, Fodder, Drinking Water, Milk Chilling/Transport, Cattle Loan.
        if is_hi:
            if irrigated >= 550.7:
                strengths.append(f"प्रचुर सिंचित जमीन ({irrigated} हेक्टेयर) होने से पशुओं के लिए साल भर हरा चारा और पीने का पानी उपलब्ध रहेगा।")
            elif irrigated >= 174.1:
                strengths.append(f"मध्यम सिंचित जमीन ({irrigated} हेक्टेयर) से चारे की जरूरत आंशिक रूप से पूरी होगी।")
            if road_avail:
                strengths.append("पक्की सड़क होने से रोज सुबह दूध ले जाने वाली गाड़ियां गाँव तक आसानी से आ सकती हैं।")

            if irrigated < 174.1:
                weaknesses.append(f"सिंचाई के लिए केवल {irrigated} हेक्टेयर जमीन है। गर्मी में हरा चारा बिल्कुल नहीं मिलेगा, जिससे महंगा सूखा चारा बाहर से खरीदना पड़ेगा।")
            if town_dist > 20:
                weaknesses.append(f"शहर से {town_dist} किमी दूर होने के कारण दूध बिना ठंडा किए ले जाना मुश्किल होगा।")
            if not bank_avail:
                weaknesses.append("पास में बैंक न होने से दूध के भुगतान का नकदी प्रबंधन कठिन रहेगा।")

            opportunities.append(f"{scheme_name.title()} योजना के तहत दुधारू मवेशी और शेड निर्माण के लिए ₹{loan_amt:,.0f} तक का बैंक लोन मिल सकता है।")
            threats.append("गर्मी के दिनों में बीमारी या लू के कारण दूध का उत्पादन घटने का जोखिम।")

            closer = (
                "पानी और चारे की अच्छी स्थिति को देखते हुए, उन्नत नस्ल की गाय/भैंस खरीदने और दूध डेयरी नेटवर्क से जुड़ने की योजना बनाएं।" if fit_status == "match"
                else "मवेशी खरीदने से पहले गर्मी के महीनों में सूखे चारे की कीमत और पानी के खर्च का हिसाब जरूर लगाएं।" if fit_status == "partial"
                else "चारे और पानी की भारी कमी के कारण यहाँ डेयरी फार्म लगाना बेहद जोखिम भरा है, अन्य सिंचित गाँव का चयन करें।"
            )

            narrative = (
                f"{v_name} गाँव में डेयरी व्यवसाय शुरू करने का मूल्यांकन: {fit_headline}. "
                f"मवेशी और शेड के लिए ₹{loan_amt:,.0f} तक की बैंक सहायता मिल सकती है। "
                f"{closer}"
            )
        else:
            if irrigated >= 550.7:
                strengths.append(f"High water availability with {irrigated} ha irrigated land ensures year-round green fodder and drinking water for cattle.")
            elif irrigated >= 174.1:
                strengths.append(f"Moderate irrigated land ({irrigated} ha) supports seasonal fodder crop cultivation.")
            if road_avail:
                strengths.append("Paved all-weather road allows daily morning milk collection vans to reach the village.")

            if irrigated < 174.1:
                weaknesses.append(f"Severe water shortage with only {irrigated} ha irrigated land. Green fodder will be unavailable in summer, forcing you to purchase dry fodder from outside at high cost.")
            if town_dist > 20:
                weaknesses.append(f"Distance of {town_dist} km to nearest town makes transporting fresh milk difficult without local chilling facilities.")
            if not bank_avail:
                weaknesses.append("No local bank nearby — cattle feed purchases and daily milk cash collections require travel to town.")

            opportunities.append(f"Access up to ₹{loan_amt:,.0f} in bank loan support under the {scheme_name.title()} scheme for purchasing high-yield milch cattle and cattle shed setup.")
            threats.append("Outbreaks of livestock disease and summer heat stress reducing daily milk yields.")

            closer = (
                "With strong fodder and water availability, focus your next steps on securing quality cattle breeds and tying up with a milk dairy collection route." if fit_status == "match"
                else "Before purchasing cattle, carefully calculate summer dry feed costs and water transport expenses." if fit_status == "partial"
                else "Due to severe water and fodder shortages, setting up a dairy farm here carries high financial risk — consider villages with higher irrigation."
            )

            narrative = (
                f"Starting a dairy enterprise in {v_name}: {fit_headline}. "
                f"You can apply for up to ₹{loan_amt:,.0f} in loan support under the {scheme_name.title()} scheme for cattle purchase and shed setup. "
                f"{closer}"
            )

    else:
        # 3. AGRO-PROCESSING: Crop Output (Named commodity), Processing Machinery, Mandi for output.
        if is_hi:
            if comm:
                strengths.append(f"प्रचुर कच्चा माल: गाँव में {comm} की फसल सीधे खेत से मिल सकती है।")
            if irrigated >= 550.7:
                strengths.append(f"प्रचुर सिंचित जमीन ({irrigated} हेक्टेयर) होने से प्रोसेसिंग मशीनरी के लिए फसल की आपूर्ति साल भर बनी रहेगी।")
            if mandi_avail:
                strengths.append("स्थानीय मंडी/बाजार होने से तैयार माल बेचना आसान रहेगा।")

            if not comm:
                weaknesses.append("गाँव में प्रमुख पंजीकृत फसल दर्ज नहीं है। मशीनरी खरीदने से पहले किसानों से फसल आपूर्ति की पुष्टि करें।")
            if irrigated < 174.1:
                weaknesses.append(f"कम सिंचित जमीन ({irrigated} हेक्टेयर) से फसल खराब होने का जोखिम है, जिससे प्रोसेसिंग मशीनें बेकार बैठ सकती हैं।")
            if not mandi_avail:
                weaknesses.append("स्थानीय मंडी न होने से तैयार माल बेचने के लिए दूर शहर जाना पड़ेगा, जिससे भाड़ा खर्च बढ़ेगा।")

            opportunities.append(f"{scheme_name.title()} योजना के तहत प्रोसेसिंग मशीनरी और गोदाम के लिए ₹{loan_amt:,.0f} का बैंक लोन प्राप्त कर सकते हैं।")
            threats.append("फसल का मंडी भाव अचानक गिरने या मौसम खराब होने से मार्जिन घटने का खतरा।")

            closer = (
                "कच्चे माल और मंडी की अच्छी उपलब्धता को देखते हुए, प्रोसेसिंग मशीनरी कोटेशन और खरीदार समझौतों पर ध्यान केंद्रित करें।" if fit_status == "match"
                else "मशीनरी पर पूंजी लगाने से पहले स्थानीय किसानों से कच्चा माल खरीदने की लागत और परिवहन खर्च जांचें।" if fit_status == "partial"
                else "कच्चे माल की अनिश्चितता के कारण यहाँ प्रोसेसिंग प्लांट लगाना बेहद जोखिम भरा है, समृद्ध कृषि गाँव चुनें।"
            )

            narrative = (
                f"{v_name} गाँव में एग्रो-प्रोसेसिंग इकाई लगाने का मूल्यांकन: {fit_headline}. "
                f"प्रोसेसिंग मशीनरी के लिए ₹{loan_amt:,.0f} तक का लोन मिल सकता है। "
                f"{closer}"
            )
        else:
            if comm:
                strengths.append(f"Direct raw material supply: {comm} is cultivated directly in the village.")
            if irrigated >= 550.7:
                strengths.append(f"Abundant irrigated farmland ({irrigated} ha) guarantees continuous crop supply for processing equipment.")
            if mandi_avail:
                strengths.append("Direct access to local mandi / market to sell processed output without high transport freight.")

            if not comm:
                weaknesses.append("No major primary crop registered in village census. You must verify local crop harvest volumes before buying processing machinery.")
            if irrigated < 174.1:
                weaknesses.append(f"Low irrigated land ({irrigated} ha) risks crop shortage during dry spells, leaving processing machinery idle.")
            if not mandi_avail:
                weaknesses.append("No local mandi or market hub — processed goods must be shipped to distant town markets, increasing freight costs.")

            opportunities.append(f"Access up to ₹{loan_amt:,.0f} in bank loan support under the {scheme_name.title()} scheme for purchasing crop processing machinery and storage setup.")
            threats.append("Market price fluctuations for processed commodities and seasonal raw crop supply shortages.")

            closer = (
                "Since local crop supply and market access are favorable, focus your next steps on machinery supplier quotes and buyer sales agreements." if fit_status == "match"
                else "Before purchasing processing equipment, verify whether local farmers can supply sufficient raw crop volume during dry months." if fit_status == "partial"
                else "Due to severe raw material supply risk, establishing an agro-processing unit here carries high financial risk — consider villages with higher crop output."
            )

            narrative = (
                f"Starting an agro-processing unit in {v_name}: {fit_headline}. "
                f"You can apply for up to ₹{loan_amt:,.0f} in loan support under the {scheme_name.title()} scheme for equipment and storage. "
                f"{closer}"
            )

    return {
        "strengths": strengths if strengths else ["Basic rural village location."],
        "weaknesses": weaknesses if weaknesses else ["Requires careful daily cash management."],
        "opportunities": opportunities if opportunities else [f"Government loan support under {scheme_name.title()}."],
        "threats": threats if threats else ["Seasonal price changes and weather risks."],
        "narrative": narrative
    }


if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    from backend.fit import check_fit
    import sqlite3

    conn = sqlite3.connect("feasibility.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    lasur = dict(cursor.execute("SELECT * FROM villages WHERE village = 'Lasur'").fetchone())
    
    fin = {"capital": 100000.0, "loan_amount": 900000.0, "scheme": {"scheme_name": "PMEGP SC Special Loan"}}
    
    print("==========================================================================")
    print("SIDE-BY-SIDE COMPARISON FOR THE SAME VILLAGE (Lasur) BETWEEN DAIRY & AGRO-PROCESSING")
    print("==========================================================================")
    
    # 1. Lasur - Dairy
    d_fit = check_fit("dairy", lasur)
    d_ctx = {**lasur, "business_category": "dairy"}
    d_nar = generate_narrative(fin, d_ctx, d_fit, "en")

    print("\n--- 1. LASUR (DAIRY - MATCH) ---")
    print("Headline:  ", d_fit["headline"])
    print("Strengths: ", d_nar["strengths"])
    print("Weaknesses:", d_nar["weaknesses"])
    print("Narrative: ", d_nar["narrative"])

    # 2. Lasur - Agro-processing
    a_fit = check_fit("agro-processing", lasur)
    a_ctx = {**lasur, "business_category": "agro-processing"}
    a_nar = generate_narrative(fin, a_ctx, a_fit, "en")

    print("\n--- 2. LASUR (AGRO-PROCESSING - MATCH) ---")
    print("Headline:  ", a_fit["headline"])
    print("Strengths: ", a_nar["strengths"])
    print("Weaknesses:", a_nar["weaknesses"])
    print("Narrative: ", a_nar["narrative"])

    # 3. Morchida - Dairy vs Agro-processing (Mismatch Comparison)
    morchida = dict(cursor.execute("SELECT * FROM villages WHERE village = 'Morchida'").fetchone())
    md_fit = check_fit("dairy", morchida)
    md_ctx = {**morchida, "business_category": "dairy"}
    md_nar = generate_narrative(fin, md_ctx, md_fit, "en")

    ma_fit = check_fit("agro-processing", morchida)
    ma_ctx = {**morchida, "business_category": "agro-processing"}
    ma_nar = generate_narrative(fin, ma_ctx, ma_fit, "en")

    print("\n--------------------------------------------------------------------------")
    print("SIDE-BY-SIDE COMPARISON FOR MISMATCH VILLAGE (Morchida)")
    print("--------------------------------------------------------------------------")
    
    print("\n--- 3. MORCHIDA (DAIRY - NOT RECOMMENDED) ---")
    print("Headline:  ", md_fit["headline"])
    print("Strengths: ", md_nar["strengths"])
    print("Weaknesses:", md_nar["weaknesses"])
    print("Narrative: ", md_nar["narrative"])

    print("\n--- 4. MORCHIDA (AGRO-PROCESSING - NOT RECOMMENDED) ---")
    print("Headline:  ", ma_fit["headline"])
    print("Strengths: ", ma_nar["strengths"])
    print("Weaknesses:", ma_nar["weaknesses"])
    print("Narrative: ", ma_nar["narrative"])
