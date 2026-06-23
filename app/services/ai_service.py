from app.services.llm_provider import LLMProvider

class AIService:

    def generate_interview_questions(self, resume_text: str) -> str:
        prompt = f"""
        You are an expert technical interviewer.
        Based on the following resume text, generate exactly 10 technical interview questions.
        The questions should be relevant to the candidate's skills, frameworks, and experience.
        Return ONLY the questions, each on a new line. Do NOT include numbers, bullet points, headers, or any introductory text.
        
        Resume:
        {resume_text}
        """
        return LLMProvider.generate(prompt)

    def generate_questions(self, message: str) -> str:
        # Chat assistance: candidate preparation coaching
        prompt = f"""
        You are a supportive, knowledgeable AI Interview Coach.
        Help the candidate prepare for their technical interview.
        
        Candidate's message: "{message}"
        
        Answer their question clearly and provide code snippets or structured suggestions if applicable. Keep your reply concise, professional, and friendly.
        """
        return LLMProvider.generate(prompt)


# Backward compatibility global function
def generate_interview_questions(resume_text: str) -> str:
    service = AIService()
    return service.generate_interview_questions(resume_text)