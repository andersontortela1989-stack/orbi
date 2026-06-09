import { useGame } from '../store/useGame.js';
import { LIMIAR_BAIXO, postoAtivo } from '../economia.js';

/**
 * HUD 2D — overlay React sobre o <Canvas>.
 *
 * Camadas:
 *  - Painel inferior-esquerdo: 🪙 moedas + ⛽ barra de combustível
 *    (a barra fica âmbar quando o combustível está baixo — aviso calmo, sem
 *    vermelho de alarme).
 *  - Faixa superior-central: UMA instrução por vez, com prioridade:
 *      1) tanque vazio (e fora do posto) → "ACABOU! ME LEVA NO POSTO?"
 *      2) pedido da missão de GPS ("HOSPITAL?")
 *      3) confirmação de chegada ("CHEGAMOS!")
 *    Quando o painel de abastecer está aberto, a faixa some — o foco é abastecer.
 *    Tom (adendo de narrativa): o banner fica CURTO pela legibilidade; quem
 *    carrega a personalidade do Órbi-curioso é a VOZ ("O que é hospital?
 *    Vamos ver?"). "HOSPITAL?" é a curiosidade dele em forma de palavra única.
 *
 * Guard-rail TEA: poucas informações, alto contraste, CAIXA ALTA, sem botões,
 * sempre UMA instrução prioritária por vez.
 */
export function HUD() {
  const moedas = useGame((s) => s.moedas);
  const combustivel = useGame((s) => s.combustivel);
  const missao = useGame((s) => s.missao);
  const pct = Math.max(0, Math.min(100, combustivel));

  // Estados da economia (Fatia 5)
  // `abastecendo` (painel aberto) vem do MESMO seletor que o RefuelPanel usa —
  // fonte única da verdade, pra banner e painel nunca desincronizarem.
  const abastecendo = useGame((s) => postoAtivo(s.combustivel, s.postoPerto));
  const vazio = combustivel <= 0;
  const baixo = combustivel <= LIMIAR_BAIXO;

  // Missão de GPS só aparece quando NÃO há aviso de combustível prioritário.
  const gpsAtiva =
    missao?.tipo === 'gps' &&
    missao.destino &&
    !missao.concluida &&
    !abastecendo &&
    !vazio;
  const gpsAcabou =
    missao?.tipo === 'gps' && missao.destino && missao.concluida && !abastecendo;

  return (
    <>
      {/* Prioridade 1: tanque vazio fora do posto — aviso calmo pra ir ao posto */}
      {vazio && !abastecendo && (
        <div className="mission-banner mission-banner--aviso" role="status">
          ⛽ ACABOU! ME LEVA NO POSTO?
        </div>
      )}

      {gpsAtiva && (
        <div className="mission-banner mission-banner--ativa" role="status">
          {missao.destino}?
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
            <div
              className={'hud-bar-fill' + (baixo ? ' hud-bar-fill--baixo' : '')}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
