"use client"
// panel-odometro · ARQUETIPO DE KPI NUEVO.
// No es "anillos cortado a la mitad": lo que lo define es la AGUJA y la ZONA REDLINE.
// Un anillo dice "cuanto llevo". Un dial de tablero dice "a que ritmo voy y donde
// empieza el peligro". Por eso hay aguja, y por eso hay redline.
// La aguja barre desde cero al montar (animacion `aguja` en globals.css).

export type Dial = {
  id: string
  label: string
  valor: number
  max: number
  redlineDesde: number // el limite de la zona roja
  unidad: string
  // Por defecto la zona roja esta ARRIBA (mucho = mal: aging, leads frios).
  // Con `invertido`, la zona roja esta ABAJO (poco = mal: ventas contra la meta).
  invertido?: boolean
}

const R = 48
const CX = 60
const CY = 60

// frac 0 = extremo izquierdo del arco, frac 1 = extremo derecho.
function punto(frac: number) {
  const t = Math.PI - frac * Math.PI
  return { x: CX + R * Math.cos(t), y: CY - R * Math.sin(t) }
}

function arco(desde: number, hasta: number) {
  const a = punto(desde)
  const b = punto(hasta)
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${R} ${R} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`
}

// Tailwind no ve clases armadas por concatenacion: mapa literal.
const trazoValor: Record<"normal" | "redline", string> = {
  normal: "stroke-primary",
  redline: "stroke-danger",
}
const textoValor: Record<"normal" | "redline", string> = {
  normal: "text-fg",
  redline: "text-danger",
}

export function Odometro({ d }: { d: Dial }) {
  const frac = Math.max(0, Math.min(d.valor / d.max, 1))
  const fracRedline = Math.max(0, Math.min(d.redlineDesde / d.max, 1))
  const enRedline = d.invertido ? frac <= fracRedline : frac >= fracRedline
  const estado = enRedline ? "redline" : "normal"
  const grados = (frac - 0.5) * 180
  const zonaRoja = d.invertido ? arco(0, Math.max(fracRedline, 0.001)) : arco(fracRedline, 1)

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 70" className="w-full max-w-[9rem]">
        {/* pista */}
        <path d={arco(0, 1)} className="stroke-border" strokeWidth={7} fill="none" strokeLinecap="round" />
        {/* zona redline: donde deja de ser un ritmo y pasa a ser un problema */}
        <path d={zonaRoja} className="stroke-danger/35" strokeWidth={7} fill="none" strokeLinecap="round" />
        {/* recorrido real */}
        <path
          d={arco(0, Math.max(frac, 0.001))}
          className={trazoValor[estado]}
          strokeWidth={7}
          fill="none"
          strokeLinecap="round"
        />
        {/* la aguja: esto es lo que lo hace un tablero y no un anillo */}
        <g className="aguja" style={{ transform: `rotate(${grados}deg)`, transformOrigin: `${CX}px ${CY}px` }}>
          <line x1={CX} y1={CY} x2={CX} y2={CY - R + 6} className="stroke-fg" strokeWidth={2} strokeLinecap="round" />
          <circle cx={CX} cy={CY - R + 8} r={2.5} className="fill-accent" />
        </g>
        <circle cx={CX} cy={CY} r={5} className="fill-surface stroke-border" strokeWidth={1.5} />
      </svg>

      <p className={"precio -mt-3 text-2xl leading-none " + textoValor[estado]}>
        {d.valor.toLocaleString("es-AR")}
        <span className="ml-1 text-[0.6rem] font-normal text-muted">{d.unidad}</span>
      </p>
      <p className="mt-1 text-center text-[10px] uppercase tracking-widest text-muted">{d.label}</p>
    </div>
  )
}

export function PanelOdometro({ diales }: { diales: Dial[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {diales.map((d) => (
        <Odometro key={d.id} d={d} />
      ))}
    </div>
  )
}
