def match_kategori(nama_disarankan: str | None, kategori_list: list[dict]) -> tuple[str | None, str | None]:
    """Cocokkan nama kategori yang ditebak Gemini ke kategori_id asli di DB.
    Sengaja tidak minta Gemini mengembalikan UUID langsung -- model bisa
    berhalusinasi ID yang tidak ada, jadi lebih aman minta nama lalu
    dicocokkan di server terhadap daftar kategori yang benar-benar ada."""
    if not nama_disarankan:
        return None, None

    needle = nama_disarankan.strip().lower()
    for k in kategori_list:
        if k["nama_kategori"].strip().lower() == needle:
            return k["id"], k["nama_kategori"]
    for k in kategori_list:
        nama = k["nama_kategori"].strip().lower()
        if needle in nama or nama in needle:
            return k["id"], k["nama_kategori"]
    return None, None
