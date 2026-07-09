# Backend — Configuracion
> Asume BACKEND_RULES.md.

- Sin tablas: hoy lee `shell/theme.ts`. Al conectar backend, `theme` se persiste por
  tenant en una tabla `settings` (jsonb) y se hidrata en el layout.
- Las constantes de dominio (aging, lead, sena, banda) son configuracion del negocio,
  no constantes de codigo: viajan en el mismo jsonb.
