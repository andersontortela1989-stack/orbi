import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PALETA3D } from '../brand/paleta3d.js';
import { useGame } from '../store/useGame.js';
import { useAdventure } from '../adventure/useAdventure.js';
import { perfilVisual } from '../visual/world-style.js';
import { geometriaDe } from '../visual/geometria-mesclada.js';
import {
  COR_BROTO,
  COR_TERRA,
  TOPO_DA_TERRA,
  brotosVisiveis,
  escalaInicialDosBrotos,
  malhasDaHortaEscola,
} from '../school/horta-mundo.js';

/**
 * Horta viva da ESCOLA (H2) — dados em school/horta-mundo.js. Canteiros
 * sempre (a pista parada antes da primeira Horta); brotos com
 * `horta_escola_viva`. Sem corpo físico.
 *
 * Os brotos crescem UMA vez, só em altura, a partir da terra (o grupo fica no
 * topo dela): quando a flag liga nesta sessão, esperam o resumo fechar e
 * crescem. Com a flag vinda do save, com Modo Tranquilo ou com animações
 * desligadas, aparecem prontos. Repetir a Horta não faz crescer de novo.
 *
 * Materiais de cor lisa (Lambert, como as flores do parque; contorno básico
 * pelo avesso, como o Building): nenhum programa de shader novo no estilo
 * atual.
 */
export function HortaEscola() {
  const viva = useGame((s) => !!s.worldFlags?.horta_escola_viva);
  const preferencias = useGame((s) => s.preferencias);
  const aventuraAtiva = useAdventure().ativa;
  const visual = perfilVisual(preferencias);

  const vivaAoAbrir = useRef(viva);
  const jaApareceram = useRef(false);
  const escala = useRef(1);
  const grupo = useRef(null);

  const geo = useMemo(() => {
    const m = malhasDaHortaEscola({ viva: true });
    const brotos = geometriaDe(m.brotos);
    brotos.translate(0, -TOPO_DA_TERRA, 0); // a escala em y parte da terra
    return {
      canteiros: geometriaDe(m.canteiros),
      contorno: geometriaDe(m.contorno),
      brotos,
    };
  }, []);
  useEffect(
    () => () => {
      geo.canteiros.dispose();
      geo.contorno.dispose();
      geo.brotos.dispose();
    },
    [geo]
  );

  const visiveis = brotosVisiveis({
    viva,
    vivaAoAbrir: vivaAoAbrir.current,
    jaApareceram: jaApareceram.current,
    aventuraAtiva,
  });
  // Primeira vez à vista: decide se cresce ou já aparece pronto. Idempotente
  // (a segunda renderização do StrictMode já encontra jaApareceram ligado).
  if (visiveis && !jaApareceram.current) {
    jaApareceram.current = true;
    escala.current = escalaInicialDosBrotos({
      vivaAoAbrir: vivaAoAbrir.current,
      animacoes: visual.animacoes,
    });
  }

  useFrame((_, delta) => {
    if (!grupo.current || escala.current >= 1) return;
    escala.current = visual.animacoes
      ? escala.current + (1 - escala.current) * Math.min(1, delta * 2.2)
      : 1;
    if (escala.current > 0.995) escala.current = 1;
    grupo.current.scale.set(1, escala.current, 1);
  });

  return (
    <>
      <mesh geometry={geo.contorno}>
        <meshBasicMaterial color={PALETA3D.contorno} side={THREE.BackSide} />
      </mesh>
      <mesh geometry={geo.canteiros}>
        <meshLambertMaterial color={COR_TERRA} />
      </mesh>
      {visiveis && (
        <group ref={grupo} position={[0, TOPO_DA_TERRA, 0]} scale={[1, escala.current, 1]}>
          <mesh geometry={geo.brotos}>
            <meshLambertMaterial color={COR_BROTO} />
          </mesh>
        </group>
      )}
    </>
  );
}
