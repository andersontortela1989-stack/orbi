import { useEffect } from 'react';
import { Building } from './Building.jsx';
import { ZoneSensor } from './ZoneSensor.jsx';
import { useGame } from '../store/useGame.js';
import { PALETA3D } from '../brand/paleta3d.js';
import { POSTO_POS, POSTO_SIZE } from '../city/posto.js';

/**
 * Posto de gasolina (Fatia 5). MESMA linguagem visual dos prédios da cidade:
 * uma caixa colidível com letreiro 3D em CAIXA ALTA — reaproveita <Building>,
 * sem tocar em City.jsx. Em volta, um sensor de zona (entra/sai) que avisa a
 * store que o carro está perto do posto → abre a interação de abastecimento.
 *
 * Posicionado num canto livre do mapa (à esquerda, longe dos 3 prédios da
 * cidade e do spawn em 0,0), pra navegação continuar legível. Posição e
 * tamanho moram em city/posto.js.
 */

export function GasStation() {
  const setPostoPerto = useGame((s) => s.setPostoPerto);

  // Rede de segurança: se o posto desmontar (HMR/remontagem) com o carro DENTRO
  // da zona, o onIntersectionExit pode não disparar e `postoPerto` ficaria
  // travado em true. Liberar no unmount evita o painel "fantasma".
  useEffect(() => () => setPostoPerto(false), [setPostoPerto]);

  return (
    <>
      <Building
        floorPos={POSTO_POS}
        size={POSTO_SIZE}
        color={PALETA3D.predios.POSTO}
        label="POSTO"
      />

      <ZoneSensor
        floorPos={POSTO_POS}
        size={POSTO_SIZE}
        onEnter={() => setPostoPerto(true)}
        onExit={() => setPostoPerto(false)}
      />
    </>
  );
}
