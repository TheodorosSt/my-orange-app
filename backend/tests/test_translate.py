"""
ORANGE — Translation Service Tests
"""

import pytest
from unittest.mock import patch, MagicMock
from app.services.deepl_service import DeepLTranslator


class TestDeepLTranslator:
    """Test suite for translation service."""

    @pytest.fixture
    def translator(self):
        with patch("app.services.deepl_service.deepl.Translator"):
            return DeepLTranslator()

    @pytest.mark.asyncio
    async def test_translate_text(self, translator):
        """Should translate text correctly."""
        mock_result = MagicMock()
        mock_result.text = "Digital transformation is now essential."
        mock_result.detected_source_lang = "EL"

        translator.translator.translate_text.return_value = mock_result

        result = await translator.translate(
            text="Ο ψηφιακός μετασχηματισμός είναι πλέον απαραίτητος.",
            target_lang="EN-GB",
        )

        assert result["translated_text"] == "Digital transformation is now essential."
        assert result["source_lang"] == "EL"
        assert result["target_lang"] == "EN-GB"
        assert result["processing_time_ms"] >= 0

    @pytest.mark.asyncio
    async def test_auto_detect_language(self, translator):
        """Should auto-detect source language when not provided."""
        mock_result = MagicMock()
        mock_result.text = "Bonjour le monde"
        mock_result.detected_source_lang = "FR"

        translator.translator.translate_text.return_value = mock_result

        result = await translator.translate(
            text="Hello world",
            target_lang="FR",
            source_lang=None,
        )

        assert result["source_lang"] == "FR"

        # Verify translate_text was called with source_lang=None
        translator.translator.translate_text.assert_called_once()
        call_kwargs = translator.translator.translate_text.call_args
        assert call_kwargs.kwargs.get("source_lang") is None