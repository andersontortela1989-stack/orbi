import { useEffect, useRef } from 'react';
import { coordenadorAtividade } from '../activity/index.js';

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
      // Uma única regra vale para teclado e toque: quem decide se o carro
      // responde é o coordenador. Pergunta/caderninho/pausa bloqueiam;
      // posto e garagem preservam a saída dirigindo (sem softlock).
      if (!coordenadorAtividade.podeDirigir()) {
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

    // Qualquer atividade que retire a direção solta imediatamente as teclas
    // já pressionadas — não espera keyup/auto-repeat.
    const unsub = coordenadorAtividade.assinar((s) => {
      if (!s.dirigir) zerar();
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
