# Tasks: Frontend React — BarberPro

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 2500–5500 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1: Foundation → PR2: Booking → PR3: Auth+Admin → PR4: Tests |
| Delivery strategy | auto-chain |
| Chain strategy | feature-branch-chain |

```
Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High
```

### Suggested Work Units

| Unit | Goal | Likely PR | Base Branch |
|------|------|-----------|-------------|
| 1 | Scaffold + API client + UI components + base hooks | PR 1 | feature/frontend-react |
| 2 | BookingContext + wizard completo (6 pasos) + tests | PR 2 | PR 1 branch |
| 3 | Auth + AdminLayout + Dashboard + CRUD barberos/servicios + tests | PR 3 | PR 2 branch |
| 4 | Tests faltantes, accesibilidad, lazy loading | PR 4 | PR 3 branch |

---

## Phase 1: Cimientos (Foundation)

Dependencies: Ninguna. Arrancamos proyecto nuevo.

### PR 1 — Scaffold, API Client, UI Components, Hooks Base

---

#### TASK-001 🔴 — Scaffold Vite + React + Tailwind

- **Descripción**: Crear proyecto Vite con React 18. Configurar Tailwind CSS, PostCSS, eslint básico. Crear estructura de directorios (`src/components/ui/`, `src/hooks/`, `src/contexts/`, `src/pages/`, `src/lib/`, `src/components/booking/`, `src/components/admin/`).
- **Archivos**: `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/index.css`
- **Dependencies**: Ninguna
- **Estimación**: 2h
- **DoD**: `npm run dev` arranca, Tailwind classes se renderizan en browser, estructura de directorios creada
- **Riesgo**: Bajo. Es boilerplate estándar.

#### TASK-002 🔴 — API Client (`src/lib/api.js`)

- **Descripción**: Crear cliente HTTP base con `fetch`. Soporte para `credentials: 'include'` (cookies httpOnly). Funciones: `api.get(url)`, `api.post(url, body)`, `api.put(url, body)`, `api.delete(url)`. Manejo de errores unificado: parsear respuesta como JSON, lanzar error con status y mensaje. Headers: `Content-Type: application/json`, `X-CSRF-Token` desde estado global.
- **Archivos**: Crear `src/lib/api.js`
- **Dependencies**: TASK-001
- **Estimación**: 1h
- **DoD**: Los 4 métodos funcionan, errores no-2xx lanzan excepción con `{ status, detail }`, llamado a `/api/v1/barbers` mockeado retorna datos
- **Riesgo**: Medio. CSRF token necesita ser accesible desde fuera. Solución: setter global en el módulo api.

#### TASK-003 ⚡ — UI Components: Button, Input, Select, Card

- **Descripción**: Crear 4 componentes base. Button: variants (`primary`, `secondary`, `danger`), disabled, loading (spinner interno). Input: label, error message, disabled. Select: label, options array, error. Card: children, title opcional, className.
- **Archivos**: `src/components/ui/Button.jsx`, `src/components/ui/Input.jsx`, `src/components/ui/Select.jsx`, `src/components/ui/Card.jsx`
- **Dependencies**: TASK-001
- **Estimación**: 2h
- **DoD**: Cada componente se renderiza en Storybook o test manual con distintos props. States: default, disabled, error, loading (Button). Props API estable.
- **Riesgo**: Bajo. Son componentes puramente presentacionales.

#### TASK-004 ⚡ — UI Components: Modal, Toast, Spinner, Skeleton

- **Descripción**: Modal: overlay, close on Escape/click outside, portal rendering. Toast: success/error/info variants, auto-dismiss 5s, stackable. Spinner: SVG animado, tamaño configurable. Skeleton: placeholder animado para loading states.
- **Archivos**: `src/components/ui/Modal.jsx`, `src/components/ui/Toast.jsx`, `src/components/ui/Spinner.jsx`, `src/components/ui/Skeleton.jsx`
- **Dependencies**: TASK-001
- **Estimación**: 2.5h
- **DoD**: Modal abre/cierra correctamente, Toast se muestra y auto-destruye, Skeleton tiene animación visible, Spinner centrado en contenedor
- **Riesgo**: Medio. Portal de Modal puede tener problemas con Tailwind z-index. Usar `createPortal` y layer de overlay con `z-50`.

