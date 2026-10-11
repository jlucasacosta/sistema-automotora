"use client"
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react"
import { ArrowLeftRight, Repeat2, AlertTriangle } from "lucide-react"
import { getDeals, moverDeal, type Deal } from "./api"
import { getUnidades, type Unidad } from "@/modules/catalogo/api"
import { Comparador } from "@/shell/comparador"
import {
  ETAPAS,
  rotuloEtapa,
  rellenoEtapaSuave,
  chipLead,
  nivelDeLead,
  nivelDeSena,
  bordeSena,
  usd,
} from "@/shell/automotora"
import type { Etapa } from "@/shell/automotora"

// embudo-lanes-conversion · ARQUETIPO DE DATOS NUEVO.
// No es un kanban. En un kanban todas las columnas miden lo mismo y el ancho no
// significa nada. Aca EL ANCHO DEL TRAPECIO ES EL DATO: cuantas oportunidades hay
// en la etapa. Mover una ficha re-escala los dos trapecios (transicion en `.lane`)
// y recomputa el % de conversion acumulada. El embudo se angosta de izquierda a derecha.

const TAPER = 5.5 // cuanto se cierra cada etapa, en % de alto por escalon

function Trapecio({ etapa, i }: { etapa: Etapa; i: number }) {
  const t1 = i * TAPER
  const t2 = (i + 1) * TAPER
  return (
    <div
      aria-hidden
      className={"absolute inset-0 " + rellenoEtapaSuave[etapa]}
      style={{ clipPath: `polygon(0 ${t1}%, 100% ${t2}%, 100% ${100 - t2}%, 0 ${100 - t1}%)` }}
    />
  )
}

function Ficha({
  d,
  unidad,
  onDragStart,
  onSeleccionar,
  onMover,
  seleccionado,
}: {
  d: Deal
  unidad?: Unidad
  onDragStart: () => void
  onSeleccionar: () => void
  onMover: (paso: -1 | 1) => void
  seleccionado: boolean
}) {
  const lead = nivelDeLead(d.diasSinContacto)
  const sena = d.senaDias !== undefined ? nivelDeSena(d.senaDias) : null

  // Teclado: Enter/Espacio elige la ficha (alimenta el comparador); las flechas la mueven de etapa.
  // Es la alternativa al arrastre (WCAG 2.5.7). El arrastre con mouse sigue igual.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onSeleccionar()
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      onMover(1)
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      onMover(-1)
    }
  }

  return (
    <li>
    <div
      id={`ficha-${d.id}`}
      role="button"
      tabIndex={0}
      aria-pressed={seleccionado}
      aria-keyshortcuts="ArrowLeft ArrowRight"
      draggable
      onDragStart={onDragStart}
      onClick={onSeleccionar}
      onKeyDown={onKeyDown}
      className={
        "avanzando block cursor-grab rounded border border-border bg-surface p-2 text-left transition-colors active:cursor-grabbing " +
        (sena ? "border-l-[3px] " + bordeSena[sena] + " " : "") +
        (sena === "vencida" ? "sena-vencida " : "") +
        (seleccionado ? "ring-1 ring-primary" : "hover:border-primary/60")
      }
    >
      <span className="block truncate font-heading text-xs font-semibold">{d.cliente}</span>
      <span className="block truncate text-[0.625rem] text-muted">
        {unidad ? `${unidad.marca} ${unidad.modelo} ${unidad.anio}` : d.unidadId}
      </span>
      <span className="patente mt-1 inline-block rounded bg-subtle px-1 py-px text-[0.625rem]">
        {unidad?.patente ?? "SIN PATENTAR"}
      </span>
      <span className="precio mt-1 block text-base leading-none">{usd(d.monto)}</span>

      <span className="mt-1.5 flex flex-wrap gap-1">
        <span className={"chip " + chipLead[lead]}>
          {d.diasSinContacto === 0 ? "hoy" : `${d.diasSinContacto} d sin contacto`}
        </span>
        {d.permuta && (
          <span className="chip bg-primary/20 text-fg">
            <Repeat2 size={10} strokeWidth={2.5} /> permuta {usd(d.permuta.toma)}
          </span>
        )}
      </span>

      {sena && (
        <span
          className={
            "dato mt-1.5 flex items-center gap-1 text-[0.625rem] font-semibold " +
            (sena === "vencida" ? "text-danger" : sena === "por-vencer" ? "text-warning" : "text-success")
          }
        >
          {sena === "vencida" && <AlertTriangle size={11} strokeWidth={2.5} />}
          {sena === "vencida"
            ? `Seña venció hace ${Math.abs(d.senaDias as number)} días`
            : `Seña vence en ${d.senaDias} días`}
        </span>
      )}
    </div>
    </li>
  )
}

