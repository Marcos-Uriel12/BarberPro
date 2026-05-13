# Design: Scaffold Backend

## Technical Approach

Greenfield BarberPro backend using strict DDD layers (domain → application → infrastructure → interfaces), FastAPI, SQLAlchemy async, Alembic async migrations, JWT httpOnly cookie auth, Redis for temp data, n8n webhook for notifications. UV-managed, Docker Compose for PostgreSQL 16 + Redis 7. Delivery via auto-chain (feature-branch-chain).

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| **Settings location** | `app/config/settings.py` | `app/core/config.py` | Matches DDD naming; "core" is ambiguous, "config" is explicit |
| **Entity validation** | `@property` validators raising `ValueError` | Pydantic, attrs | Spec requires zero framework imports in domain layer |
| **Alembic async** | `asyncio.run(run_async())` in env.py top-level | `sync` engine + `run_sync()` | Required by spec; `run_async()` prevents coroutine hang |
| **Auth strategy** | httpOnly cookie (access_token) + CSRF token in body | Bearer header only, session-based | Spec mandates CSRF token + httpOnly for XSS protection |
| **N8n integration** | `BackgroundTasks` fire-and-forget httpx POST | Celery, Redis queue | Spec says non-blocking, never blocks response; BackgroundTasks is simplest |
| **Test DB** | `sqlite+aiosqlite:///:memory:` per test | Test PostgreSQL container | Spec requires SQLite; faster, no Docker coupling for CI |
| **Repository pattern** | One repo class per entity, abstract in domain, impl in infra | Generic repo, unit of work | DDD purity + simpler for 6 entities; UoW overkill at this scale |
| **Migration initial admin** | Alembic data migration (op.execute with INSERT) | Seed script, first-run hook | Spec says "seeded via migration or first-run script"; migration keeps it atomic with schema |

## Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    interfaces/                           │
│  FastAPI routes → Pydantic schemas → Depends()          │
│  (NO domain/infra imports in route handlers directly)   │
└─────────────────────────┬───────────────────────────────┘
                          │ calls use cases
┌─────────────────────────▼───────────────────────────────┐
│                    application/                          │
│  Use cases → imports domain only                        │
│  (pure orchestration, no framework)                     │
└─────────────────────────┬───────────────────────────────┘
                          │ implements contracts
┌─────────────────────────▼───────────────────────────────┐
│                   infrastructure/                        │
│  SQLAlchemy repos, Redis client, JWT, bcrypt, n8n       │
│  Implements domain.interfaces                           │
└─────────────────────────┬───────────────────────────────┘
                          │ depends on
┌─────────────────────────▼───────────────────────────────┐
│                      domain/                             │
│  Entities (pure dataclasses) + Repository ABCs          │
│  Zero dependencies                                      │
└─────────────────────────────────────────────────────────┘
```

**Dependency rule**: `interfaces → application → domain` and `infrastructure → domain`. Never the reverse. Infrastructure implements domain interfaces via dependency injection through the constructor (use case receives repo, route receives use case).

## Data Flow

### Appointment Creation (Public → Redis → n8n)

```
Client → POST /api/v1/appointments
  → FastAPI validates via AppointmentCreate schema
  → get_session() injects AsyncSession
  → CreateAppointmentUseCase(repo).execute(data)
    → AvailabilityRepo checks barber has slot that day
    → AppointmentRepo.save(appointment) → status="pending"
    → BackgroundTasks.add_task(N8nNotifier.notify, event)
    → TempClientRepo.store(client_key, data, ttl=3600)
  → AppointmentOut schema response (201)
  ↳ Background: httpx POST to N8N_WEBHOOK_URL (fire-and-forget)
```

### Auth Flow (Login → JWT → Protected)

```
Client → POST /api/v1/auth/login {username, password}
  → LoginUseCase(repo, jwt_service).execute(username, password)
    → AdminRepo.get_by_username(username)
    → verify_password(plain, hashed) via bcrypt
    → JWTService.create_token(admin_id, expiry)
  → Response: Set-Cookie (access_token, httpOnly, Secure, SameSite=Lax)
    + body: {csrf_token: "<uuid>"}

