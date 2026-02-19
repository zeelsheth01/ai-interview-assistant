class AIService:

    def generate_questions(self, message: str):

        # Simulated AI output
        return [
            f"What is {message}?",
            f"Explain core concepts of {message}",
            f"Real-world use cases of {message}",
            f"Common interview questions about {message}"
        ]
