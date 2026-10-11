"use client"
import { useEffect, useId, useRef, type ReactNode } from "react"
import { X } from "lucide-react"

// ficha-lateral.tsx · La ficha que se abre al hacer clic en una fila o tarjeta.
// En escritorio es un panel a la derecha; en celular, una hoja desde abajo.
// Accesible: role="dialog", foco adentro al abrir y de vuelta al disparador al cerrar,
// Tab atrapado, Esc y clic afuera cierran. Sin animaciones ni transiciones.
//
// Uso:
//   const [sel, setSel] = useState<Propiedad | null>(null)
//   <tr onClick={() => setSel(p)}> ... <button onClick={() => setSel(p)}>{p.titulo}</button> ...
//   <FichaLateral abierta={!!sel} titulo={sel?.titulo ?? ""} onCerrar={() => setSel(null)} acciones={...}>
//     ...datos de la fila...
//   </FichaLateral>
// Dentro de la fila, el elemento que abre la ficha tiene que ser un <button> (o un enlace):
// asi se llega con teclado. El clic en la fila entera es un extra para el mouse.
// Las acciones de la demo no guardan nada: usan <AvisoDemo> para decirlo.

type Props = {
  abierta: boolean
  titulo: string
  subtitulo?: string
  onCerrar: () => void
  children: ReactNode
  acciones?: ReactNode
}

export const botonPrimario =
  "tap relative inline-flex min-h-9 items-center rounded-[var(--radius)] bg-primary px-3 text-sm font-medium text-bg"
export const botonSecundario =
  "tap relative inline-flex min-h-9 items-center rounded-[var(--radius)] border border-border bg-surface px-3 text-sm font-medium text-fg hover:bg-subtle"

export function FichaLateral({ abierta, titulo, subtitulo, onCerrar, children, acciones }: Props) {
  const idTitulo = useId()
  const panel = useRef<HTMLDivElement>(null)
  const cerrar = useRef(onCerrar)
  cerrar.current = onCerrar

  useEffect(() => {
    if (!abierta) return
    const disparador = document.activeElement as HTMLElement | null
    panel.current?.focus()
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation()
        cerrar.current()
        return
      }
      if (e.key !== "Tab" || !panel.current) return
      const foco = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!foco.length) {
        e.preventDefault()
        return
      }
      const primero = foco[0]
      const ultimo = foco[foco.length - 1]
      if (e.shiftKey && (document.activeElement === primero || document.activeElement === panel.current)) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primero.focus()
      }
    }
    document.addEventListener("keydown", alTeclear)
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", alTeclear)
      document.body.style.overflow = overflow
      if (disparador && document.body.contains(disparador)) disparador.focus()
    }
  }, [abierta])

  if (!abierta) return null

  return (
    // `!m-0`: si la ficha es hermana de un bloque dentro de un `space-y-*`, ese margen superior corrió el panel
    // fijo 2rem hacia abajo y dejó una franja sin cubrir arriba.
    <div className="fixed inset-0 z-50 !m-0 flex items-end justify-end lg:items-stretch">
      <div className="absolute inset-0 bg-fg/40" aria-hidden="true" onClick={onCerrar} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
        className="surface-card relative flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-b-none outline-none lg:max-h-none lg:w-[26rem] lg:rounded-none"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="min-w-0">
            <h2 id={idTitulo} className="font-heading text-lg font-semibold leading-tight">
              {titulo}
            </h2>
            {subtitulo && <p className="mt-1 text-xs text-muted">{subtitulo}</p>}
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar ficha"
            className="tap relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius)] text-muted hover:text-fg"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
        {acciones && <footer className="flex flex-wrap gap-2 border-t border-border p-4">{acciones}</footer>}
      </div>
    </div>
  )
}

// Dato de la ficha: etiqueta chica arriba, valor abajo. Para armar la grilla de la ficha.
export function DatoFicha({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted">{etiqueta}</dt>
      <dd className="mt-0.5 text-sm text-fg">{children}</dd>
    </div>
  )
}

// Dice que la accion es de demostracion: nada se guarda ni se envia. role="status".
export function AvisoDemo({ texto }: { texto: string | null }) {
  return (
    <p role="status" aria-live="polite" className={texto ? "mt-4 rounded-[var(--radius)] bg-subtle p-3 text-xs text-fg" : "sr-only"}>
      {texto ?? ""}
    </p>
  )
}
