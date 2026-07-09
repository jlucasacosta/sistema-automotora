"use client"
// scatter-precio-km · ARQUETIPO DE GRAFICO NUEVO.
// Codifica TRES dimensiones: x = kilometraje, y = precio USD, tamaño = dias en playa.
// La banda diagonal es el corredor de precio de referencia (theme.banda). Lo que queda
// arriba de la banda esta sobrevaluado y no se vende; lo que queda abajo es oportunidad.
// Un donut dice "parte de un todo". La historia de una playa es precio contra kilometros.
import { nivelDeBanda, puntoBanda, usd } from "./automotora"
import { theme } from "./theme"

export type Punto = {
  id: string
  etiqueta: string
  km: number
  precio: number
  diasPlaya: number
}

const W = 420
const H = 240
const PAD = { l: 44, r: 12, t: 12, b: 26 }

const KM_MAX = 190000
const PRECIO_MIN = 10000
const PRECIO_MAX = 45000

const x = (km: number) => PAD.l + (km / KM_MAX) * (W - PAD.l - PAD.r)
const y = (p: number) => H - PAD.b - ((p - PRECIO_MIN) / (PRECIO_MAX - PRECIO_MIN)) * (H - PAD.t - PAD.b)

const ref = (km: number) => Math.max(theme.banda.base - theme.banda.caida * km, 8000)

export function ScatterPrecioKm({ puntos }: { puntos: Punto[] }) {
  const alto = (km: number) => ref(km) * (1 + theme.banda.sobre / 100)
  const bajo = (km: number) => ref(km) * (1 + theme.banda.oportunidad / 100)

  // El corredor: poligono entre el techo y el piso de la banda.
  const banda = [
    `${x(0)},${y(alto(0))}`,
    `${x(KM_MAX)},${y(alto(KM_MAX))}`,
    `${x(KM_MAX)},${y(bajo(KM_MAX))}`,
    `${x(0)},${y(bajo(0))}`,
  ].join(" ")

  const ticksKm = [0, 50000, 100000, 150000]
  const ticksPrecio = [15000, 25000, 35000, 45000]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Precio contra kilometraje">
      {ticksPrecio.map((p) => (
        <g key={p}>
          <line x1={PAD.l} y1={y(p)} x2={W - PAD.r} y2={y(p)} className="stroke-border" strokeWidth={0.5} />
          <text x={PAD.l - 6} y={y(p) + 3} textAnchor="end" fontSize={8} className="fill-muted">
            {p / 1000}k
          </text>
        </g>
      ))}
      {ticksKm.map((k) => (
        <text key={k} x={x(k)} y={H - 8} textAnchor="middle" fontSize={8} className="fill-muted">
          {k / 1000}k km
        </text>
      ))}

      {/* corredor de precio justo */}
      <polygon points={banda} className="fill-primary/10 stroke-primary/40" strokeWidth={0.75} strokeDasharray="3 3" />

      {puntos.map((p) => {
        const desvio = (p.precio / ref(p.km) - 1) * 100
        const r = 3.5 + Math.min(p.diasPlaya, 160) / 32
        return (
          <circle
            key={p.id}
            cx={x(p.km)}
            cy={y(p.precio)}
            r={r}
            className={puntoBanda[nivelDeBanda(desvio)] + " stroke-bg"}
            strokeWidth={1}
            opacity={0.9}
          >
            <title>{`${p.etiqueta} · ${usd(p.precio)} · ${p.km.toLocaleString("es-AR")} km · ${p.diasPlaya} dias en stock · ${desvio >= 0 ? "+" : ""}${desvio.toFixed(1)}% vs referencia`}</title>
          </circle>
        )
      })}
    </svg>
  )
}
