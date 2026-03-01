"""
ORANGE Platform — Stripe Billing Service

Plans:
  Starter     — €29/mo  — 100 pages OCR, 50K words translate, 30min audio
  Professional — €79/mo  — 500 pages OCR, 200K words translate, 120min audio, batch, collab
  Enterprise  — €199/mo — Unlimited OCR, 1M words translate, 500min audio, priority, API

Features:
- Stripe Checkout for subscription management
- Usage-based metering for overage
- Webhook handling for payment events
- Customer portal for self-service
"""

import stripe
import logging
from datetime import datetime, timezone

from app.config import get_settings

logger = logging.getLogger("orange.billing")

settings = get_settings()
stripe.api_key = settings.stripe_secret_key


# ===================================
# Plan Definitions
# ===================================

PLANS = {
    "starter": {
        "name": "Starter",
        "price_id": settings.stripe_price_starter,
        "price_monthly": 29,
        "currency": "eur",
        "limits": {
            "ocr_pages": 100,
            "translate_words": 50_000,
            "tts_minutes": 30,
            "vault_storage_gb": 5,
            "batch_processing": False,
            "collaboration": False,
            "api_access": False,
            "priority_support": False,
        },
    },
    "professional": {
        "name": "Professional",
        "price_id": settings.stripe_price_professional,
        "price_monthly": 79,
        "currency": "eur",
        "limits": {
            "ocr_pages": 500,
            "translate_words": 200_000,
            "tts_minutes": 120,
            "vault_storage_gb": 25,
            "batch_processing": True,
            "collaboration": True,
            "api_access": False,
            "priority_support": False,
        },
    },
    "enterprise": {
        "name": "Enterprise",
        "price_id": settings.stripe_price_enterprise,
        "price_monthly": 199,
        "currency": "eur",
        "limits": {
            "ocr_pages": -1,  # Unlimited
            "translate_words": 1_000_000,
            "tts_minutes": 500,
            "vault_storage_gb": 100,
            "batch_processing": True,
            "collaboration": True,
            "api_access": True,
            "priority_support": True,
        },
    },
}