#### TASK-005 ⚡ — Hooks Base: useBarbers, useServices

- **Descripción**: `useBarbers()`: fetch `GET /api/v1/barbers`, retorna `{ barbers, loading, error, refetch }`. `useServices()`: fetch `GET /api/v1/services`, retorna `{ services, loading, error, refetch }`. Ambos con estado loading/error/data.
- **Archivos**: `src/hooks/useBarbers.js`, `src/hooks/useServices.js`
- **Dependencies**: TASK-002
- **Estimación**: 1h
- **DoD**: Hook retorna data/loading/error. Llamando a `refetch()` se re-ejecuta el fetch. Loading es `true` mientras se resuelve.
- **Riesgo**: Bajo. Patrón estándar de fetch + useState/useEffect.

---

## Phase 2: Booking (Wizard)

Dependencies: Phase 1 (TASK-001 a TASK-005)

### PR 2 — Booking Context, Wizard 6 Pasos, Tests

---

#### TASK-006 🔴 — BookingContext

- **Descripción**: Contexto con estado completo del wizard: `{ step, barberId, serviceId, date, slot, clientName, clientPhone }`. Actions: `selectBarber()`, `selectService()`, `selectDate()`, `selectSlot()`, `setClientData()`, `nextStep()`, `prevStep()`, `reset()`. Persistencia parcial en localStorage (recuperar datos al recargar paso 5). Provider envuelve rutas de `/booking/*`.
- **Archivos**: Crear `src/contexts/BookingContext.jsx`
- **Dependencies**: TASK-001
- **Estimación**: 2h
- **DoD**: Provider disponible en tests. Llamar `selectBarber(id)` actualiza estado. `reset()` limpia todo incluyendo localStorage. `nextStep()` incrementa step.
- **Riesgo**: Alto. Es el eje de todo el wizard. Si el estado no fluye bien, los 6 pasos se rompen. Mitigación: tests unitarios del contexto primero (sin componentes).
- **Estado**: ✅ COMPLETADO

#### TASK-007 — StepBarberSelect (Paso 1)

- **Descripción**: Renderiza lista de barberos vía `useBarbers()`. Muestra nombre + precio. Selección con highlight visual. Botón "Continuar" deshabilitado hasta seleccionar. Estados: loading (Skeleton), error (mensaje + Reintentar), empty ("No hay barberos disponibles").
- **Archivos**: Crear `src/components/booking/StepBarberSelect.jsx`
- **Dependencies**: TASK-003, TASK-005, TASK-006
- **Estimación**: 1.5h
- **DoD**: Escenarios BOOK-01-S1, S2, S3 pasan. Click en barbero llama a `selectBarber()` del contexto.
- **Estado**: ✅ COMPLETADO

#### TASK-008 — StepServiceSelect (Paso 2)

- **Descripción**: Renderiza lista de servicios vía `useServices()`. Muestra nombre + precio + duración. Depende de barberId del paso 1. Mismo patrón loading/error/empty que paso 1. Botón "Continuar" deshabilitado hasta seleccionar.
- **Archivos**: Crear `src/components/booking/StepServiceSelect.jsx`
- **Dependencies**: TASK-003, TASK-005, TASK-006
- **Estimación**: 1h
- **DoD**: Escenarios BOOK-02-S1, S2 pasan. Muestra precio correcto.
- **Estado**: ✅ COMPLETADO

#### TASK-009 — StepDateSelect (Paso 3)

- **Descripción**: Datepicker nativo `<input type="date">` con `min=today` y `max=today+30`. Fechas fuera de rango deshabilitadas por el browser. Muestra fecha seleccionada. Botón "Continuar" habilitado solo con fecha válida.
- **Archivos**: Crear `src/components/booking/StepDateSelect.jsx`
- **Dependencies**: TASK-003, TASK-006
- **Estimación**: 1h
- **DoD**: Escenarios BOOK-03-S1, S2, S3 pasan. Datepicker no permite fechas pasadas ni >30 días.
- **Estado**: ✅ COMPLETADO

