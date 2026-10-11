# Llevá VÉRTICE a producción — guía para implementarlo de verdad

Esta guía te lleva del demo (datos de ejemplo, sin backend) a un sistema real para una automotora: base de datos, usuarios que inician sesión, tareas automáticas, deploy y una capa de IA. Está escrita para principiantes: todo comando va en un bloque que podés copiar.

> **Aclaración importante.** Este repositorio sigue siendo un **demo frontend con datos de ejemplo**. Nada de lo que está acá abajo viene instalado ni conectado: es la receta para que lo construyas **en tu copia**. El código de ejemplo de esta guía no forma parte del repo y no hay ninguna dependencia de Supabase ni de pg-boss en su `package.json`.

> **Qué verificamos y qué no.** El SQL de la sección 3 (tablas, vistas, RLS, trigger y el generador de datos) se probó contra un Postgres real con los datos de ejemplo de este repo: las vistas devuelven exactamente lo que esperan los tipos de cada `api.ts`. La sintaxis de `supabase-js`, `@supabase/ssr`, `pg-boss`, OpenAI, Gemini y la configuración de Railway se tomó de su documentación oficial vigente al escribir esto, pero **no la ejecutamos contra cuentas reales**. Si una versión nueva cambia algo, mandan sus docs.

---

## 0. Qué vas a lograr, en qué orden y cuánto lleva

Al terminar vas a tener:

- una base de datos en **Supabase** con las tablas del sistema y los datos de ejemplo cargados,
- inicio de sesión con **Supabase Auth** (nunca Clerk),
- el frontend leyendo y escribiendo de verdad (se cambia el **cuerpo** de cada función de `api.ts`, nunca su firma),
- tareas automáticas con **pg-boss** corriendo en **Railway** (avisos de leads fríos, señas por vencer),
- el sistema publicado en **Vercel**,
- una función de IA en el módulo de mensajes (sugerir respuestas).

| Etapa | Qué hacés | Tiempo estimado* |
|---|---|---|
| 1 | Clonar y correr local | 15 min |
| 2 | Leer el mapa del sistema | 10 min |
| 3 | Supabase: tablas, datos, Auth, conectar el frontend | 2 a 4 h |
| 4 | Railway + pg-boss (opcional, se puede dejar para después) | 1 a 2 h |
| 5 | Vercel: publicar | 20 a 30 min |
| 6 | IA | 1 a 2 h |
| 7 | Checklist de seguridad antes de publicar | 30 min |

\*Son estimaciones para alguien que lo hace por primera vez, no mediciones.

**Orden recomendado:** 1 → 2 → 3 → 5 → 7 y recién después 4 y 6. Con las etapas 3 y 5 ya tenés un sistema real publicado; el worker y la IA se suman sobre esa base.

---

## 1. Clonar y correr local

### 1.1 Lo que necesitás instalado

- **Node.js** (LTS): https://nodejs.org — Next.js 15 pide Node 18.18 o mayor.
- **Git**: https://git-scm.com

Verificá que estén:

```bash
node -v
git --version
```

Si cada comando te devuelve un número de versión, está todo bien.

### 1.2 Clonar, instalar y correr

```bash
git clone https://github.com/jlucasacosta/sistema-automotora.git
cd sistema-automotora
npm install
npm run dev
```

Abrí http://localhost:3000. Tiene que cargar el panel con los diales y el gráfico de precio contra kilometraje.

> Si querés tu propia copia para modificarla y publicarla, hacé un **fork** en GitHub (botón *Fork*) y cloná tu fork en vez de este repo.

### 1.3 Tres errores típicos

| Qué ves | Por qué pasa | Cómo se arregla |
|---|---|---|
| `'next' is not recognized as an internal or external command` o `Cannot find module` | No corriste `npm install`, o estás en otra carpeta | `cd sistema-automotora` y después `npm install` |
| `Port 3000 is in use` | Hay otro programa usando el puerto 3000 | `npm run dev -- -p 3001` y abrí http://localhost:3001 |
| `npm install` falla con errores de versión o `engine` | Tu Node es muy viejo | Instalá la versión LTS desde https://nodejs.org y reabrí la terminal |

---

## 2. Mapa de este sistema

Cada módulo tiene su `api.ts` (hoy devuelve datos de un JSON; mañana consulta la base) y su `data.json`. **Conectar el backend es cambiar el cuerpo de las funciones, nunca la firma**: los componentes no se tocan.

| Módulo | Funciones de `api.ts` | `data.json` (clave) | Tabla / vista en la base | Query que reemplaza al JSON |
|---|---|---|---|---|
| `catalogo` | `getUnidades()`, `getUnidad(id)`, `getUsados()` (`precioReferencia` y `desvioPct` son cálculo, no tocan la base) | `unidades` | tabla `unidades`, vista `v_unidades` | `from("v_unidades").select("*")` (`getUsados` suma `.gt("km", 0)`) |
| `contactos` | `getLeads()` | `leads` | tabla `leads`, vista `v_leads` | `from("v_leads").select("*")` |
| `pipeline` | `getDeals()`, `moverDeal(id, etapa)` | `deals` | tabla `deals`, vista `v_deals` | `from("v_deals").select("*")` y `from("deals").update({ etapa }).eq("id", id)` |
| `ventas` | `getBoletos()` | `boletos` | tabla `boletos`, vista `v_boletos` | `from("v_boletos").select("*").order("fecha_orden", { ascending: false })` |
| `conversaciones` | `getHilos()` | `hilos` (con `mensajes` adentro) | tablas `hilos` y `mensajes`, vista `v_hilos` | `from("v_hilos").select("*").order("ultimo_en", { ascending: false })` |
| `dashboard` | `getDiales()`, `getResumen()` | `diales`, `resumen` | tablas `diales_config` y `ajustes_dominio`, vistas `v_diales` y `v_resumen` | `from("v_diales").select("*").order("orden")` y `from("v_resumen").select("*").single()` |
| `config` | no tiene `api.ts`: lee `shell/theme.ts` | — | tabla `ajustes_dominio` (los umbrales de `aging`, `lead`, `sena` y `banda`) | cuando quieras que sean editables |

Tres cosas que conviene saber antes de empezar:

1. **Hay datos que se derivan, no se guardan.** `diasPlaya`, `diasSinContacto`, `senaDias` y `sinLeer` se calculan en la vista a partir de fechas. En el JSON estaban como números fijos; en la base el día de hoy los mueve solos.
2. **Los umbrales de color son diseño.** `theme.aging`, `theme.lead`, `theme.sena` y `theme.banda` siguen decidiendo los colores en el frontend. La tabla `ajustes_dominio` guarda los mismos números para que las vistas (por ejemplo "leads fríos") usen los mismos valores.
3. **Las vistas tienen los nombres exactos de los tipos** (`diasPlaya`, `unidadId`, `formaPago`…), así `select("*")` devuelve objetos que ya son del tipo `Unidad`, `Deal`, `Boleto`, etc.

---

## 3. Supabase: base de datos y Auth

