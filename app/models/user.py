from sqlalchemy import Column, Integer, String
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String, unique=True, index=True)

    password = Column(String, nullable=True)

    google_id = Column(String, nullable=True)

    full_name = Column(String, nullable=True)