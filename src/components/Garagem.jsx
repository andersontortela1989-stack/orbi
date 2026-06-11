import { useEffect } from 'react';
import { Building } from './Building.jsx';
import { ZoneSensor } from './ZoneSensor.jsx';
import { useGame } from '../store/useGame.js';
import { PALETA3D } from '../brand/paleta3d.js';
import { GARAGEM_POS, GARAGEM_SIZE } from '../city/garagem.js';

/**
 * Garagem (frente "Garagem") — o destino das moedas. MESMO padrão do
 * GasStation: <Building> reaproveitado (letreiro GARAGEM = palavra nova
 * pra ler, de graça pelo pipeline de letreiros) + ZoneSensor entra/sai →
 * `garagemPerto` na store → GaragemPanel (2D) abre/fecha.
 *
 * Serviço, não destino de missão: fora de bairros.js de propósito (a
 * decisão está documentada em city/garagem.js, com a posição e o catálogo).
 */
export function Garagem() {
  const setGaragemPerto = useGame((s) => s.setGaragemPerto);

  // Mesma rede de segurança do GasStation: desmontar (HMR) com o carro
  // DENTRO da zona pode engolir o onIntersectionExit — garagemPerto ficaria
  // travado em true (painel fantasma). Liberar no unmount também limpa o
  // corPreview (a action de sair da zona zera os dois).
  useEffect(() => () => setGaragemPerto(false), [setGaragemPerto]);

  return (
    <>
      <Building
        floorPos={GARAGEM_POS}
        size={GARAGEM_SIZE}
        color={PALETA3D.predios.GARAGEM}
        label="GARAGEM"
      />

      <ZoneSensor
        floorPos={GARAGEM_POS}
        size={GARAGEM_SIZE}
        onEnter={() => setGaragemPerto(true)}
        onExit={() => setGaragemPerto(false)}
      />
    </>
  );
}
