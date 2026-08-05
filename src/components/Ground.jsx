import { RigidBody } from '@react-three/rapier';
import { PALETA3D } from '../brand/paleta3d.js';

const SIZE = 400;
// ESPESSURA É REDE DE SEGURANÇA, NÃO ESTÉTICA. O topo da caixa fica SEMPRE em
// y=0 (o mesh é posicionado em -THICKNESS/2), então engrossar não muda nada do
// que se vê nem de onde o carro pisa — muda só a margem POR BAIXO.
//
// Era 1. O carro nasce em y=1 e cai; se ele aparecer abaixo de y=-1 uma única
// vez, some pra sempre — e foi isso que quebrou o celular (gate 2026-08-05):
// girar o aparelho fazia a cidade aparecer e sumir. Medido: queda livre pura,
// 397 u/s e acelerando, câmera junto (ela gruda no carro), mundo inteiro fora
// do frustum. O `<Physics>` do rapier acumula o tempo perdido e roda até 0,5 s
// de simulação num frame só — 3,75 unidades de deslocamento pra um corpo em
// queda. Contra uma barreira de 1 unidade, passa direto.
//
// 20 dá quase 6× o pior salto possível. Não depende de saber QUAL frame foi o
// culpado: nenhum lote plausível atravessa isso.
const THICKNESS = 20;

export function Ground() {
  return (
    <RigidBody type="fixed" colliders="cuboid" friction={0.6}>
      <mesh position={[0, -THICKNESS / 2, 0]}>
        <boxGeometry args={[SIZE, THICKNESS, SIZE]} />
        {/* Chão-base = as RUAS (o negativo entre os chãos dos bairros):
            asfalto claro do dia adesivo. */}
        <meshStandardMaterial color={PALETA3D.asfalto} roughness={0.95} metalness={0.0} />
      </mesh>
    </RigidBody>
  );
}
