import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGame } from '../store/useGame.js';
import { falar } from '../audio/voz.js';
import {
  CONSUMO_POR_METRO,
  LIMIAR_BAIXO,
} from '../economia.js';

/**
 * Controlador de combustível (Fatia 5) — render-less.
 *
 * Este componente é deliberadamente OBSERVADOR do RigidBody. Ele mede a
 * distância percorrida, atualiza o combustível e narra os avisos. A decisão
 * física do modo reserva fica no Car.jsx/stepVehicle: existe um único escritor
 * de setLinvel e setRotation, eliminando a dependência da ordem de montagem
 * Car → FuelController que existia anteriormente.
 */
export function FuelController({ targetRef }) {
  const acc = useRef(0); // combustível acumulado pra gravar em lote
  const avisouVazio = useRef(false);
  const avisouBaixo = useRef(false);

  useFrame((_, deltaRaw) => {
    const rb = targetRef.current;
    if (!rb) return;

    const dt = Math.min(deltaRaw, 1 / 30);
    const v = rb.linvel();
    const speed = Math.hypot(v.x, v.z);
    const combustivel = useGame.getState().combustivel;

    if (combustivel > 0) {
      // Consumo proporcional à distância: parado não gasta.
      acc.current += speed * dt * CONSUMO_POR_METRO;
      if (acc.current >= 0.5) {
        useGame.getState().gastarCombustivel(acc.current);
        acc.current = 0;
      }

      // Rearma os avisos quando o tanque volta a ter combustível.
      avisouVazio.current = false;
      if (combustivel > LIMIAR_BAIXO) {
        avisouBaixo.current = false;
      } else if (!avisouBaixo.current) {
        avisouBaixo.current = true;
        falar('Ih, a gasolina está baixa! Me leva no posto?');
      }
      return;
    }

    // O Car/stepVehicle já está em modo reserve. Aqui só narramos uma vez;
    // nenhum componente concorrente reescreve a velocidade final.
    if (!avisouVazio.current) {
      avisouVazio.current = true;
      avisouBaixo.current = true;
      falar('Ih, acabou! Me leva no posto?', { interrupt: true });
    }
  });

  return null;
}
