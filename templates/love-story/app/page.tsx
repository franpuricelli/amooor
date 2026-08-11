import SmoothScroll from "@/components/SmoothScroll";
import RevealInit from "@/components/RevealInit";
import LightboxProvider from "@/components/Lightbox";
import HeartCursor from "@/components/HeartCursor";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Historia from "@/components/sections/Historia";
import Viajes from "@/components/sections/Viajes";
import Cocina from "@/components/sections/Cocina";
import Momentos from "@/components/sections/Momentos";
import Pelis from "@/components/sections/Pelis";
import Galeria from "@/components/sections/Galeria";
import Footer from "@/components/Footer";
import { I18nProvider, LangSwitch } from "@/lib/i18n";

export default function Home() {
  return (
    <I18nProvider>
      <LangSwitch />
      <SmoothScroll>
        <LightboxProvider>
          <RevealInit />
          <HeartCursor />
          <Nav />
          <main>
            {/* the story, in order: meet → fall in love → move in → travel… */}
            <Hero />
            <Historia />
            <Viajes />
            <Cocina />
            <Momentos />
            <Pelis />
            <Stats />
            <Galeria />
          </main>
          <Footer />
        </LightboxProvider>
      </SmoothScroll>
    </I18nProvider>
  );
}
