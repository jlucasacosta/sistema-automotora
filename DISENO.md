# Ficha de Diseño — sistema-automotora

> **Ojo: hay una nota fechada 2026-10-11 al final de este documento** (decisión de Lucas: sistemas más profesionales, sin animaciones decorativas). Donde el cuerpo habla de mazo con vuelta 3D, aguja que barre, comparador con rebote o seña que late, vale la nota.

## Marca
**VÉRTICE Automotores** (marca ficticia, 100% inventada).
Voz: playa de venta a las nueve de la noche. La identidad no es el logo: es la **patente stencil + el precio en USD**.

## Usuario y contexto
El **vendedor de salón**, no el dueño. El dueño mira reportes una vez al día; el vendedor vive adentro del sistema toda la jornada: atiende al que entra por la puerta, contesta el que llamó por un aviso, carga la permuta. Monitor de escritorio a 60 cm, salón con vidriera y reflejo, y el celular en la mano cuando camina hacia la unidad con el cliente.

La tarea que repite 40 veces por día es una cadena: **lead → unidad → siguiente paso**. Entra una consulta, se la vincula a una unidad del catálogo, se agenda un test drive, se carga la permuta ofrecida, se mueve la ficha de etapa.

Lo que se rompe si el dato llega tarde: la **unidad vendida dos veces** (dos vendedores prometen el mismo usado), el **lead frío** (en autos la ventana es de horas), la **permuta mal tasada** (sobrepagás la toma y te comés el margen) y la **seña vencida** (la unidad vuelve a stock y el cliente se va).

## La pantalla que manda
**pipeline** — el embudo de oportunidades. En una concesionaria la plata está en las oportunidades en curso: cada ficha es un cliente con una unidad tentativa, una permuta y una etapa. El vendedor abre esa pantalla y sabe a quién llamar HOY. El dashboard resume; el pipeline es donde se trabaja. Por eso el **componente estrella vive en el pipeline**, no en el catálogo (corrección del abogado del diablo).

## Dirección de arte
**Cliché rechazado:** el showroom premium negro-plata-cromo con reflejo de piso pulido. Es lo que hace toda concesionaria y en video se ve muerto: un lienzo gris sin color con significado. Rechazado también el **rojo Ferrari** (chocaría con el oxblood de barbería) y el degradé azul metalizado corporativo (chocaría con el cobalto del gimnasio).

**Referencia que gana:** la **playa de venta de noche**. Asfalto húmedo, cartelería LED, luces de freno. Night-lot neón, no showroom mármol. Frío, tinte violáceo, base casi negra, tarjetas un escalón más claras que flotan. Acentos neón puntuales, nunca baños de color. Geometría cuadrada, de instrumental de tablero.

