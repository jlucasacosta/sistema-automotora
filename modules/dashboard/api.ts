// PATRON MOCK. Misma firma que la query real. Ver BACKEND.md.
// El dashboard NO tiene feed de actividad (componente ELIMINADO, ver DISENO.md):
// el evento de una automotora no es una linea de log, es una ficha que se mueve
// de trapecio. Ese espacio se lo queda el scatter precio x km, que si dispara accion.
//
// Las cifras NO se escriben a mano: salen de las mismas listas que ve el usuario en las otras
// pantallas (unidades, leads, deals, boletos), asi el panel nunca contradice al resto.
// data.json solo guarda la configuracion de cada dial (escala y donde empieza la zona roja).
import type { Dial } from "@/shell/odometro"
import { nivelDeBanda, nivelDeSena } from "@/shell/automotora"
import { theme } from "@/shell/theme"
import { getUnidades, desvioPct } from "@/modules/catalogo/api"
import { getLeads } from "@/modules/contactos/api"
import { getDeals } from "@/modules/pipeline/api"
import { getBoletos, compradores } from "@/modules/ventas/api"
import raw from "./data.json"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function getDiales(): Promise<Dial[]> {
  await sleep(120)
  const [unidades, leads, boletos] = await Promise.all([getUnidades(), getLeads(), getBoletos()])
  const enPlaya = unidades.filter((u) => u.estado !== "vendida")
  const clientes = compradores(boletos)
  const valores: Record<string, number> = {
    "ventas-mes": boletos.filter((b) => b.estado === "cobrada").length,
    "aging-promedio": Math.round(enPlaya.reduce((s, u) => s + u.diasPlaya, 0) / (enPlaya.length || 1)),
    "sobre-corredor": enPlaya.filter((u) => u.km > 0 && nivelDeBanda(desvioPct(u)) === "sobre").length,
    "leads-frios": leads.filter((l) => !clientes.has(l.nombre) && l.diasSinContacto >= theme.lead.frio).length,
  }
  return structuredClone(raw.diales).map((d) => ({
    ...d,
    valor: valores[d.id] ?? 0,
    // la zona roja de la antiguedad es el limite de "tibio" del theme: no se escribe dos veces
    redlineDesde: d.id === "aging-promedio" ? theme.aging.tibio : d.redlineDesde,
  })) as Dial[]
}

export type Resumen = { valorEmbudo: number; seniasVigentes: number; seniasVencidas: number; entregasHoy: number }

export async function getResumen(): Promise<Resumen> {
  await sleep(120)
  const deals = await getDeals()
  const conSena = deals.filter((d) => d.etapa === "senia" && d.senaDias !== undefined)
  return {
    valorEmbudo: deals.filter((d) => d.etapa !== "entrega").reduce((s, d) => s + d.monto, 0),
    seniasVigentes: conSena.filter((d) => nivelDeSena(d.senaDias as number) !== "vencida").length,
    seniasVencidas: conSena.filter((d) => nivelDeSena(d.senaDias as number) === "vencida").length,
    entregasHoy: deals.filter((d) => d.etapa === "entrega").length,
  }
}
