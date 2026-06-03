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