"use client"
import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { getDiales, getResumen, type Resumen } from "./api"
import { getUsados, type Unidad } from "@/modules/catalogo/api"
import { PanelOdometro, type Dial } from "@/shell/odometro"
import { ScatterPrecioKm } from "@/shell/scatter"
import { chipAging, nivelDeAging, usd, km as fmtKm } from "@/shell/automotora"

// mosaico-mando · ARQUETIPO DE DATOS NUEVO.
// No es una grilla 4-up de stat-tiles: los spans son heterogeneos de verdad.
// 1x1 la cifra del embudo · 3x1 el panel de odometros · 3x2 el scatter · 1x2 la playa.
// Sin feed de actividad: eliminado a proposito (DISENO.md).

export function DashboardPage() {
  const [diales, setDiales] = useState<Dial[]>([])
  const [resumen, setResumen] = useState<Resumen | null>(null)
  const [usados, setUsados] = useState<Unidad[]>([])

  useEffect(() => {
    getDiales().then(setDiales)
    getResumen().then(setResumen)
    getUsados().then(setUsados)
  }, [])

  const playa = [...usados].sort((a, b) => b.diasPlaya - a.diasPlaya).slice(0, 9)

  return (
    <div className="space-y-3">
      <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">Panel general</h1>

      <div className="grid gap-3 lg:grid-cols-4">
        {/* 1x1 — la cifra que se lee de reojo */}
        <div className="surface-card flex flex-col justify-between p-4">
          <p className="text-[10px] uppercase tracking-widest text-muted">Valor del pipeline</p>
          <p className="precio text-4xl leading-none text-fg">
            {resumen ? usd(resumen.valorEmbudo) : "—"}
          </p>
          {resumen && (
            <div className="mt-3 space-y-1">
              <p className="dato flex items-center justify-between text-[11px]">
                <span className="text-muted">Señas activas</span>
                <span className="text-success">{resumen.seniasActivas}</span>
              </p>
              <p className="dato flex items-center justify-between text-[11px]">
                <span className="text-muted">Señas vencidas</span>
                <span className="flex items-center gap-1 font-semibold text-danger">
                  <AlertTriangle size={11} strokeWidth={2.5} />
                  {resumen.seniasVencidas}
                </span>
              </p>
              <p className="dato flex items-center justify-between text-[11px]">
                <span className="text-muted">Entregas hoy</span>
                <span className="text-fg">{resumen.entregasHoy}</span>
              </p>
            </div>
          )}
        </div>

        {/* 3x1 — el panel de odometros: aguja + redline, no anillos */}
        <div className="surface-card p-4 lg:col-span-3">
          <h2 className="mb-2 font-heading text-[11px] font-bold uppercase tracking-widest text-muted">
            Indicadores del mes
          </h2>
          {diales.length ? <PanelOdometro diales={diales} /> : <div className="h-32 animate-pulse rounded bg-subtle" />}
        </div>

        {/* 3x2 — el scatter se queda con el lugar del feed eliminado */}
        <div className="surface-card p-4 lg:col-span-3 lg:row-span-2">
          <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-heading text-[11px] font-bold uppercase tracking-widest text-muted">
              Precio contra kilometraje · unidades usadas
            </h2>
            <p className="text-[10px] text-muted">
              tamaño del punto = dias en stock · sobre la banda = precio por encima de la referencia
            </p>
          </div>
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
          ) : (
            <div className="h-56 animate-pulse rounded bg-subtle" />
          )}
          <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-muted">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-danger" /> por encima de la referencia
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-primary" /> dentro de la referencia
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-success" /> por debajo de la referencia
            </span>
          </div>
        </div>

        {/* 1x2 — la playa por antiguedad: plata quieta */}
        <div className="surface-card p-4 lg:row-span-2">
          <h2 className="mb-2 font-heading text-[11px] font-bold uppercase tracking-widest text-muted">
            Unidades con mayor antiguedad
          </h2>
          <ul className="max-h-[26rem] space-y-2 overflow-y-auto pr-1">
            {playa.map((u) => (
              <li key={u.id} className="border-b border-border pb-2 last:border-0">
                <p className="truncate font-heading text-xs font-semibold">
                  {u.marca} {u.modelo}
                </p>
                <p className="dato flex items-center justify-between text-[10px] text-muted">
                  <span>{fmtKm(u.km)}</span>
                  <span className="precio text-fg">{usd(u.precio)}</span>
                </p>
                <span className={"chip mt-1 " + chipAging[nivelDeAging(u.diasPlaya)]}>{u.diasPlaya} dias</span>
              </li>
            ))}
            {!playa.length && <li className="h-40 animate-pulse rounded bg-subtle" />}
          </ul>
        </div>
      </div>
    </div>
  )
}
