# Exploration: Scaffold Backend

## Current State
The project `BarberPro` is fully greenfield. The `backend/` directory exists but is empty. No `pyproject.toml`, no source files, no tests, no Docker config. The domain model has been confirmed with the user and is well-defined.

## Affected Areas
- `backend/` — entire directory needs scaffolding from scratch
- `openspec/config.yaml` — may need updates after scaffold decisions
- `tests/` — no test infrastructure exists yet; needs full setup

## Approaches

### 1. DDD Directory Layout

**Proposed structure:**
```
backend/
├── app/
│   ├── __init__.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py           # Pydantic Settings (env vars)
│   │   └── security.py         # JWT create/verify, password hashing
│   ├── domain/
│   │   ├── __init__.py
│   │   ├── entities/
│   │   │   ├── __init__.py
│   │   │   ├── barber.py
│   │   │   ├── service.py
│   │   │   ├── barber_service.py
│   │   │   ├── availability.py
│   │   │   ├── appointment.py
│   │   │   └── admin.py
│   │   └── interfaces/
│   │       ├── __init__.py
│   │       └── repositories.py  # Abstract repo classes
│   ├── application/
│   │   ├── __init__.py
│   │   └── use_cases/
│   │       ├── __init__.py
│   │       ├── barber_use_cases.py
│   │       ├── service_use_cases.py
│   │       ├── appointment_use_cases.py
│   │       └── auth_use_cases.py
│   ├── infrastructure/
│   │   ├── __init__.py
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   ├── base.py          # DeclarativeBase
│   │   │   ├── session.py       # async engine + session factory
│   │   │   ├── models/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── barber_model.py
│   │   │   │   ├── service_model.py
│   │   │   │   ├── barber_service_model.py
│   │   │   │   ├── availability_model.py
│   │   │   │   ├── appointment_model.py
│   │   │   │   └── admin_model.py
│   │   │   └── repositories/
│   │   │       ├── __init__.py
│   │   │       ├── barber_repo.py
│   │   │       ├── service_repo.py
│   │   │       ├── appointment_repo.py
│   │   │       └── admin_repo.py
│   │   ├── auth/
│   │   │   ├── __init__.py
│   │   │   └── jwt_handler.py   # JWT encode/decode + cookie helpers
│   │   ├── redis/
│   │   │   ├── __init__.py
│   │   │   └── client_repo.py   # Temp client data in Redis
│   │   └── webhook/
│   │       ├── __init__.py
│   │       └── n8n_notifier.py  # httpx POST to n8n
│   └── interfaces/
│       ├── __init__.py
│       ├── api/
│       │   └── v1/
│       │       ├── __init__.py
│       │       ├── endpoints/
│       │       │   ├── __init__.py
│       │       │   ├── barbers.py
│       │       │   ├── services.py
│       │       │   ├── appointments.py
│       │       │   └── auth.py
│       │       └── router.py    # Aggregates all v1 routers
│       ├── schemas/
│       │   ├── __init__.py
│       │   ├── barber_schema.py
│       │   ├── service_schema.py
│       │   ├── appointment_schema.py
│       │   └── auth_schema.py
│       ├── dependencies.py      # FastAPI dependencies (get_session, get_current_admin)
│       ├── main.py              # App factory + lifespan
│       └── middleware.py        # CORS, CSRF, etc.
├── tests/
│   ├── __init__.py
│   ├── conftest.py             # Shared fixtures (session override, test client)
│   ├── domain/
│   │   ├── __init__.py
│   │   ├── test_barber.py
│   │   ├── test_service.py
│   │   ├── test_appointment.py
│   │   └── test_admin.py
│   ├── application/
│   │   ├── __init__.py
│   │   └── test_appointment_use_cases.py
│   ├── infrastructure/
│   │   ├── __init__.py
│   │   └── test_repositories.py
│   └── interfaces/
│       ├── __init__.py
│       └── test_api.py
├── alembic/
│   ├── env.py                  # Async Alembic env
│   ├── script.py.mako
│   └── versions/
│       └── 001_initial.py
├── docker-compose.yml
├── Dockerfile
├── pyproject.toml
├── alembic.ini
└── .env.example
```

