"use client"
import { useMemo, useState } from "react"
import { getBoletos, type Boleto, type EstadoBoleto } from "./api"
import { usd } from "@/shell/automotora"
import { Esqueleto, ErrorCarga, useCarga } from "@/shell/carga"
import { FichaLateral, DatoFicha, AvisoDemo, botonPrimario, botonSecundario } from "@/shell/ficha-lateral"

// boleto-slips: cada venta es un comprobante, no una fila de tabla. La tarjeta trae lo que se
// lee de un vistazo (comprador, unidad, patente, precio, forma de pago); el resto de la plata
// (seña, saldo, comision) esta en la ficha del boleto, que se abre con un clic.

// Tailwind no ve clases armadas por concatenacion: mapa literal.
const chipEstado: Record<EstadoBoleto, string> = {
  cobrada: "bg-success/15 text-success",
  pendiente: "bg-warning/15 text-warning",
  rechazada: "bg-danger/10 text-danger",
  anulada: "bg-info/15 text-info", // estado neutro, no es un error: no va en danger
}
const bordeEstado: Record<EstadoBoleto, string> = {
  cobrada: "border-t-success",
  pendiente: "border-t-warning",
  rechazada: "border-t-danger",
  anulada: "border-t-info",
}

const FILTROS: (EstadoBoleto | "todas")[] = ["todas", "cobrada", "pendiente", "rechazada", "anulada"]

// Una venta rechazada o anulada no genera comision.
const comisionDe = (b: Boleto, estado: EstadoBoleto) => (estado === "cobrada" || estado === "pendiente" ? b.comision : 0)

