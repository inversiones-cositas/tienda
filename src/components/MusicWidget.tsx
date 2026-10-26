import { useEffect, useRef, useState } from "react";
import { useCart } from "../context/CartContext";

/**
 * Caja de música lo-fi de Cositas: loop de acordes suaves sintetizado con
 * Web Audio (sin archivos ni licencias), ruido de vinilo y volumen bajo.
 * Solo suena si el visitante pulsa Play: discreto y no invasivo.
 */

// Progresión suave I–vi–IV–V en Do mayor: dulce y lo-fi.
const CHORDS: number[][] = [
  [261.63, 329.63, 392.0, 493.88], // Cmaj7
  [220.0, 261.63, 329.63, 392.0], // Am7
  [174.61, 261.63, 349.23, 440.0], // Fmaj7
  [196.0, 246.94, 293.66, 349.23], // G7
];

const PATTERN = [0, 1, 2, 3, 2, 1, 3, 2];
const STEPS_PER_CHORD = 16;
const STEP_SECONDS = 0.32; // encantador: rápido pero suave

export function MusicWidget() {
  const { items } = useCart();
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const noiseRef = useRef<AudioBufferSourceNode | null>(null);
  const timeRef = useRef(0);
  const stepRef = useRef(0);

  useEffect(() => {
    return () => {
      stopAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopAudio() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    noiseRef.current?.stop();
    noiseRef.current = null;
    ctxRef.current?.close().catch(() => undefined);
    ctxRef.current = null;
    masterRef.current = null;
    setPlaying(false);
  }

  function startAudio() {
    const AudioCtx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) {
      setPlaying(false);
      return;
    }

    const ctx = new AudioCtx();
    ctxRef.current = ctx;
    const master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    masterRef.current = master;

    // Crackle de vinilo amoroso: chasquidos dispersos, nada más.
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() < 0.0004 ? (Math.random() - 0.5) * 0.35 : 0;
    }
    const noise = new AudioBufferSourceNode(ctx, {
      buffer: noiseBuffer,
      loop: true,
    });
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.05;
    noise.connect(noiseGain).connect(master);
    noise.start();
    noiseRef.current = noise;

    timeRef.current = ctx.currentTime + 0.15;
    stepRef.current = 0;
    timerRef.current = setInterval(scheduler, 400);
    setPlaying(true);
  }

  function scheduler() {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;

    while (timeRef.current < ctx.currentTime + 1.2) {
      const chord = CHORDS[Math.floor(stepRef.current / STEPS_PER_CHORD) % CHORDS.length];

      // Pad del acorde al empezar cada compás: calidez.
      if (stepRef.current % STEPS_PER_CHORD === 0) {
        for (const freq of chord) {
          playTone(ctx, master, freq, timeRef.current, {
            type: "sine",
            peak: 0.05,
            decay: STEPS_PER_CHORD * STEP_SECONDS,
          });
        }
      }

      // Melodía arpegiada, con brillo en el segundo compás.
      const octaveUp = stepRef.current % STEPS_PER_CHORD >= STEPS_PER_CHORD / 2;
      const note = chord[PATTERN[stepRef.current % PATTERN.length]] * (octaveUp ? 2 : 1);
      playTone(ctx, master, note, timeRef.current, {
        type: "triangle",
        peak: 0.14,
        decay: 0.5,
      });

      timeRef.current += STEP_SECONDS;
      stepRef.current += 1;
    }
  }

  function playTone(
    ctx: AudioContext,
    master: GainNode,
    freq: number,
    when: number,
    opts: { type: OscillatorType; peak: number; decay: number },
  ) {
    const osc = ctx.createOscillator();
    osc.type = opts.type;
    osc.frequency.value = freq;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1500;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.linearRampToValueAtTime(opts.peak, when + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + opts.decay);

    osc.connect(filter).connect(gain).connect(master);
    osc.start(when);
    osc.stop(when + opts.decay + 0.1);
  }

  return (
    <button
      type="button"
      onClick={playing ? stopAudio : startAudio}
      aria-pressed={playing}
      className={`fixed left-4 z-30 flex items-center gap-2 rounded-full border-2 border-line bg-surface px-4 py-2 shadow-soft [transition-property:background-color,border-color,color,transform] duration-200 hover:border-accent active:translate-y-px ${
        items.length > 0 ? "bottom-32" : "bottom-4"
      }`}
    >
      <MusicNote />
      <span className="text-xs font-bold text-ink">
        {playing ? "Pausa" : "Música Cositas"}
      </span>
      {playing && <Bars />}
    </button>
  );
}

function MusicNote() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-blossom" aria-hidden="true">
      <path d="M9 3v10.5A3.5 3.5 0 1 0 11 16V7h7V3H9z" />
    </svg>
  );
}

function Bars() {
  return (
    <span className="flex items-end gap-0.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="twinkle h-3 w-1 rounded-full bg-accent"
          style={{ animationDelay: `${i * 0.4}s` }}
        />
      ))}
    </span>
  );
}
