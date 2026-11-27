import { useRef } from 'react';
import { ArrivalSensor } from './ArrivalSensor.jsx';
import { marcar } from '../perf/sonda.js';
import { useGame } from '../store/useGame.js';
import { PREDIOS_GPS } from '../missions/destinos.js';
import { temChegadaViva } from '../missions/chegadas-vivas.js';
import { resolverChegadaSensor } from '../missions/visita-livre.js';
import { coordenadorAtividade } from '../activity/index.js';
import {
  aventuraAtiva,
  enviarEventoAventura,
} from '../adventure/runtime.js';

/**
 * Monta um sensor de chegada para cada prédio da cidade.
 * Missões do roteiro e aventuras continuam obedecendo o foco `em_missao`.
 * Lugares de visita livre (ex.: SHOPPING) também podem abrir quando o foco
 * está livre (`explorando` ou `em_missao` sem aventura/celebração), sem
 * interromper outras atividades nem alterar a parada atual do roteiro.
 */
export function MissionSensors() {
  const dentroDaZona = useRef(new Set());

  const chegou = (slug) => {
    marcar('chegada'); // M1b: só registra com ?medir=1
    const foco = coordenadorAtividade.estado().foco;
    if (foco === 'em_missao') {
      if (aventuraAtiva()) {
        enviarEventoAventura({ tipo: 'chegou', lugar: slug });
        return;
      }
    }
    const estado = useGame.getState();
    const resultado = resolverChegadaSensor(slug, {
      foco,
      aventuraAtiva: aventuraAtiva(),
      chegadaVivaAtiva: !!estado.chegadaViva,
      missaoConcluida: !!estado.missao?.concluida,
      jaNaZona: dentroDaZona.current.has(slug),
      enviarEventoAventura,
      processarChegada: estado.processarChegada,
      temChegadaViva,
      registrarDescoberta: estado.registrarDescoberta,
      abrirChegadaViva: estado.abrirChegadaViva,
    });
    if (resultado === 'visita_livre') {
      dentroDaZona.current.add(slug);
    }
  };

  const saiu = (slug) => {
    dentroDaZona.current.delete(slug);
  };

  return (
    <>
      {PREDIOS_GPS.map(({ slug, floorPos, size }) => (
        <ArrivalSensor
          key={slug}
          floorPos={floorPos}
          size={size}
          onArrival={() => chegou(slug)}
          onLeave={() => saiu(slug)}
        />
      ))}
    </>
  );
}