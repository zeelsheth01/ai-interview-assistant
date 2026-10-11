import hashlib
import hmac
import logging
import secrets

import requests
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.config import settings
from app.db.dependencies import get_db
from app.models.payment import MinuteUsage, PaymentOrder
from app.models.schemas import (
    ConsumeMinuteRequest,
    CreatePaymentOrderRequest,
    VerifyPaymentRequest,
)
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/payments", tags=["payments"])


def _require_razorpay_credentials() -> tuple[str, str]:
    key_id = settings.RAZORPAY_KEY_ID
    key_secret = settings.RAZORPAY_KEY_SECRET
    if not key_id or not key_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the backend environment.",
        )
    return key_id, key_secret


def _wallet_balance(db: Session, user_id: int) -> dict[str, int]:
    purchased = db.query(func.coalesce(func.sum(PaymentOrder.minutes), 0)).filter(
        PaymentOrder.user_id == user_id,
        PaymentOrder.status == "paid",
    ).scalar()
    used = db.query(func.count(MinuteUsage.id)).filter(MinuteUsage.user_id == user_id).scalar()
    purchased_minutes = int(purchased or 0)
    used_minutes = int(used or 0)
    return {
        "minutes_purchased": purchased_minutes,
        "minutes_used": used_minutes,
        "minutes_available": max(0, purchased_minutes - used_minutes),
    }


def _lock_wallet(db: Session, user_id: int) -> None:
    if db.get_bind().dialect.name == "sqlite":
        db.execute(update(User).where(User.id == user_id).values(id=User.id))
    else:
        db.query(User).filter(User.id == user_id).with_for_update().one()


def _confirm_razorpay_payment(
    key_id: str,
    key_secret: str,
    payment_id: str,
    order: PaymentOrder,
) -> None:
    try:
        response = requests.get(
            f"https://api.razorpay.com/v1/payments/{payment_id}",
            auth=(key_id, key_secret),
            timeout=15,
        )
        response.raise_for_status()
        payment = response.json()
        if (
            payment.get("order_id") != order.razorpay_order_id
            or payment.get("amount") != order.amount_paise
            or payment.get("currency") != "INR"
        ):
            raise HTTPException(status_code=400, detail="The payment does not match this order.")

        if payment.get("status") == "authorized":
            response = requests.post(
                f"https://api.razorpay.com/v1/payments/{payment_id}/capture",
                auth=(key_id, key_secret),
                json={"amount": order.amount_paise, "currency": "INR"},
                timeout=15,
            )
            response.raise_for_status()
            payment = response.json()

        if payment.get("status") != "captured":
            raise HTTPException(status_code=409, detail="The payment has not been captured.")
    except requests.RequestException:
        logger.exception("Razorpay payment confirmation failed for order %s", order.razorpay_order_id)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Razorpay could not confirm the payment. Please retry confirmation before making another payment.",
        ) from None


@router.get("/balance")
def get_balance(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, int]:
    return _wallet_balance(db, user.id)


@router.get("/pricing")
def get_pricing() -> dict[str, int]:
    return {"price_per_minute_inr": settings.PRICE_PER_MINUTE_INR}


