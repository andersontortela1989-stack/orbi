import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Cachorro } from './Bichos.jsx';
import { ZoneSensor } from './ZoneSensor.jsx';
import { useCarona } from '../store/useCarona.js';
import { useGame } from '../store/useGame.js';
import { falar } from '../audio/voz.js';
import { somSucesso } from '../audio/sons.js';

/**
 * CARONA (piloto: 1 passageiro) — o cachorrinho pede pra ir ao PARQUE.
 *
 * REUSA o que já existe, sem loop paralelo escondido: o cão é o mesmo desenho
 * dos Bichos (Cachorro exportado), a detecção é o ZoneSensor (Fatia 5.1), a
 * pílula é a do HUD (troca pra "🐶 PARQUE?" enquanto a bordo) e as moedas saem
 * do ganharMoeda existente. O ESTADO vive num store PRÓPRIO (useCarona) — o
 * useGame/persist fica intocado (ITEM 0 pendente).
 *
 * Fluxo (previsível, repetível, paciência infinita):
 *   ESPERANDO — cão na calçada + balão estático "🐶 PARQUE?" + zona de embarque.
 *     A criança nunca parar? Ele só espera. Sem timer, sem "foi embora".
 *   A BORDO   — entrou na zona → cão some da calçada e vira passageiro que
 *     SEGUE o carro (useFrame só LÊ a posição, como Moedas/BlobShadow — zero
 *     física). Voz do Órbi. Pílula vira "🐶 PARQUE?".
 *   ENTREGA   — chegou na zona do PARQUE → festa (somSucesso + voz) + 3 moedas,
 *     o cão desembarca e VOLTA pra calçada (reset simples). Pode pedir de novo.
 *
 * Furar/ignorar não pune nada: sem parar, nada acontece (assimetria estrita).
 *
 * Montado dentro do <Game> (recebe o carRef como targetRef, padrão Moedas).
 */

// Calçada do CENTRO, longe de lotes/moedas/zonas de serviço (cão DEDICADO —
// não é o CACHORRO da missão de busca, que segue intocado perto da garagem).
const ESPERA_POS = [-9, 5];
const ESPERA_HEADING = 0.5;
const ESCALA_CAO = 1.6; // régua visual dos Bichos ("metade de um carro")

// Zona de embarque: caixinha em volta do cão + padding generoso (chegar perto).
const EMBARQUE_SIZE = [2, 2, 2];
const EMBARQUE_PADDING = 3;

// Zona de entrega = o prédio do PARQUE (bairros.js: pos/size do PARQUE).
const PARQUE_POS = [-14, 72];
const PARQUE_SIZE = [12, 5, 12];

const RECOMPENSA = 3; // +moedas na entrega (decisão do gate)

export function Carona({ targetRef }) {
  const aBordo = useCarona((s) => s.aBordo);
  const passageiroRef = useRef(null);

  // Passageiro segue o carro — só LÊ a posição (como Moedas/BlobShadow), fora
  // da cadeia load-bearing Car→FuelController. Zero física, zero colisão.
  useFrame(() => {
    if (!aBordo) return;
    const rb = targetRef.current;
    const grp = passageiroRef.current;
    if (!rb || !grp) return;
    const t = rb.translation();
    grp.position.set(t.x, 1.1, t.z);
  });

  const embarcar = () => {
    if (useCarona.getState().aBordo) return;
    useCarona.getState().embarcar();
    falar('o cachorrinho quer ir ao parque! vamos levar?', { interrupt: true });
  };

  const entregar = () => {
    if (!useCarona.getState().aBordo) return;
    useCarona.getState().desembarcar();
    somSucesso();
    useGame.getState().ganharMoeda(RECOMPENSA);
    falar('obrigado por me levar! você é um ótimo motorista!', {
      interrupt: true,
    });
  };

  return (
    <>
      {!aBordo && (
        <>
          {/* Cão esperando na calçada (estático) + balão. */}
          <group
            position={[ESPERA_POS[0], 0, ESPERA_POS[1]]}
            rotation={[0, ESPERA_HEADING, 0]}
            scale={ESCALA_CAO}
          >
            <Cachorro />
          </group>

          {/* Balão estático sobre o cão — HTML (emoji não renderiza no SDF
              do drei Text). pointer-events:none no CSS: nunca rouba um toque
              dos controles. */}
          <Html position={[ESPERA_POS[0], 3.2, ESPERA_POS[1]]} center>
            <div className="carona-balao">🐶 PARQUE?</div>
          </Html>

          {/* Zona de embarque: entrar perto do cão = pega a carona. */}
          <ZoneSensor
            floorPos={ESPERA_POS}
            size={EMBARQUE_SIZE}
            padding={EMBARQUE_PADDING}
            onEnter={embarcar}
          />
        </>
      )}

      {aBordo && (
        <>
          {/* Passageiro pequeno que acompanha o carro. */}
          <group ref={passageiroRef} scale={1.0}>
            <Cachorro />
          </group>

          {/* Zona de entrega no PARQUE. */}
          <ZoneSensor floorPos={PARQUE_POS} size={PARQUE_SIZE} onEnter={entregar} />
        </>
      )}
    </>
  );
}
