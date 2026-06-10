import { useEffect, useRef, useState } from 'react';
import { useGame } from '../store/useGame.js';
import { somSucesso } from '../audio/sons.js';
import { falar } from '../audio/voz.js';

// Tempo entre resolver (acerto ou revelação) e fechar o painel — a frase
// final começa e a carta certa acende antes de o fluxo seguir.
const FECHAR_MS = 2200;
// Toques errados até o Órbi revelar a resposta — ninguém fica preso.
const MAX_TENTATIVAS = 2;

/**
 * CHEGADA VIVA — a pergunta do Órbi na chegada.
 *
 * Abre quando a store tem `chegadaViva` (setada pelo MissionController após a
 * celebração da chegada no lugar). Mostra a pergunta ("QUAL DESSES FAZ MUU?")
 * e 3 cartas grandes de animais; a criança responde tocando.
 *
 * Feedback ASSIMÉTRICO ESTRITO (guard-rail TEA):
 *  - acerto  → festa contida: somSucesso + voz + carta acesa em Sol;
 *  - erro    → NEUTRO: só a voz repete o som, curiosa. Sem som de erro, sem
 *    vermelho, sem nada mudando na tela. (O dado registra tentativa sem
 *    acerto — evidência honesta — mas NADA disso aparece pra criança.)
 *  - 2 erros → o Órbi revela com alegria e ensina de qualquer jeito.
 *
 * Sem timer; dirigir continua livre (overlay embaixo, padrão RefuelPanel —
 * não é modal). A voz da pergunta entra SEM interrupt: ela espera na fila a
 * celebração da chegada terminar inteira (uma coisa por vez).
 *
 * Efeitos de conclusão em handlers de clique, guardados por `resolvido`
 * (padrão RefuelPanel) — +1 garantido, StrictMode não duplica.
 */
export function ChegadaVivaPanel() {
  const pergunta = useGame((s) => s.chegadaViva);
  const registrarHabilidade = useGame((s) => s.registrarHabilidade);

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
      falar(pergunta.frasePergunta);
    }
    return () => clearTimeout(fecharTO.current);
  }, [pergunta]);

  if (!pergunta) return null;

  // Fecha o painel e segue o fluxo normal — só o painel sorteia a próxima
  // missão quando há chegada viva (o MissionController delega pra cá).
  const finalizar = () => {
    clearTimeout(fecharTO.current);
    fecharTO.current = setTimeout(() => {
      useGame.getState().fecharChegadaViva();
      useGame.getState().proximaMissao();
    }, FECHAR_MS);
  };

  const responder = (slug) => {
    if (resolvido.current) return;

    if (slug === pergunta.animal) {
      resolvido.current = true;
      setAcertou(true);
      registrarHabilidade('cienciasVida', true);
      somSucesso();
      falar(pergunta.fraseAcerto, { interrupt: true });
      finalizar();
      return;
    }

    // Toque errado — neutro e curioso (ver doc do componente).
    registrarHabilidade('cienciasVida', false);
    const n = tentativas + 1;
    setTentativas(n);

    if (n >= MAX_TENTATIVAS) {
      resolvido.current = true;
      setRevelada(true);
      falar(pergunta.fraseRevela, { interrupt: true });
      finalizar();
    } else {
      falar(pergunta.fraseTenteDeNovo, { interrupt: true });
    }
  };

  return (
    <div className="viva-overlay">
      <div className="viva-painel" role="dialog" aria-label="pergunta do Órbi">
        <div className="viva-titulo">
          QUAL DESSES FAZ{' '}
          <span className="viva-som">{pergunta.som.toUpperCase()}</span>?
        </div>

        <div className="viva-cartas">
          {pergunta.opcoes.map((o) => {
            const certa = (acertou || revelada) && o.slug === pergunta.animal;
            return (
              /* tabIndex=-1 + blur(): mesma proteção do botão do posto — a
                 carta clicada não pode ficar focada e ser reativada por
                 ESPAÇO (a tecla do freio de mão). */
              <button
                key={o.slug}
                type="button"
                tabIndex={-1}
                className={'viva-carta' + (certa ? ' viva-carta--certa' : '')}
                onClick={(e) => {
                  responder(o.slug);
                  e.currentTarget.blur();
                }}
              >
                <span className="viva-emoji" aria-hidden="true">
                  {o.emoji}
                </span>
                <span className="viva-nome">{o.slug}</span>
              </button>
            );
          })}
        </div>

        <div className="viva-dica">TOQUE NO BICHO CERTO</div>
      </div>
    </div>
  );
}