Protected route:
  → get_current_admin dependency
    → Read access_token cookie
    → JWTService.verify_token(token) → admin_id or raise 401
    → AdminRepo.get_by_id(admin_id) or raise 401
```

### Admin Barber CRUD

```
Client (with JWT cookie) → POST /api/v1/barbers {name, phone, price}
  → get_current_admin (JWT verified)
  → BarberCreate schema validated
  → CreateBarberUseCase(repo).execute(data)
    → Barber entity created
    → BarberRepo.save(barber)
  → BarberOut response (201)
```

## File Tree

Below is every file to create (37 files). Files marked ✓ already exist.

### Root
| File | Description |
|------|-------------|
| `backend/pyproject.toml` | UV project config, all dependencies |
| `backend/docker-compose.yml` | PostgreSQL 16 + Redis 7 |
| `backend/.env.example` ✓ | Already created |
| `backend/.gitignore` ✓ | Already created |

### Alembic
| File | Description |
|------|-------------|
| `backend/alembic.ini` | Alembic config pointing to `app/infrastructure/database/base:Base` |
| `backend/alembic/env.py` | Async env.py with `asyncio.run(run_async())` |
| `backend/alembic/script.py.mako` | Migration template |
| `backend/alembic/versions/001_initial.py` | Initial auto-generated migration |

### App Config
| File | Description |
|------|-------------|
| `backend/app/__init__.py` | Package marker |
| `backend/app/main.py` | FastAPI app factory with lifespan |
| `backend/app/config/__init__.py` | Package marker |
| `backend/app/config/settings.py` | `Settings(BaseSettings)` class |

### Domain: Entities
| File | Description |
|------|-------------|
| `backend/app/domain/__init__.py` | Package marker |
| `backend/app/domain/entities/__init__.py` | Package marker |
| `backend/app/domain/entities/barber.py` | `Barber` dataclass |
| `backend/app/domain/entities/service.py` | `Service` dataclass |
| `backend/app/domain/entities/barber_service.py` | `BarberService` dataclass |
| `backend/app/domain/entities/availability.py` | `Availability` dataclass |
| `backend/app/domain/entities/appointment.py` | `Appointment` dataclass |
| `backend/app/domain/entities/admin.py` | `Admin` dataclass |

### Domain: Interfaces
| File | Description |
|------|-------------|
| `backend/app/domain/interfaces/__init__.py` | Package marker |
| `backend/app/domain/interfaces/repositories.py` | All 6 abstract repo ABCs |

### Application: Use Cases
| File | Description |
|------|-------------|
| `backend/app/application/__init__.py` | Package marker |
| `backend/app/application/use_cases/__init__.py` | Package marker |
| `backend/app/application/use_cases/barber_use_cases.py` | `Create/Get/List/Update/DeleteBarberUseCase` |
| `backend/app/application/use_cases/service_use_cases.py` | `Create/Get/List/Update/DeleteServiceUseCase` |
| `backend/app/application/use_cases/appointment_use_cases.py` | `CreateAppointmentUseCase`, `ListAppointmentsUseCase`, `UpdateAppointmentStatusUseCase` |
| `backend/app/application/use_cases/availability_use_cases.py` | `GetSlotsUseCase`, `SetAvailabilityUseCase` |
| `backend/app/application/use_cases/auth_use_cases.py` | `LoginUseCase`, `GetCurrentAdminUseCase` |

### Infrastructure: Database
| File | Description |
|------|-------------|
| `backend/app/infrastructure/__init__.py` | Package marker |
| `backend/app/infrastructure/database/__init__.py` | Package marker |
| `backend/app/infrastructure/database/engine.py` | `create_async_engine()`, `async_sessionmaker`, `get_session()` |
| `backend/app/infrastructure/database/base.py` | `Base = declarative_base()`, common mixin with `id`, `created_at`, `updated_at` |
| `backend/app/infrastructure/database/models/__init__.py` | Import all models for Base metadata |
| `backend/app/infrastructure/database/models/barber_model.py` | `BarberModel` ORM |
| `backend/app/infrastructure/database/models/service_model.py` | `ServiceModel` ORM |
| `backend/app/infrastructure/database/models/barber_service_model.py` | `BarberServiceModel` ORM |
| `backend/app/infrastructure/database/models/availability_model.py` | `AvailabilityModel` ORM |
| `backend/app/infrastructure/database/models/appointment_model.py` | `AppointmentModel` ORM |
| `backend/app/infrastructure/database/models/admin_model.py` | `AdminModel` ORM |
| `backend/app/infrastructure/database/repositories/__init__.py` | Package marker |
| `backend/app/infrastructure/database/repositories/barber_repo.py` | `SQLAlchemyBarberRepository` |
| `backend/app/infrastructure/database/repositories/service_repo.py` | `SQLAlchemyServiceRepository` |
| `backend/app/infrastructure/database/repositories/availability_repo.py` | `SQLAlchemyAvailabilityRepository` |
| `backend/app/infrastructure/database/repositories/appointment_repo.py` | `SQLAlchemyAppointmentRepository` |
| `backend/app/infrastructure/database/repositories/admin_repo.py` | `SQLAlchemyAdminRepository` |

### Infrastructure: Redis, n8n, Auth
| File | Description |
|------|-------------|
| `backend/app/infrastructure/redis/__init__.py` | Package marker |
| `backend/app/infrastructure/redis/client_repo.py` | `TempClientRepository` with Redis hash + TTL |
| `backend/app/infrastructure/notifications/__init__.py` | Package marker |
| `backend/app/infrastructure/notifications/n8n.py` | `N8nNotifier` with httpx POST |
| `backend/app/infrastructure/auth/__init__.py` | Package marker |
| `backend/app/infrastructure/auth/jwt.py` | `JWTService` — encode/decode |
| `backend/app/infrastructure/auth/password.py` | `PasswordService` — hash/verify via passlib bcrypt |

### Interfaces: Schemas
| File | Description |
|------|-------------|
| `backend/app/interfaces/__init__.py` | Package marker |
| `backend/app/interfaces/schemas/__init__.py` | Package marker |
| `backend/app/interfaces/schemas/barber_schema.py` | `BarberCreate`, `BarberUpdate`, `BarberOut` |
| `backend/app/interfaces/schemas/service_schema.py` | `ServiceCreate`, `ServiceUpdate`, `ServiceOut` |
| `backend/app/interfaces/schemas/availability_schema.py` | `AvailabilityCreate`, `AvailabilityOut`, `TimeSlot` |
| `backend/app/interfaces/schemas/appointment_schema.py` | `AppointmentCreate`, `AppointmentOut`, `AppointmentStatusUpdate` |
| `backend/app/interfaces/schemas/auth_schema.py` | `LoginRequest`, `LoginResponse`, `CurrentAdmin` |

### Interfaces: API
| File | Description |
|------|-------------|
| `backend/app/interfaces/api/__init__.py` | Package marker |
| `backend/app/interfaces/api/dependencies.py` | `get_current_admin`, `get_session`, `get_jwt_service` |
| `backend/app/interfaces/api/v1/__init__.py` | Package marker |
| `backend/app/interfaces/api/v1/router.py` | `api_v1_router` aggregating all endpoint routers |
| `backend/app/interfaces/api/v1/endpoints/__init__.py` | Package marker |
| `backend/app/interfaces/api/v1/endpoints/auth.py` | `POST /login`, `POST /logout`, `GET /me` |
| `backend/app/interfaces/api/v1/endpoints/barbers.py` | CRUD for barbers |
| `backend/app/interfaces/api/v1/endpoints/services.py` | CRUD for services |
| `backend/app/interfaces/api/v1/endpoints/appointments.py` | Create, list, update status |
| `backend/app/interfaces/api/v1/endpoints/availability.py` | Get slots, set availability |

### Tests
| File | Description |
|------|-------------|
| `backend/tests/__init__.py` | Package marker |
| `backend/tests/conftest.py` | Fixtures: async_session, async_client, override deps |
| `backend/tests/domain/__init__.py` | Package marker |
| `backend/tests/domain/test_barber.py` | Barber entity validation tests |
| `backend/tests/domain/test_service.py` | Service entity validation tests |
| `backend/tests/domain/test_appointment.py` | Appointment entity validation tests |
| `backend/tests/domain/test_admin.py` | Admin entity tests |
| `backend/tests/application/__init__.py` | Package marker |
| `backend/tests/application/test_barber_use_cases.py` | Use case tests with mock repo |
| `backend/tests/application/test_appointment_use_cases.py` | Appointment creation logic |
| `backend/tests/application/test_auth_use_cases.py` | Login validation logic |
| `backend/tests/infrastructure/__init__.py` | Package marker |
| `backend/tests/infrastructure/test_barber_repo.py` | SQLAlchemy repo tests with SQLite |
| `backend/tests/infrastructure/test_redis_repo.py` | Redis mock/fake tests |
| `backend/tests/infrastructure/test_jwt.py` | JWT token tests |
| `backend/tests/infrastructure/test_n8n.py` | Webhook notifier tests |
| `backend/tests/interfaces/__init__.py` | Package marker |
| `backend/tests/interfaces/test_api_barbers.py` | Barber endpoints via TestClient |
| `backend/tests/interfaces/test_api_appointments.py` | Appointment endpoints |
| `backend/tests/interfaces/test_api_auth.py` | Auth endpoints |
| `backend/tests/interfaces/test_api_availability.py` | Availability endpoints |

## Database Schema

### Entity Relationship Diagram

```
Barber ──1:N── BarberService ──N:1── Service
  │                                      │
  └──1:N── Availability                  │
  │                                      │
  └──1:N── Appointment ──────────────────┘

