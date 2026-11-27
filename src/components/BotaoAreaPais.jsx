import { useEffect, useRef, useState } from 'react';
import { criarPortaoParental, DURACAO_PORTAO_MS } from '../ui/portao-parental.js';

/**
 * Botão da Área dos Pais com portão parental de 1,5 s (segurar para abrir).
 * Preserva alvo mínimo de 44x44 px e evita abertura acidental por toque da criança.
 */
export function BotaoAreaPais({ onAbrir, className = 'start-parents' }) {
  const [segurando, setSegurando] = useState(false);
  const [mostrarDica, setMostrarDica] = useState(false);
  const dicaTimerRef = useRef(null);
  const onAbrirRef = useRef(onAbrir);
  onAbrirRef.current = onAbrir;

  const portaoRef = useRef(null);
  if (!portaoRef.current) {
    portaoRef.current = criarPortaoParental({
      duracaoMs: DURACAO_PORTAO_MS,
      onAbrir: () => {
        setSegurando(false);
        setMostrarDica(false);
        onAbrirRef.current?.();
      },
      onToqueRapido: () => {
        setSegurando(false);
        setMostrarDica(true);
        clearTimeout(dicaTimerRef.current);
        dicaTimerRef.current = setTimeout(() => setMostrarDica(false), 1800);
      },
    });
  }

  useEffect(() => () => {
    portaoRef.current?.destruir();
    clearTimeout(dicaTimerRef.current);
  }, []);

  const iniciar = () => {
    setMostrarDica(false);
    if (portaoRef.current.iniciar()) {
      setSegurando(true);
    }
  };

  const cancelar = (notificarToqueRapido) => {
    setSegurando(false);
    portaoRef.current.cancelar({ notificarToqueRapido });
  };

  return (
    <div className="start-parents-wrap">
      {mostrarDica && (
        <span className="start-parents-dica" role="status" aria-live="polite">
          segure para abrir
        </span>
      )}
      <button
        type="button"
        className={className + (segurando ? ' start-parents--segurando' : '')}
        aria-label="Área dos pais — segure para abrir"
        onPointerDown={(e) => {
          if (e.pointerType === 'mouse' && e.button !== 0) return;
          iniciar();
        }}
        onPointerUp={() => cancelar(true)}
        onPointerLeave={() => cancelar(false)}
        onPointerCancel={() => cancelar(false)}
        onContextMenu={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if ((e.code === 'Enter' || e.code === 'Space') && !e.repeat) {
            e.preventDefault();
            iniciar();
          }
        }}
        onKeyUp={(e) => {
          if (e.code === 'Enter' || e.code === 'Space') {
            cancelar(true);
          }
        }}
        onBlur={() => cancelar(false)}
      >
        <span
          className="start-parents-barra"
          style={{ '--portao-ms': DURACAO_PORTAO_MS + 'ms' }}
          aria-hidden="true"
        />
        <span className="start-parents-conteudo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="4" y="10" width="16" height="11" rx="3" fill="#fff" stroke="#46557E" strokeWidth="2.4" />
            <path d="M8 10 V7 a4 4 0 0 1 8 0 V10" stroke="#46557E" strokeWidth="2.4" fill="none" />
          </svg>
          Área dos pais
        </span>
      </button>
    </div>
  );
}
