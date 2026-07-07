import { useEffect } from 'react';
import { somBuzina } from '../audio/sons.js';

/**
 * BUZINA — tecla B (desktop) e botão BUZINA do TouchControls (mobile, que
 * dispara o MESMO KeyboardEvent 'KeyB'). Um listener só, os dois caminhos.
 *
 * Pode buzinar à vontade (sem cooldown punitivo — régua TEA); só um THROTTLE
 * técnico de 250ms evita sobrepor o áudio quando spammada. `e.repeat` filtra o
 * auto-repeat do teclado segurado (uma buzina por toque, não uma rajada).
 *
 * Componente de lógica pura (retorna null): não desenha nada, não toca física
 * nem save — só ouve a tecla e chama o som sintetizado (audio/sons.js).
 */
const THROTTLE_MS = 250;

export function Buzina() {
  useEffect(() => {
    let ultima = 0;
    const onKey = (e) => {
      if (e.code !== 'KeyB' || e.repeat) return;
      const agora = performance.now();
      if (agora - ultima < THROTTLE_MS) return;
      ultima = agora;
      somBuzina();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return null;
}
