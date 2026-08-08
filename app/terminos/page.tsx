import type { Metadata } from "next";
import LegalPage, { type LegalContent } from "@/components/marketing/LegalPage";
import marketing from "@/lib/marketing";

export const metadata: Metadata = {
  title: "Términos — amooor",
  description: "Los términos y condiciones del servicio de amooor.",
};

const content: LegalContent = {
  title: "Términos y condiciones",
  updated: "Última actualización: agosto de 2026",
  intro:
    "Estos términos regulan el uso de amooor. Al crear un sitio con nosotros, aceptás lo que sigue. Los escribimos en simple, sin letra chica escondida.",
  sections: [
    {
      heading: "El servicio",
      body: [
        "amooor te permite crear un sitio de aniversario personalizado a partir de tus respuestas, fotos y videos. El resultado se publica en un subdominio nombre.amooor.com o, como opción, en tu propio dominio .love.",
        "Hacemos todo lo posible para que tu sitio esté siempre online, pero el servicio se ofrece tal cual está disponible, sin garantías de disponibilidad ininterrumpida.",
      ],
    },
    {
      heading: "Pago único",
      body: [
        "El precio de cada plan es un pago único por sitio, sin suscripción ni costos mensuales. El alojamiento está incluido sin límite de tiempo.",
        "El dominio .love propio es un adicional opcional: el primer año está incluido y la renovación anual corre por tu cuenta.",
      ],
    },
    {
      heading: "Tu contenido",
      body: [
        "Vos seguís siendo dueño de las fotos, videos y textos que subís. Nos das permiso únicamente para procesarlos, generarlos y mostrarlos dentro de tu sitio.",
        "Te comprometés a subir solo contenido sobre el que tenés derechos y a no publicar material ilegal, ofensivo o de terceros sin su consentimiento.",
      ],
    },
    {
      heading: "Reembolsos",
      body: [
        "Como cada sitio se genera a medida, los reembolsos se evalúan caso por caso. Si algo no salió como esperabas, escribinos y buscamos una solución.",
      ],
    },
    {
      heading: "Cambios en los términos",
      body: [
        "Podemos actualizar estos términos para reflejar mejoras del servicio o cambios legales. Si el cambio es importante, te avisamos por los medios de contacto que tengamos.",
        "Ante cualquier consulta, escribinos a hola@amooor.com.",
      ],
    },
  ],
};

export default function Terminos() {
  return <LegalPage content={content} marketing={marketing} />;
}
