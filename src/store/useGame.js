import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DESTINOS_GPS } from '../missions/destinos.js';
import { sortearAnimal } from '../missions/missoes-ciencias.js';
import { sortearChegadaViva } from '../missions/missoes.js';

/**
 * Estado global da Cidade Turbo 3D — shape espelhando a §6 do handoff.
 * Persistência em localStorage via zustand/middleware: progresso (moedas,
 * combustível, habilidades) sobrevive a reload, como deve ser no produto real.
 *
 * Como testar pelo console:
 *   useGame.getState().abastecer(-30)       // combustível: 100 → 70
 *   useGame.getState().ganharMoeda(5)       // moedas: +5 (a coleta da rua usa qtd=1)
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

  // chegada viva — pergunta aberta na chegada de um lugar "vivo"
  // (transiente como postoPerto: NÃO persistido; reload = sem pergunta presa)
  chegadaViva: null,

  // Caderninho do Órbi aberto? (transiente — NÃO persistido)
  caderninhoAberto: false,

  // Descobertas item-a-item — a matéria-prima do Caderninho do Órbi (e a
  // futura interface infantil do relatório BNCC da Fatia 13, que lerá
  // `habilidades`; dois consumidores, zero acoplamento). Diferente de
  // `habilidades` (régua HONESTA de desempenho), aqui é a NARRATIVA: o que
  // o Órbi já conheceu graças à criança — acerto E revelação registram
  // (quem errou 2x ainda ganha o adesivo; zero rastro de falha). Arrays em
  // ordem de descoberta (a ordem conta a história), sem duplicata.
  // Categoria nova aqui exige bump da version (migrate injeta — ver abaixo).
  descobertas: {
    lugares:   [],
    animais:   [],
    frutas:    [],
    contagens: [],
  },

  // missão (uma por vez)
  missao: { tipo: 'nenhuma', destino: null, concluida: false },

  // progresso pedagógico — base do relatório por habilidade da BNCC (futuro)
  // ATENÇÃO: chave NOVA aqui exige bump da `version` do persist lá embaixo —
  // o migrate injeta a chave em saves antigos; sem isso, registrarHabilidade
  // dela é no-op silencioso em qualquer localStorage existente.
  habilidades: {
    leituraGlobal: { acertos: 0, tentativas: 0 },
    contagem:      { acertos: 0, tentativas: 0 },
    adicao:        { acertos: 0, tentativas: 0 },
    navegacao:     { acertos: 0, tentativas: 0 },
    cienciasVida:  { acertos: 0, tentativas: 0 }, // Fatia 8 (VET) + chegada viva do ZOO
    cores:         { acertos: 0, tentativas: 0 }, // chegada viva do MERCADO (artes)
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

      // === Chegada viva ===
      // Abre a mini-interação do lugar (se ele tiver uma): a pergunta sai
      // PRONTA do registry (animal + opções embaralhadas + frases de voz).
      abrirChegadaViva: (lugar) => {
        const pergunta = sortearChegadaViva(lugar);
        if (pergunta) set({ chegadaViva: pergunta });
      },
      fecharChegadaViva: () => set({ chegadaViva: null }),

      // === Caderninho do Órbi ===
      abrirCaderninho: () => set({ caderninhoAberto: true }),
      fecharCaderninho: () => set({ caderninhoAberto: false }),

      // Registra um item descoberto. IDEMPOTENTE: já registrado = no-op —
      // naturalmente StrictMode-safe, e a ordem de descoberta fica honesta.
      registrarDescoberta: (categoria, id) =>
        set((s) => {
          const lista = s.descobertas?.[categoria];
          if (!lista || lista.includes(id)) return {};
          return {
            descobertas: { ...s.descobertas, [categoria]: [...lista, id] },
          };
        }),

      // === Moedas na rua (frente extra "Moedas") ===
      // Ganho das moedas coletáveis do asfalto (Moedas.jsx). Clamp em
      // qtd ≥ 0: ganhar nunca tira — perder só existe via pagarPedagio.
      // `moedas` já persiste (partialize): é o fundo da futura garagem.
      ganharMoeda: (qtd = 1) =>
        set((s) => ({ moedas: s.moedas + Math.max(0, qtd) })),

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
        // Caderninho: todo lugar alcançado vira adesivo; na missão de
        // Ciências, o bichinho levado ao VET também foi conhecido.
        get().registrarDescoberta('lugares', slug);
        if (m.tipo === 'ciencias') {
          get().registrarDescoberta('animais', m.animal);
        }
        return true;
      },

      resetar: () => set(ESTADO_INICIAL),
    }),
    {
      name: 'cidade-turbo-3d',
      // v2 (Fatia 8): + habilidade `cienciasVida`. v3 (chegadas vivas no
      // MERCADO/PADARIA): + habilidade `cores`. v4 (Caderninho do Órbi):
      // + `descobertas`. O migrate é OBRIGATÓRIO a cada chave nova: o merge
      // do persist é RASO, então o objeto já gravado no localStorage (sem a
      // chave nova) substituiria o ESTADO_INICIAL novo — e o registro da
      // chave nova viraria no-op silencioso em qualquer save antigo. O
      // migrate abaixo é GENÉRICO (injeta toda chave que faltar, preservando
      // o acumulado) e serve v1→4, v2→4 e v3→4 — chave nova só precisa do
      // bump da version. Em `descobertas` NÃO há backfill retroativo: o dado
      // item-a-item nunca existiu; o caderninho começa vazio e a narrativa
      // cobre ("ainda não anotei nada").
      version: 4,
      migrate: (persisted) => {
        if (!persisted) return persisted;
        return {
          ...persisted,
          habilidades: {
            ...ESTADO_INICIAL.habilidades,
            ...(persisted.habilidades ?? {}),
          },
          descobertas: {
            ...ESTADO_INICIAL.descobertas,
            ...(persisted.descobertas ?? {}),
          },
        };
      },
      // persist serializa só state (funções são ignoradas automaticamente).
      // partialize: só o progresso DURÁVEL é gravado — postoPerto,
      // chegadaViva e caderninhoAberto são transientes (dependem do agora)
      // e não sobrevivem a reload.
      partialize: (s) => ({
        nome: s.nome,
        introVista: s.introVista,
        veiculo: s.veiculo,
        desbloqueados: s.desbloqueados,
        moedas: s.moedas,
        combustivel: s.combustivel,
        missao: s.missao,
        habilidades: s.habilidades,
        descobertas: s.descobertas,
      }),
    }
  )
);

// Expõe no objeto window em dev — facilita teste manual pelo console do navegador.
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  window.useGame = useGame;
}
