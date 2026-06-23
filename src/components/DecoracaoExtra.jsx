import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { PALETA3D, SOMBRA_SOLIDA } from '../brand/paleta3d.js';

/**
 * DECORAÇÃO EXTRA — "cidade viva": detalhe urbano TERRESTRE, ESTÁTICO, nas
 * bordas dos bairros. Preenche o vazio sem tocar a jogabilidade.
 *
 * SÓ DETALHE URBANO (decisão do gate): arbustos, floreiras, bancos e
 * engradados. Os "toques espaciais" (planetas/orbes, foguete-monumento,
 * antenas) foram CORTADOS — a câmera ORTOGRÁFICA (sem perspectiva) achatava
 * planeta em mancha no chão e foguete deitado em "carro branco"; não liam
 * como espaço de cima. A identidade espacial do Órbi vive na TELA INICIAL
 * (crepúsculo); o MUNDO funciona melhor como cidade limpa e viva.
 *
 * CAMADA ISOLADA E REMOVÍVEL: monta no Game.jsx com 1 linha
 * (<DecoracaoExtra/>). Desligar tudo = comentar essa linha. Segue a fronteira
 * do Cenario.jsx (decoração PURA — nada jogável).
 *
 * REGRAS INVIOLÁVEIS (conferidas no recon):
 *   - SEM COLISÃO: tudo <mesh>/<Instances>, ZERO RigidBody/Collider — o
 *     carro atravessa, nunca trava o Heitor (precedente das árvores).
 *   - 100% ESTÁTICO: nada gira/pulsa/aparece (régua TEA do mundo).
 *   - BAIXO (não ocluir carro/placas). Cores via PALETA3D.deco; predios/
 *     bicho/carro/moeda intocados.
 *   - InstancedMesh por tipo (~3 draw calls/grupo) → leve no celular.
 *
 * POSIÇÕES: bordas dos bairros, folga ≥3–4 de qualquer lote/moeda/bicho/zona.
 */

const TRACO = 0.22; // mesmo traço aditivo do Building/Arvores
const DEITADO = [-Math.PI / 2, 0, 0];

// ---- posições (bordas dos bairros) ---------------------------------------
const ARBUSTOS = [
  [44, 6], [46, 52], [-33, 4], [33, 4],
  [-33, 46], [33, 46], [-74, 12], [-74, 50],
];
const FLOREIRAS = [[-32, -2], [32, -2], [-32, 50], [32, 50]];
const BANCOS = [[-12, 42], [12, 42], [-26, 8], [26, 8]];
const ENGRADADOS = [[-76, 18], [-76, 28], [-74, 46]];

// ---- alturas (baixo na área de jogo) -------------------------------------
const ARB_R = 0.95;
const ENG_S = 1.2; // lado da caixa de doca

function MaterialSombra() {
  return (
    <meshBasicMaterial
      color={SOMBRA_SOLIDA.cor}
      transparent
      opacity={SOMBRA_SOLIDA.opacidade}
      depthWrite={false}
    />
  );
}

/** Sombra sólida instanciada (círculo deitado, offset único do mundo). */
function Sombras({ posicoes, raio }) {
  return (
    <Instances limit={posicoes.length}>
      <circleGeometry args={[raio, 16]} />
      <MaterialSombra />
      {posicoes.map(([x, z], i) => (
        <Instance
          key={i}
          position={[x + SOMBRA_SOLIDA.dx, 0.03, z + SOMBRA_SOLIDA.dz]}
          rotation={DEITADO}
        />
      ))}
    </Instances>
  );
}

export function DecoracaoExtra() {
  return (
    <>
      {/* ===== ARBUSTOS (moitas: copa icosaedro, sem tronco) ===== */}
      <Instances limit={ARBUSTOS.length}>
        <icosahedronGeometry args={[ARB_R + TRACO, 0]} />
        <meshBasicMaterial color={PALETA3D.contorno} side={THREE.BackSide} />
        {ARBUSTOS.map(([x, z], i) => (
          <Instance key={i} position={[x, ARB_R, z]} />
        ))}
      </Instances>
      <Instances limit={ARBUSTOS.length}>
        <icosahedronGeometry args={[ARB_R, 0]} />
        <meshLambertMaterial />
        {ARBUSTOS.map(([x, z], i) => (
          <Instance
            key={i}
            position={[x, ARB_R, z]}
            color={i % 2 ? PALETA3D.deco.arbustoEsc : PALETA3D.deco.arbusto}
          />
        ))}
      </Instances>
      <Sombras posicoes={ARBUSTOS} raio={ARB_R} />

      {/* ===== FLOREIRAS (caixa baixa + topo verde) ===== */}
      <Instances limit={FLOREIRAS.length}>
        <boxGeometry args={[1.3, 0.6, 1.3]} />
        <meshLambertMaterial color={PALETA3D.deco.floreira} />
        {FLOREIRAS.map(([x, z], i) => (
          <Instance key={i} position={[x, 0.3, z]} />
        ))}
      </Instances>
      <Instances limit={FLOREIRAS.length}>
        <boxGeometry args={[1.1, 0.3, 1.1]} />
        <meshLambertMaterial color={PALETA3D.deco.floreiraTopo} />
        {FLOREIRAS.map(([x, z], i) => (
          <Instance key={i} position={[x, 0.7, z]} />
        ))}
      </Instances>
      <Sombras posicoes={FLOREIRAS} raio={1.0} />

      {/* ===== BANCOS (assento + 2 pés) ===== */}
      <Instances limit={BANCOS.length}>
        <boxGeometry args={[1.7, 0.16, 0.5]} />
        <meshLambertMaterial color={PALETA3D.deco.banco} />
        {BANCOS.map(([x, z], i) => (
          <Instance key={i} position={[x, 0.5, z]} />
        ))}
      </Instances>
      <Instances limit={BANCOS.length * 2}>
        <boxGeometry args={[0.16, 0.45, 0.45]} />
        <meshLambertMaterial color={PALETA3D.deco.banco} />
        {BANCOS.flatMap(([x, z], i) => [
          <Instance key={`${i}a`} position={[x - 0.7, 0.225, z]} />,
          <Instance key={`${i}b`} position={[x + 0.7, 0.225, z]} />,
        ])}
      </Instances>
      <Sombras posicoes={BANCOS} raio={1.0} />

      {/* ===== ENGRADADOS (caixas de doca: corpo + contorno) ===== */}
      <Instances limit={ENGRADADOS.length}>
        <boxGeometry
          args={[ENG_S + 2 * TRACO, ENG_S + 2 * TRACO, ENG_S + 2 * TRACO]}
        />
        <meshBasicMaterial color={PALETA3D.contorno} side={THREE.BackSide} />
        {ENGRADADOS.map(([x, z], i) => (
          <Instance key={i} position={[x, ENG_S / 2, z]} />
        ))}
      </Instances>
      <Instances limit={ENGRADADOS.length}>
        <boxGeometry args={[ENG_S, ENG_S, ENG_S]} />
        <meshLambertMaterial color={PALETA3D.deco.engradado} />
        {ENGRADADOS.map(([x, z], i) => (
          <Instance key={i} position={[x, ENG_S / 2, z]} />
        ))}
      </Instances>
      <Sombras posicoes={ENGRADADOS} raio={ENG_S * 0.7} />
    </>
  );
}
