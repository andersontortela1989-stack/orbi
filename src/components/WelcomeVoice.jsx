import { useEffect } from 'react';
import { nomeParaVoz } from '../audio/voz.js';
import { falarNoFoco } from '../activity/index.js';
import { useGame } from '../store/useGame.js';

/**
 * Toca a saudação pt-BR na PRIMEIRA INTERAÇÃO do usuário (key ou click).
 * Browsers bloqueiam `speechSynthesis.speak()` antes de qualquer interação,
 * então atrelar à primeira tecla / clique é o caminho confiável.
 * Com o nome capturado na intro, a saudação é pessoal ("Oi, Heitor!").
 * Visual: nada. Componente sem render.
 */
export function WelcomeVoice() {
  useEffect(() => {
    let spoken = false;
    const trigger = () => {
      if (spoken) return;
      spoken = true;
      const nome = useGame.getState().nome; // lido na hora: pega o recém-digitado
      falarNoFoco(
        nome ? `Oi, ${nomeParaVoz(nome)}! Bem-vindo ao Órbi!` : 'Bem-vindo ao Órbi'
      );
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
