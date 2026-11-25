import { useEffect, useRef, useState } from 'react';
import { useGame } from '../store/useGame.js';
import { somSucesso } from '../audio/sons.js';
import { falarDaAtividade } from '../activity/index.js';
import { useRegistrarAtividade } from '../activity/useActivity.js';
import {
  encerrarChegadaVivaAposFala,
  finalizarChegadaViva,
} from '../missions/visita-livre.js';
import { Bandeira } from './Bandeira.jsx';
import { BotaoRepetirFala } from './BotaoRepetirFala.jsx';
import { useMarcarTroca } from '../perf/useMarcarTroca.js';

// Tempo entre resolver (acerto ou revelação) e fechar o painel — a frase
// final começa e a carta certa acende antes de o fluxo seguir.
const FECHAR_MS = 2200;
const LIMITE_FECHAR_MS = 9000;
// Toques errados até o Órbi revelar a resposta — ninguém fica preso.
const MAX_TENTATIVAS = 2;

/**
 * CHEGADA VIVA — a pergunta do Órbi na chegada.
 *
 * Abre quando a store tem `chegadaViva` (setada pelo MissionController após a
 * celebração da chegada no lugar, ou por visita livre no Shopping). O painel é
 * GENÉRICO: todo o conteúdo — título, cartas, dica, frases de voz, habilidade
 * registrada e a fileira opcional de itens pra contar — vem pronto da pergunta
 * (chegadas-vivas.js). ZOO = sons de animais; MERCADO = cores de frutas;
 * PADARIA = contagem de pães (cartas de número, sem emoji).
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
  useMarcarTroca(!!pergunta, 'pergunta'); // M1b: só registra com ?medir=1

  const [tentativas, setTentativas] = useState(0);
  const [acertou, setAcertou] = useState(false);
  const [revelada, setRevelada] = useState(false);
  const resolvido = useRef(false);
  const esperaFechar = useRef(null);

  // Ao abrir: zera o estado local e narra a pergunta (na fila da voz).
  useEffect(() => {
    if (pergunta) {
      esperaFechar.current?.cancelar();
      esperaFechar.current = null;
      setTentativas(0);
      setAcertou(false);
      setRevelada(false);
      resolvido.current = false;
      falarDaAtividade('pergunta', pergunta.frasePergunta);
    }
    return () => {
      esperaFechar.current?.cancelar();
      esperaFechar.current = null;
    };
  }, [pergunta]);

  if (!pergunta) return null;

  // Adesivo do Caderninho — registrado tanto no acerto quanto na revelação
  // (idempotente na store; pergunta antiga sem o campo é no-op).
  const registrarDescoberta = () => {
    const d = pergunta.descoberta;
    if (d) useGame.getState().registrarDescoberta(d.categoria, d.id);
  };

  // Fecha o painel e segue o fluxo: em missão do roteiro pede a próxima
  // parada; em visita livre devolve a direção mantendo a parada atual intacta.
  const finalizar = (textoFinal) => {
    const perguntaAtual = pergunta;
    esperaFechar.current?.cancelar();
    esperaFechar.current = encerrarChegadaVivaAposFala({
      texto: textoFinal,
      falar: (texto, opts) => falarDaAtividade('pergunta', texto, opts),
      aoFechar: () => {
        const { fecharChegadaViva, proximaMissao } = useGame.getState();
        finalizarChegadaViva(perguntaAtual, { fecharChegadaViva, proximaMissao });
      },
      minimoMs: FECHAR_MS,
      limiteMs: LIMITE_FECHAR_MS,
    });
  };

  const responder = (valor) => {
    if (resolvido.current) return;

    if (valor === pergunta.resposta) {
      resolvido.current = true;
      setAcertou(true);
      registrarHabilidade(pergunta.habilidade, true);
      registrarDescoberta();
      somSucesso();
      finalizar(pergunta.fraseAcerto);
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
      finalizar(pergunta.fraseRevela);
    } else {
      falarDaAtividade('pergunta', pergunta.fraseTenteDeNovo, { interrupt: true });
    }
  };

  return (
    <div className="viva-overlay">
      <div className="viva-painel" role="dialog" aria-label="pergunta do Órbi">
        {/* C1: 🔊 ao lado do título, longe das cartas de resposta. */}
        <div className="repetir-linha">
          <div className="viva-titulo">
            {pergunta.tituloAntes}
            {pergunta.tituloDestaque && (
              <>
                {' '}
                <span
                  className={
                    'viva-som' + (pergunta.destaqueNeutro ? ' viva-som--neutro' : '')
                  }
                >
                  {pergunta.tituloDestaque}
                </span>
              </>
            )}
            {pergunta.tituloDepois}
          </div>
          <BotaoRepetirFala />
        </div>

        {/* Fileira de itens pra CONTAR (PADARIA) ou dois agrupamentos
            separados (ESCOLA: 2 de um lado, 3 do outro). aria-hidden: a
            quantidade é a resposta — o conteúdo acessível é a pergunta falada. */}
        {pergunta.mostra && (
          <div
            className={
              'viva-mostra' +
              (pergunta.mostra.grupos ? ' viva-mostra--grupos' : '')
            }
            aria-hidden="true"
          >
            {pergunta.mostra.grupos
              ? pergunta.mostra.grupos.map((qtd, gIdx) => (
                  <div className="viva-mostra-grupo" key={gIdx}>
                    {Array.from({ length: qtd }).map((_, i) => (
                      <span key={i}>{pergunta.mostra.emoji}</span>
                    ))}
                  </div>
                ))
              : Array.from({ length: pergunta.mostra.quantidade }).map((_, i) => (
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
                aria-label={o.ariaLabel || undefined}
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
                {o.rotulo && (
                  <span
                    className={o.emoji || o.bandeira ? 'viva-nome' : 'viva-numero'}
                  >
                    {o.rotulo}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="viva-dica">{pergunta.dica}</div>
      </div>
    </div>
  );
}