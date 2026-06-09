import { useEffect } from 'react';
import { falar } from '../audio/voz.js';

/**
 * Toca a saudação pt-BR na PRIMEIRA INTERAÇÃO do usuário (key ou click).
 * Browsers bloqueiam `speechSynthesis.speak()` antes de qualquer interação,
 * então atrelar à primeira tecla / clique é o caminho confiável.
 * Visual: nada. Componente sem render.
 */
export function WelcomeVoice() {
  useEffect(() => {
    let spoken = false;
    const trigger = () => {
      if (spoken) return;
      spoken = true;
      falar('Bem-vindo ao Órbi');
    };
    window.addEventListener('keydown', trigger, { once: true });
    window.addEventListener('pointerdown', trigger, { once: true });
    return () => {
      window.removeEventListener('keydown', trigger);
      window.removeEventListener('pointerdown', trigger);
    };
  }, []);

  return null;
}
