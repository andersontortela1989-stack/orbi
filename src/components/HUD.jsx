import { useGame } from '../store/useGame.js';

/**
 * HUD 2D — overlay React sobre o <Canvas>.
 *
 * Camadas:
 *  - Painel inferior-esquerdo: 🪙 moedas + ⛽ barra de combustível.
 *  - Faixa superior-central: pedido da missão ativa ("QUERO HOSPITAL") OU
 *    confirmação de chegada ("CHEGAMOS!") — UMA por vez, sem competir.
 *
 * Guard-rail TEA: poucas informações, alto contraste, CAIXA ALTA, sem botões.
 */
export function HUD() {
  const moedas = useGame((s) => s.moedas);
  const combustivel = useGame((s) => s.combustivel);
  const missao = useGame((s) => s.missao);
  const pct = Math.max(0, Math.min(100, combustivel));

  const gpsAtiva   = missao?.tipo === 'gps' && missao.destino && !missao.concluida;
  const gpsAcabou  = missao?.tipo === 'gps' && missao.destino &&  missao.concluida;

  return (
    <>
      {gpsAtiva && (
        <div className="mission-banner mission-banner--ativa" role="status">
          QUERO {missao.destino}
        </div>
      )}
      {gpsAcabou && (
        <div className="mission-banner mission-banner--ok" role="status">
          ✓ CHEGAMOS!
        </div>
      )}

      <div className="hud" aria-live="polite">
        <div className="hud-row">
          <span className="hud-icon" aria-hidden="true">🪙</span>
          <span className="hud-value">{moedas}</span>
        </div>

        <div className="hud-row">
          <span className="hud-icon" aria-hidden="true">⛽</span>
          <div
            className="hud-bar"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={Math.round(pct)}
            aria-label="combustível"
          >
            <div className="hud-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    </>
  );
}
