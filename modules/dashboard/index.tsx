"use client"
import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { getDiales, getResumen } from "./api"
import { getUsados } from "@/modules/catalogo/api"
import { PanelOdometro } from "@/shell/odometro"
import { ScatterPrecioKm } from "@/shell/scatter"
import { Esqueleto, ErrorCarga, useCarga } from "@/shell/carga"
import { chipAging, nivelDeAging, usd, km as fmtKm } from "@/shell/automotora"
import { theme } from "@/shell/theme"

// mosaico-mando · ARQUETIPO DE DATOS NUEVO.
// No es una grilla 4-up de stat-tiles: los spans son heterogeneos de verdad.
// 1x1 la cifra del embudo · 3x1 el panel de odometros · 3x2 el scatter · 1x2 la playa.
// Sin feed de actividad: eliminado a proposito (DISENO.md).

// Una sola carga para todo el tablero: si falla, hay un unico aviso con "Reintentar".
async function cargarTablero() {
  const [diales, resumen, usados] = await Promise.all([getDiales(), getResumen(), getUsados()])
  return { diales, resumen, usados }
}

const VISIBLES = 6

export function DashboardPage() {
  const { data, cargando, error, reintentar } = useCarga(cargarTablero)
  const [verTodo, setVerTodo] = useState(false)

  const resumen = data?.resumen
  const usados = data?.usados ?? []
  // La antigüedad solo habla de lo que sigue en la playa: getUsados ya excluye lo vendido.
  const playa = [...usados].sort((a, b) => b.diasPlaya - a.diasPlaya)
  const mostradas = verTodo ? playa : playa.slice(0, VISIBLES)

  return (
    <div className="space-y-3">
      <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">Panel</h1>

      {error && <ErrorCarga onReintentar={reintentar} />}

      <div aria-busy={cargando} className="grid gap-3 lg:grid-cols-4">
        {/* 1x1 — la cifra que se lee de reojo */}
        <div className="surface-card flex min-w-0 flex-col justify-between gap-3 p-4">
          <p className="text-xs uppercase tracking-wider text-muted">Valor del pipeline</p>
          <p className="precio text-4xl leading-none text-fg">{resumen ? usd(resumen.valorEmbudo) : "—"}</p>
          <div className="space-y-1">
            <p className="dato flex items-center justify-between text-xs">
              <span className="text-muted">Señas vigentes</span>
              <span className="text-fg">{resumen ? resumen.seniasVigentes : "—"}</span>
            </p>
            <p className="dato flex items-center justify-between text-xs">
              <span className="text-muted">Señas vencidas</span>
              <span className="flex items-center gap-1 font-semibold text-danger">
                {resumen && resumen.seniasVencidas > 0 && <AlertTriangle size={12} strokeWidth={2.5} aria-hidden="true" />}
                {resumen ? resumen.seniasVencidas : "—"}
              </span>
            </p>
            <p className="dato flex items-center justify-between text-xs">
              <span className="text-muted">Entregas hoy</span>
              <span className="text-fg">{resumen ? resumen.entregasHoy : "—"}</span>
            </p>
          </div>
        </div>

        {/* 3x1 — el panel de odometros: aguja + redline, no anillos */}
        <div className="surface-card min-w-0 p-4 lg:col-span-3">
          <h2 className="mb-2 font-heading text-xs font-bold uppercase tracking-wider text-muted">Indicadores del mes</h2>
          {data ? <PanelOdometro diales={data.diales} /> : cargando ? <Esqueleto className="h-32" /> : null}
        </div>

        {/* 3x2 — el scatter se queda con el lugar del feed eliminado */}
        <div className="surface-card min-w-0 p-4 lg:col-span-3 lg:row-span-2">
          <h2 className="mb-2 font-heading text-xs font-bold uppercase tracking-wider text-muted">
            Precio contra kilometraje · unidades usadas en la playa
          </h2>
          {usados.length ? (
            <ScatterPrecioKm
              puntos={usados.map((u) => ({
                id: u.id,
                etiqueta: `${u.marca} ${u.modelo} ${u.version}`,
                km: u.km,
                precio: u.precio,
                diasPlaya: u.diasPlaya,
              }))}
            />
          ) : cargando ? (
            <Esqueleto className="h-64" />
          ) : null}
          {/* Leyenda inline: la banda, el color y el tamaño del punto. Los umbrales salen del theme. */}
          <div className="mt-3 space-y-1.5 text-xs text-muted">
            <p>
              Eje vertical: precio en US$ (miles) · eje horizontal: kilometraje. La banda sombreada es el precio de
              referencia según los km, con un margen de {Math.abs(theme.banda.oportunidad)}% por debajo y {theme.banda.sobre}% por
              encima.
            </p>
            <p>El tamaño del punto es el tiempo en la playa: cuanto más grande, más días en stock.</p>
            <p className="flex flex-wrap gap-x-4 gap-y-1">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-danger" aria-hidden="true" /> más de {theme.banda.sobre}% sobre la referencia
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" /> dentro de la banda
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-success" aria-hidden="true" /> más de {Math.abs(theme.banda.oportunidad)}% bajo la referencia
              </span>
            </p>
          </div>
        </div>

        {/* 1x2 — la playa por antiguedad: plata quieta */}
        <div className="surface-card min-w-0 p-4 lg:row-span-2">
          <h2 className="mb-2 font-heading text-xs font-bold uppercase tracking-wider text-muted">
            Unidades con mayor antigüedad
          </h2>
          {cargando ? (
            <Esqueleto className="h-64" />
          ) : (
            <>
              <ul aria-label="Unidades con mayor antigüedad" className="space-y-2">
                {mostradas.map((u) => (
                  <li key={u.id} className="border-b border-border pb-2 last:border-0">
                    <p className="truncate font-heading text-sm font-semibold">
                      {u.marca} {u.modelo}
                    </p>
                    <p className="dato flex items-center justify-between text-xs text-muted">
                      <span>{fmtKm(u.km)}</span>
                      <span className="precio text-fg">{usd(u.precio)}</span>
                    </p>
                    <span className={"chip mt-1 " + chipAging[nivelDeAging(u.diasPlaya)]}>{u.diasPlaya} días</span>
                  </li>
                ))}
              </ul>
              {playa.length > VISIBLES && (
                <button
                  type="button"
                  aria-expanded={verTodo}
                  onClick={() => setVerTodo((v) => !v)}
                  className="tap mt-2 inline-flex items-center rounded-[var(--radius)] border border-border px-3 text-xs font-medium text-fg hover:bg-subtle"
                >
                  {verTodo ? "Ver menos" : `Ver todo (${playa.length})`}
                </button>
              )}
              <p className="mt-2 text-xs text-muted">
                Verde hasta {theme.aging.fresco} días, ámbar hasta {theme.aging.tibio}, rojo desde ahí.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
