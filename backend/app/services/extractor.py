import pdfplumber
from PIL import Image
import pytesseract
import json
from groq import Groq
import os

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def extract_permit_data(file_path: str) -> dict:
    text = ""
    try:
        if file_path.endswith(".pdf"):
            with pdfplumber.open(file_path) as pdf:
                text = "\n".join(page.extract_text() or "" for page in pdf.pages)
        else:
            img = Image.open(file_path)
            text = pytesseract.image_to_string(img)
    except Exception as e:
        text = f"Extraction error: {str(e)}"

    prompt = f"""
    Extract from this business permit document (UAE/India/USA formats supported).
    Text: {text[:3500]}
    Return ONLY JSON:
    {{"business_name": "...", "owner_name": "...", "tax_id": "...", "permit_type": "...", "documents": ["list", "of", "docs"], "raw_text": "first 400 chars..."}}
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0
        )
        data = json.loads(response.choices[0].message.content.strip())
    except:
        data = {"business_name": "Parse failed", "owner_name": "", "tax_id": "", "permit_type": "", "documents": [], "raw_text": text[:500]}

    data["raw_text"] = text[:500]
    return data