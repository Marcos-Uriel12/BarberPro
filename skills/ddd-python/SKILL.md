---
name: ddd-python
description: "Trigger: DDD, domain-driven design, layered architecture, clean architecture, Python DDD. Scaffold and implement Python backends with DDD layered architecture using FastAPI, SQLAlchemy, and Pytest."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Activation Contract

Apply when building or extending a Python backend that follows Domain-Driven Design layered architecture. The layers are strictly ordered: **domain → application → infrastructure → interfaces**. Dependencies flow inward; domain has zero external dependencies.

## Hard Rules

- **Domain layer** (`domain/`): pure Python only. No FastAPI, SQLAlchemy, Redis, httpx, or any framework import. Entities are plain classes. Repository contracts are abstract classes/Protocols.
- **Application layer** (`application/`): imports domain only. Orchestrates use cases. Never references FastAPI, HTTP, DB, or external services directly.
- **Infrastructure layer** (`infrastructure/`): implements domain repository contracts. SQLAlchemy models, Redis client, JWT, httpx webhooks live here.
- **Interfaces layer** (`interfaces/`): only FastAPI route definitions and Pydantic schemas. Delegates to application use cases.
- **Tests** (`tests/`): mirror the same layer structure. Use SQLite for tests via `pytest` with fixtures.

## Decision Gates

| Need | Action |
|------|--------|
| New entity/aggregate | Create in domain/, add repository contract, implement in infrastructure/ |
| New endpoint | Create schema in interfaces/schemas/, route in interfaces/api/v1/endpoints/, use case in application/use_cases/ |
| New external service | Define contract in domain/interfaces/, implement in infrastructure/ |
| DB migration | SQLAlchemy model in infrastructure/database/models/, alembic revision |

## Execution Steps

1. Define entities in `domain/entities/` with pure Python classes and business rules.
2. Define repository contracts in `domain/interfaces/repositories.py` as abstract classes.
3. Implement use cases in `application/use_cases/` that use repository contracts.
4. Create SQLAlchemy models in `infrastructure/database/models/` that map to entities.
5. Implement repositories in `infrastructure/database/repositories/`.
6. Add Pydantic schemas in `interfaces/schemas/`.
7. Wire endpoints in `interfaces/api/v1/endpoints/`.
8. Write tests mirroring the layer structure, using SQLite via pytest fixtures.
9. Run `alembic revision --autogenerate` for DB schema changes.

## Output Contract

Return: what layer each new file belongs to, the dependency direction confirmed, and any deviation from the strict layer rule.

## References

- `skills/ddd-python/assets/template.py` — starter file for a new entity + use case + endpoint.