### 3.1 Crear el proyecto

1. Entrá a https://supabase.com/dashboard y creá una cuenta o iniciá sesión.
2. **New project**: elegí un nombre (por ejemplo `vertice-automotora`), una **contraseña de la base de datos** (guardala en tu gestor de contraseñas; la vas a necesitar para el worker) y la región más cercana a tus usuarios.
3. Esperá a que el proyecto termine de crearse (un par de minutos).

### 3.2 Crear las tablas

Abrí **SQL Editor → New query**, pegá el bloque completo y apretá **Run**. Corrélos en este orden, uno por vez.

**Bloque 1 — Tablas.** Los nombres de columna salen de los tipos de cada `api.ts` y de las claves de cada `data.json`; los estados reales (`seniada`, `en preparacion`, `test drive`, `senia`…) son `check` constraints.

```sql
-- ============================================================
-- VERTICE Automotores · esquema de la base (Supabase / Postgres)
-- Pegalo entero en Supabase > SQL Editor > New query > Run.
-- Los nombres de columna salen de los tipos de cada modules/<modulo>/api.ts
-- y de las claves de cada modules/<modulo>/data.json.
-- ============================================================

-- Vendedores: el equipo de la concesionaria. user_id enlaza con el usuario de Supabase Auth.
create table public.vendedores (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete set null,
  nombre  text not null unique,
  activo  boolean not null default true
);

-- Unidades (modulo catalogo). Tipo Unidad de modules/catalogo/api.ts.
create sequence public.unidades_seq start 200;
create table public.unidades (
  id            text primary key default ('U-' || nextval('public.unidades_seq')),
  marca         text not null,
  modelo        text not null,
  version       text not null,
  anio          integer not null check (anio between 1980 and 2100),
  km            integer not null default 0 check (km >= 0),
  precio_usd    integer not null check (precio_usd > 0),          -- "precio" en el front (USD)
  cuota_ars     integer not null check (cuota_ars >= 0),          -- "cuota" en el front (ARS, 48 meses)
  patente       text unique,                                      -- NULL = 0km todavia sin patentar
  estado        text not null check (estado in ('disponible', 'reservada', 'seniada', 'en preparacion', 'vendida')),
  ingresada_el  date not null default current_date,               -- diasPlaya se DERIVA de esta fecha
  segmento      text not null check (segmento in ('hatch', 'sedan', 'suv', 'pickup', 'utilitario', 'electrico')),
  motor         text not null,
  caja          text not null check (caja in ('manual', 'automatica', 'CVT', 'directa')),
  combustible   text not null check (combustible in ('nafta', 'diesel', 'hibrido', 'electrico')),
  color         text not null
);
create index unidades_estado_idx   on public.unidades (estado);
create index unidades_segmento_idx on public.unidades (segmento);
create index unidades_km_idx       on public.unidades (km);

-- Contactos / leads (modulo contactos). Tipo Lead de modules/contactos/api.ts.
create sequence public.leads_seq start 100;
create table public.leads (
  id              text primary key default ('L-' || nextval('public.leads_seq')),
  nombre          text not null,
  email           text,
  telefono        text,
  canal           text not null check (canal in ('showroom', 'portal', 'web', 'whatsapp', 'referido', 'telefono')),
  interes         text not null default '',
  presupuesto_usd integer not null default 0 check (presupuesto_usd >= 0),  -- "presupuesto" en el front
  ultimo_contacto date not null default current_date,                       -- diasSinContacto se DERIVA
  vendedor_id     uuid references public.vendedores (id) on delete set null
);
create index leads_ultimo_contacto_idx on public.leads (ultimo_contacto);
create index leads_vendedor_idx        on public.leads (vendedor_id);

-- Oportunidades del embudo (modulo pipeline). Tipo Deal de modules/pipeline/api.ts.
create sequence public.deals_seq start 4000;
create table public.deals (
  id              text primary key default ('D-' || nextval('public.deals_seq')),
  lead_id         text not null references public.leads (id) on delete restrict,   -- cliente, telefono y canal salen del lead
  unidad_id       text not null references public.unidades (id) on delete restrict,
  etapa           text not null check (etapa in ('consulta', 'contactado', 'test drive', 'cotizacion', 'senia', 'entrega')),
  monto_usd       integer not null check (monto_usd > 0),                           -- "monto" en el front
  permuta         jsonb check (permuta is null or (permuta ? 'modelo' and permuta ? 'anio' and permuta ? 'toma')),
  ultimo_contacto date not null default current_date,                               -- diasSinContacto se DERIVA
  proximo_paso    text not null default '',
  vendedor_id     uuid references public.vendedores (id) on delete set null,
  sena_vence_el   date,                                                             -- senaDias se DERIVA (negativo = vencida)
  entregado_el    date                                                              -- alimenta "Entregas hoy"
);
create index deals_etapa_idx    on public.deals (etapa);
create index deals_lead_idx     on public.deals (lead_id);
create index deals_unidad_idx   on public.deals (unidad_id);
create index deals_vendedor_idx on public.deals (vendedor_id);
create index deals_sena_idx     on public.deals (sena_vence_el) where sena_vence_el is not null;

-- Boletos de compraventa (modulo ventas). Tipo Boleto de modules/ventas/api.ts.
create sequence public.boletos_seq start 3000;
create table public.boletos (
  id           text primary key default ('BOL-' || nextval('public.boletos_seq')),
  fecha        date not null default current_date,                                 -- el front la muestra como DD/MM
  deal_id      text references public.deals (id) on delete set null,
  unidad_id    text not null references public.unidades (id) on delete restrict,
  comprador    text not null,
  precio_usd   integer not null check (precio_usd > 0),                            -- "precio"
  sena_usd     integer not null default 0,                                         -- "sena"
  forma_pago   text not null check (forma_pago in ('contado', 'prendario', 'plan de ahorro', 'permuta + saldo')),
  estado       text not null check (estado in ('cobrada', 'pendiente', 'rechazada', 'anulada')),
  vendedor_id  uuid references public.vendedores (id) on delete set null,
  comision_usd integer not null default 0 check (comision_usd >= 0),              -- "comision"
  check (sena_usd between 0 and precio_usd)
);
create index boletos_fecha_idx  on public.boletos (fecha desc);
create index boletos_estado_idx on public.boletos (estado);
create index boletos_unidad_idx on public.boletos (unidad_id);

-- Mensajes (modulo conversaciones). Tipos Hilo y Mensaje de modules/conversaciones/api.ts.
create sequence public.hilos_seq start 100;
create table public.hilos (
  id        text primary key default ('H-' || nextval('public.hilos_seq')),
  lead_id   text not null references public.leads (id) on delete cascade,
  unidad_id text references public.unidades (id) on delete set null,              -- toda charla arranca por una unidad
  canal     text not null check (canal in ('whatsapp', 'portal', 'web'))
);
create index hilos_lead_idx   on public.hilos (lead_id);
create index hilos_unidad_idx on public.hilos (unidad_id);

create table public.mensajes (
  id         bigint generated always as identity primary key,
  hilo_id    text not null references public.hilos (id) on delete cascade,
  de         text not null check (de in ('cliente', 'vendedor')),
  texto      text not null,
  enviado_el timestamptz not null default now(),
  leido      boolean not null default false                                        -- sinLeer = mensajes del cliente sin leer
);
create index mensajes_hilo_idx on public.mensajes (hilo_id, enviado_el);

-- Configuracion (modulo config): las constantes de dominio que hoy viven en shell/theme.ts.
-- Una sola fila (id = true).
create table public.ajustes_dominio (
  id                boolean primary key default true check (id),
  aging_fresco      integer not null default 30,
  aging_tibio       integer not null default 60,
  lead_tibio        integer not null default 3,
  lead_frio         integer not null default 7,
  sena_alerta       integer not null default 3,
  banda_base        numeric not null default 38000,
  banda_caida       numeric not null default 0.135,
  banda_piso        numeric not null default 8000,
  banda_oportunidad numeric not null default -5,
  banda_sobre       numeric not null default 5
);
insert into public.ajustes_dominio default values;

-- Config de los 4 diales del tablero (el VALOR se calcula en la vista v_diales).
create table public.diales_config (
  id            text primary key,
  orden         integer not null,
  label         text not null,
  max           integer not null,
  redline_desde integer not null,
  unidad        text not null default '',
  invertido     boolean not null default false
);
insert into public.diales_config (id, orden, label, max, redline_desde, unidad, invertido) values
  ('ventas-mes',     1, 'Ventas del mes',     30, 12, 'u', true),
  ('aging-promedio', 2, 'Aging promedio',    120, 60, 'd', false),
  ('sobre-corredor', 3, 'Sobre el corredor',  12,  6, 'u', false),
  ('leads-frios',    4, 'Leads frios',        12,  6, '',  false);
```

