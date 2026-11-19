/**
 * Números por extenso, para a voz e para a leitura global: o TTS pronuncia
 * "três" melhor do que "3" no meio da frase. Usado pela Horta e pelos
 * adesivos de número do Caderninho (H3).
 */
export const MASCULINO = Object.freeze({
  1: 'um', 2: 'dois', 3: 'três', 4: 'quatro', 5: 'cinco',
  6: 'seis', 7: 'sete', 8: 'oito', 9: 'nove', 10: 'dez',
});
export const FEMININO = Object.freeze({ ...MASCULINO, 1: 'uma', 2: 'duas' });

/** Por extenso quando existe; senão, o próprio número como texto. */
export const porExtenso = (n, tabela = MASCULINO) => tabela[n] ?? String(n);
