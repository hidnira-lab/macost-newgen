from dataclasses import dataclass

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client

from core.supabase_client import get_client_as_user, get_supabase

bearer_scheme = HTTPBearer()


@dataclass
class CurrentUser:
    id: str
    email: str
    access_token: str


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> CurrentUser:
    token = credentials.credentials
    client = get_supabase()
    try:
        result = client.auth.get_user(token)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid atau sudah kedaluwarsa",
        ) from exc

    if result is None or result.user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid atau sudah kedaluwarsa",
        )

    return CurrentUser(id=result.user.id, email=result.user.email or "", access_token=token)


def get_user_client(current_user: CurrentUser = Depends(get_current_user)) -> Client:
    """DB client scoped to the current request's user so RLS applies."""
    return get_client_as_user(current_user.access_token)
