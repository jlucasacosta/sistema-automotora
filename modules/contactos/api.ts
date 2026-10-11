// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// Personas, telefonos y mails 100% ficticios. Los patrones de mail estan mezclados a
// proposito (nombre.apellido, inicial+apellido, apodo, guion bajo, con numero, sin
// separador) y ninguno pasa el 30%: un listado uniforme grita "generado".

import raw from "./data.json"

export type Canal = "showroom" | "portal" | "web" | "whatsapp" | "referido" | "telefono"

export type Lead = {
  id: string
  nombre: string
  email: string
  telefono: string
  canal: Canal
  interes: string
  presupuesto: number // USD
  diasSinContacto: number
  vendedor: string
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function getLeads(): Promise<Lead[]> {
  await sleep(300)
  return structuredClone(raw.leads) as Lead[]
}
