"use client"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { nav } from "./nav-config"
import { theme } from "./theme"

// Tres chasis sobre el mismo nav-config. La palanca `theme.nav` decide.
// VERTICE corre en `topbar`: sin sidebar el lienzo queda entero para el embudo horizontal.
// Tratamiento de iconos: icon-chip (cuadrado tintado). En dark + flat el trazo fino desaparece.

function Marca({ compact = false }: { compact?: boolean }) {
  const iniciales = theme.brand.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
  if (compact) {
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded bg-primary font-heading text-sm font-bold text-bg">
        {iniciales}
      </span>
    )
  }
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded bg-primary font-heading text-xs font-bold text-bg">
        {iniciales}
      </span>
      <span className="font-heading text-lg font-semibold tracking-wide">{theme.brand.name}</span>
    </span>
  )
}

// Usuario demo: iniciales + "Cuenta demo" + la marca ficticia. Que se sienta producto.
function CuentaDemo({ compacto = false }: { compacto?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-subtle font-heading text-xs font-bold text-fg"
      >
        CD
      </span>
      {!compacto && (
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-xs font-medium text-fg">Cuenta demo</span>
          <span className="block truncate text-xs text-muted">{theme.brand.name} Automotores</span>
        </span>
      )}
      {compacto && <span className="sr-only">Cuenta demo</span>}
    </div>
  )
}

// icon-chip: el icono siempre vive dentro de un cuadrado tintado.
function IconChip({
  Icon,
  active,
  size = 15,
}: {
  Icon: LucideIcon
  active: boolean
  size?: number
}) {
  return (
    <span
      className={
        "flex h-7 w-7 shrink-0 items-center justify-center rounded transition-colors " +
        (active ? "bg-primary text-bg" : "bg-subtle text-muted group-hover:text-fg")
      }
    >
      <Icon size={size} strokeWidth={2} />
    </span>
  )
}

// --- topbar: app de consulta rapida. Pestañas arriba, lienzo ancho. ---
// En celular la tira de pestañas es mas ancha que la pantalla: un degrade en el borde con mas
// contenido avisa que se puede deslizar, y la pestaña activa se centra a la vista al cargar.
function Topbar({ path }: { path: string }) {
  const tira = useRef<HTMLElement>(null)
  const [bordes, setBordes] = useState({ izq: false, der: false })

  useEffect(() => {
    const el = tira.current
    if (!el) return
    const medir = () =>
      setBordes({
        izq: el.scrollLeft > 2,
        der: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
      })
    el.querySelector('[aria-current="page"]')?.scrollIntoView({ inline: "center", block: "nearest" })
    medir()
    el.addEventListener("scroll", medir, { passive: true })
    window.addEventListener("resize", medir)
    return () => {
      el.removeEventListener("scroll", medir)
      window.removeEventListener("resize", medir)
    }
  }, [path])

  const izq = bordes.izq ? "transparent, #000 2rem" : "#000, #000"
  const der = bordes.der ? "#000 calc(100% - 2.5rem), transparent" : "#000, #000"
  const mascara = bordes.izq || bordes.der ? `linear-gradient(to right, ${izq}, ${der})` : undefined

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface">
      <div className="flex items-center gap-3 px-[var(--pad)] py-2.5 md:gap-6">
        <Marca />
        <nav
          ref={tira}
          aria-label="Principal"
          className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
          style={{ maskImage: mascara, WebkitMaskImage: mascara }}
        >
          {nav.map(({ label, href, icon: Icon }) => {
            const active = path === href
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={
                  "tap-44 group flex shrink-0 items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors " +
                  (active ? "bg-subtle font-semibold text-fg" : "text-muted hover:bg-subtle hover:text-fg")
                }
              >
                <IconChip Icon={Icon} active={active} />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="hidden shrink-0 md:block">
          <CuentaDemo />
        </div>
      </div>
    </header>
  )
}

// --- sidebar: herramienta de escritorio. Fija a la altura de la pantalla. ---
function Sidebar({ path }: { path: string }) {
  return (
    <aside className="sticky top-0 flex h-dvh w-56 shrink-0 flex-col border-r border-border bg-surface p-[var(--pad)]">
      <div className="mb-8 px-1 pt-2">
        <Marca />
      </div>
      <nav aria-label="Principal" className="flex-1 space-y-1 overflow-y-auto">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = path === href
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={
                "tap-44 group flex items-center gap-3 rounded px-2 py-1.5 text-sm transition-colors " +
                (active ? "bg-subtle font-medium text-fg" : "text-muted hover:bg-subtle hover:text-fg")
              }
            >
              <IconChip Icon={Icon} active={active} />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-border pt-3">
        <CuentaDemo />
      </div>
    </aside>
  )
}

// --- rail: solo iconos. Fijo a la altura de la pantalla. ---
function Rail({ path }: { path: string }) {
  return (
    <div className="sticky top-0 flex h-dvh w-16 shrink-0 flex-col items-center border-r border-border bg-surface py-4">
      <div className="mb-6">
        <Marca compact />
      </div>
      <nav aria-label="Principal" className="flex flex-1 flex-col items-center gap-2 overflow-y-auto">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = path === href
          return (
            <Link key={href} href={href} title={label} aria-label={label} aria-current={active ? "page" : undefined} className="tap-44 group flex items-center justify-center">
              <IconChip Icon={Icon} active={active} size={18} />
            </Link>
          )
        })}
      </nav>
      <CuentaDemo compacto />
    </div>
  )
}

export function Nav() {
  const path = usePathname()
  if (theme.nav === "rail") return <Rail path={path} />
  if (theme.nav === "sidebar") return <Sidebar path={path} />
  return <Topbar path={path} />
}