class BillingService:
    """Stripe-powered billing and subscription management."""

    # ===================================
    # Customer Management
    # ===================================

    async def get_or_create_customer(
        self,
        user_id: str,
        email: str,
        name: str | None = None,
    ) -> str:
        """Get or create a Stripe customer for a user."""
        # Check if customer exists in Supabase
        from app.services.supabase_service import SupabaseVault
        vault = SupabaseVault()

        result = (
            vault.client.table("billing_customers")
            .select("stripe_customer_id")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )

        if result.data:
            return result.data["stripe_customer_id"]

        # Create Stripe customer
        customer = stripe.Customer.create(
            email=email,
            name=name,
            metadata={"user_id": user_id, "platform": "orange"},
        )

        # Store mapping
        vault.client.table("billing_customers").insert({
            "user_id": user_id,
            "stripe_customer_id": customer.id,
            "email": email,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }).execute()

        logger.info(f"Created Stripe customer {customer.id} for user {user_id}")
        return customer.id

    # ===================================
    # Checkout
    # ===================================

    async def create_checkout_session(
        self,
        user_id: str,
        email: str,
        plan: str,
        success_url: str,
        cancel_url: str,
    ) -> dict:
        """Create a Stripe Checkout session for subscription."""
        if plan not in PLANS:
            raise ValueError(f"Invalid plan: {plan}")

        customer_id = await self.get_or_create_customer(user_id, email)
        plan_config = PLANS[plan]

        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            mode="subscription",
            line_items=[{
                "price": plan_config["price_id"],
                "quantity": 1,
            }],
            success_url=success_url + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=cancel_url,
            metadata={
                "user_id": user_id,
                "plan": plan,
            },
            subscription_data={
                "metadata": {
                    "user_id": user_id,
                    "plan": plan,
                },
            },
            allow_promotion_codes=True,
            billing_address_collection="auto",
            tax_id_collection={"enabled": True},
        )

        logger.info(f"Checkout session created: {session.id} for plan {plan}")
        return {
            "session_id": session.id,
            "url": session.url,
        }

    # ===================================
    # Customer Portal
    # ===================================

    async def create_portal_session(
        self,
        user_id: str,
        email: str,
        return_url: str,
    ) -> dict:
        """Create a Stripe Customer Portal session for self-service."""
        customer_id = await self.get_or_create_customer(user_id, email)

        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=return_url,
        )

        return {"url": session.url}

    # ===================================
    # Subscription Status
    # ===================================

    async def get_subscription(self, user_id: str) -> dict | None:
        """Get current subscription details for a user."""
        from app.services.supabase_service import SupabaseVault
        vault = SupabaseVault()

        result = (
            vault.client.table("subscriptions")
            .select("*")
            .eq("user_id", user_id)
            .eq("status", "active")
            .maybe_single()
            .execute()
        )

        if not result.data:
            return None

        plan_id = result.data.get("plan")
        plan = PLANS.get(plan_id, PLANS["starter"])

        return {
            "plan": plan_id,
            "plan_name": plan["name"],
            "price_monthly": plan["price_monthly"],
            "currency": plan["currency"],
            "limits": plan["limits"],
            "status": result.data["status"],
            "current_period_end": result.data.get("current_period_end"),
            "cancel_at_period_end": result.data.get("cancel_at_period_end", False),
        }

    # ===================================
    # Usage Tracking
    # ===================================

    async def track_usage(
        self,
        user_id: str,
        service: str,
        quantity: int,
        unit: str,
    ) -> dict:
        """
        Track service usage for billing limits.

        Args:
            user_id: User ID
            service: 'ocr', 'translate', 'tts', 'vault'
            quantity: Amount used
            unit: 'pages', 'words', 'minutes', 'bytes'
        """
        from app.services.supabase_service import SupabaseVault
        vault = SupabaseVault()

        # Get current month's usage
        month_key = datetime.now(timezone.utc).strftime("%Y-%m")

        existing = (
            vault.client.table("usage_records")
            .select("*")
            .eq("user_id", user_id)
            .eq("service", service)
            .eq("month", month_key)
            .maybe_single()
            .execute()
        )

        if existing.data:
            new_total = existing.data["quantity"] + quantity
            vault.client.table("usage_records").update({
                "quantity": new_total,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }).eq("id", existing.data["id"]).execute()
        else:
            new_total = quantity
            vault.client.table("usage_records").insert({
                "user_id": user_id,
                "service": service,
                "unit": unit,
                "quantity": quantity,
                "month": month_key,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }).execute()

        # Check limits
        subscription = await self.get_subscription(user_id)
        if not subscription:
            # Free tier — very limited
            limit = 10 if service == "ocr" else 1000 if service == "translate" else 5
        else:
            limit_key = f"{service}_{'pages' if service == 'ocr' else 'words' if service == 'translate' else 'minutes'}"
            limit = subscription["limits"].get(limit_key, 0)

        is_over_limit = limit != -1 and new_total > limit

        return {
            "service": service,
            "used": new_total,
            "limit": limit,
            "over_limit": is_over_limit,
            "remaining": max(0, limit - new_total) if limit != -1 else -1,
        }

    async def get_usage_summary(self, user_id: str) -> dict:
        """Get usage summary for current billing period."""
        from app.services.supabase_service import SupabaseVault
        vault = SupabaseVault()

        month_key = datetime.now(timezone.utc).strftime("%Y-%m")

        result = (
            vault.client.table("usage_records")
            .select("*")
            .eq("user_id", user_id)
            .eq("month", month_key)
            .execute()
        )

        subscription = await self.get_subscription(user_id)
        limits = subscription["limits"] if subscription else PLANS["starter"]["limits"]

        usage = {}
        for record in result.data or []:
            service = record["service"]
            usage[service] = {
                "used": record["quantity"],
                "unit": record["unit"],
            }

        return {
            "month": month_key,
            "plan": subscription["plan"] if subscription else "free",
            "ocr": {
                "used": usage.get("ocr", {}).get("used", 0),
                "limit": limits["ocr_pages"],
                "unit": "pages",
            },
            "translate": {
                "used": usage.get("translate", {}).get("used", 0),
                "limit": limits["translate_words"],
                "unit": "words",
            },
            "tts": {
                "used": usage.get("tts", {}).get("used", 0),
                "limit": limits["tts_minutes"],
                "unit": "minutes",
            },
            "vault": {
                "used": usage.get("vault", {}).get("used", 0),
                "limit": limits["vault_storage_gb"],
                "unit": "GB",
            },
        }

    # ===================================
    # Webhook Handling
    # ===================================

    async def handle_webhook(self, payload: bytes, signature: str) -> dict:
        """Process Stripe webhook events."""
        try:
            event = stripe.Webhook.construct_event(
                payload,
                signature,
                settings.stripe_webhook_secret,
            )
        except (ValueError, stripe.error.SignatureVerificationError) as e:
            logger.error(f"Webhook error: {e}")
            raise ValueError("Invalid webhook")

        event_type = event["type"]
        data = event["data"]["object"]

        logger.info(f"Webhook received: {event_type}")

        from app.services.supabase_service import SupabaseVault
        vault = SupabaseVault()

        if event_type == "checkout.session.completed":
            # New subscription
            user_id = data["metadata"]["user_id"]
            plan = data["metadata"]["plan"]
            subscription_id = data.get("subscription")

            if subscription_id:
                sub = stripe.Subscription.retrieve(subscription_id)
                vault.client.table("subscriptions").upsert({
                    "user_id": user_id,
                    "stripe_subscription_id": subscription_id,
                    "plan": plan,
                    "status": sub.status,
                    "current_period_start": datetime.fromtimestamp(
                        sub.current_period_start, tz=timezone.utc
                    ).isoformat(),
                    "current_period_end": datetime.fromtimestamp(
                        sub.current_period_end, tz=timezone.utc
                    ).isoformat(),
                    "cancel_at_period_end": sub.cancel_at_period_end,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }).execute()

                logger.info(f"Subscription activated: user={user_id} plan={plan}")

        elif event_type == "customer.subscription.updated":
            subscription_id = data["id"]
            status = data["status"]
            plan = data["metadata"].get("plan", "starter")

            vault.client.table("subscriptions").update({
                "status": status,
                "plan": plan,
                "current_period_end": datetime.fromtimestamp(
                    data["current_period_end"], tz=timezone.utc
                ).isoformat(),
                "cancel_at_period_end": data.get("cancel_at_period_end", False),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }).eq("stripe_subscription_id", subscription_id).execute()

        elif event_type == "customer.subscription.deleted":
            subscription_id = data["id"]
            vault.client.table("subscriptions").update({
                "status": "canceled",
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }).eq("stripe_subscription_id", subscription_id).execute()

        elif event_type == "invoice.payment_failed":
            customer_id = data["customer"]
            logger.warning(f"Payment failed for customer {customer_id}")
            # Could send notification email here

        return {"event": event_type, "handled": True}