import { Building } from './Building.jsx';
import { BAIRROS } from '../city/bairros.js';

/**
 * Cidade em BAIRROS temáticos contíguos (Fatia 7).
 *
 * Mundo contínuo, SEM menu e SEM teleporte: o carro dirige e entra na região.
 * Cada bairro tem um CHÃO colorido próprio (identidade visual da região — o
 * jogador sente que mudou de bairro pela cor, sem texto avisando) e seus
 * prédios com letreiros 3D em CAIXA ALTA. As regiões ficam lado a lado,
 * separadas por faixas do asfalto-base escuro (as "ruas"), o que dá uma
 * transição suave sem costura dura entre cores.
 *
 * Tudo vem de uma fonte única (src/city/bairros.js) — a mesma que alimenta os
 * sensores do GPS, então render e missão nunca saem de sincronia.
 *
 * Guard-rails: paleta calma e distinta por bairro, poucos prédios por região,
 * geometria simples (performance > riqueza visual — roda liso no notebook).
 */
export function City() {
  return (
    <>
      {BAIRROS.map((bairro) => (
        <group key={bairro.slug}>
          {/* Chão do bairro — visual apenas (sem colisão; o Ground base já é o
              piso físico). Levemente acima da base (y=0) e ABAIXO da grade
              (y=0.01), pra grade continuar visível por cima da cor. */}
          <mesh
            position={[bairro.chao.centro[0], 0.005, bairro.chao.centro[1]]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[bairro.chao.tamanho[0], bairro.chao.tamanho[1]]} />
            <meshStandardMaterial color={bairro.corChao} roughness={0.96} metalness={0} />
          </mesh>

          {bairro.predios.map((p) => (
            <Building
              key={p.slug}
              floorPos={p.pos}
              size={p.size}
              color={p.cor}
              label={p.slug}
            />
          ))}
        </group>
      ))}
    </>
  );
}
