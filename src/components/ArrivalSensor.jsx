import { RigidBody, CuboidCollider } from '@react-three/rapier';

/**
 * Volume invisível envolvendo um prédio. Dispara `onArrival` quando um corpo
 * DINÂMICO entra (na cena atual, só o carro é dinâmico — filtro por bodyType
 * ignora chão e prédios fixos que ficam dentro do volume).
 *
 * `padding` controla o raio extra além das paredes do prédio.
 * O volume é mais alto que o prédio (h em y) pra garantir que o chassi do
 * carro (y ≈ 1) sempre esteja dentro independente da altura do prédio.
 */
export function ArrivalSensor({ floorPos, size, padding = 3.5, onArrival }) {
  const [x, z] = floorPos;
  const [w, h, l] = size;

  return (
    <RigidBody type="fixed" position={[x, h / 2, z]} colliders={false}>
      <CuboidCollider
        args={[w / 2 + padding, h, l / 2 + padding]}
        sensor
        onIntersectionEnter={(payload) => {
          // Filtra: só corpos dinâmicos (na cena atual, só o carro).
          // Ignora chão e prédios fixos que ficam dentro do volume do sensor.
          if (payload.other.rigidBody?.isDynamic?.()) {
            onArrival();
          }
        }}
      />
    </RigidBody>
  );
}
