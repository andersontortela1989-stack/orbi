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
    ambient: 0.9,
    directional: 0.65,
    fundo: '#DDF1FA', // == PALETA3D.ceu (dia validado, sem mudança)
    neblina: '#A7DCF0', // == PALETA3D.neblina
    rotulo: '☀️',
    voz: 'olha, é dia de novo!',
  },
  entardecer: {
    ambient: 0.78,
    directional: 0.6,
    fundo: '#F3C99E', // sol baixo, dourado quente
    neblina: '#E3A874',
    rotulo: '🌆',
    voz: 'olha, o entardecer!',
  },
  noite: {
    ambient: 0.6, // corpos dos prédios ainda visíveis; placas são meshBasic
    directional: 0.45,
    fundo: '#3E4E82', // azul profundo, mas bem mais claro que o navy #1C2746
    neblina: '#2E3C64',
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
