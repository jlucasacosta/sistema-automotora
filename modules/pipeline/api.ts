// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// El dato sigue al arquetipo: un embudo necesita etapa + monto, no filas de tabla.
// Personas, marcas y telefonos 100% ficticios.
import type { Etapa } from "@/shell/automotora"
import raw from "./data.json"

export type Canal = "showroom" | "portal" | "web" | "whatsapp" | "referido" | "telefono"

export type Permuta = { modelo: string; anio: number; toma: number } // toma en USD

export type Deal = {
  id: string
  cliente: string
  telefono: string
  canal: Canal
  unidadId: string
  etapa: Etapa
  monto: number // USD del negocio
  permuta: Permuta | null
  diasSinContacto: number
  proximoPaso: string
  vendedor: string
  senaDias?: number // dias que le quedan a la reserva. Negativo = VENCIDA.
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function getDeals(): Promise<Deal[]> {
  await sleep(300)
  return structuredClone(raw.deals) as Deal[]
}

// Al mover una ficha de etapa, el ancho de los dos trapecios cambia: el ancho ES el dato.
export async function moverDeal(id: string, etapa: Etapa): Promise<void> {
  await sleep(120)
  void id
  void etapa
}
