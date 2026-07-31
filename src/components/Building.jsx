import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { PALETA3D, SOMBRA_SOLIDA, TINTAS } from '../brand/paleta3d.js';
import { useGame } from '../store/useGame.js';
import { perfilVisual } from '../visual/world-style.js';

/**
 * Arquitetura-brinquedo do Órbi 2,5D.
 *
 * O collider continua sendo um único cubo com o footprint histórico. Toda a
 * variedade abaixo é visual: fachadas, telhados, janelas luminosas, marcos e
 * placas flutuantes. Assim o redesign não muda sensores nem dirigibilidade.
 */
const TRACO = 0.2;

const ESTILOS = Object.freeze({
  PIZZA:    { telhado: 'piramide', acento: TINTAS.sun,       janela: '#FFD28B' },
  HOSPITAL: { telhado: 'plano',    acento: TINTAS.coral,     janela: '#BFF4FF' },
  ESCOLA:   { telhado: 'piramide', acento: TINTAS.violet,    janela: '#FFE3A5' },
  MERCADO:  { telhado: 'plano',    acento: TINTAS.grass,     janela: '#FFE09E' },
  PADARIA:  { telhado: 'piramide', acento: TINTAS.sunDeep,   janela: '#FFD39D' },
  PORTO:    { telhado: 'domo',     acento: TINTAS.blueSoft,  janela: '#C5F5FF' },
  FAROL:    { telhado: 'farol',    acento: TINTAS.sun,       janela: '#FFF2B8' },
  PARQUE:   { telhado: 'piramide', acento: TINTAS.grassDeep, janela: '#D8FFCE' },
  ZOO:      { telhado: 'domo',     acento: TINTAS.sun,       janela: '#D6FFD4' },
  VET:      { telhado: 'plano',    acento: TINTAS.coral,     janela: '#C7F2FF' },
  POSTO:    { telhado: 'posto',    acento: TINTAS.blue,      janela: '#FFF0B0' },
  GARAGEM:  { telhado: 'plano',    acento: TINTAS.violet,    janela: '#BEEBFF' },
  'ESTÁDIO': { telhado: 'domo',    acento: TINTAS.sun,       janela: '#E6F8FF' },
});

function Telhado({ tipo, w, h, l, acento }) {
  const y = h / 2;
  if (tipo === 'domo') {
    return (
      <mesh position={[0, y + 0.2, 0]} scale={[w * 0.5, 1.65, l * 0.5]}>
        <sphereGeometry args={[1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={acento} roughness={0.5} />
      </mesh>
    );
  }
  if (tipo === 'piramide') {
    return (
      <mesh position={[0, y + 0.92, 0]} rotation={[0, Math.PI / 4, 0]} scale={[w * 0.67, 1.85, l * 0.67]}>
        <coneGeometry args={[1, 1, 4]} />
        <meshStandardMaterial color={acento} roughness={0.62} />
      </mesh>
    );
  }
  if (tipo === 'farol') {
    return (
      <group position={[0, y, 0]}>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[w * 0.43, w * 0.48, 0.65, 18]} />
          <meshStandardMaterial color={TINTAS.white} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.92, 0]}>
          <cylinderGeometry args={[w * 0.27, w * 0.34, 0.65, 18]} />
          <meshStandardMaterial
            color={TINTAS.glow}
            emissive={TINTAS.glow}
            emissiveIntensity={1.2}
          />
        </mesh>
        <mesh position={[0, 1.42, 0]} rotation={[0, Math.PI / 4, 0]} scale={[w * 0.5, 0.8, w * 0.5]}>
          <coneGeometry args={[1, 1, 4]} />
          <meshStandardMaterial color={TINTAS.violetDeep} roughness={0.7} />
        </mesh>
      </group>
    );
  }
  if (tipo === 'posto') {
    return (
      <group position={[0, y, 0]}>
        <mesh position={[0, 0.38, 1.4]}>
          <boxGeometry args={[w + 2.8, 0.48, l * 0.7]} />
          <meshStandardMaterial color={acento} roughness={0.55} />
        </mesh>
        {[-w * 0.42, w * 0.42].map((x) => (
          <mesh key={x} position={[x, -1.15, l * 0.25]}>
            <cylinderGeometry args={[0.14, 0.18, 3.1, 8]} />
            <meshStandardMaterial color={TINTAS.white} roughness={0.7} />
          </mesh>
        ))}
      </group>
    );
  }
  return (
    <>
      <mesh position={[0, y + 0.2, 0]}>
        <boxGeometry args={[w + 0.75, 0.42, l + 0.75]} />
        <meshStandardMaterial color={TINTAS.violetDeep} roughness={0.68} />
      </mesh>
      <mesh position={[0, y + 0.48, 0]}>
        <boxGeometry args={[w * 0.72, 0.25, l * 0.72]} />
        <meshStandardMaterial color={acento} roughness={0.58} />
      </mesh>
    </>
  );
}

