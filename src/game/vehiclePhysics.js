import { PARADA_SUAVE, V_LIMP } from '../economia.js';

// Física arcade pura do carro.
//
// Este módulo não conhece React, Rapier, Zustand ou DOM. Recebe o estado físico
// atual + input e devolve o próximo estado. A camada React aplica o resultado
// ao RigidBody; isso deixa a matemática testável fora do Canvas.

export const VEHICLE_TUNING = Object.freeze({
  ACEL: 18,
  V_MAX: 14,
  GIRO: 2.4,
  // Aderência lateral: 1 = cola na trajetória; 0 = conserva todo o drift.
  GRIP: 0.90,
  ATRITO: 0.98,
  // Freio de mão reduz a aderência e conserva mais velocidade lateral.
  FREIO_MAO_GRIP: 0.6,
  // Fonte única: estes valores também são usados pelo HUD/economia.
  V_LIMP,
  PARADA_SUAVE,
});

const MAX_DT = 1 / 30;
const STOP_EPSILON = 0.05;

function finitoOu(valor, fallback = 0) {
  return Number.isFinite(valor) ? valor : fallback;
}

function limitar(valor, minimo, maximo) {
  return Math.max(minimo, Math.min(maximo, valor));
}

/**
 * Avança um passo da física arcade.
 *
 * `mode: 'normal'` aplica aceleração, ré, atrito e grip normais.
 * `mode: 'reserve'` usa a reserva do tanque: com input, converge suavemente
 * para uma velocidade baixa; sem input, para de forma gradual. Em ambos os
 * modos, steering e drift continuam obedecendo ao mesmo modelo.
 *
 * @param {object} args
 * @param {{x:number,y:number,z:number}} args.velocity
 * @param {number} args.heading
 * @param {{up?:boolean,down?:boolean,left?:boolean,right?:boolean,space?:boolean,handbrake?:boolean}} args.input
 * @param {number} args.dt
 * @param {'normal'|'reserve'} [args.mode='normal']
 * @param {typeof VEHICLE_TUNING} [args.tuning=VEHICLE_TUNING]
 * @returns {{velocity:{x:number,y:number,z:number},heading:number}}
 */
export function stepVehicle({
  velocity = { x: 0, y: 0, z: 0 },
  heading = 0,
  input = {},
  dt = 0,
  mode = 'normal',
  tuning = VEHICLE_TUNING,
}) {
  const safeDt = limitar(finitoOu(dt), 0, MAX_DT);
  const h = finitoOu(heading);
  const v = {
    x: finitoOu(velocity?.x),
    y: finitoOu(velocity?.y),
    z: finitoOu(velocity?.z),
  };

  const fwdX = Math.sin(h);
  const fwdZ = Math.cos(h);
  const rightX = fwdZ;
  const rightZ = -fwdX;

  // Decompõe a velocidade em frente/ré e lateral.
  let vF = v.x * fwdX + v.z * fwdZ;
  let vL = v.x * rightX + v.z * rightZ;

  const up = !!input?.up;
  const down = !!input?.down;
  const left = !!input?.left;
  const right = !!input?.right;
  const handbrake = !!(input?.space || input?.handbrake);

  if (mode === 'reserve') {
    // A reserva nunca dá game over. Com input, aproxima-se de um alvo baixo;
    // sem input, desacelera até parar. A aproximação é frame-rate independent.
    const alvo = up ? tuning.V_LIMP : down ? -tuning.V_LIMP * 0.5 : 0;
    const amortecimento = Math.pow(tuning.PARADA_SUAVE, safeDt * 60);
    vF += (alvo - vF) * (1 - amortecimento);
    if (!up && !down && Math.abs(vF) < STOP_EPSILON) vF = 0;
  } else {
    if (up) vF += tuning.ACEL * safeDt;
    if (down) vF -= tuning.ACEL * safeDt;

    // Rolamento frame-rate independent.
    if (!up && !down) {
      vF *= Math.pow(tuning.ATRITO, safeDt * 60);
    }

    // Ré deliberadamente mais lenta que a marcha à frente.
    vF = limitar(vF, -tuning.V_MAX * 0.5, tuning.V_MAX);
  }

  // Vira apenas em movimento. O sentido é invertido quando o carro está em ré.
  const fator = Math.min(1, Math.abs(vF) / tuning.V_MAX);
  const sentido = Math.sign(vF) || 1;
  let nextHeading = h;
  if (left) nextHeading += tuning.GIRO * safeDt * fator * sentido;
  if (right) nextHeading -= tuning.GIRO * safeDt * fator * sentido;

  // Grip é aderência lateral: quanto menor, mais velocidade lateral fica.
  // A versão anterior multiplicava diretamente por `grip`, invertendo a
  // semântica do freio de mão (0.6 matava o drift mais rápido que 0.9).
  const grip = handbrake ? tuning.FREIO_MAO_GRIP : tuning.GRIP;
  const lateralRetention = Math.max(0, 1 - grip);
  vL *= Math.pow(lateralRetention, safeDt * 60);

  return {
    heading: nextHeading,
    velocity: {
      x: fwdX * vF + rightX * vL,
      y: v.y,
      z: fwdZ * vF + rightZ * vL,
    },
  };
}
