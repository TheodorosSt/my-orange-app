"""
ORANGE — OCR Service Tests
"""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.google_vision import GoogleVisionOCR


class TestGoogleVisionOCR:
    """Test suite for OCR service."""

    @pytest.fixture
    def ocr(self):
        with patch("app.services.google_vision.vision.ImageAnnotatorClient"):
            return GoogleVisionOCR()

    @pytest.mark.asyncio
    async def test_process_image_returns_text(self, ocr):
        """Should extract text from an image."""
        mock_response = MagicMock()
        mock_response.error.message = ""
        mock_response.full_text_annotation.text = "Test κείμενο"
        mock_response.full_text_annotation.pages = [MagicMock()]

        # Mock nested structure
        mock_symbol = MagicMock()
        mock_symbol.text = "T"
        mock_symbol.confidence = 0.99

        mock_word = MagicMock()
        mock_word.symbols = [mock_symbol]

        mock_para = MagicMock()
        mock_para.words = [mock_word]

        mock_block = MagicMock()
        mock_block.paragraphs = [mock_para]
        mock_block.bounding_box.vertices = [
            MagicMock(x=0, y=0), MagicMock(x=100, y=0),
            MagicMock(x=100, y=50), MagicMock(x=0, y=50),
        ]

        mock_page = MagicMock()
        mock_page.blocks = [mock_block]
        mock_page.property.detected_languages = [MagicMock(language_code="el")]

        mock_response.full_text_annotation.pages = [mock_page]

        ocr.client.document_text_detection.return_value = mock_response

        result = await ocr.extract_text(b"fake_image_data", "image/png")

        assert result["text"] == "Test κείμενο"
        assert result["confidence"] > 0
        assert result["language"] == "el"
        assert "processing_time_ms" in result

    @pytest.mark.asyncio
    async def test_empty_image_returns_empty(self, ocr):
        """Should handle empty OCR result."""
        mock_response = MagicMock()
        mock_response.error.message = ""
        mock_response.full_text_annotation.text = ""
        mock_response.full_text_annotation.pages = []

        ocr.client.document_text_detection.return_value = mock_response

        result = await ocr.extract_text(b"empty_image", "image/png")

        assert result["text"] == ""
        assert result["word_count"] == 0
        assert result["confidence"] == 0.0

    @pytest.mark.asyncio
    async def test_api_error_raises(self, ocr):
        """Should raise on API error."""
        mock_response = MagicMock()
        mock_response.error.message = "Quota exceeded"

        ocr.client.document_text_detection.return_value = mock_response

        with pytest.raises(RuntimeError, match="Quota exceeded"):
            await ocr.extract_text(b"data", "image/png")