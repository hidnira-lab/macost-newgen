from services.kategori_matcher import match_kategori

KATEGORI_LIST = [
    {"id": "1", "nama_kategori": "Makan & Minum"},
    {"id": "2", "nama_kategori": "Transportasi"},
    {"id": "3", "nama_kategori": "Hiburan"},
]


class TestMatchKategori:
    def test_none_input_returns_none_tuple(self):
        assert match_kategori(None, KATEGORI_LIST) == (None, None)

    def test_empty_string_returns_none_tuple(self):
        assert match_kategori("", KATEGORI_LIST) == (None, None)

    def test_exact_match_case_insensitive_and_trims_whitespace(self):
        assert match_kategori("  makan & minum  ", KATEGORI_LIST) == ("1", "Makan & Minum")

    def test_partial_match_needle_within_category_name(self):
        assert match_kategori("makan", KATEGORI_LIST) == ("1", "Makan & Minum")

    def test_partial_match_category_name_within_needle(self):
        assert match_kategori("Transportasi bulanan", KATEGORI_LIST) == ("2", "Transportasi")

    def test_no_match_returns_none_tuple(self):
        assert match_kategori("Investasi", KATEGORI_LIST) == (None, None)

    def test_exact_match_takes_priority_over_another_entrys_partial_match(self):
        kategori_list = [
            {"id": "1", "nama_kategori": "Makan"},
            {"id": "2", "nama_kategori": "Makan & Minum"},
        ]
        assert match_kategori("Makan", kategori_list) == ("1", "Makan")

    def test_empty_kategori_list_returns_none_tuple(self):
        assert match_kategori("Makan", []) == (None, None)
