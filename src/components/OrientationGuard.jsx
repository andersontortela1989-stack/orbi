import { useEffect, useRef, useState } from 'react';
import { aparelhoDeToque, deveMostrarAvisoRetrato } from '../ui/responsive.js';
import { ehNavegadorEmbutido, tentarGirarPaisagem } from '../ui/orientacao.js';

const consultarRetrato = () =>
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(orientation: portrait)').matches
    : null;

async function copiarUrlAtual() {
  const url = typeof window !== 'undefined' ? window.location.href : '';
  if (!url) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
  } catch (_) {
    /* fallback abaixo */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (_) {
    return false;
  }
}

export function OrientationGuard({ somenteToque = false }) {
  const [retrato, setRetrato] = useState(consultarRetrato);
  const [tactil] = useState(aparelhoDeToque);
  const [embutido] = useState(() => ehNavegadorEmbutido());
  const [naoGirou, setNaoGirou] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const timerCopia = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(orientation: portrait)');
    const upd = () => setRetrato(mq.matches);
    upd();
    if (mq.addEventListener) mq.addEventListener('change', upd);
    else mq.addListener(upd);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', upd);
      else mq.removeListener(upd);
    };
  }, []);

  useEffect(() => () => clearTimeout(timerCopia.current), []);

  if (!deveMostrarAvisoRetrato({ retrato, tactil, somenteToque })) return null;

  const girarAgora = async () => {
    const res = await tentarGirarPaisagem();
    if (!res.ok) setNaoGirou(true);
  };

  const copiarLink = async () => {
    const ok = await copiarUrlAtual();
    if (!ok) return;
    setCopiado(true);
    clearTimeout(timerCopia.current);
    timerCopia.current = setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div className="orient-guard" role="alertdialog" aria-label="vire o celular">
      <div className="orient-emoji" aria-hidden="true">🔄</div>
      <div className="orient-msg">Vire o celular na horizontal pra brincar!</div>
      {embutido ? (
        <div className="orient-sub">
          Abriu pelo Threads, Instagram ou outro app? Ele pode travar a tela em pé.
          Toque nos três pontinhos (⋯) e escolha <strong>Abrir no navegador</strong>.
        </div>
      ) : (
        <div className="orient-sub">
          {naoGirou
            ? 'Este navegador não deixou girar sozinho — ative a rotação automática do celular ou abra no Chrome/Safari.'
            : 'Não virou? Ative a rotação automática do celular ou toque no botão abaixo.'}
        </div>
      )}

      <div className="orient-acoes">
        {!embutido && !naoGirou && (
          <button type="button" className="orient-btn" onClick={girarAgora}>
            GIRAR TELA
          </button>
        )}
        {(embutido || naoGirou) && (
          <button type="button" className="orient-btn orient-btn--sec" onClick={copiarLink}>
            {copiado ? 'LINK COPIADO!' : 'COPIAR LINK'}
          </button>
        )}
      </div>
    </div>
  );
}
