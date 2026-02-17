import pdfplumber
from PyPDF2 import PdfReader

from pdf2image import convert_from_path
import pytesseract

# Windows Tesseract path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def extract_text(file_path: str):

    text = ""

    # ---------- METHOD 1: pdfplumber ----------
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print("pdfplumber failed:", e)

    # ---------- METHOD 2: PyPDF2 fallback ----------
    if not text:
        try:
            reader = PdfReader(file_path)
            for page in reader.pages:
                text += page.extract_text() or ""
        except Exception as e:
            print("PyPDF2 failed:", e)

    # ---------- METHOD 3: OCR fallback ----------
    if not text:

        print("🔥 USING OCR FALLBACK")

        try:
            images = convert_from_path(file_path)

            for img in images:
                text += pytesseract.image_to_string(img)

        except Exception as e:
            print("OCR failed:", e)

    print("FINAL TEXT:", text)

    return text.strip()