## Palancas del theme (PIEL)
| Palanca | Valor | Por qué |
|---|---|---|
| mode | **dark** | paridad (#06 es par) + playa de noche |
| nav | **topbar** | el auto entra por la ficha; sin sidebar el lienzo queda entero para el embudo horizontal |
| elevation | **flat** | editorial de revista de autos; la profundidad la aporta el color, no la sombra |
| radius | **soft** | premium sin caer en el redondo consumer del restaurante |
| density | **compact** | el vendedor opera el pipeline 40 veces por día. *(corrección del abogado: `comfortable` clonaba el chasis de barbería)* |
| badge | **pill** | chip de estado amable: 0km, reservada, seña |
| fuentes | **Chakra Petch** (heading, patente, USD) + **Figtree** (body) | cuadrada de HUD de tablero + humanista legible en denso. Ninguna usada antes |
| color | primary **violeta eléctrico #7B61FF** + accent **magenta neón #FF4D9D** | único territorio libre, y lee como tecnología / EV / financiación, no como el azul metalizado de siempre |

**Semánticos (dark, los cuatro distinguibles a 2x):**
- success `#34D399` — entregada, seña vigente
- warning `#FBBF24` — lead tibio, stock añejo
- danger `#FB5C4C` — **escarlata, corregido**. El `#F87171` original (salmón) se confundía con el accent magenta en el reel, y el frame-firma tiene una seña vencida parpadeando al lado de chips magenta
- info `#38BDF8` — 0km, en preparación

`primary` **no sirve como texto** sobre las tarjetas: va solo como fill (riel de KPI, aguja del odómetro, pill de nav activo con `text-bg` encima).

> **Ajuste de auditoría (Impeccable):** `primary` pasó de `#7B61FF` a `#7E64FF` (mismo matiz, apenas más claro) para que el texto `bg` encima del fill (pill de nav activo, chips-filtro activos, inicial de la marca) llegue a 4.5:1 (4.41 → 4.55). Y los chips `accent` y `danger` bajaron su tinte de fondo (`/20` y `/15` → `/10`) por el mismo motivo. La identidad no cambia.

## Módulos → arquetipo
| Módulo | Arquetipo | Qué es |
|---|---|---|
| **dashboard** | `mosaico-mando` (NUEVO) | bento de spans heterogéneos de verdad: cifra del pipeline (1×1) · **panel-odómetro** (3×1) · **scatter precio×km** (3×2) · playa por antigüedad (1×2). No es una grilla 4-up uniforme |
| **pipeline** ⭐ | `embudo-lanes-conversion` (NUEVO) | embudo horizontal: cada etapa es un trapecio que se angosta. **El ancho del trapecio ES el dato** (cantidad de fichas). Mover una ficha re-escala los anchos y recomputa el % de conversión. Eso es lo que un kanban no hace: en el kanban todas las columnas miden lo mismo |
| **catalogo** | `ficha-flip-deck` (NUEVO) | mazo apilado, no grilla. Una carta al tope, grande. Click en el riel → esa unidad **se reparte** al tope; click en la carta → flip 3D y aparece la ficha técnica en el dorso |
| **ventas** | `boleto-slips` | cada venta es un boleto: comprador, unidad, patente, forma de pago, seña/saldo, comisión |
| **conversaciones** | `master-detail` | hilos a la izquierda, panel a la derecha; cada hilo atado a una unidad |
| **contactos** | `tabla-densa` | CRM de leads: canal de origen, interés, días sin contacto |
| **config** | `form-secciones` | paneles de sección. Plomería |

## KPI · Gráfico · Iconos · Estructura
- **KPI: `panel-odometro`** (NUEVO) — diales de tablero. Arco de 180°, **aguja que apunta al valor** y **zona redline** al final del recorrido. La aguja barre desde cero al montar. *Condición bloqueante del abogado: sin aguja ni redline colapsa a "anillos cortado a la mitad" y queda vetado.*
- **Gráfico: `scatter-precio-km`** (NUEVO) — matriz precio × kilometraje. Cada unidad es un punto (x = km, y = precio USD, tamaño = días en playa). Una banda diagonal marca el corredor de precio justo: arriba está sobrevaluado, abajo es oportunidad. Codifica tres dimensiones; ningún otro sistema tiene scatter.
- **Combo KPI + gráfico: `panel-odometro` + `scatter-precio-km`** — único en la colección.
- **Iconos: `icon-chip`** (ícono en cuadrado tintado). En dark + flat el trazo fino desaparece.
- **Estructura: `topbar-con-subbar-filtros`** — topbar con marca y tabs, subbar de filtros (segmento, rango de precio), después el lienzo.

## Componente estrella — Comparador de Unidades (`spec-comparator-drag`)
Vive en el **pipeline**, invocado desde una ficha en etapa "cotización": *comparar las candidatas para este lead*. Ahí gana sentido narrativo (matchear lead ↔ unidad) en vez de ser un juguete del catálogo.

Bandeja de tres slots. Se arrastran hasta tres unidades. El panel renderiza un diff fila por fila (precio, año, km, motor, caja, cuota estimada, días en playa): la **celda ganadora** se tinta en `success` y muestra un chip de delta (`−40.000 km`), las perdedoras se atenúan. Un ribbon **"MEJOR VALOR"** entra animado sobre la columna que gana más filas.

**Interacción grabable:** se suelta la tercera unidad → el slot hace snap con rebote → toda la tabla recomputa y las celdas ganadoras flashean → el ribbon baja sobre la columna ganadora. Ningún otro sistema tiene drag-to-compare con winner-flash.

## Componente eliminado
**El feed de actividad cronológico del dashboard** (la lista "Novedades" / "Actividad reciente" que tienen inmobiliaria y taller). En una automotora el evento relevante no es una línea de log: es una ficha que se mueve de trapecio. Un feed lo duplica y no dispara ninguna acción. Ese espacio del bento se gasta en el **scatter precio × km**, que sí obliga a hacer algo: bajarle el precio a la unidad que está arriba de la banda.

*(No se acredita como "eliminado" el strip de stat-tiles: nunca se iba a usar, porque el KPI ya es el odómetro. El abogado del diablo lo marcó como eliminado falso.)*

## Constantes de dominio (van a `theme.ts`, ningún componente inventa un número)
```
aging:  { fresco: 30, tibio: 60 }   // días de la unidad en la playa
lead:   { tibio: 3, frio: 7 }       // días sin contacto
sena:   { alerta: 3 }               // días para que venza la reserva
banda:  { oportunidad: -5, sobre: 5 } // % de desvío contra el precio de referencia
```
`shell/automotora.ts` los traduce a **clases literales** (`Record<Estado, string>`). Nunca `` bg-${x} ``.

## Frame-firma
El embudo con los trapecios re-escalándose mientras una ficha —patente **AB 123 CD** en stencil, precio en **USD** gigante— salta de *Seña* a *Entrega* con un pulso verde. Al lado, una seña vencida late en escarlata: `SEÑA VENCE EN −2 DÍAS`. Abajo cambia el contador `Entregadas hoy 3 → 4`. Silueta horizontal: no se confunde con el kanban vertical del taller ni con el KDS del restaurante.

Test de un segundo: **la patente argentina y el precio en dólares**. Ningún otro sistema los tiene.

## Veredicto del abogado del diablo
**PASA** — con las cuatro correcciones aplicadas: `density` → compact, `danger` → `#FB5C4C`, estrella anclada al pipeline, y las tres condiciones bloqueantes cumplidas (odómetro con aguja + redline; flip-deck como mazo apilado con reparto, no grilla; mosaico con spans heterogéneos reales).

### Diferenciación verificada
**PIEL** — vs cada sistema ya hecho:
- vs 01 inmobiliaria (light/sidebar/outlined/sharp/compact/square): mode, nav, elevation, radius, fuentes, color → **6** ✓
- vs 02 restaurante (dark/rail/raised/round/comfortable/pill): nav, elevation, radius, density, fuentes, color → **6** ✓
- vs 03 barbería (light/topbar/flat/soft/comfortable/square): mode, density, badge, fuentes, color → **5** ✓ *(con `comfortable` eran 2: vetado y corregido)*
- vs 04 gimnasio (dark/sidebar/outlined/sharp/compact/pill): nav, elevation, radius, fuentes, color → **5** ✓
- vs 05 taller (light/rail/flat/sharp/compact/square): mode, nav, radius, badge, fuentes, color → **6** ✓

**ESQUELETO** — cinco arquetipos nuevos aportados al catálogo (`mosaico-mando`, `embudo-lanes-conversion`, `ficha-flip-deck`, `panel-odometro`, `scatter-precio-km`), muy por encima del mínimo de 2 · combo KPI + gráfico único · estrella (`spec-comparator-drag`) que nadie tiene · eliminado real (feed cronológico) · cero imágenes de producto.

---

## Nota 2026-10-11 · Decisión de Lucas: más profesional, sin decoración animada
Pidió que los sistemas se vean "más profesionales, como sistemas normales, tipo dashboard-CRM", sin animaciones decorativas, y que se corrija todo lo que dejó la crítica de Impeccable. **La identidad no se rediseña**: paleta, tipografía (Chakra Petch + Figtree), palancas, patente stencil y precio en USD siguen igual. Cambió esto:

**Movimiento.** Sacado: el flip 3D y el "reparto" de la carta del catálogo, el barrido de la aguja del odómetro, el latido de la seña vencida, la entrada con desplazamiento de las fichas del embudo, y en el comparador el rebote del slot, el destello de la celda ganadora y la caída del ribbon. Queda solo lo que provoca el usuario: cambios de color en hover y foco, y una transición corta (200 ms) del ancho de los trapecios al mover una ficha. La seña vencida se distingue por rótulo ("Seña vencida · hace N días"), ícono de alerta, color rojo y borde rojo.

**Catálogo.** El arquetipo `ficha-flip-deck` (mazo con vuelta 3D) se reemplazó por una lista de unidades (buscador, chips de estado, filtros) y una **ficha lateral** por unidad con la patente stencil, el precio en USD gigante, todos los datos técnicos y acciones de demo. La firma visual (patente + USD) se mudó de la carta a la ficha.

**Ficha en ventas y contactos.** Cada boleto y cada contacto abre su ficha con todos los campos y acciones de demo (nada se guarda). Pipeline y mensajes ya eran flujo operativo y no la llevan.

**Estados y color.** Un color por significado, y el rojo reservado para vencido/frío/sobrevaluado:
| Estado de unidad | Chip |
|---|---|
| disponible | success |
| reservada | warning |
| señada | primary (igual que la etapa "Seña" del embudo) |
| en preparación | info |
| vendida | neutro: texto `fg` sobre `fg/10` (ver excepción) |

El magenta del acento ya no se usa en ningún estado (se parecía al rojo de la seña vencida); queda para el foco, las insignias de mensajes sin leer y el canal "referido". Una seña vigente es un dato en gris (borde neutro), no una alerta: solo "por vencer" (ámbar) y "vencida" (rojo) llaman la atención. Una oportunidad entregada y una unidad vendida no muestran temperatura ni días en stock: muestran "—". Un contacto que ya compró es cliente y tampoco tiene temperatura.

**Excepción de gris para "vendida" (pedida acá, como exige la regla de `CLAUDE.md` §9):** la unidad vendida ya salió de la playa, es un estado neutro por diseño. Cumple las tres condiciones: texto `fg` sobre fondo `fg/10` (más de 10:1), lleva rótulo de texto "vendida" y está pedida en este documento.

**Datos.** Los boletos ahora apuntan a su propia unidad vendida (antes repetían unidades que seguían "disponibles", y dos boletos cobrados compartían patente). El catálogo suma 17 unidades vendidas (47 en total, 18 vendidas con la que ya había). Los diales y el resumen del tablero se calculan desde las demás listas en vez de estar escritos a mano. "Señas activas" pasó a "Señas vigentes" (no contaba la vencida aparte). Dos clientes del embudo se llamaban como vendedores y se renombraron.

**Mobile.** El menú superior tiene degradé en el borde cuando hay más secciones y centra la pestaña activa; el tablero y las listas muestran los indicadores en una fila compacta y el buscador con los chips de estado primero (en el catálogo, el resto de los filtros va en un botón "Filtros (n)"). En mensajes se ve un panel por vez. Todo texto con datos mide 12 px o más (el gráfico de precio × km toma el ancho real de su tarjeta para que sus ejes midan 12 px).
