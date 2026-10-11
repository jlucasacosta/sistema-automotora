"use client"
import { useMemo, useState } from "react"
import { getLeads, type Lead, type Canal } from "./api"
import { getDeals } from "@/modules/pipeline/api"
import { getBoletos, compradores } from "@/modules/ventas/api"
import { chipLead, nivelDeLead, rotuloLead, rotuloCanal, rotuloEtapa, usd } from "@/shell/automotora"
import { theme } from "@/shell/theme"
import { Esqueleto, ErrorCarga, useCarga } from "@/shell/carga"
import { FichaLateral, DatoFicha, AvisoDemo, botonPrimario, botonSecundario } from "@/shell/ficha-lateral"

// tabla-densa: el CRM de leads. Arquetipo de soporte, no el protagonista del sistema.
// El protagonista es el embudo. Aca el vendedor escanea filas buscando al que se enfria.
// Un contacto que ya compro es un cliente: su temperatura no aplica y se muestra "—".

const chipCanal: Record<Canal, string> = {
  showroom: "bg-primary/20 text-fg",
  portal: "bg-info/15 text-info",
  web: "bg-info/15 text-info",
  whatsapp: "bg-success/15 text-success",
  referido: "bg-accent/10 text-accent",
  telefono: "bg-fg/10 text-fg",
}

async function cargarContactos() {
  const [leads, deals, boletos] = await Promise.all([getLeads(), getDeals(), getBoletos()])
  return { leads, deals, clientes: compradores(boletos) }
}

