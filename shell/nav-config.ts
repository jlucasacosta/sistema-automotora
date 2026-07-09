import { Gauge, Filter, Car, ReceiptText, MessageSquare, Users, Settings, type LucideIcon } from "lucide-react"

export type NavItem = { label: string; href: string; icon: LucideIcon }

// El pipeline va segundo pero es la pantalla que manda (ver DISENO.md): el vendedor
// vive ahi. "Playa" es el catalogo: en la jerga, las unidades estan en la playa.
export const nav: NavItem[] = [
  { label: "Panel", href: "/dashboard", icon: Gauge },
  { label: "Pipeline", href: "/pipeline", icon: Filter },
  { label: "Catalogo", href: "/catalogo", icon: Car },
  { label: "Ventas", href: "/ventas", icon: ReceiptText },
  { label: "Mensajes", href: "/conversaciones", icon: MessageSquare },
  { label: "Contactos", href: "/contactos", icon: Users },
  { label: "Configuracion", href: "/config", icon: Settings },
]
