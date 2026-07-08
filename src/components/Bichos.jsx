import * as THREE from 'three';
import { PALETA3D, SOMBRA_SOLIDA } from '../brand/paleta3d.js';
import { BICHOS } from '../city/bichos.js';
import { ANIMAL_POR_SLUG } from '../missions/missoes-ciencias.js';

/**
 * Bichos no mundo (frente "Bichos no mundo") — fauna sticker, presença
 * visual PURA nesta frente. Posições/contrato em city/bichos.js.
 *
 * ESTÁTICO PURO: zero useFrame, zero animação — nada treme, nada anda
 * (guard-rail TEA; respiração sutil é alavanca de gate, não padrão).
 * SEM COLISÃO: nenhum RigidBody (precedente das árvores — parede
 * invisível é punição imprevisível; atravessar = passa direto).
 *
 * LEITURA DE CIMA (régua calibrada no gate da frente): a câmera fica em
 * alvo + (0, 44, 24) — elevação ~61°, vê majoritariamente o TOPO, e na
 * distância de jogo um bicho deve ler como "METADE DE UM CARRO", nunca
 * como "moeda grande". Por isso:
 *   - ESCALA 1.6 sobre as proporções base (vaca ~3.0 de comprimento,
 *     galinha ~1.2) — sticker aguenta exagero; fidelidade real não é
 *     requisito.
 *   - assinaturas AGRESSIVAS no plano superior: bico comprido do PATO,
 *     orelhões-cone do GATO, manchas cobrindo ~40% do dorso da VACA,
 *     crista grande da GALINHA, orelhas caídas + sela navy do CACHORRO.
 *   - cores anti-colisão DE CONTEXTO (lição do gate): cachorro caramelo
 *     lia como MOEDA no asfalto → virou branco-malhado; gato inkSoft lia
 *     como SOMBRA → virou laranja (realinha com o emoji 🐱 do quiz).
 *     Nenhum bicho com cor dominante igual à do chão onde está.
 *
 * Receita sticker dos props (Fatia C): peças em meshLambert, casco de
 * contorno navy BackSide ADITIVO nas peças grandes (corpo/cabeça),
 * sombra SOMBRA_SOLIDA no Y 0.03 da pilha anti-z-fighting. A sombra é
 * IRMÃ do grupo rotacionado (não filha): o offset é direção de MUNDO
 * (baixo-direita na tela) e não pode girar com o heading do bicho.
 *
 * Custo: ~8-12 meshes estáticos por bicho, ~55 draw calls no total —
 * desprezível (a cena roda 60/1 com folga; prédios custam ~6 cada).
 */

// Escala global dos bichos — régua do gate: "metade de um carro".
const ESCALA = 1.6;

// Reforço por espécie (2ª iteração do gate): os redondos pequenos liam
// como bolinha na câmera quase-planta — sobem mais que os demais.
const ESCALA_EXTRA = { PATO: 1.25, GALINHA: 1.4, GATO: 1.15 };

// Traço do contorno dos bichos — peças pequenas, traço proporcional
// (régua da luminária do Cenario; a ESCALA do grupo multiplica junto).
const TRACO_B = 0.12;
const DEITADO = [-Math.PI / 2, 0, 0];

/** Casco de contorno pra ESFERA (aditivo no raio). */
function ContornoEsfera({ position, raio, scale }) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[raio + TRACO_B, 16, 16]} />
      <meshBasicMaterial color={PALETA3D.contorno} side={THREE.BackSide} />
    </mesh>
  );
}

/** Casco de contorno pra CAIXA (escala aditiva por eixo, como o Building). */
function ContornoCaixa({ position, size }) {
  const [w, h, l] = size;
  return (
    <mesh
      position={position}
      scale={[
        (w + 2 * TRACO_B) / w,
        (h + 2 * TRACO_B) / h,
        (l + 2 * TRACO_B) / l,
      ]}
    >
      <boxGeometry args={size} />
      <meshBasicMaterial color={PALETA3D.contorno} side={THREE.BackSide} />
    </mesh>
  );
}

