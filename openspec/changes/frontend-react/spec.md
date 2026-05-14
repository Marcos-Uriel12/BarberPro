# BarberPro Frontend Specification

> React 18 + Vite + Tailwind CSS frontend for BarberPro. 6 capabilities covering booking wizard, admin dashboard, and CRUD operations.

---

## Capability: BOOK — Wizard de Reserva (6 pasos)

### Requirement: BOOK-01 — Selección de Barbero

**Description**: El usuario selecciona un barbero del listado disponible.

**Inputs**:
- Lista de barberos desde `GET /api/v1/barbers`
- Cada barbero: `{ id, name, phone, price }`

**Outputs**:
- Barbero seleccionado (UUID)
- Navegación al paso 2 habilitada

**Validations**:
- Debe seleccionar exactamente un barbero
- El barbero debe existir y estar activo

**Errors**:
- Si la lista está vacía → mostrar "No hay barberos disponibles"
- Si falla el fetch → mostrar "Error cargando barberos. Reintentar."

#### Scenario: BOOK-01-S1 — Camino feliz

- GIVEN la API retorna 3 barberos
- WHEN el usuario hace clic en "Carlos"
- THEN el botón "Continuar" se habilita
- AND el estado del wizard guarda `barberId: <uuid-de-carlos>`

#### Scenario: BOOK-01-S2 — Lista vacía

- GIVEN la API retorna `[]`
- WHEN se renderiza el paso 1
- THEN se muestra mensaje "No hay barberos disponibles"
- AND el botón "Continuar" permanece deshabilitado

#### Scenario: BOOK-01-S3 — Error de carga

- GIVEN la API retorna 500
- WHEN se intenta cargar la lista
- THEN se muestra "Error cargando barberos. Reintentar."
- AND se muestra botón "Reintentar" que dispara nuevo fetch

---

### Requirement: BOOK-02 — Selección de Servicio

**Description**: El usuario selecciona un servicio del catálogo global.

**Inputs**:
- Lista de servicios desde `GET /api/v1/services`
- Cada servicio: `{ id, name, price, duration_minutes }`
- Barbero seleccionado (paso 1)

**Outputs**:
- Servicio seleccionado (UUID)
- Precio mostrado (precio global o override del barbero)
- Navegación al paso 3 habilitada

**Validations**:
- Debe seleccionar exactamente un servicio
- El servicio debe existir

**Errors**:
- Si falla el fetch → mostrar "Error cargando servicios. Reintentar."

#### Scenario: BOOK-02-S1 — Camino feliz

- GIVEN hay 2 servicios disponibles y el usuario completó el paso 1
- WHEN el usuario selecciona "Corte Clásico"
- THEN se muestra el precio correspondiente
- AND el botón "Continuar" se habilita

#### Scenario: BOOK-02-S2 — Sin servicio seleccionado

- GIVEN el usuario no seleccionó ningún servicio
- WHEN intenta avanzar
- THEN el botón "Continuar" permanece deshabilitado

---

### Requirement: BOOK-03 — Selección de Fecha

**Description**: El usuario selecciona una fecha disponible para el turno.

**Inputs**:
- Barbero seleccionado (paso 1)
- Fecha mínima: hoy
- Fecha máxima: hoy + 30 días

**Outputs**:
- Fecha seleccionada (YYYY-MM-DD)
- Navegación al paso 4 habilitada

**Validations**:
- Fecha no puede ser menor a hoy
- Fecha no puede ser mayor a hoy + 30 días
- Debe seleccionar una fecha válida

**Errors**:
- Si no hay disponibilidad en la fecha → mostrar "No hay horarios disponibles"

#### Scenario: BOOK-03-S1 — Camino feliz

- GIVEN el usuario completó pasos 1 y 2
- WHEN selecciona una fecha válida (ej: mañana)
- THEN el botón "Continuar" se habilita
- AND el estado guarda `selectedDate: "2026-05-15"`

#### Scenario: BOOK-03-S2 — Fecha en el pasado

- GIVEN el calendario muestra fechas desde hoy
- WHEN el usuario intenta seleccionar ayer (si fuera posible)
- THEN la fecha está deshabilitada en el datepicker

