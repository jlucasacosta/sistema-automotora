"use client"
import { useEffect, useState } from "react"
import { getLeads, type Lead, type Canal } from "./api"
import { chipLead, nivelDeLead, rotuloCanal, usd } from "@/shell/automotora"

// tabla-densa: el CRM de leads. Arquetipo de soporte, no el protagonista del sistema.
// El protagonista es el embudo. Aca el vendedor escanea filas buscando al que se enfria.

const chipCanal: Record<Canal, string> = {
  showroom: "bg-primary/20 text-fg",
  portal: "bg-info/15 text-info",
  web: "bg-info/15 text-info",
  whatsapp: "bg-success/15 text-success",
  referido: "bg-accent/10 text-accent",
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
          <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">Contactos</h1>
          <p className="text-[0.6875rem] text-muted">
            {leads.length} contactos · <span className="text-danger">{frios} sin contacto reciente</span>
          </p>
        </div>
        <input
          type="search"
          aria-label="Buscar contactos por nombre o interés"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o interés"
          className="w-full rounded border border-muted/70 bg-surface px-3 py-1.5 text-xs text-fg placeholder:text-muted focus:border-primary sm:w-64"
        />
      </div>

      <div role="region" aria-label="Tabla de contactos" tabIndex={0} className="surface-card overflow-x-auto">
        <table className="w-full min-w-[56rem] text-left">
          <caption className="sr-only">Contactos con canal, interés, presupuesto y días desde el último contacto</caption>
          <thead>
            <tr className="border-b border-border text-[0.625rem] uppercase tracking-widest text-muted">
              <th scope="col" className="px-3 py-2 font-medium">Lead</th>
              <th scope="col" className="px-3 py-2 font-medium">Contacto</th>
              <th scope="col" className="px-3 py-2 font-medium">Canal</th>
              <th scope="col" className="px-3 py-2 font-medium">Interés</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Presupuesto</th>
              <th scope="col" className="px-3 py-2 font-medium">Último contacto</th>
              <th scope="col" className="px-3 py-2 font-medium">Vendedor</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((l) => (
              <tr key={l.id} className="border-b border-border transition-colors last:border-0 hover:bg-subtle/60">
                <td className="px-3 py-1.5">
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/25 font-heading text-[0.625rem] font-bold text-fg">
                      {l.nombre[0]}
                    </span>
                    <span className="text-xs font-medium">{l.nombre}</span>
                  </span>
                </td>
                <td className="px-3 py-1.5">
                  <p className="dato text-[0.6875rem] text-fg">{l.telefono}</p>
                  <p className="truncate text-[0.625rem] text-muted">{l.email}</p>
                </td>
                <td className="px-3 py-1.5">
                  <span className={"chip " + chipCanal[l.canal]}>{rotuloCanal[l.canal] ?? l.canal}</span>
                </td>
                <td className="px-3 py-1.5 text-[0.6875rem] text-muted">{l.interes}</td>
                <td className="precio px-3 py-1.5 text-right text-xs">{usd(l.presupuesto)}</td>
                <td className="px-3 py-1.5">
                  <span className={"chip " + chipLead[nivelDeLead(l.diasSinContacto)]}>
                    {l.diasSinContacto === 0 ? "hoy" : `${l.diasSinContacto} d`}
                  </span>
                </td>
                <td className="px-3 py-1.5 text-[0.6875rem] text-muted">{l.vendedor}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!visibles.length && <p className="py-10 text-center text-xs text-muted">Sin resultados.</p>}
      </div>
    </div>
  )
}
