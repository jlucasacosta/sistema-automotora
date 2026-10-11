// automotora.ts · El reloj de la playa y el semaforo del embudo, en un solo lugar.
// Los umbrales viven en theme.aging / theme.lead / theme.sena / theme.banda.
// Ningun componente inventa un numero magico ni escribe un color: solo pide la clase.
// Tailwind NO ve clases armadas por concatenacion: todos los mapas son literales.
import { theme } from "./theme"

// --- Antiguedad de la unidad en la playa: plata quieta ---
export type NivelAging = "fresco" | "tibio" | "aniejo"

export function nivelDeAging(dias: number): NivelAging {
  if (dias <= theme.aging.fresco) return "fresco"
  if (dias <= theme.aging.tibio) return "tibio"
  return "aniejo"
}

export const chipAging: Record<NivelAging, string> = {
  fresco: "bg-success/15 text-success",
  tibio: "bg-warning/15 text-warning",
  aniejo: "bg-danger/10 text-danger",
}
export const rellenoAging: Record<NivelAging, string> = {
  fresco: "bg-success",
  tibio: "bg-warning",
  aniejo: "bg-danger",
}
export const puntoAging: Record<NivelAging, string> = {
  fresco: "fill-success",
  tibio: "fill-warning",
  aniejo: "fill-danger",
}

// --- Temperatura del lead: dias sin contacto ---
export type NivelLead = "activo" | "tibio" | "frio"

export function nivelDeLead(diasSinContacto: number): NivelLead {
  if (diasSinContacto >= theme.lead.frio) return "frio"
  if (diasSinContacto >= theme.lead.tibio) return "tibio"
  return "activo"
}

export const chipLead: Record<NivelLead, string> = {
  activo: "bg-success/15 text-success",
  tibio: "bg-warning/15 text-warning",
  frio: "bg-danger/10 text-danger",
}
export const textoLead: Record<NivelLead, string> = {
  activo: "text-success",
  tibio: "text-warning",
  frio: "text-danger",
}
// El color nunca va solo: el rotulo de texto acompana a la temperatura.
export const rotuloLead: Record<NivelLead, string> = {
  activo: "activo",
  tibio: "tibio",
  frio: "frío",
}

// --- La seña: dias que le quedan a la reserva. Negativo = vencida. ---
export type NivelSena = "vigente" | "por-vencer" | "vencida"

export function nivelDeSena(diasRestantes: number): NivelSena {
  if (diasRestantes < 0) return "vencida"
  if (diasRestantes <= theme.sena.alerta) return "por-vencer"
  return "vigente"
}

// Solo la que vence pronto o ya vencio pide atencion: una seña vigente es un dato, no una alerta.
export const bordeSena: Record<NivelSena, string> = {
  vigente: "border-l-border",
  "por-vencer": "border-l-warning",
  vencida: "border-l-danger",
}
export const textoSena: Record<NivelSena, string> = {
  vigente: "text-muted",
  "por-vencer": "text-warning",
  vencida: "text-danger",
}
export const rotuloSena: Record<NivelSena, string> = {
  vigente: "Seña vigente",
  "por-vencer": "Seña por vencer",
  vencida: "Seña vencida",
}

// --- Estado de la unidad ---
export type EstadoUnidad = "disponible" | "reservada" | "seniada" | "en preparacion" | "vendida"

// Un color por significado: disponible = verde, reservada = ambar, señada = violeta (la misma
// que la etapa "Seña" del embudo), en preparacion = celeste. "vendida" es neutra por diseño
// (la unidad ya salio de la playa; excepcion documentada en DISENO.md): texto fg sobre fondo
// tenue, con rotulo. El magenta del acento y el rojo quedan fuera de los estados de unidad.
export const chipUnidad: Record<EstadoUnidad, string> = {
  disponible: "bg-success/15 text-success",
  reservada: "bg-warning/15 text-warning",
  seniada: "bg-primary/20 text-fg",
  "en preparacion": "bg-info/15 text-info",
  vendida: "bg-fg/10 text-fg",
}

