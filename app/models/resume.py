from sqlalchemy import Column, Integer, String, Text
from app.db.base import Base

class Resume(Base):

    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)

    file_name = Column(String)
    file_path = Column(String)

    extracted_text = Column(Text)

    result_json = Column(Text)