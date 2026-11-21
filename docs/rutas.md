# Rutas y pantallas

Cada fila apunta al archivo de diseño en `screens/` (HTML de referencia exportado del lienzo).


## Sitio público

| Ruta | Pantalla | Acceso | Archivo de diseño |
|---|---|---|---|
| `/` | Landing | Pública | `screens/web/Landing.dc.html` |
| `/` | Landing · móvil | Pública | `screens/web/LandingMovil.dc.html` |
| `/servicios` | Servicios y precios | Pública | `screens/web/Servicios.dc.html` |
| `/servicios/:slug` | Detalle de servicio | Pública | `screens/web/ServicioDetalle.dc.html` |
| `/disenos` | Galería de diseños | Pública | `screens/web/Disenos.dc.html` |
| `/nosotras` | Nosotras | Pública | `screens/web/Nosotras.dc.html` |
| `/contacto` | Contacto | Pública | `screens/web/Contacto.dc.html` |
| `/preguntas` | FAQ y políticas | Pública | `screens/web/FAQ.dc.html` |
| `/*` | Error 404 | Pública | `screens/web/Error404.dc.html` |
| `/offline` | Sin conexión | Pública (PWA) | `screens/web/Offline.dc.html` |
| `menú` | Menú móvil | Pública | `screens/web/MenuMovil.dc.html` |
| `/servicios` | Servicios · móvil | Pública | `screens/web/ServiciosMovil.dc.html` |

## Reserva en línea

| Ruta | Pantalla | Acceso | Archivo de diseño |
|---|---|---|---|
| `/reservar` | Flujo completo (interactivo) | Pública | `screens/reserva/Reservar.dc.html` |
| `/reservar?paso=1` | 1 · Día y hora | Pública | `screens/reserva/Paso1Dia.dc.html` |
| `/reservar?paso=1` | 1 · Día sin horarios | Pública | `screens/reserva/Paso1DiaLleno.dc.html` |
| `/reservar?paso=2` | 2 · Servicio | Pública | `screens/reserva/Paso2Servicio.dc.html` |
| `/reservar?paso=3` | 3 · Diseño de la casa | Pública | `screens/reserva/Paso3Diseno.dc.html` |
| `/reservar?paso=3` | 3 · Subir diseño | Pública | `screens/reserva/Paso3DisenoSubir.dc.html` |
| `/reservar?paso=3` | 3 · Diseño subido | Pública | `screens/reserva/Paso3DisenoCargado.dc.html` |
| `/reservar?paso=4` | 4 · Cortesía | Pública | `screens/reserva/Paso4Cortesia.dc.html` |
| `/reservar?paso=5` | 5 · Tus datos | Pública | `screens/reserva/Paso5Datos.dc.html` |
| `/reservar?paso=5` | 5 · Validación | Pública | `screens/reserva/Paso5DatosError.dc.html` |
| `error 409` | Horario ocupado | Pública | `screens/reserva/ErrorHorarioOcupado.dc.html` |
| `/reservar/listo/:id` | Cita agendada | Pública | `screens/reserva/Confirmacion.dc.html` |
| `/reservar/listo/:id` | Cita agendada · por cotizar | Pública | `screens/reserva/ConfirmacionCotizar.dc.html` |
| `móvil` | Pasos 1 a 5 y confirmación | Pública | `screens/reserva/MovilPaso1.dc.html` |

## Panel de clienta

| Ruta | Pantalla | Acceso | Archivo de diseño |
|---|---|---|---|
| `/cuenta/acceso` | Acceso | Pública | `screens/cuenta/Acceso.dc.html` |
| `/cuenta/codigo` | Código | Pública | `screens/cuenta/Codigo.dc.html` |
| `/cuenta/codigo` | Código incorrecto | Pública | `screens/cuenta/CodigoError.dc.html` |
| `/cuenta/citas` | Mis citas | Clienta | `screens/cuenta/MisCitas.dc.html` |
| `/cuenta/citas` | Sin citas | Clienta | `screens/cuenta/MisCitasVacio.dc.html` |
| `/cuenta/citas/:id` | Detalle de cita | Clienta | `screens/cuenta/DetalleCita.dc.html` |
| `/cuenta/citas/:id/reagendar` | Reagendar | Clienta | `screens/cuenta/Reagendar.dc.html` |
| `/cuenta/citas/:id/cancelar` | Cancelar | Clienta | `screens/cuenta/CancelarCita.dc.html` |
| `/cuenta/disenos` | Mis diseños | Clienta | `screens/cuenta/Disenos.dc.html` |
| `/cuenta/perfil` | Mi perfil | Clienta | `screens/cuenta/Perfil.dc.html` |
| `móvil` | Acceso, citas, detalle y perfil | Clienta | `screens/cuenta/AccesoMovil.dc.html` |

