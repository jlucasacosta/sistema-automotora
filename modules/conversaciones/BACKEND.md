# Backend — Mensajes (conversaciones)
> Asume BACKEND_RULES.md.

- Tablas `hilos` y `mensajes`, con `unidad_id` en el hilo: en este rubro toda charla
  arranca por una unidad.
- Entrada por webhook de WhatsApp Business / portal. Realtime sobre `mensajes`.
- Reemplazar: modules/conversaciones/api.ts. Misma firma.
- Errores de carga: si la query falla, la función del `api.ts` lanza un `Error`. `useCarga`
  (`shell/carga.tsx`) lo captura y la pantalla muestra el aviso con "Reintentar"; mientras carga
  muestra `—` y un esqueleto estático, nunca un 0 falso.