function Janelas({ w, h, l, cor, brilho }) {
  const faixaY = Math.min(0.35, h * 0.04);
  const altura = Math.max(1.15, h * 0.23);
  return (
    <>
      {/* Moldura e vidro na fachada +Z. */}
      <mesh position={[0, faixaY, l / 2 + 0.045]}>
        <boxGeometry args={[w * 0.62 + 0.32, altura + 0.32, 0.13]} />
        <meshBasicMaterial color={TINTAS.violetDeep} />
      </mesh>
      <mesh position={[0, faixaY, l / 2 + 0.12]}>
        <boxGeometry args={[w * 0.62, altura, 0.08]} />
        <meshStandardMaterial color={cor} emissive={cor} emissiveIntensity={brilho} roughness={0.3} />
      </mesh>

      {/* A câmera diagonal também vê a fachada +X. */}
      <mesh position={[w / 2 + 0.045, faixaY, 0]}>
        <boxGeometry args={[0.13, altura + 0.32, l * 0.55 + 0.32]} />
        <meshBasicMaterial color={TINTAS.violetDeep} />
      </mesh>
      <mesh position={[w / 2 + 0.12, faixaY, 0]}>
        <boxGeometry args={[0.08, altura, l * 0.55]} />
        <meshStandardMaterial color={cor} emissive={cor} emissiveIntensity={brilho} roughness={0.3} />
      </mesh>
    </>
  );
}

function Marco({ label, w, h, l, acento, brilho }) {
  const topo = h / 2;
  if (label === 'HOSPITAL' || label === 'VET') {
    return (
      <group position={[0, topo + 1.0, 0]}>
        <mesh><boxGeometry args={[2.5, 0.65, 0.55]} /><meshStandardMaterial color={acento} emissive={acento} emissiveIntensity={brilho} /></mesh>
        <mesh><boxGeometry args={[0.65, 2.5, 0.55]} /><meshStandardMaterial color={acento} emissive={acento} emissiveIntensity={brilho} /></mesh>
      </group>
    );
  }
  if (label === 'PIZZA') {
    return (
      <group position={[0, topo + 1.55, 0]}>
        <mesh><cylinderGeometry args={[1.15, 1.15, 0.22, 20]} /><meshStandardMaterial color={TINTAS.sun} roughness={0.5} /></mesh>
        {[[-0.35, 0.18], [0.4, 0.3], [0.1, -0.4]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.18, z]}><sphereGeometry args={[0.16, 8, 8]} /><meshBasicMaterial color={TINTAS.coral} /></mesh>
        ))}
      </group>
    );
  }
  if (label === 'ESCOLA') {
    return (
      <group position={[0, 0.8, l / 2 + 0.22]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh><cylinderGeometry args={[1.05, 1.05, 0.18, 20]} /><meshStandardMaterial color={TINTAS.white} roughness={0.5} /></mesh>
        <mesh position={[0, 0.14, 0]} rotation={[0, 0, -0.65]}><boxGeometry args={[0.12, 0.85, 0.12]} /><meshBasicMaterial color={TINTAS.violetDeep} /></mesh>
      </group>
    );
  }
  if (label === 'GARAGEM') {
    return (
      <group position={[0, topo + 0.95, 0]} rotation={[0, 0, -0.6]}>
        <mesh><boxGeometry args={[0.42, 2.6, 0.42]} /><meshStandardMaterial color={acento} roughness={0.5} /></mesh>
        <mesh position={[0, 1.35, 0]}><torusGeometry args={[0.72, 0.2, 8, 16, Math.PI * 1.35]} /><meshStandardMaterial color={acento} roughness={0.5} /></mesh>
      </group>
    );
  }
  if (label === 'PARQUE') {
    return (
      <group position={[0, topo + 1.0, 0]}>
        <mesh position={[0, -0.6, 0]}><cylinderGeometry args={[0.2, 0.28, 1.4, 8]} /><meshStandardMaterial color={TINTAS.inkSoft} /></mesh>
        <mesh position={[0, 0.5, 0]}><icosahedronGeometry args={[1.2, 1]} /><meshStandardMaterial color={TINTAS.grass} roughness={0.75} /></mesh>
      </group>
    );
  }
  return null;
}

