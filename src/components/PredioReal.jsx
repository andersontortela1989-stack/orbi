import { useEffect, useMemo } from 'react';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { Text } from '@react-three/drei';
import { useGame } from '../store/useGame.js';
import { perfilVisual } from '../visual/world-style.js';
import { geometriaDe } from '../visual/geometria-mesclada.js';
import { PALETA_REAL } from '../visual/estilo-real/paleta.js';
import { MATERIAL_CONTORNO, MATERIAL_OPACO } from '../visual/estilo-real/materiais.js';
import {
  PREDIOS_REAIS,
  colisorDoLote,
  malhasDoPredio,
} from '../visual/estilo-real/predio-real.js';
import { AderecosLugar } from './AderecosLugar.jsx';

/**
 * Prédio no ESTILO REAL (fatia V1, `?estilo=real`). Troca só o desenho do
 * Building: o colisor é o mesmo (mesma pegada, mesma posição — testado), e
 * sensores, missão e roteiro não sabem qual estilo está na tela.
 *
 * Desenho em poucas chamadas: as dezenas de peças viram UMA malha opaca com
 * cor por vértice (material compartilhado), mais o vidro aceso da vitrine,
 * o contorno fino (V1.2b), o letreiro e os pães sem contorno. Nada animado; no
 * Modo Tranquilo só o brilho da vitrine baixa — letreiro, vitrine, toldo e
 * placa bandeira ficam.
 *
 * As letras do letreiro são preparadas na MONTAGEM (o Text da drei chama o
 * sync do troika no useLayoutEffect), junto com a cidade, e os materiais são
 * pré-compilados pelo <PreCompilar> — nada é gerado na primeira aparição.
 */

// Vitrine acesa (V1.2b): mais clara que a fachada; o Modo Tranquilo baixa.
const BRILHO_VITRINE = 1.0;
const BRILHO_VITRINE_TRANQUILO = 0.45;

export function PredioReal({ predio }) {
  const { slug, pos, size } = predio;
  const geo = useMemo(() => {
    const malhas = malhasDoPredio(slug, size);
    return {
      opaco: geometriaDe(malhas.opaco),
      // sem vitrine acesa (MERCADO), nem cria a malha: zero chamadas
      luz: malhas.luz.triangulos > 0 ? geometriaDe(malhas.luz) : null,
      contorno: geometriaDe(malhas.contorno),
    };
  }, [slug, size]);
  // Geometria passada por prop não é descartada pelo R3F: descarta aqui.
  useEffect(() => () => {
    geo.opaco.dispose();
    geo.luz?.dispose();
    geo.contorno.dispose();
  }, [geo]);

  const preferencias = useGame((s) => s.preferencias);
  const visual = perfilVisual(preferencias);
  const colisor = colisorDoLote(predio);
  const letreiro = PREDIOS_REAIS[slug].letreiro(size);
  // Colisores próprios (V1.3: a banca de frutas), do lote para o mundo.
  const extras = PREDIOS_REAIS[slug].colisores(size);

  return (
    <>
      <RigidBody type="fixed" colliders={false} position={colisor.posicao}>
        <CuboidCollider args={colisor.meiaExtensao} />
      </RigidBody>
      {extras.map(({ posicao: [x, y, z], meiaExtensao }, i) => (
        <RigidBody key={i} type="fixed" colliders={false} position={[pos[0] + x, y, pos[1] + z]}>
          <CuboidCollider args={meiaExtensao} />
        </RigidBody>
      ))}

      <group position={[pos[0], 0, pos[1]]}>
        <mesh geometry={geo.contorno} material={MATERIAL_CONTORNO} />
        <mesh geometry={geo.opaco} material={MATERIAL_OPACO} />
        {geo.luz && (
          <mesh geometry={geo.luz}>
            <meshStandardMaterial
              vertexColors
              roughness={0.35}
              emissive={PALETA_REAL.vitrineLuz}
              emissiveIntensity={visual.tranquilo ? BRILHO_VITRINE_TRANQUILO : BRILHO_VITRINE}
            />
          </mesh>
        )}
        <Text
          position={letreiro.posicao}
          fontSize={letreiro.tamanho}
          color={letreiro.cor}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.06}
          fontWeight={700}
        >
          {letreiro.texto}
        </Text>
      </group>

      <AderecosLugar slug={slug} floorPos={pos} size={size} estilo="real" />
    </>
  );
}
