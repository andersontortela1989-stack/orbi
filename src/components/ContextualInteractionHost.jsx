import { useGame } from '../store/useGame.js';
import { interacaoContextualBloqueiaInput } from '../interactions/contextual-interactions.js';
import { PadariaMicroScene } from './micro-scenes/PadariaMicroScene.jsx';
import { SchoolMicroScene } from './school/SchoolMicroScene.jsx';
import { HortaPanel } from './school/HortaPanel.jsx';

/**
 * Host contextual: mantém o Canvas montado e seleciona somente a MicroScene
 * autorizada. Narrativa do Órbi e Learning Data continuam fora deste host.
 */
export function ContextualInteractionHost() {
  const interacao = useGame((s) => s.interacaoContextual);
  const concluir = useGame((s) => s.concluirInteracaoContextual);
  const encerrar = useGame((s) => s.encerrarInteracaoContextual);
  const horta = useGame((s) => s.horta);

  if (!interacaoContextualBloqueiaInput(interacao)) return null;
  if (interacao.tipo === 'horta-v1') return <section className="contextual-host" role="dialog" aria-modal="true" aria-label="Horta da Escola"><HortaPanel/></section>;
  if (interacao.tipo === 'escola-atividades-v1') return (
    <section className="contextual-host" role="dialog" aria-modal="true" aria-label="Escola do Órbi">
      <SchoolMicroScene onSair={encerrar} onHorta={useGame.getState().iniciarHorta} hortaPausada={horta&&horta.stage!=='concluida'}/>
    </section>
  );
  if (interacao.tipo !== 'padaria-paes-v1') return null;

  return (
    <section
      className="contextual-host"
      role="dialog"
      aria-modal="true"
      aria-label="pedido de pães da Padaria"
    >
      <PadariaMicroScene
        interacao={interacao}
        onConcluir={concluir}
        onSair={encerrar}
      />
    </section>
  );
}
