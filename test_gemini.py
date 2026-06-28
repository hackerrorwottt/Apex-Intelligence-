import os
from dotenv import load_dotenv
load_dotenv()
from google import genai

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

models_to_test = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash", "gemini-1.5-pro", "gemini-1.5-flash-latest"]

for m in models_to_test:
    try:
        response = client.models.generate_content(model=m, contents="say hi")
        print(f"SUCCESS: {m}")
        break
    except Exception as e:
        print(f"FAILED: {m} - {e}")
