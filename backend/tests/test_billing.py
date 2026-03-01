"""
ORANGE — Billing Service Tests
"""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from app.services.billing_service import BillingService, PLANS


class TestBillingService:
    """Test suite for billing service."""

    @pytest.fixture
    def billing(self):
        return BillingService()

    def test_plans_configured(self):
        """All plans should be properly configured."""
        assert "starter" in PLANS
        assert "professional" in PLANS
        assert "enterprise" in PLANS

        for plan_id, plan in PLANS.items():
            assert "name" in plan
            assert "price_monthly" in plan
            assert "limits" in plan
            assert plan["price_monthly"] > 0
            assert "ocr_pages" in plan["limits"]
            assert "translate_words" in plan["limits"]
            assert "tts_minutes" in plan["limits"]

    def test_enterprise_has_highest_limits(self):
        """Enterprise should have highest or unlimited limits."""
        enterprise = PLANS["enterprise"]["limits"]
        professional = PLANS["professional"]["limits"]

        assert enterprise["ocr_pages"] == -1  # Unlimited
        assert enterprise["translate_words"] >= professional["translate_words"]
        assert enterprise["tts_minutes"] >= professional["tts_minutes"]

    def test_starter_no_batch(self):
        """Starter plan should not include batch processing."""
        assert PLANS["starter"]["limits"]["batch_processing"] is False

    def test_professional_has_batch(self):
        """Professional plan should include batch processing."""
        assert PLANS["professional"]["limits"]["batch_processing"] is True

    def test_professional_has_collab(self):
        """Professional plan should include collaboration."""
        assert PLANS["professional"]["limits"]["collaboration"] is True