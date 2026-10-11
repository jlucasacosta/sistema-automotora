"use client"
import { useEffect, useState } from "react"
import { RotateCcw, Fuel, Cog, Calendar, Palette } from "lucide-react"
import { getUnidades, desvioPct, type Unidad, type Segmento } from "./api"
import {
  chipUnidad,
  chipAging,
  nivelDeAging,
  chipBanda,
  nivelDeBanda,
  usd,
  ars,
  km as fmtKm,
} from "@/shell/automotora"

// ficha-flip-deck · ARQUETIPO DE DATOS NUEVO.
// No es una galeria. Una galeria es una grilla de cards estaticas, todas del mismo
// tamaño, todas visibles. Esto es un MAZO: hay UNA carta al tope, grande, y el resto
// espera en el riel. Se elige una del riel y SE REPARTE al tope; se hace click en la
// carta y da vuelta (flip 3D) para mostrar la ficha tecnica en el dorso.
// Cero imagenes de producto: la firma es la patente stencil y el precio en USD.

const SEGMENTOS: (Segmento | "todos")[] = ["todos", "hatch", "sedan", "suv", "pickup", "utilitario", "electrico"]

function Spec({ icon: Icon, label, valor }: { icon: typeof Fuel; label: string; valor: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-border py-1.5 last:border-0">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-subtle text-muted">
        <Icon size={12} strokeWidth={2} />
      </span>
      <span className="text-[0.625rem] uppercase tracking-widest text-muted">{label}</span>
      <span className="dato ml-auto text-xs font-medium">{valor}</span>
    </div>
  )
}