@router.post("/orders")
def create_order(
    data: CreatePaymentOrderRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, int | str]:
    key_id, key_secret = _require_razorpay_credentials()
    amount_paise = data.minutes * settings.PRICE_PER_MINUTE_INR * 100
    receipt = f"chiku_{user.id}_{secrets.token_hex(6)}"

    try:
        response = requests.post(
            "https://api.razorpay.com/v1/orders",
            auth=(key_id, key_secret),
            json={
                "amount": amount_paise,
                "currency": "INR",
                "receipt": receipt,
                "notes": {"user_id": str(user.id), "minutes": str(data.minutes)},
            },
            timeout=15,
        )
        response.raise_for_status()
        razorpay_order = response.json()
    except requests.RequestException:
        logger.exception("Razorpay order creation failed for user %s", user.id)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Razorpay could not create the payment order. Please try again.",
        ) from None

    order_id = razorpay_order.get("id")
    if (
        not isinstance(order_id, str)
        or razorpay_order.get("amount") != amount_paise
        or razorpay_order.get("currency") != "INR"
    ):
        logger.error("Razorpay returned an invalid order response for user %s", user.id)
        raise HTTPException(status_code=502, detail="Razorpay returned an invalid payment order.")

    order = PaymentOrder(
        razorpay_order_id=order_id,
        user_id=user.id,
        amount_paise=amount_paise,
        minutes=data.minutes,
    )
    try:
        db.add(order)
        db.commit()
    except IntegrityError:
        db.rollback()
        logger.exception("Could not save Razorpay order for user %s", user.id)
        raise HTTPException(status_code=500, detail="Could not save the payment order.") from None

    return {
        "key_id": key_id,
        "order_id": order_id,
        "amount": amount_paise,
        "currency": "INR",
        "minutes": data.minutes,
        "price_per_minute_inr": settings.PRICE_PER_MINUTE_INR,
    }


@router.post("/verify")
def verify_payment(
    data: VerifyPaymentRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, int | str]:
    key_id, key_secret = _require_razorpay_credentials()
    _lock_wallet(db, user.id)
    order = db.query(PaymentOrder).filter(
        PaymentOrder.razorpay_order_id == data.razorpay_order_id,
        PaymentOrder.user_id == user.id,
    ).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Payment order not found.")

    message = f"{data.razorpay_order_id}|{data.razorpay_payment_id}".encode()
    expected_signature = hmac.new(
        key_secret.encode(),
        message,
        hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(expected_signature, data.razorpay_signature):
        raise HTTPException(status_code=400, detail="Payment signature verification failed.")

    if order.status == "paid":
        if order.razorpay_payment_id != data.razorpay_payment_id:
            raise HTTPException(status_code=409, detail="This order was already paid using a different payment.")
        return {"status": "paid", **_wallet_balance(db, user.id)}

    _confirm_razorpay_payment(key_id, key_secret, data.razorpay_payment_id, order)
    order.status = "paid"
    order.razorpay_payment_id = data.razorpay_payment_id
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="This payment has already been applied.") from None

    return {"status": "paid", **_wallet_balance(db, user.id)}


@router.post("/usage")
def consume_minute(
    data: ConsumeMinuteRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, int | bool]:
    session_id = data.session_id.strip()
    if not session_id:
        raise HTTPException(status_code=422, detail="Session ID cannot be blank.")

    _lock_wallet(db, user.id)
    existing = db.query(MinuteUsage).filter(
        MinuteUsage.user_id == user.id,
        MinuteUsage.session_id == session_id,
        MinuteUsage.minute_number == data.minute_number,
    ).first()
    if existing is not None:
        return {"consumed": False, **_wallet_balance(db, user.id)}

    session_minutes = db.query(func.count(MinuteUsage.id)).filter(
        MinuteUsage.user_id == user.id,
        MinuteUsage.session_id == session_id,
    ).scalar()
    expected_minute = int(session_minutes or 0) + 1
    if data.minute_number != expected_minute:
        raise HTTPException(status_code=409, detail="Interview minute billing is out of sequence.")

    balance = _wallet_balance(db, user.id)
    if balance["minutes_available"] < 1:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="You are out of interview minutes. Purchase more minutes to continue.",
        )

    db.add(MinuteUsage(
        user_id=user.id,
        session_id=session_id,
        minute_number=data.minute_number,
    ))
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        existing = db.query(MinuteUsage).filter(
            MinuteUsage.user_id == user.id,
            MinuteUsage.session_id == session_id,
            MinuteUsage.minute_number == data.minute_number,
        ).first()
        if existing is None:
            raise HTTPException(status_code=409, detail="Could not charge the interview minute.") from None
        return {"consumed": False, **_wallet_balance(db, user.id)}

    return {"consumed": True, **_wallet_balance(db, user.id)}