**Bloque 2 — Vistas.** Devuelven los datos con la forma exacta que espera el frontend.

```sql
-- ============================================================
-- Vistas con los nombres EXACTOS que esperan los tipos del front
-- (camelCase entre comillas). Asi el cuerpo de cada api.ts queda en una linea.
-- security_invoker = true: la vista respeta el RLS de quien consulta.
-- ============================================================

-- "hora" de un mensaje: HH:MM si es de hoy, "ayer", o "hace N d". Zona horaria: cambiala por la tuya.
create function public.hora_relativa(ts timestamptz) returns text
language sql stable as $$
  select case
    when (ts at time zone 'America/Argentina/Buenos_Aires')::date = (now() at time zone 'America/Argentina/Buenos_Aires')::date
      then to_char(ts at time zone 'America/Argentina/Buenos_Aires', 'HH24:MI')
    when (ts at time zone 'America/Argentina/Buenos_Aires')::date = (now() at time zone 'America/Argentina/Buenos_Aires')::date - 1
      then 'ayer'
    else 'hace ' || ((now() at time zone 'America/Argentina/Buenos_Aires')::date - (ts at time zone 'America/Argentina/Buenos_Aires')::date) || ' d'
  end
$$;

-- getUnidades / getUnidad / getUsados  ->  tipo Unidad
create view public.v_unidades with (security_invoker = true) as
select
  u.id, u.marca, u.modelo, u.version, u.anio, u.km,
  u.precio_usd as precio,
  u.cuota_ars  as cuota,
  u.patente, u.estado,
  (current_date - u.ingresada_el) as "diasPlaya",
  u.segmento, u.motor, u.caja, u.combustible, u.color
from public.unidades u;

-- getLeads  ->  tipo Lead
create view public.v_leads with (security_invoker = true) as
select
  l.id, l.nombre, l.email, l.telefono, l.canal, l.interes,
  l.presupuesto_usd as presupuesto,
  (current_date - l.ultimo_contacto) as "diasSinContacto",
  v.nombre as vendedor
from public.leads l
left join public.vendedores v on v.id = l.vendedor_id;

-- getDeals  ->  tipo Deal
-- OJO: "senaDias" es NULL si la ficha no tiene seña; el tipo Deal espera undefined (ver la nota en la guia).
create view public.v_deals with (security_invoker = true) as
select
  d.id,
  l.nombre    as cliente,
  l.telefono  as telefono,
  l.canal     as canal,
  d.unidad_id as "unidadId",
  d.etapa,
  d.monto_usd as monto,
  d.permuta,
  (current_date - d.ultimo_contacto) as "diasSinContacto",
  d.proximo_paso as "proximoPaso",
  v.nombre as vendedor,
  (d.sena_vence_el - current_date) as "senaDias"
from public.deals d
join public.leads l on l.id = d.lead_id
left join public.vendedores v on v.id = d.vendedor_id;

-- getBoletos  ->  tipo Boleto
create view public.v_boletos with (security_invoker = true) as
select
  b.id,
  to_char(b.fecha, 'DD/MM') as fecha,
  b.comprador,
  trim(u.marca || ' ' || u.modelo || ' ' || u.version || ' ' || u.anio) as unidad,
  u.patente,
  b.precio_usd as precio,
  b.sena_usd   as sena,
  b.forma_pago as "formaPago",
  b.estado,
  v.nombre as vendedor,
  b.comision_usd as comision,
  b.fecha as fecha_orden
from public.boletos b
join public.unidades u on u.id = b.unidad_id
left join public.vendedores v on v.id = b.vendedor_id;

-- getHilos  ->  tipo Hilo (con sus mensajes anidados)
create view public.v_hilos with (security_invoker = true) as
select
  h.id,
  l.nombre as cliente,
  trim(coalesce(u.marca || ' ' || u.modelo || ' ' || u.version, '')) as unidad,
  h.canal,
  coalesce(ult.texto, '') as ultimo,
  coalesce(public.hora_relativa(ult.enviado_el), '') as hora,
  (select count(*) from public.mensajes m where m.hilo_id = h.id and m.de = 'cliente' and not m.leido)::integer as "sinLeer",
  coalesce((
    select jsonb_agg(
      jsonb_build_object('id', m.id::text, 'de', m.de, 'texto', m.texto, 'hora', public.hora_relativa(m.enviado_el))
      order by m.enviado_el, m.id)
    from public.mensajes m where m.hilo_id = h.id
  ), '[]'::jsonb) as mensajes,
  ult.enviado_el as ultimo_en
from public.hilos h
join public.leads l on l.id = h.lead_id
left join public.unidades u on u.id = h.unidad_id
left join lateral (
  select m.texto, m.enviado_el from public.mensajes m
  where m.hilo_id = h.id order by m.enviado_el desc, m.id desc limit 1
) ult on true;

-- getResumen  ->  tipo Resumen
create view public.v_resumen with (security_invoker = true) as
select
  coalesce(sum(monto_usd) filter (where etapa <> 'entrega'), 0)::integer                as "valorEmbudo",
  (count(*) filter (where etapa = 'senia' and sena_vence_el >= current_date))::integer  as "seniasActivas",
  (count(*) filter (where etapa = 'senia' and sena_vence_el <  current_date))::integer  as "seniasVencidas",
  (count(*) filter (where entregado_el = current_date))::integer                        as "entregasHoy"
from public.deals;

-- getDiales  ->  tipo Dial[]
create view public.v_diales with (security_invoker = true) as
select
  d.id, d.label, calc.valor, d.max, d.redline_desde as "redlineDesde", d.unidad, d.invertido, d.orden
from public.diales_config d
cross join lateral (
  select case d.id
    when 'ventas-mes' then (
      select count(*)::integer from public.boletos b
      where b.estado = 'cobrada' and date_trunc('month', b.fecha) = date_trunc('month', current_date))
    when 'aging-promedio' then (
      select coalesce(round(avg(current_date - u.ingresada_el)), 0)::integer
      from public.unidades u where u.estado <> 'vendida')
    when 'sobre-corredor' then (
      select count(*)::integer from public.unidades u, public.ajustes_dominio a
      where u.km > 0
        and u.precio_usd / greatest(a.banda_base - a.banda_caida * u.km, a.banda_piso) - 1 >= a.banda_sobre / 100)
    when 'leads-frios' then (
      select count(*)::integer from public.leads l, public.ajustes_dominio a
      where current_date - l.ultimo_contacto >= a.lead_frio)
  end as valor
) calc;
```

