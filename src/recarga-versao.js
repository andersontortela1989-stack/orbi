/**
 * R1 — recarga única quando uma parte do jogo não baixa.
 *
 * Depois de uma promoção na Vercel, uma aba aberta antes ainda tem o
 * index.html antigo e pede o GameExperience de um hash que não existe mais.
 * O Vite avisa com `vite:preloadError`; recarregar traz o index.html novo.
 *
 * Trava contra repetição: a marca da última recarga fica no sessionStorage.
 * Marca recente (menos de 10 s) = não recarrega e deixa o erro seguir. Sem
 * conseguir ler ou gravar a marca (storage bloqueado ou inacessível), também
 * não recarrega — melhor o erro do que uma página que recarrega sem parar.
 *
 * Fica no pacote inicial (teto de 200 kB): código curto de propósito. Marca
 * ausente vira `agora - null` = agora (recarrega); `setItem` já grava texto.
 */
export const CHAVE_RECARGA = 'orbi-recarga-versao';
export const JANELA_RECARGA_MS = 10000;

/** Recarrega agora? Grava a marca quando a resposta é sim. */
export function deveRecarregar(janela, agora) {
  try {
    const storage = janela.sessionStorage;
    if (agora - storage.getItem(CHAVE_RECARGA) < JANELA_RECARGA_MS) return false;
    storage.setItem(CHAVE_RECARGA, agora);
    return true;
  } catch {
    return false;
  }
}

export function instalarRecargaDeVersao(janela) {
  janela.addEventListener('vite:preloadError', (evento) => {
    if (!deveRecarregar(janela, Date.now())) return;
    evento.preventDefault();
    janela.location.reload();
  });
}
