import pdfplumber
from PIL import Image
import pytesseract


def extract_permit_data(file_path: str) -> dict:
    text = ""
    try:
        if file_path.endswith(".pdf"):
            with pdfplumber.open(file_path) as pdf:
                text = "\n".join(
                    page.extract_text() or "" for page in pdf.pages
                )
        else:
            img = Image.open(file_path)
            text = pytesseract.image_to_string(img)
    except Exception as e:
        text = f"Extraction error: {str(e)}"

    return {
        "business_name": "Extracted from document",
        "owner_name": "Document Owner",
        "tax_id": "00-0000000",
        "documents": ["ID", "Lease", "Insurance"],
        "raw_text": text[:500]
    }