#### TASK-010 — useAvailability + StepSlotSelect (Paso 4)

- **Descripción**: Hook `useAvailability(barberId, date)`: fetch `GET /api/v1/availability/barbers/{id}/slots?date={date}`, retorna `{ slots, loading, error, refetch }`. StepSlotSelect renderiza grilla de slots. Slots `available:false` aparecen disabled/grises. Sin slots muestra "No hay horarios disponibles. Seleccioná otra fecha."
- **Archivos**: Crear `src/hooks/useAvailability.js`, `src/components/booking/StepSlotSelect.jsx`
- **Dependencies**: TASK-002, TASK-003, TASK-006, TASK-009
- **Estimación**: 1.5h
- **DoD**: Escenarios BOOK-04-S1, S2, S3 pasan. Slots disponibles son cliqueables, no-disponibles no.
- **Estado**: ✅ COMPLETADO

#### TASK-011 — StepClientForm (Paso 5)

- **Descripción**: Formulario con nombre y teléfono. Validaciones inline: nombre 1-100 chars (requerido), teléfono regex `^\+?[\d\s-]{7,20}$` (requerido). Pre-completar desde localStorage si existen datos previos. Botón "Continuar" habilitado solo si ambos campos son válidos.
- **Archivos**: Crear `src/components/booking/StepClientForm.jsx`
- **Dependencies**: TASK-003, TASK-006
- **Estimación**: 1.5h
- **DoD**: Escenarios BOOK-05-S1, S2, S3, S4 pasan. Errores se muestran inline debajo de cada campo.
- **Estado**: ✅ COMPLETADO

#### TASK-012 — StepConfirm + BookingSuccess (Paso 6)

- **Descripción**: StepConfirm muestra resumen completo (barbero, servicio, fecha, hora, datos cliente). Botón "Confirmar Reserva" envía `POST /api/v1/appointments`. Manejo de 409 (slot ocupado → volver paso 4) y 500 (error + reintentar). BookingSuccess: pantalla de éxito con datos de la reserva, botón "Nueva Reserva" que resetea wizard.
- **Archivos**: Crear `src/components/booking/StepConfirm.jsx`, `src/components/booking/BookingSuccess.jsx`
- **Dependencies**: TASK-002, TASK-003, TASK-006, TASK-007, TASK-008, TASK-009, TASK-010, TASK-011
- **Estimación**: 2h
- **DoD**: Escenarios BOOK-06-S1, S2, S3 pasan. Confirmación exitosa redirige a `/booking/success`. 409 vuelve al paso 4.
- **Estado**: ✅ COMPLETADO

#### TASK-013 — BookingPage + WizardProgress + Routing

- **Descripción**: BookingPage renderiza el paso activo según `step` del contexto. WizardProgress muestra timeline vertical/horizontal con pasos completados, activo y pendientes. Configurar ruta `/booking` y `/booking/success` en el router. Integrar todos los steps.
- **Archivos**: Crear `src/pages/BookingPage.jsx`, `src/components/booking/WizardProgress.jsx`, modificar `src/App.jsx` (router)
- **Dependencies**: TASK-007 a TASK-012
- **Estimación**: 1.5h
- **DoD**: Navegando a `/booking` se ve el paso 1. Completando pasos secuencialmente se avanza. No se puede saltar pasos. No se puede ir a `/booking/success` sin completar wizard.
- **Estado**: ✅ COMPLETADO

#### TASK-014 ⚡ — Tests de integración del Wizard

- **Descripción**: Tests con RTL que recorren el camino feliz completo (BOOK-01 a BOOK-06). Mocks de API con MSW o vi.fn(). Verificar flujo: seleccionar barbero → servicio → fecha → slot → formulario → confirmar. Testear escenario de error 409 y recuperación.
- **Archivos**: Crear `src/components/booking/__tests__/BookingWizard.integration.test.jsx`
- **Dependencies**: TASK-013
- **Estimación**: 2.5h
- **DoD**: 6 escenarios "camino feliz" + 3 casos de error cubiertos. Tests pasan sin warnings.
- **Estado**: ✅ COMPLETADO

