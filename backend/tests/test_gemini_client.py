from unittest.mock import MagicMock, patch

import httpx
import pytest

from services import gemini_client
from services.gemini_client import GeminiError, generate_json_text


def _response(status_code, json_data=None, text=""):
    resp = MagicMock()
    resp.status_code = status_code
    resp.text = text
    if json_data is not None:
        resp.json.return_value = json_data
    return resp


def _success_payload(text="hello", finish_reason="STOP"):
    return {
        "candidates": [
            {"content": {"parts": [{"text": text}]}, "finishReason": finish_reason}
        ]
    }


class TestGenerateJsonText:
    def test_missing_api_key_raises_without_calling_api(self):
        with patch.object(gemini_client.httpx, "post") as mock_post:
            with pytest.raises(GeminiError, match="GEMINI_API_KEY"):
                generate_json_text("prompt", "")
        mock_post.assert_not_called()

    def test_success_on_first_try(self):
        resp = _response(200, _success_payload("hasil insight"))
        with patch.object(gemini_client.httpx, "post", return_value=resp) as mock_post:
            result = generate_json_text("prompt", "key")
        assert result == "hasil insight"
        assert mock_post.call_count == 1

    def test_retries_primary_once_after_transient_then_succeeds(self):
        transient = _response(503, text="overloaded")
        success = _response(200, _success_payload("ok"))
        with patch.object(
            gemini_client.httpx, "post", side_effect=[transient, success]
        ) as mock_post, patch.object(gemini_client.time, "sleep") as mock_sleep:
            result = generate_json_text("prompt", "key")
        assert result == "ok"
        assert mock_post.call_count == 2
        mock_sleep.assert_called_once()

    def test_falls_back_to_secondary_model_after_two_failures(self):
        transient1 = _response(503, text="overloaded")
        transient2 = _response(503, text="still overloaded")
        success = _response(200, _success_payload("fallback ok"))
        with patch.object(
            gemini_client.httpx, "post", side_effect=[transient1, transient2, success]
        ) as mock_post, patch.object(gemini_client.time, "sleep"):
            result = generate_json_text("prompt", "key")
        assert result == "fallback ok"
        assert mock_post.call_count == 3
        third_call_url = mock_post.call_args_list[2].args[0]
        assert gemini_client.GEMINI_FALLBACK_MODEL in third_call_url

    def test_quota_exhausted_on_both_models_raises_friendly_message_not_raw_body(self):
        transient = _response(429, text='{"error": {"code": 429, "message": "raw google detail"}}')
        with patch.object(
            gemini_client.httpx, "post", return_value=transient
        ), patch.object(gemini_client.time, "sleep"):
            with pytest.raises(GeminiError) as excinfo:
                generate_json_text("prompt", "key")
        assert "raw google detail" not in str(excinfo.value)
        assert "Kuota" in str(excinfo.value)

    def test_network_failure_on_all_attempts_raises_friendly_message(self):
        with patch.object(
            gemini_client.httpx, "post", side_effect=httpx.RequestError("boom")
        ), patch.object(gemini_client.time, "sleep"):
            with pytest.raises(GeminiError) as excinfo:
                generate_json_text("prompt", "key")
        assert "boom" not in str(excinfo.value)

    def test_non_transient_error_status_raises_friendly_message_not_raw_body(self):
        resp = _response(400, text="Raw internal Google error detail with secrets")
        with patch.object(gemini_client.httpx, "post", return_value=resp):
            with pytest.raises(GeminiError) as excinfo:
                generate_json_text("prompt", "key")
        assert "Raw internal Google error detail" not in str(excinfo.value)

    def test_malformed_response_shape_raises_friendly_message_not_raw_dict(self):
        resp = _response(200, {"unexpected": "shape"})
        with patch.object(gemini_client.httpx, "post", return_value=resp):
            with pytest.raises(GeminiError) as excinfo:
                generate_json_text("prompt", "key")
        assert "unexpected" not in str(excinfo.value)

    def test_max_tokens_finish_reason_raises_specific_error(self):
        resp = _response(200, _success_payload("trunc", finish_reason="MAX_TOKENS"))
        with patch.object(gemini_client.httpx, "post", return_value=resp):
            with pytest.raises(GeminiError, match="terpotong"):
                generate_json_text("prompt", "key")