#### Scenario: BOOK-03-S3 — Fecha fuera de rango

- GIVEN el usuario intenta seleccionar una fecha > 30 días
- WHEN interactúa con el datepicker
- THEN la fecha no es seleccionable (deshabilitada)

---

### Requirement: BOOK-04 — Selección de Horario (Slot)

**Description**: El usuario selecciona un turno disponible para la fecha elegida.

**Inputs**:
- Barbero seleccionado (paso 1)
- Servicio seleccionado (paso 2)
- Fecha seleccionada (paso 3)
- Slots desde `GET /api/v1/availability/barbers/{id}/slots?date={fecha}`

**Outputs**:
- Slot seleccionado (HH:MM)
- Navegación al paso 5 habilitada

**Validations**:
- Debe seleccionar un slot disponible (`available: true`)
- El slot no puede estar ya reservado

**Errors**:
- Si no hay slots → mostrar "No hay horarios disponibles para esta fecha"
- Si falla el fetch → mostrar "Error cargando horarios. Reintentar."

#### Scenario: BOOK-04-S1 — Camino feliz

- GIVEN hay 5 slots disponibles para la fecha seleccionada
- WHEN el usuario hace clic en "10:00"
- THEN el slot se marca como seleccionado
- AND el botón "Continuar" se habilita

#### Scenario: BOOK-04-S2 — Sin slots disponibles

- GIVEN la API retorna `[]` para la fecha
- WHEN se renderiza el paso 4
- THEN se muestra "No hay horarios disponibles para esta fecha"
- AND se sugiere "Seleccioná otra fecha"

#### Scenario: BOOK-04-S3 — Slot no disponible

- GIVEN un slot con `available: false`
- WHEN el usuario intenta seleccionarlo
- THEN el slot está deshabilitado (visualmente gris)
- AND no es cliqueable

---

### Requirement: BOOK-05 — Formulario de Datos del Cliente

**Description**: El usuario ingresa sus datos personales para la reserva.

**Inputs**:
- Campos: nombre, teléfono
- Datos persistentes desde localStorage (si existen)

**Outputs**:
- Datos validados del cliente
- Navegación al paso 6 habilitada

**Validations**:
- Nombre: 1-100 caracteres, no vacío
- Teléfono: patrón `^\+?[\d\s-]{7,20}$`
- Ambos campos son obligatorios

**Errors**:
- Nombre vacío → "El nombre es obligatorio"
- Teléfono inválido → "Teléfono inválido. Ej: +54 9 11 1234 5678"

#### Scenario: BOOK-05-S1 — Camino feliz

- GIVEN el usuario completa nombre="Juan Pérez" y teléfono="+54 9 11 1234 5678"
- WHEN el formulario se valida
- THEN ambas validaciones pasan
- AND el botón "Continuar" se habilita

#### Scenario: BOOK-05-S2 — Nombre vacío

- GIVEN el campo nombre está vacío
- WHEN el usuario intenta avanzar
- THEN se muestra error "El nombre es obligatorio"
- AND el botón "Continuar" permanece deshabilitado

#### Scenario: BOOK-05-S3 — Teléfono inválido

- GIVEN el teléfono es "123" (muy corto)
- WHEN el usuario intenta avanzar
- THEN se muestra error "Teléfono inválido. Ej: +54 9 11 1234 5678"
- AND el botón "Continuar" permanece deshabilitado

#### Scenario: BOOK-05-S4 — Datos persistentes

- GIVEN el usuario ya reservó antes (datos en localStorage)
- WHEN carga el paso 5
- THEN los campos se pre-completan con los datos guardados

---

### Requirement: BOOK-06 — Confirmación de Reserva

**Description**: El usuario revisa los datos y confirma la reserva.

**Inputs**:
- Resumen de la reserva: barbero, servicio, fecha, hora, datos del cliente
- Datos de los pasos 1-5

**Outputs**:
- Reserva creada vía `POST /api/v1/appointments`
- Redirección a página de éxito
- Limpieza del localStorage

