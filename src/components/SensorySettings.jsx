import { useEffect, useState } from 'react';
import { useActivity, useRegistrarAtividade } from '../activity/useActivity.js';
import { pararFala } from '../audio/voz.js';
import { useGame } from '../store/useGame.js';

const OPCOES = Object.freeze([
  {
    chave: 'voz',
    icone: '🗣️',
    titulo: 'VOZ DO ÓRBI',
    texto: 'Narra perguntas, pistas e descobertas.',
  },
  {
    chave: 'sons',
    icone: '🔔',
    titulo: 'SONS DO JOGO',
    texto: 'Moedas, buzina e comemorações curtas.',
  },
  {
    chave: 'animacoes',
    icone: '✨',
    titulo: 'ANIMAÇÕES',
    texto: 'Movimentos e transições da interface.',
  },
  {
    chave: 'detalhesVisuais',
    icone: '🌳',
    titulo: 'DETALHES DO MUNDO',
    texto: 'Grade, enfeites e elementos decorativos.',
  },
]);

function Alternador({ ativo }) {
  return (
    <span className={'sensory-switch' + (ativo ? ' is-on' : '')} aria-hidden="true">
      <i />
    </span>
  );
}

/** Preferências compartilhadas pela abertura e pelo jogo. */
export function SensorySettings({ variant = 'game' }) {
  const [aberto, setAberto] = useState(false);
  const atividade = useActivity();
  const preferencias = useGame((s) => s.preferencias);
  const setModoTranquilo = useGame((s) => s.setModoTranquilo);
  const setPreferencia = useGame((s) => s.setPreferencia);
  const restaurarPreferencias = useGame((s) => s.restaurarPreferencias);

  useRegistrarAtividade('configuracoes', aberto);

  useEffect(() => {
    if (!aberto) return undefined;
    const fecharComEsc = (e) => {
      if (e.key === 'Escape') setAberto(false);
    };
    window.addEventListener('keydown', fecharComEsc);
    return () => window.removeEventListener('keydown', fecharComEsc);
  }, [aberto]);

  const painelEmUso = variant === 'game' && atividade.hud === 'painel' && !aberto;

  const alternar = (chave) => {
    const proximo = !preferencias[chave];
    setPreferencia(chave, proximo);
    if (chave === 'voz' && !proximo) pararFala();
  };

  return (
    <>
      {!painelEmUso && (
        <button
          type="button"
          className={`sensory-trigger sensory-trigger--${variant}`}
          onClick={() => setAberto(true)}
          aria-label="Configurações de conforto"
        >
          <span aria-hidden="true">⚙️</span>
          {variant === 'start' && <strong>CONFORTO</strong>}
        </button>
      )}

      {aberto && (
        <div
          className="sensory-overlay"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setAberto(false);
          }}
        >
          <section
            className="sensory-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sensory-title"
          >
            <header className="sensory-header">
              <div>
                <span className="sensory-kicker">CONFORTO PARA BRINCAR</span>
                <h2 id="sensory-title">COMO VOCÊ QUER O ÓRBI?</h2>
              </div>
              <button
                type="button"
                className="sensory-close"
                onClick={() => setAberto(false)}
              >
                FECHAR
              </button>
            </header>

            <button
              type="button"
              className={'sensory-calm' + (preferencias.modoTranquilo ? ' is-on' : '')}
              aria-pressed={preferencias.modoTranquilo}
              onClick={() => {
                setModoTranquilo(!preferencias.modoTranquilo);
                pararFala();
              }}
            >
              <span className="sensory-calm-icon" aria-hidden="true">🌿</span>
              <span>
                <strong>MODO TRANQUILO</strong>
                <small>Menos sons, movimentos e detalhes. A voz continua ajudando.</small>
              </span>
              <b>{preferencias.modoTranquilo ? 'LIGADO' : 'ATIVAR'}</b>
            </button>

            <div className="sensory-options">
              {OPCOES.map((opcao) => {
                const ativo = preferencias[opcao.chave];
                return (
                  <button
                    type="button"
                    className="sensory-option"
                    key={opcao.chave}
                    role="switch"
                    aria-checked={ativo}
                    onClick={() => alternar(opcao.chave)}
                  >
                    <span className="sensory-option-icon" aria-hidden="true">{opcao.icone}</span>
                    <span>
                      <strong>{opcao.titulo}</strong>
                      <small>{opcao.texto}</small>
                    </span>
                    <Alternador ativo={ativo} />
                  </button>
                );
              })}
            </div>

            <footer className="sensory-footer">
              <span>As escolhas ficam salvas neste aparelho.</span>
              <button
                type="button"
                onClick={() => {
                  restaurarPreferencias();
                  pararFala();
                }}
              >
                RESTAURAR PADRÃO
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