---

## Phase 3: Auth + Admin

Dependencies: Phase 1 + TASK-013 (BookingPage routing completa).

### PR 3 — Auth, Admin Layout, Dashboard, CRUD Barberos/Servicios

---

#### TASK-015 🔴 — AuthContext + useAuth

- **Descripción**: Contexto con `{ user, isAuthenticated, login(username, password), logout(), loading }`. Login: `POST /api/v1/auth/login`, recibe csrf_token → lo setea en api client. Logout: `POST /api/v1/auth/logout`, limpia estado. `checkAuth()` en mount: `GET /api/v1/auth/me`. Provider protege rutas admin.
- **Archivos**: Crear `src/contexts/AuthContext.jsx`, `src/hooks/useAuth.js` (o inline en contexto)
- **Dependencies**: TASK-002
- **Estimación**: 2h
- **DoD**: login() con credenciales válidas setea `isAuthenticated=true`. Login inválido retorna error sin setear auth. logout() limpia estado y redirige. Ruta protegida redirige a `/admin/login` si no autenticado.

#### TASK-016 — LoginPage

- **Descripción**: Formulario de login con username + password. Validación frontend: campos no vacíos. Botón "Ingresar" con loading spinner. Error inline "Credenciales inválidas" en 401. Redirect a `/admin/dashboard` en éxito.
- **Archivos**: Crear `src/pages/LoginPage.jsx`
- **Dependencies**: TASK-003, TASK-015
- **Estimación**: 1.5h
- **DoD**: Escenarios AUTH-01-S1, S2, S3 pasan. Campos vacíos bloquean submit. Credenciales inválidas muestran error.

#### TASK-017 — AdminLayout + Sidebar

- **Descripción**: Layout protegido (verifica `isAuthenticated`). Sidebar con links: Dashboard, Barberos, Servicios, Precio Global, Cerrar Sesión. Header con nombre de usuario. Mobile: sidebar colapsable o hamburger. Contenido en outlet/modal.
- **Archivos**: Crear `src/components/admin/AdminLayout.jsx`, `src/components/admin/Sidebar.jsx`
- **Dependencies**: TASK-015
- **Estimación**: 2h
- **DoD**: Layout envuelve rutas admin. Sidebar navega entre secciones. Cerrar Sesión llama a logout() y redirige. Sin auth, redirige a `/admin/login`.

#### TASK-018 — DashboardPage + MetricCard + AppointmentList

- **Descripción**: Dashboard con 3 MetricCards (turnos hoy, ingresos estimados, barberos activos) + AppointmentList (próximos 5 turnos). Fetch paralelo: `GET /api/v1/appointments?date=today`, `GET /api/v1/barbers`, `GET /api/v1/services`. States: loading (Skeleton cards), error por card individual, empty ("No hay turnos hoy").
- **Archivos**: Crear `src/pages/admin/DashboardPage.jsx`, `src/components/admin/MetricCard.jsx`, `src/components/admin/AppointmentList.jsx`
- **Dependencies**: TASK-002, TASK-003, TASK-004, TASK-017
- **Estimación**: 2.5h
- **DoD**: Escenarios ADMIN-DASH-01-S1, S2 pasan. Cada card se carga independientemente. Error en una no rompe las otras.

#### TASK-019 🔴 — BarbersPage + BarberForm (CRUD)

- **Descripción**: Página con tabla de barberos (listar). Botón "Nuevo Barbero" abre Modal con BarberForm. Crear: `POST /api/v1/barbers`. Editar: `PUT /api/v1/barbers/{id}` (mismo modal, pre-cargado). Eliminar: confirmación en Modal, `DELETE /api/v1/barbers/{id}`. Manejar 409 en delete. Validaciones: nombre requerido, teléfono regex, precio > 0.
- **Archivos**: Crear `src/pages/admin/BarbersPage.jsx`, `src/components/admin/BarberForm.jsx`
- **Dependencies**: TASK-002, TASK-003, TASK-004, TASK-005, TASK-017
- **Estimación**: 3h
- **DoD**: Escenarios ADMIN-BARB-01, 02, 03 pasan. CRUD completo. 409 muestra error específico. Tabla se actualiza después de crear/editar/eliminar.

