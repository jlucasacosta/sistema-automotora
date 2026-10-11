# Backend — Playa (catalogo)
> Asume BACKEND_RULES.md.

- Tabla `unidades`: marca, modelo, version, anio, km, precio_usd, cuota_ars, patente,
  estado, ingresada_el, segmento, motor, caja, combustible, color.
- `diasPlaya` se deriva de `ingresada_el`, no se guarda.
- `precioReferencia(km)` y `desvioPct()` son diseño: viven en el cliente con `theme.banda`.
- Un 0km no tiene patente hasta el patentamiento: la columna admite NULL.
- Reemplazar: modules/catalogo/api.ts. Misma firma.
- Errores de carga: si la query falla, la función del `api.ts` lanza un `Error`. `useCarga`
  (`shell/carga.tsx`) lo captura y la pantalla muestra el aviso con "Reintentar"; mientras carga
  muestra `—` y un esqueleto estático, nunca un 0 falso.
- Ficha de la unidad (clic en una tarjeta): muestra todos los campos de `unidades`. Las acciones
  "Enviar cotización", "Agendar test drive", "Reservar unidad" y "Liberar unidad" hoy solo cambian
  estado local (`estado` de la unidad). Con backend real: `update unidades set estado = ...` y
  un registro de la cotización / el test drive.
- Las unidades vendidas siguen en `unidades` con `estado = 'vendida'` (el boleto las referencia):
  no muestran días en stock ni entran al corredor de precios.
