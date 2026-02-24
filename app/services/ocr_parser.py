# import fitz  # PyMuPDF
# import pytesseract
# from PIL import Image


# def extract_text_from_image_pdf(pdf_path):

#     text = ""

#     doc = fitz.open(pdf_path)

#     for page in doc:

#         pix = page.get_pixmap()

#         img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

#         page_text = pytesseract.image_to_string(img)

#         text += page_text + "\n"

#     print("OCR TEXT LENGTH:", len(text))
#     print("OCR TEXT PREVIEW:", text[:200])

#     return text

import requests


def generate_questions(resume_text: str):

    print("===== SENDING TO OLLAMA =====")
    print("Resume preview:", resume_text[:200])

    prompt = f"""
Generate technical interview questions ONLY based on this resume:

{resume_text}

Return only questions.
"""

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            },
            timeout=60
        )

        # Check HTTP status
        response.raise_for_status()

        data = response.json()

        print("===== OLLAMA RAW RESPONSE =====")
        print(data)

        # SAFE RETURN (prevents KeyError crash)
        return data.get("response", "No response from Ollama")

    except requests.exceptions.RequestException as e:
        print("Ollama API error:", str(e))
        return "Error connecting to Ollama"

    except Exception as e:
        print("Unexpected error:", str(e))
        return "Error generating interview questions"
