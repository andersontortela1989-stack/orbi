import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Game } from './components/Game.jsx';
import { HUD } from './components/HUD.jsx';
import { WelcomeVoice } from './components/WelcomeVoice.jsx';

export default function App() {
  return (
    <>
      <Canvas
        shadows
        orthographic
        camera={{
          zoom: 32,
          position: [0, 35, 22],
          near: 0.1,
          far: 500,
        }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#2c333f']} />
        <fog attach="fog" args={['#2c333f', 80, 180]} />
        <Suspense>
          <Physics gravity={[0, -30, 0]}>
            <Game />
          </Physics>
        </Suspense>
      </Canvas>

      {/* Overlays 2D — fora do Canvas, React puro */}
      <HUD />
      <div className="controls-hint">
        SETAS = DIRIGIR &nbsp;·&nbsp; ESPAÇO = FREIO DE MÃO (DRIFT)
      </div>
      <WelcomeVoice />
    </>
  );
}
