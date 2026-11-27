/**
 * FAIXA DE APOIO (H4) — escolha dos pais na Área dos Pais.
 *
 * Módulo JS puro (sem React/Zustand) para ser testado direto no Node.
 * Mora em chave própria do localStorage para nunca contaminar o save principal
 * ('cidade-turbo-3d', v8) nem interferir no Modo Tranquilo.
 */

export const CHAVE_FAIXA_ETARIA = 'orbi-faixa-etaria';
export const FAIXA_ETARIA_PADRAO = '3-5';

export const FAIXAS_ETARIAS = Object.freeze([
  Object.freeze({
    id: '3-5',
    rotulo: '3 a 5 anos',
    subtitulo: 'Mais apoio visual e áudio',
    descricao: 'Horta com 3 sementes (1 por canteiro) e condução mais direta.',
  }),
  Object.freeze({
    id: '6-7',
    rotulo: '6 a 7 anos',
    subtitulo: 'Equilíbrio entre apoio e desafio',
    descricao: 'Horta com 4 sementes, pergunta no Mercado e mais autonomia.',
  }),
  Object.freeze({
    id: '8-10',
    rotulo: '8 a 10 anos',
    subtitulo: 'Mais desafio e curiosidade',
    descricao: 'Horta com 6 sementes (2 por canteiro) e ritmo mais aberto.',
  }),
]);

const IDS_VALIDOS = new Set(FAIXAS_ETARIAS.map((f) => f.id));

export function normalizarFaixaEtaria(valor) {
  return typeof valor === 'string' && IDS_VALIDOS.has(valor)
    ? valor
    : FAIXA_ETARIA_PADRAO;
}

function storagePadrao() {
  return typeof localStorage !== 'undefined' ? localStorage : null;
}

export function lerFaixaEtaria(storage = storagePadrao()) {
  if (!storage) return FAIXA_ETARIA_PADRAO;
  try {
    return normalizarFaixaEtaria(storage.getItem(CHAVE_FAIXA_ETARIA));
  } catch (_) {
    return FAIXA_ETARIA_PADRAO;
  }
}

export function salvarFaixaEtaria(valor, storage = storagePadrao()) {
  const faixa = normalizarFaixaEtaria(valor);
  if (storage) {
    try {
      storage.setItem(CHAVE_FAIXA_ETARIA, faixa);
    } catch (_) {
      /* storage indisponível ou cheio: devolve o valor normalizado sem quebrar */
    }
  }
  return faixa;
}
