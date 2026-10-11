// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// El dashboard NO tiene feed de actividad (componente ELIMINADO, ver DISENO.md):
// el evento de una automotora no es una linea de log, es una ficha que se mueve
// de trapecio. Ese espacio se lo queda el scatter precio x km, que si dispara accion.
import type { Dial } from "@/shell/odometro"
import raw from "./data.json"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function getDiales(): Promise<Dial[]> {
  await sleep(280)
  return structuredClone(raw.diales) as Dial[]
}

export type Resumen = { valorEmbudo: number; seniasActivas: number; seniasVencidas: number; entregasHoy: number }

export async function getResumen(): Promise<Resumen> {
  await sleep(200)
  return structuredClone(raw.resumen) as Resumen
}
