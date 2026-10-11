# Backend — Leads (contactos)
> Asume BACKEND_RULES.md.

- Tabla `leads`: nombre, email, telefono, canal, interes, presupuesto_usd, vendedor_id,
  ultimo_contacto (timestamptz).
- `diasSinContacto` se deriva de `ultimo_contacto`. La temperatura la calcula el cliente
  con `theme.lead`: los umbrales son diseño.
- PII real: nunca en el repo. Estos datos son ficticios.
- Reemplazar: modules/contactos/api.ts. Misma firma.
- Errores de carga: si la query falla, la función del `api.ts` lanza un `Error`. `useCarga`
  (`shell/carga.tsx`) lo captura y la pantalla muestra el aviso con "Reintentar"; mientras carga
  muestra `—` y un esqueleto estático, nunca un 0 falso.
- Ficha del contacto (clic en la fila): todos los campos de `leads` más la oportunidad abierta
  (`deals` por `lead_id`) y la compra (`boletos` cobrados). Un contacto con boleto cobrado es
  cliente: no tiene temperatura. Las acciones "Registrar llamada", "Enviar cotización" y
  "Agendar test drive" hoy no guardan nada: con backend real escriben `ultimo_contacto` y la actividad.