**Bloque 3 — Row Level Security (RLS).** Es lo que impide que cualquiera con la clave pública lea tu base. **No te lo saltees.**

```sql
-- ============================================================
-- Row Level Security. Sin esto, cualquiera con la anon key lee TODO.
-- Politica de ejemplo para UNA concesionaria: cualquier usuario logueado
-- (rol "authenticated") lee y escribe. El rol "anon" no tiene politica = no entra.
-- ============================================================
alter table public.vendedores      enable row level security;
alter table public.unidades        enable row level security;
alter table public.leads           enable row level security;
alter table public.deals           enable row level security;
alter table public.boletos         enable row level security;
alter table public.hilos           enable row level security;
alter table public.mensajes        enable row level security;
alter table public.ajustes_dominio enable row level security;
alter table public.diales_config   enable row level security;

create policy "equipo: todo" on public.vendedores      for all to authenticated using (true) with check (true);
create policy "equipo: todo" on public.unidades        for all to authenticated using (true) with check (true);
create policy "equipo: todo" on public.leads           for all to authenticated using (true) with check (true);
create policy "equipo: todo" on public.deals           for all to authenticated using (true) with check (true);
create policy "equipo: todo" on public.boletos         for all to authenticated using (true) with check (true);
create policy "equipo: todo" on public.hilos           for all to authenticated using (true) with check (true);
create policy "equipo: todo" on public.mensajes        for all to authenticated using (true) with check (true);
create policy "equipo: todo" on public.ajustes_dominio for all to authenticated using (true) with check (true);
create policy "equipo: todo" on public.diales_config   for all to authenticated using (true) with check (true);

-- Ejemplo mas estricto (reemplaza la politica de deals): cada vendedor ve y mueve SOLO sus fichas.
-- Se usa (select auth.uid()) y no auth.uid() a secas: Postgres lo evalua una vez por consulta, no por fila.
--
--   drop policy "equipo: todo" on public.deals;
--   create policy "vendedor: sus fichas" on public.deals for all to authenticated
--     using (vendedor_id in (select id from public.vendedores where user_id = (select auth.uid())))
--     with check (vendedor_id in (select id from public.vendedores where user_id = (select auth.uid())));
--
-- Para varias concesionarias en la misma base, cada tabla necesita una columna tenant_id
-- y la politica filtra por ella. Eso no esta en este esquema.
```

**Bloque 4 — Trigger (opcional).** Hace que "Entregas hoy" se actualice solo cuando una ficha pasa a la etapa de entrega.

```sql
-- ============================================================
-- Trigger opcional: "Entregas hoy" se alimenta solo.
-- Cuando una ficha pasa a la etapa "entrega" se marca entregado_el = hoy;
-- si vuelve a otra etapa, se limpia.
-- ============================================================
create function public.deals_marca_entrega() returns trigger
language plpgsql as $$
begin
  if new.etapa = 'entrega' and old.etapa is distinct from 'entrega' then
    new.entregado_el := current_date;
  elsif new.etapa <> 'entrega' then
    new.entregado_el := null;
  end if;
  return new;
end
$$;

create trigger deals_entrega
before update of etapa on public.deals
for each row execute function public.deals_marca_entrega();
```

### 3.3 Cargar los datos de ejemplo

Para ver el sistema lleno desde el primer momento, generá un `seed.sql` a partir de los mismos `data.json` del demo. Creá un archivo `generar-seed.mjs` **en la raíz de tu proyecto** (no hace falta commitearlo) con este contenido:

```js
// generar-seed.mjs · lee los data.json del demo y escribe un seed.sql listo para pegar en Supabase.
// Uso (desde la raiz del proyecto):  node generar-seed.mjs > seed.sql
import { readFileSync } from "node:fs"

const leer = (modulo, clave) => JSON.parse(readFileSync(`modules/${modulo}/data.json`, "utf8"))[clave]
const unidades = leer("catalogo", "unidades")
const leads = leer("contactos", "leads")
const deals = leer("pipeline", "deals")
const boletos = leer("ventas", "boletos")
const hilos = leer("conversaciones", "hilos")

// Literales SQL: comillas simples duplicadas, null para vacios.
const q = (v) => (v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`)
const n = (v) => (v === null || v === undefined ? "null" : String(Number(v)))
const vendedor = (nombre) => `(select id from public.vendedores where nombre = ${q(nombre)})`
const leadPorTelefono = (tel) => `(select id from public.leads where telefono = ${q(tel)})`
const leadPorNombre = (nom) => `(select id from public.leads where nombre = ${q(nom)})`
const etiqueta = (u) => [u.marca, u.modelo, u.version].join(" ")

const out = []
const push = (s) => out.push(s)

push("-- Seed generado desde modules/*/data.json. Datos 100% ficticios.")
push("begin;")

// 1) Vendedores (los nombres unicos que aparecen en leads, deals y boletos)
const nombresVend = [...new Set([...leads, ...deals, ...boletos].map((x) => x.vendedor))]
push(`insert into public.vendedores (nombre) values ${nombresVend.map((v) => `(${q(v)})`).join(", ")};`)

// 2) Unidades. diasPlaya -> ingresada_el = hoy - diasPlaya
for (const u of unidades) {
  push(
    `insert into public.unidades (id, marca, modelo, version, anio, km, precio_usd, cuota_ars, patente, estado, ingresada_el, segmento, motor, caja, combustible, color) values (${[
      q(u.id), q(u.marca), q(u.modelo), q(u.version), n(u.anio), n(u.km), n(u.precio), n(u.cuota), q(u.patente), q(u.estado),
      `current_date - ${n(u.diasPlaya)}`, q(u.segmento), q(u.motor), q(u.caja), q(u.combustible), q(u.color),
    ].join(", ")});`,
  )
}

