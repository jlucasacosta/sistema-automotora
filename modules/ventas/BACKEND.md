# Backend — Ventas (boletos)
> Asume BACKEND_RULES.md.

- Tabla `boletos`: deal_id, unidad_id, comprador_id, precio_usd, sena, forma_pago, estado,
  vendedor_id, comision.
- `saldo` es una columna generada (precio - sena), no se guarda a mano.
- `estado = rechazada` viene del webhook del prendario; `anulada` es una acción del usuario.
- Reemplazar: modules/ventas/api.ts. Misma firma.