**Pros:**
- Follows DDD layers strictly — no layer-skipping
- `core/` isolates cross-cutting config and security from domain contamination
- Infrastructure split by concern (database, auth, redis, webhook) is clean
- Tests mirror the source layout exactly

**Cons:**
- Many directories/files upfront — scaffold effort is medium
- The `core/` module is a slight deviation from pure DDD (some call it "shared kernel")

**Effort:** Medium

### 2. Docker Compose Setup

```
docker-compose.yml:
  - postgres:16-alpine  → port 5432, named volume, health check
  - redis:7-alpine      → port 6379, named volume
  - app (optional)      → built from Dockerfile, depends on both
```

**Data volumes:**
- `postgres_data:/var/lib/postgresql/data`
- `redis_data:/data`

**Network:** single `barberpro-net` bridge

**Env:** all sensitive values from `.env` (POSTGRES_PASSWORD, REDIS_PASSWORD, etc.)

**Pros:**
- Clean separation, health checks ensure ordering
- Named volumes survive `docker compose down`
- `.env` keeps secrets out of compose file

**Cons:**
- Need to decide: run app inside Docker too, or just infra during dev?
- For dev speed, running `uv run uvicorn` locally against Docker services is faster than rebuilding the app container on every change

**Effort:** Low

### 3. UV + pyproject.toml

**Core deps:**
| Package | Version | Purpose |
|---------|---------|---------|
| fastapi | ^0.111 | Web framework |
| uvicorn[standard] | ^0.30 | ASGI server |
| sqlalchemy[asyncio] | ^2.0 | ORM + async engine |
| asyncpg | ^0.29 | PostgreSQL async driver |
| alembic | ^1.13 | Migrations |
| redis | ^5.0 | Redis client |
| httpx | ^0.27 | HTTP client (n8n webhook) |
| pyjwt | ^2.8 | JWT encode/decode |
| passlib[bcrypt] | ^1.7 | Password hashing |
| python-multipart | ^0.0.9 | Form data (login) |
| pydantic-settings | ^2.2 | Settings from env |
| email-validator | ^2.1 | Email validation (optional) |

**Dev deps:**
| Package | Version | Purpose |
|---------|---------|---------|
| pytest | ^8.0 | Test runner |
| pytest-asyncio | ^0.24 | Async test support |
| httpx | ^0.27 | TestClient transport |
| aiosqlite | ^0.20 | SQLite async driver for tests |
| pytest-cov | ^5.0 | Coverage (optional initially) |

**Pros:**
- UV is fast, uses PEP 723/751 for modern dependency management
- Lockfile ensures reproducible builds
- Clear separation of dev vs prod deps

**Cons:**
- Need to ensure `uv sync` vs `uv install` semantics are understood by the team
- BCrypt requires build deps (gcc/libffi) in Docker — must add to Dockerfile

**Effort:** Low

### 4. SQLAlchemy Async + Alembic

**Strategy:**
- `Base = declarative_base()` in `base.py`
- `create_async_engine()` using asyncpg URL from settings
- `async_sessionmaker()` for session factory
- `get_session()` async generator dependency
- Alembic configured for async via `run_async()` in env.py

**Alembic initial migration:**
1. After all models are defined, run `alembic revision --autogenerate -m "initial"`
2. This creates all tables in one migration
3. Future changes use autogenerate too

**Pros:**
- Single initial migration = clean baseline
- Autogenerate catches 90% of changes
- Alembic + async is well-documented

**Cons:**
- Autogenerate doesn't catch everything (rename columns, etc.)
- Need to configure Alembic env.py carefully for async (async engine, run_async)

**Effort:** Low-Medium

### 5. FastAPI App Factory

