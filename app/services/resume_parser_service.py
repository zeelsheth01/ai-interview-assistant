# app/services/resume_parser_service.py

from fastapi import UploadFile

async def extract_text(file: UploadFile):

    content = await file.read()

    # Example simple decoding (PDF parser etc can be added)
    text = content.decode("utf-8", errors="ignore")

    return text
