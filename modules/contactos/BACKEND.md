# Backend — Leads (contactos)
> Asume BACKEND_RULES.md.

- Tabla `leads`: nombre, email, telefono, canal, interes, presupuesto_usd, vendedor_id,
  ultimo_contacto (timestamptz).
- `diasSinContacto` se deriva de `ultimo_contacto`. La temperatura la calcula el cliente
  con `theme.lead`: los umbrales son diseño.
- PII real: nunca en el repo. Estos datos son ficticios.
- Reemplazar: modules/contactos/api.ts. Misma firma.
