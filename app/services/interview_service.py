from app.services.ai_service import AIService

class InterviewService:

    def __init__(self):
        self.ai = AIService()

    def process_chat(self, message: str):
        reply = self.ai.generate_questions(message)
        return {
            "reply": reply
        }
