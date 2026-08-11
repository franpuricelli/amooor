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

export default function Home() {
  return (
    <SmoothScroll>
      <LightboxProvider>
        <RevealInit />
        <HeartCursor />
        <Nav />
        <main>
          {/* la historia, en orden: conocerse → enamorarse → mudarse → viajar… */}
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
  );
}
