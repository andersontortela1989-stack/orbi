import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGame } from '../store/useGame.js';
import { useKeyboard } from '../hooks/useKeyboard.js';
import { coordenadorAtividade, falarNoFoco } from '../activity/index.js';
import {
  CONSUMO_POR_METRO,
  V_LIMP,
  PARADA_SUAVE,
  LIMIAR_BAIXO,
} from '../economia.js';

/**
 * Controlador de combustível (Fatia 5) — render-less.
 *
 * POR QUE NÃO MEXE NO Car.jsx: a física do carro é o núcleo de risco do
 * projeto e está aprovada pelo feel. Em vez de editá-la, este componente lê o
 * MESMO rigidBody (carRef) num useFrame que roda DEPOIS do Car.jsx (graças à
 * ordem de montagem em Game.jsx) e só faz duas coisas:
 *
 *   1) CONSUMO proporcional à distância: enquanto o carro anda, gasta
 *      combustível devagar (parado não gasta). A barra do HUD desce.
 *   2) TANQUE VAZIO: desacelera suave até parar. SEM game over. Segurando a
 *      seta, o carro ainda anda em modo RESERVA (V_LIMP) — nunca fica preso
 *      sem conseguir chegar ao posto. Aviso calmo e narrado uma única vez.
 *
 * Truque do "vazio": em vez de brigar com a velocidade que o Car.jsx acabou de
 * escrever, controlamos uma `coastSpeed` própria e reescrevemos a velocidade
 * horizontal na DIREÇÃO atual do carro (preserva v.y = gravidade, e a direção
 * continua vindo do heading do Car.jsx). Suave e previsível.
 */
export function FuelController({ targetRef }) {
  const input = useKeyboard();
  const acc = useRef(0); // combustível acumulado pra gravar em lote (evita 60 sets/s)
  const coastSpeed = useRef(0); // velocidade que controlamos no modo vazio
  const lastDir = useRef({ x: 0, z: 1 }); // última direção horizontal conhecida
  const avisouVazio = useRef(false);
  const avisouBaixo = useRef(false);

  useFrame((_, deltaRaw) => {
    const rb = targetRef.current;
    if (!rb) return;
    if (!coordenadorAtividade.estado().mundo) return;

    const dt = Math.min(deltaRaw, 1 / 30);
    const v = rb.linvel();
    const speed = Math.hypot(v.x, v.z);

    // Mantém a última direção válida (pra reescrever no modo vazio sem girar)
    if (speed > 0.01) {
      lastDir.current.x = v.x / speed;
      lastDir.current.z = v.z / speed;
    }

    const combustivel = useGame.getState().combustivel;

    if (combustivel > 0) {
      // --- TEM COMBUSTÍVEL: consome pela distância andada neste frame ---
      coastSpeed.current = speed; // mantém sincronizado pro caso de zerar agora
      acc.current += speed * dt * CONSUMO_POR_METRO;
      if (acc.current >= 0.5) {
        useGame.getState().gastarCombustivel(acc.current);
        acc.current = 0;
      }

      // Aviso calmo de combustível baixo — uma vez por episódio (rearmado ao subir)
      avisouVazio.current = false;
      if (combustivel > LIMIAR_BAIXO) {
        avisouBaixo.current = false;
      } else if (!avisouBaixo.current) {
        avisouBaixo.current = true;
        // tom do Órbi (adendo de narrativa): ele pede ajuda, não dá ordem
        falarNoFoco('Ih, a gasolina está baixa! Me leva no posto?');
      }
    } else {
      // --- TANQUE VAZIO: desacelera suave até parar, com modo reserva ---
      const acelera = input.current.up || input.current.down;
      const damp = Math.pow(PARADA_SUAVE, dt * 60);

      if (acelera) {
        // Reserva: desliza suave até V_LIMP e segura ali (dá pra chegar ao posto)
        coastSpeed.current =
          coastSpeed.current > V_LIMP
            ? Math.max(V_LIMP, coastSpeed.current * damp)
            : V_LIMP;
      } else {
        // Sem acelerar: desacelera suave até parar de vez
        coastSpeed.current *= damp;
        if (coastSpeed.current < 0.05) coastSpeed.current = 0;
      }

      const dir = lastDir.current;
      rb.setLinvel(
        { x: dir.x * coastSpeed.current, y: v.y, z: dir.z * coastSpeed.current },
        true
      );

      // Aviso calmo e narrado, uma única vez ao acabar
      if (!avisouVazio.current) {
        avisouVazio.current = true;
        avisouBaixo.current = true; // não repetir o aviso de "baixo" logo em seguida
        falarNoFoco('Ih, acabou! Me leva no posto?', { interrupt: true });
      }
    }
  });

  return null;
}
