// scatter-precio-km · ARQUETIPO DE GRAFICO NUEVO.
// Codifica TRES dimensiones: x = kilometraje, y = precio USD, tamaño = dias en playa.
// La banda diagonal es el corredor de precio de referencia (theme.banda). Lo que queda
// arriba de la banda esta sobrevaluado y no se vende; lo que queda abajo es oportunidad.
// Un donut dice "parte de un todo". La historia de una playa es precio contra kilometros.
//
// Los ejes salen de los datos y de la banda (no hay un maximo escrito a mano): si movés
// `theme.banda.base`, el lienzo se re-escala en vez de dejar la banda fuera de cuadro.
import { nivelDeBanda, precioReferencia, puntoBanda, usd, type NivelBanda } from "./automotora"
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

// Texto para quien no ve el color: el estado respecto de la banda.
const textoBanda: Record<NivelBanda, string> = {
  oportunidad: "por debajo de la referencia",
  justo: "dentro de la referencia",
  sobre: "por encima de la referencia",
}

export function ScatterPrecioKm({ puntos }: { puntos: Punto[] }) {
  const ref = precioReferencia
  const alto = (km: number) => ref(km) * (1 + theme.banda.sobre / 100)
  const bajo = (km: number) => ref(km) * (1 + theme.banda.oportunidad / 100)

  // Dominio: lo que ocupen los puntos y la banda, redondeado a numeros "de eje".
  const kmMax = Math.ceil(Math.max(1, ...puntos.map((p) => p.km)) / 10000) * 10000 + 10000
  const precioMin =
    Math.floor(Math.min(...puntos.map((p) => p.precio), bajo(kmMax)) / 5000) * 5000
  const precioMax =
    Math.ceil(Math.max(...puntos.map((p) => p.precio), alto(0)) / 5000) * 5000

  const x = (km: number) => PAD.l + (km / kmMax) * (W - PAD.l - PAD.r)
  const y = (p: number) => H - PAD.b - ((p - precioMin) / (precioMax - precioMin)) * (H - PAD.t - PAD.b)

  // El corredor: poligono entre el techo y el piso de la banda.
  const banda = [
    `${x(0)},${y(alto(0))}`,
    `${x(kmMax)},${y(alto(kmMax))}`,
    `${x(kmMax)},${y(bajo(kmMax))}`,
    `${x(0)},${y(bajo(0))}`,
  ].join(" ")

  const ticksKm: number[] = []
  for (let k = 0; k <= kmMax; k += 50000) ticksKm.push(k)
  const ticksPrecio: number[] = []
  for (let p = precioMin + 5000; p <= precioMax; p += 10000) ticksPrecio.push(p)

  const filas = puntos.map((p) => {
    const desvio = (p.precio / ref(p.km) - 1) * 100
    return { p, desvio, nivel: nivelDeBanda(desvio) }
  })

  return (
    <>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Gráfico de precio contra kilometraje de las unidades usadas. El detalle de cada unidad está en la tabla que sigue."
      >
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

        {filas.map(({ p, desvio, nivel }) => {
          const r = 3.5 + Math.min(p.diasPlaya, 160) / 32
          return (
            <circle
              key={p.id}
              cx={x(p.km)}
              cy={y(p.precio)}
              r={r}
              className={puntoBanda[nivel] + " stroke-bg"}
              strokeWidth={1}
              opacity={0.9}
            >
              <title>{`${p.etiqueta} · ${usd(p.precio)} · ${p.km.toLocaleString("es-AR")} km · ${p.diasPlaya} días en stock · ${desvio >= 0 ? "+" : ""}${desvio.toFixed(1)}% vs referencia`}</title>
            </circle>
          )
        })}
      </svg>

      {/* Los mismos datos del grafico, para lector de pantalla: el color solo no alcanza. */}
      {/* El sr-only va en un div: en una <table> el ancho de 1px se ignora y la tabla ensancha la página en mobile. */}
      <div className="sr-only">
      <table>
        <caption>Unidades usadas: precio, kilometraje, días en stock y posición respecto de la banda de referencia</caption>
        <thead>
          <tr>
            <th scope="col">Unidad</th>
            <th scope="col">Precio</th>
            <th scope="col">Kilometraje</th>
            <th scope="col">Días en stock</th>
            <th scope="col">Posición</th>
          </tr>
        </thead>
        <tbody>
          {filas.map(({ p, desvio, nivel }) => (
            <tr key={p.id}>
              <th scope="row">{p.etiqueta}</th>
              <td>{usd(p.precio)}</td>
              <td>{p.km.toLocaleString("es-AR")} km</td>
              <td>{p.diasPlaya}</td>
              <td>
                {textoBanda[nivel]} ({desvio >= 0 ? "+" : ""}
                {desvio.toFixed(1)}%)
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  )
}
