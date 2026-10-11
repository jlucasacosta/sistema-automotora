import { theme } from "@/shell/theme"

// form-secciones: paneles de seccion planos, uno debajo del otro. Dentro del mismo
// sistema no se repite arquetipo: el acordeon ya lo usa otro sistema, y aca no hace
// falta esconder nada. Plomeria a la vista.

function Fila({ label, value, swatch }: { label: string; value: string; swatch?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-1.5 last:border-0">
      <span className="text-[0.6875rem] text-muted">{label}</span>
      <span className="dato flex items-center gap-2 text-[0.6875rem] font-medium">
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
      {nota && <p className="mb-2 mt-1 text-[0.625rem] leading-snug text-muted">{nota}</p>}
      <div className="mt-2">{children}</div>
    </section>
  )
}

export function ConfigPage() {
  const c = theme.colors
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">Configuración</h1>

      <div className="grid gap-3 lg:grid-cols-2">
        <Seccion titulo="Concesionaria">
          <Fila label="Marca" value={theme.brand.name} />
          <Fila label="Vendedores activos" value="4" />
          <Fila label="Moneda de lista" value="USD" />
          <Fila label="Horario de salón" value="09:00 a 19:00" />
        </Seccion>

        <Seccion
          titulo="Dominio: stock y pipeline"
          nota="Estos números viven en shell/theme.ts. Cambialos y muta todo el sistema: ningún componente tiene un umbral escrito a mano."
        >
          <Fila label="Unidad fresca hasta" value={`${theme.aging.fresco} días`} />
          <Fila label="Unidad tibia hasta" value={`${theme.aging.tibio} días`} />
          <Fila label="Lead tibio desde" value={`${theme.lead.tibio} días sin contacto`} />
          <Fila label="Lead frío desde" value={`${theme.lead.frio} días sin contacto`} />
          <Fila label="Alerta de seña" value={`${theme.sena.alerta} días antes de vencer`} />
        </Seccion>

        <Seccion
          titulo="Corredor de precio"
          nota="El scatter precio x km dibuja la banda con estos números: ref(km) = max(base - caida x km, piso)."
        >
          <Fila label="Precio base (0 km)" value={`US$ ${theme.banda.base.toLocaleString("es-AR")}`} />
          <Fila label="Caída por km" value={`US$ ${theme.banda.caida} / km`} />
          <Fila label="Piso de referencia" value={`US$ ${theme.banda.piso.toLocaleString("es-AR")}`} />
          <Fila label="Oportunidad por debajo de" value={`${theme.banda.oportunidad}%`} />
          <Fila label="Sobrevaluada por encima de" value={`+${theme.banda.sobre}%`} />
        </Seccion>

        <Seccion titulo="Forma">
          <Fila label="Modo" value={theme.mode} />
          <Fila label="Navegación" value={theme.nav} />
          <Fila label="Elevación" value={theme.elevation} />
          <Fila label="Bordes" value={theme.radius} />
          <Fila label="Densidad" value={theme.density} />
          <Fila label="Chips" value={theme.badge} />
          <Fila label="Títulos" value={theme.font.heading} />
          <Fila label="Cuerpo" value={theme.font.body} />
        </Seccion>

        <Seccion titulo="Paleta" nota="El violeta no se usa como texto: sobre las tarjetas no llega a 4.5:1. Va solo como relleno.">
          <Fila label="Violeta eléctrico (primario, fill)" value={c.primary} swatch />
          <Fila label="Magenta neón (acento)" value={c.accent} swatch />
          <Fila label="Entregada / seña vigente" value={c.success} swatch />
          <Fila label="Lead tibio / stock añejo" value={c.warning} swatch />
          <Fila label="Seña vencida / sobrevaluada" value={c.danger} swatch />
          <Fila label="0km / en preparación" value={c.info} swatch />
        </Seccion>

        <Seccion titulo="Estados">
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="chip bg-primary/20 text-fg">disponible</span>
            <span className="chip bg-warning/15 text-warning">reservada</span>
            <span className="chip bg-accent/10 text-accent">señada</span>
            <span className="chip bg-info/15 text-info">en preparación</span>
            <span className="chip bg-success/15 text-success">vendida</span>
            <span className="chip bg-danger/10 text-danger">seña vencida</span>
          </div>
          <p className="pt-3 text-[0.625rem] text-muted">
            Demo frontend con datos de ejemplo. Sin backend conectado. Todo el diseño sale de shell/theme.ts.
          </p>
        </Seccion>
      </div>
    </div>
  )
}
