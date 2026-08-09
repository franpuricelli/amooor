// ─────────────────────────────────────────────────────────────────────────────
//  deepgram-client.ts — helper de BROWSER para dictado por voz (STT).
//
//  UX (feedback): mientras se habla NO se muestra el transcript escribiéndose.
//  El micrófono TERMINA la grabación y envía directo; una cruz CANCELA. Durante
//  la grabación exponemos el NIVEL de audio (getLevel 0..1) para dibujar un
//  waveform que reacciona a la voz. Cap técnico ~5 min.
//
//  Flujo (Q15): token efímero de /api/deepgram/token → WS directo a Nova-3 (auth
//  por subprotocolo). La key real no toca el browser (salvo el fallback dev).
// ─────────────────────────────────────────────────────────────────────────────

const DG_WS_URL =
  "wss://api.deepgram.com/v1/listen" +
  "?model=nova-3&language=multi&smart_format=true&interim_results=true&punctuate=true";

/** Cap técnico de grabación (~5 min). */
export const MAX_RECORDING_MS = 5 * 60 * 1000;

export type StopReason = "finish" | "cancel" | "timeout" | "error";

export interface DeepgramCallbacks {
  onError: (message: string) => void;
  /** Se cortó. En "finish"/"timeout" viene el transcript final para enviar directo. */
  onStop: (reason: StopReason, finalText: string) => void;
  onOpen?: () => void;
}

export interface DeepgramSession {
  /** Terminar y enviar (mic). Entrega el transcript por onStop("finish", …). */
  finish: () => void;
  /** Cancelar y descartar (cruz). onStop("cancel", ""). */
  cancel: () => void;
  /** Nivel de audio 0..1 para el waveform (polleado por requestAnimationFrame). */
  getLevel: () => number;
}

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const c = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
  return c.find((t) => MediaRecorder.isTypeSupported(t));
}

/** Corta una promesa que puede colgarse (p.ej. getUserMedia sin respuesta). */
function withTimeout<T>(p: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    ),
  ]);
}

export async function startDeepgram(
  cb: DeepgramCallbacks
): Promise<DeepgramSession> {
  // 1) token efímero (server mintea; la key real no viaja, salvo fallback dev).
  const tokenRes = await fetch("/api/deepgram/token", { method: "POST" });
  if (!tokenRes.ok) {
    throw new Error(
      tokenRes.status === 500
        ? "El dictado no está configurado (falta DEEPGRAM_API_KEY)."
        : "No pude iniciar el dictado. Probá de nuevo."
    );
  }
  const { access_token } = await tokenRes.json();
  if (!access_token) throw new Error("Token de dictado inválido.");

  // 2) micrófono (con timeout: en algunos entornos getUserMedia se cuelga).
  const mediaStream = await withTimeout(
    navigator.mediaDevices.getUserMedia({ audio: true }),
    12000,
    "No pude acceder al micrófono. Revisá los permisos del navegador."
  );

  // 3) medidor de nivel (Web Audio) para el waveform.
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const audioCtx = new AudioCtx();
  const source = audioCtx.createMediaStreamSource(mediaStream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;
  source.connect(analyser);
  const buf = new Uint8Array(analyser.fftSize);
  const getLevel = () => {
    analyser.getByteTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) {
      const v = (buf[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / buf.length); // 0..~1
    return Math.min(1, rms * 3.2); // escala para que se sienta receptivo
  };

  // 4) WS directo a Deepgram.
  const recorder = (() => {
    const m = pickMimeType();
    return new MediaRecorder(mediaStream, m ? { mimeType: m } : undefined);
  })();
  const ws = new WebSocket(DG_WS_URL, ["token", access_token]);

  let finalText = "";
  let interim = "";
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  // Si el WS no abre en ~10s, no dejamos el mic colgado "iniciando".
  let openTimer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
    cb.onError("No pude conectar el dictado. Probá de nuevo.");
    stop("error");
  }, 10000);

  const teardown = () => {
    if (timer) clearTimeout(timer);
    if (openTimer) clearTimeout(openTimer);
    try {
      if (recorder.state !== "inactive") recorder.stop();
    } catch {}
    mediaStream.getTracks().forEach((t) => t.stop());
    void audioCtx.close().catch(() => {});
  };

  const stop = (reason: StopReason) => {
    if (stopped) return;
    stopped = true;
    const text = reason === "cancel" ? "" : (finalText + " " + interim).trim();
    teardown();
    try {
      if (ws.readyState === WebSocket.OPEN) {
        if (reason !== "cancel") ws.send(JSON.stringify({ type: "CloseStream" }));
      }
      ws.close();
    } catch {}
    cb.onStop(reason, text);
  };

  ws.onopen = () => {
    if (openTimer) {
      clearTimeout(openTimer);
      openTimer = null;
    }
    cb.onOpen?.();
    recorder.start(250);
    timer = setTimeout(() => stop("timeout"), MAX_RECORDING_MS);
  };
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) ws.send(e.data);
  };
  ws.onmessage = (evt) => {
    let msg: any;
    try {
      msg = JSON.parse(evt.data);
    } catch {
      return;
    }
    if (msg.type !== "Results") return;
    const text: string = msg.channel?.alternatives?.[0]?.transcript ?? "";
    if (!text) return;
    if (msg.is_final) {
      finalText = (finalText + " " + text).trim();
      interim = "";
    } else {
      interim = text;
    }
  };
  ws.onerror = () => {
    cb.onError("Se cortó la conexión con el dictado.");
    stop("error");
  };

  return {
    finish: () => stop("finish"),
    cancel: () => stop("cancel"),
    getLevel,
  };
}