function Placa({ label, h, w, l, fontSize, acento }) {
  const tamanhoFonte = fontSize ?? Math.max(1.28, Math.min(1.8, Math.min(w, l) * 0.15));
  const placaW = label.length * tamanhoFonte * 0.67 + 1.15;
  const placaH = tamanhoFonte * 1.45;
  return (
    <Billboard position={[0, h / 2 + 2.35, 0]} follow>
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[placaW + 0.35, placaH + 0.35, 0.2]} />
        <meshBasicMaterial color={TINTAS.violetDeep} />
      </mesh>
      <mesh>
        <boxGeometry args={[placaW, placaH, 0.2]} />
        <meshStandardMaterial color={acento} emissive={acento} emissiveIntensity={0.08} roughness={0.55} />
      </mesh>
      <Text
        position={[0, 0, 0.13]}
        fontSize={tamanhoFonte}
        color={TINTAS.white}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.045}
        fontWeight={700}
      >
        {label}
      </Text>
    </Billboard>
  );
}

export function Building({ floorPos, size, color, label, fontSize }) {
  const [x, z] = floorPos;
  const [w, h, l] = size;
  const estilo = ESTILOS[label] ?? ESTILOS.ESCOLA;
  const preferencias = useGame((s) => s.preferencias);
  const visual = perfilVisual(preferencias);
  const farol = label === 'FAROL';

  return (
    <>
      {/* Lote elevado e arredondado pela sobreposição de duas bases. */}
      <mesh position={[x, 0.08, z]}>
        <boxGeometry args={[w + 4.4, 0.16, l + 4.4]} />
        <meshStandardMaterial color={PALETA3D.calcada} roughness={0.9} />
      </mesh>
      <mesh position={[x, 0.175, z]}>
        <boxGeometry args={[w + 3.2, 0.08, l + 3.2]} />
        <meshStandardMaterial color={TINTAS.violetSoft} roughness={0.88} />
      </mesh>

      <mesh position={[x + SOMBRA_SOLIDA.dx, 0.27, z + SOMBRA_SOLIDA.dz]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w + 0.5, l + 0.5]} />
        <meshBasicMaterial color={SOMBRA_SOLIDA.cor} transparent opacity={SOMBRA_SOLIDA.opacidade + 0.04} depthWrite={false} />
      </mesh>

      <RigidBody type="fixed" colliders={false} position={[x, h / 2, z]}>
        {/* Collider único: arquitetura nova não altera a área histórica. */}
        <CuboidCollider args={[w / 2, h / 2, l / 2]} />

        {farol ? (
          <>
            <mesh><cylinderGeometry args={[w * 0.39 + TRACO, w * 0.49 + TRACO, h + TRACO, 18]} /><meshBasicMaterial color={PALETA3D.contorno} side={THREE.BackSide} /></mesh>
            <mesh><cylinderGeometry args={[w * 0.39, w * 0.49, h, 18]} /><meshStandardMaterial color={color} roughness={0.62} /></mesh>
          </>
        ) : (
          <>
            <mesh scale={[(w + 2 * TRACO) / w, (h + 2 * TRACO) / h, (l + 2 * TRACO) / l]}>
              <boxGeometry args={[w, h, l]} />
              <meshBasicMaterial color={PALETA3D.contorno} side={THREE.BackSide} />
            </mesh>
            <mesh><boxGeometry args={[w, h, l]} /><meshStandardMaterial color={color} roughness={0.68} /></mesh>
            <mesh position={[0, -h / 2 + 0.48, l / 2 + 0.08]}>
              <boxGeometry args={[w * 0.92, 0.78, 0.18]} />
              <meshStandardMaterial color={estilo.acento} roughness={0.65} />
            </mesh>
            <Janelas w={w} h={h} l={l} cor={estilo.janela} brilho={visual.brilhoJanela} />
            <mesh position={[0, -h / 2 + 1.1, l / 2 + 0.2]}>
              <boxGeometry args={[Math.max(1.6, w * 0.16), 2.2, 0.26]} />
              <meshStandardMaterial color={TINTAS.violetDeep} roughness={0.5} />
            </mesh>
          </>
        )}

        <Telhado tipo={estilo.telhado} w={w} h={h} l={l} acento={estilo.acento} />
        {visual.detalhes && (
          <Marco label={label} w={w} h={h} l={l} acento={estilo.acento} brilho={visual.brilhoJanela} />
        )}
        <Placa label={label} h={h} w={w} l={l} fontSize={fontSize} acento={estilo.acento} />
      </RigidBody>
    </>
  );
}
