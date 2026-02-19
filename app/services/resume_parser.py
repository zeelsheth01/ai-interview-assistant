import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
from app.services.ocr_parser import extract_text_from_image_pdf

# Windows path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def extract_text_from_image_pdf(file_path):

    text = ""

    # open PDF
    pdf = fitz.open(file_path)

    for page_num in range(len(pdf)):

        page = pdf.load_page(page_num)

        # convert page to image
        pix = page.get_pixmap(dpi=300)

        img_data = pix.tobytes("png")

        image = Image.open(io.BytesIO(img_data))

        # OCR
        page_text = pytesseract.image_to_string(image)

        text += page_text

    return text.strip()
