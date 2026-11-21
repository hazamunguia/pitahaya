# Modelo de datos (propuesta)

Montos en MXN enteros (pesos). Fechas en UTC; mostrar en `America/Mexico_City`.

| Entidad | Campos clave |
|---|---|
| `users` | id, rol (`owner` \| `client`), nombre, celular (único, E.164), correo?, creado_en |
| `otp_codes` | celular, código_hash, expira_en, intentos |
| `services` | id, slug, nombre, descripción, duración_min, precio_base, admite_diseño, visible, orden |
| `designs` | id, nombre, precio_extra, minutos_extra, imagen?, etiquetas[], visible, orden |
| `courtesies` | id, nombre, opciones[] (sabores), disponible, orden. La opción "No, gracias" es implícita |
| `appointments` | id, folio (`PIT-0001`), client_id, service_id, design_id?, custom_design_id?, courtesy_id?, inicia_en, termina_en, estado, precio_base, precio_diseño, total, nota_clienta, nota_interna, origen (`web` \| `manual`), motivo_cancelación?, creado_en |
| `custom_designs` | id, client_id, appointment_id, imagen_url, nota_clienta, estado (`pending` \| `quoted` \| `accepted` \| `rejected`), precio_cotizado?, minutos_extra?, mensaje?, cotizado_en? |
| `availability_rules` | día_semana (0-6), abierto, desde, hasta, descansos[] |
| `settings` | intervalo_min (30), anticipación_min_h (2), límite_cambios_h (24), ventana_reserva_días (30), auto_confirmar (decisión abierta) |
| `blocked_slots` | id, inicia_en, termina_en, motivo, repite_semanal |
| `closed_days` | fecha, etiqueta |
| `message_templates` | clave (`confirmacion`, `recordatorio_24h`, `cotizacion_lista`, `cancelada`, `reagendada`), activo, cuerpo con variables `[nombre]` `[servicio]` `[día]` `[hora]` `[total]` `[dirección]` |
| `push_subscriptions` | id, user_id, endpoint, p256dh, auth, user_agent, creado_en, visto_en |
| `notifications` | id, tipo, payload, leída_en, creada_en |
| `status_history` | appointment_id, de, a, por, en |

## Estados de una cita

`pending` (Pendiente) → `confirmed` (Confirmada) → `done` (Realizada)
`pending` o `confirmed` → `cancelled` (Cancelada)
`quote` (Por cotizar): la clienta subió su propio diseño. Karina cotiza → la clienta acepta → `confirmed` con total actualizado; si rechaza → `cancelled` o cambia a un diseño de la casa.

Reglas: no se agenda en `blocked_slots`, `closed_days` ni fuera de `availability_rules`; no se traslapan citas; reagendar/cancelar solo hasta `límite_cambios_h` antes de la cita; total = precio_base + precio_diseño.
