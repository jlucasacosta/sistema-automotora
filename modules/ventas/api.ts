// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// Datos 100% ficticios. Estados mezclados a proposito: un boleto rechazado y una
// anulacion tienen que verse en pantalla, o el sistema parece muerto.

import raw from "./data.json"

export type FormaPago = "contado" | "prendario" | "plan de ahorro" | "permuta + saldo"
export type EstadoBoleto = "cobrada" | "pendiente" | "rechazada" | "anulada"

export type Boleto = {
  id: string
  fecha: string
  comprador: string
  unidad: string
  patente: string | null
  precio: number // USD
  sena: number
  formaPago: FormaPago
  estado: EstadoBoleto
  vendedor: string
  comision: number
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function getBoletos(): Promise<Boleto[]> {
  await sleep(300)
  return structuredClone(raw.boletos) as Boleto[]
}
