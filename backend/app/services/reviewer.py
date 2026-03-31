import os
import json
from groq import Groq
from app.services.extractor import extract_permit_data
from app.core.security import mask_pii
from app.core.audit import log_audit_decision

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

REGULATIONS = {
    "UAE": "UAE/Dubai DED Business Permit Rules (2026): Valid Trade License (10 digits), Owner 21+ or guardian, Min 3 docs (Emirates ID, Lease, Insurance), No red flags, TRN mandatory, Capital matches activity.",
    "India": "India MCA Company Registration Rules (2026): Valid PAN + Aadhaar, CIN/DIN, Min 2 directors, Registered office proof, No criminal record, DSC required.",
    "USA": "USA Federal + State Business License Rules (2026): EIN, State LLC filing, Registered agent + address, No federal violations, Industry-specific licenses."
}

def auto_review_business_permit(file_path: str, country: str = "UAE", language: str = "English") -> dict:
    if country not in REGULATIONS:
        country = "UAE"
    if language not in ["English", "Arabic", "Hindi"]:
        language = "English"

    raw_data = extract_permit_data(file_path)
    masked = mask_pii(raw_data)
    text = masked.get("raw_text", "")

    prompt = f"""
    You are GovMind.AI — official AI permit reviewer for {country}.
    Regulations: {REGULATIONS[country]}
    Extracted data: {masked}
    Raw text: {text[:4000]}

    Respond ONLY in {language}.
    Return EXACT JSON (no extra text):
    {{"decision": "APPROVED" or "FLAGGED" or "REJECTED", "reason": "detailed explanation with rule references", "confidence": 0.XX (0.85-0.99), "trace": ["step1", "step2"]}}
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.0,
        max_tokens=600
    )

    content = response.choices[0].message.content.strip()
    try:
        result = json.loads(content)
    except:
        result = {"decision": "FLAGGED", "reason": "Parsing error - human review needed", "confidence": 0.90, "trace": []}

    audit_trace = log_audit_decision(result["decision"], result["reason"], result["confidence"])
    audit_trace["reviewed_by_model"] = f"groq-llama-3.3-70b-{country}-{language.lower()}"
    audit_trace["country"] = country
    audit_trace["response_language"] = language

    return {
        "decision": result["decision"],
        "masked_data": masked,
        "audit_trace": audit_trace,
        "human_review_link": f"/admin/permits/review?trace_id={audit_trace['trace_id']}"
    }