export function ContactosPage() {
  const { data, cargando, error, reintentar } = useCarga(cargarContactos)
  const [q, setQ] = useState("")
  const [sel, setSel] = useState<Lead | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  const leads = data?.leads ?? []
  const clientes = data?.clientes
  const esCliente = (l: Lead) => !!clientes?.has(l.nombre)

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase()
    return leads.filter((l) => !t || `${l.id} ${l.nombre} ${l.interes}`.toLowerCase().includes(t))
  }, [leads, q])
  const frios = leads.filter((l) => !esCliente(l) && nivelDeLead(l.diasSinContacto) === "frio").length

  const abrir = (l: Lead) => {
    setAviso(null)
    setSel(l)
  }

  const dealSel = sel ? data?.deals.find((d) => d.cliente === sel.nombre) : undefined
  const compraSel = sel ? clientes?.get(sel.nombre) : undefined

  const celdaContacto = (l: Lead) =>
    esCliente(l) ? (
      <span className="text-xs text-muted">—</span>
    ) : (
      <span className={"chip " + chipLead[nivelDeLead(l.diasSinContacto)]}>
        {l.diasSinContacto === 0 ? "hoy" : `${l.diasSinContacto} d`} · {rotuloLead[nivelDeLead(l.diasSinContacto)]}
      </span>
    )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">Contactos</h1>
          <p className="text-xs text-muted">
            {cargando ? "—" : leads.length} contactos ·{" "}
            <span className="text-danger">{cargando ? "—" : frios} sin contacto reciente</span>
          </p>
        </div>
        <input
          type="search"
          aria-label="Buscar contactos por nombre o interés"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o interés"
          className="w-full rounded-[var(--radius)] border border-muted/70 bg-surface px-3 py-1.5 text-xs text-fg placeholder:text-muted focus:border-primary sm:w-64"
        />
      </div>

      {error && <ErrorCarga onReintentar={reintentar} />}

      <section aria-busy={cargando} aria-label="Contactos" className="space-y-2">
        <div className="surface-card overflow-x-auto">
          {cargando ? (
            <div className="space-y-2 p-3" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => (
                <Esqueleto key={i} className="h-9" />
              ))}
            </div>
          ) : error ? null : (
            <table className="w-full text-left">
              <caption className="sr-only">Contactos con canal, interés, presupuesto y días desde el último contacto</caption>
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted">
                  <th scope="col" className="px-3 py-2 font-medium">Lead</th>
                  <th scope="col" className="hidden px-3 py-2 font-medium md:table-cell">Contacto</th>
                  <th scope="col" className="hidden px-3 py-2 font-medium sm:table-cell">Canal</th>
                  <th scope="col" className="hidden px-3 py-2 font-medium md:table-cell">Interés</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Presupuesto</th>
                  <th scope="col" className="px-3 py-2 font-medium">Último contacto</th>
                  <th scope="col" className="hidden px-3 py-2 font-medium lg:table-cell">Vendedor</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => abrir(l)}
                    className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-subtle/60"
                  >
                    <td className="px-3 py-1.5">
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary/25 font-heading text-xs font-bold text-fg"
                        >
                          {l.nombre[0]}
                        </span>
                        <span className="min-w-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              abrir(l)
                            }}
                            className="block max-w-full truncate text-left text-sm font-medium"
                          >
                            {l.nombre}
                            <span className="sr-only">. Abrir ficha</span>
                          </button>
                          <span className="dato block truncate text-xs text-muted">
                            {l.id}
                            <span className="md:hidden"> · {l.interes}</span>
                            {esCliente(l) && " · cliente"}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="hidden px-3 py-1.5 md:table-cell">
                      <p className="dato text-xs text-fg">{l.telefono}</p>
                      <p className="truncate text-xs text-muted">{l.email}</p>
                    </td>
                    <td className="hidden px-3 py-1.5 sm:table-cell">
                      <span className={"chip " + chipCanal[l.canal]}>{rotuloCanal[l.canal] ?? l.canal}</span>
                    </td>
                    <td className="hidden px-3 py-1.5 text-xs text-muted md:table-cell">{l.interes}</td>
                    <td className="precio px-3 py-1.5 text-right text-sm">{usd(l.presupuesto)}</td>
                    <td className="px-3 py-1.5">{celdaContacto(l)}</td>
                    <td className="hidden px-3 py-1.5 text-xs text-muted lg:table-cell">{l.vendedor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!cargando && !error && !visibles.length && <p className="py-10 text-center text-sm text-muted">Sin resultados.</p>}
        </div>
        <p className="text-xs text-muted">
          Último contacto: activo hasta {theme.lead.tibio - 1} días, tibio desde {theme.lead.tibio}, frío desde {theme.lead.frio}.
          Los clientes que ya compraron no tienen temperatura.
        </p>
      </section>

      <FichaLateral
        abierta={!!sel}
        titulo={sel ? sel.nombre : ""}
        subtitulo={sel ? `${sel.id} · ${rotuloCanal[sel.canal] ?? sel.canal}` : undefined}
        onCerrar={() => setSel(null)}
        acciones={
          sel && (
            <>
              <button type="button" onClick={() => setAviso("Registrar llamada. Demo: no se guardó nada")} className={botonPrimario}>
                Registrar llamada
              </button>
              <button type="button" onClick={() => setAviso("Enviar cotización. Demo: no se guardó nada")} className={botonSecundario}>
                Enviar cotización
              </button>
              <button type="button" onClick={() => setAviso("Agendar test drive. Demo: no se guardó nada")} className={botonSecundario}>
                Agendar test drive
              </button>
            </>
          )
        }
      >
        {sel && (
          <div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              <DatoFicha etiqueta="Código">{sel.id}</DatoFicha>
              <DatoFicha etiqueta="Canal">
                <span className={"chip " + chipCanal[sel.canal]}>{rotuloCanal[sel.canal] ?? sel.canal}</span>
              </DatoFicha>
              <DatoFicha etiqueta="Teléfono">
                <span className="dato">{sel.telefono}</span>
              </DatoFicha>
              <DatoFicha etiqueta="Email">
                <span className="break-all">{sel.email}</span>
              </DatoFicha>
              <DatoFicha etiqueta="Interés">{sel.interes}</DatoFicha>
              <DatoFicha etiqueta="Presupuesto">{usd(sel.presupuesto)}</DatoFicha>
              <DatoFicha etiqueta="Último contacto">{celdaContacto(sel)}</DatoFicha>
              <DatoFicha etiqueta="Vendedor">{sel.vendedor}</DatoFicha>
              <div className="col-span-2">
                <DatoFicha etiqueta="Oportunidad en el embudo">
                  {dealSel ? (
                    <>
                      {dealSel.id} · {rotuloEtapa[dealSel.etapa]} · {usd(dealSel.monto)}
                    </>
                  ) : (
                    "Sin oportunidad abierta"
                  )}
                </DatoFicha>
              </div>
              {compraSel && (
                <div className="col-span-2">
                  <DatoFicha etiqueta="Compra">
                    {compraSel.id} · {compraSel.unidad} · {usd(compraSel.precio)}
                  </DatoFicha>
                </div>
              )}
            </dl>
            <AvisoDemo texto={aviso} />
          </div>
        )}
      </FichaLateral>
    </div>
  )
}
