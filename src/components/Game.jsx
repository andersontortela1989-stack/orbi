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
import { AdventureMarker } from './AdventureMarker.jsx';
import { BaldesAventura } from './BaldesAventura.jsx';
import { FloresParque } from './FloresParque.jsx';

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

      {/* Aventura 01: consequência permanente + marcador de ajuda. */}
      <FloresParque />
      <AdventureMarker />

      {/* Sensores invisíveis de chegada (um por prédio) — Fatia 4 */}
      <MissionSensors />

      <Car rigidBodyRef={carRef} />

      {/* Coletáveis aparecem só durante “O Parque Está com Sede”. */}
      <BaldesAventura targetRef={carRef} />

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

      {/* Moedas coletáveis (frente "Moedas na rua") — como o BlobShadow,
          só LÊ a posição do carro: coleta por distância, zero física, fora
          da cadeia load-bearing Car→FuelController */}
      <Moedas targetRef={carRef} />

      {/* Missão de busca (Frente 5) — detecção por proximidade do bicho
          procurado; mesmo padrão das moedas (só LÊ a posição do carro) */}
      <BuscaSensor targetRef={carRef} />

      {/* Carona (piloto: 1 passageiro) — o cachorrinho quer ir ao PARQUE.
          Estado em store próprio (useCarona); só LÊ a posição do carro */}
      <Carona targetRef={carRef} />

      <CameraFollow targetRef={carRef} />
    </>
  );
}
