from dotenv import load_dotenv
load_dotenv()

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
import os


# ------------------------------------------------
# Create model ONLY when needed
# ------------------------------------------------

def get_llm():
    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.3
    )


# ------------------------------------------------
# Prompt Template
# ------------------------------------------------

prompt = ChatPromptTemplate.from_template("""
You are an expert interviewer.

Based on this resume:

{resume_text}

Generate interview questions.
""")


# ------------------------------------------------
# AI Function
# ------------------------------------------------

async def generate_interview_questions(resume_text: str):

    llm = get_llm()   # ✅ create AFTER env loaded

    messages = prompt.format_messages(
        resume_text=resume_text
    )

    response = await llm.ainvoke(messages)

    return response.content
