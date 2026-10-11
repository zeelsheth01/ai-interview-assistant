from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.sql import func

from app.db.base import Base


class PaymentOrder(Base):
    __tablename__ = "payment_orders"

    id = Column(Integer, primary_key=True, index=True)
    razorpay_order_id = Column(String, unique=True, nullable=False, index=True)
    razorpay_payment_id = Column(String, unique=True, nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    amount_paise = Column(Integer, nullable=False)
    minutes = Column(Integer, nullable=False)
    status = Column(String, nullable=False, default="created", index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())


class MinuteUsage(Base):
    __tablename__ = "minute_usage"
    __table_args__ = (
        UniqueConstraint("user_id", "session_id", "minute_number", name="uq_user_session_minute"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    session_id = Column(String, nullable=False, index=True)
    minute_number = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
