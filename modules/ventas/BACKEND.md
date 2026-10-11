# Backend — Ventas (boletos)
> Asume BACKEND_RULES.md.

- Tabla `boletos`: deal_id, unidad_id, comprador_id, precio_usd, sena, forma_pago, estado,
  vendedor_id, comision.
- `saldo` es una columna generada (precio - sena), no se guarda a mano.
- `estado = rechazada` viene del webhook del prendario; `anulada` es una acción del usuario.
- Reemplazar: modules/ventas/api.ts. Misma firma.
- Errores de carga: si la query falla, la función del `api.ts` lanza un `Error`. `useCarga`
  (`shell/carga.tsx`) lo captura y la pantalla muestra el aviso con "Reintentar"; mientras carga
  muestra `—` y un esqueleto estático, nunca un 0 falso.
- Ficha del boleto (clic en la tarjeta): todos los campos de `boletos` más seña como % del precio,
  saldo y comisión. Acciones "Registrar cobro", "Reintentar financiación", "Anular boleto" y
  "Enviar boleto": hoy cambian estado local o no guardan nada. Con backend real el cambio de
  `estado` va en un `update boletos` con RLS por vendedor.
- Una venta rechazada o anulada no genera comisión.
