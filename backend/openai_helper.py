# pyright: reportMissingImports=false

from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

def test_openai():
    response = client.responses.create(
        model="gpt-4.1-mini",
        input="In one sentence, explain what MedLens AI is."
    )

    return response.output_text


def explain_medical_report(report_text):
    response = client.responses.create(
        model="gpt-4.1-mini",
        input=f"""
You are MedLens AI.

Analyze the uploaded document and return ONLY valid JSON.

Use this exact structure:

{{
  "document_type": "",
  "summary": "",
  "key_findings": [],
  "questions_for_doctor": [],
  "important_notes": []
}}

Rules:
- If the document is medical, explain it in plain English.
- If the document is not medical, identify the document type and summarize it.
- Do not diagnose.
- Do not tell the user to start or stop medication.
- Keep the language patient-friendly.
- Return only JSON. Do not include markdown.

Document:
{report_text}
"""
    )

    return response.output_text