"use client"
// spec-comparator-drag · COMPONENTE ESTRELLA.
// Vive en el PIPELINE, no en el catalogo: se abre desde una ficha en etapa "cotizacion"
// para comparar las candidatas de ESE lead. Ahi el comparador tiene sentido narrativo
// (matchear lead <-> unidad) en vez de ser un juguete del showroom.
//
// Se arrastran hasta 3 unidades a los slots. Cada fila de spec resalta la celda
// ganadora en success y muestra el delta contra la mejor. La columna que gana mas
// filas recibe el ribbon "MEJOR VALOR". Ningun otro sistema tiene drag-to-compare.
import { useState, type KeyboardEvent } from "react"
import { Trophy, X } from "lucide-react"
import { usd, ars, rotuloCaja, km as fmtKm } from "./automotora"

export type UnidadComparable = {
  id: string
  marca: string
  modelo: string
  version: string
  anio: number
  km: number
  precio: number
  cuota: number
  diasPlaya: number
  motor: string
  caja: string
  patente: string | null
}

type Fila = {
  key: string
  label: string
  valor: (u: UnidadComparable) => number | null
  texto: (u: UnidadComparable) => string
  mejor: "min" | "max" | null
  delta?: (v: number, mejorV: number) => string
}

const FILAS: Fila[] = [
  {
    key: "precio",
    label: "Precio",
    valor: (u) => u.precio,
    texto: (u) => usd(u.precio),
    mejor: "min",
    delta: (v, m) => (v === m ? "" : `+${usd(v - m).replace("US$ ", "")} USD`),
  },
  { key: "anio", label: "Año", valor: (u) => u.anio, texto: (u) => String(u.anio), mejor: "max", delta: (v, m) => (v === m ? "" : `${v - m} años`) },
  {
    key: "km",
    label: "Kilometraje",
    valor: (u) => u.km,
    texto: (u) => fmtKm(u.km),
    mejor: "min",
    delta: (v, m) => (v === m ? "" : `+${(v - m).toLocaleString("es-AR")} km`),
  },
  { key: "cuota", label: "Cuota estimada (48m)", valor: (u) => u.cuota, texto: (u) => ars(u.cuota), mejor: "min" },
  // Dias en stock NO puntua: mas dias no es una virtud de la unidad, es plata quieta
  // del lado de la concesionaria. Se muestra como contexto de negociacion, sin ganador.
  { key: "diasPlaya", label: "Días en stock", valor: () => null, texto: (u) => `${u.diasPlaya} d`, mejor: null },
  { key: "motor", label: "Motor", valor: () => null, texto: (u) => u.motor, mejor: null },
  { key: "caja", label: "Caja", valor: () => null, texto: (u) => rotuloCaja[u.caja] ?? u.caja, mejor: null },
]

const SLOTS = 3

