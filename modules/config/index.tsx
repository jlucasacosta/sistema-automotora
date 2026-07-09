"use client"
import { theme } from "@/shell/theme"

// form-secciones: paneles de seccion planos, uno debajo del otro. Dentro del mismo
// sistema no se repite arquetipo: el acordeon ya lo usa otro sistema, y aca no hace
// falta esconder nada. Plomeria a la vista.

function Fila({ label, value, swatch }: { label: string; value: string; swatch?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-1.5 last:border-0">
      <span className="text-[11px] text-muted">{label}</span>
      <span className="dato flex items-center gap-2 text-[11px] font-medium">
        {swatch && <span className="h-4 w-4 rounded border border-border" style={{ background: value }} />}
        {value}
      </span>
    </div>
  )
}

function Seccion({ titulo, children, nota }: { titulo: string; children: React.ReactNode; nota?: string }) {
  return (
    <section className="surface-card p-4">
      <h2 className="font-heading text-xs font-bold uppercase tracking-widest">{titulo}</h2>
      {nota && <p className="mb-2 mt-1 text-[10px] leading-snug text-muted">{nota}</p>}
      <div className="mt-2">{children}</div>
    </section>
  )
}

export function ConfigPage() {
  const c = theme.colors
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">Configuracion</h1>

      <div className="grid gap-3 lg:grid-cols-2">
        <Seccion titulo="Concesionaria">
          <Fila label="Marca" value={theme.brand.name} />
          <Fila label="Vendedores activos" value="4" />
          <Fila label="Moneda de lista" value="USD" />
          <Fila label="Horario de salon" value="09:00 a 19:00" />
        </Seccion>

        <Seccion
          titulo="Dominio: stock y pipeline"
          nota="Estos numeros viven en shell/theme.ts. Cambialos y muta todo el sistema: ningun componente tiene un umbral escrito a mano."
        >
          <Fila label="Unidad fresca hasta" value={`${theme.aging.fresco} dias`} />
          <Fila label="Unidad tibia hasta" value={`${theme.aging.tibio} dias`} />
          <Fila label="Lead tibio desde" value={`${theme.lead.tibio} dias sin contacto`} />
          <Fila label="Lead frio desde" value={`${theme.lead.frio} dias sin contacto`} />
          <Fila label="Alerta de seña" value={`${theme.sena.alerta} dias antes de vencer`} />
        </Seccion>

        <Seccion
          titulo="Corredor de precio"
          nota="El scatter precio x km dibuja la banda con estos cuatro numeros: ref(km) = base - caida x km."
        >
          <Fila label="Precio base (0 km)" value={`US$ ${theme.banda.base.toLocaleString("es-AR")}`} />
          <Fila label="Caida por km" value={`US$ ${theme.banda.caida} / km`} />
          <Fila label="Oportunidad por debajo de" value={`${theme.banda.oportunidad}%`} />
          <Fila label="Sobrevaluada por encima de" value={`+${theme.banda.sobre}%`} />
        </Seccion>

        <Seccion titulo="Forma">
          <Fila label="Modo" value={theme.mode} />
          <Fila label="Navegacion" value={theme.nav} />
          <Fila label="Elevacion" value={theme.elevation} />
          <Fila label="Bordes" value={theme.radius} />
          <Fila label="Densidad" value={theme.density} />
          <Fila label="Chips" value={theme.badge} />
          <Fila label="Titulos" value={theme.font.heading} />
          <Fila label="Cuerpo" value={theme.font.body} />
        </Seccion>

        <Seccion titulo="Paleta" nota="El violeta no se usa como texto: no llega a 4.5:1 sobre el fondo. Va solo como relleno.">
          <Fila label="Violeta electrico (primario, fill)" value={c.primary} swatch />
          <Fila label="Magenta neon (acento)" value={c.accent} swatch />
          <Fila label="Entregada / seña vigente" value={c.success} swatch />
          <Fila label="Lead tibio / stock añejo" value={c.warning} swatch />
          <Fila label="Seña vencida / sobrevaluada" value={c.danger} swatch />
          <Fila label="0km / en preparacion" value={c.info} swatch />
        </Seccion>

        <Seccion titulo="Estados">
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="chip bg-primary/20 text-fg">disponible</span>
            <span className="chip bg-warning/15 text-warning">reservada</span>
            <span className="chip bg-accent/20 text-accent">seniada</span>
            <span className="chip bg-info/15 text-info">en preparacion</span>
            <span className="chip bg-success/15 text-success">vendida</span>
            <span className="chip bg-danger/15 text-danger">seña vencida</span>
          </div>
          <p className="pt-3 text-[10px] text-muted">
            Demo frontend con datos de ejemplo. Sin backend conectado. Todo el diseño sale de shell/theme.ts.
          </p>
        </Seccion>
      </div>
    </div>
  )
}
