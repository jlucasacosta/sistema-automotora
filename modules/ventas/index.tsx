"use client"
import { useEffect, useState } from "react"
import { getBoletos, type Boleto, type EstadoBoleto } from "./api"
import { usd } from "@/shell/automotora"

// boleto-slips: cada venta es un comprobante, no una fila de tabla. Se lee de arriba
// hacia abajo como un boleto de compraventa: comprador, unidad, patente, plata.

// Tailwind no ve `bg-${x}`: mapa literal.
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

function Linea({ label, valor, fuerte }: { label: string; valor: string; fuerte?: boolean }) {
  return (
    <p className="flex items-baseline justify-between gap-2 text-[0.6875rem]">
      <span className="text-muted">{label}</span>
      <span className={"dato " + (fuerte ? "precio text-sm text-fg" : "text-fg")}>{valor}</span>
    </p>
  )
}

export function VentasPage() {
  const [boletos, setBoletos] = useState<Boleto[]>([])
  const [filtro, setFiltro] = useState<EstadoBoleto | "todas">("todas")

  useEffect(() => {
    getBoletos().then(setBoletos)
  }, [])

  const visibles = boletos.filter((b) => filtro === "todas" || b.estado === filtro)
  const cobrado = boletos.filter((b) => b.estado === "cobrada").reduce((s, b) => s + b.precio, 0)
  const comisiones = boletos.reduce((s, b) => s + b.comision, 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">Ventas</h1>
          <p className="text-[0.6875rem] text-muted">Boletos de compraventa emitidos.</p>
        </div>
        <div className="flex gap-6">
          <div>
            <p className="text-[0.625rem] uppercase tracking-widest text-muted">Cobrado</p>
            <p className="precio text-xl text-success">{usd(cobrado)}</p>
          </div>
          <div>
            <p className="text-[0.625rem] uppercase tracking-widest text-muted">Comisiones</p>
            <p className="precio text-xl text-fg">{usd(comisiones)}</p>
          </div>
        </div>
      </div>

      <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap items-center gap-1.5 border-b border-border pb-3">
        {FILTROS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filtro === f}
            onClick={() => setFiltro(f)}
            className={"chip chip-btn transition-colors " + (filtro === f ? "bg-primary text-bg" : "bg-subtle text-muted hover:text-fg")}
          >
            {f}
          </button>
        ))}
        <span className="dato ml-auto text-[0.625rem] text-muted">{visibles.length} boletos</span>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visibles.map((b) => {
          const saldo = b.precio - b.sena
          return (
            <li key={b.id} className={"surface-card border-t-[3px] p-4 " + bordeEstado[b.estado]}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="dato text-[0.625rem] uppercase tracking-widest text-muted">
                    {b.id} · {b.fecha}
                  </p>
                  <p className="truncate font-heading text-sm font-bold">{b.comprador}</p>
                </div>
                <span className={"chip " + chipEstado[b.estado]}>{b.estado}</span>
              </div>

              <p className="mt-2 truncate text-[0.6875rem] text-muted">{b.unidad}</p>
              <p className="patente mt-1 inline-block rounded bg-subtle px-1.5 py-0.5 text-[0.625rem]">
                {b.patente ?? "SIN PATENTAR"}
              </p>

              <div className="mt-3 space-y-1 border-t border-dashed border-border pt-2">
                <Linea label="Precio" valor={usd(b.precio)} fuerte />
                <Linea label="Seña" valor={usd(b.sena)} />
                <Linea label="Saldo" valor={usd(saldo)} />
                <Linea label="Forma de pago" valor={b.formaPago} />
                <Linea label="Vendedor" valor={b.vendedor} />
                <Linea label="Comisión" valor={b.comision ? usd(b.comision) : "—"} />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
