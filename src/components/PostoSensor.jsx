import { RigidBody, CuboidCollider } from '@react-three/rapier';

/**
 * Sensor de ZONA do posto (Fatia 5). Igual em espírito ao ArrivalSensor da
 * missão de GPS, mas com ENTRADA e SAÍDA — precisamos saber quando o carro
 * entra na zona (abre o abastecimento) E quando sai (fecha).
 *
 * Componente separado de propósito: NÃO toca no ArrivalSensor (que pertence à
 * missão de GPS da Fatia 4 e está aprovado).
 *
 * Filtra por corpo DINÂMICO — na cena atual, só o carro é dinâmico.
 */
export function PostoSensor({ floorPos, size, padding = 4, onEnter, onExit }) {
  const [x, z] = floorPos;
  const [w, h, l] = size;

  return (
    <RigidBody type="fixed" position={[x, h / 2, z]} colliders={false}>
      <CuboidCollider
        args={[w / 2 + padding, h, l / 2 + padding]}
        sensor
        onIntersectionEnter={(payload) => {
          if (payload.other.rigidBody?.isDynamic?.()) onEnter?.();
        }}
        onIntersectionExit={(payload) => {
          if (payload.other.rigidBody?.isDynamic?.()) onExit?.();
        }}
      />
    </RigidBody>
  );
}
