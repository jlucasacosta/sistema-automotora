# VÉRTICE — Sistema para automotoras

Un sistema de gestión para concesionarias: el embudo de venta donde el ancho de cada etapa es la cantidad de oportunidades, un comparador de unidades que se arma arrastrando fichas, y un gráfico de precio contra kilometraje que muestra qué auto está mal precificado. Un sistema demo hecho con Next.js.

> Es un demo **frontend** con datos de ejemplo (mock). No tiene backend conectado: sirve para ver cómo se ve y cómo funciona un sistema así, y para aprender a construirlo.

---

## Demo en vivo
👉 (pendiente de deploy)

## Sumate a la comunidad (gratis)

Estás aprendiendo a crear sistemas como este con Claude Code, entrá a la comunidad gratuita de WhatsApp. Ahí comparto cómo se hacen desde cero.

👉 https://chat.whatsapp.com/DExFTzgVMO5Ka9BG1cShDH

---

## Qué incluye
- Tablero: el **panel de odómetros** (diales con aguja y zona redline) y el **corredor de precio × kilometraje**, donde cada unidad es un punto y las que están arriba de la banda son las que no se venden
- Embudo: las oportunidades en trapecios que se **angostan y se re-escalan** al mover una ficha, con la seña vencida latiendo en rojo
- **Comparador de unidades**: se arrastran hasta tres autos a la bandeja y la tabla marca la celda ganadora de cada spec
- Playa: el catálogo como un **mazo de cartas** — se reparte una unidad al tope y se le da vuelta para ver la ficha técnica
- Ventas: boletos de compraventa con seña, saldo, forma de pago y comisión
- Mensajes: cada hilo atado a una unidad
- Leads: el CRM con la temperatura de cada contacto
- Configuración

## Requisitos (instalá esto primero)

Necesitás dos programas gratis en tu computadora:

1. **Node.js** (versión 18 o mayor). Descargalo en https://nodejs.org y elegí la opción **LTS**.
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

## Te trabaste

Si algo no te salió, preguntá en la comunidad:

👉 https://chat.whatsapp.com/DExFTzgVMO5Ka9BG1cShDH
