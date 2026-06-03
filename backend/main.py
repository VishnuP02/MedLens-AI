# pyright: reportMissingImports=false

from fastapi import FastAPI, UploadFile, File
from openai_helper import test_openai
import pdfplumber

app = FastAPI()

@app.get("/")
def home():
    return {
        "project": "MedLens AI",
        "status": "running"
    }

@app.get("/test-ai")
def test_ai():
    return {
        "response": test_openai()
    }

@app.post("/analyze")
async def analyze_report(file: UploadFile = File(...)):
    extracted_text = ""

    with pdfplumber.open(file.file) as pdf:
        for page in pdf.pages:
            text = page.extract_text()

            if text:
                extracted_text += text + "\n"

    return {
        "filename": file.filename,
        "characters_extracted": len(extracted_text),
        "text_preview": extracted_text[:3000]
    }