export function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [unidades, setUnidades] = useState<Unidad[]>([])
  const [arrastrado, setArrastrado] = useState<string | null>(null)
  const [sobre, setSobre] = useState<Etapa | null>(null)
  const [seleccionado, setSeleccionado] = useState<string | null>(null)
  const [entregadasHoy, setEntregadasHoy] = useState(3)
  const [aviso, setAviso] = useState("") // anuncio para lectores de pantalla (aria-live)
  const foco = useRef<string | null>(null) // ficha que recupera el foco despues de moverse

  useEffect(() => {
    getDeals().then((ds) => {
      setDeals(ds)
      const cot = ds.find((d) => d.etapa === "cotizacion")
      if (cot) setSeleccionado(cot.id)
    })
    getUnidades().then(setUnidades)
  }, [])

  const unidadDe = useMemo(() => {
    const m = new Map(unidades.map((u) => [u.id, u]))
    return (id: string) => m.get(id)
  }, [unidades])

  // Despues de mover una ficha con teclado, la ficha se re-monta en otra etapa: se le devuelve el foco.
  useEffect(() => {
    if (!foco.current) return
    document.getElementById(`ficha-${foco.current}`)?.focus()
    foco.current = null
  }, [deals])

  const porEtapa = (e: Etapa) => deals.filter((d) => d.etapa === e)
  const total = deals.length || 1

  // Mover una ficha es una sola operacion: la usan el arrastre (mouse) y las flechas (teclado).
  const moverFicha = (id: string, e: Etapa) => {
    const d = deals.find((x) => x.id === id)
    if (!d || d.etapa === e) return
    moverDeal(d.id, e)
    setDeals((ds) => ds.map((x) => (x.id === id ? { ...x, etapa: e } : x)))
    if (e === "entrega") setEntregadasHoy((n) => n + 1)
    setAviso(`${d.cliente} pasó a ${rotuloEtapa[e]}`)
  }

  const soltarEn = (e: Etapa) => {
    if (arrastrado) moverFicha(arrastrado, e)
    setArrastrado(null)
    setSobre(null)
  }

  const moverConTeclado = (d: Deal, paso: -1 | 1) => {
    const destino = ETAPAS[ETAPAS.indexOf(d.etapa) + paso]
    if (!destino) return
    foco.current = d.id
    moverFicha(d.id, destino)
  }

  const dealSel = deals.find((d) => d.id === seleccionado)
  // Las candidatas del lead: unidades libres del mismo segmento que la de interes.
  const candidatas = useMemo(() => {
    if (!dealSel) return []
    const u = unidadDe(dealSel.unidadId)
    if (!u) return []
    return unidades.filter((x) => x.segmento === u.segmento && x.estado !== "vendida").slice(0, 8)
  }, [dealSel, unidades, unidadDe])

  const valorEmbudo = deals.filter((d) => d.etapa !== "entrega").reduce((s, d) => s + d.monto, 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">Pipeline</h1>
          <p className="text-[0.6875rem] text-muted">
            El ancho de cada etapa es la cantidad de oportunidades. Arrastrá una ficha para avanzarla, o elegila con el
            teclado y movela con las flechas izquierda y derecha.
          </p>
        </div>
        <div className="flex gap-6">
          <div>
            <p className="text-[0.625rem] uppercase tracking-widest text-muted">Valor del pipeline</p>
            <p className="precio text-xl text-fg">{usd(valorEmbudo)}</p>
          </div>
          <div>
            <p className="text-[0.625rem] uppercase tracking-widest text-muted">Entregadas hoy</p>
            <p className="precio text-xl text-success">{entregadasHoy}</p>
          </div>
        </div>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {aviso}
      </p>

      <div role="region" aria-label="Embudo de oportunidades por etapa" tabIndex={0} className="overflow-x-auto">
        <div className="flex min-w-[64rem] gap-1">
          {ETAPAS.map((e, i) => {
            const items = porEtapa(e)
            const acumulado = deals.filter((d) => ETAPAS.indexOf(d.etapa) >= i).length
            const conversion = Math.round((acumulado / total) * 100)
            return (
              <div
                key={e}
                className="lane flex flex-col"
                style={{ flexGrow: items.length + 0.6, flexBasis: 0 }}
                onDragOver={(ev) => {
                  ev.preventDefault()
                  setSobre(e)
                }}
                onDragLeave={() => setSobre((s) => (s === e ? null : s))}
                onDrop={(ev) => {
                  ev.preventDefault()
                  soltarEn(e)
                }}
              >
                {/* el trapecio: se angosta escalon a escalon */}
                <div className="relative h-[4.5rem] overflow-hidden rounded">
                  <Trapecio etapa={e} i={i} />
                  <div className="relative flex h-full flex-col items-center justify-center px-1 text-center">
                    <h2 className="truncate font-heading text-[0.625rem] font-bold uppercase tracking-widest text-fg">
                      {rotuloEtapa[e]}
                    </h2>
                    <p className="precio text-2xl leading-none text-fg">{items.length}</p>
                    <p className="dato text-[0.625rem] text-fg">{conversion}% conv.</p>
                  </div>
                </div>

                <ul
                  className={
                    "mt-1 flex-1 space-y-1.5 rounded p-1 transition-colors " +
                    (sobre === e ? "bg-primary/10" : "bg-subtle/40")
                  }
                >
                  {items.map((d) => (
                    <Ficha
                      key={d.id}
                      d={d}
                      unidad={unidadDe(d.unidadId)}
                      onDragStart={() => setArrastrado(d.id)}
                      onSeleccionar={() => setSeleccionado(d.id)}
                      onMover={(paso) => moverConTeclado(d, paso)}
                      seleccionado={seleccionado === d.id}
                    />
                  ))}
                  {!items.length && (
                    <li className="py-6 text-center text-[0.625rem] uppercase tracking-widest text-muted">sin oportunidades</li>
                  )}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

      {/* COMPONENTE ESTRELLA: el comparador vive aca, colgado del lead seleccionado. */}
      {dealSel && candidatas.length > 0 && (
        <section className="space-y-2">
          <h2 className="flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-widest">
            <ArrowLeftRight size={15} strokeWidth={2.5} className="text-primary" />
            Comparador de unidades · {dealSel.cliente}
          </h2>
          <Comparador key={dealSel.id} unidades={candidatas} />
        </section>
      )}
    </div>
  )
}
