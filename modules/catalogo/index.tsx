"use client"
import { useMemo, useState, type ReactNode } from "react"
import { SlidersHorizontal } from "lucide-react"
import { getUnidades, desvioPct, type Unidad, type Segmento, type EstadoUnidad } from "./api"
import {
  chipUnidad,
  rotuloEstadoUnidad,
  rotuloSegmento,
  rotuloCaja,
  rotuloCombustible,
  chipAging,
  nivelDeAging,
  chipBanda,
  nivelDeBanda,
  precioReferencia,
  usd,
  ars,
  km as fmtKm,
} from "@/shell/automotora"
import { theme } from "@/shell/theme"
import { Esqueleto, ErrorCarga, useCarga } from "@/shell/carga"
import { FichaLateral, DatoFicha, AvisoDemo, botonPrimario, botonSecundario } from "@/shell/ficha-lateral"

// La playa: el catalogo de unidades. Cada unidad abre su ficha completa (FichaLateral) con la
// patente stencil y el precio en USD, que son la firma del rubro. El mazo con vuelta 3D
// se reemplazo por esta lista + ficha (decision de Lucas, 2026-10-11: sin animaciones decorativas).

type FiltroEstado = "en playa" | EstadoUnidad
type Orden = "codigo" | "antiguas" | "precio-menor" | "precio-mayor"
type Condicion = "todas" | "0km" | "usados"

const ESTADOS: FiltroEstado[] = ["en playa", "disponible", "reservada", "seniada", "en preparacion", "vendida"]
const rotuloFiltroEstado: Record<FiltroEstado, string> = { "en playa": "en playa", ...rotuloEstadoUnidad }
const SEGMENTOS: (Segmento | "todos")[] = ["todos", "hatch", "sedan", "suv", "pickup", "utilitario", "electrico"]
const ORDENES: { v: Orden; t: string }[] = [
  { v: "codigo", t: "Por código" },
  { v: "antiguas", t: "Más días en stock primero" },
  { v: "precio-menor", t: "Precio, menor a mayor" },
  { v: "precio-mayor", t: "Precio, mayor a menor" },
]

const campo = "w-full rounded-[var(--radius)] border border-muted/70 bg-surface px-2 py-1.5 text-xs text-fg"

function Control({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-xs text-muted">{etiqueta}</span>
      {children}
    </label>
  )
}

