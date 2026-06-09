import { useEffect, useRef } from 'react';
import { useGame } from '../store/useGame.js';
import { falar, nomeParaVoz } from '../audio/voz.js';
import { somSucesso } from '../audio/sons.js';
import {
  DESTINOS_GPS,
  FRASE_PEDIDO,
  FRASE_CHEGADA,
} from '../missions/destinos.js';

// === Tempos de orquestração — afináveis ===
const CELEBRACAO_MS         = 2200; // entre completar uma missão e sortear a próxima
const PRIMEIRA_NARRACAO_MS  = 1900; // delay após 1ª interação (deixa a saudação tocar)
const NOVA_MISSAO_NARRACAO_MS = 250; // pequeno respiro entre voz de chegada e nova

// Comemoração ESPECIAL com o nome da criança a cada N chegadas — parcimônia
// (adendo de narrativa: o nome em toda frase vira ruído).
const CHEGADAS_POR_ESPECIAL = 4;

/**
 * Orquestra o ciclo da missão de GPS:
 *  1) Boot: garante uma missão de GPS válida ativa.
 *  2) Primeira interação: destrava o speechSynthesis (autoplay policy) e narra
 *     a missão atual depois da saudação ("Bem-vindo ao Órbi").
 *  3) Quando o destino muda (nova missão), narra o novo pedido.
 *  4) Quando a missão é concluída: somSucesso + voz comemorando, e depois
 *     de CELEBRACAO_MS sorteia o próximo destino.
 *
 * Render-less (retorna null). Mantém o JSX da cena 3D limpo.
 */
export function MissionController() {
  const destino = useGame((s) => s.missao?.destino);
  const concluida = useGame((s) => s.missao?.concluida);

  const ultimoNarrado    = useRef(null);
  const ultimoConcluido  = useRef(false);
  const interagiu        = useRef(false);
  const proximaMissaoTO  = useRef(null);
  const narrarTO         = useRef(null);
  const chegadas         = useRef(0); // conta chegadas da sessão (p/ especial c/ nome)

  // 1) BOOT — garante uma missão de GPS válida ao montar.
  useEffect(() => {
    const m = useGame.getState().missao;
    const valida =
      m && m.tipo === 'gps' && DESTINOS_GPS.includes(m.destino) && !m.concluida;
    if (!valida) {
      useGame.getState().iniciarMissaoGPS();
    }
  }, []);

  // 2) PRIMEIRA INTERAÇÃO — destrava fala e narra missão atual após delay.
  useEffect(() => {
    const onFirst = () => {
      if (interagiu.current) return;
      interagiu.current = true;
      narrarTO.current = setTimeout(() => {
        const m = useGame.getState().missao;
        if (m?.destino && !m.concluida && ultimoNarrado.current !== m.destino) {
          falar(FRASE_PEDIDO[m.destino]);
          ultimoNarrado.current = m.destino;
        }
      }, PRIMEIRA_NARRACAO_MS);
    };
    window.addEventListener('keydown', onFirst, { once: true });
    window.addEventListener('pointerdown', onFirst, { once: true });
    return () => {
      window.removeEventListener('keydown', onFirst);
      window.removeEventListener('pointerdown', onFirst);
    };
  }, []);

  // 3) MUDANÇA DE DESTINO — narra cada nova missão (após 1ª interação).
  useEffect(() => {
    if (!destino || concluida) return;
    if (!interagiu.current) return; // 1ª missão é narrada pelo efeito acima
    if (ultimoNarrado.current === destino) return;
    const id = setTimeout(() => {
      const m = useGame.getState().missao;
      if (m?.destino === destino && !m.concluida) {
        falar(FRASE_PEDIDO[destino]);
        ultimoNarrado.current = destino;
      }
    }, NOVA_MISSAO_NARRACAO_MS);
    return () => clearTimeout(id);
  }, [destino, concluida]);

  // 4) CONCLUÍDA — som + voz + agenda nova missão.
  useEffect(() => {
    if (concluida && !ultimoConcluido.current) {
      somSucesso();
      const dest = useGame.getState().missao?.destino;
      if (dest) {
        chegadas.current += 1;
        let frase = FRASE_CHEGADA[dest] || 'Uau! Chegamos!';
        // de vez em quando a comemoração chama a criança pelo nome — ela é quem
        // guia o Órbi (frase neutra: serve pra menino e menina)
        const nome = useGame.getState().nome;
        if (nome && chegadas.current % CHEGADAS_POR_ESPECIAL === 0) {
          frase += ` Você guia muito bem, ${nomeParaVoz(nome)}!`;
        }
        falar(frase, { interrupt: true });
      }
      clearTimeout(proximaMissaoTO.current);
      proximaMissaoTO.current = setTimeout(() => {
        useGame.getState().iniciarMissaoGPS();
      }, CELEBRACAO_MS);
    }
    ultimoConcluido.current = !!concluida;
  }, [concluida]);

  // Limpeza geral
  useEffect(
    () => () => {
      clearTimeout(proximaMissaoTO.current);
      clearTimeout(narrarTO.current);
    },
    []
  );

  return null;
}
