import fitz  # PyMuPDF
import pytesseract
from PIL import Image


def extract_text_from_image_pdf(pdf_path):

    text = ""

    doc = fitz.open(pdf_path)

    for page in doc:

        pix = page.get_pixmap()

        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

        page_text = pytesseract.image_to_string(img)

        text += page_text + "\n"

    print("OCR TEXT LENGTH:", len(text))
    print("OCR TEXT PREVIEW:", text[:200])

    return text
