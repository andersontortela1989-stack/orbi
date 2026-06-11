import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Stats } from '@react-three/drei';
import { PALETA3D } from './brand/paleta3d.js';
import { Game } from './components/Game.jsx';
import { HUD } from './components/HUD.jsx';
import { RefuelPanel } from './components/RefuelPanel.jsx';
import { GaragemPanel } from './components/GaragemPanel.jsx';
import { ChegadaVivaPanel } from './components/ChegadaVivaPanel.jsx';
import { Caderninho } from './components/Caderninho.jsx';
import { WelcomeVoice } from './components/WelcomeVoice.jsx';
import { MissionController } from './components/MissionController.jsx';
import { StartScreen } from './components/StartScreen.jsx';
import { OrbiCompanion } from './components/OrbiCompanion.jsx';
import { IntroChegada } from './components/IntroChegada.jsx';
import { useGame } from './store/useGame.js';

export default function App() {
  // Fluxo "A Chegada" (adendo de narrativa): abertura → intro → jogo.
  //  - abertura (StartScreen) é o hub. JOGAR: 1ª vez (intro ainda não vista)
  //    toca a intro; depois vai direto ao jogo. Link "ver a história de novo"
  //    força a intro (e é por onde se corrige o nome — Parte 2).
  //  - O <Canvas>/Physics só monta na fase 'jogo'; nada da simulação roda atrás
  //    da abertura/intro, e o teclado do jogo não conflita com a captura do nome.
  const introVista = useGame((s) => s.introVista);
  const [fase, setFase] = useState('abertura'); // 'abertura' | 'intro' | 'jogo'

  if (fase === 'abertura') {
    return (
      <StartScreen
        onPlay={() => setFase(introVista ? 'jogo' : 'intro')}
        onVerHistoria={() => setFase('intro')}
      />
    );
  }

  if (fase === 'intro') {
    return <IntroChegada onConcluir={() => setFase('jogo')} />;
  }

  return (
    <>
      {/* Fatia C: sem `shadows` (sombra é SÓLIDA, estilo sticker — ver
          Cenario.jsx/Building.jsx); teto de dpr e powerPreference =
          higiene preventiva pra telas grandes/notebooks. */}
      <Canvas
        dpr={[1, 2]}
        orthographic
        camera={{
          // Zoom INICIAL da câmera ortográfica. O valor que vale ao vivo é
          // garantido pelo CameraFollow (o R3F só usa este prop na montagem;
          // mexer aqui sozinho não atualiza no HMR). Mantido em sincronia com o
          // ZOOM de lá. Para reenquadrar, ajuste ZOOM em CameraFollow.jsx.
          zoom: 18,
          position: [0, 44, 24],
          near: 0.1,
          far: 500,
        }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        {/* DIA ADESIVO (frente Mundo Adesivo 3D): céu claro da marca; o fog
            desvanece a distância pro céu-profundo — sem parede preta. */}
        <color attach="background" args={[PALETA3D.ceu]} />
        <fog attach="fog" args={[PALETA3D.neblina, 80, 180]} />
        {/* FPS dev-only (frente Mundo Adesivo 3D) — baseline antes/depois de
            cada fatia visual. Não existe em build de produção. */}
        {import.meta.env.DEV && <Stats />}
        <Suspense>
          <Physics gravity={[0, -30, 0]}>
            <Game />
          </Physics>
        </Suspense>
      </Canvas>

      {/* Overlays 2D — fora do Canvas, React puro */}
      <HUD />
      <RefuelPanel />
      <GaragemPanel />
      <ChegadaVivaPanel />
      <Caderninho />
      <div className="controls-hint">
        SETAS = DIRIGIR &nbsp;·&nbsp; ESPAÇO = FREIO DE MÃO (DRIFT)
      </div>
      <WelcomeVoice />
      <MissionController />
      <OrbiCompanion />
    </>
  );
}
