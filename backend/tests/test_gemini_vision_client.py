from unittest.mock import MagicMock, patch

import httpx
import pytest

from services import gemini_vision_client
from services.gemini_vision_client import (
    GeminiVisionError,
    GeminiVisionTimeout,
    call_gemini_vision,
)


def _response(status_code, json_data=None, text=""):
    resp = MagicMock()
    resp.status_code = status_code
    resp.text = text
    if json_data is not None:
        resp.json.return_value = json_data
    return resp


def _success_payload(text="extracted"):
    return {"candidates": [{"content": {"parts": [{"text": text}]}}]}


def _call(api_key="key", model="primary-model", timeout=10.0):
    return call_gemini_vision("prompt", b"file-bytes", "image/png", api_key, model, timeout)


class TestCallGeminiVision:
    def test_missing_api_key_raises_without_calling_api(self):
        with patch.object(gemini_vision_client.httpx, "post") as mock_post:
            with pytest.raises(GeminiVisionError, match="AI_VISION_API_KEY"):
                _call(api_key="")
        mock_post.assert_not_called()

    def test_success_on_primary_model(self):
        resp = _response(200, _success_payload("struk terbaca"))
        with patch.object(gemini_vision_client.httpx, "post", return_value=resp) as mock_post:
            result = _call()
        assert result == "struk terbaca"
        assert mock_post.call_count == 1

    def test_timeout_on_primary_raises_without_retry_or_fallback(self):
        with patch.object(
            gemini_vision_client.httpx,
            "post",
            side_effect=httpx.TimeoutException("timed out"),
        ) as mock_post:
            with pytest.raises(GeminiVisionTimeout):
                _call()
        assert mock_post.call_count == 1

    def test_transient_status_on_primary_falls_back_and_succeeds(self):
        transient = _response(503, text="overloaded")
        success = _response(200, _success_payload("fallback hasil"))
        with patch.object(
            gemini_vision_client.httpx, "post", side_effect=[transient, success]
        ) as mock_post:
            result = _call()
        assert result == "fallback hasil"
        assert mock_post.call_count == 2
        fallback_call_url = mock_post.call_args_list[1].args[0]
        assert gemini_vision_client.GEMINI_VISION_FALLBACK_MODEL in fallback_call_url

    def test_transient_on_both_models_raises_friendly_message_not_raw_body(self):
        transient1 = _response(429, text='{"raw": "google 429 json"}')
        transient2 = _response(429, text='{"raw": "google 429 json again"}')
        with patch.object(
            gemini_vision_client.httpx, "post", side_effect=[transient1, transient2]
        ):
            with pytest.raises(GeminiVisionError) as excinfo:
                _call()
        assert "google 429 json" not in str(excinfo.value)

    def test_non_transient_error_status_raises_friendly_message_not_raw_body(self):
        resp = _response(403, text="Raw forbidden detail from Google")
        with patch.object(gemini_vision_client.httpx, "post", return_value=resp):
            with pytest.raises(GeminiVisionError) as excinfo:
                _call()
        assert "Raw forbidden detail" not in str(excinfo.value)

    def test_malformed_response_shape_raises_friendly_message_not_raw_dict(self):
        resp = _response(200, {"unexpected": "shape"})
        with patch.object(gemini_vision_client.httpx, "post", return_value=resp):
            with pytest.raises(GeminiVisionError) as excinfo:
                _call()
        assert "unexpected" not in str(excinfo.value)

    def test_request_error_on_both_models_raises_friendly_message(self):
        with patch.object(
            gemini_vision_client.httpx,
            "post",
            side_effect=httpx.RequestError("connection refused"),
        ):
            with pytest.raises(GeminiVisionError) as excinfo:
                _call()
        assert "connection refused" not in str(excinfo.value)
