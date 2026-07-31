import { useRef } from 'react';
import { useGame } from '../store/useGame.js';
import { CEUS, useCeuId, ciclarCeu } from '../ceu.js';
import { falarNoFoco } from '../activity/index.js';
import { useActivity } from '../activity/useActivity.js';
import { LIMIAR_BAIXO, postoAtivo } from '../economia.js';
import { ANIMAL_POR_SLUG } from '../missions/missoes-ciencias.js';
import { BICHO_POR_SLUG } from '../city/bichos.js';

/**
 * HUD 2D — overlay React sobre o <Canvas>.
 *
 * Camadas:
 *  - Painel inferior-esquerdo: 🪙 moedas + ⛽ barra de combustível
 *    (a barra fica âmbar quando o combustível está baixo — aviso calmo, sem
 *    vermelho de alarme).
 *  - Faixa superior-central: UMA instrução por vez, com prioridade:
 *      1) tanque vazio (e fora do posto) → "ACABOU! ME LEVA NO POSTO?"
 *      2) pedido da missão — GPS ("HOSPITAL?") ou Ciências ("🐱 VET?",
 *         Fatia 8: o emoji apresenta o bichinho sem texto extra)
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
  const atividade = useActivity();

  // Estados da economia (Fatia 5)
  // `abastecendo` (painel aberto) vem do MESMO seletor que o RefuelPanel usa —
  // fonte única da verdade, pra banner e painel nunca desincronizarem.
  const abastecendo = useGame((s) => postoAtivo(s.combustivel, s.postoPerto));
  const vazio = combustivel <= 0;
  const baixo = combustivel <= LIMIAR_BAIXO;

  // Missão (GPS ou Ciências) só aparece quando NÃO há aviso de combustível
  // prioritário. Continua UMA instrução por vez: ou aviso, ou missão — e
  // enquanto a pergunta da chegada viva está aberta, banner nenhum
  // compete com ela.
  const chegadaViva = useGame((s) => s.chegadaViva);

  const temMissao =
    (missao?.tipo === 'gps' ||
      missao?.tipo === 'ciencias' ||
      missao?.tipo === 'busca') &&
    missao.destino;
  const missaoAtiva =
    temMissao &&
    !missao.concluida &&
    !abastecendo &&
    !vazio &&
    !chegadaViva &&
    atividade.hud === 'missao';
  const missaoAcabou =
    temMissao &&
    missao.concluida &&
    !abastecendo &&
    !chegadaViva &&
    atividade.hud === 'missao';

  // Pílula da carona — prioridade abaixo do aviso de combustível (segurança
  // primeiro), acima das missões (que já somem a bordo).
  const caronaAtiva =
    atividade.hud === 'carona' && !abastecendo && !vazio && !chegadaViva;

  // Botão de céu (dia/entardecer/noite) — a criança comanda. Voz curiosa no
  // PRIMEIRO uso de cada preset na sessão (parcimônia; não repete a cada toque).
  const ceuId = useCeuId();
  const ceusFalados = useRef(new Set());
  const trocarCeu = () => {
    const novo = ciclarCeu();
    if (!ceusFalados.current.has(novo)) {
      ceusFalados.current.add(novo);
      falarNoFoco(CEUS[novo].voz);
    }
  };

  // Banner curto (a voz é quem carrega a personalidade do Órbi):
  // GPS = "HOSPITAL?"; Ciências = "🐱 VET?"; Busca = "🔍 ÁGUA?" — na
  // busca o banner mostra a PISTA DE LUGAR, NUNCA o bicho (nem emoji):
  // descobrir qual bicho é parte da recompensa.
  const textoBanner =
    missao?.tipo === 'busca'
      ? `🔍 ${BICHO_POR_SLUG[missao.destino]?.pistaCurta ?? '?'}`
      : missao?.tipo === 'ciencias'
        ? `${ANIMAL_POR_SLUG[missao.animal]?.emoji ?? '🐾'} ${missao.destino}?`
        : `${missao?.destino}?`;

  return (
    <>
      {/* Prioridade 1: tanque vazio fora do posto — aviso calmo pra ir ao posto */}
      {vazio && !abastecendo && atividade.hud !== 'painel' && (
        <div className="mission-banner mission-banner--aviso" role="status">
          ⛽ ACABOU! ME LEVA NO POSTO?
        </div>
      )}

      {caronaAtiva && (
        <div className="mission-banner mission-banner--ativa" role="status">
          🐶 PARQUE?
        </div>
      )}

      {missaoAtiva && (
        <div className="mission-banner mission-banner--ativa" role="status">
          {textoBanner}
        </div>
      )}
      {missaoAcabou && (
        <div className="mission-banner mission-banner--ok" role="status">
          {/* busca não é chegada: achou o bicho */}
          {missao?.tipo === 'busca' ? '✓ ACHAMOS!' : '✓ CHEGAMOS!'}
        </div>
      )}

      {/* Botão de céu — a criança comanda dia/entardecer/noite (troca seca no
          toque). tabIndex=-1 + blur(): ESPAÇO (freio) não reativa o botão. */}
      {atividade.hud !== 'painel' && atividade.foco !== 'pausado' && (
        <button
          type="button"
          className="ceu-btn"
          tabIndex={-1}
          aria-label="mudar o céu"
          onClick={(e) => {
            trocarCeu();
            e.currentTarget.blur();
          }}
        >
          {CEUS[ceuId].rotulo}
        </button>
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
