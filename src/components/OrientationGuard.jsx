import { useEffect, useState } from 'react';
import { aparelhoDeToque, deveMostrarAvisoRetrato } from '../ui/responsive.js';

/**
 * TRAVA DE ORIENTAÇÃO — Frente 0 (lançamento celular).
 *
 * Em RETRATO mostra um aviso calmo e fixo e ESCONDE o jogo até virar pra
 * paisagem. NÃO usa `screen.orientation.lock()` — não funciona no iOS Safari;
 * o overlay é o baseline confiável em qualquer dispositivo. Régua TEA: calmo,
 * sem punição, o Órbi pede gentil. Some sozinho ao virar, sem toque.
 *
 * `somenteToque` (A4.1, tela de abertura): o aviso só aparece em aparelho de
 * toque — o desktop numa janela em pé continua vendo a abertura. Sem ele
 * (jogo), vale o comportamento de antes: retrato mostra em qualquer aparelho.
 * A decisão é a função pura `deveMostrarAvisoRetrato` (ui/responsive.js).
 */
// true/false pelo matchMedia; null quando não há como saber (não mostra).
const consultarRetrato = () =>
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(orientation: portrait)').matches
    : null;

export function OrientationGuard({ somenteToque = false }) {
  const [retrato, setRetrato] = useState(consultarRetrato);
  const [tactil] = useState(aparelhoDeToque);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(orientation: portrait)');
    const upd = () => setRetrato(mq.matches);
    upd();
    // addEventListener é o moderno; addListener é o fallback (Safari antigo).
    if (mq.addEventListener) mq.addEventListener('change', upd);
    else mq.addListener(upd);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', upd);
      else mq.removeListener(upd);
    };
  }, []);

  if (!deveMostrarAvisoRetrato({ retrato, tactil, somenteToque })) return null;

  return (
    <div className="orient-guard" role="alertdialog" aria-label="vire o celular">
      <div className="orient-emoji" aria-hidden="true">🔄</div>
      <div className="orient-msg">Vire o celular na horizontal pra brincar!</div>
      <div className="orient-sub">não virou? ative o girar automático do celular 🔄</div>
    </div>
  );
}
