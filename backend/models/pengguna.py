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
