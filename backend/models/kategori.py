from typing import Literal, Optional

from pydantic import BaseModel

TipeKategori = Literal["Pemasukan", "Pengeluaran"]
FlagPemasukan = Literal["Fixed Routine", "Flexible Side Income"]
FlagPengeluaran = Literal["Kebutuhan", "Keinginan"]


class KategoriBase(BaseModel):
    nama_kategori: str
    tipe: TipeKategori
    flag_pemasukan: Optional[FlagPemasukan] = None
    flag_pengeluaran: Optional[FlagPengeluaran] = None


class KategoriCreate(KategoriBase):
    pass


class Kategori(KategoriBase):
    id: str
