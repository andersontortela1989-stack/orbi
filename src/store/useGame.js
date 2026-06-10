import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DESTINOS_GPS } from '../missions/destinos.js';
import { sortearAnimal } from '../missions/missoes-ciencias.js';

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

// Chance da próxima missão ser de Ciências (animal → VET) em vez de GPS.
// ~1 em 3: variedade sem dominar — as missões de leitura seguem maioria.
const CHANCE_CIENCIAS = 1 / 3;

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
    cienciasVida:  { acertos: 0, tentativas: 0 }, // Fatia 8 — exige o migrate v2 abaixo
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

      // === Missão de Ciências (Fatia 8) ===
      // "Leve o animal ao VET": sorteia um bichinho (evitando o último) e
      // aponta pro VET. As frases vêm do banco de animais (via o registry
      // frasesDaMissao), não daqui.
      iniciarMissaoCiencias: () =>
        set((s) => {
          const ultimo = s.missao?.tipo === 'ciencias' ? s.missao.animal : null;
          return {
            missao: {
              tipo: 'ciencias',
              destino: 'VET',
              animal: sortearAnimal(ultimo),
              concluida: false,
            },
          };
        }),

      // Sorteio unificado da PRÓXIMA missão (GPS ou Ciências).
      // Depois de uma missão de Ciências a próxima é SEMPRE GPS: o destino
      // seria o mesmo VET onde o carro já está parado (o sensor só dispara
      // ao ENTRAR na zona) — mesma razão do filtro de destino repetido do GPS.
      proximaMissao: () => {
        const m = get().missao;
        if (m?.tipo !== 'ciencias' && Math.random() < CHANCE_CIENCIAS) {
          get().iniciarMissaoCiencias();
        } else {
          get().iniciarMissaoGPS();
        }
      },

      // Disparado pelo sensor de chegada de qualquer prédio. Se o slug bate
      // com o destino da missão ativa, completa + registra a habilidade do
      // TIPO da missão (gps → leituraGlobal; ciencias → cienciasVida). Se
      // não bate ou já está concluída, retorna false (silêncio — sem punição).
      // +1 por conclusão garantido: o guard de `concluida` impede contar duas
      // vezes, e a chamada vem de evento de física (não de effect/StrictMode).
      processarChegada: (slug) => {
        const m = get().missao;
        if (!m || m.concluida || m.destino !== slug) return false;
        const habilidade =
          m.tipo === 'gps'
            ? 'leituraGlobal'
            : m.tipo === 'ciencias'
              ? 'cienciasVida'
              : null;
        if (!habilidade) return false;
        get().completarMissao();
        get().registrarHabilidade(habilidade, true);
        return true;
      },

      resetar: () => set(ESTADO_INICIAL),
    }),
    {
      name: 'cidade-turbo-3d',
      // v2 (Fatia 8): nova habilidade `cienciasVida`. O migrate é OBRIGATÓRIO:
      // o merge do persist é RASO, então o `habilidades` já gravado no
      // localStorage (sem a chave nova) substituiria o ESTADO_INICIAL novo —
      // e registrarHabilidade('cienciasVida') viraria no-op silencioso em
      // qualquer save antigo. O migrate injeta as chaves que faltarem,
      // preservando os acertos/tentativas já acumulados.
      version: 2,
      migrate: (persisted) => {
        if (!persisted) return persisted;
        return {
          ...persisted,
          habilidades: {
            ...ESTADO_INICIAL.habilidades,
            ...(persisted.habilidades ?? {}),
          },
        };
      },
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
