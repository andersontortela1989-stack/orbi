import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SAVE_VERSION, CHAVE_SAVE, storageSeguro } from '../save.js';
import { DESTINOS_GPS } from '../missions/destinos.js';
import { sortearAnimal } from '../missions/missoes-ciencias.js';
import { sortearChegadaViva } from '../missions/missoes.js';
import { sortearBicho } from '../missions/busca.js';
import { COR_POR_ID } from '../city/garagem.js';

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

  // Garagem (frente "Garagem") — cor do carro como ESTADO. corCarro é ID
  // SEMÂNTICO do catálogo (city/garagem.js), não hex: o hex deriva na hora
  // de renderizar (rebrand-proof — a marca mudou, o save antigo acompanha).
  // coral vem de fábrica (a cor aprovada da Fatia B).
  corCarro: 'coral',
  coresCompradas: ['coral'],

  // proximidade do posto (transiente — setado pelos sensores, NÃO persistido)
  postoPerto: false,

  // proximidade da garagem + cor em experimentação no painel (transientes
  // como postoPerto: NÃO persistidos; corPreview NUNCA sobrevive fora da
  // garagem — limpo em todo caminho de saída)
  garagemPerto: false,
  corPreview: null,

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
    paises:    [], // Frente 6 (ESTÁDIO) — quiz de bandeiras
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
    geografia:     { acertos: 0, tentativas: 0 }, // Frente 6 — bandeiras do ESTÁDIO
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

      // === Garagem (frente "Garagem") ===
      // Sair da zona é caminho de SAÍDA do painel: zera o preview junto.
      setGaragemPerto: (perto) =>
        set(
          perto
            ? { garagemPerto: true }
            : { garagemPerto: false, corPreview: null }
        ),

      setCorPreview: (id) => set({ corPreview: id ?? null }),

      // Compra/troca ATÔMICA da cor (um set só, sem estado intermediário).
      // Regras: já comprada → veste grátis (mesma cor vestida = no-op
      // natural); moedas suficientes → debita + adiciona + veste;
      // insuficiente → no-op retornando false (a UI/voz reagem com calma,
      // nunca com erro — guard-rail TEA). pagarPedagio segue intocada:
      // ela é do pedágio (Fatia 5.1, reservada ao roadmap).
      comprarCor: (id) => {
        const cor = COR_POR_ID[id];
        if (!cor) return false;
        const s = get();
        if (s.coresCompradas.includes(id)) {
          set({ corCarro: id });
          return true;
        }
        if (s.moedas < cor.preco) return false;
        set({
          moedas: s.moedas - cor.preco,
          coresCompradas: [...s.coresCompradas, id],
          corCarro: id,
        });
        return true;
      },

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

      // === Missão de Busca (Frente 5) ===
      // "Eu vi um bicho perto da água! Me mostra onde?" — destino é o
      // SLUG DO BICHO (city/bichos.js): assim o controlador/registry/HUD
      // tratam a busca pelo mesmo fluxo keyed em `destino`.
      iniciarMissaoBusca: () =>
        set((s) => {
          const ultimo = s.missao?.tipo === 'busca' ? s.missao.destino : null;
          return {
            missao: {
              tipo: 'busca',
              destino: sortearBicho(ultimo),
              concluida: false,
            },
          };
        }),

      // Sorteio unificado da PRÓXIMA missão — pesos GPS 2 / Ciências 1 /
      // Busca 1 (50/25/25), com a regra "nunca duas TEMÁTICAS seguidas":
      // a temática que acabou de rodar (ciências ou busca) sai do sorteio;
      // GPS pode repetir, como sempre. A razão original de Ciências segue
      // valendo: depois dela o destino seria o mesmo VET onde o carro já
      // está parado (o sensor só dispara ao ENTRAR na zona).
      proximaMissao: () => {
        const anterior = get().missao?.tipo;
        const pesos = [
          ['gps', 2],
          ['ciencias', anterior === 'ciencias' ? 0 : 1],
          ['busca', anterior === 'busca' ? 0 : 1],
        ];
        const total = pesos.reduce((soma, [, p]) => soma + p, 0);
        let r = Math.random() * total;
        let tipo = 'gps';
        for (const [t, p] of pesos) {
          r -= p;
          if (r < 0) {
            tipo = t;
            break;
          }
        }
        if (tipo === 'ciencias') get().iniciarMissaoCiencias();
        else if (tipo === 'busca') get().iniciarMissaoBusca();
        else get().iniciarMissaoGPS();
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

      // Disparado pelo BuscaSensor quando o carro chega perto do bicho
      // procurado (Frente 5). Mesmo contrato do processarChegada: guard
      // de `concluida` torna idempotente (a chamada vem de useFrame),
      // bicho errado/missão de outro tipo = silêncio. Habilidade =
      // NAVEGAÇÃO (a pista é linguagem→espaço; cienciasVida fica com o
      // VET/quiz); o bicho achado vira adesivo do caderninho.
      processarBusca: (slug) => {
        const m = get().missao;
        if (!m || m.tipo !== 'busca' || m.concluida || m.destino !== slug) {
          return false;
        }
        get().completarMissao();
        get().registrarHabilidade('navegacao', true);
        get().registrarDescoberta('animais', slug);
        return true;
      },

      resetar: () => set(ESTADO_INICIAL),
    }),
    {
      name: CHAVE_SAVE,
      // Anti-reset-silencioso (P0-06): igual ao storage default, exceto que
      // save corrompido é preservado num backup ANTES de qualquer escrita e
      // o jogo abre jogável — nunca descarta progresso em silêncio (save.js).
      storage: storageSeguro,
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
      // v5 (garagem): + corCarro/coresCompradas. São chaves de TOPO — o
      // merge raso do persist já preencheria as ausentes a partir do
      // ESTADO_INICIAL (a regra "bump obrigatório" do aviso acima vale
      // para chaves ANINHADAS em habilidades/descobertas) — mas o bump
      // segue a regra da casa à risca e o migrate genérico cobre de graça.
      // v6 (ESTÁDIO, Frente 6): + habilidades.geografia e
      // descobertas.paises — chaves ANINHADAS, o caso que o bump existe
      // pra cobrir; o migrate genérico injeta as duas.
      // O NÚMERO mora em save.js (SAVE_VERSION): persist e teto do import
      // andam juntos por construção. O bump continua sendo feito lá.
      version: SAVE_VERSION,
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
      // chegadaViva, caderninhoAberto, garagemPerto e corPreview são
      // transientes (dependem do agora) e não sobrevivem a reload.
      partialize: (s) => ({
        nome: s.nome,
        introVista: s.introVista,
        veiculo: s.veiculo,
        desbloqueados: s.desbloqueados,
        moedas: s.moedas,
        combustivel: s.combustivel,
        corCarro: s.corCarro,
        coresCompradas: s.coresCompradas,
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
