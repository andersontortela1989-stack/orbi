/**
 * PORTÃO PARENTAL (H4) — exige segurar por 1,5 s para abrir a Área dos Pais.
 *
 * Sem teclado virtual (mobile-first): toque rápido não abre e devolve um aviso
 * discreto; soltar antes do tempo cancela sem efeito colateral.
 */

export const DURACAO_PORTAO_MS = 1500;

export function criarPortaoParental({
  onAbrir,
  onToqueRapido,
  duracaoMs = DURACAO_PORTAO_MS,
  setTimeoutFn = setTimeout,
  clearTimeoutFn = clearTimeout,
} = {}) {
  let timer = null;
  let ativo = false;
  let abriu = false;

  const limpar = () => {
    if (timer !== null) {
      clearTimeoutFn(timer);
      timer = null;
    }
  };

  return Object.freeze({
    iniciar() {
      if (ativo) return false;
      ativo = true;
      abriu = false;
      limpar();
      timer = setTimeoutFn(() => {
        timer = null;
        ativo = false;
        abriu = true;
        if (typeof onAbrir === 'function') onAbrir();
      }, duracaoMs);
      return true;
    },
    cancelar({ notificarToqueRapido = false } = {}) {
      if (!ativo) return false;
      limpar();
      ativo = false;
      if (notificarToqueRapido && !abriu && typeof onToqueRapido === 'function') {
        onToqueRapido();
      }
      return true;
    },
    destruir() {
      limpar();
      ativo = false;
    },
    estaAtivo() {
      return ativo;
    },
  });
}