**Validations**:
- Todos los pasos deben estar completos
- La reserva debe crearse exitosamente

**Errors**:
- Si falla la creación → mostrar "Error creando la reserva. Reintentar."
- Si el slot ya no está disponible → mostrar "Este horario ya fue reservado. Volvé al paso 4."

#### Scenario: BOOK-06-S1 — Camino feliz

- GIVEN todos los pasos están completos
- WHEN el usuario hace clic en "Confirmar Reserva"
- THEN se envía `POST /api/v1/appointments`
- AND se redirige a `/booking/success` con los detalles

#### Scenario: BOOK-06-S2 — Slot ya reservado

- GIVEN el slot fue reservado por otro usuario entre el paso 4 y 6
- WHEN se envía la reserva
- THEN la API retorna 409 Conflict
- AND se muestra "Este horario ya fue reservado. Volvé al paso 4."
- AND el wizard vuelve al paso 4

#### Scenario: BOOK-06-S3 — Error de servidor

- GIVEN la API retorna 500
- WHEN se envía la reserva
- THEN se muestra "Error creando la reserva. Reintentar."
- AND se mantiene en el paso 6 con los datos intactos

---

## Capability: AUTH — Login/Logout Admin

### Requirement: AUTH-01 — Login de Admin

**Description**: El administrador inicia sesión con credenciales.

**Inputs**:
- Username (string)
- Password (string)

**Outputs**:
- Cookie httpOnly con JWT
- CSRF token en el estado
- Redirección a `/admin/dashboard`

**Validations**:
- Username: no vacío
- Password: no vacío
- Credenciales válidas

**Errors**:
- Credenciales inválidas → 401 "Credenciales inválidas"
- Error de servidor → 500 "Error de conexión. Reintentar."

#### Scenario: AUTH-01-S1 — Camino feliz

- GIVEN credenciales correctas (admin/changeme)
- WHEN se envía el formulario
- THEN la API retorna 200 con csrf_token
- AND se redirige a `/admin/dashboard`

#### Scenario: AUTH-01-S2 — Credenciales inválidas

- GIVEN password incorrecto
- WHEN se envía el formulario
- THEN la API retorna 401
- AND se muestra "Credenciales inválidas"

#### Scenario: AUTH-01-S3 — Campos vacíos

- GIVEN username o password vacío
- WHEN se intenta enviar
- THEN la validación frontend bloquea el envío
- AND se muestra "Campo obligatorio"

---

### Requirement: AUTH-02 — Logout de Admin

**Description**: El administrador cierra sesión.

**Inputs**:
- JWT cookie válida

**Outputs**:
- Cookie eliminada
- Redirección a `/admin/login`

**Validations**:
- Debe haber sesión activa

**Errors**:
- Si falla el logout → limpiar estado local igual y redirigir

#### Scenario: AUTH-02-S1 — Camino feliz

- GIVEN el admin está logueado
- WHEN hace clic en "Cerrar Sesión"
- THEN se envía `POST /api/v1/auth/logout`
- AND se redirige a `/admin/login`

---

## Capability: ADMIN-DASH — Dashboard

### Requirement: ADMIN-DASH-01 — Métricas del Dashboard

**Description**: El dashboard muestra métricas clave del negocio.

**Inputs**:
- Turnos del día: `GET /api/v1/appointments?date=hoy`
- Total de barberos: `GET /api/v1/barbers`
- Total de servicios: `GET /api/v1/services`

**Outputs**:
- Cards con: turnos hoy, ingresos estimados, barberos activos, próximos turnos

**Validations**:
- Los datos deben reflejar el estado actual

**Errors**:
- Si falla algún fetch → mostrar la card con "Error cargando"

#### Scenario: ADMIN-DASH-01-S1 — Camino feliz

- GIVEN hay 5 turnos hoy, 3 barberos, 4 servicios
- WHEN se carga el dashboard
- THEN se muestran las 3 cards con los números correctos
- AND se listan los próximos 5 turnos

#### Scenario: ADMIN-DASH-01-S2 — Sin turnos hoy

