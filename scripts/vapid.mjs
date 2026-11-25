// Genera las llaves para notificaciones push. Córrelo en tu compu: npm run vapid
// Pega las 3 líneas directamente en Vercel → Settings → Environment Variables (no las compartas en chats).
import * as webpush from "web-push";
const k = webpush.generateVAPIDKeys();
console.log("\nNEXT_PUBLIC_VAPID_PUBLIC_KEY=" + k.publicKey);
console.log("VAPID_PRIVATE_KEY=" + k.privateKey);
console.log("VAPID_SUBJECT=mailto:tu-correo@ejemplo.com\n");
