import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Stats } from '@react-three/drei';
import { Ceu } from './components/Ceu.jsx';
import { Game } from './components/Game.jsx';
import { HUD } from './components/HUD.jsx';
import { RefuelPanel } from './components/RefuelPanel.jsx';
import { GaragemPanel } from './components/GaragemPanel.jsx';
import { ChegadaVivaPanel } from './components/ChegadaVivaPanel.jsx';
import { Caderninho } from './components/Caderninho.jsx';
import { WelcomeVoice } from './components/WelcomeVoice.jsx';
import { MissionController } from './components/MissionController.jsx';
import { zoomDoViewport } from './components/CameraFollow.jsx';
import { OrbiCompanion } from './components/OrbiCompanion.jsx';
import { TouchControls } from './components/TouchControls.jsx';
import { Buzina } from './components/Buzina.jsx';
import { OrientationGuard } from './components/OrientationGuard.jsx';
import { AdventureController } from './components/AdventureController.jsx';
import { SensorySettings } from './components/SensorySettings.jsx';

/**
 * Fronteira pesada do aplicativo. Este arquivo concentra Three.js, Rapier e
 * toda a simulação; App.jsx o importa de forma dinâmica somente após JOGAR.
 */
export default function GameExperience() {
  // O canvas ortográfico precisa nascer em paisagem. Uma vez liberado, nunca
  // desmonta ao inclinar o aparelho: o guard cobre a tela sem resetar a física.
  const [canvasLiberado, setCanvasLiberado] = useState(
    () =>
      typeof window === 'undefined' ||
      !window.matchMedia ||
      window.matchMedia('(orientation: landscape)').matches
  );

  useEffect(() => {
    if (canvasLiberado) return;
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(orientation: landscape)');
    const liberar = () => {
      if (mq.matches) setCanvasLiberado(true);
    };
    liberar();
    if (mq.addEventListener) mq.addEventListener('change', liberar);
    else mq.addListener(liberar);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', liberar);
      else mq.removeListener(liberar);
    };
  }, [canvasLiberado]);

  return (
    <>
      {canvasLiberado && (
        <Canvas
          dpr={[1, 2]}
          orthographic
          camera={{
            zoom: zoomDoViewport(),
            position: [0, 44, 24],
            near: 0.1,
            far: 500,
          }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <Ceu />
          {import.meta.env.DEV && <Stats />}
          <Suspense>
            <Physics gravity={[0, -30, 0]}>
              <Game />
            </Physics>
          </Suspense>
        </Canvas>
      )}

      <HUD />
      <RefuelPanel />
      <GaragemPanel />
      <ChegadaVivaPanel />
      <Caderninho />
      <SensorySettings variant="game" />
      <TouchControls />
      <div className="controls-hint">
        SETAS = DIRIGIR &nbsp;·&nbsp; ESPAÇO = FREIO DE MÃO (DRIFT)
      </div>
      <WelcomeVoice />
      <AdventureController />
      <MissionController />
      <OrbiCompanion />
      <Buzina />
      <OrientationGuard />
    </>
  );
}
