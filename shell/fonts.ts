// fonts.ts · La voz de VERTICE.
// Chakra Petch = cuadrada, de HUD de tablero. Titulos, patentes y precios en USD.
// Figtree = humanista, se banca una tabla densa sin cansar. Cuerpo.
// Chakra Petch no es variable: hay que pedirle los pesos explicitamente.
import { Chakra_Petch, Figtree } from "next/font/google"

export const headingFont = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-heading-src",
})
export const bodyFont = Figtree({ subsets: ["latin"], display: "swap", variable: "--font-body-src" })

export const fontClass = `${headingFont.variable} ${bodyFont.variable}`
