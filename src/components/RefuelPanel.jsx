import { useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from '../store/useGame.js';
import { somSucesso, somTique } from '../audio/sons.js';
import { falar } from '../audio/voz.js';
import { litrosFaltando, postoAtivo } from '../economia.js';

/**
 * Painel de abastecimento (Fatia 5) — A MATEMÁTICA COMO MECÂNICA.
 *
 * Aparece quando o carro está na zona do posto E o combustível está baixo.
 * Mostra "FALTAM N LITROS" (N pequeno, 1–10) e N caixinhas vazias. A criança
 * clica em "+1 LITRO" (ou aperta ENTER) e conta até N, vendo as caixinhas
 * encherem uma a uma. Ao completar N → tanque cheio, somSucesso + voz,
 * registra a habilidade "contagem".
 *
 * Feedback ASSIMÉTRICO (guard-rail TEA): acertar comemora; contar pela metade
 * e ir embora não faz nada — sem erro, sem punição, sem som negativo.
 *
 * Overlay 2D fora do <Canvas>, ancorado embaixo pra NÃO cobrir a cena (não é
 * um modal que pausa o jogo — a criança pode sair dirigindo a qualquer hora).
 *
 * Detalhes de robustez (vindos do code-review):
 *  - `meta` (o N) é CONGELADO ao abrir o painel. Se o carro entrar no posto
 *    ainda rolando, o combustível continua caindo por um instante; recalcular
 *    o N ao vivo faria o alvo subir embaixo do dedo da criança. Congelar = alvo
 *    estável (guard-rail TEA: nada muda sozinho no meio da contagem).
 *  - Os efeitos de conclusão ficam FORA do updater do setState e são protegidos
 *    por `concluido` — senão o StrictMode (dev) os dispararia 2× (registrando
 *    contagem em dobro no relatório de habilidades).
 */
export function RefuelPanel() {
  const aberto = useGame((s) => postoAtivo(s.combustivel, s.postoPerto));
  const encherTanque = useGame((s) => s.encherTanque);
  const registrarHabilidade = useGame((s) => s.registrarHabilidade);

  const [conta, setConta] = useState(0);
  const [meta, setMeta] = useState(1); // N congelado no momento da abertura
  const concluido = useRef(false);

  // Ao abrir: zera o contador e CONGELA o alvo no que falta agora.
  useEffect(() => {
    if (aberto) {
      setConta(0);
      setMeta(litrosFaltando(useGame.getState().combustivel));
      concluido.current = false;
    }
  }, [aberto]);

  const adicionar = useCallback(() => {
    if (concluido.current) return;

    const novo = conta + 1;
    setConta(novo);

    if (novo >= meta) {
      // Acertou a quantidade exata → comemora. Efeitos FORA do updater e
      // guardados por `concluido` pra rodarem exatamente uma vez.
      concluido.current = true;
      encherTanque();
      registrarHabilidade('contagem', true);
      somSucesso();
      falar('Muito bem! Tanque cheio!', { interrupt: true });
    } else {
      somTique();
    }
  }, [conta, meta, encherTanque, registrarHabilidade]);

  // ENTER também conta — sem conflitar com setas/espaço (que dirigem).
  useEffect(() => {
    if (!aberto) return;
    const onKey = (e) => {
      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        e.preventDefault();
        adicionar();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aberto, adicionar]);

  if (!aberto) return null;

  return (
    <div className="posto-overlay">
      <div className="posto-painel" role="dialog" aria-label="abastecer">
        <div className="posto-titulo">
          FALTAM <span className="posto-n">{meta}</span> LITROS
        </div>

        <div className="posto-pips" aria-hidden="true">
          {Array.from({ length: meta }).map((_, i) => (
            <span
              key={i}
              className={'posto-pip' + (i < conta ? ' posto-pip--cheio' : '')}
            />
          ))}
        </div>

        <div className="posto-conta" aria-live="polite">
          {conta} / {meta}
        </div>

        {/* tabIndex=-1 + blur(): impede que o botão, depois de clicado, fique
            focado e seja reativado por ESPAÇO (a tecla do freio de mão/drift),
            o que somaria um litro sem querer. ENTER continua contando pelo
            listener de window acima. */}
        <button
          type="button"
          className="posto-botao"
          tabIndex={-1}
          onClick={(e) => {
            adicionar();
            e.currentTarget.blur();
          }}
        >
          ⛽ +1 LITRO
        </button>

        <div className="posto-dica">CLIQUE PARA CONTAR ATÉ {meta}</div>
      </div>
    </div>
  );
}
