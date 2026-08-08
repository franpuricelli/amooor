import type { Metadata } from "next";
import LegalPage, { type LegalContent } from "@/components/marketing/LegalPage";
import marketing from "@/lib/marketing";

export const metadata: Metadata = {
  title: "Privacidad — amooor",
  description: "Cómo amooor cuida tus datos y los de tu pareja.",
};

const content: LegalContent = {
  title: "Política de privacidad",
  updated: "Última actualización: agosto de 2026",
  intro:
    "En amooor tratamos tus recuerdos con el mismo cuidado con el que los guardarías vos. Esta política explica qué datos usamos, para qué, y qué control tenés sobre ellos.",
  sections: [
    {
      heading: "Qué datos recopilamos",
      body: [
        "Datos que nos das en el wizard: nombres, fechas, textos sobre su historia y las fotos o videos que subís para armar el sitio.",
        "Datos de cuenta y pago: tu email y la información mínima necesaria para procesar el pago único. El pago lo procesa nuestro proveedor; no guardamos los datos completos de tu tarjeta.",
        "Datos técnicos básicos: información del navegador y del uso del sitio para que todo funcione y podamos mejorarlo.",
      ],
    },
    {
      heading: "Para qué usamos tus datos",
      body: [
        "Para generar, publicar y alojar tu sitio de aniversario, y para darte soporte.",
        "Para enviarte mensajes relacionados con tu compra, como el acceso a tu sitio o novedades importantes del servicio.",
        "No vendemos tus datos ni tus fotos a terceros, y nunca los usamos para publicidad de otras empresas.",
      ],
    },
    {
      heading: "Dónde se guardan",
      body: [
        "El contenido de tu sitio y tus archivos se almacenan en proveedores de infraestructura con estándares de seguridad de la industria. Las fotos y videos se sirven desde almacenamiento cifrado en tránsito.",
        "Tu sitio es público solo si vos compartís el enlace. Podés pedir que lo pongamos como privado o que lo demos de baja cuando quieras.",
      ],
    },
    {
      heading: "Tus derechos",
      body: [
        "Podés pedir acceso, corrección o eliminación de tus datos y de tu sitio escribiéndonos a hola@amooor.com.",
        "Si eliminás tu sitio, borramos el contenido asociado dentro de un plazo razonable, salvo lo que debamos conservar por obligaciones legales o contables.",
      ],
    },
    {
      heading: "Contacto",
      body: [
        "Ante cualquier duda sobre tus datos, escribinos a hola@amooor.com y te respondemos a la brevedad.",
      ],
    },
  ],
};

export default function Privacidad() {
  return <LegalPage content={content} marketing={marketing} />;
}
