import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Estado global da Cidade Turbo 3D — shape espelhando a §6 do handoff.
 * Persistência em localStorage via zustand/middleware: progresso (moedas,
 * combustível, habilidades) sobrevive a reload, como deve ser no produto real.
 *
 * Como testar pelo console:
 *   useGame.getState().abastecer(-30)       // combustível: 100 → 70
 *   useGame.getState().pagarPedagio(-5)     // moedas: 0 → 5  (valor negativo "ganha")
 *   useGame.setState({ moedas: 42 })        // forma direta de mexer no estado
 *   useGame.getState().resetar()            // volta ao estado inicial
 */

const ESTADO_INICIAL = {
  // veículo
  veiculo: 'carro',
  desbloqueados: ['carro'],

  // economia (mecânica = matemática)
  moedas: 0,
  combustivel: 100, // 0–100; chega a 0 → desacelera suave, sem game over

  // missão (uma por vez)
  missao: { tipo: 'nenhuma', destino: null, concluida: false },

  // progresso pedagógico — base do relatório por habilidade da BNCC (futuro)
  habilidades: {
    leituraGlobal: { acertos: 0, tentativas: 0 },
    contagem:      { acertos: 0, tentativas: 0 },
    adicao:        { acertos: 0, tentativas: 0 },
    navegacao:     { acertos: 0, tentativas: 0 },
  },
};

export const useGame = create(
  persist(
    (set, _get) => ({
      ...ESTADO_INICIAL,

      abastecer: (litros) =>
        set((s) => ({
          combustivel: Math.max(0, Math.min(100, s.combustivel + litros)),
        })),

      pagarPedagio: (valor) =>
        set((s) => ({
          moedas: Math.max(0, s.moedas - valor),
        })),

      completarMissao: () =>
        set((s) => ({
          missao: { ...s.missao, concluida: true },
        })),

      trocarVeiculo: (id) =>
        set((s) => {
          if (!s.desbloqueados.includes(id)) return {};
          return { veiculo: id };
        }),

      registrarHabilidade: (chave, acertou) =>
        set((s) => {
          const h = s.habilidades[chave];
          if (!h) return {};
          return {
            habilidades: {
              ...s.habilidades,
              [chave]: {
                acertos: h.acertos + (acertou ? 1 : 0),
                tentativas: h.tentativas + 1,
              },
            },
          };
        }),

      resetar: () => set(ESTADO_INICIAL),
    }),
    {
      name: 'cidade-turbo-3d',
      version: 1,
      // persist serializa só state (funções são ignoradas automaticamente)
    }
  )
);

// Expõe no objeto window em dev — facilita teste manual pelo console do navegador.
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  window.useGame = useGame;
}
