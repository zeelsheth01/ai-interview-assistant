from sqlalchemy import Column, Integer, String, Text
from app.db.base import Base

class Resume(Base):

    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True)
    file_path = Column(String)
    result_json = Column(Text)
