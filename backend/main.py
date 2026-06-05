# pyright: reportMissingImports=false

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai_helper import test_openai, explain_medical_report, answer_follow_up
import pdfplumber
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    question: str
    analysis_context: dict


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
    print("STEP 1: File received - main.py:46")

    if not file.filename.lower().endswith(".pdf"):
        return {
            "error": "Only PDF files are supported."
        }

    extracted_text = ""

    print("STEP 2: Starting PDF extraction - main.py:55")

    with pdfplumber.open(file.file) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                extracted_text += text + "\n"

    print("STEP 3: PDF text extracted - main.py:63")
    print("Characters extracted: - main.py:64", len(extracted_text))

    if not extracted_text.strip():
        return {
            "filename": file.filename,
            "characters_extracted": 0,
            "error": "No readable text was found in this PDF. OCR support is planned for a future version."
        }

    print("STEP 4: Sending to OpenAI - main.py:73")

    analysis_text = explain_medical_report(extracted_text[:4000])

    print("STEP 5: OpenAI response received - main.py:77")

    try:
        analysis = json.loads(analysis_text)
        print("STEP 6: JSON parsed successfully - main.py:81")
    except json.JSONDecodeError:
        print("STEP 6: JSON parsing failed - main.py:83")
        analysis = {
            "document_type": "Unknown",
            "severity_level": "Unknown",
            "summary": analysis_text,
            "key_findings": [],
            "questions_for_doctor": [],
            "important_notes": [
                "The AI response could not be parsed into structured JSON."
            ],
            "lab_values": []
        }

    print("STEP 7: Returning response - main.py:96")

    return {
        "filename": file.filename,
        "characters_extracted": len(extracted_text),
        "analysis": analysis
    }


@app.post("/chat")
def chat_with_report(request: ChatRequest):
    response = answer_follow_up(
        question=request.question,
        analysis_context=request.analysis_context
    )

    return {
        "answer": response
    }