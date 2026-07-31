import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { PALETA3D, SOMBRA_SOLIDA } from '../brand/paleta3d.js';
import {
  MOEDAS,
  RAIO_COLETA,
  RESPAWN_SEGUNDOS,
  FOLGA_RESPAWN,
} from '../city/moedas.js';
import { useGame } from '../store/useGame.js';
import { somMoeda } from '../audio/sons.js';
import { coordenadorAtividade } from '../activity/index.js';

/**
 * Moedas coletáveis (frente "Moedas na rua") — render + coleta + respawn.
 * Posições e constantes de jogo vêm de city/moedas.js (fonte única de ONDE).
 *
 * COLETA POR PROXIMIDADE, ZERO FÍSICA: distância XZ ao RigidBody do carro,
 * lido em useFrame como BlobShadow/CameraFollow fazem — Car.jsx intocado,
 * nenhum collider novo no mundo (sensor Rapier por moeda seria churn de
 * corpo físico a cada coleta/respawn; comparação de distância é grátis).
 *
 * ESTADO DE COLETA = MEMÓRIA DE SESSÃO (ref, fora do persist): reload =
 * todas as moedas de volta + contador (moedas, persistido) intacto — a
 * cidade sempre acorda igual, previsível. O respawn é timestamp comparado
 * no frame (imune a StrictMode/HMR, sem setTimeout solto) e SÓ acontece
 * com o carro além de RAIO_COLETA + FOLGA_RESPAWN — nunca plim fantasma
 * no frame do renascimento.
 *
 * VISUAL: receita sticker da Fatia C — corpo âmbar (PALETA3D.moeda) +
 * casco de contorno navy (BackSide) + sombra SÓLIDA no chão. 3 draw calls
 * fixos (Instances), qualquer quantidade de moedas. Coletada = scale 0,
 * respawn = scale 1, sem fade (nada pisca). Rotação suave em FASE ÚNICA
 * (todas giram juntas — previsibilidade TEA); prefers-reduced-motion →
 * estáticas, viradas pra câmera.
 *
 * Y da sombra: 0.03 (camada das sombras estáticas de árvore/poste — pilha
 * anti-z-fighting documentada no Cenario.jsx; moedas vivem no asfalto
 * aberto, longe das sombras 0.034 dos prédios).
 */

const RAIO = 0.55;      // raio da moeda
const ESPESSURA = 0.16; // altura do cilindro (moeda "gordinha" de sticker)
const ALTURA = 1.0;     // flutua na altura do chassi do carro
const GIRO_RAD_S = 0.8; // rotação suave: uma volta a cada ~8s
// Traço do contorno — régua da luminária do Cenario (TRACO * 0.7): o TRACO
// cheio (0.22) em raio 0.55 viraria 40% de navy, gordo demais.
const TRACO_M = 0.15;

// Em pé (eixo do cilindro deitado pra ±z, cara de "moeda em exposição").
// O giro anima o Z do Euler: com ordem XYZ, Rx(π/2)·Rz(t) gira a moeda em
// torno do Y do MUNDO — em t=0 (e no reduced-motion) ela fica de frente
// pra câmera, que olha o mundo ao longo de -z.
const EM_PE = [Math.PI / 2, 0, 0];
const DEITADO = [-Math.PI / 2, 0, 0];

