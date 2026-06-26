import random
from fastapi import APIRouter, UploadFile, File
import os
import fitz
import json

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.user import User
from app.models.resume import Resume
from app.models.skill import Skill
from app.models.interview_question import InterviewQuestion
from app.services.llm_provider import LLMProvider

router = APIRouter()

UPLOAD_DIR = "app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

FALLBACK_QUESTIONS = {
    "React": [
        "Explain the difference between class components and functional components in React.",
        "What are React Hooks? Explain useState, useEffect, and custom hooks.",
        "How does the Virtual DOM work in React, and how does it optimize performance?",
        "Explain React context API and when you would use Redux or Zustand instead.",
        "What is the difference between controlled and uncontrolled components in React?",
        "Explain React.memo and useMemo. When should you use them?"
    ],
    "Next.js": [
        "Explain the difference between Server-Side Rendering (SSR) and Static Site Generation (SSG) in Next.js.",
        "What are Next.js Server Components and client components, and how do they differ?",
        "Explain routing in Next.js (App Router vs Pages Router).",
        "How does incremental static regeneration (ISR) work in Next.js?",
        "Explain middleware in Next.js and how it can be used for authentication/redirects."
    ],
    "Node.js": [
        "Explain the event loop in Node.js and how it handles asynchronous I/O operations.",
        "What is the difference between setImmediate(), setTimeout(), and process.nextTick()?",
        "How do streams work in Node.js, and what are their benefits over buffered operations?",
        "What are child processes and worker threads in Node.js? When should you use each?",
        "Explain error handling patterns in Node.js (callbacks, promises, async/await)."
    ],
    "Express": [
        "What is middleware in Express, and how do you write a custom logging or auth middleware?",
        "Explain route handling and error-handling middleware in Express.",
        "How do you handle file uploads in Express using Multer or similar packages?",
        "Explain how to secure an Express API using helmet, CORS, and rate limiting."
    ],
    "JavaScript": [
        "Explain closures in JavaScript and provide a practical use-case.",
        "What is prototype inheritance in JavaScript and how does it work?",
        "Explain the difference between let, const, and var, and the concept of hoisting.",
        "What is the difference between '==' and '===' in JavaScript?",
        "Explain Promises and how async/await simplifies asynchronous code in JS.",
        "What is event delegation and bundling in the DOM?"
    ],
    "TypeScript": [
        "Explain the difference between interface and type in TypeScript.",
        "What are generics in TypeScript and how do you write a generic function?",
        "Explain utility types in TypeScript (like Partial, Omit, Pick, and Readonly).",
        "What are union types, intersection types, and type guards in TypeScript?"
    ],
    "Python": [
        "Explain the difference between list and tuple in Python.",
        "What is a decorator in Python and how do you write one?",
        "Explain generators and the yield keyword in Python.",
        "What is the GIL (Global Interpreter Lock) in Python and how does it affect concurrency?",
        "Explain list comprehensions, dictionary comprehensions, and generator expressions."
    ],
    "FastAPI": [
        "What are path parameters and query parameters in FastAPI, and how do they differ?",
        "Explain dependency injection in FastAPI and why it is useful.",
        "How does FastAPI leverage Pydantic for request validation and serialization?",
        "Explain middleware in FastAPI and how you can run code before or after requests."
    ],
    "Django": [
        "Explain the MVC/MVT architecture pattern in Django.",
        "What is Django ORM and how does it handle database migrations?",
        "Explain the difference between select_related and prefetch_related in Django ORM.",
        "What is middleware in Django and how the request/response lifecycle work?"
    ],
    "Flask": [
        "Explain the request lifecycle in Flask and what application context vs request context is.",
        "How do you perform database migrations in Flask using Flask-Migrate or Alembic?",
        "Explain blueprints in Flask and how they help organize large projects."
    ],
    "Java": [
        "Explain the principles of OOP (Object-Oriented Programming) in Java.",
        "What is the difference between abstract class and interface in Java?",
        "Explain the Java Garbage Collection mechanism and how it works.",
        "What is the difference between HashMap and ConcurrentHashMap in Java?"
    ],
    "Spring Boot": [
        "What is Dependency Injection and Inversion of Control (IoC) in Spring Boot?",
        "Explain the differences between @Component, @Service, and @Repository annotations.",
        "How do you handle global exceptions in Spring Boot using @ControllerAdvice?",
        "Explain JPA and Hibernate. How do you implement custom queries?"
    ],
    "PostgreSQL": [
        "What is the difference between INNER JOIN, LEFT JOIN, and outer joins in PostgreSQL?",
        "Explain database normalization and the levels (1NF, 2NF, 3NF).",
        "What are indexes in PostgreSQL and how do B-Tree indexes improve query speed?",
        "Explain transactions, ACID properties, and transaction isolation levels in PostgreSQL."
    ],
    "MySQL": [
        "Explain the difference between InnoDB and MyISAM storage engines in MySQL.",
        "How do you optimize slow queries in MySQL? What tools would you use?",
        "Explain foreign keys, cascade deletes, and database constraints in MySQL."
    ],
    "MongoDB": [
        "Explain the difference between SQL and NoSQL databases, specifically using MongoDB.",
        "What are indexes in MongoDB and how do they optimize lookup performance?",
        "Explain aggregation pipelines in MongoDB and provide a use case.",
        "How does document modeling (embedded vs reference) work in MongoDB?"
    ],
    "Redis": [
        "What is Redis and what are its primary use cases (caching, pub/sub, queues)?",
        "Explain Redis data types (strings, lists, sets, hashes, sorted sets).",
        "How does Redis persist data to disk (RDB snapshots vs AOF logs)?"
    ],
    "Docker": [
        "What is the difference between a Docker image and a Docker container?",
        "Explain the purpose of Dockerfile instructions: COPY, ADD, RUN, and CMD.",
        "What are Docker volumes and why are they used to manage persistent data?",
        "Explain Docker Compose and how it helps run multi-container applications."
    ],
    "AWS": [
        "Explain the difference between Amazon EC2, AWS Lambda, and ECS.",
        "What is Amazon S3 and how do buckets, prefixes, and lifecycle policies work?",
        "Explain IAM (Identity and Access Management) policies, roles, and users in AWS.",
        "What is a VPC, and what are public vs private subnets?"
    ],
    "Firebase": [
        "What is Firebase Firestore and how does it handle real-time data sync?",
        "Explain Firebase Authentication and how to secure paths in Firestore using rules."
    ],
    "Git": [
        "Explain the difference between git merge and git rebase.",
        "What is a merge conflict and how do you resolve it in Git?",
        "Explain git stash, git cherry-pick, and git reset (soft, mixed, hard)."
    ],
    "GitHub": [
        "Explain pull requests, reviews, and branching strategies in GitHub flow."
    ],
    "HTML": [
        "What are semantic HTML5 tags and why are they important for SEO and accessibility?",
        "Explain the difference between inline and block-level elements in HTML."
    ],
    "CSS": [
        "Explain the CSS Box Model and how box-sizing affects layout width.",
        "What is the difference between Flexbox and CSS Grid? When would you use each?",
        "Explain CSS selectors, specificity rules, and inheritance."
    ],
    "Tailwind CSS": [
        "Explain the utility-first CSS concept and how it benefits developer velocity.",
        "How does Tailwind build process purge unused styles in production?"
    ],
    "Bootstrap": [
        "Explain the grid system in Bootstrap and how responsive breakpoints work."
    ],
    "Flutter": [
        "Explain the difference between StatelessWidget and StatefulWidget in Flutter.",
        "How does state management work in Flutter (Provider, Bloc, or Riverpod)?"
    ],
    "React Native": [
        "Explain how the React Native bridge connects JavaScript code to native UI elements.",
        "What is the difference between React Native and native iOS/Android development?"
    ],
    "Angular": [
        "Explain components, modules, and services in Angular.",
        "What is two-way data binding in Angular and how does it work?"
    ],
    "C": [
        "Explain pointers in C, memory allocation using malloc/free, and memory leaks.",
        "What is the difference between a structure (struct) and a union in C?"
    ],
    "C++": [
        "Explain virtual functions, polymorphism, and runtime binding in C++.",
        "What is RAII (Resource Acquisition Is Initialization) in C++?"
    ],
    "REST API": [
        "What are HTTP request methods (GET, POST, PUT, DELETE, PATCH) and their semantic uses?",
        "Explain HTTP status code categories (2xx, 3xx, 4xx, 5xx) and common examples.",
        "What is the difference between REST API and GraphQL?"
    ]
}

