import pytest
from fastapi.testclient import TestClient

from core.security import CurrentUser, get_current_user, get_user_client
from main import app
from tests.fakes import FakeSupabaseClient

FAKE_USER = CurrentUser(id="test-user-id", email="test@example.com", access_token="fake-token")


@pytest.fixture
def fake_db() -> FakeSupabaseClient:
    return FakeSupabaseClient()


@pytest.fixture
def api_client(fake_db: FakeSupabaseClient):
    """FastAPI TestClient with auth and the Supabase client dependency
    replaced -- no real network calls, no JWT needed. Overrides are cleared
    after each test so they don't leak into unrelated tests."""
    app.dependency_overrides[get_current_user] = lambda: FAKE_USER
    app.dependency_overrides[get_user_client] = lambda: fake_db
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()
