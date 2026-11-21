# PWA y notificaciones push

- Manifiestos: `pwa/manifest.webmanifest` (sitio) y `pwa/manifest-admin.webmanifest` (gestión, `start_url: /gestion?source=pwa`, `scope: /gestion/`).
- Iconos: `pwa/icon-192|512.png`, `icon-maskable-*.png`, `apple-touch-icon.png`, `badge-96.png` (monocromo, para la barra de estado de Android), `splash-*`.
- Service worker: caché de la shell y de la agenda del día; página `/offline` (pantalla "Sin conexión"); recepción de `push` y `notificationclick` (abre `/gestion/citas/:id`).
- Instalación: capturar `beforeinstallprompt` y mostrar la pantalla "Instalar" (`screens/pwa/PwaInstalar.dc.html`).
- Avisos: pedir permiso solo tras un gesto del usuario (pantalla "Permiso de avisos"); guardar la suscripción Web Push en `push_subscriptions`; enviar con VAPID desde el servidor.
- Carga útil sugerida: `{titulo, cuerpo, url, tag: "cita-<id>", acciones: [confirmar, ver]}`.
- Estados a cubrir: permiso denegado, navegador sin soporte, suscripción vencida (renovar al abrir la app).
