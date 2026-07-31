import { lazy, Suspense, useEffect, useState } from 'react';
import { StartScreen } from './components/StartScreen.jsx';
import { IntroChegada } from './components/IntroChegada.jsx';
import { GameLoading } from './components/GameLoading.jsx';
import { useGame } from './store/useGame.js';

// Fronteira de code splitting: Three.js, Rapier e a cidade não fazem parte do
// carregamento inicial. A mesma função permite antecipar o download no clique.
const carregarExperiencia = () => import('./GameExperience.jsx');
const GameExperience = lazy(carregarExperiencia);

export default function App() {
  // Fluxo "A Chegada" (adendo de narrativa): abertura → intro → jogo.
  //  - abertura (StartScreen) é o hub. JOGAR: 1ª vez (intro ainda não vista)
  //    toca a intro; depois vai direto ao jogo. Link "ver a história de novo"
  //    força a intro (e é por onde se corrige o nome — Parte 2).
  //  - O <Canvas>/Physics só monta na fase 'jogo'; nada da simulação roda atrás
  //    da abertura/intro, e o teclado do jogo não conflita com a captura do nome.
  const introVista = useGame((s) => s.introVista);
  const preferencias = useGame((s) => s.preferencias);
  const [fase, setFase] = useState('abertura'); // 'abertura' | 'intro' | 'jogo'

  // Tema cantado removido (decisão de produto): a intro volta a ser silenciosa
  // até o TTS. O tema novo virá como atualização futura — lança sem, adiciona
  // depois. Com ele voltam o asset e o botão de som da StartScreen.

  // Preferências viram classes globais porque abertura, intro e jogo usam a
  // mesma régua de movimento. A limpeza mantém HMR/testes previsíveis.
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const raiz = document.documentElement;
    raiz.classList.toggle('orbi-modo-tranquilo', preferencias.modoTranquilo);
    raiz.classList.toggle('orbi-sem-animacoes', !preferencias.animacoes);
    raiz.classList.toggle('orbi-poucos-detalhes', !preferencias.detalhesVisuais);
    return () => {
      raiz.classList.remove(
        'orbi-modo-tranquilo',
        'orbi-sem-animacoes',
        'orbi-poucos-detalhes'
      );
    };
  }, [preferencias]);

  if (fase === 'abertura') {
    return (
      <StartScreen
        onPlay={() => setFase(introVista ? 'jogo' : 'intro')}
        onPrepararJogo={carregarExperiencia}
        onVerHistoria={() => {
          carregarExperiencia();
          setFase('intro');
        }}
      />
    );
  }

  if (fase === 'intro') {
    return <IntroChegada onConcluir={() => setFase('jogo')} />;
  }

  return (
    <Suspense fallback={<GameLoading />}>
      <GameExperience />
    </Suspense>
  );
}
