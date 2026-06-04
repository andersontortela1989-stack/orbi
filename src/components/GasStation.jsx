import { useEffect } from 'react';
import { Building } from './Building.jsx';
import { PostoSensor } from './PostoSensor.jsx';
import { useGame } from '../store/useGame.js';

/**
 * Posto de gasolina (Fatia 5). MESMA linguagem visual dos prédios da cidade:
 * uma caixa colidível com letreiro 3D em CAIXA ALTA — reaproveita <Building>,
 * sem tocar em City.jsx. Em volta, um sensor de zona (entra/sai) que avisa a
 * store que o carro está perto do posto → abre a interação de abastecimento.
 *
 * Posicionado num canto livre do mapa (à esquerda, longe dos 3 prédios da
 * cidade e do spawn em 0,0), pra navegação continuar legível.
 */
const POSTO_POS = [-34, 24]; // [x, z] no plano — área aberta, sem sobrepor a cidade
const POSTO_SIZE = [12, 5, 12]; // [w, h, l] — baixo e largo, cara de posto

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
        color="#5fa890"
        label="POSTO"
        labelColor="#0e231c"
        labelOutline="#ffffff"
      />

      <PostoSensor
        floorPos={POSTO_POS}
        size={POSTO_SIZE}
        onEnter={() => setPostoPerto(true)}
        onExit={() => setPostoPerto(false)}
      />
    </>
  );
}
