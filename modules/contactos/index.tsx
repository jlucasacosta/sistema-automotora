"use client"
import { useEffect, useState } from "react"
import { getLeads, type Lead, type Canal } from "./api"
import { chipLead, nivelDeLead, usd } from "@/shell/automotora"

// tabla-densa: el CRM de leads. Arquetipo de soporte, no el protagonista del sistema.
// El protagonista es el embudo. Aca el vendedor escanea filas buscando al que se enfria.

const chipCanal: Record<Canal, string> = {
  showroom: "bg-primary/20 text-fg",
  portal: "bg-info/15 text-info",
  web: "bg-info/15 text-info",
  whatsapp: "bg-success/15 text-success",
  referido: "bg-accent/20 text-accent",
  telefono: "bg-subtle text-muted",
}

export function ContactosPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [q, setQ] = useState("")

  useEffect(() => {
    getLeads().then(setLeads)
  }, [])

  const visibles = leads.filter(
    (l) =>
      l.nombre.toLowerCase().includes(q.toLowerCase()) ||
      l.interes.toLowerCase().includes(q.toLowerCase()),
  )
  const frios = leads.filter((l) => nivelDeLead(l.diasSinContacto) === "frio").length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">Leads</h1>
          <p className="text-[11px] text-muted">
            {leads.length} contactos · <span className="text-danger">{frios} enfriandose</span>
          </p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o interes"
          className="w-64 rounded border border-border bg-surface px-3 py-1.5 text-xs text-fg outline-none placeholder:text-muted focus:border-primary"
        />
      </div>

      <div className="surface-card overflow-x-auto">
        <table className="w-full min-w-[56rem] text-left">
          <thead>
            <tr className="border-b border-border text-[10px] uppercase tracking-widest text-muted">
              <th className="px-3 py-2 font-medium">Lead</th>
              <th className="px-3 py-2 font-medium">Contacto</th>
              <th className="px-3 py-2 font-medium">Canal</th>
              <th className="px-3 py-2 font-medium">Interes</th>
              <th className="px-3 py-2 text-right font-medium">Presupuesto</th>
              <th className="px-3 py-2 font-medium">Temperatura</th>
              <th className="px-3 py-2 font-medium">Vendedor</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((l) => (
              <tr key={l.id} className="border-b border-border transition-colors last:border-0 hover:bg-subtle">
                <td className="px-3 py-1.5">
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/25 font-heading text-[10px] font-bold text-fg">
                      {l.nombre[0]}
                    </span>
                    <span className="text-xs font-medium">{l.nombre}</span>
                  </span>
                </td>
                <td className="px-3 py-1.5">
                  <p className="dato text-[11px] text-fg">{l.telefono}</p>
                  <p className="truncate text-[10px] text-muted">{l.email}</p>
                </td>
                <td className="px-3 py-1.5">
                  <span className={"chip " + chipCanal[l.canal]}>{l.canal}</span>
                </td>
                <td className="px-3 py-1.5 text-[11px] text-muted">{l.interes}</td>
                <td className="precio px-3 py-1.5 text-right text-xs">{usd(l.presupuesto)}</td>
                <td className="px-3 py-1.5">
                  <span className={"chip " + chipLead[nivelDeLead(l.diasSinContacto)]}>
                    {l.diasSinContacto === 0 ? "hoy" : `${l.diasSinContacto} d`}
                  </span>
                </td>
                <td className="px-3 py-1.5 text-[11px] text-muted">{l.vendedor}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!visibles.length && <p className="py-10 text-center text-xs text-muted">Sin resultados.</p>}
      </div>
    </div>
  )
}
