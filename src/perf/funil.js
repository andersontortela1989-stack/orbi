/**
 * FUNIL ANÔNIMO DE ETAPAS — compatível com Vercel Web Analytics (plano Hobby).
 *
 * Em SPA de URL única (/), quase toda visita conta como bounce. Atualizar a
 * rota limpa entre abertura (/), intro (/historia) e cidade (/jogar) permite
 * ver na aba Pages quantos visitantes realmente clicam em JOGAR e entram na
 * cidade — sem coletar nenhum dado pessoal e preservando query strings de
 * teste (?medir=1, ?faixa=, ?estilo=real).
 */

export const ROTAS_FASE = Object.freeze({
  abertura: '/',
  intro: '/historia',
  jogo: '/jogar',
});

export function caminhoDaFase(fase, search = '', hash = '') {
  const base = Object.hasOwn(ROTAS_FASE, fase) ? ROTAS_FASE[fase] : ROTAS_FASE.abertura;
  return base + (search || '') + (hash || '');
}

export function registrarEtapaFunil(fase, win = typeof window !== 'undefined' ? window : null) {
  if (!win || !win.history || !win.location) return false;
  const destino = Object.hasOwn(ROTAS_FASE, fase) ? ROTAS_FASE[fase] : ROTAS_FASE.abertura;
  if (win.location.pathname === destino) return false;

  const url = caminhoDaFase(fase, win.location.search, win.location.hash);
  try {
    if (destino === ROTAS_FASE.abertura) {
      if (typeof win.history.replaceState === 'function') {
        win.history.replaceState(null, '', url);
        return true;
      }
      return false;
    }
    if (typeof win.history.pushState === 'function') {
      win.history.pushState(null, '', url);
      return true;
    }
    return false;
  } catch (_) {
    return false;
  }
}
