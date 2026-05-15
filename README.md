# BarberPro 💈

Sistema de gestión de turnos para barberías. API REST con FastAPI + frontend React.

![BarberPro](frontend/src/assets/hero.png)

---

## ✨ Funcionalidades

### Para clientes
- **Reserva online** en 3 pasos: elegir barbero → servicio → fecha y horario
- **Slots dinámicos**: los horarios disponibles se calculan según la duración del servicio
- **Confirmación** con mensaje de WhatsApp vía n8n
- **Responsive**: funciona en celular, tablet y desktop

### Para administradores
- **Dashboard** con turnos del día, ingresos estimados y barberos activos
- **Gestión de barberos**: CRUD completo + horarios por día de la semana
- **Gestión de servicios**: CRUD con precio y duración
- **Control de turnos**: confirmar o cancelar, ingresos se actualizan automáticamente
- **Precio global**: actualizar precio de todos los servicios de una sola vez

---

## 🏗️ Stack

| Capa | Tecnología |
|------|-----------|
| **Backend** | Python 3.14 + FastAPI |
| **Base de datos** | PostgreSQL 16 + SQLAlchemy async |
| **Cache** | Redis 7 |
| **ORM** | SQLAlchemy 2.0 + Alembic |
| **Auth** | JWT httpOnly cookies + bcrypt |
| **Notificaciones** | n8n webhook |
| **Frontend** | React 18 + Vite + Tailwind CSS |
| **Íconos** | lucide-react |
| **Tests backend** | pytest + pytest-asyncio |
| **Tests frontend** | Vitest + Testing Library |

---

## 🚀 Cómo empezar

### Requisitos

- Python 3.12+
- Node.js 20+
- Docker y Docker Compose
- `uv` (package manager Python)

### 1. Clonar e instalar

```bash
git clone git@github.com:Marcos-Uriel12/BarberPro.git
cd BarberPro
```

### 2. Backend

```bash
cd backend

# Crear .env
cp .env.example .env

# Iniciar servicios
docker compose up -d

# Instalar dependencias
uv sync

# Migraciones
uv run alembic upgrade head

# Servidor
uv run uvicorn app.main:create_app --factory --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev
```

### 4. Acceder

| URL | Descripción |
|-----|-------------|
| `http://localhost:5173/booking` | Reserva de turnos |
| `http://localhost:5173/admin/login` | Panel admin |
| Credenciales | `admin / admin123` |

---

## 🧪 Tests

```bash
# Backend
cd backend && uv run pytest tests/ -v

# Frontend
cd frontend && npx vitest --run
```

---

## 📁 Estructura del proyecto

```
BarberPro/
├── backend/
│   ├── app/
│   │   ├── domain/          # Entidades del negocio
│   │   │   └── entities/
│   │   ├── application/     # Casos de uso
│   │   │   └── use_cases/
│   │   ├── infrastructure/  # Implementaciones concretas
│   │   │   ├── database/
│   │   │   ├── auth/
│   │   │   ├── redis/
│   │   │   └── notifications/
│   │   └── interfaces/      # API endpoints
│   │       ├── api/
│   │       └── schemas/
│   ├── alembic/             # Migraciones
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── api/             # Cliente HTTP
│   │   ├── components/      # Componentes React
│   │   │   ├── ui/          # Componentes base
│   │   │   ├── booking/     # Wizard de reserva
│   │   │   └── admin/       # Panel admin
│   │   ├── contexts/        # Estado global
│   │   ├── hooks/           # Custom hooks
│   │   └── pages/           # Páginas
│   └── tests/
└── README.md
```

---

## 📸 Capturas

> Imágenes próximamente

```
frontend/public/screenshots/
├── booking-wizard.png
├── admin-dashboard.png
├── admin-barbers.png
└── admin-schedule.png
```

---

## 🔌 API endpoints

### Públicos

| Método | Path | Descripción |
|--------|------|-------------|
| `GET` | `/api/v1/barbers` | Listar barberos |
| `GET` | `/api/v1/services` | Listar servicios |
| `GET` | `/api/v1/availability/barbers/{id}/slots` | Slots disponibles |
| `POST` | `/api/v1/appointments` | Crear turno |
| `GET` | `/api/v1/health` | Health check |

### Admin (requiere auth)

| Método | Path | Descripción |
|--------|------|-------------|
| `POST` | `/api/v1/auth/login` | Login |
| `POST` | `/api/v1/auth/logout` | Logout |
| `GET` | `/api/v1/auth/me` | Sesión actual |
| `POST/PUT/DELETE` | `/api/v1/barbers/*` | CRUD barberos |
| `POST/PUT/DELETE` | `/api/v1/services/*` | CRUD servicios |
| `POST/DELETE` | `/api/v1/availability/*` | CRUD horarios |
| `GET` | `/api/v1/appointments` | Listar turnos |
| `PUT` | `/api/v1/appointments/{id}/status` | Cambiar estado |

---

## 🔗 Integraciones

- **n8n**: notificaciones a WhatsApp cuando se crea un turno
- **Instagram**: *(próximamente)*

---

## 📄 Licencia

MIT
