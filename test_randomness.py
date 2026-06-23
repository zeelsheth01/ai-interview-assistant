import fitz
import os
import json
from app.services.llm_provider import LLMProvider
from app.core.config import settings

# 1. Generate a mock PDF resume
def create_mock_resume(filename="demo_resume.pdf"):
    print(f"Creating mock PDF resume: {filename}...")
    doc = fitz.open()
    page = doc.new_page()
    
    resume_text = """
    Zack Miller
    zack.miller@email.com | +1 (555) 019-2834
    
    PROFESSIONAL SUMMARY
    Full Stack Software Engineer with 4 years of experience building scalable web applications.
    Specialized in React, Node.js, Python, PostgreSQL, and AWS deployment.
    
    TECHNICAL SKILLS
    - Languages: Python, JavaScript, TypeScript, SQL, HTML/CSS
    - Frameworks: React, FastAPI, Express.js, Tailwind CSS
    - Databases: PostgreSQL, SQLite, Redis
    - Tools: Docker, Git, AWS (S3, EC2), Prisma ORM
    
    EXPERIENCE
    Software Engineer | TechWave Solutions (2022 - Present)
    - Developed and optimized REST APIs using FastAPI and Python, decreasing latency by 20%.
    - Built interactive dashboard UI components in React and TypeScript.
    - Designed relational schemas and managed database migrations with Prisma ORM.
    - Implemented secure JWT-based user authentication and route protection.
    
    Associate Developer | ByteCraft Studio (2020 - 2022)
    - Created modular backend services using Node.js and Express.
    - Maintained PostgreSQL schemas and optimized complex SQL queries.
    """
    
    # Insert text on page
    page.insert_text((50, 50), resume_text, fontsize=11, lineheight=15)
    doc.save(filename)
    doc.close()
    print("Resume PDF created successfully.")
    return resume_text.strip()

# 2. Call Gemini twice and compare questions
def test_generation_randomness(resume_text):
    prompt = f"""
    You are an expert technical interviewer.
    Based on the following resume text, generate exactly 10 technical interview questions.
    The questions should focus on the candidate's skills, frameworks, and projects.
    Return ONLY the questions, one per line. Do NOT include numbers, bullet points, difficulty markers, or introductory text.
    
    Resume:
    {resume_text}
    """
    
    print("\n--- Running Run #1 (Gemini API) ---")
    run_1_raw = LLMProvider.generate(prompt)
    questions_1 = [q.strip() for q in run_1_raw.split("\n") if q.strip()][:10]
    
    print("\n--- Running Run #2 (Gemini API) ---")
    run_2_raw = LLMProvider.generate(prompt)
    questions_2 = [q.strip() for q in run_2_raw.split("\n") if q.strip()][:10]
    
    print("\n=== RUN 1 QUESTIONS ===")
    for idx, q in enumerate(questions_1):
        print(f"{idx+1}. {q}")
        
    print("\n=== RUN 2 QUESTIONS ===")
    for idx, q in enumerate(questions_2):
        print(f"{idx+1}. {q}")
        
    # Compare overlap
    overlap = set(questions_1).intersection(set(questions_2))
    unique_to_run_1 = set(questions_1) - set(questions_2)
    unique_to_run_2 = set(questions_2) - set(questions_1)
    
    print("\n=== STATISTICS ===")
    print(f"Total Run 1: {len(questions_1)} questions")
    print(f"Total Run 2: {len(questions_2)} questions")
    print(f"Direct identical match overlap count: {len(overlap)}")
    print(f"Unique questions generated in Run 1: {len(unique_to_run_1)}")
    print(f"Unique questions generated in Run 2: {len(unique_to_run_2)}")
    
    if len(overlap) < len(questions_1):
        print("\nResult: The questions are DYNAMIC/RANDOM! Gemini generates custom, unique sets of questions on each run rather than repeating the exact same list.")
    else:
        print("\nResult: The questions are identical (deterministic).")

if __name__ == "__main__":
    text = create_mock_resume()
    try:
        test_generation_randomness(text)
    except Exception as e:
        print(f"Test failed: {e}")
