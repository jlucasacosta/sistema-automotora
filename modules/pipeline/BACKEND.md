# Backend — Embudo (pipeline)
> Asume BACKEND_RULES.md.

- Tabla `deals`: id, cliente_id, unidad_id, etapa, monto, permuta (jsonb), vendedor_id,
  ultimo_contacto (timestamptz), sena_vence_el (date).
- `diasSinContacto` y `senaDias` se derivan de timestamps en la query, no se guardan.
- `moverDeal(id, etapa)` -> UPDATE con RLS por vendedor + trigger de auditoría de etapa.
- Realtime: suscribir a `deals` para que los trapecios se re-escalen solos.
- Reemplazar: modules/pipeline/api.ts. Misma firma.
- Errores de carga: si la query falla, la función del `api.ts` lanza un `Error`. `useCarga`
  (`shell/carga.tsx`) lo captura y la pantalla muestra el aviso con "Reintentar"; mientras carga
  muestra `—` y un esqueleto estático, nunca un 0 falso.
