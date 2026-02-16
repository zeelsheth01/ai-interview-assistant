# ...existing code...
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import StructuredOutputParser, ResponseSchema
# ...existing code...

# ------------------------------------------------
# STEP 2 — Initialize Model
# ------------------------------------------------

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.3
)

# ------------------------------------------------
# STEP 3 — Structured Output
# ------------------------------------------------

response_schemas = [
    ResponseSchema(
        name="questions",
        description="List of interview questions"
    )
]

output_parser = StructuredOutputParser.from_response_schemas(response_schemas)

format_instructions = output_parser.get_format_instructions()

# ------------------------------------------------
# STEP 4 — Prompt Template
# ------------------------------------------------

prompt = ChatPromptTemplate.from_template("""
You are an expert interviewer.

Based on this resume:

{resume_text}

Generate interview questions.

{format_instructions}
""")

# ------------------------------------------------
# STEP 5 — AI Function
# ------------------------------------------------

async def generate_interview_questions(resume_text: str):

    messages = prompt.format_messages(
        resume_text=resume_text,
        format_instructions=format_instructions
    )

    response = await llm.ainvoke(messages)

    parsed_output = output_parser.parse(response.content)

    return parsed_output
