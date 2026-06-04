# pyright: reportMissingImports=false

from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


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
  "severity_level": "Normal | Mild Attention | Needs Review | Unknown",
  "summary": "",
  "key_findings": [],
  "questions_for_doctor": [],
  "important_notes": [],
  "lab_values": [
    {{
      "test_name": "",
      "result": "",
      "reference_range": "",
      "status": "Normal | Low | High | Borderline | Unknown",
      "explanation": ""
    }}
  ]
}}

Rules:
- If the document is medical, explain it in plain English.
- If lab values are present, extract them into lab_values.
- If no lab values are present, return an empty lab_values array.
- Do not diagnose.
- Do not tell the user to start or stop medication.
- Keep the language patient-friendly.
- Return only JSON. Do not include markdown.

Document:
{report_text}
"""
    )

    return response.output_text


def answer_follow_up(question, analysis_context):
    response = client.responses.create(
        model="gpt-4.1-mini",
        input=f"""
You are MedLens AI.

Answer the user's follow-up question using the medical report analysis context below.

Rules:
- Be clear and patient-friendly.
- Do not diagnose.
- Do not provide emergency medical advice.
- Encourage the user to speak with a healthcare professional for personal medical decisions.

Analysis Context:
{analysis_context}

User Question:
{question}
"""
    )

    return response.output_text