import { useGame } from '../store/useGame.js';
import { interacaoContextualBloqueiaInput } from '../interactions/contextual-interactions.js';

/**
 * Host estrutural da BUILD 02.A. Mantém o Canvas montado e oferece uma saída
 * segura, mas não antecipa a manipulação de pães nem a resposta do Órbi (02.B/C).
 */
export function ContextualInteractionHost() {
  const interacao = useGame((s) => s.interacaoContextual);
  const encerrar = useGame((s) => s.encerrarInteracaoContextual);

  if (!interacaoContextualBloqueiaInput(interacao)) return null;
  if (interacao.tipo !== 'padaria-paes-v1') return null;

  return (
    <section
      className="contextual-host"
      role="dialog"
      aria-modal="true"
      aria-label="interação contextual da Padaria"
    >
      <div className="contextual-host__card">
        <strong>PADARIA</strong>
        <button type="button" onClick={encerrar}>
          VOLTAR À CIDADE
        </button>
      </div>
    </section>
  );
}
