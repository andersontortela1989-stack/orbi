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
import { CAMERA_2_5D } from './visual/world-style.js';

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

  // ESPERAR O LAYOUT ASSENTAR — não basta a orientação virar. No celular REAL a
  // rotação é animada, e o evento de orientação chega NO MEIO dela, com o
  // viewport ainda em trânsito. Montar nesse instante congela um enquadramento
  // torto: o mundo abre vazio (só o céu) e NÃO se recupera sozinho — o R3F até
  // corrige o frustum a cada resize, mas o zoom do CameraFollow é calculado uma
  // única vez no mount e reafirmado a cada frame, então nasce errado e fica.
  // Só um F5 em paisagem conserta — foi exatamente o que o gate no aparelho do
  // Heitor mostrou (2026-08-05).
  //
  // Solução: o matchMedia continua sendo o SE; isto é só o QUANDO. Libera
  // quando o tamanho da tela ficar IGUAL em dois frames seguidos. É condição,
  // não temporizador — nada de chutar "300ms" e torcer. Enquanto o tamanho
  // mudar, a checagem se reagenda sozinha, então não existe impasse: qualquer
  // tela que pare de mudar libera, mesmo reportando dimensões estranhas.
  useEffect(() => {
    if (canvasLiberado) return; // trava: já liberou, nada mais a observar
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(orientation: landscape)');

    let rafA = 0;
    let rafB = 0;
    const cancelar = () => {
      cancelAnimationFrame(rafA);
      cancelAnimationFrame(rafB);
    };
    const tentar = () => {
      cancelar();
      if (!mq.matches) return; // retrato: nem começa (zero loop em espera)
      const w = window.innerWidth;
      const h = window.innerHeight;
      rafA = requestAnimationFrame(() => {
        rafB = requestAnimationFrame(() => {
          if (!mq.matches) return;
          if (window.innerWidth === w && window.innerHeight === h) {
            setCanvasLiberado(true); // assentou — só liga; nunca desliga
          } else {
            tentar(); // ainda mudando: recomeça do tamanho novo
          }
        });
      });
    };
    tentar();
    // addEventListener é o moderno; addListener é o fallback (Safari antigo).
    if (mq.addEventListener) mq.addEventListener('change', tentar);
    else mq.addListener(tentar);
    window.addEventListener('resize', tentar);
    window.addEventListener('orientationchange', tentar);
    return () => {
      cancelar();
      if (mq.removeEventListener) mq.removeEventListener('change', tentar);
      else mq.removeListener(tentar);
      window.removeEventListener('resize', tentar);
      window.removeEventListener('orientationchange', tentar);
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
            position: [...CAMERA_2_5D.offset],
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
