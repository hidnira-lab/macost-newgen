import json

import pytest

from services.json_repair import repair_and_parse_json


class TestValidJson:
    def test_plain_object(self):
        assert repair_and_parse_json('{"a": 1}') == {"a": 1}

    def test_plain_array(self):
        assert repair_and_parse_json("[1, 2, 3]") == [1, 2, 3]

    def test_surrounding_whitespace_is_stripped(self):
        assert repair_and_parse_json('\n  {"a": 1}  \n') == {"a": 1}


class TestMarkdownFence:
    def test_fence_with_json_language_tag(self):
        raw = '```json\n{"a": 1}\n```'
        assert repair_and_parse_json(raw) == {"a": 1}

    def test_fence_without_language_tag(self):
        raw = '```\n{"a": 1}\n```'
        assert repair_and_parse_json(raw) == {"a": 1}


class TestTruncationRepair:
    def test_object_missing_closing_brace(self):
        assert repair_and_parse_json('{"a": 1, "b": 2') == {"a": 1, "b": 2}

    def test_array_of_objects_missing_closing_bracket(self):
        raw = '[{"title": "foo"}, {"title": "bar"'
        assert repair_and_parse_json(raw) == [{"title": "foo"}, {"title": "bar"}]

    def test_cut_off_mid_string_value(self):
        raw = '{"title": "foo", "body": "an unfinished sentence'
        assert repair_and_parse_json(raw) == {
            "title": "foo",
            "body": "an unfinished sentence",
        }

    def test_nested_object_and_array_both_left_open(self):
        raw = '{"items": [{"name": "x"'
        assert repair_and_parse_json(raw) == {"items": [{"name": "x"}]}

    def test_escaped_quote_inside_truncated_string_is_not_mistaken_for_closing_quote(self):
        raw = r'{"body": "she said \"hi'
        result = repair_and_parse_json(raw)
        assert result == {"body": 'she said "hi'}


class TestUnrepairable:
    def test_non_json_garbage_raises(self):
        with pytest.raises(json.JSONDecodeError):
            repair_and_parse_json("not json at all {{{")

    def test_empty_string_raises(self):
        with pytest.raises(json.JSONDecodeError):
            repair_and_parse_json("")
