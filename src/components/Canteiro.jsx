import { Arvores } from './Arvores.jsx';
import { CANTEIRO } from '../city/canteiro.js';
import { PALETA3D } from '../brand/paleta3d.js';

/**
 * Canteiro contável do PARQUE (Frente 5) — render do city/canteiro.js:
 * base de calçada branca ("recheio de adesivo" — o agrupador perceptual
 * que delimita SEM cercar) + as N árvores pela receita compartilhada
 * <Arvores> (a mesma das decorativas: a criança conta árvores idênticas
 * às que conhece, só o canteiro diz quais são "as daqui").
 *
 * Y da base: 0.02 — a camada das calçadas na pilha anti-z-fighting do
 * Cenario (mesma natureza visual de lote).
 */
const DEITADO = [-Math.PI / 2, 0, 0];

export function Canteiro() {
  const { centro, tamanho } = CANTEIRO.base;
  return (
    <>
      <mesh position={[centro[0], 0.02, centro[1]]} rotation={DEITADO}>
        <planeGeometry args={tamanho} />
        <meshStandardMaterial color={PALETA3D.calcada} roughness={0.95} />
      </mesh>
      <Arvores posicoes={CANTEIRO.arvores} />
    </>
  );
}
