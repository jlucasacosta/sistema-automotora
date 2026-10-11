# Backend — Embudo (pipeline)
> Asume BACKEND_RULES.md.

- Tabla `deals`: id, cliente_id, unidad_id, etapa, monto, permuta (jsonb), vendedor_id,
  ultimo_contacto (timestamptz), sena_vence_el (date).
- `diasSinContacto` y `senaDias` se derivan de timestamps en la query, no se guardan.
- `moverDeal(id, etapa)` -> UPDATE con RLS por vendedor + trigger de auditoría de etapa.
- Realtime: suscribir a `deals` para que los trapecios se re-escalen solos.
- Reemplazar: modules/pipeline/api.ts. Misma firma.