## Panel de gestión · escritorio

| Ruta | Pantalla | Acceso | Archivo de diseño |
|---|---|---|---|
| `/gestion/login` | Login | Dueña | `screens/admin/Login.dc.html` |
| `/gestion` | Hoy | Dueña | `screens/admin/Dashboard.dc.html` |
| `/gestion/citas` | Citas (interactivo) | Dueña | `screens/admin/Citas.dc.html` |
| `/gestion/citas/:id` | Detalle de cita | Dueña | `screens/admin/DetalleCita.dc.html` |
| `/gestion/citas/nueva` | Nueva cita manual | Dueña | `screens/admin/NuevaCita.dc.html` |
| `/gestion/calendario` | Calendario semana | Dueña | `screens/admin/CalendarioSemana.dc.html` |
| `/gestion/calendario?vista=mes` | Calendario mes | Dueña | `screens/admin/CalendarioMes.dc.html` |
| `/gestion/calendario/bloquear` | Bloquear horario | Dueña | `screens/admin/BloquearHorario.dc.html` |
| `/gestion/cotizaciones` | Cotizaciones | Dueña | `screens/admin/Cotizaciones.dc.html` |
| `/gestion/cotizaciones/:id` | Cotizar diseño | Dueña | `screens/admin/CotizarDiseno.dc.html` |
| `/gestion/clientas` | Clientas | Dueña | `screens/admin/Clientas.dc.html` |
| `/gestion/clientas/:id` | Ficha de clienta | Dueña | `screens/admin/FichaClienta.dc.html` |
| `/gestion/servicios` | Servicios y precios | Dueña | `screens/admin/Servicios.dc.html` |
| `/gestion/disenos` | Catálogo de diseños | Dueña | `screens/admin/Disenos.dc.html` |
| `/gestion/horarios` | Horarios | Dueña | `screens/admin/Horarios.dc.html` |
| `/gestion/cortesias` | Cortesías | Dueña | `screens/admin/Cortesias.dc.html` |
| `/gestion/mensajes` | Mensajes | Dueña | `screens/admin/Mensajes.dc.html` |
| `/gestion/notificaciones` | Notificaciones | Dueña | `screens/admin/Notificaciones.dc.html` |
| `/gestion/reportes` | Reportes | Dueña | `screens/admin/Reportes.dc.html` |
| `/gestion/ajustes` | Ajustes | Dueña | `screens/admin/Ajustes.dc.html` |

## App móvil (PWA de gestión)

| Ruta | Pantalla | Acceso | Archivo de diseño |
|---|---|---|---|
| `/gestion (instalable)` | Instalar | Dueña | `screens/pwa/PwaInstalar.dc.html` |
| `permiso` | Permiso de avisos | Dueña | `screens/pwa/PwaPermiso.dc.html` |
| `permiso` | Diálogo del sistema | Dueña | `screens/pwa/PwaPermisoSistema.dc.html` |
| `/gestion/login` | Login | Dueña | `screens/pwa/PwaLogin.dc.html` |
| `/gestion` | Hoy | Dueña | `screens/pwa/PwaHoy.dc.html` |
| `/gestion/calendario` | Calendario | Dueña | `screens/pwa/PwaCalendario.dc.html` |
| `/gestion/citas/:id` | Detalle de cita | Dueña | `screens/pwa/PwaDetalle.dc.html` |
| `/gestion/citas/nueva` | Nueva cita | Dueña | `screens/pwa/PwaNuevaCita.dc.html` |
| `/gestion/cotizaciones` | Cotizar | Dueña | `screens/pwa/PwaCotizar.dc.html` |
| `/gestion/cotizaciones/:id` | Cotizar diseño | Dueña | `screens/pwa/PwaCotizarDetalle.dc.html` |
| `push` | Notificación push | Dueña | `screens/pwa/PwaPush.dc.html` |
| `/gestion/clientas` | Clientas | Dueña | `screens/pwa/PwaClientas.dc.html` |
| `/gestion/mas` | Más | Dueña | `screens/pwa/PwaMas.dc.html` |
