import { useEffect, useRef } from 'react';
import { useGame } from '../store/useGame.js';
import { postoAtivo } from '../economia.js';

/**
 * CONTROLES DE TOQUE — Frente 0 (lançamento celular/tablet), LAYOUT B.
 *
 * Layout B (validado no mockup, no celular real): ◀ ▶ (esquerda) + DRIFT ✋ e
 * ACELERA ▲ (direita). Alvos grandes, FIXOS, visíveis — régua TEA.
 *
 * OPÇÃO 1 — o toque DISPARA o MESMO evento de teclado que o `useKeyboard` já
 * escuta (keydown/keyup na window). Então herda TODO o guard-rail dele de
 * graça (zero-no-caderninho, zero-no-blur, sincronia dos 2 instances) e
 * `useKeyboard`/`Car`/`FuelController` ficam INTOCADOS — risco zero no núcleo.
 *
 * DEDO-ARRASTA (decisão TEA): pointerdown CAPTURA o ponteiro — o dedo escorregar
 * 2px numa curva NÃO solta (tolerante, sem twitch); solta só ao levantar
 * (pointerup) ou cancelar (pointercancel). Rede contra "preso andando":
 * blur/aba-escondida e o efeito de esconder soltam TUDO.
 *
 * SOME COM QUALQUER PAINEL (decisão (b)): no toque o dedo está na MESMA tela do
 * painel — painel aberto = foco no painel, sem dirigir sem querer numa carta.
 * Ao esconder, solta as teclas seguradas (senão o carro vaza dirigindo atrás do
 * painel). Diverge do teclado de propósito (no desktop dirigir no quiz é
 * inofensivo; no celular seria confusão — adaptação consciente ao dispositivo).
 *
 * SÓ NO TÁCTIL: desktop (mouse) não renderiza nada — a tela do Heitor fica limpa.
 */

// Dispositivo táctil? (uma vez — não muda na sessão.)
const TACTIL =
  typeof navigator !== 'undefined' &&
  ((navigator.maxTouchPoints || 0) > 0 ||
    (typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(pointer: coarse)').matches));

// Botão → `code` de tecla (o mesmo que o teclado manda).
const BOTOES = [
  { code: 'ArrowLeft',  zona: 'esq', classe: 'tc-steer', ico: '◀', rotulo: 'VIRA' },
  { code: 'ArrowRight', zona: 'esq', classe: 'tc-steer', ico: '▶', rotulo: 'VIRA' },
  { code: 'Space',      zona: 'dir', classe: 'tc-drift', ico: '✋', rotulo: 'DRIFT' },
  // RÉ entre DRIFT e ACELERA: ACELERA fica na borda direita (posição validada
  // do Layout B) e a ré nasce ao lado dela. Dispara ArrowDown — a mesma tecla
  // de ré do teclado (Car.jsx: input.down → recuo, desencosta da parede).
  { code: 'ArrowDown',  zona: 'dir', classe: 'tc-re',    ico: '▼', rotulo: 'RÉ' },
  { code: 'ArrowUp',    zona: 'dir', classe: 'tc-go',    ico: '▲', rotulo: 'ACELERA' },
];

const tecla = (type, code) =>
  window.dispatchEvent(new KeyboardEvent(type, { code, bubbles: true, cancelable: true }));

export function TouchControls() {
  // some com QUALQUER painel aberto (decisão (b))
  const quiz = useGame((s) => !!s.chegadaViva);
  const caderninho = useGame((s) => s.caderninhoAberto);
  const posto = useGame((s) => postoAtivo(s.combustivel, s.postoPerto));
  const garagem = useGame((s) => s.garagemPerto);

  const ativas = useRef(new Set()); // codes pressionados agora (pra soltar)
  const escondido = !TACTIL || quiz || caderninho || posto || garagem;

  // Esconder (painel abriu) → solta as teclas seguradas, senão o carro continua
  // dirigindo atrás do painel (o leak).
  useEffect(() => {
    if (escondido && ativas.current.size) {
      ativas.current.forEach((code) => tecla('keyup', code));
      ativas.current.clear();
    }
  }, [escondido]);

  // Rede de segurança: blur / aba escondida → solta TUDO (espelha o zero-no-blur
  // do useKeyboard; cobre o raro pointerup perdido no mobile).
  useEffect(() => {
    const soltarTudo = () => {
      ativas.current.forEach((code) => tecla('keyup', code));
      ativas.current.clear();
      document
        .querySelectorAll('.tc-btn.pressed')
        .forEach((b) => b.classList.remove('pressed'));
    };
    const onVis = () => { if (document.hidden) soltarTudo(); };
    window.addEventListener('blur', soltarTudo);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('blur', soltarTudo);
      document.removeEventListener('visibilitychange', onVis);
      soltarTudo();
    };
  }, []);

  if (escondido) return null;

  const press = (e, code) => {
    e.preventDefault();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) { /* ok */ }
    e.currentTarget.classList.add('pressed');
    if (!ativas.current.has(code)) {
      ativas.current.add(code);
      tecla('keydown', code);
    }
  };
  const solta = (e, code) => {
    e.currentTarget.classList.remove('pressed');
    if (ativas.current.has(code)) {
      ativas.current.delete(code);
      tecla('keyup', code);
    }
  };

  const botao = (b) => (
    <button
      key={b.code}
      type="button"
      tabIndex={-1}
      aria-label={b.rotulo.toLowerCase()}
      className={`tc-btn ${b.classe}`}
      onPointerDown={(e) => press(e, b.code)}
      onPointerUp={(e) => solta(e, b.code)}
      onPointerCancel={(e) => solta(e, b.code)}
    >
      <span className="tc-ico" aria-hidden="true">{b.ico}</span>
      {b.rotulo}
    </button>
  );

  return (
    <>
      <div className="tc-zona tc-esq">{BOTOES.filter((b) => b.zona === 'esq').map(botao)}</div>
      <div className="tc-zona tc-dir">{BOTOES.filter((b) => b.zona === 'dir').map(botao)}</div>
    </>
  );
}
