import { Suspense, useState, useEffect } from 'react';
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
import { StartScreen } from './components/StartScreen.jsx';
import { zoomDoViewport } from './components/CameraFollow.jsx';
import { OrbiCompanion } from './components/OrbiCompanion.jsx';
import { IntroChegada } from './components/IntroChegada.jsx';
import { TouchControls } from './components/TouchControls.jsx';
import { Buzina } from './components/Buzina.jsx';
import { OrientationGuard } from './components/OrientationGuard.jsx';
import { useGame } from './store/useGame.js';
import { AdventureController } from './components/AdventureController.jsx';

export default function App() {
  // Fluxo "A Chegada" (adendo de narrativa): abertura → intro → jogo.
  //  - abertura (StartScreen) é o hub. JOGAR: 1ª vez (intro ainda não vista)
  //    toca a intro; depois vai direto ao jogo. Link "ver a história de novo"
  //    força a intro (e é por onde se corrige o nome — Parte 2).
  //  - O <Canvas>/Physics só monta na fase 'jogo'; nada da simulação roda atrás
  //    da abertura/intro, e o teclado do jogo não conflita com a captura do nome.
  const introVista = useGame((s) => s.introVista);
  const [fase, setFase] = useState('abertura'); // 'abertura' | 'intro' | 'jogo'

  // Tema cantado removido (decisão de produto): a intro volta a ser silenciosa
  // até o TTS. O tema novo virá como atualização futura — lança sem, adiciona
  // depois. Com ele voltam o asset e o botão de som da StartScreen.

  // P0 celular: o <Canvas> ortográfico fixa o frustum (left/right/top/bottom)
  // no tamanho do container NO MOUNT — não passamos esses props, quem calcula é
  // o R3F, uma vez. O OrientationGuard é só overlay (não impede a montagem), então
  // montar em RETRATO deixava o mundo enquadrado por um frustum retrato e "sumindo"
  // ao girar pra paisagem. O desktop nunca sofreu porque sempre monta em paisagem.
  // Solução: montar o Canvas SÓ em paisagem — o mesmo caminho comprovado do desktop.
  //
  // TRAVA (mount-once): uma vez liberado, NUNCA volta a false. Inclinar pra retrato
  // no meio do jogo mantém a simulação viva (o guard cobre a tela); desmontar
  // resetaria o rapier — reset-surpresa fere a previsibilidade (TEA). Init em
  // paisagem/desktop já nasce true (sem flash); só o retrato inicial espera o giro.
  const [canvasLiberado, setCanvasLiberado] = useState(
    () =>
      typeof window === 'undefined' ||
      !window.matchMedia ||
      window.matchMedia('(orientation: landscape)').matches
  );
  useEffect(() => {
    if (canvasLiberado) return; // trava: já liberou, nada mais a observar
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(orientation: landscape)');
    const upd = () => {
      if (mq.matches) setCanvasLiberado(true); // só liga; nunca desliga
    };
    upd();
    // addEventListener é o moderno; addListener é o fallback (Safari antigo).
    if (mq.addEventListener) mq.addEventListener('change', upd);
    else mq.addListener(upd);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', upd);
      else mq.removeListener(upd);
    };
  }, [canvasLiberado]);

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
      {/* P0 celular: monta o Canvas SÓ em paisagem (canvasLiberado). O frustum
          ortográfico se fixa no tamanho do MOUNT; montar em retrato (atrás do
          OrientationGuard, que é só overlay) enquadrava o mundo errado ao girar.
          Fatia C: sem `shadows` (sombra SÓLIDA, sticker); teto de dpr +
          powerPreference = higiene pra telas grandes/notebooks. */}
      {canvasLiberado && (
      <Canvas
        dpr={[1, 2]}
        orthographic
        camera={{
          // Zoom INICIAL da câmera ortográfica — a MESMA função do CameraFollow
          // (zoomDoViewport: desktop 16 fixo, mobile deriva da altura). Assim o
          // 1º frame já nasce no zoom certo; o CameraFollow segue reforçando ao
          // vivo (o R3F só usa este prop na montagem; mexer aqui não atualiza no
          // HMR). Para reenquadrar, ajuste as constantes em CameraFollow.jsx.
          zoom: zoomDoViewport(),
          position: [0, 44, 24],
          near: 0.1,
          far: 500,
        }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        {/* Céu comandado pela criança (dia/entardecer/noite): fundo + fog +
            luzes num componente só, trocados no toque. O fog desvanece a
            distância pra cor do céu — sem parede preta. */}
        <Ceu />
        {/* FPS dev-only (frente Mundo Adesivo 3D) — baseline antes/depois de
            cada fatia visual. Não existe em build de produção. */}
        {import.meta.env.DEV && <Stats />}
        <Suspense>
          <Physics gravity={[0, -30, 0]}>
            <Game />
          </Physics>
        </Suspense>
      </Canvas>
      )}

      {/* Overlays 2D — fora do Canvas, React puro */}
      <HUD />
      <RefuelPanel />
      <GaragemPanel />
      <ChegadaVivaPanel />
      <Caderninho />
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
