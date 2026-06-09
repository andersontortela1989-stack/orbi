/**
 * Narração pt-BR via Web Speech API.
 *
 * Notas importantes:
 * - Browsers bloqueiam speech antes da primeira interação do usuário (autoplay policy).
 *   Por isso a chamada inicial precisa ser disparada de um keydown/click.
 * - A lista de vozes (`getVoices()`) carrega assíncrona; tentamos pegar a melhor voz
 *   pt-BR no momento da chamada e, se ainda não houver, deixamos o browser escolher
 *   uma voz default só com `lang = 'pt-BR'`.
 */

let initialized = false;

function ensureInit() {
  if (initialized) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  initialized = true;
  // Dispara o carregamento da lista de vozes
  window.speechSynthesis.getVoices();
}

function bestVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return (
    voices.find((v) => v.lang === 'pt-BR') ||
    voices.find((v) => v.lang?.toLowerCase().startsWith('pt')) ||
    null
  );
}

/**
 * Fala um texto em pt-BR. Silenciosamente no-op se o browser não suportar.
 * @param {string} texto
 * @param {{ rate?: number, pitch?: number, volume?: number, interrupt?: boolean,
 *           onEnd?: () => void }} [opts]
 * @returns {boolean} true se a fala foi enfileirada; false se não há suporte
 *   (quem depende do onEnd pra avançar usa o retorno pra cair num timeout).
 */
export function falar(texto, opts = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  ensureInit();

  if (opts.interrupt) window.speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(String(texto));
  u.lang = 'pt-BR';
  u.rate = opts.rate ?? 1.0;
  u.pitch = opts.pitch ?? 1.0;
  u.volume = opts.volume ?? 1.0;
  if (opts.onEnd) {
    // onerror também: um erro de síntese substitui o evento `end`, e quem
    // espera o fim pra seguir em frente não pode ficar pendurado.
    u.onend = opts.onEnd;
    u.onerror = opts.onEnd;
  }
  const v = bestVoice();
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
  return true;
}

/**
 * O nome da criança é guardado em CAIXA ALTA (identidade visual do jogo), mas
 * alguns TTS soletram palavras todas em maiúsculas ("H-E-I-T-O-R"). Antes de
 * falar, converte pra caixa de nome próprio ("Heitor").
 */
export function nomeParaVoz(nome) {
  return String(nome || '')
    .toLowerCase()
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

export function pararFala() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
