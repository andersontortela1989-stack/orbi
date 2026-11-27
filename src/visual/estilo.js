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

// Lugares desenhados pelo piloto da esquina (19/11/2026) em `?estilo=real`.
// O desenho chega sob demanda (components/EsquinaReal.jsx); a City monta só
// o colisor do lote, igual ao do Building.
export const SLUGS_ESQUINA = Object.freeze(['PADARIA', 'MERCADO']);
