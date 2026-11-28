/**
 * Utilitários de orientação para celular e navegadores embutidos (WebViews).
 *
 * Apps como Threads (Barcelona), Instagram, Facebook e LinkedIn abrem links
 * em um navegador interno que frequentemente trava a tela em retrato.
 */

const PADRAO_WEBVIEW = /Barcelona|Instagram|FBAN|FBAV|LinkedInApp|TikTok|Snapchat/i;

export function ehNavegadorEmbutido(userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '') {
  return PADRAO_WEBVIEW.test(String(userAgent || ''));
}

export async function tentarGirarPaisagem(
  win = typeof window !== 'undefined' ? window : null,
  doc = typeof document !== 'undefined' ? document : null
) {
  if (!win || !doc) return { ok: false, motivo: 'indisponivel' };
  try {
    const el = doc.documentElement;
    if (!doc.fullscreenElement && el && typeof el.requestFullscreen === 'function') {
      await el.requestFullscreen();
    }
  } catch (_) {
    // Segue para tentar o lock mesmo sem fullscreen.
  }

  try {
    if (win.screen?.orientation && typeof win.screen.orientation.lock === 'function') {
      await win.screen.orientation.lock('landscape');
      return { ok: true, motivo: 'girado' };
    }
  } catch (_) {
    return { ok: false, motivo: 'bloqueado' };
  }

  return { ok: false, motivo: 'nao-suportado' };
}
