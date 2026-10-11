// panel-odometro · ARQUETIPO DE KPI NUEVO.
// No es "anillos cortado a la mitad": lo que lo define es la AGUJA y la ZONA REDLINE.
// Un anillo dice "cuanto llevo". Un dial de tablero dice "a que ritmo voy y donde
// empieza el peligro". Por eso hay aguja, y por eso hay redline.
// Estatico: la aguja apunta al valor sin barrido (decision de Lucas, 2026-10-11: sin animaciones decorativas).

export type Dial = {
  id: string
  label: string
  valor: number | null // null mientras carga: se muestra "—", nunca un 0 falso
  max: number
  redlineDesde: number // el limite de la zona roja
  unidad: string
  // Por defecto la zona roja esta ARRIBA (mucho = mal: aging, leads frios).
  // Con `invertido`, la zona roja esta ABAJO (poco = mal: ventas contra la meta).
  invertido?: boolean
}

const R = 48 // radio de la pista
const R_REDLINE = 56 // la zona roja va POR FUERA de la pista, como el redline pintado de un tacometro
const CX = 60
const CY = 60

// frac 0 = extremo izquierdo del arco, frac 1 = extremo derecho.
function punto(frac: number, radio: number) {
  const t = Math.PI - frac * Math.PI
  return { x: CX + radio * Math.cos(t), y: CY - radio * Math.sin(t) }
}

function arco(desde: number, hasta: number, radio: number = R) {
  const a = punto(desde, radio)
  const b = punto(hasta, radio)
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${radio} ${radio} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`
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
  const valor = d.valor ?? 0
  const frac = Math.max(0, Math.min(valor / d.max, 1))
  const fracRedline = Math.max(0, Math.min(d.redlineDesde / d.max, 1))
  const enRedline = d.valor !== null && (d.invertido ? frac <= fracRedline : frac >= fracRedline)
  const estado = enRedline ? "redline" : "normal"
  const sufijo = d.unidad ? " " + d.unidad : ""
  const grados = (frac - 0.5) * 180
  // La zona roja se dibuja en su propio radio, fuera de la pista: si viviera sobre la
  // pista, el arco de valor la taparia cuando la aguja la cruza. Eso pasaba en los
  // diales `invertido` (zona roja abajo), donde el valor arranca justo encima de ella.
  const zonaRoja = d.invertido
    ? arco(0, Math.max(fracRedline, 0.001), R_REDLINE)
    : arco(fracRedline, 1, R_REDLINE)

  return (
    <div className="flex flex-col items-center">
      {/* El arco es solo para escritorio: en celular los indicadores van en una fila compacta de cifras. */}
      <svg viewBox="0 0 120 70" className="hidden w-full max-w-[9rem] md:block" aria-hidden="true" focusable="false">
        {/* pista */}
        <path d={arco(0, 1)} className="stroke-border" strokeWidth={7} fill="none" strokeLinecap="round" />
        {/* recorrido real */}
        <path
          d={arco(0, Math.max(frac, 0.001))}
          className={trazoValor[estado]}
          strokeWidth={7}
          fill="none"
          strokeLinecap="round"
        />
        {/* zona redline: donde deja de ser un ritmo y pasa a ser un problema.
            Va afuera y ultima, asi ningun arco de valor puede taparla. */}
        <path d={zonaRoja} className="stroke-danger/80" strokeWidth={3.5} fill="none" strokeLinecap="round" />
        {/* la aguja: esto es lo que lo hace un tablero y no un anillo */}
        <g style={{ transform: `rotate(${grados}deg)`, transformOrigin: `${CX}px ${CY}px` }}>
          <line x1={CX} y1={CY} x2={CX} y2={CY - R + 6} className="stroke-fg" strokeWidth={2} strokeLinecap="round" />
          <circle cx={CX} cy={CY - R + 8} r={2.5} className="fill-accent" />
        </g>
        <circle cx={CX} cy={CY} r={5} className="fill-surface stroke-border" strokeWidth={1.5} />
      </svg>

      <p className={"precio text-2xl leading-none md:-mt-3 " + textoValor[estado]}>
        {d.valor === null ? "—" : d.valor.toLocaleString("es-AR")}
        <span className="ml-1 text-xs font-normal text-muted">{d.unidad}</span>
        {enRedline && <span className="sr-only"> (en zona roja)</span>}
      </p>
      <p className="mt-1 text-center text-xs uppercase tracking-wider text-muted">{d.label}</p>
      {/* Leyenda inline: el rango de la escala y donde empieza la zona roja. */}
      <p className="dato text-center text-xs text-muted">
        de {d.max.toLocaleString("es-AR")}
        {sufijo} · zona roja {d.invertido ? "hasta" : "desde"} {d.redlineDesde.toLocaleString("es-AR")}
        {sufijo}
      </p>
    </div>
  )
}

export function PanelOdometro({ diales }: { diales: Dial[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-4 lg:grid-cols-4">
      {diales.map((d) => (
        <Odometro key={d.id} d={d} />
      ))}
    </div>
  )
}
