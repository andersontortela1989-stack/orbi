import { useEffect, useRef } from 'react';

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
    const setKey = (code, pressed, e) => {
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
    const onBlur = () => {
      input.current.up = input.current.down = false;
      input.current.left = input.current.right = false;
      input.current.space = false;
    };

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  return input;
}
