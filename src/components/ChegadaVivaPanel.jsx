import { useEffect, useRef, useState } from 'react';
import { useGame } from '../store/useGame.js';
import { somSucesso } from '../audio/sons.js';
import { falarDaAtividade } from '../activity/index.js';
import { useRegistrarAtividade } from '../activity/useActivity.js';
import { Bandeira } from './Bandeira.jsx';

// Tempo entre resolver (acerto ou revelação) e fechar o painel — a frase
// final começa e a carta certa acende antes de o fluxo seguir.
const FECHAR_MS = 2200;
// Toques errados até o Órbi revelar a resposta — ninguém fica preso.
const MAX_TENTATIVAS = 2;

/**
 * CHEGADA VIVA — a pergunta do Órbi na chegada.
 *
 * Abre quando a store tem `chegadaViva` (setada pelo MissionController após a
 * celebração da chegada no lugar). O painel é GENÉRICO: todo o conteúdo —
 * título, cartas, dica, frases de voz, habilidade registrada e a fileira
 * opcional de itens pra contar — vem pronto da pergunta (chegadas-vivas.js).
 * ZOO = sons de animais; MERCADO = cores de frutas; PADARIA = contagem de
 * pães (cartas de número, sem emoji).
 *
 * Feedback ASSIMÉTRICO ESTRITO (guard-rail TEA):
 *  - acerto  → festa contida: somSucesso + voz + carta acesa em Sol;
 *  - erro    → NEUTRO: só a voz repete a dica, curiosa. Sem som de erro, sem
 *    vermelho, sem nada mudando na tela. (O dado registra tentativa sem
 *    acerto — evidência honesta — mas NADA disso aparece pra criança.)
 *  - 2 erros → o Órbi revela com alegria e ensina de qualquer jeito.
 *
 * Sem timer; o coordenador congela direção e mundo enquanto a carta está
 * aberta. A voz da pergunta entra SEM interrupt: ela espera na fila a
 * celebração da chegada terminar inteira (uma coisa por vez).
 *
 * Efeitos de conclusão em handlers de clique, guardados por `resolvido`
 * (padrão RefuelPanel) — +1 garantido, StrictMode não duplica.
 */
export function ChegadaVivaPanel() {
  const pergunta = useGame((s) => s.chegadaViva);
  const registrarHabilidade = useGame((s) => s.registrarHabilidade);
  useRegistrarAtividade('pergunta', !!pergunta);

  const [tentativas, setTentativas] = useState(0);
  const [acertou, setAcertou] = useState(false);
  const [revelada, setRevelada] = useState(false);
  const resolvido = useRef(false);
  const fecharTO = useRef(null);

  // Ao abrir: zera o estado local e narra a pergunta (na fila da voz).
  useEffect(() => {
    if (pergunta) {
      setTentativas(0);
      setAcertou(false);
      setRevelada(false);
      resolvido.current = false;
      falarDaAtividade('pergunta', pergunta.frasePergunta);
    }
    return () => clearTimeout(fecharTO.current);
  }, [pergunta]);

  if (!pergunta) return null;

  // Adesivo do Caderninho — registrado tanto no acerto quanto na revelação
  // (idempotente na store; pergunta antiga sem o campo é no-op).
  const registrarDescoberta = () => {
    const d = pergunta.descoberta;
    if (d) useGame.getState().registrarDescoberta(d.categoria, d.id);
  };

  // Fecha o painel e segue o fluxo normal — só o painel sorteia a próxima
  // missão quando há chegada viva (o MissionController delega pra cá).
  const finalizar = () => {
    clearTimeout(fecharTO.current);
    fecharTO.current = setTimeout(() => {
      useGame.getState().fecharChegadaViva();
      useGame.getState().proximaMissao();
    }, FECHAR_MS);
  };

  const responder = (valor) => {
    if (resolvido.current) return;

    if (valor === pergunta.resposta) {
      resolvido.current = true;
      setAcertou(true);
      registrarHabilidade(pergunta.habilidade, true);
      registrarDescoberta();
      somSucesso();
      falarDaAtividade('pergunta', pergunta.fraseAcerto, { interrupt: true });
      finalizar();
      return;
    }

    // Toque errado — neutro e curioso (ver doc do componente).
    registrarHabilidade(pergunta.habilidade, false);
    const n = tentativas + 1;
    setTentativas(n);

    if (n >= MAX_TENTATIVAS) {
      resolvido.current = true;
      setRevelada(true);
      // A revelação NÃO conta acerto (régua honesta), mas o item FOI
      // descoberto: o Órbi ensinou de qualquer jeito — o adesivo entra no
      // Caderninho sem rastro de falha.
      registrarDescoberta();
      falarDaAtividade('pergunta', pergunta.fraseRevela, { interrupt: true });
      finalizar();
    } else {
      falarDaAtividade('pergunta', pergunta.fraseTenteDeNovo, { interrupt: true });
    }
  };

  return (
    <div className="viva-overlay">
      <div className="viva-painel" role="dialog" aria-label="pergunta do Órbi">
        <div className="viva-titulo">
          {pergunta.tituloAntes}
          {pergunta.tituloDestaque && (
            <>
              {' '}
              <span className="viva-som">{pergunta.tituloDestaque}</span>
            </>
          )}
          {pergunta.tituloDepois}
        </div>

        {/* Fileira de itens pra CONTAR (PADARIA): pães grandes e separados,
            dá pra contar com o dedo na tela. aria-hidden: a quantidade é a
            resposta — o conteúdo acessível é a pergunta falada. */}
        {pergunta.mostra && (
          <div className="viva-mostra" aria-hidden="true">
            {Array.from({ length: pergunta.mostra.quantidade }).map((_, i) => (
              <span key={i}>{pergunta.mostra.emoji}</span>
            ))}
          </div>
        )}

        <div className="viva-cartas">
          {pergunta.opcoes.map((o) => {
            const certa = (acertou || revelada) && o.valor === pergunta.resposta;
            return (
              /* tabIndex=-1 + blur(): mesma proteção do botão do posto — a
                 carta clicada não pode ficar focada e ser reativada por
                 ESPAÇO (a tecla do freio de mão). */
              <button
                key={o.valor}
                type="button"
                tabIndex={-1}
                className={'viva-carta' + (certa ? ' viva-carta--certa' : '')}
                onClick={(e) => {
                  responder(o.valor);
                  e.currentTarget.blur();
                }}
              >
                {/* carta de bandeira (ESTÁDIO, Frente 6): SVG no lugar do
                    emoji — emoji de bandeira não renderiza no Windows */}
                {o.bandeira && <Bandeira slug={o.bandeira} className="viva-bandeira" />}
                {o.emoji && (
                  <span className="viva-emoji" aria-hidden="true">
                    {o.emoji}
                  </span>
                )}
                <span
                  className={o.emoji || o.bandeira ? 'viva-nome' : 'viva-numero'}
                >
                  {o.rotulo}
                </span>
              </button>
            );
          })}
        </div>

        <div className="viva-dica">{pergunta.dica}</div>
      </div>
    </div>
  );
}
