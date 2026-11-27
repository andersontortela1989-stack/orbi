/**
 * Roteiros fixos da aventura do parque, usados pelo teste de regressão
 * (tests/parque-regressao.test.js). A sequência de efeitos que eles produzem
 * foi gravada em parque-com-sede-efeitos.json com o motor ANTES da H1.
 */
export const ROTEIROS_PARQUE = {
  // acerta de primeira, espera o destaque, pede ajuda, conta, entrega
  direto: [
    { tipo: 'toque' },
    { tipo: 'respondeu', opcao: 'agua' },
    { tipo: 'tick', segundos: 30 },
    { tipo: 'tick', segundos: 20 },
    { tipo: 'pedir_ajuda' },
    { tipo: 'chegou', lugar: 'PARQUE' },
    { tipo: 'chegou', lugar: 'PORTO' },
    { tipo: 'coletou', item: 'balde_agua', quantidade: 1 },
    { tipo: 'coletou', item: 'semente', quantidade: 1 },
    { tipo: 'coletou', item: 'balde_agua', quantidade: 1 },
    { tipo: 'coletou', item: 'balde_agua', quantidade: 1 },
    { tipo: 'coletou', item: 'balde_agua', quantidade: 1 },
    { tipo: 'chegou', lugar: 'PARQUE' },
    { tipo: 'toque' },
  ],
  // três erros: revela, agenda e continua sozinho
  tresErros: [
    { tipo: 'toque' },
    { tipo: 'respondeu', opcao: 'areia' },
    { tipo: 'respondeu', opcao: 'papel' },
    { tipo: 'pedir_ajuda' },
    { tipo: 'respondeu', opcao: 'areia' },
    { tipo: 'respondeu', opcao: 'agua' },
    { tipo: 'continuar' },
    { tipo: 'chegou', lugar: 'PORTO' },
  ],
};