**Pattern:**
```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create engine, init Redis, create pool
    yield
    # Shutdown: close connections


def create_app() -> FastAPI:
    app = FastAPI(
        title="BarberPro",
        version="0.1.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],  # Frontend dev
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    from app.interfaces.api.v1.router import api_v1_router
    app.include_router(api_v1_router, prefix="/api/v1")

    return app
```

**Pros:**
- Lifespan is the modern (≥FastAPI 0.93+) way to handle startup/shutdown
- App factory makes testing easy (create_app with overrides)
- CORS configured for local frontend dev

**Cons:**
- Dependencies (get_session) need to be lazy-loaded or wired manually — cannot import engine at module level

**Effort:** Low

### 6. Testing Strategy

**pytest config in pyproject.toml:**
```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"
```

**Fixture layers:**
- **conftest.py (root):** shared fixtures
  - `async_client` → TestClient wrapped in AsyncClient
  - `override_get_session` → replaces DB with SQLite
  - `test_app` → create_app with overrides

- **Domain tests:** pure Python, no fixtures needed
- **Application tests:** mock repositories
- **Infrastructure tests:** real SQLite via aiosqlite
- **Interface tests:** TestClient with overridden dependencies

**SQLite for tests:**
- Use `aiosqlite` with SQLAlchemy's `create_async_engine("sqlite+aiosqlite:///:memory:")`
- Create tables before each test, drop after
- Domain entities never touch the DB — pure unit tests

**Pros:**
- SQLite is fast, no external deps for tests
- Mirroring layer structure gives clear failure localization
- Domain layer needs ZERO test infrastructure — just assert on objects

**Cons:**
- SQLite doesn't support all PostgreSQL features (e.g., ARRAY, JSONB index types) — but our model doesn't use those
- Async test fixtures need careful teardown (event loop management)

**Effort:** Medium

### 7. Auth — JWT + httpOnly Cookie

**Flow:**
1. `POST /api/v1/auth/login` → validates username+password → returns JWT in `Set-Cookie` header (httpOnly, Secure, SameSite=Lax) + CSRF token in response body
2. Protected routes read JWT from cookie, verify signature, extract admin identity
3. `get_current_admin` dependency extracts and validates admin from request

**Token structure:**
```python
{
    "sub": "admin",        # admin username
    "exp": <timestamp>,    # e.g., 24h
    "iat": <timestamp>,
    "type": "access"
}
```

**Password hashing:** `passlib.hash.bcrypt`

