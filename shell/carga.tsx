"use client"
import { useCallback, useEffect, useState } from "react"

// carga.tsx · Estados de carga y de error de los modulos, en un solo lugar.
// Resuelve dos defectos de la critica: (1) el 0 falso mientras llegan los datos y
// (2) no tener salida si la carga falla. Sin animaciones: el esqueleto es estatico.
//
// Uso en un modulo:
//   const { data, cargando, error, reintentar } = useCarga(getPropiedades)
//   if (error) return <ErrorCarga onReintentar={reintentar} />
//   <p>{cargando ? "—" : data.length}</p>            // guion largo, nunca 0
//   <section aria-busy={cargando}> ... <Esqueleto className="h-24" /> ... </section>
//
// Conectar un backend real no cambia nada de esto: useCarga recibe la misma funcion
// del api.ts (misma firma) y maneja el rechazo de la promesa.

export function useCarga<T>(cargar: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [cargando, setCargando] = useState(true)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let vivo = true
    setCargando(true)
    setError(null)
    cargar()
      .then((d) => {
        if (!vivo) return
        setData(d)
        setCargando(false)
      })
      .catch((e) => {
        if (!vivo) return
        setError(e instanceof Error ? e : new Error(String(e)))
        setCargando(false)
      })
    return () => {
      vivo = false
    }
    // `cargar` es una funcion estable del api.ts; el reintento se dispara con `intento`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intento])

  const reintentar = useCallback(() => setIntento((n) => n + 1), [])
  return { data, error, cargando, reintentar }
}

// Bloque gris del tamano del contenido real. Estatico: sin brillo ni pulso.
export function Esqueleto({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={"rounded-[var(--radius)] bg-subtle " + className} />
}

// Aviso de error con la salida a mano. role="alert": se anuncia al aparecer.
export function ErrorCarga({
  mensaje = "No pudimos cargar los datos.",
  onReintentar,
}: {
  mensaje?: string
  onReintentar: () => void
}) {
  return (
    <div role="alert" className="surface-card flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
      <p className="text-fg">{mensaje}</p>
      <button
        type="button"
        onClick={onReintentar}
        className="tap relative inline-flex min-h-9 items-center rounded-[var(--radius)] bg-primary px-3 text-sm font-medium text-bg"
      >
        Reintentar
      </button>
    </div>
  )
}