// 3) Leads. diasSinContacto -> ultimo_contacto = hoy - dias
const alta = (l, id) =>
  `insert into public.leads (${id ? "id, " : ""}nombre, email, telefono, canal, interes, presupuesto_usd, ultimo_contacto, vendedor_id) values (${[
    ...(id ? [q(id)] : []), q(l.nombre), q(l.email), q(l.telefono), q(l.canal), q(l.interes), n(l.presupuesto),
    `current_date - ${n(l.diasSinContacto)}`, vendedor(l.vendedor),
  ].join(", ")});`
for (const l of leads) push(alta(l, l.id))

// 3b) Hay oportunidades cuyo cliente no esta en la lista de contactos: se crea el contacto (id automatico).
const telefonos = new Set(leads.map((l) => l.telefono))
for (const d of deals) {
  if (telefonos.has(d.telefono)) continue
  telefonos.add(d.telefono)
  const u = unidades.find((x) => x.id === d.unidadId)
  push(alta({ nombre: d.cliente, email: null, telefono: d.telefono, canal: d.canal, interes: u ? etiqueta(u) : "", presupuesto: d.monto, diasSinContacto: d.diasSinContacto, vendedor: d.vendedor }, null))
}

// 4) Deals. senaDias -> sena_vence_el = hoy + dias (negativo = ya vencida)
for (const d of deals) {
  push(
    `insert into public.deals (id, lead_id, unidad_id, etapa, monto_usd, permuta, ultimo_contacto, proximo_paso, vendedor_id, sena_vence_el, entregado_el) values (${[
      q(d.id), leadPorTelefono(d.telefono), q(d.unidadId), q(d.etapa), n(d.monto),
      d.permuta ? `${q(JSON.stringify(d.permuta))}::jsonb` : "null",
      `current_date - ${n(d.diasSinContacto)}`, q(d.proximoPaso), vendedor(d.vendedor),
      d.senaDias === undefined ? "null" : `current_date + ${n(d.senaDias)}`,
      d.etapa === "entrega" ? "current_date" : "null",
    ].join(", ")});`,
  )
}

// 5) Boletos. La fecha del JSON es "DD/MM": se arma con el anio actual. La unidad se busca por su etiqueta.
const etiquetaCompleta = (u) => [u.marca, u.modelo, u.version, u.anio].join(" ")
for (const b of boletos) {
  const u = unidades.find((x) => etiquetaCompleta(x) === b.unidad)
  if (!u) throw new Error(`Boleto ${b.id}: no encuentro la unidad "${b.unidad}"`)
  const [dd, mm] = b.fecha.split("/").map(Number)
  push(
    `insert into public.boletos (id, fecha, unidad_id, comprador, precio_usd, sena_usd, forma_pago, estado, vendedor_id, comision_usd) values (${[
      q(b.id), `make_date(date_part('year', current_date)::int, ${mm}, ${dd})`, q(u.id), q(b.comprador), n(b.precio), n(b.sena),
      q(b.formaPago), q(b.estado), vendedor(b.vendedor), n(b.comision),
    ].join(", ")});`,
  )
}

// 6) Hilos y mensajes. La "hora" del JSON ("09:42", "ayer", "hace 6 d") se convierte en una fecha real.
const desfase = (hora) => (/^\d\d:\d\d$/.test(hora) ? 0 : hora === "ayer" ? 1 : Number(hora.match(/\d+/)[0]))
const reloj = (hora, i) => (/^\d\d:\d\d$/.test(hora) ? hora : `1${i % 10}:00`)
for (const h of hilos) {
  const u = unidades.find((x) => etiqueta(x).startsWith(h.unidad))
  push(
    `insert into public.hilos (id, lead_id, unidad_id, canal) values (${[q(h.id), leadPorNombre(h.cliente), q(u ? u.id : null), q(h.canal)].join(", ")});`,
  )
  // Los ultimos `sinLeer` mensajes del cliente quedan sin leer.
  let pendientes = h.sinLeer
  const sinLeer = new Set()
  for (let i = h.mensajes.length - 1; i >= 0 && pendientes > 0; i--) {
    if (h.mensajes[i].de === "cliente") {
      sinLeer.add(i)
      pendientes--
    }
  }
  h.mensajes.forEach((m, i) => {
    const dia = `current_date - ${desfase(m.hora)}`
    push(
      `insert into public.mensajes (hilo_id, de, texto, enviado_el, leido) values (${[
        q(h.id), q(m.de), q(m.texto),
        `((${dia})::timestamp + time '${reloj(m.hora, i)}') at time zone 'America/Argentina/Buenos_Aires'`,
        sinLeer.has(i) ? "false" : "true",
      ].join(", ")});`,
    )
  })
}

push("commit;")
console.log(out.join("\n"))
```

Corrélo y pegá el resultado en el SQL Editor:

```bash
node generar-seed.mjs > seed.sql
```

Abrí `seed.sql`, copiá todo, pegalo en **SQL Editor → New query** y ejecutalo. El SQL Editor corre con un rol administrador, así que no le molesta el RLS.

Qué hace el generador: convierte `diasPlaya`, `diasSinContacto` y `senaDias` en fechas relativas a hoy, crea los vendedores a partir de los nombres, y crea el contacto de las dos oportunidades cuyo cliente no estaba en la lista de contactos. Los números de "Resumen" del `data.json` eran fijos; con la base se calculan de las fichas reales, por eso pueden dar distinto. "Ventas del mes" cuenta los boletos del mes en curso y los de ejemplo tienen fecha de julio.

> **Alternativa sin script:** en **Table Editor → tabla → Import data from CSV** podés subir un CSV por tabla. Los encabezados tienen que coincidir con los nombres de **columna** de la tabla (`precio_usd`, no `precio`), y tenés que cargar las tablas en este orden: `vendedores`, `unidades`, `leads`, `deals`, `boletos`, `hilos`, `mensajes`. Para el demo completo es bastante más trabajo que el script.

### 3.4 Crear tu primer usuario

**Authentication → Users → Add user → Create new user**: poné tu email y una contraseña. Con las políticas del bloque 3, solo los usuarios autenticados entran a los datos. Si querés que aparezca como vendedor, asocialo en SQL:

```sql
update public.vendedores
set user_id = (select id from auth.users where email = 'tu@email.com')
where nombre = 'Milena Sarti';
```

### 3.5 Variables de entorno

En la raíz del proyecto copiá el archivo de ejemplo y completalo con los valores de **Project Settings → API** (en el panel nuevo puede llamarse *API Keys*) de tu proyecto:

```bash
cp .env.example .env.local
```

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-publica
```

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` es la clave **pública** (en el panel nuevo de Supabase puede aparecer como *publishable key*; la clave sirve igual, solo cambia el nombre que le des a la variable). Es segura en el navegador **siempre y cuando tengas RLS activado**, que es lo que hicimos en el bloque 3.
- **La clave `service_role` NUNCA va al frontend ni lleva el prefijo `NEXT_PUBLIC_`.** Ignora el RLS: quien la tenga puede leer y borrar toda tu base. Solo se usa en un servidor (el worker de Railway, por ejemplo).
- `.env.local` está ignorado por git. No lo subas nunca.

### 3.6 Instalar las librerías

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 3.7 Crear el cliente de Supabase

Creá la carpeta `lib/supabase/` en la raíz con dos archivos. El del **navegador** lo usan los componentes (todos los módulos de este sistema son componentes de cliente):

```ts
// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