Admin (standalone, no relations)
```

### Tables

#### `barbers`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default uuid4 |
| name | VARCHAR(100) | NOT NULL |
| phone | VARCHAR(20) | NOT NULL |
| price | NUMERIC(10,2) | NULLABLE |
| created_at | TIMESTAMP | NOT NULL, default now() |
| updated_at | TIMESTAMP | NOT NULL, auto-update |

Index: none beyond PK.

#### `services`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default uuid4 |
| name | VARCHAR(100) | NOT NULL |
| price | NUMERIC(10,2) | NOT NULL, CHECK > 0 |
| duration_minutes | INTEGER | NOT NULL, CHECK > 0 |
| created_at | TIMESTAMP | NOT NULL, default now() |
| updated_at | TIMESTAMP | NOT NULL, auto-update |

#### `barber_services`
| Column | Type | Constraints |
|--------|------|-------------|
| barber_id | UUID | PK, FK → barbers(id) ON DELETE CASCADE |
| service_id | UUID | PK, FK → services(id) ON DELETE CASCADE |
| price | NUMERIC(10,2) | NULLABLE (overrides barber price) |
| duration_minutes | INTEGER | NULLABLE (overrides service duration) |

Index: composite PK on (barber_id, service_id).

#### `availabilities`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default uuid4 |
| barber_id | UUID | FK → barbers(id) ON DELETE CASCADE, NOT NULL |
| day_of_week | INTEGER | NOT NULL, CHECK 0-6 |
| start_time | TIME | NOT NULL |
| end_time | TIME | NOT NULL, CHECK end_time > start_time |
| created_at | TIMESTAMP | NOT NULL, default now() |
| updated_at | TIMESTAMP | NOT NULL, auto-update |

Index: (barber_id, day_of_week).

#### `appointments`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default uuid4 |
| date | DATE | NOT NULL |
| time | TIME | NOT NULL |
| barber_id | UUID | FK → barbers(id) ON DELETE RESTRICT, NOT NULL |
| service_id | UUID | FK → services(id) ON DELETE RESTRICT, NOT NULL |
| client_name | VARCHAR(100) | NOT NULL |
| client_phone | VARCHAR(20) | NOT NULL |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending', CHECK IN ('pending','confirmed','cancelled','completed') |
| created_at | TIMESTAMP | NOT NULL, default now() |
| updated_at | TIMESTAMP | NOT NULL, auto-update |

Indexes: (barber_id, date, time), (status, date).

#### `admins`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default uuid4 |
| username | VARCHAR(50) | NOT NULL, UNIQUE |
| hashed_password | VARCHAR(255) | NOT NULL |
| created_at | TIMESTAMP | NOT NULL, default now() |
| updated_at | TIMESTAMP | NOT NULL, auto-update |

Index: (username) — unique.

## API Contract Summary

| Method | Path | Auth | Request | Response | Status |
|--------|------|------|---------|----------|--------|
| POST | `/api/v1/auth/login` | No | `LoginRequest` | `LoginResponse` + Set-Cookie | 200 |
| POST | `/api/v1/auth/logout` | Yes | — | `{"message": "ok"}` + clear cookie | 200 |
| GET | `/api/v1/auth/me` | Yes | — | `CurrentAdmin` | 200 |
| GET | `/api/v1/barbers` | No | — | `list[BarberOut]` | 200 |
| POST | `/api/v1/barbers` | Yes | `BarberCreate` | `BarberOut` | 201 |
| GET | `/api/v1/barbers/{id}` | No | — | `BarberOut` | 200 |
| PUT | `/api/v1/barbers/{id}` | Yes | `BarberUpdate` | `BarberOut` | 200 |
| DELETE | `/api/v1/barbers/{id}` | Yes | — | — | 204 |
| GET | `/api/v1/services` | No | — | `list[ServiceOut]` | 200 |
| POST | `/api/v1/services` | Yes | `ServiceCreate` | `ServiceOut` | 201 |
| PUT | `/api/v1/services/{id}` | Yes | `ServiceUpdate` | `ServiceOut` | 200 |
| DELETE | `/api/v1/services/{id}` | Yes | — | — | 204 |
| POST | `/api/v1/appointments` | No | `AppointmentCreate` | `AppointmentOut` | 201 |
| GET | `/api/v1/appointments` | Yes | `?status=&page=&size=` | `list[AppointmentOut]` | 200 |
| PUT | `/api/v1/appointments/{id}/status` | Yes | `AppointmentStatusUpdate` | `AppointmentOut` | 200 |
| GET | `/api/v1/availability/barbers/{barber_id}/slots` | No | `?date=` | `list[TimeSlot]` | 200 |

Every yes-auth endpoint returns 401 if cookie missing/invalid. Validation errors return 422.

## Alembic Async Setup

### `alembic/env.py` — Critical Pattern

```python
import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine

