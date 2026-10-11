# VÉRTICE — Sistema para automotoras

Un sistema de gestión para concesionarias: el embudo de venta donde el ancho de cada etapa es la cantidad de oportunidades, un comparador de unidades que se arma arrastrando fichas, y un gráfico de precio contra kilometraje que muestra qué auto está mal precificado. Un sistema demo hecho con Next.js.

> Es un demo **frontend** con datos de ejemplo (mock). No tiene backend conectado: sirve para ver cómo se ve y cómo funciona un sistema así, y para aprender a construirlo.

---

## Demo en vivo
👉 https://sistema-automotora-demo.vercel.app

## Sumate al Club de la IA

Aprendé a crear tu Agencia de IA y conseguir tu primer cliente. Eso lo trabajamos adentro del Club de la IA, nuestro Skool privado.

👉 https://www.skool.com/club-de-la-ia-8047/about

---

## Qué incluye
- Tablero: el **panel de odómetros** (diales con aguja y zona redline, calculados desde las otras pantallas) y el **corredor de precio × kilometraje**, donde cada unidad es un punto y las que están arriba de la banda son las que no se venden
- Embudo: las oportunidades en trapecios que se **angostan y se re-escalan** al mover una ficha (arrastrándola o con las flechas del teclado); la seña vencida se marca con rótulo, ícono y borde rojo (sin animación)
- **Comparador de unidades**: se arrastran hasta tres autos a la bandeja (o se suman con un click) y la tabla marca la celda ganadora de cada spec
- Playa: el catálogo de unidades (con buscador y filtros por estado, segmento, condición y orden). Al tocar una unidad se abre su **ficha completa** con la patente, el precio en USD, la ficha técnica y acciones de demo (enviar cotización, agendar test drive, reservar)
- Ventas: boletos de compraventa; al tocar uno se abre la ficha con seña, saldo, forma de pago y comisión, y acciones de demo (registrar cobro, anular, enviar boleto)
- Mensajes: cada hilo atado a una unidad
- Leads: el CRM con la temperatura de cada contacto (los clientes que ya compraron no tienen temperatura); al tocar un contacto se abre su ficha con la oportunidad abierta
- Configuración

Todas las pantallas muestran `—` y un esqueleto fijo mientras cargan, y un aviso con **Reintentar** si la carga falla. Las acciones de las fichas son de demostración: dicen "Demo: no se guardó nada" y viven solo en memoria. En el celular, el menú superior se desliza con un degradé que avisa que hay más secciones, y el buscador y los chips de estado quedan arriba de la lista (el resto de los filtros, en un botón "Filtros").

## Requisitos (instalá esto primero)

Necesitás dos programas gratis en tu computadora:

1. **Node.js** (versión 18.18 o mayor). Descargalo en https://nodejs.org y elegí la opción **LTS**.
2. **Git**. Descargalo en https://git-scm.com

Para chequear que quedaron instalados, abrí una terminal y escribí:

    node -v
    git --version

Si te devuelven un número de versión, ya está.

## Cómo clonar y correr (paso a paso)

1. Abrí una terminal en la carpeta donde quieras guardar el proyecto.
2. Cloná el repo:

       git clone https://github.com/jlucasacosta/sistema-automotora.git

3. Entrá a la carpeta del proyecto:

       cd sistema-automotora

4. Instalá las dependencias (baja lo que el proyecto necesita):

       npm install

5. Levantá el proyecto:

       npm run dev

6. Abrí el navegador en http://localhost:3000

Listo. Vas a ver el sistema funcionando.

## Personalizarlo

Todo el diseño (colores, tipografía, nombre de la marca) vive en un solo archivo: `shell/theme.ts`. Cambiás eso y muta el sistema entero.

Probá algo concreto: en ese archivo, bajá `aging.fresco` de `30` a `10`. Media playa se pone en amarillo y rojo, porque el tablero y el catálogo leen sus umbrales de ahí. Después movele `banda.base` y mirá cómo se corre la banda del gráfico de precio y cambian las unidades marcadas como sobrevaluadas. Ningún componente tiene un número ni un color escrito a mano.

## Cambiar los datos de ejemplo

Todos los datos de ejemplo (unidades, leads, oportunidades, ventas, mensajes, diales) viven en archivos JSON, uno por módulo: `modules/<modulo>/data.json`. Editalos y guardá: el sistema se actualiza.

Son de **solo lectura**: lo que hagas en pantalla (mover una ficha, filtrar, comparar) vive únicamente en memoria, no se guarda en ningún lado, y al recargar con F5 vuelve todo a lo que dice el JSON. Los datos son ficticios (marcas, personas y teléfonos inventados).

## Estructura de carpetas

    app/            las rutas (cada una re-exporta su módulo) y los estilos globales
    shell/          la capa de diseño: theme.ts, navegación, odómetro, scatter, comparador, y las piezas compartidas carga.tsx (cargando y error) y ficha-lateral.tsx (la ficha)
    modules/        un módulo por pantalla: index.tsx, api.ts, data.json y BACKEND.md
    docs/           IMPLEMENTAR.md: la guía para llevarlo a producción
    DISENO.md       la ficha de diseño (decisiones visuales)
    .env.example    variables de entorno de ejemplo, vacías

Cada `api.ts` devuelve los datos del JSON hoy y es el único archivo que se cambia para conectar una base de datos real: se cambia el **cuerpo** de las funciones, nunca su firma.

## Llevalo a producción

Este repo es un demo: **no tiene backend conectado**. Si querés convertirlo en un sistema real, hay una guía paso a paso, en español y para principiantes: **[docs/IMPLEMENTAR.md](docs/IMPLEMENTAR.md)**. Cubre:

- **Supabase**: las tablas (SQL listo para copiar, con los nombres reales de este sistema), seguridad con RLS, datos de ejemplo y login con Supabase Auth.
- **Railway + pg-boss**: tareas automáticas, como avisar de leads fríos o de señas por vencer.
- **Vercel**: publicar el sistema con tu dominio.
- **IA (OpenAI o Gemini)**: sugerir respuestas en los mensajes, con la clave solo en el servidor.
- Un checklist de seguridad antes de usar datos reales.

## Licencia

MIT. Ver el archivo [LICENSE](LICENSE): podés usarlo, copiarlo y modificarlo libremente.

## Te trabaste

Si algo no te salió, preguntá en el Club de la IA:

👉 https://www.skool.com/club-de-la-ia-8047/about