**Pros:**
- httpOnly cookie = XSS-safe (JS can't read the token)
- No client-side storage needed
- Simple for single admin

**Cons:**
- Vulnerable to CSRF (mitigated by SameSite=Lax + custom header/CSRF token)
- Token revocation requires a blocklist (Redis or DB)
- Single admin = no role-based logic needed now, but could be extended

**Effort:** Low-Medium

### 8. n8n Integration

**On appointment creation:**
1. Appointment use case creates appointment in DB
2. After success, calls `N8nNotifier.notify(appointment_data)` as a background task
3. N8nNotifier uses httpx to POST to configured webhook URL
4. Payload includes: appointment, barber, service, client info

**Payload shape:**
```json
{
    "appointment_id": "uuid",
    "date": "2026-05-15",
    "time": "10:30",
    "status": "pendiente",
    "barber": {"name": "Carlos", "phone": "+5491112345678"},
    "service": {"name": "Corte clásico", "price": 5000.0},
    "client": {"name": "Juan", "phone": "+5491122334455"}
}
```

**Webhook URL:** configured via env `N8N_WEBHOOK_URL`

**Error handling:** log failures, don't block appointment creation. Optional: retry queue.

**Pros:**
- Fire-and-forget keeps booking fast
- n8n handles retries, workflows, notifications autonomously
- Decoupled — if n8n is down, appointment still works

**Cons:**
- No guarantee of delivery (fire-and-forget)
- Need to consider: what if n8n is critical path for notifications?

**Effort:** Low

### 9. Redis — Temporary Client Data

**Flow:**
1. Client arrives without auth — provides name + phone at booking time
2. Data stored in Redis: `client:booking:{temp_id}` or keyed by phone
3. TTL: 60 minutes (booking session timeout)
4. When appointment is created, data is read from Redis, included in webhook payload, then removed from Redis

**Redis setup:**
```python
import redis.asyncio as aioredis

class TempClientRepository:
    def __init__(self, redis_client: aioredis.Redis):
        self._redis = redis_client

    async def store_client_data(self, key: str, data: dict, ttl: int = 3600) -> None:
        await self._redis.hset(f"client:booking:{key}", mapping=data)
        await self._redis.expire(f"client:booking:{key}", ttl)

    async def get_client_data(self, key: str) -> dict | None:
        data = await self._redis.hgetall(f"client:booking:{key}")
        return data if data else None
```

**Alternative approaches:**
1. Store in PostgreSQL temporarily — simpler, no extra infra, but adds load to main DB
2. Store in Redis as JSON string — simpler but less queryable

**Recommended:** Redis hash with TTL — matches use case perfectly. Client data is ephemeral and short-lived.

**Effort:** Low

## Recommendation

**Go with all approaches as described** — they are complementary, not competing. The scaffold is a single coherent effort.

Key decisions:
1. **Structure** — Use the proposed DDD layout with `core/` for config/security
2. **Docker** — Run only infra (PostgreSQL + Redis) in Docker for dev; app runs locally via `uvicorn`
3. **Auth** — JWT in httpOnly cookie with SameSite=Lax; CSRF token in response body
4. **Testing** — SQLite via aiosqlite for all layers; domain tests are pure unit tests
5. **n8n** — Fire-and-forget httpx POST on appointment creation; log failures
6. **Redis** — Hash with TTL for temp client data; `client:booking:{session_id}` key pattern

## Risks

1. **Alembic async setup** — env.py needs careful async configuration. Without it, `alembic upgrade` hangs. Must use `run_async()` pattern.
2. **aiosqlite + SQLAlchemy async** — `aiosqlite` must be installed, and SQLAlchemy's async SQLite URL uses `sqlite+aiosqlite://`. Easy to get wrong.
3. **Docker with local dev** — If the app connects to `localhost` for PostgreSQL/Redis but Docker uses containers with different hostnames, the `.env` needs `POSTGRES_HOST=localhost` for local dev vs `postgres` for Docker. Use environment-specific config or Docker profiles.
4. **CORS in production** — The frontend may not always be on `localhost:5173`. Need env-based `CORS_ORIGINS`.
5. **Token revocation** — JWT is stateless by design. If we need to invalidate a token (admin logout), we need a Redis blocklist or short token TTL (e.g., 1 hour + refresh token).

## Ready for Proposal
Yes — all decisions are clear. Move to `sdd-propose`.

## Artifact Index
- `backend/app/domain/entities/` — 6 entity files (pure Python dataclasses)
- `backend/app/domain/interfaces/repositories.py` — 5 abstract repositories
- `backend/app/application/use_cases/` — 4 use case modules
- `backend/app/infrastructure/database/models/` — 6 SQLAlchemy models
- `backend/app/infrastructure/database/repositories/` — 4 repo implementations
- `backend/app/infrastructure/auth/jwt_handler.py` — JWT + cookie helpers
- `backend/app/infrastructure/redis/client_repo.py` — Temp client data
- `backend/app/infrastructure/webhook/n8n_notifier.py` — Webhook POST
- `backend/app/interfaces/api/v1/endpoints/` — 4 endpoint modules
- `backend/app/interfaces/schemas/` — 4 Pydantic schema modules
- `backend/app/core/config.py` — Pydantic Settings
- `backend/app/core/security.py` — Password hashing + JWT
- `backend/app/interfaces/main.py` — App factory
- `backend/tests/` — Test structure mirroring source
- `backend/docker-compose.yml` — PostgreSQL 16 + Redis
- `backend/pyproject.toml` — UV package config
- `backend/alembic/` — Migration setup
