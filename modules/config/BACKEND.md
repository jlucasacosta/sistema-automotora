# Backend — Configuración
> Asume BACKEND_RULES.md.

- Sin tablas: hoy lee `shell/theme.ts`. Al conectar backend, `theme` se persiste por
  tenant en una tabla `settings` (jsonb) y se hidrata en el layout.
- Las constantes de dominio (aging, lead, sena, banda) son configuración del negocio,
  no constantes de código: viajan en el mismo jsonb.
