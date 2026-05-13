"""Shared fixtures for all test layers."""

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.infrastructure.database.base import Base
from app.interfaces.api.dependencies import get_session
from app.main import create_app


@pytest_asyncio.fixture
async def async_session():
    """Provide an async SQLite in-memory session with all tables created.

    Tables are created once before the session is yielded, and the engine
    is disposed after the test completes. Each test session is isolated
    because SQLite :memory: databases are unique per connection.
    """
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory() as session:
        yield session
    await engine.dispose()


@pytest_asyncio.fixture
async def async_client(async_session):
    """Provide an httpx AsyncClient wired to the FastAPI app with overridden DB.

    The dependency override replaces the application's ``get_session`` with
    the test session so that all endpoint handlers use the SQLite in-memory
    database instead of the real PostgreSQL engine.
    """
    app = create_app()
    app.dependency_overrides[get_session] = lambda: async_session
    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport, base_url="http://test"
    ) as client:
        yield client
    app.dependency_overrides.clear()