export function CatalogoPage() {
  const [unidades, setUnidades] = useState<Unidad[]>([])
  const [segmento, setSegmento] = useState<Segmento | "todos">("todos")
  const [topeId, setTopeId] = useState<string | null>(null)
  const [vuelta, setVuelta] = useState(false)

  useEffect(() => {
    getUnidades().then((us) => {
      setUnidades(us)
      setTopeId(us[0]?.id ?? null)
    })
  }, [])

  const visibles = unidades.filter((u) => segmento === "todos" || u.segmento === segmento)
  const tope = visibles.find((u) => u.id === topeId) ?? visibles[0]

  const repartir = (id: string) => {
    setVuelta(false)
    setTopeId(id)
  }

  const desvio = tope ? desvioPct(tope) : 0

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">Catalogo</h1>
        <p className="text-[0.6875rem] text-muted">
          Elegi una unidad de la lista para verla en detalle. Hace click en la ficha para ver los datos tecnicos.
        </p>
      </div>

      {/* subbar de filtros: parte de la estructura topbar-con-subbar-filtros */}
      <div role="group" aria-label="Filtrar por segmento" className="flex flex-wrap items-center gap-1.5 border-b border-border pb-3">
        {SEGMENTOS.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={segmento === s}
            onClick={() => setSegmento(s)}
            className={
              "chip chip-btn transition-colors " +
              (segmento === s ? "bg-primary text-bg" : "bg-subtle text-muted hover:text-fg")
            }
          >
            {s}
          </button>
        ))}
        <span className="dato ml-auto text-[0.625rem] text-muted">{visibles.length} unidades</span>
      </div>

      {tope && (
        <div className="grid gap-4 lg:grid-cols-[26rem_1fr]">
          {/* LA CARTA AL TOPE: click = flip 3D */}
          <div className="deck-perspectiva">
            {/* El click en cualquier parte de la carta la da vuelta (mouse). Para teclado y lectores hay un
                boton real en cada cara; la cara que no se ve queda inert + aria-hidden. */}
            <div
              onClick={() => setVuelta((v) => !v)}
              className={"deck-carta repartida relative block h-[22rem] w-full cursor-pointer text-left " + (vuelta ? "dada-vuelta" : "")}
              key={tope.id}
            >
              {/* frente */}
              <div
                inert={vuelta}
                aria-hidden={vuelta}
                className="deck-cara surface-card absolute inset-0 flex flex-col justify-between border border-border p-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[0.625rem] uppercase tracking-widest text-muted">{tope.marca}</p>
                      <h2 className="font-heading text-3xl font-bold leading-none">{tope.modelo}</h2>
                      <p className="mt-1 text-xs text-muted">{tope.version}</p>
                    </div>
                    <span className={"chip " + chipUnidad[tope.estado]}>{tope.estado}</span>
                  </div>

                  <p className="patente mt-5 inline-block rounded border border-border bg-subtle px-3 py-1.5 text-sm">
                    {tope.patente ?? "SIN PATENTAR"}
                  </p>
                </div>

                <div>
                  <p className="precio text-5xl leading-none text-fg">{usd(tope.precio)}</p>
                  <p className="dato mt-1 text-xs text-muted">
                    o {ars(tope.cuota)} / mes · 48 cuotas
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="chip bg-subtle text-muted">{tope.anio}</span>
                    <span className="chip bg-subtle text-muted">{fmtKm(tope.km)}</span>
                    <span className={"chip " + chipAging[nivelDeAging(tope.diasPlaya)]}>{tope.diasPlaya} d en stock</span>
                    {tope.km > 0 && (
                      <span className={"chip " + chipBanda[nivelDeBanda(desvio)]}>
                        {desvio >= 0 ? "+" : ""}
                        {desvio.toFixed(1)}% vs referencia
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label={`Ver datos tecnicos de ${tope.marca} ${tope.modelo}`}
                    className="chip-btn mt-3 flex items-center gap-1 text-[0.625rem] uppercase tracking-widest text-muted"
                  >
                    <RotateCcw size={11} strokeWidth={2.5} /> ver datos tecnicos
                  </button>
                </div>
              </div>

              {/* dorso: la ficha tecnica */}
              <div
                inert={!vuelta}
                aria-hidden={!vuelta}
                className="deck-cara deck-dorso surface-card absolute inset-0 border border-primary/50 p-5"
              >
                {/* accent, no primary: el violeta da 3.4:1 sobre la tarjeta y no sirve como texto */}
                <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-accent">Ficha tecnica</h3>
                <p className="mb-3 text-[0.625rem] text-muted">
                  {tope.marca} {tope.modelo} {tope.version}
                </p>
                <Spec icon={Cog} label="Motor" valor={tope.motor} />
                <Spec icon={Cog} label="Caja" valor={tope.caja} />
                <Spec icon={Fuel} label="Combustible" valor={tope.combustible} />
                <Spec icon={Calendar} label="Año" valor={String(tope.anio)} />
                <Spec icon={Palette} label="Color" valor={tope.color} />
                <Spec icon={Cog} label="Segmento" valor={tope.segmento} />
                <button
                  type="button"
                  aria-label="Volver al frente de la ficha"
                  className="chip-btn mt-4 flex items-center gap-1 text-[0.625rem] uppercase tracking-widest text-muted"
                >
                  <RotateCcw size={11} strokeWidth={2.5} /> volver
                </button>
              </div>
            </div>
          </div>

          {/* EL RIEL: el resto del mazo, esperando que lo repartan */}
          <div className="surface-card p-3">
            <h3 className="mb-2 font-heading text-[0.6875rem] font-bold uppercase tracking-widest text-muted">
              Unidades · {visibles.length}
            </h3>
            <ul tabIndex={0} aria-label="Unidades del catalogo" className="grid max-h-[19rem] gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
              {visibles.map((u) => {
                const activa = u.id === tope.id
                return (
                  <li key={u.id}>
                    <button
                      type="button"
                      aria-current={activa ? "true" : undefined}
                      onClick={() => repartir(u.id)}
                      className={
                        "w-full rounded border px-2 py-1.5 text-left transition-colors " +
                        (activa ? "border-primary bg-primary/10" : "border-border bg-subtle hover:border-primary/60")
                      }
                    >
                      <p className="truncate font-heading text-xs font-semibold">
                        {u.marca} {u.modelo}
                      </p>
                      <p className="dato flex items-center justify-between text-[0.625rem] text-muted">
                        <span>
                          {u.anio} · {fmtKm(u.km)}
                        </span>
                        <span className="precio text-fg">{usd(u.precio)}</span>
                      </p>
                      <p className="patente mt-1 text-[0.625rem] text-muted">{u.patente ?? "SIN PATENTAR"}</p>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
