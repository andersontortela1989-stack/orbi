import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Game } from './components/Game.jsx';
import { HUD } from './components/HUD.jsx';
import { RefuelPanel } from './components/RefuelPanel.jsx';
import { WelcomeVoice } from './components/WelcomeVoice.jsx';
import { MissionController } from './components/MissionController.jsx';

export default function App() {
  return (
    <>
      <Canvas
        shadows
        orthographic
        camera={{
          // Zoom INICIAL da câmera ortográfica. O valor que vale ao vivo é
          // garantido pelo CameraFollow (o R3F só usa este prop na montagem;
          // mexer aqui sozinho não atualiza no HMR). Mantido em sincronia com o
          // ZOOM de lá. Para reenquadrar, ajuste ZOOM em CameraFollow.jsx.
          zoom: 14,
          position: [0, 44, 24],
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
      <RefuelPanel />
      <div className="controls-hint">
        SETAS = DIRIGIR &nbsp;·&nbsp; ESPAÇO = FREIO DE MÃO (DRIFT)
      </div>
      <WelcomeVoice />
      <MissionController />
    </>
  );
}
