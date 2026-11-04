let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

interface ToneOptions {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
  delay?: number;
  glideTo?: number;
}

function playTone(ctx: AudioContext, opts: ToneOptions) {
  const { frequency, duration, type = 'sine', volume = 0.15, delay = 0, glideTo } = opts;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);

  if (glideTo) {
    osc.frequency.exponentialRampToValueAtTime(glideTo, ctx.currentTime + delay + duration);
  }

  gain.gain.setValueAtTime(0, ctx.currentTime + delay);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration + 0.02);
}

export function playSound(name: 'send' | 'click') {
  const ctx = getCtx();
  if (!ctx) return;

  if (name === 'send') {
    playTone(ctx, { frequency: 520, glideTo: 880, duration: 0.12, type: 'sine', volume: 0.12 });
    playTone(ctx, { frequency: 1040, duration: 0.06, type: 'sine', volume: 0.06, delay: 0.1 });
  }

  if (name === 'click') {
    playTone(ctx, { frequency: 380, glideTo: 560, duration: 0.08, type: 'triangle', volume: 0.1 });
  }
}
