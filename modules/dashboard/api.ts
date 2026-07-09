// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// El dashboard NO tiene feed de actividad (componente ELIMINADO, ver DISENO.md):
// el evento de una automotora no es una linea de log, es una ficha que se mueve
// de trapecio. Ese espacio se lo queda el scatter precio x km, que si dispara accion.
import type { Dial } from "@/shell/odometro"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function getDiales(): Promise<Dial[]> {
  await sleep(280)
  return [
    // invertido: la zona roja esta ABAJO. Vender poco es el peligro.
    { id: "1", label: "Ventas del mes", valor: 17, max: 30, redlineDesde: 12, unidad: "u", invertido: true },
    // aging promedio: la zona roja esta arriba. Plata quieta en la playa.
    { id: "2", label: "Aging promedio", valor: 62, max: 120, redlineDesde: 60, unidad: "d" },
    { id: "3", label: "Sobre el corredor", valor: 5, max: 12, redlineDesde: 6, unidad: "u" },
    { id: "4", label: "Leads frios", valor: 3, max: 12, redlineDesde: 6, unidad: "" },
  ]
}

export type Resumen = { valorEmbudo: number; seniasActivas: number; seniasVencidas: number; entregasHoy: number }

export async function getResumen(): Promise<Resumen> {
  await sleep(200)
  return { valorEmbudo: 561800, seniasActivas: 2, seniasVencidas: 1, entregasHoy: 3 }
}
