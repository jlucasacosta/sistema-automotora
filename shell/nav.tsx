"use client"
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
function Topbar({ path }: { path: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface">
      <div className="flex items-center gap-6 px-[var(--pad)] py-2.5">
        <Marca />
        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {nav.map(({ label, href, icon: Icon }) => {
            const active = path === href
            return (
              <Link
                key={href}
                href={href}
                className={
                  "group flex shrink-0 items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors " +
                  (active ? "bg-subtle font-semibold text-fg" : "text-muted hover:bg-subtle hover:text-fg")
                }
              >
                <IconChip Icon={Icon} active={active} />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

// --- sidebar: herramienta de escritorio. ---
function Sidebar({ path }: { path: string }) {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface p-[var(--pad)]">
      <div className="mb-8 px-1 pt-2">
        <Marca />
      </div>
      <nav className="space-y-1">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = path === href
          return (
            <Link
              key={href}
              href={href}
              className={
                "group flex items-center gap-3 rounded px-2 py-1.5 text-sm transition-colors " +
                (active ? "bg-subtle font-medium text-fg" : "text-muted hover:bg-subtle hover:text-fg")
              }
            >
              <IconChip Icon={Icon} active={active} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

// --- rail: solo iconos. ---
function Rail({ path }: { path: string }) {
  return (
    <aside className="flex w-16 shrink-0 flex-col items-center gap-2 border-r border-border bg-surface py-4">
      <div className="mb-6">
        <Marca compact />
      </div>
      {nav.map(({ label, href, icon: Icon }) => {
        const active = path === href
        return (
          <Link key={href} href={href} title={label} aria-label={label} className="group">
            <IconChip Icon={Icon} active={active} size={18} />
          </Link>
        )
      })}
    </aside>
  )
}

export function Nav() {
  const path = usePathname()
  if (theme.nav === "rail") return <Rail path={path} />
  if (theme.nav === "sidebar") return <Sidebar path={path} />
  return <Topbar path={path} />
}
