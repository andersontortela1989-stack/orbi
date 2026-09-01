import { QUANTIDADES } from '../missions/chegadas-vivas.js';

// BUILD 02.A — capability mínima e estática. A única interação contextual
// autorizada nesta etapa é a PADARIA; desligar este boolean restaura o
// roteamento legado sem criar configuração persistida ou sistema de flags.
export const CAPACIDADES_CONTEXTUAIS = {
  PADARIA: true,
};

export function temInteracaoContextual(lugar) {
  return lugar === 'PADARIA' && CAPACIDADES_CONTEXTUAIS.PADARIA === true;
}

export function interacaoContextualBloqueiaInput(interacao) {
  return interacao?.status === 'ativa' || interacao?.status === 'concluida';
}

export function criarInteracaoContextual(lugar, origem, random = Math.random) {
  if (!temInteracaoContextual(lugar)) return null;
  if (origem !== 'missao' && origem !== 'exploracao') return null;
  const indice = Math.min(
    QUANTIDADES.length - 1,
    Math.floor(Math.max(0, random()) * QUANTIDADES.length)
  );
  return {
    tipo: 'padaria-paes-v1',
    lugar: 'PADARIA',
    origem,
    alvo: QUANTIDADES[indice],
    status: origem === 'missao' ? 'aguardando-celebracao' : 'ativa',
  };
}

export function encaminharChegadaContextual(
  lugar,
  chegadaProcessada,
  { preparar, abrir },
  { bloqueado = false } = {}
) {
  if (bloqueado || !temInteracaoContextual(lugar)) return false;
  return chegadaProcessada
    ? preparar(lugar, 'missao') !== false
    : abrir(lugar, 'exploracao') !== false;
}

export function resolverPosCelebracaoContextual(
  lugar,
  { ativar, limpar, fallback }
) {
  if (ativar(lugar)) return 'contextual';
  limpar?.(lugar);
  fallback();
  return 'legado';
}