#### TASK-020 — ServicesPage + ServiceForm + GlobalPriceForm (CRUD)

- **Descripción**: Página con tabla de servicios + botón "Nuevo Servicio". Modal con ServiceForm (nombre, precio, duración). Mismo patrón create/edit/delete que BarbersPage. Sección separada para Precio Global: formulario simple con input numérico, `PUT /api/v1/global-price`. Validaciones: nombre req, precio>0, duración>0.
- **Archivos**: Crear `src/pages/admin/ServicesPage.jsx`, `src/components/admin/ServiceForm.jsx`, `src/components/admin/GlobalPriceForm.jsx`
- **Dependencies**: TASK-002, TASK-003, TASK-004, TASK-017
- **Estimación**: 2.5h
- **DoD**: Escenarios ADMIN-SERV-01, 02, 03 y ADMIN-PREC-01 pasan. CRUD completo + precio global.

#### TASK-021 — ProtectedRoute + Routing Admin

- **Descripción**: Componente `ProtectedRoute` que verifica `isAuthenticated` y redirige a `/admin/login` si no hay sesión. Configurar rutas admin: `/admin/dashboard`, `/admin/barbers`, `/admin/services`, `/admin/login`. Ruta `*` redirige a `/booking`.
- **Archivos**: Crear `src/components/admin/ProtectedRoute.jsx`, modificar `src/App.jsx`
- **Dependencies**: TASK-015, TASK-017
- **Estimación**: 1h
- **DoD**: Sin auth, `/admin/*` redirige a login. Con auth, login redirige a dashboard. Ruta `/` redirige a `/booking`.

#### TASK-022 ⚡ — Tests de integración Auth + Admin

- **Descripción**: Tests RTL para login exitoso/fallido, navegación del sidebar, renderizado del dashboard con datos mockeados, CRUD de barberos (crear, editar, eliminar con confirmación), CRUD de servicios.
- **Archivos**: Crear `src/pages/admin/__tests__/AdminFlow.integration.test.jsx`
- **Dependencies**: TASK-016, TASK-018, TASK-019, TASK-020, TASK-021
- **Estimación**: 3h
- **DoD**: 8 escenarios cubiertos (login feliz, login error, dashboard carga, barberos CRUD, servicios CRUD). Tests con mocks de API.

---

## Phase 4: Testing + Pulido

Dependencies: Todo lo anterior completado.

### PR 4 — Tests Unitarios, Accesibilidad, Performance

---

#### TASK-023 ⚡ — Tests unitarios de UI Components

- **Descripción**: Tests unitarios con RTL para Button (variants, disabled, loading), Input (label, error, onChange), Select (options, selection), Modal (open/close, escape), Toast (auto-dismiss, variants). Sin mocks de red.
- **Archivos**: Crear `src/components/ui/__tests__/*.test.jsx` (8 archivos)
- **Dependencies**: TASK-003, TASK-004
- **Estimación**: 2h
- **DoD**: Cada componente prueba rendering con distintos props. Event handlers funcionan. Estados visuales correctos.

#### TASK-024 ⚡ — Tests unitarios de Contextos y Hooks

- **Descripción**: BookingContext: testear `selectBarber`, `nextStep`, `reset`, persistencia localStorage. AuthContext: testear login/logout, estado auth. useBarbers/useServices/useAvailability: testear fetch, refetch, error handling.
- **Archivos**: Crear `src/contexts/__tests__/BookingContext.test.jsx`, `src/contexts/__tests__/AuthContext.test.jsx`, `src/hooks/__tests__/useBarbers.test.js`, `src/hooks/__tests__/useServices.test.js`, `src/hooks/__tests__/useAvailability.test.js`
- **Dependencies**: TASK-005, TASK-006, TASK-010, TASK-015
- **Estimación**: 2.5h
- **DoD**: Tests de booking: paso inicial=1, selectBarber actualiza, reset limpia. Tests de auth: login setea estado, logout limpia. Hooks: loading/data/error cycle.