// --- Rotulos de display (con tildes) para valores que el codigo compara sin tildes. ---
// Las claves son los valores del dato (los valida el CHECK de la base): NO se tocan.
// Lo que ve el usuario sale de estos mapas; si falta una clave, se muestra el valor crudo.
export const rotuloEstadoUnidad: Record<EstadoUnidad, string> = {
  disponible: "disponible",
  reservada: "reservada",
  seniada: "señada",
  "en preparacion": "en preparación",
  vendida: "vendida",
}
export const rotuloSegmento: Record<string, string> = {
  todos: "todos",
  hatch: "hatch",
  sedan: "sedán",
  suv: "suv",
  pickup: "pickup",
  utilitario: "utilitario",
  electrico: "eléctrico",
}
export const rotuloCaja: Record<string, string> = {
  manual: "manual",
  automatica: "automática",
  CVT: "CVT",
  directa: "directa",
}
export const rotuloCombustible: Record<string, string> = {
  nafta: "nafta",
  diesel: "diésel",
  hibrido: "híbrido",
  electrico: "eléctrico",
}
export const rotuloCanal: Record<string, string> = {
  showroom: "showroom",
  portal: "portal",
  web: "web",
  whatsapp: "whatsapp",
  referido: "referido",
  telefono: "teléfono",
}

// --- Etapas del embudo. El ancho del trapecio es el dato; el color es la etapa. ---
export type Etapa = "consulta" | "contactado" | "test drive" | "cotizacion" | "senia" | "entrega"

export const ETAPAS: Etapa[] = ["consulta", "contactado", "test drive", "cotizacion", "senia", "entrega"]

export const rotuloEtapa: Record<Etapa, string> = {
  consulta: "Consulta",
  contactado: "Contactado",
  "test drive": "Test drive",
  cotizacion: "Cotización",
  senia: "Seña",
  entrega: "Entrega",
}
export const rellenoEtapa: Record<Etapa, string> = {
  consulta: "bg-info",
  contactado: "bg-info",
  "test drive": "bg-primary",
  cotizacion: "bg-primary",
  senia: "bg-primary",
  entrega: "bg-success",
}
// El trapecio se tinta suave; el rotulo va encima en fg. Clases LITERALES: Tailwind
// no ve `bg-${x}` ni `${x}/20` armado por concatenacion.
export const rellenoEtapaSuave: Record<Etapa, string> = {
  consulta: "bg-info/20",
  contactado: "bg-info/30",
  "test drive": "bg-primary/25",
  cotizacion: "bg-primary/40",
  senia: "bg-primary/55",
  entrega: "bg-success/40",
}
export const chipEtapa: Record<Etapa, string> = {
  consulta: "bg-info/15 text-info",
  contactado: "bg-info/15 text-info",
  "test drive": "bg-primary/20 text-fg",
  cotizacion: "bg-primary/20 text-fg",
  senia: "bg-primary/20 text-fg",
  entrega: "bg-success/15 text-success",
}

// --- Desvio contra el precio de referencia del corredor precio x km ---
export type NivelBanda = "oportunidad" | "justo" | "sobre"

export function nivelDeBanda(desvioPct: number): NivelBanda {
  if (desvioPct <= theme.banda.oportunidad) return "oportunidad"
  if (desvioPct >= theme.banda.sobre) return "sobre"
  return "justo"
}

export const chipBanda: Record<NivelBanda, string> = {
  oportunidad: "bg-success/15 text-success",
  justo: "bg-primary/20 text-fg", // dentro de la referencia: primary, igual que la leyenda del tablero. Gris = estado mal.
  sobre: "bg-danger/10 text-danger",
}
export const puntoBanda: Record<NivelBanda, string> = {
  oportunidad: "fill-success",
  justo: "fill-primary",
  sobre: "fill-danger",
}

// --- Precio de referencia del corredor precio x km (una sola fuente: scatter y catalogo la usan) ---
export function precioReferencia(km: number) {
  return Math.max(theme.banda.base - theme.banda.caida * km, theme.banda.piso)
}

// --- Formatos. Los autos se venden en USD y eso es la firma del rubro. ---
export function usd(n: number) {
  return "US$ " + n.toLocaleString("es-AR")
}
export function km(n: number) {
  return n === 0 ? "0 km" : n.toLocaleString("es-AR") + " km"
}
// Las cuotas se hablan en pesos.
export function ars(n: number) {
  return "$ " + n.toLocaleString("es-AR")
}
