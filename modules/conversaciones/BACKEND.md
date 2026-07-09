# Backend — Mensajes (conversaciones)
> Asume BACKEND_RULES.md.

- Tablas `hilos` y `mensajes`, con `unidad_id` en el hilo: en este rubro toda charla
  arranca por una unidad.
- Entrada por webhook de WhatsApp Business / portal. Realtime sobre `mensajes`.
- Reemplazar: modules/conversaciones/api.ts. Misma firma.