GENERAL_FALLBACK_QUESTIONS = [
    "Explain the concept of Object-Oriented Programming (OOP) and its core pillars.",
    "What is the difference between a process and a thread in operating systems?",
    "Explain the MVC (Model-View-Controller) architecture pattern.",
    "How does JWT (JSON Web Token) authentication work securely in APIs?",
    "Explain the concept of software testing (unit tests, integration tests, E2E tests).",
    "What are SOLID design principles? Explain at least two of them.",
    "Explain how a web browser renders a page starting from entering the URL.",
    "What is CORS (Cross-Origin Resource Sharing) and how do you resolve CORS errors?",
    "Explain the concept of CI/CD and how it fits into software development pipelines.",
    "What is the difference between symmetric and asymmetric encryption?",
    "Explain the concept of API rate limiting and how it protects servers.",
    "What is the difference between monorepo and multirepo structures?"
]

def get_randomized_fallback_questions(skills_list: list[str], num_questions: int) -> list[str]:
    selected_questions = []
    
    # 1. Filter our fallback keys to see which match the candidate's skills
    matched_skills = [s for s in skills_list if s in FALLBACK_QUESTIONS]
    
    # Shuffle matched skills so we don't always pick React first
    random.shuffle(matched_skills)
    
    # 2. Pick questions from matched skills first (round robin to ensure variety)
    skill_pools = {s: list(FALLBACK_QUESTIONS[s]) for s in matched_skills}
    for s in skill_pools:
        random.shuffle(skill_pools[s])
        
    while len(selected_questions) < num_questions and matched_skills:
        skills_to_remove = []
        for s in matched_skills:
            if skill_pools[s]:
                q = skill_pools[s].pop(0)
                if q not in selected_questions:
                    selected_questions.append(q)
                if len(selected_questions) == num_questions:
                    break
            else:
                skills_to_remove.append(s)
        
        for s in skills_to_remove:
            matched_skills.remove(s)
            
    # 3. If we still need more questions, select from the general pool
    general_pool = list(GENERAL_FALLBACK_QUESTIONS)
    random.shuffle(general_pool)
    
    while len(selected_questions) < num_questions and general_pool:
        q = general_pool.pop(0)
        if q not in selected_questions:
            selected_questions.append(q)
            
    # 4. If we are still short, repeat questions as last resort
    while len(selected_questions) < num_questions:
        selected_questions.append(random.choice(GENERAL_FALLBACK_QUESTIONS))
        
    # Final shuffle
    random.shuffle(selected_questions)
    return selected_questions



