from app.services.resume_parser import extract_text
from app.services.ai_service import analyze_resume


class InterviewService:

    async def process(self, file_path: str):

        try:
            # Step 1 — Extract resume text
            text = extract_text(file_path)

            if not text:
                return {"error": "Could not extract text from resume"}

            # Step 2 — AI analysis
            ai_result = await analyze_resume(text)

            return ai_result

        except Exception as e:
            return {"error": str(e)}