// ---------------------------------------------------------------- PATO
// Gota branca + cabeça alta + BICÃO sunDeep comprido (a ponta laranja na
// frente é o que diz "pato" visto de cima). Sentado baixo (ave nada/choca).
function Pato() {
  return (
    <>
      {/* corpo-GOTA alongado — a silhueta corpo→pescoço→cabeça→pá é a
          leitura de "pato" na planta (cabeça grudada no corpo virava
          um círculo só — 2ª iteração do gate) */}
      <ContornoEsfera position={[0, 0.42, -0.1]} raio={0.45} scale={[1, 0.75, 1.45]} />
      <mesh position={[0, 0.42, -0.1]} scale={[1, 0.75, 1.45]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshLambertMaterial color={PALETA3D.bicho.pelagem} />
      </mesh>
      <ContornoEsfera position={[0, 0.85, 0.62]} raio={0.25} />
      <mesh position={[0, 0.85, 0.62]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshLambertMaterial color={PALETA3D.bicho.pelagem} />
      </mesh>
      {/* bico-ESPÁTULA largo e chato como pato de verdade — a pá laranja
          saindo da silhueta */}
      <mesh position={[0, 0.8, 1.08]}>
        <boxGeometry args={[0.42, 0.08, 0.66]} />
        <meshLambertMaterial color={PALETA3D.bicho.bico} />
      </mesh>
    </>
  );
}

// ---------------------------------------------------------------- GATO
// Corpo LARANJA alongado (o laranja do emoji 🐱 — ponte com o quiz) +
// ORELHÕES-CONE no topo (maiores que o realismo pede: são a leitura de
// cima) + cauda erguida. sunDeep lê forte sobre o chão paper do CENTRO.
function Gato() {
  return (
    <>
      <ContornoEsfera position={[0, 0.4, 0]} raio={0.42} scale={[0.9, 0.7, 1.5]} />
      <mesh position={[0, 0.4, 0]} scale={[0.9, 0.7, 1.5]}>
        <sphereGeometry args={[0.42, 16, 16]} />
        <meshLambertMaterial color={PALETA3D.bicho.laranja} />
      </mesh>
      <ContornoEsfera position={[0, 0.72, 0.55]} raio={0.26} />
      <mesh position={[0, 0.72, 0.55]}>
        <sphereGeometry args={[0.26, 16, 16]} />
        <meshLambertMaterial color={PALETA3D.bicho.laranja} />
      </mesh>
      {/* LISTRAS de tigrado no dorso (2ª iteração do gate) — a vaca
          provou que identidade pintada NO TOPO é o que lê na câmera
          quase-planta; listras navy transversais = "gato" de cima */}
      <mesh position={[0, 0.72, 0.12]}>
        <boxGeometry args={[0.6, 0.04, 0.13]} />
        <meshLambertMaterial color={PALETA3D.bicho.mancha} />
      </mesh>
      <mesh position={[0, 0.74, -0.16]}>
        <boxGeometry args={[0.55, 0.04, 0.13]} />
        <meshLambertMaterial color={PALETA3D.bicho.mancha} />
      </mesh>
      <mesh position={[0, 0.7, -0.42]}>
        <boxGeometry args={[0.46, 0.04, 0.13]} />
        <meshLambertMaterial color={PALETA3D.bicho.mancha} />
      </mesh>
      {/* orelhões pontudos, INCLINADOS pra fora — de cima projetam dois
          triângulos saindo da silhueta da cabeça (retos, sumiam) */}
      <mesh position={[-0.24, 1.0, 0.48]} rotation={[0, 0, 0.55]}>
        <coneGeometry args={[0.2, 0.46, 8]} />
        <meshLambertMaterial color={PALETA3D.bicho.laranja} />
      </mesh>
      <mesh position={[0.24, 1.0, 0.48]} rotation={[0, 0, -0.55]}>
        <coneGeometry args={[0.2, 0.46, 8]} />
        <meshLambertMaterial color={PALETA3D.bicho.laranja} />
      </mesh>
      {/* cauda QUASE HORIZONTAL, curvando pro lado — de cima é uma linha
          laranja saindo do corpo (erguida na vertical, sumia na planta) */}
      <mesh position={[-0.22, 0.5, -0.85]} rotation={[1.35, 0, 0.5]}>
        <boxGeometry args={[0.11, 0.62, 0.11]} />
        <meshLambertMaterial color={PALETA3D.bicho.laranja} />
      </mesh>
    </>
  );
}

// ---------------------------------------------------------------- VACA
// A maior. Caixa branca + MANCHAS navy cobrindo ~40% do dorso (não nas
// laterais — é o topo que a câmera vê) + cabeça com orelhas. Deitada no
// pasto (corpo baixo, vaca calma).
const VACA_CORPO = [1.1, 0.8, 1.9];
function Vaca() {
  return (
    <>
      <ContornoCaixa position={[0, 0.42, -0.1]} size={VACA_CORPO} />
      <mesh position={[0, 0.42, -0.1]}>
        <boxGeometry args={VACA_CORPO} />
        <meshLambertMaterial color={PALETA3D.bicho.pelagem} />
      </mesh>
      {/* manchas no TOPO do corpo (~40% do dorso, acima do casco) */}
      <mesh position={[0.24, 0.97, 0.32]}>
        <boxGeometry args={[0.62, 0.05, 0.8]} />
        <meshLambertMaterial color={PALETA3D.bicho.mancha} />
      </mesh>
      <mesh position={[-0.3, 0.97, -0.5]}>
        <boxGeometry args={[0.55, 0.05, 0.7]} />
        <meshLambertMaterial color={PALETA3D.bicho.mancha} />
      </mesh>
      <mesh position={[0.32, 0.97, -0.75]}>
        <boxGeometry args={[0.4, 0.05, 0.38]} />
        <meshLambertMaterial color={PALETA3D.bicho.mancha} />
      </mesh>
      {/* cabeça */}
      <ContornoCaixa position={[0, 0.66, 1.1]} size={[0.5, 0.42, 0.5]} />
      <mesh position={[0, 0.66, 1.1]}>
        <boxGeometry args={[0.5, 0.42, 0.5]} />
        <meshLambertMaterial color={PALETA3D.bicho.pelagem} />
      </mesh>
      {/* mancha da testa + orelhas abertas */}
      <mesh position={[0, 0.93, 1.1]}>
        <boxGeometry args={[0.3, 0.05, 0.34]} />
        <meshLambertMaterial color={PALETA3D.bicho.mancha} />
      </mesh>
      <mesh position={[-0.4, 0.78, 1.05]}>
        <boxGeometry args={[0.26, 0.07, 0.18]} />
        <meshLambertMaterial color={PALETA3D.bicho.pelagem} />
      </mesh>
      <mesh position={[0.4, 0.78, 1.05]}>
        <boxGeometry args={[0.26, 0.07, 0.18]} />
        <meshLambertMaterial color={PALETA3D.bicho.pelagem} />
      </mesh>
    </>
  );
}

// ------------------------------------------------------------- GALINHA
// A menor. Corpo branco + CRISTONA coral no alto (assinatura de cima;
// branca no chão sol-soft depende do contorno navy + da crista) + bico
// e cauda empinada.
function Galinha() {
  return (
    <>
      <ContornoEsfera position={[0, 0.32, 0]} raio={0.32} scale={[0.9, 0.85, 1.15]} />
      <mesh position={[0, 0.32, 0]} scale={[0.9, 0.85, 1.15]}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshLambertMaterial color={PALETA3D.bicho.pelagem} />
      </mesh>
      <mesh position={[0, 0.62, 0.28]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshLambertMaterial color={PALETA3D.bicho.pelagem} />
      </mesh>
      {/* crista-LINHA coral no eixo central, da cabeça ao dorso — de
          cima é uma listra coral atravessando o corpo (2ª iteração:
          a crista vertical curta virava um pontinho na planta; gate:
          +30% pra disputar a assinatura com a cauda) */}
      <mesh position={[0, 0.8, 0.1]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[0.12, 0.29, 0.94]} />
        <meshLambertMaterial color={PALETA3D.bicho.crista} />
      </mesh>
      <mesh position={[0, 0.6, 0.5]}>
        <boxGeometry args={[0.12, 0.08, 0.2]} />
        <meshLambertMaterial color={PALETA3D.bicho.bico} />
      </mesh>
      {/* cauda-leque sunDeep, larga e angulada — de cima abre como rabo
          de galinha. Veredito do gate: navy sobre o corpo branco
          construía leitura de PINGUIM; o leque quente casa com bico e
          crista (exceção consciente à língua "detalhes navy" dos outros
          bichos — aqui a cor errada quebrava a espécie) */}
      <mesh position={[0, 0.5, -0.42]} rotation={[-0.7, 0, 0]}>
        <boxGeometry args={[0.42, 0.38, 0.1]} />
        <meshLambertMaterial color={PALETA3D.bicho.bico} />
      </mesh>
    </>
  );
}

// ------------------------------------------------------------ CACHORRO
// Vira-lata BRANCO-MALHADO (lição do gate: caramelo lia como MOEDA no
// asfalto). SELA navy no dorso + ORELHAS CAÍDAS navy (vs. cones laranja
// do gato) + RABO ERGUIDO — três assinaturas de cima, zero ambiguidade
// com a vaca (sela única vs. manchas espalhadas, porte e cabeça redonda).
export function Cachorro() {
  return (
    <>
      <ContornoCaixa position={[0, 0.38, -0.05]} size={[0.6, 0.55, 1.3]} />
      <mesh position={[0, 0.38, -0.05]}>
        <boxGeometry args={[0.6, 0.55, 1.3]} />
        <meshLambertMaterial color={PALETA3D.bicho.pelagem} />
      </mesh>
      {/* sela navy no dorso — UMA mancha grande (vs. as várias da vaca) */}
      <mesh position={[0, 0.69, -0.25]}>
        <boxGeometry args={[0.5, 0.05, 0.62]} />
        <meshLambertMaterial color={PALETA3D.bicho.mancha} />
      </mesh>
      <ContornoEsfera position={[0, 0.74, 0.62]} raio={0.28} />
      <mesh position={[0, 0.74, 0.62]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshLambertMaterial color={PALETA3D.bicho.pelagem} />
      </mesh>
      {/* FOCINHO comprido com nariz navy na ponta (2ª iteração) — de
          cima, é o que separa "cachorro" de "vaca pequena": a cabeça
          ganha um snout saindo da silhueta */}
      <mesh position={[0, 0.68, 0.95]}>
        <boxGeometry args={[0.22, 0.16, 0.36]} />
        <meshLambertMaterial color={PALETA3D.bicho.pelagem} />
      </mesh>
      <mesh position={[0, 0.7, 1.13]}>
        <boxGeometry args={[0.12, 0.08, 0.1]} />
        <meshLambertMaterial color={PALETA3D.bicho.mancha} />
      </mesh>
      {/* orelhas caídas navy, INCLINADAS pra fora — projetam na planta */}
      <mesh position={[-0.34, 0.74, 0.56]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.13, 0.36, 0.24]} />
        <meshLambertMaterial color={PALETA3D.bicho.mancha} />
      </mesh>
      <mesh position={[0.34, 0.74, 0.56]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.13, 0.36, 0.24]} />
        <meshLambertMaterial color={PALETA3D.bicho.mancha} />
      </mesh>
      {/* rabo QUASE HORIZONTAL apontando pra trás — lê na planta
          (erguido na vertical, sumia) */}
      <mesh position={[0, 0.6, -0.92]} rotation={[1.25, 0, 0]}>
        <boxGeometry args={[0.1, 0.52, 0.1]} />
        <meshLambertMaterial color={PALETA3D.bicho.pelagem} />
      </mesh>
    </>
  );
}

// ----------------------------------------------------------------------

const ESPECIES = {
  PATO: Pato,
  GATO: Gato,
  VACA: Vaca,
  GALINHA: Galinha,
  CACHORRO: Cachorro,
};

/** Raio da sombra sólida por espécie (footprint base — ESCALA multiplica). */
const RAIO_SOMBRA = {
  PATO: 0.7,
  GATO: 0.65,
  VACA: 1.05,
  GALINHA: 0.5,
  CACHORRO: 0.7,
};

// Checagem DEV do contrato de bichos.js: slug fora do banco ANIMAIS
// quebra a ponte mundo↔conteúdo (a razão da frente existir); sem
// geometria, o bicho nem renderiza. Avisa uma vez, no load do módulo.
if (import.meta.env?.DEV) {
  for (const b of BICHOS) {
    if (!ANIMAL_POR_SLUG[b.slug]) {
      console.warn(`[Bichos] slug fora do banco ANIMAIS: ${b.slug}`);
    }
    if (!ESPECIES[b.slug]) {
      console.warn(`[Bichos] slug sem geometria em ESPECIES: ${b.slug}`);
    }
  }
}

export function Bichos() {
  return (
    <>
      {BICHOS.map((b) => {
        const Especie = ESPECIES[b.slug];
        if (!Especie) return null;
        const [x, z] = b.pos;
        const escala = ESCALA * (ESCALA_EXTRA[b.slug] ?? 1);
        return (
          <group key={b.slug}>
            <group
              position={[x, 0, z]}
              rotation={[0, b.heading, 0]}
              scale={escala}
            >
              <Especie />
            </group>
            {/* sombra FORA do grupo rotacionado: offset é direção de
                MUNDO (baixo-direita na tela), não gira com o heading */}
            <mesh
              position={[x + SOMBRA_SOLIDA.dx, 0.03, z + SOMBRA_SOLIDA.dz]}
              rotation={DEITADO}
            >
              <circleGeometry args={[(RAIO_SOMBRA[b.slug] ?? 0.7) * escala, 20]} />
              <meshBasicMaterial
                color={SOMBRA_SOLIDA.cor}
                transparent
                opacity={SOMBRA_SOLIDA.opacidade}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}
    </>
  );
}
