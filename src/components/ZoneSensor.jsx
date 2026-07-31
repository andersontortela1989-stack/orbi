import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { coordenadorAtividade } from '../activity/index.js';

/**
 * Sensor de ZONA genérico — dispara ao ENTRAR e ao SAIR. Nasceu como
 * PostoSensor (Fatia 5); virou compartilhado quando a GARAGEM trouxe o
 * segundo consumidor real (extração prevista na pendência da Fatia 5.1 —
 * o pedágio será o terceiro). Mesmo contrato de sempre: volume invisível
 * em volta de um footprint [w, l] com `padding` extra, mais alto que o
 * prédio pra sempre conter o chassi do carro (y ≈ 1).
 *
 * Diferente do ArrivalSensor (só entrada, pertence à missão de GPS da
 * Fatia 4 e segue intocado): aqui precisamos do par entrar/sair — painéis
 * de zona abrem E fecham.
 *
 * Filtra por corpo DINÂMICO — na cena atual, só o carro é dinâmico
 * (ignora chão e prédios fixos dentro do volume).
 */
export function ZoneSensor({ floorPos, size, padding = 4, onEnter, onExit }) {
  const [x, z] = floorPos;
  const [w, h, l] = size;

  return (
    <RigidBody type="fixed" position={[x, h / 2, z]} colliders={false}>
      <CuboidCollider
        args={[w / 2 + padding, h, l / 2 + padding]}
        sensor
        onIntersectionEnter={(payload) => {
          if (
            coordenadorAtividade.estado().mundo &&
            payload.other.rigidBody?.isDynamic?.()
          ) {
            onEnter?.();
          }
        }}
        onIntersectionExit={(payload) => {
          if (
            coordenadorAtividade.estado().mundo &&
            payload.other.rigidBody?.isDynamic?.()
          ) {
            onExit?.();
          }
        }}
      />
    </RigidBody>
  );
}
