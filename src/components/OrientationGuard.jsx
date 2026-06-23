import { useEffect, useState } from 'react';

/**
 * TRAVA DE ORIENTAÇÃO — Frente 0 (lançamento celular).
 *
 * Em RETRATO mostra um aviso calmo e fixo e ESCONDE o jogo até virar pra
 * paisagem. NÃO usa `screen.orientation.lock()` — não funciona no iOS Safari;
 * o overlay é o baseline confiável em qualquer dispositivo. No desktop (sempre
 * paisagem) nunca dispara. Régua TEA: calmo, sem punição, o Órbi pede gentil.
 */
const consultarRetrato = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(orientation: portrait)').matches;

export function OrientationGuard() {
  const [retrato, setRetrato] = useState(consultarRetrato);

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

  if (!retrato) return null;

  return (
    <div className="orient-guard" role="alertdialog" aria-label="vire o celular">
      <div className="orient-emoji" aria-hidden="true">🔄</div>
      <div className="orient-msg">Vire o celular na horizontal pra brincar!</div>
    </div>
  );
}
