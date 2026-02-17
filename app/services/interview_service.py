from app.services.resume_parser import extract_text
from app.services.ai_service import analyze_resume


class InterviewService:

    async def process(self, file_path):

        text = extract_text(file_path)

        if not text:
            return {"error": "No text extracted from resume"}

        ai_result = analyze_resume(text)

        return ai_result
