// theme.ts · VERTICE Automotores (sistema automotora)
// LA PALANCA DE DISEÑO. Nada se hardcodea: todo lee de aca.
// Ficha de Diseño: ver DISENO.md.
//
// Cliche rechazado: el showroom premium negro-plata-cromo con reflejo de piso pulido.
// Es lo que hace toda concesionaria y en video se ve muerto: un lienzo gris sin
// color con significado. Tambien fuera el rojo Ferrari (choca con el oxblood de
// barberia) y el degrade azul metalizado (choca con el cobalto del gimnasio).
// La referencia que gana: la PLAYA DE VENTA DE NOCHE. Asfalto humedo, carteleria
// LED, luces de freno. Night-lot neon, no showroom marmol.

export type Theme = {
  brand: { name: string; logo?: string }
  mode: "light" | "dark"
  nav: "sidebar" | "topbar" | "rail"
  elevation: "raised" | "outlined" | "flat"
  badge: "pill" | "square"
  radius: "sharp" | "soft" | "round"
  density: "compact" | "comfortable"
  font: { heading: string; body: string }
  colors: {
    primary: string
    accent: string
    bg: string
    surface: string
    fg: string
    muted: string
    border: string
    subtle: string
    success: string
    warning: string
    danger: string
    info: string
  }
  // Constantes de dominio de la automotora. Ningun componente inventa un numero magico.
  aging: { fresco: number; tibio: number } // dias de la unidad en la playa
  lead: { tibio: number; frio: number } // dias sin contacto con el lead
  sena: { alerta: number } // dias que le quedan a la reserva antes de vencer
  // El corredor de precio de la playa: ref(km) = base - caida * km, en USD.
  // Fuera de +-`sobre`/`oportunidad` % la unidad esta mal precificada.
  // `piso` es el precio minimo de referencia: la banda nunca baja de ahi.
  banda: { base: number; caida: number; piso: number; oportunidad: number; sobre: number }
}

export const vertice: Theme = {
  brand: { name: "VÉRTICE" },
  mode: "dark",
  nav: "topbar",
  elevation: "flat",
  badge: "pill",
  radius: "soft",
  density: "compact",
  font: { heading: "Chakra Petch", body: "Figtree" },
  colors: {
    primary: "#7e64ff", // violeta electrico: tecnologia, EV, financiacion. SOLO como fill. Auditoria: #7b61ff -> #7e64ff (mismo matiz) para que text-bg encima llegue a 4.5:1 (4.41 -> 4.55).
    accent: "#ff4d9d", // magenta neon: la luz de freno bajo la marquesina
    bg: "#14121c", // asfalto humedo de noche
    surface: "#1e1b29", // en dark la tarjeta va MAS CLARA que el fondo: flota
    fg: "#edebf5",
    muted: "#9b96ad",
    border: "#302c40",
    subtle: "#252130",
    success: "#34d399", // entregada, seña vigente
    warning: "#fbbf24", // lead tibio, stock añejo
    danger: "#fb5c4c", // escarlata. El salmon #f87171 se confundia con el accent magenta a 2x.
    info: "#38bdf8", // 0km, en preparacion
  },
  aging: { fresco: 30, tibio: 60 },
  lead: { tibio: 3, frio: 7 },
  sena: { alerta: 3 },
  banda: { base: 38000, caida: 0.135, piso: 8000, oportunidad: -5, sobre: 5 },
}

export const theme: Theme = vertice
