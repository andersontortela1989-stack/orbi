/**
 * Chave do estilo visual (fatia V1): `?estilo=real` liga o estilo realista;
 * qualquer outro valor — ou nenhum — mantém o estilo atual intacto.
 *
 * Lida UMA vez, na carga do pacote do jogo: trocar de estilo exige recarregar
 * a página (nada remonta no meio da brincadeira). Só arquivos do
 * GameExperience importam este módulo, então o pacote inicial não muda.
 */
export function lerEstilo(search) {
  if (typeof search !== 'string') return 'atual';
  return new URLSearchParams(search).get('estilo') === 'real' ? 'real' : 'atual';
}

export const ESTILO =
  typeof location !== 'undefined' ? lerEstilo(location.search) : 'atual';

export const estiloReal = ESTILO === 'real';
