import { useEffect, useRef } from 'react';
import { useActivity } from '../activity/useActivity.js';

/**
 * CONTROLES DE TOQUE — Frente 0 (lançamento celular/tablet), LAYOUT B.
 *
 * Layout B (validado no mockup, no celular real): ◀ ▶ (esquerda) + DRIFT ✋ e
 * ACELERA ▲ (direita). Alvos grandes, FIXOS, visíveis — régua TEA.
 *
 * OPÇÃO 1 — o toque DISPARA o MESMO evento de teclado que o `useKeyboard` já
 * escuta (keydown/keyup na window). Assim teclado e toque passam pela mesma
 * política central de atividade, inclusive zero-no-painel e zero-no-blur.
 *
 * DEDO-ARRASTA (decisão TEA): pointerdown CAPTURA o ponteiro — o dedo escorregar
 * 2px numa curva NÃO solta (tolerante, sem twitch); solta só ao levantar
 * (pointerup) ou cancelar (pointercancel). Rede contra "preso andando":
 * blur/aba-escondida e o efeito de esconder soltam TUDO.
 *
 * O coordenador decide quando esconder: pergunta e caderninho bloqueiam a
 * direção; posto e garagem mantêm os controles porque hoje fecham quando o
 * carro sai da zona. Ao esconder, solta tudo para o carro não seguir andando
 * atrás do painel.
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
  { code: 'ArrowLeft',  zona: 'esq', classe: 'tc-steer',  ico: '◀', rotulo: 'VIRA' },
  { code: 'ArrowRight', zona: 'esq', classe: 'tc-steer',  ico: '▶', rotulo: 'VIRA' },
  // Buzina no cluster ESQUERDO (o direito já tem 3): dispara 'KeyB', a mesma
  // tecla do desktop — o <Buzina> ouve e toca o som. Sem física, sem save.
  { code: 'KeyB',       zona: 'esq', classe: 'tc-buzina', ico: '📣', rotulo: 'BUZINA' },
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
  const { dirigir } = useActivity();

  const ativas = useRef(new Set()); // codes pressionados agora (pra soltar)
  // Mesma decisão do teclado. Posto/garagem continuam dirigíveis porque a
  // saída da zona é o fechamento atual desses painéis; pergunta/caderninho
  // escondem e soltam os controles.
  const escondido = !TACTIL || !dirigir;

  // Perdeu a direção → solta as teclas seguradas, senão o carro continua
  // andando atrás do painel.
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
