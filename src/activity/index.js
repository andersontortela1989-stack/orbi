import { falar, pararFala } from '../audio/voz.js';
import { criarCoordenadorAtividade } from './activity-machine.js';

// Instância única da sessão de jogo. A voz existente é adaptada — não
// substituída — preservando seleção feminina, pronúncia, fila e onEnd.
export const coordenadorAtividade = criarCoordenadorAtividade({
  voz: {
    falar: (texto, opts) => falar(texto, opts),
    calar: pararFala,
  },
});

/** Fala somente quando a atividade informada realmente detém o foco. */
export function falarDaAtividade(atividade, texto, opts) {
  return coordenadorAtividade.falar(atividade, texto, opts);
}

/**
 * Para eventos globais iniciados pela criança (céu, aviso de combustível):
 * atribui a fala ao foco atual, sem permitir fala quando o jogo está pausado.
 */
export function falarNoFoco(texto, opts) {
  return coordenadorAtividade.falar(
    coordenadorAtividade.estado().foco,
    texto,
    opts
  );
}