export function CatalogoPage() {
  const { data, cargando, error, reintentar } = useCarga(getUnidades)
  const [q, setQ] = useState("")
  const [estado, setEstado] = useState<FiltroEstado>("en playa")
  const [segmento, setSegmento] = useState<Segmento | "todos">("todos")
  const [condicion, setCondicion] = useState<Condicion>("todas")
  const [orden, setOrden] = useState<Orden>("codigo")
  const [filtros, setFiltros] = useState(false)
  const [sel, setSel] = useState<Unidad | null>(null)
  // Cambios de estado de la demo: viven solo en memoria (F5 vuelve a la data real).
  const [cambios, setCambios] = useState<Record<string, EstadoUnidad>>({})
  const [aviso, setAviso] = useState<string | null>(null)

  const unidades = useMemo(
    () => (data ?? []).map((u) => (cambios[u.id] ? { ...u, estado: cambios[u.id] } : u)),
    [data, cambios],
  )

  const visibles = useMemo(() => {
    // Sin tildes ni mayúsculas: "senada" encuentra "señada".
    const sinTildes = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    const t = sinTildes(q.trim())
    const lista = unidades.filter((u) => {
      if (estado === "en playa" ? u.estado === "vendida" : u.estado !== estado) return false
      if (segmento !== "todos" && u.segmento !== segmento) return false
      if (condicion === "0km" && u.km !== 0) return false
      if (condicion === "usados" && u.km === 0) return false
      if (!t) return true
      return sinTildes(`${u.id} ${u.marca} ${u.modelo} ${u.version} ${u.patente ?? ""}`).includes(t)
    })
    if (orden === "antiguas") lista.sort((a, b) => b.diasPlaya - a.diasPlaya)
    if (orden === "precio-menor") lista.sort((a, b) => a.precio - b.precio)
    if (orden === "precio-mayor") lista.sort((a, b) => b.precio - a.precio)
    return lista
  }, [unidades, q, estado, segmento, condicion, orden])

  const filtrosActivos = (segmento !== "todos" ? 1 : 0) + (condicion !== "todas" ? 1 : 0) + (orden !== "codigo" ? 1 : 0)
  const limpiar = () => {
    setSegmento("todos")
    setCondicion("todas")
    setOrden("codigo")
  }

  const abrir = (u: Unidad) => {
    setAviso(null)
    setSel(u)
  }
  const cambiarEstado = (u: Unidad, nuevo: EstadoUnidad, texto: string) => {
    setCambios((c) => ({ ...c, [u.id]: nuevo }))
    setSel({ ...u, estado: nuevo })
    setAviso(`${texto}. Demo: no se guardó nada`)
  }

  const controles = (
    <>
      <Control etiqueta="Segmento">
        <select value={segmento} onChange={(e) => setSegmento(e.target.value as Segmento | "todos")} className={campo}>
          {SEGMENTOS.map((s) => (
            <option key={s} value={s}>
              {rotuloSegmento[s] ?? s}
            </option>
          ))}
        </select>
      </Control>
      <Control etiqueta="Condición">
        <select value={condicion} onChange={(e) => setCondicion(e.target.value as Condicion)} className={campo}>
          <option value="todas">0 km y usados</option>
          <option value="0km">Solo 0 km</option>
          <option value="usados">Solo usados</option>
        </select>
      </Control>
      <Control etiqueta="Orden">
        <select value={orden} onChange={(e) => setOrden(e.target.value as Orden)} className={campo}>
          {ORDENES.map((o) => (
            <option key={o.v} value={o.v}>
              {o.t}
            </option>
          ))}
        </select>
      </Control>
    </>
  )

  const desvio = sel ? desvioPct(sel) : 0
  const esUsadoEnPlaya = !!sel && sel.km > 0 && sel.estado !== "vendida"

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">Catálogo</h1>
        <p className="text-xs text-muted">Tocá una unidad para ver su ficha completa.</p>
      </div>

      {error && <ErrorCarga onReintentar={reintentar} />}

      <section aria-busy={cargando} aria-label="Unidades" className="space-y-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:gap-3">
          <input
            type="search"
            aria-label="Buscar unidades por modelo, patente o código"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por modelo, patente o código"
            className={campo + " md:w-72 md:shrink-0 md:py-1.5"}
          />
          <div className="hidden min-w-0 flex-1 grid-cols-3 gap-2 md:grid">{controles}</div>
        </div>

        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label="Filtrar por estado"
            className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0"
          >
            {ESTADOS.map((e) => (
              <button
                key={e}
                type="button"
                aria-pressed={estado === e}
                onClick={() => setEstado(e)}
                className={
                  "chip chip-btn shrink-0 transition-colors " +
                  (estado === e ? "bg-primary text-bg" : "bg-subtle text-fg hover:bg-border")
                }
              >
                {rotuloFiltroEstado[e]}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setFiltros(true)}
            className={botonSecundario + " shrink-0 gap-1.5 md:hidden"}
          >
            <SlidersHorizontal size={14} aria-hidden="true" />
            Filtros ({filtrosActivos})
          </button>
        </div>

        <p className="dato text-xs text-muted" aria-live="polite">
          {cargando ? "—" : visibles.length} unidades
        </p>

        {cargando ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <Esqueleto key={i} className="h-36" />
            ))}
          </div>
        ) : error ? null : visibles.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visibles.map((u) => (
              <li key={u.id} className="surface-card relative p-3 transition-colors hover:bg-subtle">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="dato text-xs text-muted">
                      {u.id} · {u.anio}
                    </p>
                    <button
                      type="button"
                      onClick={() => abrir(u)}
                      className="block max-w-full truncate text-left font-heading text-base font-bold after:absolute after:inset-0 after:content-['']"
                    >
                      {u.marca} {u.modelo}
                      <span className="sr-only"> {u.version}. Abrir ficha</span>
                    </button>
                    <p className="truncate text-xs text-muted">{u.version}</p>
                  </div>
                  <span className={"chip " + chipUnidad[u.estado]}>{rotuloEstadoUnidad[u.estado] ?? u.estado}</span>
                </div>
                <p className="patente mt-2 inline-block rounded border border-border bg-subtle px-2 py-0.5 text-xs">
                  {u.patente ?? "SIN PATENTAR"}
                </p>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <p className="precio text-2xl leading-none text-fg">{usd(u.precio)}</p>
                  <p className="dato text-right text-xs text-muted">{fmtKm(u.km)}</p>
                </div>
                <p className="dato mt-2 flex items-center gap-2 text-xs text-muted">
                  En stock:
                  {u.estado === "vendida" ? (
                    <span>—</span>
                  ) : (
                    <span className={"chip " + chipAging[nivelDeAging(u.diasPlaya)]}>{u.diasPlaya} días</span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="surface-card py-10 text-center text-sm text-muted">No hay unidades con esos filtros.</p>
        )}

        {!cargando && (
          <p className="text-xs text-muted">
            Días en stock: verde hasta {theme.aging.fresco}, ámbar hasta {theme.aging.tibio}, rojo desde ahí. Las unidades
            vendidas no cuentan días.
          </p>
        )}
      </section>

      {/* Filtros en celular: el resto de los controles, en una hoja. */}
      <FichaLateral
        abierta={filtros}
        titulo="Filtros"
        subtitulo={`${visibles.length} unidades`}
        onCerrar={() => setFiltros(false)}
        acciones={
          <>
            <button type="button" onClick={() => setFiltros(false)} className={botonPrimario}>
              Ver {visibles.length} unidades
            </button>
            <button type="button" onClick={limpiar} className={botonSecundario}>
              Limpiar
            </button>
          </>
        }
      >
        <div className="space-y-4">{controles}</div>
      </FichaLateral>

      <FichaLateral
        abierta={!!sel}
        titulo={sel ? `${sel.marca} ${sel.modelo}` : ""}
        subtitulo={sel ? `${sel.version} · ${sel.id}` : undefined}
        onCerrar={() => setSel(null)}
        acciones={
          sel && (
            <>
              <button type="button" onClick={() => setAviso("Enviar cotización. Demo: no se guardó nada")} className={botonPrimario}>
                Enviar cotización
              </button>
              <button type="button" onClick={() => setAviso("Agendar test drive. Demo: no se guardó nada")} className={botonSecundario}>
                Agendar test drive
              </button>
              {sel.estado === "disponible" && (
                <button
                  type="button"
                  onClick={() => cambiarEstado(sel, "reservada", "Reservar unidad")}
                  className={botonSecundario}
                >
                  Reservar unidad
                </button>
              )}
              {(sel.estado === "reservada" || sel.estado === "seniada" || sel.estado === "en preparacion") && (
                <button
                  type="button"
                  onClick={() => cambiarEstado(sel, "disponible", sel.estado === "en preparacion" ? "Marcar disponible" : "Liberar unidad")}
                  className={botonSecundario}
                >
                  {sel.estado === "en preparacion" ? "Marcar disponible" : "Liberar unidad"}
                </button>
              )}
            </>
          )
        }
      >
        {sel && (
          <div>
            <p className="patente inline-block rounded border border-border bg-subtle px-3 py-1.5 text-sm">
              {sel.patente ?? "SIN PATENTAR"}
            </p>
            <p className="precio mt-3 text-4xl leading-none text-fg">{usd(sel.precio)}</p>
            <p className="dato mt-1 text-xs text-muted">o {ars(sel.cuota)} / mes · 48 cuotas</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className={"chip " + chipUnidad[sel.estado]}>{rotuloEstadoUnidad[sel.estado] ?? sel.estado}</span>
              {esUsadoEnPlaya && (
                <span className={"chip " + chipBanda[nivelDeBanda(desvio)]}>
                  {desvio >= 0 ? "+" : ""}
                  {desvio.toFixed(1)}% vs referencia
                </span>
              )}
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
              <DatoFicha etiqueta="Código">{sel.id}</DatoFicha>
              <DatoFicha etiqueta="Año">{sel.anio}</DatoFicha>
              <DatoFicha etiqueta="Kilometraje">{fmtKm(sel.km)}</DatoFicha>
              <DatoFicha etiqueta="Condición">{sel.km === 0 ? "0 km" : "usado"}</DatoFicha>
              <DatoFicha etiqueta="Motor">{sel.motor}</DatoFicha>
              <DatoFicha etiqueta="Caja">{rotuloCaja[sel.caja] ?? sel.caja}</DatoFicha>
              <DatoFicha etiqueta="Combustible">{rotuloCombustible[sel.combustible] ?? sel.combustible}</DatoFicha>
              <DatoFicha etiqueta="Color">{sel.color}</DatoFicha>
              <DatoFicha etiqueta="Segmento">{rotuloSegmento[sel.segmento] ?? sel.segmento}</DatoFicha>
              <DatoFicha etiqueta="Días en stock">
                {sel.estado === "vendida" ? (
                  "—"
                ) : (
                  <span className={"chip " + chipAging[nivelDeAging(sel.diasPlaya)]}>{sel.diasPlaya} días</span>
                )}
              </DatoFicha>
              <DatoFicha etiqueta="Precio de referencia">
                {esUsadoEnPlaya ? usd(Math.round(precioReferencia(sel.km))) : "—"}
              </DatoFicha>
            </dl>
            <AvisoDemo texto={aviso} />
          </div>
        )}
      </FichaLateral>
    </div>
  )
}
