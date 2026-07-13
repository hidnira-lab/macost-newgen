from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class PenggunaBase(BaseModel):
    nama: str
    email: EmailStr


class PenggunaCreate(PenggunaBase):
    password: str = Field(min_length=8)


class PenggunaLogin(BaseModel):
    email: EmailStr
    password: str


class Pengguna(PenggunaBase):
    id: str
    telepon: Optional[str] = None
    kota: Optional[str] = None


class PenggunaUpdateRequest(BaseModel):
    nama: Optional[str] = Field(default=None, min_length=2)
    telepon: Optional[str] = None
    kota: Optional[str] = None
