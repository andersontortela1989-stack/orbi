/**
 * Narração pt-BR via Web Speech API — a VOZ DO ÓRBI.
 *
 * Notas importantes:
 * - Browsers bloqueiam speech antes da primeira interação do usuário (autoplay policy).
 *   Por isso a chamada inicial precisa ser disparada de um keydown/click.
 * - A lista de vozes (`getVoices()`) carrega ASSÍNCRONA: no Chrome a primeira
 *   chamada costuma retornar [] e a lista só popula no evento `voiceschanged`.
 *   Estratégia: seleção LAZY (computada na primeira fala e cacheada) +
 *   re-seleção quando `voiceschanged` dispara (cache invalidado) + fallback
 *   se a lista nunca popular (utterance sai só com lang='pt-BR', voz default).
 * - Personagem: rate/pitch padrão vivem em VOZ_ORBI (um lugar só) — toda fala
 *   do jogo sai com a mesma cara. Override pontual via opts segue possível.
 */

/**
 * O "timbre" do Órbi — CLAREZA > caricatura (criança TEA precisa de fala
 * inteligível antes de engraçada). Ajustar AQUI e em nenhum outro lugar.
 *
 * O personagem vem do RATE + da ESCRITA das falas, não do pitch:
 * - rate 0.95 — um tiquinho mais calmo que o padrão (caráter aprovado).
 * - pitch 1.0 NEUTRO por compatibilidade (teste de 2 browsers, 2026-06-10):
 *   a voz Google do Chrome RESPEITA pitch e com 1.15 ficava "voz de GPS";
 *   as neurais do Edge (Natural) IGNORAM pitch — então subir o pitch só
 *   piorava o Chrome sem mudar nada no Edge (o browser oficial do Órbi).
 */
export const VOZ_ORBI = {
  rate: 0.95,
  pitch: 1.0,
};

let initialized = false;

// Cache da voz escolhida — recalculada lazy quando inválido (primeira fala,
// ou após `voiceschanged` repopular a lista).
let vozEscolhida = null;
let cacheValido = false;

function ensureInit() {
  if (initialized) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  initialized = true;
  // Dispara o carregamento da lista de vozes
  window.speechSynthesis.getVoices();
  // Lista (re)populou → invalida o cache; a PRÓXIMA fala re-seleciona.
  // (Em browsers que nunca disparam o evento, a seleção lazy por fala cobre.)
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    cacheValido = false;
  });
}

/**
 * Ranking de vozes pra voz do Órbi — maior pontuação vence; empate fica com
 * a primeira na ordem da lista do browser:
 *   5 — pt-BR neural ("Natural"/"Online" no nome: Microsoft Francisca/
 *       Antonio/Thalita no Edge — as melhores disponíveis de graça)
 *   4 — "Google português do Brasil" (Chrome)
 *   3 — qualquer pt-BR (inclui `pt_BR` com underscore — Android/Linux)
 *   2 — qualquer pt-* (pt-PT: sotaque errado, mas é português)
 *   0 — não-pt: NUNCA escolhida (melhor o default do browser com
 *       lang='pt-BR' do que uma voz inglesa lendo português)
 */
function pontuacao(v) {
  const nome = (v.name || '').toLowerCase();
  const lang = (v.lang || '').toLowerCase().replace('_', '-');
  if (lang === 'pt-br') {
    if (/natural|online/.test(nome)) return 5;
    if (/google/.test(nome)) return 4;
    return 3;
  }
  if (lang.startsWith('pt')) return 2;
  return 0;
}

function bestVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  if (cacheValido) return vozEscolhida;

  const voices = window.speechSynthesis.getVoices();
  // Lista ainda não populou: NÃO valida o cache — re-tenta na próxima fala.
  if (!voices.length) return null;

  let melhor = null;
  let melhorPontos = 0;
  for (const v of voices) {
    const p = pontuacao(v);
    if (p > melhorPontos) {
      melhor = v;
      melhorPontos = p;
    }
  }

  vozEscolhida = melhor;
  cacheValido = true;

  // Diagnóstico por browser/dispositivo (só em dev) — loga SEMPRE que o
  // cache (re)valida: comparar com o valor anterior esconderia o caso
  // "nenhuma voz pt" (null → null) logo na primeira seleção.
  if (import.meta.env?.DEV) {
    console.info(
      melhor
        ? `[voz] Órbi falando com: ${melhor.name} (${melhor.lang})`
        : '[voz] nenhuma voz pt encontrada — usando a default do browser'
    );
  }

  return vozEscolhida;
}

/**
 * Fala um texto em pt-BR com o timbre do Órbi. Silenciosamente no-op se o
 * browser não suportar.
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
  u.rate = opts.rate ?? VOZ_ORBI.rate;
  u.pitch = opts.pitch ?? VOZ_ORBI.pitch;
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
