# Backend — Playa (catalogo)
> Asume BACKEND_RULES.md.

- Tabla `unidades`: marca, modelo, version, anio, km, precio_usd, cuota_ars, patente,
  estado, ingresada_el, segmento, motor, caja, combustible, color.
- `diasPlaya` se deriva de `ingresada_el`, no se guarda.
- `precioReferencia(km)` y `desvioPct()` son diseño: viven en el cliente con `theme.banda`.
- Un 0km no tiene patente hasta el patentamiento: la columna admite NULL.
- Reemplazar: modules/catalogo/api.ts. Misma firma.