El del **servidor** lo usan las páginas de servidor, los Route Handlers y las Server Actions:

```ts
// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Se llamó desde un Server Component: se puede ignorar si tenés un middleware que refresca la sesión.
          }
        },
      },
    },
  )
}
```

Para que la sesión se **refresque** entre páginas hace falta además un `middleware.ts` en la raíz. Su código oficial para Next.js está en la guía *Setting up Server-Side Auth for Next.js* de Supabase (https://supabase.com/docs/guides/auth/server-side/nextjs); copialo de ahí para no depender de una versión vieja.

### 3.8 ANTES y DESPUÉS de una función real: `getUnidades`

La firma (`getUnidades(): Promise<Unidad[]>`) **no cambia**. Solo cambia el cuerpo.

**ANTES** (`modules/catalogo/api.ts`, el demo):

```ts
import raw from "./data.json"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const unidades = (): Unidad[] => structuredClone(raw.unidades) as Unidad[]

export async function getUnidades(): Promise<Unidad[]> {
  await sleep(280)
  return unidades()
}
```

**DESPUÉS** (conectado a Supabase):

```ts
import { createClient } from "@/lib/supabase/client"

export async function getUnidades(): Promise<Unidad[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("v_unidades").select("*").order("id")
  if (error) throw new Error(`No se pudieron cargar las unidades: ${error.message}`)
  return data as Unidad[]
}
```

Qué cambió: desapareció el `import raw`, el `sleep` (la latencia ahora es la real) y `structuredClone`; entró la consulta y el manejo de error. Los demás archivos del módulo (`index.tsx`) no se enteran.

El mismo patrón para el resto de `catalogo/api.ts`:

```ts
export async function getUnidad(id: string): Promise<Unidad | undefined> {
  const supabase = createClient()
  const { data, error } = await supabase.from("v_unidades").select("*").eq("id", id).maybeSingle()
  if (error) throw new Error(`No se pudo cargar la unidad: ${error.message}`)
  return (data as Unidad | null) ?? undefined
}

export async function getUsados(): Promise<Unidad[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("v_unidades").select("*").gt("km", 0).order("id")
  if (error) throw new Error(`No se pudieron cargar los usados: ${error.message}`)
  return data as Unidad[]
}
```

### 3.9 Dos detalles del pipeline que muerden

**`senaDias` es `null` en la base y `undefined` en el tipo.** El componente decide si muestra la seña con `d.senaDias !== undefined`; un `null` se leería como "seña por vencer". Al devolver los deals, convertí el `null`:

```ts
export async function getDeals(): Promise<Deal[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("v_deals").select("*").order("id")
  if (error) throw new Error(`No se pudieron cargar las oportunidades: ${error.message}`)
  return (data ?? []).map(({ senaDias, ...d }) => (senaDias === null ? d : { ...d, senaDias })) as Deal[]
}
```

**`moverDeal` hoy no se espera ni se captura.** El componente llama `moverDeal(d.id, e)` y actualiza la pantalla enseguida. Con una base real puede fallar (sin conexión, RLS). Cambiá la función para que lance el error y, en `modules/pipeline/index.tsx`, deshacé el movimiento si falla:

```ts
export async function moverDeal(id: string, etapa: Etapa): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("deals").update({ etapa }).eq("id", id)
  if (error) throw new Error(`No se pudo mover la ficha: ${error.message}`)
}
```

### 3.10 Estados de carga y de error

Hoy cada pantalla hace `getX().then(setX)` y, si la promesa se rechaza, queda el esqueleto de carga para siempre. Con backend real agregá un `.catch` que guarde el error en un estado y muestre un mensaje con un botón "Reintentar". Es el único cambio de interfaz que la conexión real te exige.

### 3.11 Auth: reemplazar el stub

`shell/auth-stub.ts` devuelve siempre un usuario de mentira. Reemplazalo por Supabase Auth manteniendo el nombre de la función:

```ts
// shell/auth-stub.ts  (renombralo a shell/auth.ts si querés)
import { createClient } from "@/lib/supabase/server"

export async function getSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user ? { user: { id: user.id, name: user.email ?? "Usuario" } } : null
}
```

Usá `getUser()` y no `getSession()` en el servidor: `getUser()` valida el token contra Supabase.

El demo no trae pantalla de login. Creá `app/login/page.tsx` con un formulario de email y contraseña que llame a:

```ts
const supabase = createClient() // el de lib/supabase/client.ts
const { error } = await supabase.auth.signInWithPassword({ email, password })
```

Para cerrar sesión: `await supabase.auth.signOut()`. Y en el `middleware.ts` mandá a `/login` a quien no tenga sesión (el ejemplo oficial de la sección 3.7 ya trae ese esqueleto). **Nunca uses Clerk** en este stack: la autenticación es Supabase Auth.

---

## 4. Railway: tareas en segundo plano con pg-boss

### 4.1 Para qué sirve, en criollo

Tu sitio en Vercel responde cuando alguien entra. Pero hay cosas que tienen que pasar **solas, aunque nadie esté mirando**: avisar que un lead se enfrió, avisar que una seña vence mañana, mandar el resumen de la semana. Para eso hace falta un programa que viva todo el día esperando su hora. Eso es un **worker**.

**pg-boss** es una cola de tareas que guarda todo en tu mismo Postgres (el de Supabase): no necesitás instalar nada más. **Railway** es el servidor donde corre ese programa.

### 4.2 Casos de ESTA industria que lo necesitan

Todos usan columnas que ya existen en el esquema de la sección 3:

| Tarea | Cuándo corre | Qué mira |
|---|---|---|
| **Seguimiento de leads fríos** | todos los días a las 9:00 | `leads.ultimo_contacto`: los que pasaron el umbral de `lead_frio` (7 días sin contacto). Aviso al vendedor. En el demo es el chip rojo de "Leads fríos". |
| **Seña por vencer** | todos los días a las 8:00 | `deals.sena_vence_el`: fichas en etapa `senia` que vencen en `sena_alerta` días (3) o menos. Aviso al vendedor; si ya venció, podés devolver la unidad a `disponible`. |
| **Unidades añejas** | los lunes a las 9:00 | `unidades.ingresada_el`: las que pasaron `aging_tibio` (60 días) sin venderse. Sugerencia de bajar el precio. |

### 4.3 Conexión: directa o pooler (la decisión que más confunde)

Supabase te ofrece varias cadenas de conexión (**Connect** en el panel del proyecto). Para un proceso que queda corriendo todo el día, como el worker:

| Tipo | Puerto | Para qué sirve | ¿Para pg-boss? |
|---|---|---|---|
| **Directa** | 5432 | Servidores que viven siempre. Funciona por IPv6; por IPv4 solo con el add-on pago de Supabase. | Sí, si tu servidor tiene IPv6 |
| **Pooler, modo sesión** | 5432 | Servidores que viven siempre, y funciona por IPv4. | **Sí. Es la que recomendamos para empezar.** |
| **Pooler, modo transacción** | 6543 | Funciones serverless que abren muchas conexiones cortas. | **No.** Comparte conexiones entre transacciones y no sirve para procesos que necesitan sesión estable. |

Nosotros no verificamos si el tráfico de salida de tu servicio en Railway sale por IPv6, así que empezá por el **pooler en modo sesión**: es la que funciona por IPv4. La cadena se ve así (con tus datos, sin compartirla jamás):

```text
postgresql://postgres.tu-proyecto:TU-CONTRASEÑA@aws-0-tu-region.pooler.supabase.com:5432/postgres
```

### 4.4 Pasos

1. Creá un **repositorio aparte** (privado) para el worker, por ejemplo `automotora-worker`. Es otro programa: no lo mezcles con el frontend.
2. Entrá a https://railway.com, **New Project → Deploy from GitHub repo** y elegí ese repositorio. Si preferís crear el servicio vacío (**Empty Service**), conectá el repo después desde **Settings → Source**.
3. En el servicio, pestaña **Variables**, cargá:
   - `DATABASE_URL`: la cadena de conexión del pooler en modo sesión.
   - `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`: solo si el worker va a leer o escribir por la API de Supabase. Esta clave vive **únicamente** en Railway.
   - Las claves de lo que uses para avisar (Resend, WhatsApp, etc.).
4. En **Settings → Deploy → Custom Start Command** poné el comando que arranca el worker, por ejemplo:

```bash
node worker.mjs
```

5. Cada vez que hagas push al repo, Railway vuelve a desplegar. Mirá la pestaña **Logs** para ver que el worker arrancó.

> Las variables de Railway **no se guardan en el repo**. Si alguna vez pegás una clave en un archivo del repositorio, rotala (generá una nueva y desactivá la vieja) aunque lo borres.

### 4.5 Esqueleto mínimo de un worker

Es un ejemplo para que veas la forma; **no está en este repositorio**. Va en el repo del worker, junto con `npm install pg-boss @supabase/supabase-js` y `"type": "module"` en su `package.json`. Revisá en el README de pg-boss qué versión de Node pide la versión que se instale.

```js
// worker.mjs
import { PgBoss } from "pg-boss"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const boss = new PgBoss(process.env.DATABASE_URL)
boss.on("error", (error) => console.error("pg-boss:", error))
await boss.start() // crea el esquema "pgboss" en tu base si no existe

// 1) La cola tiene que existir antes de programarla o de trabajarla.
await boss.createQueue("leads-frios")

// 2) Programar: todos los días a las 9:00, hora de Buenos Aires.
await boss.schedule("leads-frios", "0 9 * * *", {}, { tz: "America/Argentina/Buenos_Aires" })

// 3) Trabajar: esta función corre cuando llega la hora. Recibe un arreglo de trabajos.
await boss.work("leads-frios", async ([job]) => {
  const limite = new Date()
  limite.setDate(limite.getDate() - 7) // lead_frio: 7 dias sin contacto
  const { data, error } = await supabase
    .from("leads")
    .select("id, nombre, vendedor_id")
    .lte("ultimo_contacto", limite.toISOString().slice(0, 10))
  if (error) throw error // pg-boss reintenta segun la configuracion del trabajo
  console.log(`Trabajo ${job.id}: ${data.length} leads frios`)
  // Aca va el aviso a cada vendedor (email, WhatsApp, lo que uses).
})

// Cierre ordenado cuando Railway reinicia el servicio.
process.on("SIGTERM", async () => {
  await boss.stop()
  process.exit(0)
})
```

Para encolar un trabajo puntual desde el frontend o un Route Handler (por ejemplo "recordame mañana") se usa `boss.send("nombre-de-la-cola", datos, { startAfter: 3600 })`.

---

## 5. Vercel: publicar

1. Subí tu proyecto a GitHub (tu fork).
2. En https://vercel.com/new elegí **Import Git Repository** y seleccioná el repo. Vercel detecta **Next.js** solo: no cambies el comando de build ni la carpeta de salida.
3. Antes de apretar **Deploy**, abrí **Environment Variables** y cargá las mismas variables de tu `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY` (o `GEMINI_API_KEY`) y `OPENAI_MODEL`, si ya hiciste la etapa 6

   Marcá los entornos **Production** y **Preview**. Las variables que empiezan con `NEXT_PUBLIC_` se "cocinan" en el build: si las cambiás, hay que **redeployar**.
4. **Deploy**. En uno o dos minutos tenés una URL `https://tu-proyecto.vercel.app`.
5. **Dominio propio:** *Settings → Domains → Add*, escribí tu dominio y cargá en tu proveedor de dominios el registro DNS que Vercel te indica.
6. **Deploys automáticos:** cada `git push` a la rama principal publica a producción; cada rama o pull request genera una URL de *Preview*.
7. En Supabase, **Authentication → URL Configuration**, agregá tu URL de Vercel (y tu dominio) a *Site URL* y *Redirect URLs*, o el login va a rebotar.

**Si el build falla:** abrí el deploy fallido, leé el log de arriba hacia abajo y buscá la primera línea roja. Reproducilo en tu máquina con `npm run build`: casi siempre es un error de TypeScript, una variable de entorno que falta o un import mal escrito. Arreglalo, hacé commit y push.

---

## 6. IA (OpenAI o Gemini) en este sistema

Este sistema no trae un módulo `agente-ia`. La IA tiene sentido en **mensajes** (`conversaciones`), donde el vendedor contesta consultas de clientes: *"¿Sigue disponible?"*, *"¿Qué cuota queda a 48 meses?"*, *"¿Acepta permuta?"*. Lo que sigue es una función de **"Sugerir respuesta"**: toma la conversación y la ficha de la unidad y redacta un borrador que el vendedor revisa y envía. El vendedor decide: la IA nunca contesta sola.

**Regla de oro: la clave de la IA vive solo en el servidor.** Se usa desde un Route Handler o una Server Action, jamás desde un componente de cliente.

### 6.1 Variables de entorno

En `.env.local` (y en Vercel). Ninguna lleva `NEXT_PUBLIC_`:

```bash
OPENAI_API_KEY=tu-clave
OPENAI_MODEL=nombre-del-modelo
```

El nombre del modelo lo elegís vos desde la lista vigente de tu proveedor (por eso es una variable y no está escrito en el código: los modelos cambian).

### 6.2 Ejemplo mínimo con OpenAI

```bash
npm install openai
```

```ts
// app/api/sugerir-respuesta/route.ts
import OpenAI from "openai"
import { createClient } from "@/lib/supabase/server"

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  // 1) Solo usuarios logueados.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 })

  // 2) Validar la entrada.
  const { hiloId } = await request.json()
  if (typeof hiloId !== "string") return Response.json({ error: "Falta hiloId" }, { status: 400 })

  // 3) Leer la conversación con la sesión del usuario (el RLS aplica).
  const { data: hilo, error } = await supabase.from("v_hilos").select("*").eq("id", hiloId).maybeSingle()
  if (error || !hilo) return Response.json({ error: "Hilo no encontrado" }, { status: 404 })

  const conversacion = hilo.mensajes
    .map((m: { de: string; texto: string }) => `${m.de}: ${m.texto}`)
    .join("\n")

  // 4) Pedir el borrador.
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL!,
    instructions:
      "Sos un vendedor de una automotora. Redactá una respuesta breve, cordial y concreta en español rioplatense. " +
      "No inventes precios, kilometrajes ni disponibilidad que no estén en la conversación.",
    input: `Unidad: ${hilo.unidad}\n\nConversación:\n${conversacion}`,
    max_output_tokens: 300,
  })

  return Response.json({ texto: response.output_text })
}
```

En el frontend, el campo de mensajes (hoy deshabilitado) pasa a tener un botón "Sugerir respuesta" que llama a `fetch("/api/sugerir-respuesta", { method: "POST", body: JSON.stringify({ hiloId }) })` y vuelca `texto` en el campo para que el vendedor lo edite.

### 6.3 Con Gemini

```bash
npm install @google/genai
```

```ts
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const response = await ai.models.generateContent({
  model: process.env.GEMINI_MODEL!,
  contents: `Unidad: ${hilo.unidad}\n\nConversación:\n${conversacion}`,
})
const texto = response.text
```

### 6.4 Costos y límites que tenés que vigilar

- **Pagás por tokens** (lo que mandás más lo que te devuelven). Una conversación larga cuesta más que una corta. Limitá la salida con `max_output_tokens` y mandá solo los últimos mensajes si el hilo crece.
- **Poné un tope de gasto** en el panel del proveedor (límite mensual y alertas) antes de publicar.
- **Limitá el uso por usuario**: sin un límite, un usuario con la sesión abierta puede disparar miles de llamadas. Contá las llamadas en una tabla propia o usá un servicio de rate limiting.
- **Cada proveedor tiene límites de velocidad** (peticiones y tokens por minuto). Si te devuelve error 429, esperá y reintentá con pausa creciente.
- **Datos de clientes:** el texto que mandás sale de tu sistema hacia un tercero. Mandá solo lo necesario (no hace falta el teléfono ni el email para redactar una respuesta) y revisá la política de datos de tu proveedor.
- Guardá el uso (`response.usage` en OpenAI) para saber cuánto gastás por función.

---

## 7. Checklist de seguridad antes de publicar con datos reales

- [ ] **RLS activado en todas las tablas** (el bloque 3). Verificá en Supabase: *Table Editor* no debe mostrar ninguna tabla con la etiqueta de RLS desactivado; *Advisors → Security* debe estar sin alertas rojas.
- [ ] Probaste que **sin iniciar sesión no se ve nada**: abrí la app en una ventana privada y confirmá que no carga datos.
- [ ] **`service_role` fuera del frontend**: no está en ningún archivo `NEXT_PUBLIC_*`, ni en el código del navegador, ni en el repo. Solo en Railway o en variables de servidor.
- [ ] **`.env.local` y cualquier `.env*` en `.gitignore`**; solo `.env.example` (con placeholders vacíos) se sube. Revisalo con `git status` antes de cada commit.
- [ ] **Ninguna clave en el historial de git.** Si una clave llegó a subirse alguna vez, rotala: borrar el archivo no alcanza.
- [ ] **Datos reales de clientes NUNCA en un repositorio público**: ni en un `data.json`, ni en un seed, ni en un CSV. Los datos de este demo son ficticios; los tuyos viven solo en la base.
- [ ] **Rate limiting** en los Route Handlers que cuestan plata o exponen datos (IA, envío de mensajes).
- [ ] **Backups**: en Supabase, revisá qué copias de seguridad incluye tu plan y hacé un `pg_dump` periódico si manejás datos que no podés perder.
- [ ] **Auth**: confirmación de email y contraseñas mínimas configuradas en *Authentication → Providers → Email*; las URLs de redirección limitadas a tus dominios.
- [ ] **Variables de entorno cargadas por entorno** en Vercel (Production y Preview) y sin claves de producción en entornos de prueba.
- [ ] El worker de Railway usa una cadena de conexión **de tu proyecto**, no compartida, y su contraseña está solo en Railway.

---

## 8. Errores comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| Las pantallas cargan pero vacías, sin errores | El RLS está activo y no iniciaste sesión | Iniciá sesión; confirmá que las políticas del bloque 3 existan (`for all to authenticated`) |
| `permission denied for table …` o `new row violates row-level security policy` | Falta una política para esa operación | Agregá la política para el rol `authenticated` (bloque 3) |
| `relation "public.v_unidades" does not exist` | No corriste el bloque 2, o corriste los bloques en otro orden | Corré los bloques 1, 2, 3 en ese orden |
| `column "precio" does not exist` | Estás consultando la **tabla** (`unidades`) en vez de la **vista** (`v_unidades`) | Usá la vista, que trae los nombres que espera el frontend |
| Una ficha sin seña aparece con "Seña vence en…" | `senaDias` llega como `null` en vez de `undefined` | Aplicá la conversión de la sección 3.9 |
| `Invalid API key` o `Failed to fetch` al conectar | Variables mal copiadas o `.env.local` sin reiniciar el servidor | Revisá `NEXT_PUBLIC_SUPABASE_URL` y la clave; reiniciá `npm run dev` |
| En Vercel funciona todo menos Supabase | Faltan las variables de entorno en Vercel | Cargalas en *Settings → Environment Variables* y hacé **Redeploy** |
| El login funciona en local y en producción te devuelve a `/login` | La URL de Vercel no está en *Redirect URLs* de Supabase | Agregala en *Authentication → URL Configuration* |
| Railway: el worker se reinicia en loop | Cadena de conexión equivocada, o el pooler en modo transacción | Usá el pooler en modo **sesión** (puerto 5432) y mirá los logs |
| `The queue … does not exist` en pg-boss | Programaste o trabajaste una cola sin crearla | Llamá `await boss.createQueue("nombre")` antes de `schedule` y `work` |
| `npm run build` falla en Vercel pero no en tu máquina | Variable de entorno ausente en Vercel, o diferencia de versión de Node | Igualá las variables y la versión de Node (*Settings → General → Node.js Version*) |
| Error 429 de la API de IA | Superaste el límite de velocidad o de gasto | Esperá y reintentá con pausa; revisá los límites en el panel del proveedor |

---

## 9. Siguiente paso

Ya tenés un sistema real. El paso que sigue es otro: **Aprendé a crear tu Agencia de IA y conseguir tu primer cliente.** Eso lo trabajamos adentro del Club de la IA, nuestro Skool privado.

👉 https://www.skool.com/club-de-la-ia-8047/about