export function Comparador({ unidades }: { unidades: UnidadComparable[] }) {
  const [slots, setSlots] = useState<(UnidadComparable | null)[]>([null, null, null])
  const [sobre, setSobre] = useState<number | null>(null)

  const cargados = slots.filter(Boolean) as UnidadComparable[]

  const soltar = (i: number, id: string) => {
    const u = unidades.find((x) => x.id === id)
    if (!u || slots.some((s) => s?.id === id)) return
    setSlots((s) => s.map((v, j) => (j === i ? u : v)))
  }

  // Alternativa al arrastre (WCAG 2.5.7): click o Enter sobre la unidad la manda al primer slot libre.
  const agregar = (id: string) => {
    const libre = slots.findIndex((s) => s === null)
    if (libre >= 0) soltar(libre, id)
  }
  const teclaUnidad = (e: KeyboardEvent<HTMLElement>, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      agregar(id)
    }
  }

  const sacar = (i: number) => {
    setSlots((s) => s.map((v, j) => (j === i ? null : v)))
  }

  // Ganadora por fila: solo si hay 2+ unidades cargadas y la fila tiene criterio.
  const ganadoraDe = (f: Fila): number | null => {
    if (cargados.length < 2 || !f.mejor) return null
    const vals = slots.map((u) => (u ? f.valor(u) : null))
    const definidos = vals.filter((v): v is number => v !== null)
    if (!definidos.length) return null
    const objetivo = f.mejor === "min" ? Math.min(...definidos) : Math.max(...definidos)
    // empate: no gana nadie
    if (definidos.filter((v) => v === objetivo).length > 1) return null
    return objetivo
  }

  const victorias = [0, 0, 0]
  FILAS.forEach((f) => {
    const g = ganadoraDe(f)
    if (g === null) return
    slots.forEach((u, i) => {
      if (u && f.valor(u) === g) victorias[i]++
    })
  })
  const maxVictorias = Math.max(...victorias)
  const mejorValor = cargados.length >= 2 && maxVictorias > 0 && victorias.filter((v) => v === maxVictorias).length === 1
    ? victorias.indexOf(maxVictorias)
    : null

  const disponibles = unidades.filter((u) => !slots.some((s) => s?.id === u.id))

  return (
    <div className="grid gap-3 lg:grid-cols-[16rem_1fr]">
      {/* Mazo de candidatas: se arrastran a los slots */}
      <div className="surface-card flex flex-col p-3">
        <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-muted">Unidades para comparar</h3>
        <p className="mb-2 mt-1 text-xs leading-snug text-muted">
          Arrastrá hasta 3 unidades a la bandeja, o hacé click en una para sumarla.
        </p>
        <ul tabIndex={0} aria-label="Unidades para comparar" className="max-h-[19rem] space-y-1.5 overflow-y-auto pr-1">
          {disponibles.map((u) => (
            <li key={u.id}>
            <div
              role="button"
              tabIndex={0}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", u.id)}
              onClick={() => agregar(u.id)}
              onKeyDown={(e) => teclaUnidad(e, u.id)}
              aria-label={`Sumar ${u.marca} ${u.modelo} ${u.anio} a la bandeja`}
              className="block cursor-grab rounded border border-border bg-subtle px-2 py-1.5 transition-colors hover:border-primary active:cursor-grabbing"
            >
              <p className="truncate font-heading text-xs font-semibold">
                {u.marca} {u.modelo}
              </p>
              <p className="dato mt-0.5 flex items-center justify-between text-xs text-muted">
                <span>
                  {u.anio} · {fmtKm(u.km)}
                </span>
                <span className="precio text-fg">{usd(u.precio)}</span>
              </p>
            </div>
            </li>
          ))}
          {!disponibles.length && <li className="py-6 text-center text-xs text-muted">Sin unidades disponibles</li>}
        </ul>
      </div>

      {/* Bandeja + tabla diff */}
      <div className="surface-card overflow-hidden">
       <div role="region" aria-label="Tabla comparativa" tabIndex={0} className="overflow-x-auto">
        <div role="table" aria-label="Comparador de unidades" className="min-w-[34rem]">
        <div role="row" className="grid grid-cols-[9rem_repeat(3,1fr)] border-b border-border">
          <div role="columnheader" className="flex items-end p-3">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-muted">Comparador</h3>
          </div>
          {slots.map((u, i) => (
            <div
              key={i}
              role="columnheader"
              onDragOver={(e) => {
                e.preventDefault()
                setSobre(i)
              }}
              onDragLeave={() => setSobre((s) => (s === i ? null : s))}
              onDrop={(e) => {
                e.preventDefault()
                setSobre(null)
                soltar(i, e.dataTransfer.getData("text/plain"))
              }}
              className={
                "relative border-l border-border p-3 transition-colors " + (sobre === i ? "bg-primary/15" : "")
              }
            >
              {mejorValor === i && (
                <span className="absolute right-2 top-0 flex items-center gap-1 rounded-b bg-success px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-bg">
                  <Trophy size={10} strokeWidth={2.5} /> Mejor valor
                </span>
              )}
              {u ? (
                <div className="pt-3 [@media(pointer:coarse)]:pt-11">
                  <button
                    type="button"
                    onClick={() => sacar(i)}
                    aria-label={`Quitar ${u.marca} ${u.modelo}`}
                    className="tap-44 absolute left-0 top-0 flex h-7 w-7 items-center justify-center text-muted transition-colors hover:text-danger"
                  >
                    <X size={13} strokeWidth={2.5} />
                  </button>
                  <p className="truncate font-heading text-sm font-bold">
                    {u.marca} {u.modelo}
                  </p>
                  <p className="truncate text-xs text-muted">{u.version}</p>
                  <p className="patente mt-1.5 inline-block rounded bg-subtle px-1.5 py-0.5 text-xs">
                    {u.patente ?? "SIN PATENTAR"}
                  </p>
                </div>
              ) : (
                <div className="flex h-24 items-center justify-center rounded border border-dashed border-border text-xs uppercase tracking-wider text-muted">
                  Slot {i + 1}
                </div>
              )}
            </div>
          ))}
        </div>

        {cargados.length >= 1 ? (
          <div role="rowgroup">
            {FILAS.map((f) => {
              const g = ganadoraDe(f)
              return (
                <div key={f.key} role="row" className="grid grid-cols-[9rem_repeat(3,1fr)] border-b border-border last:border-0">
                  <div role="rowheader" className="px-3 py-2 text-xs text-muted">{f.label}</div>
                  {slots.map((u, i) => {
                    if (!u) return <div key={i} role="cell" className="border-l border-border px-3 py-2" />
                    const v = f.valor(u)
                    const gana = g !== null && v === g
                    const pierde = g !== null && v !== null && v !== g
                    return (
                      <div
                        key={i}
                        role="cell"
                        className={
                          "border-l border-border px-3 py-2 " +
                          (gana ? "text-success" : pierde ? "text-muted" : "text-fg")
                        }
                      >
                        <span className={"dato inline-block rounded px-1 text-xs " + (gana ? "bg-success/10" : "")}>
                          {f.texto(u)}
                          {gana && <span className="sr-only"> (mejor de la fila)</span>}
                        </span>
                        {pierde && f.delta && v !== null && g !== null && (
                          <span className="ml-1 text-xs text-danger">{f.delta(v, g)}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ) : (
          <div role="row">
            <p role="cell" className="px-3 py-12 text-center text-xs text-muted">
              Arrastrá una unidad desde la izquierda para empezar a comparar.
            </p>
          </div>
        )}
        </div>
       </div>
      </div>
    </div>
  )
}
