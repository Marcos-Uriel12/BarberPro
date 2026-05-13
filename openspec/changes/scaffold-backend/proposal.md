# Proposal: Scaffold Backend — DDD Project Structure

## Intent

Scaffold the full backend from scratch: DDD project structure, UV + pyproject.toml, Docker infra (PostgreSQL 16 + Redis 7), FastAPI app factory, SQLAlchemy async + Alembic sync migrations, 6 domain entities, repository pattern, use cases, Pydantic schemas, API endpoints, JWT auth, Redis temp client store, n8n webhook notification, and pytest infrastructure.

## Scope

### In Scope

- UV + pyproject.toml with all dependencies
- Full DDD directory structure (domain → application → infrastructure → interfaces + core/)
- docker-compose.yml (PostgreSQL 16 + Redis 7)
- FastAPI app factory + CORS + lifespan
- SQLAlchemy async engine + Alembic sync config + initial migration
- 6 domain entities (Barber, Service, BarberService, Availability, Appointment, Admin)
- 6 SQLAlchemy models + repository interfaces + implementations
- CRUD use cases for each entity
- Pydantic schemas + API endpoints (barbers, services, appointments, auth, availability, slots)
- JWT auth: httpOnly cookie (SameSite=Lax) + CSRF token
- Redis temp client repository (hash + TTL)
- n8n webhook notification service (httpx POST)
- pytest + aiosqlite test infrastructure + basic tests per layer
- .env.example + .gitignore

### Out of Scope

Frontend, n8n workflow setup, production deployment (k8s), payment, advanced notifications.

## Capabilities

### New Capabilities

- `admin-auth`: JWT login/logout for single admin with bcrypt
- `barber-management`: CRUD for barbers
- `service-management`: CRUD for services
- `barber-service-management`: Link services to barbers w/ price & duration
- `availability-management`: Set/query barber availability weekly slots
- `appointment-booking`: Create/list/reschedule/cancel appointments w/ slot validation
- `temp-client-data`: Store/lookup booking client info via Redis with TTL
- `webhook-notifications`: Fire-and-forget httpx POST to n8n on appointment creation

### Modified Capabilities

None — greenfield.

## Approach

DDD strict layers: domain (pure dataclasses + abstract repos) → application (orchestration use cases) → infrastructure (SQLAlchemy models, Redis, JWT, httpx) → interfaces (FastAPI routes + Pydantic schemas). core/ for cross-cutting config/security.

Docker runs infra only (PostgreSQL 16 + Redis 7, alpine). App runs via `uv run uvicorn --reload` for hot reload.

SQLAlchemy async engine at runtime; Alembic sync via `run_async()` for migrations. Single initial migration creates all tables.

Auth: POST /auth/login validates bcrypt password, returns JWT in httpOnly cookie (SameSite=Lax, Secure) + CSRF token in body. `get_current_admin` FastAPI dependency reads cookie, verifies JWT signature.

Tests: aiosqlite + `sqlite+aiosqlite:///:memory:` for all layers. Domain tests are pure Python — no fixtures.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/` | New | Full project scaffold from zero |
| `backend/pyproject.toml` | New | UV deps (fastapi, sqlalchemy, alembic, redis, httpx, pyjwt, passlib, pydantic-settings, pytest) |
| `backend/docker-compose.yml` | New | PostgreSQL 16 + Redis 7 with named volumes |
| `backend/alembic/` | New | run_async() env.py, initial migration |
| `backend/tests/` | New | pytest + aiosqlite, mirror source structure |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|-------------|
| Alembic async env.py hangs | Medium | Use `run_async()` pattern; test `alembic upgrade head` in CI |
| aiosqlite URL format wrong | Low | Document `sqlite+aiosqlite://` in conftest; add test for engine creation |
| Docker hostname mismatch | Medium | Default POSTGRES_HOST=localhost; use env var for container overrides |
| CORS permissive in prod | Medium | CORS_ORIGINS env var; default localhost:5173 for dev |
| JWT revocation impossible | Low | Short TTL (24h). Redis blocklist as future option. |

## Rollback Plan

`git revert` the initial commit. No production data exists — DB has never run.

## Dependencies

- Docker + Docker Compose v2
- Python 3.12+ with UV (>=0.4)
- PostgreSQL 16 + Redis 7 images

## Success Criteria

- [ ] `uv run uvicorn app.interfaces.main:create_app --reload` starts without errors
- [ ] `alembic upgrade head` creates all 6+ tables in PostgreSQL
- [ ] Domain entities pass type checks and are pure dataclasses
- [ ] `pytest -v` passes all tests (unit + integration + API)
- [ ] POST /api/v1/auth/login returns httpOnly cookie + CSRF token
- [ ] docker-compose up starts PostgreSQL 16 + Redis 7 healthy
- [ ] All API endpoints respond 200/4xx appropriately with correct schemas
