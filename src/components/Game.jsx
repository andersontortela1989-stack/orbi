import { useRef } from 'react';
import { Grid } from '@react-three/drei';
import { PALETA3D } from '../brand/paleta3d.js';
import { Car } from './Car.jsx';
import { Ground } from './Ground.jsx';
import { City } from './City.jsx';
import { Cenario, BlobShadow } from './Cenario.jsx';
import { GasStation } from './GasStation.jsx';
import { MissionSensors } from './MissionSensors.jsx';
import { FuelController } from './FuelController.jsx';
import { CameraFollow } from './CameraFollow.jsx';

export function Game() {
  const carRef = useRef(null);

  return (
    <>
      {/* Iluminação DIA ADESIVO: ambiente alto (mundo chapado e claro,
          estilo sticker) + direcional suave só pra definir formas.
          Fatia C: shadow map dinâmico SAIU (decisão estética) — a sombra
          do mundo é SÓLIDA, offset único da marca (SOMBRA_SOLIDA em
          paleta3d.js; planos em Building.jsx e Cenario.jsx). */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[30, 50, 20]} intensity={0.65} />

      <Ground />

      {/* Grade de referência: torna velocidade e derrapagem perceptíveis.
          Recolorida pro dia (sutil, não gritante); fica até as faixas de rua
          da Fatia C herdarem o papel. */}
      <Grid
        position={[0, 0.01, 0]}
        args={[200, 200]}
        cellSize={2}
        cellThickness={0.5}
        cellColor={PALETA3D.gradeLinha}
        sectionSize={10}
        sectionThickness={1}
        sectionColor={PALETA3D.gradeSecao}
        fadeDistance={120}
        fadeStrength={1}
        infiniteGrid
      />

      {/* Cidade em bairros temáticos contíguos (Fatia 7) — fonte única em
          src/city/bairros.js; render e sensores do GPS derivam dos mesmos dados */}
      <City />

      {/* Posto de gasolina (Fatia 5) — mesma linguagem visual + sensor de zona */}
      <GasStation />

      {/* Decoração pura (Fatia C): árvores/postes/faixas/sombras — NADA
          jogável deriva daqui (fronteira documentada no Cenario.jsx) */}
      <Cenario />

      {/* Sensores invisíveis de chegada (um por prédio) — Fatia 4 */}
      <MissionSensors />

      <Car rigidBodyRef={carRef} />

      {/* Combustível (Fatia 5) — DEPOIS do <Car> de propósito: seu useFrame roda
          após o do carro, então o controle de "tanque vazio" tem a palavra final
          sobre a velocidade sem precisar tocar na física do Car.jsx.

          ⚠️ ORDEM LOAD-BEARING — NÃO REORDENAR: o R3F roda os useFrame de mesma
          prioridade na ordem de montagem. <Car> precisa montar ANTES de
          <FuelController> pra que o controle de reserva/parada do tanque vazio
          sobrescreva a velocidade que o Car acabou de escrever. Inverter os dois
          faria o Car ter a palavra final e a desaceleração do vazio sumiria.
          (Não dá pra usar renderPriority > 0 aqui: isso desliga o render
          automático do R3F. E passar um flag pro Car violaria "não tocar na
          física do carro". Então a ordem aqui é o mecanismo — mantenha-a.) */}
      <FuelController targetRef={carRef} />

      {/* Sombra sólida do carro (depois do FuelController de propósito —
          só LÊ a posição; não entra na cadeia Car→FuelController) */}
      <BlobShadow targetRef={carRef} />

      <CameraFollow targetRef={carRef} />
    </>
  );
}
