"""
ORANGE Platform — Billing Router
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from app.services.billing_service import BillingService, PLANS
from app.middleware.auth import get_current_user

router = APIRouter()


class CheckoutRequest(BaseModel):
    plan: str
    success_url: str
    cancel_url: str


@router.get("/plans")
async def get_plans():
    """Get available subscription plans."""
    return {
        "plans": {
            plan_id: {
                "name": plan["name"],
                "price_monthly": plan["price_monthly"],
                "currency": plan["currency"],
                "limits": plan["limits"],
            }
            for plan_id, plan in PLANS.items()
        }
    }


@router.post("/checkout")
async def create_checkout(
    request: CheckoutRequest,
    user: dict = Depends(get_current_user),
):
    """Create Stripe Checkout session."""
    billing = BillingService()
    return await billing.create_checkout_session(
        user_id=user["id"],
        email=user["email"],
        plan=request.plan,
        success_url=request.success_url,
        cancel_url=request.cancel_url,
    )


@router.post("/portal")
async def create_portal(
    user: dict = Depends(get_current_user),
):
    """Create Stripe Customer Portal session."""
    billing = BillingService()
    return await billing.create_portal_session(
        user_id=user["id"],
        email=user["email"],
        return_url=f"{user.get('origin', '')}/settings",
    )


@router.get("/subscription")
async def get_subscription(
    user: dict = Depends(get_current_user),
):
    """Get current subscription."""
    billing = BillingService()
    sub = await billing.get_subscription(user["id"])
    if not sub:
        return {"plan": "free", "status": "none", "limits": PLANS["starter"]["limits"]}
    return sub


@router.get("/usage")
async def get_usage(
    user: dict = Depends(get_current_user),
):
    """Get current period usage summary."""
    billing = BillingService()
    return await billing.get_usage_summary(user["id"])


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events."""
    payload = await request.body()
    signature = request.headers.get("stripe-signature", "")

    billing = BillingService()
    try:
        result = await billing.handle_webhook(payload, signature)
        return result
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid webhook")