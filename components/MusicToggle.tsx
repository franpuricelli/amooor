"use client";

import { useEffect, useRef, useState } from "react";
import { useContent } from "@/lib/tenant";
import { usePhotos } from "@/lib/photos-context";

/**
 * The "❤ Puri & Ivi" navbar pill doubles as the music control: the song starts
 * when you enter the site (or on the first interaction if the browser blocks
 * autoplay) and clicking the pill toggles play/pause. While it plays, the
 * heart beats with the actual audio (Web Audio analyser on the bass bins).
 */
export default function MusicToggle({ label }: { label: string }) {
  const content = useContent();
  const { music, media } = content;
  const { audio: audioUrl } = usePhotos();
  // Si el tenant subió su propia canción, la usamos; si no, la de la librería que
  // haya elegido. Sin ninguna de las dos NO hay música: el sitio no puede caer a
  // la canción de la demo (el default de lib/content.ts).
  const src =
    media?.audioUrl && media.audioUrl.length > 0
      ? media.audioUrl
      : music.cat && music.slug
        ? audioUrl(music.cat, music.slug)
        : "";
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const heartRef = useRef<HTMLSpanElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!src) return; // sin canción: la pill queda como marca, sin audio
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.55;
    audio.preload = "auto";
    audioRef.current = audio;

    let raf = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Route the audio through an analyser so the heart can follow the beat.
    const setupAnalyser = () => {
      if (analyserRef.current || reduced) return;
      try {
        const ctx = new AudioContext();
        const src = ctx.createMediaElementSource(audio);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.55;
        src.connect(analyser);
        analyser.connect(ctx.destination);
        analyserRef.current = analyser;

        const data = new Uint8Array(analyser.frequencyBinCount);
        let smooth = 0;
        let base = 0; // slow-moving baseline of sustained energy
        let peak = 0.05; // running peak of the *transients*, for auto-gain
        const loop = () => {
          analyser.getByteFrequencyData(data);
          // average the lowest bins — that's where the piano/bass pulse lives
          let sum = 0;
          const n = 10;
          for (let i = 0; i < n; i++) sum += data[i];
          const level = audio.paused ? 0 : sum / (n * 255);
          // Beat = level ABOVE the sustained baseline. A held chord raises the
          // baseline and the heart settles back down; only new hits pop.
          base += (level - base) * 0.025;
          const onset = Math.max(0, level - base);
          peak = Math.max(peak * 0.995, onset, 0.03);
          const pulse = Math.pow(Math.min(1, onset / peak), 1.6);
          // fast attack, quicker release so it visibly drops in the silences
          smooth += (pulse - smooth) * (pulse > smooth ? 0.75 : 0.28);
          if (heartRef.current) {
            heartRef.current.style.transform = `scale(${1 + smooth * 0.95})`;
          }
          raf = requestAnimationFrame(loop);
        };
        loop();
      } catch {
        /* Web Audio unavailable — the heart just stays still */
      }
    };

    // Browsers block audible autoplay until the user interacts with the page,
    // so we try immediately and then retry on ANY first gesture — click, key,
    // touch, wheel or scroll — plus when the tab becomes visible again.
    const EVENTS: [string, EventTarget][] = [
      ["pointerdown", window],
      ["keydown", window],
      ["touchstart", window],
      ["wheel", window],
      ["scroll", window],
      ["visibilitychange", document],
    ];
    const cleanup = () => {
      EVENTS.forEach(([ev, t]) => t.removeEventListener(ev, onFirst));
    };
    const tryPlay = () => {
      audio
        .play()
        .then(() => {
          setupAnalyser();
          setPlaying(true);
          cleanup();
        })
        .catch(() => {
          /* autoplay blocked — keep waiting for a gesture */
        });
    };
    const onFirst = (e: Event) => {
      // the pill itself has its own toggle handler — don't double-trigger
      if ((e.target as HTMLElement | null)?.closest?.(".nav-logo")) return;
      tryPlay();
    };

    tryPlay();
    EVENTS.forEach(([ev, t]) => t.addEventListener(ev, onFirst, { passive: true }));

    return () => {
      cleanup();
      cancelAnimationFrame(raf);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [src]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play()
        .then(() => setPlaying(true))
        .catch(() => {});
    } else {
      a.pause();
      setPlaying(false);
    }
  };

  return (
    <button
      className={`nav-logo ${playing ? "playing" : ""}`}
      onClick={toggle}
      aria-label={playing ? music.pauseLabel : music.playLabel}
      title={playing ? music.pauseLabel : music.playLabel}
    >
      <span ref={heartRef} className="nav-heart" aria-hidden>
        ❤
      </span>
      {label}
    </button>
  );
}
