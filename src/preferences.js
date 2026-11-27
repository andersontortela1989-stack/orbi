/**
 * Preferências sensoriais do Órbi.
 *
 * Este módulo é JS puro para que o contrato possa ser testado sem React,
 * browser ou Zustand. O Modo Tranquilo é um PRESET: a família pode ativá-lo
 * com um toque e depois personalizar cada opção individualmente.
 */
export const PREFERENCIAS_PADRAO = Object.freeze({
  modoTranquilo: false,
  voz: true,
  sons: true,
  animacoes: true,
  detalhesVisuais: true,
});

export const PRESET_TRANQUILO = Object.freeze({
  modoTranquilo: true,
  voz: true,
  sons: false,
  animacoes: false,
  detalhesVisuais: false,
});

export const CHAVES_PREFERENCIAS = Object.freeze(
  Object.keys(PREFERENCIAS_PADRAO)
);

/** Mantém somente booleanos conhecidos; valor inválido volta ao padrão. */
export function normalizarPreferencias(valor, padrao = PREFERENCIAS_PADRAO) {
  const entrada = valor && typeof valor === 'object' && !Array.isArray(valor)
    ? valor
    : {};

  return Object.fromEntries(
    Object.entries(padrao).map(([chave, fallback]) => [
      chave,
      typeof entrada[chave] === 'boolean' ? entrada[chave] : fallback,
    ])
  );
}

/** Alterar uma opção após o preset transforma o perfil em personalizado. */
export function personalizarPreferencia(preferencias, chave, valor) {
  if (!CHAVES_PREFERENCIAS.includes(chave) || chave === 'modoTranquilo') {
    return normalizarPreferencias(preferencias);
  }
  return {
    ...normalizarPreferencias(preferencias),
    modoTranquilo: false,
    [chave]: !!valor,
  };
}
