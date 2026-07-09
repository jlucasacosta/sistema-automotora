"use client"
import { useEffect, useState } from "react"
import { getHilos, type Hilo } from "./api"

// master-detail: lista de hilos + panel de la conversacion. Arquetipo de soporte.
// Cada hilo esta atado a una unidad, que es de lo unico que se habla en el rubro.

export function ConversacionesPage() {
  const [hilos, setHilos] = useState<Hilo[]>([])
  const [sel, setSel] = useState<string | null>(null)

  useEffect(() => {
    getHilos().then((hs) => {
      setHilos(hs)
      setSel(hs[0]?.id ?? null)
    })
  }, [])

  const hilo = hilos.find((h) => h.id === sel)
  const sinLeer = hilos.reduce((s, h) => s + h.sinLeer, 0)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">Mensajes</h1>
        <p className="text-[11px] text-muted">
          {hilos.length} hilos · <span className="text-accent">{sinLeer} sin leer</span>
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[20rem_1fr]">
        <ul className="surface-card max-h-[32rem] overflow-y-auto">
          {hilos.map((h) => {
            const activo = h.id === sel
            return (
              <li key={h.id}>
                <button
                  onClick={() => setSel(h.id)}
                  className={
                    "w-full border-b border-border px-3 py-2 text-left transition-colors last:border-0 " +
                    (activo ? "bg-primary/10" : "hover:bg-subtle")
                  }
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate font-heading text-xs font-semibold">{h.cliente}</p>
                    <span className="dato shrink-0 text-[10px] text-muted">{h.hora}</span>
                  </div>
                  <p className="truncate text-[10px] text-primary">{h.unidad}</p>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p className="truncate text-[11px] text-muted">{h.ultimo}</p>
                    {h.sinLeer > 0 && (
                      <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-bg">
                        {h.sinLeer}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>

        <div className="surface-card flex max-h-[32rem] flex-col">
          {hilo ? (
            <>
              <div className="border-b border-border px-4 py-3">
                <p className="font-heading text-sm font-bold">{hilo.cliente}</p>
                <p className="text-[11px] text-muted">
                  {hilo.unidad} · <span className="chip bg-subtle text-muted">{hilo.canal}</span>
                </p>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {hilo.mensajes.map((m) => (
                  <div key={m.id} className={"flex " + (m.de === "vendedor" ? "justify-end" : "justify-start")}>
                    <div
                      className={
                        "max-w-[80%] rounded px-3 py-1.5 " +
                        (m.de === "vendedor" ? "bg-primary/25 text-fg" : "bg-subtle text-fg")
                      }
                    >
                      <p className="text-[11px] leading-snug">{m.texto}</p>
                      <p className="dato mt-0.5 text-right text-[9px] text-muted">{m.hora}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border p-3">
                <input
                  disabled
                  placeholder="Demo frontend: el envio no esta conectado"
                  className="w-full rounded border border-border bg-subtle px-3 py-1.5 text-xs text-muted outline-none"
                />
              </div>
            </>
          ) : (
            <p className="py-20 text-center text-xs text-muted">Elegi un hilo.</p>
          )}
        </div>
      </div>
    </div>
  )
}
