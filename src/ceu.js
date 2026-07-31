import { useSyncExternalStore } from 'react';

/**
 * CÉU — presets de hora do dia que a CRIANÇA comanda (dia/entardecer/noite).
 *
 * EXCEÇÃO consciente à régua "nada muda sozinho": o céu só muda NO TOQUE do
 * botão, troca INSTANTÂNEA (sem transição animada) — previsível, sob comando.
 *
 * Persistência em localStorage 'orbi-ceu', FORA do zustand/persist (mesmo
 * padrão do antigo 'orbi-som') — o schema do save fica intocado. Estado
 * compartilhado entre App (fundo/fog), <Ceu> (luzes) e HUD (botão) via um
 * mini-store com useSyncExternalStore, sem trazer zustand pra cá.
 *
 * LEGIBILIDADE É RÉGUA: a noite é azul PROFUNDO mas nunca escura a ponto de
 * esconder prédios/placas. As placas de letreiro são meshBasic (ignoram luz),
 * então já ficam legíveis; o ambient da noite (0.6) mantém os CORPOS dos
 * prédios visíveis, e o fundo noturno é bem mais claro que o navy do contorno
 * (senão o contorno dos prédios sumiria no céu).
 */
export const CEUS = {
  dia: {
    ambient: 1.0,
    directional: 0.9,
    hemisphere: 0.7,
    fundo: '#9DDDF5',
    fundoTranquilo: '#C5E5F0',
    neblina: '#BEE8F7',
    ceuLuz: '#D9F5FF',
    soloLuz: '#8876B3',
    direcionalCor: '#FFF3D4',
    rotulo: '☀️',
    voz: 'olha, é dia de novo!',
  },
  entardecer: {
    ambient: 0.88,
    directional: 0.95,
    hemisphere: 0.62,
    fundo: '#8D70DA',
    fundoTranquilo: '#AAA0CF',
    neblina: '#C98FCF',
    ceuLuz: '#BBA9FF',
    soloLuz: '#5C4B8F',
    direcionalCor: '#FFD79B',
    rotulo: '🌆',
    voz: 'olha, o entardecer!',
  },
  noite: {
    ambient: 0.72,
    directional: 0.62,
    hemisphere: 0.52,
    fundo: '#30366F',
    fundoTranquilo: '#535B82',
    neblina: '#4B4380',
    ceuLuz: '#8178DC',
    soloLuz: '#252B55',
    direcionalCor: '#CDBEFF',
    rotulo: '🌙',
    voz: 'olha, anoiteceu!',
  },
};

const ORDEM = ['dia', 'entardecer', 'noite'];
const CHAVE = 'orbi-ceu';

function ler() {
  if (typeof localStorage === 'undefined') return 'dia';
  const v = localStorage.getItem(CHAVE);
  return CEUS[v] ? v : 'dia';
}

let atual = ler();
const ouvintes = new Set();

/** Avança dia → entardecer → noite → dia; grava e notifica. Devolve o novo id. */
export function ciclarCeu() {
  const i = ORDEM.indexOf(atual);
  atual = ORDEM[(i + 1) % ORDEM.length];
  try {
    localStorage.setItem(CHAVE, atual);
  } catch (_) {
    /* localStorage indisponível: segue em memória, sem quebrar */
  }
  ouvintes.forEach((l) => l());
  return atual;
}

function inscrever(l) {
  ouvintes.add(l);
  return () => ouvintes.delete(l);
}
function snapshot() {
  return atual;
}

/** id do preset atual (reativo — App/Ceu/HUD re-renderizam na troca). */
export function useCeuId() {
  return useSyncExternalStore(inscrever, snapshot, snapshot);
}
