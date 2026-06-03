import { ArrivalSensor } from './ArrivalSensor.jsx';
import { useGame } from '../store/useGame.js';
import { PREDIOS_GPS } from '../missions/destinos.js';

/**
 * Coloca um sensor de chegada em cada prédio da cidade.
 * Quando o carro entra na zona de qualquer prédio, dispara
 * `processarChegada(slug)` na store — que checa contra a missão ativa
 * e (se bater) marca concluída + registra a habilidade leituraGlobal.
 *
 * Acerto → MissionController reage e celebra. Errado → silêncio.
 */
export function MissionSensors() {
  const processarChegada = useGame((s) => s.processarChegada);

  return (
    <>
      {PREDIOS_GPS.map(({ slug, floorPos, size }) => (
        <ArrivalSensor
          key={slug}
          floorPos={floorPos}
          size={size}
          onArrival={() => processarChegada(slug)}
        />
      ))}
    </>
  );
}
