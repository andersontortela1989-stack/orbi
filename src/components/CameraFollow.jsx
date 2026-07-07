import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// === Enquadramento (zoom da câmera ortográfica da cidade) ===
// Ortográfica: o "afastar" é o ZOOM (px por unidade de mundo), NÃO a distância.
// Menor zoom = mais cidade na tela. Forçamos o zoom no useFrame (não só no prop
// do <Canvas>) de propósito: o R3F só usa aquele prop na MONTAGEM — mexer lá não
// atualiza a câmera viva e "some" no HMR. Setar camera.zoom no loop garante que o
// enquadramento sempre vale.
//
// RESPONSIVO (mobile): 16 fixo mostrava no celular menos da metade do mundo do
// desktop (tela baixa ÷ mesmo zoom = pouca cidade à frente). Derivamos o zoom da
// ALTURA da tela pra manter a MESMA "quantidade de cidade" visível do desktop.
//   ZOOM_DESKTOP=16 — valor validado; é o TETO do clamp E o zoom fixo do desktop.
//   ZOOM_MIN=9      — piso de legibilidade: aí a menor placa (fontSize 2.4 un)
//                     ainda dá ~22px e a moeda (Ø1.1 un) ~10px. Abaixo, miúdo.
//   ALVO_MUNDO=56   — altura de mundo alvo (un): o que o desktop mostra a ~900px
//                     com zoom 16 (900/16≈56). zoom = altura_tela / ALVO_MUNDO.
// Só TOQUE recalcula (mesma régua do TouchControls) — desktop/laptop fica
// EXATAMENTE em 16 (não confiar no clamp superior zoparia laptops < 896px de
// altura). Calculado UMA VEZ no mount (o Canvas já é mount-once em paisagem):
// NUNCA zoom vivo/animado — previsibilidade acima de tudo (régua TEA).
const ZOOM_DESKTOP = 16;
const ZOOM_MIN = 9;
const ALVO_MUNDO = 56;

// Toque? (coarse-pointer OU touch real — espelha o TACTIL do TouchControls.)
function ehToque() {
  if (typeof navigator !== 'undefined' && (navigator.maxTouchPoints || 0) > 0)
    return true;
  return (
    typeof window !== 'undefined' &&
    !!window.matchMedia &&
    window.matchMedia('(pointer: coarse)').matches
  );
}

/** Zoom do enquadramento pro viewport atual: desktop fixo em 16; mobile deriva
 *  da altura da tela, com clamp [9, 16]. Puro — chamado uma vez no mount. */
export function zoomDoViewport() {
  if (typeof window === 'undefined' || !ehToque()) return ZOOM_DESKTOP;
  const h = window.innerHeight || 400;
  return Math.max(ZOOM_MIN, Math.min(ZOOM_DESKTOP, h / ALVO_MUNDO));
}

// OFFSET = posição da câmera relativa ao carro (câmera NÃO gira com o carro —
// vista tática). Numa ortográfica define só o ÂNGULO (inclinação iso) e qual
// ponto fica centralizado, não o tamanho na tela. Mais altura vs Z = visão mais
// "de cima" → placas de telhado mais retas e legíveis.
const OFFSET = new THREE.Vector3(0, 44, 24);
const LERP_SPEED = 5;

// Reutilizados a cada frame (evita alocação no hot path).
const _targetPos = new THREE.Vector3();
const _desired = new THREE.Vector3();

export function CameraFollow({ targetRef }) {
  const { camera } = useThree();
  // Zoom do viewport, UMA VEZ no mount (Canvas mount-once em paisagem). O
  // useFrame só o força; recalcular por frame seria zoom vivo — proibido (TEA).
  const zoom = useMemo(() => zoomDoViewport(), []);

  useFrame((_, dt) => {
    // Garante o zoom de enquadramento mesmo após HMR. Custa nada depois de
    // assentar: só recalcula a projeção quando o valor realmente muda.
    if (camera.isOrthographicCamera && camera.zoom !== zoom) {
      camera.zoom = zoom;
      camera.updateProjectionMatrix();
    }

    const rb = targetRef.current;
    if (!rb) return;

    const t = rb.translation();
    _targetPos.set(t.x, t.y, t.z);
    _desired.copy(_targetPos).add(OFFSET);

    // Lerp frame-rate independente
    const alpha = 1 - Math.exp(-LERP_SPEED * dt);
    camera.position.lerp(_desired, alpha);
    camera.lookAt(_targetPos);
  });

  return null;
}
