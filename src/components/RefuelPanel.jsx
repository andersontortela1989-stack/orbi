import { useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from '../store/useGame.js';
import { somSucesso, somTique } from '../audio/sons.js';
import { falar } from '../audio/voz.js';
import { LIMIAR_ABASTECER, litrosFaltando } from '../economia.js';

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
 */
export function RefuelPanel() {
  const postoPerto = useGame((s) => s.postoPerto);
  const combustivel = useGame((s) => s.combustivel);
  const encherTanque = useGame((s) => s.encherTanque);
  const registrarHabilidade = useGame((s) => s.registrarHabilidade);

  const aberto = postoPerto && combustivel < LIMIAR_ABASTECER;
  const N = litrosFaltando(combustivel);

  const [conta, setConta] = useState(0);
  const concluido = useRef(false);

  // Zera o contador toda vez que o painel abre.
  useEffect(() => {
    if (aberto) {
      setConta(0);
      concluido.current = false;
    }
  }, [aberto]);

  const adicionar = useCallback(() => {
    if (concluido.current) return;
    setConta((c) => {
      const novo = c + 1;
      if (novo >= N) {
        // Acertou a quantidade exata → comemora.
        concluido.current = true;
        encherTanque();
        registrarHabilidade('contagem', true);
        somSucesso();
        falar('Muito bem! Tanque cheio!', { interrupt: true });
      } else {
        somTique();
      }
      return novo;
    });
  }, [N, encherTanque, registrarHabilidade]);

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
          FALTAM <span className="posto-n">{N}</span> LITROS
        </div>

        <div className="posto-pips" aria-hidden="true">
          {Array.from({ length: N }).map((_, i) => (
            <span
              key={i}
              className={'posto-pip' + (i < conta ? ' posto-pip--cheio' : '')}
            />
          ))}
        </div>

        <div className="posto-conta" aria-live="polite">
          {conta} / {N}
        </div>

        <button type="button" className="posto-botao" onClick={adicionar}>
          ⛽ +1 LITRO
        </button>

        <div className="posto-dica">CLIQUE PARA CONTAR ATÉ {N}</div>
      </div>
    </div>
  );
}
