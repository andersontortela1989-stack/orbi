import { useEffect, useRef, useState } from 'react';
import { useGame } from '../store/useGame.js';
import { Orbi } from './Orbi.jsx';

/**
 * Órbi companheiro — aparece nos MOMENTOS certos, com a pose certa, e some.
 *
 * Não é um mascote permanente (guard-rail TEA+TDAH: "uma coisa por vez", sem
 * poluir o HUD). Fica escondido durante o trajeto — quem guia ali é o banner do
 * GPS. O Órbi entra só nos beats emocionais e se recolhe:
 *
 *   • COMEMORANDO  — quando o Heitor chega no destino do GPS (missão concluída)
 *                    ou abastece a quantidade certa no posto.
 *   • CURIOSO→PARADO — quando uma missão nova aparece ("olha, um lugar novo!"),
 *                    segura curioso e depois se acalma antes de sumir.
 *
 * Detecção por BORDA via useGame.subscribe(state, prev) — sem tocar em nenhuma
 * lógica de missão/economia, só observa o estado:
 *   - missão concluída:   prev.missao.concluida false → true
 *   - abasteceu certo:    habilidades.contagem.acertos subiu (o RefuelPanel
 *                         registra isso exatamente no acerto; começa em 0,
 *                         então nunca dispara no boot)
 *   - missão nova:        missao.destino mudou e não está concluída
 *
 * Eventos sobrescrevem o anterior (o último beat vence): ao chegar, comemora;
 * ~2,2s depois o MissionController sorteia a próxima e o destino muda → curioso.
 *
 * Canto inferior-direito (livre: HUD é sup-esq, banner sup-centro, posto
 * inf-centro, dica inf-esq). Decorativo: pointer-events none. Movimento contido,
 * gated em prefers-reduced-motion via CSS.
 */

const COMEMORA_MS = 2400; // segura a comemoração (sobrescrita pela missão nova)
const CURIOSO_MS = 2400; // segura curioso antes de se acalmar
const PARADO_MS = 900; // respiro "parado" antes de sumir

export function OrbiCompanion() {
  const [pose, setPose] = useState('parado');
  const [visivel, setVisivel] = useState(false);
  const hideTO = useRef(null);
  const settleTO = useRef(null);

  useEffect(() => {
    const mostrar = (novaPose, holdMs) => {
      clearTimeout(hideTO.current);
      clearTimeout(settleTO.current);
      setPose(novaPose);
      setVisivel(true);

      if (novaPose === 'curioso') {
        // segura curioso → acalma pra parado → some
        settleTO.current = setTimeout(() => setPose('parado'), holdMs);
        hideTO.current = setTimeout(() => setVisivel(false), holdMs + PARADO_MS);
      } else {
        hideTO.current = setTimeout(() => setVisivel(false), holdMs);
      }
    };

    const unsub = useGame.subscribe((s, p) => {
      // 1) chegou no destino (missão concluída)
      if (!p.missao?.concluida && s.missao?.concluida) {
        mostrar('comemorando', COMEMORA_MS);
        return;
      }
      // 2) abasteceu a quantidade certa (contagem registrada)
      if (s.habilidades.contagem.acertos > p.habilidades.contagem.acertos) {
        mostrar('comemorando', COMEMORA_MS);
        return;
      }
      // 3) missão nova apareceu (destino mudou, ainda não concluída)
      if (
        s.missao?.destino &&
        s.missao.destino !== p.missao?.destino &&
        !s.missao.concluida
      ) {
        mostrar('curioso', CURIOSO_MS);
      }
    });

    return () => {
      unsub();
      clearTimeout(hideTO.current);
      clearTimeout(settleTO.current);
    };
  }, []);

  return (
    <div
      className={
        'orbi-companion' +
        (visivel ? ' is-visible' : '') +
        (pose === 'comemorando' ? ' is-celebrating' : '')
      }
    >
      <Orbi pose={pose} />
    </div>
  );
}
