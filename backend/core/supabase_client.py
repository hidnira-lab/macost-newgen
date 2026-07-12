from supabase import Client, create_client

from core.config import settings


def get_supabase() -> Client:
    """Anon client, no user session — used for register/login before a JWT exists."""
    return create_client(settings.supabase_url, settings.supabase_anon_key)


def get_service_client() -> Client:
    """Service-role client that bypasses RLS — used only for trusted server-side
    operations like provisioning a default wallet right after signup."""
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def get_client_as_user(access_token: str) -> Client:
    """Anon-key client with the user's JWT attached to PostgREST requests, so
    RLS policies evaluate auth.uid() as that user."""
    client = create_client(settings.supabase_url, settings.supabase_anon_key)
    client.postgrest.auth(access_token)
    return client
