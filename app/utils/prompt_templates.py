prompt = ChatPromptTemplate.from_template("""
You are an expert interviewer.

Based on this resume:

{resume_text}

Generate interview questions.

{format_instructions}
""")
