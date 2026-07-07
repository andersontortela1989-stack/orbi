/**
 * Sons curtos sintetizados via Web Audio — sem dependência de arquivos.
 * Filosofia (guard-rail TEA+TDAH):
 *   - sucesso → notas claras, ascendentes, alegres (comemora);
 *   - moeda   → "ting" curto e agradável;
 *   - neutro  → tom único curto e BAIXO de volume (feedback de erro sem punir).
 */

let ctx = null;

function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  // Browsers suspendem o AudioContext até a primeira interação
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tom({ freq = 800, dur = 0.15, type = 'sine', gain = 0.18, delay = 0 }) {
  const a = getCtx();
  if (!a) return;
  const t0 = a.currentTime + delay;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(g);
  g.connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur);
}

/** "Ting-tong" rápido de moeda — sobe uma quinta. */
export function somMoeda() {
  tom({ freq: 880,  dur: 0.10, type: 'triangle', gain: 0.18 });
  tom({ freq: 1320, dur: 0.15, type: 'triangle', gain: 0.18, delay: 0.08 });
}

/** Acorde maior ascendente (C-E-G) — pequena vitória. */
export function somSucesso() {
  [523.25, 659.25, 783.99].forEach((f, i) => {
    tom({ freq: f, dur: 0.20, type: 'triangle', gain: 0.18, delay: i * 0.09 });
  });
}

/** Tom único curto e baixo — feedback de erro SEM ser punitivo. */
export function somNeutro() {
  tom({ freq: 440, dur: 0.08, type: 'sine', gain: 0.10 });
}

/** Tique curto e suave — marca cada litro contado ao abastecer (Fatia 5). */
export function somTique() {
  tom({ freq: 660, dur: 0.07, type: 'sine', gain: 0.12 });
}

/** Buzina simpática — "bip-bip" de duas notas curtas e SUAVES (triangle, sem
 *  grave alto nem susto; régua sensorial). ~300ms total. */
export function somBuzina() {
  tom({ freq: 520, dur: 0.13, type: 'triangle', gain: 0.15 });
  tom({ freq: 415, dur: 0.15, type: 'triangle', gain: 0.15, delay: 0.15 });
}
