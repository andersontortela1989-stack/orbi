import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DESTINOS_GPS } from '../missions/destinos.js';

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
  // narrativa "A Chegada" (adendo de narrativa)
  nome: '',           // nome da criança (capturado na intro; primeiro ato de letramento)
  introVista: false,  // a intro já foi vista/pulada? (não auto-toca de novo)

  // veículo
  veiculo: 'carro',
  desbloqueados: ['carro'],

  // economia (mecânica = matemática)
  moedas: 0,
  combustivel: 100, // 0–100; chega a 0 → desacelera suave, sem game over

  // proximidade do posto (transiente — setado pelos sensores, NÃO persistido)
  postoPerto: false,

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
    (set, get) => ({
      ...ESTADO_INICIAL,

      // === Narrativa "A Chegada" ===
      // Nome da criança — capturado na intro, persiste. `trim()` evita espaços
      // soltos; sem validação punitiva (aceita o que vier; dá pra corrigir depois).
      setNome: (nome) => set({ nome: String(nome ?? '').trim() }),

      // Marca a intro como vista (após concluir OU pular) — não auto-toca de novo.
      marcarIntroVista: () => set({ introVista: true }),

      abastecer: (litros) =>
        set((s) => ({
          combustivel: Math.max(0, Math.min(100, s.combustivel + litros)),
        })),

      // Consumo de combustível ao dirigir (Fatia 5). Nunca abaixo de 0.
      gastarCombustivel: (qtd) =>
        set((s) => ({
          combustivel: Math.max(0, s.combustivel - qtd),
        })),

      // Tanque cheio — chamado quando a criança conta a quantidade exata no posto.
      encherTanque: () => set({ combustivel: 100 }),

      // Proximidade do posto — ligado/desligado pelos sensores de zona.
      setPostoPerto: (perto) => set({ postoPerto: !!perto }),

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

      // === Missão de GPS (Fatia 4) ===
      // Sorteia um novo destino entre DESTINOS_GPS, evitando o destino atual
      // pra não repetir consecutivamente. Marca concluida=false.
      iniciarMissaoGPS: () =>
        set((s) => {
          const atual = s.missao?.destino;
          const candidatos = DESTINOS_GPS.filter((d) => d !== atual);
          const novo =
            candidatos[Math.floor(Math.random() * candidatos.length)] ??
            DESTINOS_GPS[0];
          return { missao: { tipo: 'gps', destino: novo, concluida: false } };
        }),

      // Disparado pelo sensor de chegada do prédio. Se bate com o destino
      // da missão ativa, completa + registra leituraGlobal. Se não bate ou
      // já está concluída, retorna false (silêncio — sem punição).
      processarChegada: (slug) => {
        const m = get().missao;
        if (!m || m.tipo !== 'gps' || m.concluida) return false;
        if (m.destino !== slug) return false;
        get().completarMissao();
        get().registrarHabilidade('leituraGlobal', true);
        return true;
      },

      resetar: () => set(ESTADO_INICIAL),
    }),
    {
      name: 'cidade-turbo-3d',
      version: 1,
      // persist serializa só state (funções são ignoradas automaticamente).
      // partialize: só o progresso DURÁVEL é gravado — postoPerto é transiente
      // (depende de onde o carro está agora) e não deve sobreviver a reload.
      partialize: (s) => ({
        nome: s.nome,
        introVista: s.introVista,
        veiculo: s.veiculo,
        desbloqueados: s.desbloqueados,
        moedas: s.moedas,
        combustivel: s.combustivel,
        missao: s.missao,
        habilidades: s.habilidades,
      }),
    }
  )
);

// Expõe no objeto window em dev — facilita teste manual pelo console do navegador.
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  window.useGame = useGame;
}