- GIVEN no hay turnos para hoy
- WHEN se carga el dashboard
- THEN la card muestra "0 turnos hoy"
- AND la lista de próximos turnos muestra "No hay turnos próximos"

---

## Capability: ADMIN-BARB — CRUD Barberos

### Requirement: ADMIN-BARB-01 — Listar Barberos

**Description**: El admin ve la lista completa de barberos.

**Inputs**:
- `GET /api/v1/barbers`

**Outputs**:
- Tabla con: nombre, teléfono, precio (si tiene), acciones (editar/eliminar)

**Validations**:
- Ninguna

**Errors**:
- Si falla el fetch → mostrar "Error cargando barberos"

#### Scenario: ADMIN-BARB-01-S1 — Camino feliz

- GIVEN hay 3 barberos en la DB
- WHEN se carga la página
- THEN la tabla muestra 3 filas
- AND cada fila tiene botones "Editar" y "Eliminar"

---

### Requirement: ADMIN-BARB-02 — Crear/Editar Barbero

**Description**: El admin crea o edita un barbero.

**Inputs**:
- Nombre (1-100 chars)
- Teléfono (patrón `^\+?[\d\s-]{7,20}$`)
- Precio opcional (Decimal > 0)

**Outputs**:
- Barbero creado/actualizado
- Redirección a lista de barberos

**Validations**:
- Nombre obligatorio
- Teléfono obligatorio y válido
- Precio opcional, pero si se completa debe ser > 0

**Errors**:
- Nombre vacío → "Nombre obligatorio"
- Teléfono inválido → "Teléfono inválido"
- Precio ≤ 0 → "El precio debe ser mayor a 0"

#### Scenario: ADMIN-BARB-02-S1 — Crear camino feliz

- GIVEN el formulario está vacío
- WHEN se completan nombre="Nuevo Barbero", teléfono="+54 9 11 1234 5678"
- AND se envía `POST /api/v1/barbers`
- THEN se crea el barbero
- AND se redirige a la lista

#### Scenario: ADMIN-BARB-02-S2 — Validación de precio

- GIVEN se completa precio="-10"
- WHEN se intenta guardar
- THEN se muestra error "El precio debe ser mayor a 0"
- AND el formulario no se envía

---

### Requirement: ADMIN-BARB-03 — Eliminar Barbero

**Description**: El admin elimina un barbero.

**Inputs**:
- Confirmación del usuario (modal)

**Outputs**:
- Barbero eliminado
- Lista actualizada

**Validations**:
- Debe confirmar la eliminación

**Errors**:
- Si el barbero tiene turnos → 409 "No se puede eliminar: tiene turnos asociados"

#### Scenario: ADMIN-BARB-03-S1 — Eliminar camino feliz

- GIVEN el barbero no tiene turnos
- WHEN se hace clic en "Eliminar" y se confirma
- THEN se envía `DELETE /api/v1/barbers/{id}`
- AND el barbero desaparece de la lista

#### Scenario: ADMIN-BARB-03-S2 — Barbero con turnos

- GIVEN el barbero tiene turnos futuros
- WHEN se intenta eliminar
- THEN la API retorna 409
- AND se muestra "No se puede eliminar: tiene turnos asociados"

---

## Capability: ADMIN-SERV — CRUD Servicios

### Requirement: ADMIN-SERV-01 — Listar Servicios

**Description**: El admin ve la lista completa de servicios.

**Inputs**:
- `GET /api/v1/services`

**Outputs**:
- Tabla con: nombre, precio, duración, acciones (editar/eliminar)

**Validations**:
- Ninguna

**Errors**:
- Si falla el fetch → mostrar "Error cargando servicios"

---

### Requirement: ADMIN-SERV-02 — Crear/Editar Servicio

**Description**: El admin crea o edita un servicio.

**Inputs**:
- Nombre (1-100 chars)
- Precio (Decimal > 0)
- Duración (int > 0, minutos)

**Outputs**:
- Servicio creado/actualizado
- Redirección a lista de servicios

**Validations**:
- Nombre obligatorio
- Precio obligatorio y > 0
- Duración obligatoria y > 0

