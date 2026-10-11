# Backend — Tablero (dashboard)
> Asume BACKEND_RULES.md.

- Sin tablas propias: agrega `unidades` y `deals`.
- Los diales (panel-odometro) salen de vistas materializadas: ventas del mes, aging promedio,
  unidades fuera del corredor de precio, leads sin contacto.
- El scatter precio x km lee `unidades` con `km > 0`. La banda se calcula en el cliente
  con `theme.banda`: es diseño, no dato.
- NO hay feed de actividad: eliminado a propósito (ver DISENO.md).
- Reemplazar: modules/dashboard/api.ts (mock -> queries agregadas). Misma firma.
- Errores de carga: si la query falla, la función del `api.ts` lanza un `Error`. `useCarga`
  (`shell/carga.tsx`) lo captura y la pantalla muestra el aviso con "Reintentar"; mientras carga
  muestra `—` y un esqueleto estático, nunca un 0 falso.
- El frontend calcula las cifras desde las mismas listas que ven las otras pantallas (unidades,
  leads, deals, boletos); el backend real las entrega ya agregadas en `v_diales` y `v_resumen`
  (ver docs/IMPLEMENTAR.md). `data.json` solo trae la configuración de cada dial.
- "Leads fríos" no cuenta a quienes ya compraron; "Sobre el corredor" y la antigüedad no cuentan
  unidades vendidas.
