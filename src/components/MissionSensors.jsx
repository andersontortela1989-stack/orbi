import { ArrivalSensor } from './ArrivalSensor.jsx';
import { useGame } from '../store/useGame.js';
import { PREDIOS_GPS } from '../missions/destinos.js';
import { coordenadorAtividade } from '../activity/index.js';
import {
  aventuraAtiva,
  enviarEventoAventura,
} from '../adventure/runtime.js';

/**
 * Coloca um sensor de chegada em cada prédio da cidade. A aventura ativa tem
 * prioridade; fora dela, encaminha ao fluxo legado de GPS/Ciências.
 *
 * Sem foco de missão (carona/painel), a chegada é ignorada.
 */
export function MissionSensors() {
  const processarChegada = useGame((s) => s.processarChegada);

  const chegou = (slug) => {
    // Missão suspensa por carona/painel nunca progride por baixo do foco.
    if (!coordenadorAtividade.temFoco('em_missao')) return;
    if (aventuraAtiva()) {
      enviarEventoAventura({ tipo: 'chegou', lugar: slug });
      return;
    }
    processarChegada(slug);
  };

  return (
    <>
      {PREDIOS_GPS.map(({ slug, floorPos, size }) => (
        <ArrivalSensor
          key={slug}
          floorPos={floorPos}
          size={size}
          onArrival={() => chegou(slug)}
        />
      ))}
    </>
  );
}