export function VentasPage() {
  const { data, cargando, error, reintentar } = useCarga(getBoletos)
  const [filtro, setFiltro] = useState<EstadoBoleto | "todas">("todas")
  const [selId, setSelId] = useState<string | null>(null)
  // Cambios de estado de la demo: solo en memoria (F5 vuelve a la data real).
  const [cambios, setCambios] = useState<Record<string, EstadoBoleto>>({})
  const [aviso, setAviso] = useState<string | null>(null)

  const boletos = useMemo(
    () => (data ?? []).map((b) => ({ ...b, estado: cambios[b.id] ?? b.estado })),
    [data, cambios],
  )
  const visibles = boletos.filter((b) => filtro === "todas" || b.estado === filtro)
  const cobradas = boletos.filter((b) => b.estado === "cobrada")
  const cobrado = cobradas.reduce((s, b) => s + b.precio, 0)
  const comisiones = cobradas.reduce((s, b) => s + b.comision, 0)
  const sel = boletos.find((b) => b.id === selId) ?? null

  const abrir = (b: Boleto) => {
    setAviso(null)
    setSelId(b.id)
  }
  const cambiarEstado = (b: Boleto, nuevo: EstadoBoleto, accion: string) => {
    setCambios((c) => ({ ...c, [b.id]: nuevo }))
    setAviso(`${accion}. Demo: no se guardó nada`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">Ventas</h1>
          <p className="text-xs text-muted">Boletos de compraventa emitidos. Tocá uno para ver el detalle.</p>
        </div>
        <div className="flex gap-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted">Cobrado</p>
            <p className="precio text-xl text-success">{cargando ? "—" : usd(cobrado)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted">Comisiones cobradas</p>
            <p className="precio text-xl text-fg">{cargando ? "—" : usd(comisiones)}</p>
          </div>
        </div>
      </div>

      {error && <ErrorCarga onReintentar={reintentar} />}

      <section aria-busy={cargando} aria-label="Boletos" className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-3">
          <div role="group" aria-label="Filtrar por estado" className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto md:flex-wrap">
            {FILTROS.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filtro === f}
                onClick={() => setFiltro(f)}
                className={
                  "chip chip-btn shrink-0 transition-colors " +
                  (filtro === f ? "bg-primary text-bg" : "bg-subtle text-fg hover:bg-border")
                }
              >
                {f}
              </button>
            ))}
          </div>
          <span className="dato text-xs text-muted" aria-live="polite">
            {cargando ? "—" : visibles.length} boletos
          </span>
        </div>

        {cargando ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <Esqueleto key={i} className="h-32" />
            ))}
          </div>
        ) : error ? null : visibles.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visibles.map((b) => (
              <li
                key={b.id}
                className={"surface-card relative border-t-[3px] p-4 transition-colors hover:bg-subtle " + bordeEstado[b.estado]}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="dato text-xs uppercase tracking-wider text-muted">
                      {b.id} · {b.fecha}
                    </p>
                    <button
                      type="button"
                      onClick={() => abrir(b)}
                      className="block max-w-full truncate text-left font-heading text-sm font-bold after:absolute after:inset-0 after:content-['']"
                    >
                      {b.comprador}
                      <span className="sr-only">. Abrir boleto</span>
                    </button>
                  </div>
                  <span className={"chip " + chipEstado[b.estado]}>{b.estado}</span>
                </div>
                <p className="mt-2 truncate text-xs text-muted">{b.unidad}</p>
                <p className="patente mt-1 inline-block rounded bg-subtle px-1.5 py-0.5 text-xs">
                  {b.patente ?? "SIN PATENTAR"}
                </p>
                <div className="mt-3 flex items-baseline justify-between gap-2 border-t border-dashed border-border pt-2">
                  <p className="precio text-lg text-fg">{usd(b.precio)}</p>
                  <p className="text-xs text-muted">{b.formaPago}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="surface-card py-10 text-center text-sm text-muted">No hay boletos con ese estado.</p>
        )}
      </section>

      <FichaLateral
        abierta={!!sel}
        titulo={sel ? sel.comprador : ""}
        subtitulo={sel ? `${sel.id} · ${sel.fecha}` : undefined}
        onCerrar={() => setSelId(null)}
        acciones={
          sel && (
            <>
              {sel.estado === "pendiente" && (
                <button type="button" onClick={() => cambiarEstado(sel, "cobrada", "Registrar cobro")} className={botonPrimario}>
                  Registrar cobro
                </button>
              )}
              {(sel.estado === "cobrada" || sel.estado === "anulada") && (
                <button type="button" onClick={() => setAviso("Enviar boleto. Demo: no se guardó nada")} className={botonPrimario}>
                  Enviar boleto
                </button>
              )}
              {sel.estado === "rechazada" && (
                <button
                  type="button"
                  onClick={() => cambiarEstado(sel, "pendiente", "Reintentar financiación")}
                  className={botonPrimario}
                >
                  Reintentar financiación
                </button>
              )}
              {(sel.estado === "pendiente" || sel.estado === "rechazada") && (
                <button type="button" onClick={() => setAviso("Enviar boleto. Demo: no se guardó nada")} className={botonSecundario}>
                  Enviar boleto
                </button>
              )}
              {(sel.estado === "pendiente" || sel.estado === "cobrada") && (
                <button type="button" onClick={() => cambiarEstado(sel, "anulada", "Anular boleto")} className={botonSecundario}>
                  Anular boleto
                </button>
              )}
            </>
          )
        }
      >
        {sel && (
          <div>
            <span className={"chip " + chipEstado[sel.estado]}>{sel.estado}</span>
            <p className="precio mt-3 text-4xl leading-none text-fg">{usd(sel.precio)}</p>
            <p className="mt-1 text-xs text-muted">{sel.unidad}</p>
            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
              <DatoFicha etiqueta="Código">{sel.id}</DatoFicha>
              <DatoFicha etiqueta="Fecha">{sel.fecha}</DatoFicha>
              <DatoFicha etiqueta="Comprador">{sel.comprador}</DatoFicha>
              <DatoFicha etiqueta="Patente">
                <span className="patente text-xs">{sel.patente ?? "SIN PATENTAR"}</span>
              </DatoFicha>
              <DatoFicha etiqueta="Forma de pago">{sel.formaPago}</DatoFicha>
              <DatoFicha etiqueta="Vendedor">{sel.vendedor}</DatoFicha>
              <DatoFicha etiqueta="Seña">
                {usd(sel.sena)} <span className="text-xs text-muted">({Math.round((sel.sena / sel.precio) * 100)}% del precio)</span>
              </DatoFicha>
              <DatoFicha etiqueta="Saldo">{usd(sel.precio - sel.sena)}</DatoFicha>
              <DatoFicha etiqueta="Comisión">
                {comisionDe(sel, sel.estado) ? (
                  <>
                    {usd(comisionDe(sel, sel.estado))}{" "}
                    <span className="text-xs text-muted">({Math.round((sel.comision / sel.precio) * 100)}%)</span>
                  </>
                ) : (
                  "—"
                )}
              </DatoFicha>
            </dl>
            <AvisoDemo texto={aviso} />
          </div>
        )}
      </FichaLateral>
    </div>
  )
}
