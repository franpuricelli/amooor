import Chat from "@/components/chat/Chat";

// El onboarding (rediseño chat-first). Vive en /comenzar; el CTA de marketing
// entra acá. El wizard viejo (components/wizard/*) queda conservado fuera de ruta
// para reusarlo en la ejecución post-pago (próxima versión).
export const dynamic = "force-dynamic";

export default function ComenzarPage() {
  return <Chat />;
}
