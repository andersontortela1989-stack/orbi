import { useEffect, useRef } from 'react';
import { Grid } from '@react-three/drei';
import { PALETA3D } from '../brand/paleta3d.js';
import { Car } from './Car.jsx';
import { Ground } from './Ground.jsx';
import { City } from './City.jsx';
import { Cenario, BlobShadow } from './Cenario.jsx';
import { DecoracaoExtra } from './DecoracaoExtra.jsx';
import { Moedas } from './Moedas.jsx';
import { Bichos } from './Bichos.jsx';
import { Canteiro } from './Canteiro.jsx';
import { BuscaSensor } from './BuscaSensor.jsx';
import { GasStation } from './GasStation.jsx';
import { Garagem } from './Garagem.jsx';
import { MissionSensors } from './MissionSensors.jsx';
import { FuelController } from './FuelController.jsx';
import { CameraFollow } from './CameraFollow.jsx';
import { Carona } from './Carona.jsx';

export function Game() {
  const carRef = useRef(null);

  // DEV-only: teleporte do carro pelo console — `teleporte(x, z)`.
  // Existe pros GATES: fotografar/inspecionar qualquer ponto do mundo com
  // a câmera REAL do jogo sem dirigir até lá. Zera a velocidade junto
  // (chegar parado é o esperado de um teleporte). Não existe em produção.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    window.teleporte = (x, z) => {
      const rb = carRef.current;
      if (!rb) return false;
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rb.setTranslation({ x, y: 1, z }, true);
      return true;
    };
    return () => {
      delete window.teleporte;
    };
  }, []);

  return (
    <>
      {/* Iluminação: agora no <Ceu> (App), junto com fundo/fog — a criança
          troca dia/entardecer/noite num lugar só. Shadow map dinâmico SAIU
          (Fatia C): a sombra do mundo é SÓLIDA, offset único da marca
          (SOMBRA_SOLIDA em paleta3d.js; planos em Building.jsx/Cenario.jsx). */}

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

      {/* Garagem (frente "Garagem") — serviço como o posto: prédio +
          zona; o painel 2D (GaragemPanel) vive no App */}
      <Garagem />

      {/* Decoração pura (Fatia C): árvores/postes/faixas/sombras — NADA
          jogável deriva daqui (fronteira documentada no Cenario.jsx) */}
      <Cenario />

      {/* Decoração EXTRA (cidade viva — detalhe urbano terrestre) — camada
          ISOLADA e removível: tudo <mesh>/<Instances> sem colisão, nas bordas
          dos bairros. Desligar = comentar esta linha. (DecoracaoExtra.jsx) */}
      <DecoracaoExtra />

      {/* Bichos no mundo (frente "Bichos no mundo") — fauna sticker
          estática, sem colisão; posições em city/bichos.js (a missão de
          busca deriva de lá — Frente 5) */}
      <Bichos />

      {/* Canteiro contável do PARQUE (Frente 5) — as 4 árvores do quiz
          de contagem real; dados em city/canteiro.js */}
      <Canteiro />

      {/* Sensores invisíveis de chegada (um por prédio) — Fatia 4 */}
      <MissionSensors />

      {/* Car concentra toda a escrita de movimento e rotação do veículo. */}
      <Car rigidBodyRef={carRef} />

      {/* FuelController apenas observa velocidade, consome combustível e narra.
          O modo reserva é calculado no Car/stepVehicle; não há mais uma segunda
          escrita de setLinvel dependente da ordem dos useFrame. */}
      <FuelController targetRef={carRef} />

      {/* Sombra sólida do carro: só LÊ a posição. */}
      <BlobShadow targetRef={carRef} />

      {/* Moedas coletáveis: só LÊ a posição do carro. */}
      <Moedas targetRef={carRef} />

      {/* Missão de busca: só LÊ a posição do carro. */}
      <BuscaSensor targetRef={carRef} />

      {/* Carona (piloto: 1 passageiro) — o cachorrinho quer ir ao PARQUE. */}
      <Carona targetRef={carRef} />

      <CameraFollow targetRef={carRef} />
    </>
  );
}