#### TASK-025 — Accesibilidad

- **Descripción**: Revisar y corregir: labels en inputs, aria-labels en iconos/acciones, roles en landmarks, focus trapping en Modal, focus management en wizard steps, contraste de colores, mensajes de error asociados via `aria-describedby`. Wrap AdminLayout con `role="navigation"` en sidebar.
- **Archivos**: Modificar componentes UI y booking/admin según auditoría
- **Dependencies**: TASK-007 a TASK-012, TASK-016 a TASK-020
- **Estimación**: 2h
- **DoD**: Lighthouse Accessibility score > 90. Navegación por teclado funcional en wizard y admin. Modal atrapa foco.

#### TASK-026 — Performance (Lazy Loading + Cache)

- **Descripción**: Lazy loading de páginas admin con `React.lazy()` + `Suspense`. Cache de respuestas GET en api client (TTL 30s). Memoización de componentes pesados con `React.memo`. Prefetch de datos del paso 1 al cargar BookingPage.
- **Archivos**: Modificar `src/App.jsx`, `src/lib/api.js`, componentes pesados
- **Dependencies**: TASK-002, TASK-013, TASK-021
- **Estimación**: 1.5h
- **DoD**: Lazy loading rompe el bundle en chunks (verificar con build). Cache evita re-fetch dentro del TTL. Sin regresiones visuales.

#### TASK-027 — Configuración de Testing + CI

- **Descripción**: Configurar Vitest, RTL, jsdom, setup global. Crear archivo `src/setupTests.js` con mocking de fetch y providers globales. Scripts en `package.json`: `npm run test`, `npm run test:coverage`. Configurar GitHub Actions para correr tests en PR.
- **Archivos**: `vitest.config.js` (o en `vite.config.js`), `src/setupTests.js`, modificar `package.json`, crear `.github/workflows/test.yml`
- **Dependencies**: TASK-001
- **Estimación**: 1.5h
- **DoD**: `npm run test` corre todos los tests. Coverage report generado. CI pasa en PR.

---

## Resumen

| Phase | Tasks | Estimación total | Foco |
|-------|-------|-----------------|------|
| 1 — Cimientos | 5 | 8.5h | Scaffold, API, UI base, hooks |
| 2 — Booking | 8 | 12h | Wizard 6 pasos + tests |
| 3 — Auth + Admin | 8 | 17.5h | Login, dashboard, CRUD, tests |
| 4 — Testing + Pulido | 5 | 9.5h | Tests unitarios, a11y, perf, CI |
| **Total** | **26** | **47.5h** | |

### Tareas Críticas 🔴
- TASK-001 (Scaffold) — todo depende de esto
- TASK-002 (API Client) — toda comunicación con backend
- TASK-006 (BookingContext) — eje del wizard
- TASK-015 (AuthContext) — base de toda la sección admin
- TASK-019 (BarbersPage CRUD) — el CRUD más complejo del admin

### Tareas Paralelizables ⚡
- TASK-003 y TASK-004 (UI components) — pueden hacerse simultáneamente
- TASK-005 (hooks base) — puede ir en paralelo con UI components si TASK-002 está lista
- TASK-014 y TASK-022 (tests integration) — pueden ir en paralelo con otra fase si se planifica
- TASK-023 y TASK-024 (tests unitarios) — completamente independientes entre sí

### Riesgos Clave

| Riesgo | Tareas afectadas | Mitigación |
|--------|-----------------|------------|
| Contrato API cambia | 2, 7-13, 18-20 | Validar contratos con backend primero. Usar constantes de endpoints. |
| CSRF token no accesible desde fetch | 2, 15 | Setter global en api.js que AuthContext llama después del login. |
| Estado del wizard se pierde en recarga | 6-13 | Persistencia en localStorage con recuperación al montar BookingContext. |
| Slots no se actualizan al cambiar fecha | 10 | useEffect con dependencia `[barberId, date]` para re-fetch automático. |
| Modal de confirmación de delete frágil | 19, 20 | Estado local de "confirming" en el modal, no depende de contexto global. |
