import { useEffect, useRef } from 'react';
import { useGame } from '../store/useGame.js';

// Hook de teclado: expõe um ref com o estado atual das teclas (não causa re-render).
// Apenas setas + Space — mantém simples e alinhado ao público-alvo.
export function useKeyboard() {
  const input = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    space: false,
  });

  useEffect(() => {
    // Zera tudo — usado no blur da janela e com o Caderninho aberto,
    // pra não ficar tecla "presa".
    const zerar = () => {
      input.current.up = input.current.down = false;
      input.current.left = input.current.right = false;
      input.current.space = false;
    };

    const setKey = (code, pressed, e) => {
      // Caderninho aberto: input de direção NÃO move o carro
      // (previsibilidade > física viva sob overlay). Zera — inclusive
      // tecla que já estava pressionada — e não faz preventDefault (o
      // overlay fica livre pro navegador). Ao fechar, o controle volta
      // exatamente como estava: neutro até a próxima tecla.
      if (useGame.getState().caderninhoAberto) {
        zerar();
        return;
      }
      switch (code) {
        case 'ArrowUp':    input.current.up = pressed;    e.preventDefault(); break;
        case 'ArrowDown':  input.current.down = pressed;  e.preventDefault(); break;
        case 'ArrowLeft':  input.current.left = pressed;  e.preventDefault(); break;
        case 'ArrowRight': input.current.right = pressed; e.preventDefault(); break;
        case 'Space':      input.current.space = pressed; e.preventDefault(); break;
        default: break;
      }
    };
    const onDown = (e) => setKey(e.code, true, e);
    const onUp   = (e) => setKey(e.code, false, e);

    // Em blur (alt-tab), zera tudo pra não ficar tecla "presa"
    const onBlur = zerar;

    // Abriu o caderninho com tecla segurada → solta na hora (não espera
    // o próximo keydown do auto-repeat).
    const unsub = useGame.subscribe((s, p) => {
      if (s.caderninhoAberto && !p.caderninhoAberto) zerar();
    });

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', onBlur);
      unsub();
    };
  }, []);

  return input;
}
