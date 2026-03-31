import os
import json
from app.services.reviewer import auto_review_business_permit
from pathlib import Path

samples = Path("samples")
samples.mkdir(exist_ok=True)

# Add 5-10 real-looking PDF samples in /samples folder (you can generate with Canva or fake PDFs)

results = []
correct = 0
total = 0

for pdf in samples.glob("*.pdf"):
    # Assume ground truth in filename e.g. "UAE_approved_1.pdf"
    expected = "APPROVED" if "approved" in pdf.name.lower() else "FLAGGED"
    review = auto_review_business_permit(str(pdf), country="UAE", language="English")
    decision = review["decision"]
    total += 1
    if decision == expected:
        correct += 1
    results.append({"file": pdf.name, "decision": decision, "confidence": review["audit_trace"]["confidence"]})

accuracy = (correct / total * 100) if total else 0
report = {"accuracy": round(accuracy, 1), "total": total, "results": results}

with open("accuracy_report.json", "w") as f:
    json.dump(report, f, indent=2)

print(f"✅ Benchmark complete — {accuracy}% accuracy on {total} samples")