# Backend — Tablero (dashboard)
> Asume BACKEND_RULES.md.

- Sin tablas propias: agrega `unidades` y `deals`.
- Los diales (panel-odometro) salen de vistas materializadas: ventas del mes, aging promedio,
  unidades fuera del corredor de precio, leads sin contacto.
- El scatter precio x km lee `unidades` con `km > 0`. La banda se calcula en el cliente
  con `theme.banda`: es diseño, no dato.
- NO hay feed de actividad: eliminado a proposito (ver DISENO.md).
- Reemplazar: modules/dashboard/api.ts (mock -> queries agregadas). Misma firma.