from app.config.settings import settings
from app.infrastructure.database.base import Base

# Import ALL models so Base.metadata is populated
from app.infrastructure.database.models import (  # noqa: F401
    barber_model,
    service_model,
    barber_service_model,
    availability_model,
    appointment_model,
    admin_model,
)

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_online():
    """Synchronous wrapper that creates and disposes the async engine."""
    connectable = create_async_engine(
        settings.DATABASE_URL,
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        # sync_connection = connection.execution_options(
        #     isolation_level="AUTOCOMMIT"
        # )
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()

    connectable.dispose()


def run_async_migrations():
    """Top-level function called via asyncio.run()."""
    # Use Alembic's run_async which handles the event loop correctly
    from alembic.util import run_async
    run_async(run_migrations_online)


# THIS IS THE CRITICAL LINE — avoid "coroutine was never awaited"
asyncio.run(run_async_migrations())
```

**Why this works**: `asyncio.run()` creates a fresh event loop, runs the coroutine, and shuts it down cleanly. Alembic's synchronous CLI expects a sync `run_migrations_online()` function — by wrapping the async engine creation in `run_async()`, we get a sync-compatible connection that Alembic can work with.

**Key details**:
- `poolclass=pool.NullPool` prevents connection pooling issues across migration steps
- `compare_type=True` catches column type changes in autogenerate
- Import ALL model modules BEFORE `target_metadata = Base.metadata` so all tables register

### `alembic.ini` key config:
```ini
script_location = alembic
sqlalchemy.url =  # LEAVE EMPTY — we use settings.DATABASE_URL in env.py
```

## Component Design Details

### `pyproject.toml`

UV project with these dependency groups:
- **Runtime**: `fastapi[standard]>=0.115`, `sqlalchemy[asyncio]>=2.0`, `asyncpg`, `alembic>=1.13`, `pydantic-settings`, `passlib[bcrypt]`, `pyjwt`, `httpx`, `redis[hiredis]`, `python-dotenv`
- **Dev**: `pytest>=8`, `pytest-asyncio`, `aiosqlite`, `pytest-httpx`, `coverage`

### `app/main.py`

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.interfaces.api.v1.router import api_v1_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create Redis connection pool, ensure DB reachable
    yield
    # Shutdown: dispose engine, close Redis

def create_app() -> FastAPI:
    app = FastAPI(title="BarberPro", lifespan=lifespan)
    app.add_middleware(CORSMiddleware, allow_origins=settings.CORS_ORIGINS, ...)
    app.include_router(api_v1_router, prefix="/api/v1")
    return app
```

### `app/domain/entities/appointment.py`

Key validation: `@property`-based, not Pydantic.
```python
@dataclass
class Appointment:
    id: UUID | None
    date: date
    time: time
    barber_id: UUID
    service_id: UUID
    client_name: str
    client_phone: str
    status: str = "pending"

    VALID_STATUSES = {"pending", "confirmed", "cancelled", "completed"}

    def __post_init__(self):
        if self.status not in self.VALID_STATUSES:
            raise ValueError(f"Invalid status: {self.status}. Must be one of {self.VALID_STATUSES}")
```

### `app/interfaces/api/dependencies.py`

```python
from fastapi import Cookie, HTTPException, status
from app.infrastructure.auth.jwt import JWTService
from app.infrastructure.database.engine import get_session

async def get_current_admin(
    access_token: str | None = Cookie(None),
    session = Depends(get_session),
):
    if access_token is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    jwt_service = JWTService(settings)
    payload = jwt_service.decode(access_token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Token expired")
    admin_repo = SQLAlchemyAdminRepository(session)
    admin = await admin_repo.get_by_id(UUID(payload["sub"]))
    if admin is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return admin
```

## Test Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| **Domain** | Entity creation, validation rules, value constraints | Pure Python, no fixtures. Import entity directly, construct with valid/invalid data, assert attributes or `ValueError`. |
| **Application** | Use case orchestration logic (e.g., "can't book in past") | Mock repo via `unittest.mock.AsyncMock` or in-memory fake. Inject fake repo into use case. |
| **Infrastructure** | SQLAlchemy repo CRUD, JWT encode/decode, Redis store/get, n8n webhook | SQLite `:memory:` engine for repos. Direct function calls for JWT. `pytest-httpx` for webhook. |
| **Interfaces** | Endpoint responses, status codes, auth rejection, validation errors | `httpx.AsyncClient` with FastAPI's `TestClient` (ASGI transport). `conftest.py` overrides DB dependency to SQLite. |

### Key Fixtures (`tests/conftest.py`)

```python
@pytest_asyncio.fixture
async def async_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    async with async_session() as session:
        yield session
    await engine.dispose()

@pytest_asyncio.fixture
async def async_client(async_session):
    app = create_app()
    app.dependency_overrides[get_session] = lambda: async_session
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client
    app.dependency_overrides.clear()
```

### Example Tests

**Domain**:
```python
def test_appointment_invalid_status_raises():
    with pytest.raises(ValueError, match="Invalid status"):
        Appointment(date=date.today(), time=time(), barber_id=uuid4(),
                    service_id=uuid4(), client_name="Juan", client_phone="+54911",
                    status="invalid")
```

**Infrastructure**:
```python
async def test_barber_repo_save_and_get(async_session):
    repo = SQLAlchemyBarberRepository(async_session)
    barber = Barber(name="Carlos", phone="+5491112345678")
    saved = await repo.save(barber)
    assert saved.id is not None
    fetched = await repo.get_by_id(saved.id)
    assert fetched.name == "Carlos"
```

**Interfaces**:
```python
async def test_create_barber_requires_auth(async_client):
    response = await async_client.post("/api/v1/barbers", json={"name": "x", "phone": "+54911"})
    assert response.status_code == 401

async def test_list_barbers_empty(async_client):
    response = await async_client.get("/api/v1/barbers")
    assert response.status_code == 200
    assert response.json() == []
```

## Open Questions

- None — spec is complete and unambiguous. All decisions documented above.

## Risks

- Alembic async setup is the biggest risk point. The `asyncio.run()` + `run_async()` pattern is well-documented but version-specific. Pin `alembic>=1.13` and test the migration on first apply.
- `pydantic-settings` loads `.env` automatically only if `python-dotenv` is installed — add `python-dotenv` as explicit runtime dep.