export function Moedas({ targetRef }) {
  const ganharMoeda = useGame((s) => s.ganharMoeda);

  // Estado de coleta por moeda (sessão): null = no chão; número = instante
  // (clock.elapsedTime) em que foi coletada.
  const coletadaEm = useRef(MOEDAS.map(() => null));

  const corpos = useRef([]);
  const contornos = useRef([]);
  const sombras = useRef([]);

  // Checado UMA vez (padrão do StartScreen): preferência de movimento não
  // muda no meio da sessão; se mudar, vale no próximo reload.
  const reduzido = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  useFrame((state) => {
    if (!coordenadorAtividade.estado().mundo) return;
    const rb = targetRef.current;
    if (!rb) return;
    const t = state.clock.elapsedTime;
    const carro = rb.translation();
    const giro = reduzido ? 0 : t * GIRO_RAD_S;
    const raio2 = RAIO_COLETA * RAIO_COLETA;
    const longe = RAIO_COLETA + FOLGA_RESPAWN;
    const longe2 = longe * longe;

    for (let i = 0; i < MOEDAS.length; i++) {
      const [x, z] = MOEDAS[i];
      const dx = carro.x - x;
      const dz = carro.z - z;
      const d2 = dx * dx + dz * dz;

      if (coletadaEm.current[i] === null) {
        if (d2 < raio2) {
          // Marca SÍNCRONO no frame da detecção — coleta idempotente,
          // impossível contar duas vezes em frames consecutivos.
          coletadaEm.current[i] = t;
          ganharMoeda(1);
          somMoeda();
        }
      } else if (t - coletadaEm.current[i] >= RESPAWN_SEGUNDOS && d2 > longe2) {
        // Timer venceu E o carro está longe → renasce (sem aviso, sem pisca).
        coletadaEm.current[i] = null;
      }

      const escala = coletadaEm.current[i] === null ? 1 : 0;
      const corpo = corpos.current[i];
      const contorno = contornos.current[i];
      const sombra = sombras.current[i];
      if (corpo) {
        corpo.scale.setScalar(escala);
        corpo.rotation.set(Math.PI / 2, 0, giro);
      }
      if (contorno) {
        contorno.scale.setScalar(escala);
        contorno.rotation.set(Math.PI / 2, 0, giro);
      }
      if (sombra) sombra.scale.setScalar(escala);
    }
  });

  return (
    <>
      {/* contorno sticker (casco BackSide, como as copas do Cenario).
          frustumCulled=false: o culling de InstancedMesh usa o bounding da
          GEOMETRIA base (na origem) — moedas espalhadas longe da origem
          sumiriam com a câmera em bairro distante. 3 draw calls fixos,
          desligar não custa nada. */}
      <Instances limit={MOEDAS.length} frustumCulled={false}>
        <cylinderGeometry
          args={[RAIO + TRACO_M, RAIO + TRACO_M, ESPESSURA + 2 * TRACO_M, 20]}
        />
        <meshBasicMaterial color={PALETA3D.contorno} side={THREE.BackSide} />
        {MOEDAS.map(([x, z], i) => (
          <Instance
            key={i}
            ref={(el) => (contornos.current[i] = el)}
            position={[x, ALTURA, z]}
            rotation={EM_PE}
          />
        ))}
      </Instances>

      {/* corpo âmbar — basic (chapado adesivo, como a luminária do poste) */}
      <Instances limit={MOEDAS.length} frustumCulled={false}>
        <cylinderGeometry args={[RAIO, RAIO, ESPESSURA, 20]} />
        <meshBasicMaterial color={PALETA3D.moeda} />
        {MOEDAS.map(([x, z], i) => (
          <Instance
            key={i}
            ref={(el) => (corpos.current[i] = el)}
            position={[x, ALTURA, z]}
            rotation={EM_PE}
          />
        ))}
      </Instances>

      {/* sombra sólida no asfalto — some/volta junto com a moeda */}
      <Instances limit={MOEDAS.length} frustumCulled={false}>
        <circleGeometry args={[RAIO, 16]} />
        <meshBasicMaterial
          color={SOMBRA_SOLIDA.cor}
          transparent
          opacity={SOMBRA_SOLIDA.opacidade}
          depthWrite={false}
        />
        {MOEDAS.map(([x, z], i) => (
          <Instance
            key={i}
            ref={(el) => (sombras.current[i] = el)}
            position={[x + SOMBRA_SOLIDA.dx, 0.03, z + SOMBRA_SOLIDA.dz]}
            rotation={DEITADO}
          />
        ))}
      </Instances>
    </>
  );
}
