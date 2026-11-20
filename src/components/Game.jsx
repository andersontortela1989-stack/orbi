import { createElement, Fragment, lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  BackSide,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  Euler,
  Matrix4,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Quaternion,
  SphereGeometry,
  Vector3,
  Vector4,
} from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
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
import { ItensAventura } from './ItensAventura.jsx';
import { FloresParque } from './FloresParque.jsx';
import { HortaEscola } from './HortaEscola.jsx';
import { useGame } from '../store/useGame.js';
import { perfilVisual } from '../visual/world-style.js';
import { RoadNetwork } from './RoadNetwork.jsx';
import { CityLife } from './CityLife.jsx';
import { Landscape } from './Landscape.jsx';
import { SLUGS_ESQUINA, estiloReal } from '../visual/estilo.js';
import { PALETA3D, SOMBRA_SOLIDA, TINTAS } from '../brand/paleta3d.js';
import { TODOS_PREDIOS } from '../city/bairros.js';

// Piloto da esquina (`?estilo=real`): pacote próprio, baixado só quando o
// estilo é pedido — o estilo padrão não carrega nada dele. As dependências
// entram por parâmetro (só o que o jogo já usa, pelo nome: nada de
// `* as THREE`), para o pacote do piloto não importar nada do pacote do
// jogo e o pacote inicial não mudar.
const EsquinaReal = lazy(() =>
  import('./EsquinaReal.jsx').then((m) => ({
    default: m.criarEsquinaReal({
      React: { createElement, Fragment, useEffect, useMemo, useRef, useState },
      THREE: {
        BackSide, BoxGeometry, BufferAttribute, BufferGeometry, Color, CylinderGeometry, Euler,
        Matrix4, MeshBasicMaterial, MeshStandardMaterial, Quaternion, SphereGeometry, Vector3, Vector4,
      },
      useFrame,
      useThree,
      Text,
      useGame,
      perfilVisual,
      // cores e medidas uma a uma: objetos inteiros escapariam do
      // descarte de cores sem uso, e o pacote inicial cresceria
      PALETA3D: {
        calcada: PALETA3D.calcada,
        contorno: PALETA3D.contorno,
        predios: { PADARIA: PALETA3D.predios.PADARIA, MERCADO: PALETA3D.predios.MERCADO },
        pao: { casca: PALETA3D.pao.casca, lateral: PALETA3D.pao.lateral },
      },
      TINTAS: {
        ink: TINTAS.ink, violetDeep: TINTAS.violetDeep, violet: TINTAS.violet, sunDeep: TINTAS.sunDeep,
        sunSoft: TINTAS.sunSoft, grass: TINTAS.grass, grassDeep: TINTAS.grassDeep, white: TINTAS.white,
        coral: TINTAS.coral, coralSoft: TINTAS.coralSoft, blue: TINTAS.blue, blueSoft: TINTAS.blueSoft,
      },
      SOMBRA_SOLIDA: { dx: SOMBRA_SOLIDA.dx, dz: SOMBRA_SOLIDA.dz, cor: SOMBRA_SOLIDA.cor, opacidade: SOMBRA_SOLIDA.opacidade },
      LOTES: Object.fromEntries(
        SLUGS_ESQUINA.map((slug) => {
          const { pos, size } = TODOS_PREDIOS.find((p) => p.slug === slug);
          return [slug, { pos, size }];
        })
      ),
      SLUGS_ESQUINA,
    }),
  }))
);

export function Game() {
  const carRef = useRef(null);
  const preferencias = useGame((s) => s.preferencias);
  const visual = perfilVisual(preferencias);

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

      {/* Continuidade visual além dos lotes: terreno violeta, manchas suaves
          e rochas decorativas. Fica abaixo de bairros e ruas. */}
      <Landscape />

      {/* Cidade em bairros temáticos contíguos (Fatia 7) — fonte única em
          src/city/bairros.js; render e sensores do GPS derivam dos mesmos dados */}
      <City />

      {/* A grade de protótipo dá lugar a ruas curvas com borda e sinalização.
          É uma pele visual: física e sensores continuam no Ground. */}
      <RoadNetwork tranquilo={visual.tranquilo} />

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
      {visual.detalhes && <DecoracaoExtra />}

      {/* Luzes, fonte, brilhos e drone: vida ambiental opcional. O Modo
          Tranquilo remove a camada inteira de forma previsível. */}
      {visual.detalhes && <CityLife animar={visual.animacoes} />}

      {/* Bichos no mundo (frente "Bichos no mundo") — fauna sticker
          estática, sem colisão; posições em city/bichos.js (a missão de
          busca deriva de lá — Frente 5) */}
      <Bichos />

      {/* Canteiro contável do PARQUE (Frente 5) — as 4 árvores do quiz
          de contagem real; dados em city/canteiro.js */}
      <Canteiro />

      {/* Aventura 01: consequência permanente + marcador de ajuda. */}
      <FloresParque />
      {/* H2: canteiros da ESCOLA; brotos depois da primeira Horta. */}
      <HortaEscola />
      <AdventureMarker />

      {/* Sensores invisíveis de chegada (um por prédio) — Fatia 4 */}
      <MissionSensors />

      <Car rigidBodyRef={carRef} />

      {/* Coletáveis das aventuras: baldes do parque, sacos de semente da
          Horta — só na etapa de coleta correspondente. */}
      <ItensAventura targetRef={carRef} />

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

      {/* Piloto da esquina (`?estilo=real`): PADARIA, MERCADO, calçadas e a
          mancha de contato dos pneus. Por último, para a cena já estar
          montada quando ele pré-compila os programas. */}
      {estiloReal && (
        <Suspense fallback={null}>
          <EsquinaReal targetRef={carRef} />
        </Suspense>
      )}
    </>
  );
}