**Errors**:
- Nombre vacío → "Nombre obligatorio"
- Precio ≤ 0 → "El precio debe ser mayor a 0"
- Duración ≤ 0 → "La duración debe ser mayor a 0"

#### Scenario: ADMIN-SERV-02-S1 — Crear camino feliz

- GIVEN nombre="Corte Fade", precio=2500, duración=45
- WHEN se envía `POST /api/v1/services`
- THEN se crea el servicio
- AND se redirige a la lista

---

### Requirement: ADMIN-SERV-03 — Eliminar Servicio

**Description**: El admin elimina un servicio.

**Inputs**:
- Confirmación del usuario (modal)

**Outputs**:
- Servicio eliminado
- Lista actualizada

**Validations**:
- Debe confirmar la eliminación

**Errors**:
- Si el servicio tiene turnos → 409 "No se puede eliminar: tiene turnos asociados"

---

## Capability: ADMIN-PREC — Precio Global

### Requirement: ADMIN-PREC-01 — Actualizar Precio Global

**Description**: El admin define el precio base para todos los servicios.

**Inputs**:
- Precio global (Decimal > 0)

**Outputs**:
- Precio actualizado en la DB
- Todos los servicios sin precio override usan el nuevo precio

**Validations**:
- Precio > 0

**Errors**:
- Precio ≤ 0 → "El precio debe ser mayor a 0"

#### Scenario: ADMIN-PREC-01-S1 — Camino feliz

- GIVEN el precio global es 2000
- WHEN el admin lo cambia a 2500 y guarda
- THEN todos los servicios sin override muestran 2500
- AND los servicios con override mantienen su precio específico

---

## UI States — Estados de Interfaz

### Estados Comunes

| Estado | Loading | Success | Error | Empty |
|--------|---------|---------|-------|-------|
| **Listas** | Spinner centrado + "Cargando..." | Tabla con datos | "Error cargando. Reintentar." + botón | "No hay datos para mostrar" |
| **Formularios** | Botón deshabilitado + spinner | Toast "Guardado exitoso" + redirect | Mensaje inline + campo resaltado | N/A |
| **Wizard** | Spinner en el paso actual | Checkmark + transición al siguiente | Mensaje en el paso + botón "Reintentar" | N/A |

### Estados por Pantalla

#### /booking (Wizard)
- **Loading**: Spinner por paso, skeleton para listas
- **Success**: Paso completado con checkmark, animación de transición
- **Error**: Mensaje específico del paso, botón "Reintentar"
- **Empty**: "No hay barberos/servicios/horarios disponibles"

#### /admin/dashboard
- **Loading**: Skeleton en las 3 cards + tabla
- **Success**: Cards con números, tabla con próximos turnos
- **Error**: Card afectada muestra "Error cargando"
- **Empty**: "No hay turnos hoy" / "No hay turnos próximos"

#### /admin/barbers, /admin/services
- **Loading**: Skeleton en la tabla
- **Success**: Tabla con filas + acciones
- **Error**: "Error cargando. Reintentar."
- **Empty**: "No hay barberos/servicios. Crear uno nuevo."

#### /admin/login
- **Loading**: Botón con spinner
- **Success**: Redirect a /admin/dashboard
- **Error**: "Credenciales inválidas" inline
- **Empty**: N/A

---

## API Contracts — Contratos Detallados

### BOOK Endpoints (Públicos)

| Endpoint | Method | Request | Response 200 | Response Error |
|----------|--------|---------|--------------|----------------|
| `/api/v1/barbers` | GET | — | `[{ id, name, phone, price }]` | 500 `{ detail }` |
| `/api/v1/services` | GET | — | `[{ id, name, price, duration_minutes }]` | 500 `{ detail }` |
| `/api/v1/availability/barbers/{id}/slots` | GET | `?date=YYYY-MM-DD` | `[{ start, end, available }]` | 400 `{ detail }`, 500 `{ detail }` |
| `/api/v1/appointments` | POST | `{ barber_id, service_id, date, time, client_name, client_phone }` | `{ id, ...appointment }` (201) | 400 `{ detail }`, 409 `{ detail }`, 422 `{ detail }` |

