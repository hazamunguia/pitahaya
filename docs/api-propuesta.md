# API (propuesta)

## Pública
- `GET  /api/availability?service=:id&month=2026-11` → días con cupo
- `GET  /api/availability/day?service=:id&date=2026-11-23` → horarios libres
- `GET  /api/services`, `/api/designs`, `/api/courtesies`
- `POST /api/uploads/design` → sube imagen (JPG/PNG/HEIC, máx. 10 MB) → `{url}`
- `POST /api/appointments` → crea cita. Error `409 slot_taken` si el horario se ocupó (pantalla "Horario ocupado")

## Clienta (sesión por código OTP)
- `POST /api/auth/otp/request` `{celular}` · `POST /api/auth/otp/verify` `{celular, código}`
- `GET  /api/me/appointments?scope=upcoming|past` · `GET /api/me/appointments/:id`
- `POST /api/me/appointments/:id/reschedule` · `POST /api/me/appointments/:id/cancel`
- `GET/PATCH /api/me` · `GET /api/me/designs`

## Gestión (rol `owner`)
- Citas: `GET/POST /api/admin/appointments`, `PATCH /api/admin/appointments/:id` (estado, notas, reagendar)
- Calendario: `GET /api/admin/calendar?from&to`, `POST/DELETE /api/admin/blocks`
- Cotizaciones: `GET /api/admin/quotes`, `POST /api/admin/quotes/:id` `{precio, minutos, mensaje}`
- Catálogos: CRUD `/api/admin/services`, `/designs`, `/courtesies`
- Clientas: `GET /api/admin/clients`, `GET /api/admin/clients/:id`
- Configuración: `/api/admin/hours`, `/closed-days`, `/templates`, `/settings`
- Reportes: `GET /api/admin/reports?from&to`
- Push: `POST /api/admin/push/subscribe`, `DELETE …/subscribe`, `POST …/test`

## Eventos que generan aviso a Karina (push + centro de notificaciones)
Nueva reserva · Diseño por cotizar · Reserva reagendada · Cita cancelada · (opcional) resumen diario 8:00.

## Mensajes automáticos a la clienta (WhatsApp)
Confirmación al agendar · Recordatorio 24 h antes · Cotización lista · Cancelada · Reagendada.
