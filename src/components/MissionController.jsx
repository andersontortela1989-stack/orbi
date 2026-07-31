import { useEffect, useRef } from 'react';
import { useGame } from '../store/useGame.js';
import { nomeParaVoz } from '../audio/voz.js';
import { falarDaAtividade } from '../activity/index.js';
import { useActivity, useRegistrarAtividade } from '../activity/useActivity.js';
import { somSucesso } from '../audio/sons.js';
import {
  frasesDaMissao,
  chaveDaMissao,
  temChegadaViva,
} from '../missions/missoes.js';

// === Tempos de orquestração — afináveis ===
const CELEBRACAO_MS         = 2200; // entre completar uma missão e sortear a próxima
const PRIMEIRA_NARRACAO_MS  = 1900; // delay após 1ª interação (deixa a saudação tocar)
const NOVA_MISSAO_NARRACAO_MS = 250; // pequeno respiro entre voz de chegada e nova
const REDICA_BUSCA_MS       = 45000; // re-dica única da busca (Frente 5)

// Comemoração ESPECIAL com o nome da criança a cada N chegadas — parcimônia
// (adendo de narrativa: o nome em toda frase vira ruído).
const CHEGADAS_POR_ESPECIAL = 4;

/**
 * Orquestra o ciclo de missões — GPS e Ciências (Fatia 8):
 *  1) Boot: garante uma missão válida ativa (qualquer tipo que o registry
 *     de missoes.js reconheça; inválida/antiga → sorteia nova).
 *  2) Primeira interação: destrava o speechSynthesis (autoplay policy) e narra
 *     a missão atual depois da saudação ("Bem-vindo ao Órbi").
 *  3) Quando a missão muda, narra o novo pedido. A identidade da missão é a
 *     `chaveDaMissao` (destino no GPS; animal em Ciências — lá o destino é
 *     sempre VET e não diferenciaria).
 *  4) Quando a missão é concluída: somSucesso + voz comemorando, e depois
 *     de CELEBRACAO_MS sorteia a próxima (proximaMissao: GPS ou Ciências).
 *     EXCEÇÃO: destino com CHEGADA VIVA (ex.: ZOO) abre a
 *     mini-interação no lugar de sortear — quem fecha o painel é que
 *     chama a próxima missão (uma coisa por vez).
 *
 * Render-less (retorna null). Mantém o JSX da cena 3D limpo.
 */
export function MissionController() {
  const destino = useGame((s) => s.missao?.destino);
  const animal = useGame((s) => s.missao?.animal);
  const concluida = useGame((s) => s.missao?.concluida);
  const tipo = useGame((s) => s.missao?.tipo);
  const missaoReconhecida =
    tipo === 'gps' || tipo === 'ciencias' || tipo === 'busca';
  useRegistrarAtividade('em_missao', missaoReconhecida);
  const { foco } = useActivity();

  const ultimoNarrado    = useRef(null);
  const ultimoConcluido  = useRef(false);
  const interagiu        = useRef(false);
  const proximaMissaoTO  = useRef(null);
  const narrarTO         = useRef(null);
  const chegadas         = useRef(0); // conta chegadas da sessão (p/ especial c/ nome)

  // 1) BOOT — garante uma missão válida ao montar (gps OU ciencias; missão
  // persistida que o registry não reconhece é descartada e sorteia-se nova).
  useEffect(() => {
    const m = useGame.getState().missao;
    const valida = m && !m.concluida && !!frasesDaMissao(m);
    if (!valida) {
      useGame.getState().proximaMissao();
    }
  }, []);

  // 2) PRIMEIRA INTERAÇÃO — destrava fala e narra missão atual após delay.
  useEffect(() => {
    const onFirst = () => {
      if (interagiu.current) return;
      interagiu.current = true;
      narrarTO.current = setTimeout(() => {
        const m = useGame.getState().missao;
        const frases = frasesDaMissao(m);
        const chave = chaveDaMissao(m);
        if (frases && !m.concluida && ultimoNarrado.current !== chave) {
          if (falarDaAtividade('em_missao', frases.pedido)) {
            ultimoNarrado.current = chave;
          }
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

  // 3) MUDANÇA DE MISSÃO — narra cada nova missão (após 1ª interação).
  useEffect(() => {
    if (!destino || concluida) return;
    if (!interagiu.current) return; // 1ª missão é narrada pelo efeito acima
    const chave = chaveDaMissao(useGame.getState().missao);
    if (ultimoNarrado.current === chave) return;
    const id = setTimeout(() => {
      const m = useGame.getState().missao;
      const frases = frasesDaMissao(m);
      if (frases && chaveDaMissao(m) === chave && !m.concluida) {
        if (falarDaAtividade('em_missao', frases.pedido)) {
          ultimoNarrado.current = chave;
        }
      }
    }, NOVA_MISSAO_NARRACAO_MS);
    return () => clearTimeout(id);
  }, [destino, animal, concluida, foco]);

  // 3b) RE-DICA da BUSCA (Frente 5) — se a busca segue aberta após 45s,
  // a voz repete a MESMA pista UMA única vez (previsível, sem escalada;
  // o banner já é a dica visual permanente). NADA punitivo: depois da
  // re-dica, silêncio — a missão espera o tempo que precisar. O timer
  // limpa sozinho na conclusão/troca (deps + cleanup).
  useEffect(() => {
    if (concluida || !destino || foco !== 'em_missao') return;
    if (useGame.getState().missao?.tipo !== 'busca') return;
    const id = setTimeout(() => {
      const m = useGame.getState().missao;
      const frases = frasesDaMissao(m);
      if (m?.tipo === 'busca' && m.destino === destino && !m.concluida && frases) {
        falarDaAtividade('em_missao', frases.pedido);
      }
    }, REDICA_BUSCA_MS);
    return () => clearTimeout(id);
  }, [destino, concluida, foco]);

  // 4) CONCLUÍDA — som + voz + agenda nova missão.
  useEffect(() => {
    if (concluida && !ultimoConcluido.current) {
      somSucesso();
      const m = useGame.getState().missao;
      if (m?.destino) {
        chegadas.current += 1;
        let frase = frasesDaMissao(m)?.chegada || 'Uau! Chegamos!';
        // de vez em quando a comemoração chama a criança pelo nome — ela é quem
        // guia o Órbi (frase neutra: serve pra menino e menina)
        const nome = useGame.getState().nome;
        if (nome && chegadas.current % CHEGADAS_POR_ESPECIAL === 0) {
          frase += ` Você guia muito bem, ${nomeParaVoz(nome)}!`;
        }
        falarDaAtividade('em_missao', frase, { interrupt: true });
      }
      clearTimeout(proximaMissaoTO.current);
      proximaMissaoTO.current = setTimeout(() => {
        const atual = useGame.getState().missao;
        if (atual?.tipo === 'gps' && temChegadaViva(atual.destino)) {
          useGame.getState().abrirChegadaViva(atual.destino);
        } else {
          useGame.getState().proximaMissao();
        }
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
