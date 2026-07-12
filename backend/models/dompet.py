from pydantic import BaseModel


class DompetBase(BaseModel):
    nama_dompet: str
    saldo: float = 0


class DompetCreate(DompetBase):
    pass


class Dompet(DompetBase):
    id: str
    pengguna_id: str
