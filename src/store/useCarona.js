import { create } from 'zustand';

/**
 * Estado da CARONA (piloto: 1 passageiro) — store PRÓPRIO e independente do
 * useGame de propósito: a carona é gameplay + voz + moedas, e o schema do save
 * (useGame/persist) fica INTOCADO (ITEM 0 — dry-run v6 — pendente). Nada aqui
 * persiste: é transiente como postoPerto/chegadaViva; reload = cão de volta na
 * calçada, sem carona presa.
 *
 * Um flag só: `aBordo` (cachorro no carro?). Dois consumidores:
 *   - Carona.jsx (3D): decide render do cão na calçada vs passageiro no carro,
 *     e as zonas de embarque/entrega;
 *   - HUD.jsx: troca a pílula de missão por "🐶 PARQUE?" enquanto a bordo
 *     (uma instrução por vez — some com as missões normais no HUD).
 */
export const useCarona = create((set) => ({
  aBordo: false,
  embarcar: () => set({ aBordo: true }),
  desembarcar: () => set({ aBordo: false }),
}));