def extract_resume_text(file_path: str) -> str:
    text = ""

    try:
        doc = fitz.open(file_path)

        for page in doc:
            page_text = page.get_text()

            if page_text:
                text += page_text + "\n"

    except Exception as e:
        print(f"PyMuPDF extraction failed: {e}")

    return text


def extract_skills(resume_text: str):
    known_skills = [
        "React",
        "Next.js",
        "Node.js",
        "Express",
        "JavaScript",
        "TypeScript",
        "Python",
        "FastAPI",
        "Django",
        "Flask",
        "Java",
        "Spring Boot",
        "PostgreSQL",
        "MySQL",
        "MongoDB",
        "Redis",
        "Docker",
        "AWS",
        "Firebase",
        "Git",
        "GitHub",
        "HTML",
        "CSS",
        "Tailwind CSS",
        "Bootstrap",
        "Flutter",
        "React Native",
        "Angular",
        "C",
        "C++",
        "REST API"
    ]

    found_skills = []

    for skill in known_skills:
        if skill.lower() in resume_text.lower():
            found_skills.append(skill)

    return list(set(found_skills))


@router.post("/resume/upload")
async def upload_resume(file: UploadFile = File(...), num_questions: int = 10):

    db: Session = SessionLocal()

    try:
        file_path = os.path.join(
            UPLOAD_DIR,
            file.filename
        )

        with open(file_path, "wb") as f:
            f.write(await file.read())

        resume_text = extract_resume_text(file_path)

        skills_list = extract_skills(resume_text)

        prompt = f"""
Generate exactly {num_questions} technical interview questions.

Resume:
{resume_text}
"""

        try:
            questions_text = LLMProvider.generate(prompt)
            questions_list = [
                q.strip()
                for q in questions_text.split("\n")
                if q.strip()
            ][:num_questions]

        except Exception as e:
            print("LLM Error:", e)
            # Fall back to randomized questions matching extracted skills
            questions_list = get_randomized_fallback_questions(skills_list, num_questions)

        user = db.query(User).first()

        if not user:
            user = User(
                email="test@gmail.com",
                password="password"
            )

            db.add(user)
            db.commit()
            db.refresh(user)

        resume = Resume(
            file_name=file.filename,
            file_path=file_path,
            extracted_text=resume_text,
            result_json=json.dumps(
                {
                    "questions": questions_list,
                    "skills": skills_list
                }
            )
        )

        db.add(resume)
        db.commit()
        db.refresh(resume)

        for question in questions_list:
            db.add(
                InterviewQuestion(
                    resume_id=resume.id,
                    question=question
                )
            )

        for skill in skills_list:
            db.add(
                Skill(
                    resume_id=resume.id,
                    skill_name=skill,
                    confidence_score=1.0
                )
            )

        db.commit()

        return {
            "msg": "Resume uploaded successfully",
            "resume_id": resume.id,
            "questions": questions_list,
            "skills": skills_list
        }

    finally:
        db.close()


@router.get("/resume/{resume_id}")
async def get_resume(resume_id: int):

    db: Session = SessionLocal()

    try:
        resume = (
            db.query(Resume)
            .filter(Resume.id == resume_id)
            .first()
        )

        if not resume:
            return {
                "questions": [],
                "skills": []
            }

        questions = (
            db.query(InterviewQuestion)
            .filter(
                InterviewQuestion.resume_id == resume_id
            )
            .all()
        )

        skills = (
            db.query(Skill)
            .filter(
                Skill.resume_id == resume_id
            )
            .all()
        )

        return {
            "questions": [
                q.question for q in questions
            ],
            "skills": [
                s.skill_name for s in skills
            ]
        }

    finally:
        db.close()