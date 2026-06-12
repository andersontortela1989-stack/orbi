import { useFrame } from '@react-three/fiber';
import { useGame } from '../store/useGame.js';
import { BICHO_POR_SLUG } from '../city/bichos.js';

/**
 * Sensor da missão de BUSCA (Frente 5) — detecção por PROXIMIDADE, zero
 * física (padrão Moedas/BlobShadow: lê a posição do RigidBody do carro em
 * useFrame; Car.jsx intocado, nenhum collider novo — os bichos seguem
 * sem corpo físico, como as árvores).
 *
 * Raio GENEROSO (7, vs 2.6 da moeda): a busca pede "chegar perto", não
 * "encostar" — e achar de passagem é celebração legítima (achou = achou).
 * Idempotência vem do guard de `concluida` em processarBusca (a store é
 * quem decide; aqui só se reporta a distância).
 *
 * Render-less; só faz conta quando a missão ativa é de busca.
 */
const RAIO_BUSCA = 7;

export function BuscaSensor({ targetRef }) {
  const processarBusca = useGame((s) => s.processarBusca);

  useFrame(() => {
    const rb = targetRef.current;
    if (!rb) return;
    const m = useGame.getState().missao;
    if (!m || m.tipo !== 'busca' || m.concluida) return;
    const bicho = BICHO_POR_SLUG[m.destino];
    if (!bicho) return;
    const t = rb.translation();
    const dx = t.x - bicho.pos[0];
    const dz = t.z - bicho.pos[1];
    if (dx * dx + dz * dz < RAIO_BUSCA * RAIO_BUSCA) {
      processarBusca(m.destino);
    }
  });

  return null;
}