### AUTH Endpoints

| Endpoint | Method | Request | Response 200 | Response Error |
|----------|--------|---------|--------------|----------------|
| `/api/v1/auth/login` | POST | `{ username, password }` | `{ csrf_token }` + Set-Cookie | 401 `{ detail }` |
| `/api/v1/auth/logout` | POST | — | `{ message: "ok" }` + Clear-Cookie | 401 `{ detail }` |
| `/api/v1/auth/me` | GET | — | `{ username }` | 401 `{ detail }` |

### ADMIN Endpoints (Protegidos)

| Endpoint | Method | Request | Response 200 | Response Error |
|----------|--------|---------|--------------|----------------|
| `/api/v1/barbers` | POST | `{ name, phone, price? }` | `{ id, name, phone, price }` (201) | 401, 422 `{ detail }` |
| `/api/v1/barbers/{id}` | PUT | `{ name?, phone?, price? }` | `{ id, name, phone, price }` | 401, 404, 422 |
| `/api/v1/barbers/{id}` | DELETE | — | 204 | 401, 404, 409 |
| `/api/v1/services` | POST | `{ name, price, duration_minutes }` | `{ id, name, price, duration_minutes }` (201) | 401, 422 |
| `/api/v1/services/{id}` | PUT | `{ name?, price?, duration_minutes? }` | `{ id, name, price, duration_minutes }` | 401, 404, 422 |
| `/api/v1/services/{id}` | DELETE | — | 204 | 401, 404, 409 |
| `/api/v1/appointments` | GET | `?date=&status=&page=&size=` | `[{ id, date, time, barber_name, service_name, client_name, status }]` | 401, 422 |
| `/api/v1/appointments/{id}/status` | PUT | `{ status }` | `{ id, ...appointment }` | 401, 404, 422 |

---

## Acceptance Criteria — Criterios de Aceptación

### BOOK (Wizard)
- [ ] Los 6 pasos se completan en secuencia
- [ ] No se puede saltar pasos (validación por paso)
- [ ] Los datos persisten si el usuario recarga la página (localStorage)
- [ ] Al confirmar, se crea la reserva y se redirige a /booking/success
- [ ] Se manejan todos los estados de error con mensajes claros

### AUTH
- [ ] Login con credenciales correctas redirige a /admin/dashboard
- [ ] Login con credenciales incorrectas muestra error 401
- [ ] Logout cierra sesión y redirige a /admin/login
- [ ] Rutas /admin/* están protegidas (redirect a login si no hay sesión)

### ADMIN-DASH
- [ ] Muestra 3 cards con métricas: turnos hoy, ingresos, barberos activos
- [ ] Muestra lista de próximos 5 turnos
- [ ] Maneja estados loading/error/empty

### ADMIN-BARB
- [ ] CRUD completo: listar, crear, editar, eliminar
- [ ] Validaciones de formulario funcionan (nombre, teléfono, precio)
- [ ] No se puede eliminar barbero con turnos asociados (409)

### ADMIN-SERV
- [ ] CRUD completo: listar, crear, editar, eliminar
- [ ] Validaciones de formulario funcionan (nombre, precio, duración)
- [ ] No se puede eliminar servicio con turnos asociados (409)

### ADMIN-PREC
- [ ] El precio global se actualiza y aplica a servicios sin override
- [ ] Servicios con precio override no se ven afectados

---

## Test Coverage Summary

| Feature | Happy Paths | Edge Cases | Error States |
|---------|-------------|------------|--------------|
| BOOK-01 a BOOK-06 | 6 | 8 | 6 |
| AUTH-01, AUTH-02 | 2 | 1 | 3 |
| ADMIN-DASH-01 | 1 | 1 | 1 |
| ADMIN-BARB-01 a 03 | 2 | 1 | 3 |
| ADMIN-SERV-01 a 03 | 2 | 1 | 3 |
| ADMIN-PREC-01 | 1 | 0 | 1 |

**Total Scenarios**: 42

---

## Next Step

Ready for design (sdd-design). The spec covers all 6 capabilities with requirements, scenarios, API contracts, UI states, and acceptance criteria.
