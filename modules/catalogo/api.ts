// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// La playa es la fuente de verdad de la unidad: el embudo y el comparador la consumen.
// Marcas y modelos 100% INVENTADOS: nada de marcas registradas de terceros.
import { theme } from "@/shell/theme"
import raw from "./data.json"

export type Segmento = "hatch" | "sedan" | "suv" | "pickup" | "utilitario" | "electrico"
export type EstadoUnidad = "disponible" | "reservada" | "seniada" | "en preparacion" | "vendida"

export type Unidad = {
  id: string
  marca: string
  modelo: string
  version: string
  anio: number
  km: number
  precio: number // USD. Los autos se venden en dolares: es la firma del rubro.
  cuota: number // ARS estimada, 48 meses
  patente: string | null // 0km todavia sin patentar
  estado: EstadoUnidad
  diasPlaya: number
  segmento: Segmento
  motor: string
  caja: "manual" | "automatica" | "CVT" | "directa"
  combustible: "nafta" | "diesel" | "hibrido" | "electrico"
  color: string
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const unidades = (): Unidad[] => structuredClone(raw.unidades) as Unidad[]

// El corredor de precio de la playa. Los dos numeros viven en theme.banda:
// ningun componente los inventa. Solo aplica a USADOS: un 0km no tiene corredor.
export function precioReferencia(km: number) {
  return Math.max(theme.banda.base - theme.banda.caida * km, 8000)
}

export function desvioPct(u: Unidad) {
  if (u.km === 0) return 0
  return ((u.precio / precioReferencia(u.km)) - 1) * 100
}

export async function getUnidades(): Promise<Unidad[]> {
  await sleep(280)
  return unidades()
}

export async function getUnidad(id: string): Promise<Unidad | undefined> {
  await sleep(120)
  return unidades().find((u) => u.id === id)
}

// Solo los usados entran al corredor precio x km: un 0km no tiene mercado de usado.
export async function getUsados(): Promise<Unidad[]> {
  await sleep(280)
  return unidades().filter((u) => u.km > 0)
}
