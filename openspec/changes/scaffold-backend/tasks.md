# Tasks: Scaffold Backend

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Est. changed lines | ~2,800–3,200 |
| 400-line budget risk | High |
| Chained PRs | Yes |
| Delivery strategy | auto-chain |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Work Units

| Content | PR | Base |
|---------|----|------|
| Scaffold, Docker, config, DB engine, main | PR 1 | tracker |
| Domain, ABCs, ORM, Alembic + migration | PR 2 | PR 1 |
| SQLAlchemy repos, JWT, Redis, n8n | PR 3 | PR 2 |
| Use cases, schemas, deps, endpoints | PR 4 | PR 3 |
| Tests + seed | PR 5 | PR 4 |

## Phase 1: Foundation

- [ ] 1.1 `pyproject.toml` — all runtime + dev deps per design
- [ ] 1.2 `docker-compose.yml` — PostgreSQL 16 + Redis 7, health checks, volumes, `barberpro-net`
- [ ] 1.3 Verify `.env.example` documents all 8 Settings vars
- [ ] 1.4 Verify `.gitignore` — `__pycache__/`, `.env`, `*.pyc`, `.venv/`, `.DS_Store`
- [ ] 1.5 All 24 `__init__.py` package markers under `app/` + `tests/`
- [ ] 1.6 `app/config/settings.py` — `Settings(BaseSettings)` with `env_file`
- [ ] 1.7 `app/infrastructure/database/base.py` — `declarative_base()`, `CommonMixin` (UUID pk, timestamps)
- [ ] 1.8 `app/infrastructure/database/engine.py` — async engine, sessionmaker, `get_session()`
- [ ] 1.9 `app/main.py` — `create_app()` factory, lifespan, CORS, router skeleton

## Phase 2: Domain + ORM + Migrations

- [ ] 2.1 6 entities: `app/domain/entities/{barber,service,barber_service,availability,appointment,admin}.py` — pure dataclasses
- [ ] 2.2 `app/domain/interfaces/repositories.py` — 6 ABCs with async CRUD
- [ ] 2.3 6 ORM models: `app/infrastructure/database/models/{barber,service,barber_service,availability,appointment,admin}_model.py`
- [ ] 2.4 `app/infrastructure/database/models/__init__.py` — import all 6
- [ ] 2.5 `alembic.ini` — `script_location = alembic`, empty URL
- [ ] 2.6 `alembic/env.py` — `asyncio.run()` + `run_async()`, NullPool, compare_type
- [ ] 2.7 `alembic/script.py.mako` — default template
- [ ] 2.8 Generate `alembic/versions/001_initial.py` — autogenerate, verify 6 tables

## Phase 3: Infrastructure

- [ ] 3.1 5 repos: `app/infrastructure/database/repositories/{barber,service,availability,appointment,admin}_repo.py`
- [ ] 3.2 `app/infrastructure/auth/jwt.py` — `JWTService.create_token()`, `verify_token()`
- [ ] 3.3 `app/infrastructure/auth/password.py` — hash/verify via passlib bcrypt
- [ ] 3.4 `app/infrastructure/redis/client_repo.py` — hash + 3600s TTL
- [ ] 3.5 `app/infrastructure/notifications/n8n.py` — httpx POST, no-op if empty URL

## Phase 4: Use Cases + Schemas + API

- [ ] 4.1 5 use cases: `app/application/use_cases/{barber,service,appointment,availability,auth}_use_cases.py`
- [ ] 4.2 5 schemas: `app/interfaces/schemas/{barber,service,availability,appointment,auth}_schema.py`
- [ ] 4.3 `app/interfaces/api/dependencies.py` — `get_session`, `get_current_admin`, `get_jwt_service`
- [ ] 4.4 `app/interfaces/api/v1/router.py` — aggregator router
- [ ] 4.5 5 endpoints: `app/interfaces/api/v1/endpoints/{auth,barbers,services,appointments,availability}.py`
- [ ] 4.6 Update `app/main.py` — mount router, CORS from settings

## Phase 5: Tests + Seed

- [ ] 5.1 `tests/conftest.py` — SQLite `async_session`, `async_client` with overrides
- [ ] 5.2 Domain tests: `tests/domain/test_{barber,service,appointment,admin}.py`
- [ ] 5.3 Application tests: `tests/application/test_{barber,auth,appointment}_use_cases.py`
- [ ] 5.4 Infra tests: `tests/infrastructure/test_{barber_repo,jwt,n8n,redis_repo}.py`
- [ ] 5.5 Interface tests: `tests/interfaces/test_api_{barbers,appointments,auth,availability}.py`
- [ ] 5.6 Seed migration: `alembic/versions/002_seed_admin.py` — INSERT bcrypt-hashed admin
