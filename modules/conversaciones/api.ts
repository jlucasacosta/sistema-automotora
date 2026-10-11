// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// Cada hilo esta atado a una unidad: en una automotora nadie escribe "hola", escribe
// "¿sigue disponible el Sable?". Datos 100% ficticios.

import raw from "./data.json"

export type Mensaje = { id: string; de: "cliente" | "vendedor"; texto: string; hora: string }

export type Hilo = {
  id: string
  cliente: string
  unidad: string
  canal: "whatsapp" | "portal" | "web"
  ultimo: string
  hora: string
  sinLeer: number
  mensajes: Mensaje[]
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function getHilos(): Promise<Hilo[]> {
  await sleep(300)
  return structuredClone(raw.hilos) as Hilo[]
}
