import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { TINTAS } from '../brand/paleta3d.js';
import { useGame } from '../store/useGame.js';
import { useAdventure } from '../adventure/useAdventure.js';
import { perfilVisual } from '../visual/world-style.js';
import {
  ESCALA_BOTAO,
  POSICOES_FLORES,
  escalaInicialDasFlores,
  floresCrescem,
} from '../city/flores-parque.js';

function Flor({ pos, cor, grupoRef, escala }) {
  return (
    <group ref={grupoRef} position={[pos[0], 0, pos[1]]} scale={escala}>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 1.2, 8]} />
        <meshLambertMaterial color={TINTAS.grassDeep} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angulo) => (
        <mesh
          key={angulo}
          position={[Math.cos(angulo) * 0.28, 1.28, Math.sin(angulo) * 0.28]}
          scale={[0.42, 0.18, 0.42]}
        >
          <sphereGeometry args={[0.55, 10, 8]} />
          <meshLambertMaterial color={cor} />
        </mesh>
      ))}
      <mesh position={[0, 1.28, 0]}>
        <sphereGeometry args={[0.18, 10, 8]} />
        <meshBasicMaterial color={TINTAS.sun} />
      </mesh>
    </group>
  );
}

/**
 * Consequência visual permanente da aventura do parque (dados em
 * city/flores-parque.js). H3: cada flor cresce em torno da PRÓPRIA base — antes
 * o grupo inteiro escalava em torno da origem do mundo e as flores "voavam"
 * até o parque (dívida 38) — e só quando o resumo fecha, como os brotos da
 * ESCOLA. Sem animações (ou Modo Tranquilo), vão direto ao tamanho final.
 */
export function FloresParque() {
  const florida = useGame((s) => !!s.worldFlags?.parque_florido);
  const preferencias = useGame((s) => s.preferencias);
  const aventuraAtiva = useAdventure().ativa;
  const visual = perfilVisual(preferencias);
  const grupos = useRef([]);
  const floridaAoAbrir = useRef(florida);
  const jaCresceram = useRef(florida);
  const escala = useRef(escalaInicialDasFlores(florida));

  const crescer = floresCrescem({
    florida,
    floridaAoAbrir: floridaAoAbrir.current,
    jaCresceram: jaCresceram.current,
    aventuraAtiva,
  });
  if (crescer) jaCresceram.current = true;
  if (!florida) jaCresceram.current = false; // progresso apagado: botões de novo

  useFrame((_, delta) => {
    const alvo = crescer ? 1 : ESCALA_BOTAO;
    if (escala.current === alvo) return;
    escala.current = visual.animacoes
      ? escala.current + (alvo - escala.current) * Math.min(1, delta * 2.2)
      : alvo;
    if (Math.abs(alvo - escala.current) < 0.005) escala.current = alvo;
    for (const g of grupos.current) g?.scale.setScalar(escala.current);
  });

  return (
    <>
      {POSICOES_FLORES.map((pos, i) => (
        <Flor
          key={`${pos[0]}:${pos[1]}`}
          pos={pos}
          cor={i % 2 === 0 ? TINTAS.coral : TINTAS.blue}
          escala={escala.current}
          grupoRef={(g) => {
            grupos.current[i] = g;
          }}
        />
      ))}
    </>
  );
}
