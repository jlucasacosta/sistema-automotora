import "./globals.css"
import type { ReactNode, CSSProperties } from "react"
import { theme } from "@/shell/theme"
import { fontClass } from "@/shell/fonts"
import { Nav } from "@/shell/nav"

// Traduce el theme (declarativo) a variables CSS que Tailwind y globals.css consumen.
// Los colores viajan como triplete "R G B" para que Tailwind pueda aplicarles
// opacidad (bg-success/15) sin que ningun componente escriba un color a mano.
const radiusMap = { sharp: "4px", soft: "10px", round: "16px" }
const densityMap = { compact: "12px", comfortable: "20px" }
const badgeMap = { pill: "9999px", square: "4px" }

// En claro la sombra levanta (tinte slate). En oscuro hunde (negro puro).
const shadow = {
  light: {
    sm: "0 1px 2px rgb(15 23 42 / 0.04), 0 1px 3px rgb(15 23 42 / 0.06)",
    card: "0 1px 3px rgb(15 23 42 / 0.06), 0 6px 16px rgb(15 23 42 / 0.05)",
    pop: "0 6px 16px rgb(15 23 42 / 0.08), 0 16px 32px rgb(15 23 42 / 0.10)",
  },
  dark: {
    sm: "0 1px 2px rgb(0 0 0 / 0.4)",
    card: "0 1px 3px rgb(0 0 0 / 0.45), 0 8px 24px rgb(0 0 0 / 0.35)",
    pop: "0 2px 6px rgb(0 0 0 / 0.5), 0 18px 40px rgb(0 0 0 / 0.45)",
  },
}

// `elevation` decide como se separa una tarjeta del fondo: sombra, borde, o nada.
function elevationVars(): Record<string, string> {
  const s = shadow[theme.mode]
  if (theme.elevation === "raised") {
    return { "--shadow-sm": s.sm, "--shadow-card": s.card, "--shadow-pop": s.pop, "--card-border": "0 solid transparent" }
  }
  if (theme.elevation === "outlined") {
    return {
      "--shadow-sm": "none",
      "--shadow-card": "none",
      "--shadow-pop": s.sm,
      "--card-border": "1px solid rgb(var(--border))",
    }
  }
  return { "--shadow-sm": "none", "--shadow-card": "none", "--shadow-pop": "none", "--card-border": "0 solid transparent" }
}

function rgb(hex: string) {
  const h = hex.replace("#", "")
  const full = h.length === 3 ? h.split("").map((ch) => ch + ch).join("") : h
  const n = parseInt(full, 16)
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`
}

// Cada ruta aporta su titulo (export const metadata en app/<ruta>/page.tsx): "Pipeline · VERTICE".
export const metadata = {
  title: { default: `${theme.brand.name} · Sistema para automotoras`, template: `%s · ${theme.brand.name}` },
  description: "Demo frontend de un sistema de gestion para concesionarias. Datos de ejemplo, sin backend conectado.",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const c = theme.colors
  const vars = {
    "--primary": rgb(c.primary),
    "--accent": rgb(c.accent),
    "--bg": rgb(c.bg),
    "--surface": rgb(c.surface),
    "--fg": rgb(c.fg),
    "--muted": rgb(c.muted),
    "--border": rgb(c.border),
    "--subtle": rgb(c.subtle),
    "--success": rgb(c.success),
    "--warning": rgb(c.warning),
    "--danger": rgb(c.danger),
    "--info": rgb(c.info),
    "--radius": radiusMap[theme.radius],
    "--pad": densityMap[theme.density],
    "--badge-radius": badgeMap[theme.badge],
    "--font-heading": "var(--font-heading-src), system-ui, sans-serif",
    "--font-body": "var(--font-body-src), system-ui, sans-serif",
    ...elevationVars(),
  } as CSSProperties

  // topbar apila en columna; sidebar y rail van al costado.
  const stacked = theme.nav === "topbar"

  return (
    <html lang="es" style={{ colorScheme: theme.mode }}>
      <body className={fontClass} style={vars}>
        <a href="#contenido" className="skip-link">
          Saltar al contenido
        </a>
        <div className={"min-h-screen bg-bg text-fg " + (stacked ? "flex flex-col" : "flex")}>
          <Nav />
          <main id="contenido" tabIndex={-1} className="flex-1 overflow-x-hidden p-[var(--pad)] focus:outline-none">{children}</main>
        </div>
      </body>
    </html>
  )
}
