import pdfplumber
from pdf2image import convert_from_path
import pytesseract

# Windows paths
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
POPPLER_PATH = r"C:\poppler\Library\bin"


def extract_resume_text(file_path: str):

    text = ""

    # ----- Try normal extraction -----
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text
    except:
        pass

    # ----- OCR fallback -----
    if len(text.strip()) == 0:

        print("🔥 Using OCR extraction...")

        images = convert_from_path(
            file_path,
            dpi=300,
            poppler_path=POPPLER_PATH
        )

        for img in images:
            text += pytesseract.image_to_string(img)

    return text.strip()
