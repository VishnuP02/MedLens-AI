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

Analyze the uploaded document.

If it is a medical report:
1. A plain-English summary
2. List key findings
3. Suggest questions for the doctor

If it is NOT a medical report:
1. Explain what type of document it is
2. Summarize its purpose
3. Highlight important information for the user

Keep your response concise, clear, and easy for a non-technical person to understand.

Document:
{report_text}
"""
    )

    return response.output_text