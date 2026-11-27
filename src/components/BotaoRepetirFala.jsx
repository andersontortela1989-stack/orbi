import { coordenadorAtividade } from '../activity/index.js';
import { useActivity } from '../activity/useActivity.js';
import { useGame } from '../store/useGame.js';
import { podeRepetirFala } from '../ui/repetir-fala.js';
import './repetir-fala.css';

/**
 * Botão 🔊 de repetir a última fala do Órbi (C1) — no HUD e nos painéis de
 * pergunta. Repete a fala da atividade EM FOCO (o coordenador guarda uma por
 * atividade). Não conta tentativa nem ajuda e não muda o save.
 *
 * Sem fala guardada ou com a voz desligada, fica desabilitado. Estático: sem
 * animação (vale também para o Modo Tranquilo e o movimento reduzido).
 * tabIndex=-1 + blur(): ESPAÇO (freio de mão) não reativa o botão.
 */
export function BotaoRepetirFala({ className = '' }) {
  const { fala } = useActivity();
  const vozLigada = useGame((s) => s.preferencias?.voz !== false);
  const ativo = podeRepetirFala({ fala, vozLigada });

  return (
    <button
      type="button"
      tabIndex={-1}
      className={`repetir-btn ${className}`.trim()}
      aria-label="Repetir a fala do Órbi"
      disabled={!ativo}
      onClick={(e) => {
        coordenadorAtividade.repetir();
        e.currentTarget.blur();
      }}
    >
      <span aria-hidden="true">🔊</span>
    </button>
  );
}
