/**
 * Motor puro de aventuras do Órbi.
 *
 * Recebe eventos e devolve efeitos declarativos. Não conhece React, Zustand,
 * Three.js, áudio nem timers reais; por isso todo o fluxo roda em node:test.
 */
import { porExtenso } from '../missions/por-extenso.js';

const TENTATIVAS_ATE_REVELAR = 3;

/**
 * Limite de segurança da espera pelo fim da fala da revelação: se a voz não
 * avisar o fim (síntese travada, aba em segundo plano), a aventura segue
 * mesmo assim.
 */
export const LIMITE_ESPERA_FALA_MS = 10000;

/** Tempo mínimo com a resposta revelada à vista, com ou sem voz. */
export const TEMPO_DE_LEITURA_MS = 4200;

/**
 * Inteiro >= 1, defensivo como o resto do motor (ver o `Math.max(0, Number(…))`
 * de `coletar` e de `tick`). Uma definição malformada rende uma etapa pobre,
 * nunca um crash no meio da brincadeira.
 */
function inteiroPositivo(valor) {
  const n = Math.trunc(Number(valor));
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/** Soma dos slots já preenchidos — o "atual" do contador de `distribuir`. */
function somar(lista) {
  return lista.reduce((acumulado, n) => acumulado + n, 0);
}

function copiarEstado(st) {
  return { ...st };
}

function validarDefinicao(def) {
  if (!def?.id || !Array.isArray(def.etapas) || def.etapas.length === 0) {
    throw new TypeError('Aventura inválida: id e etapas são obrigatórios');
  }
  const ids = new Set();
  for (const etapa of def.etapas) {
    if (!etapa?.id || !etapa?.tipo) throw new TypeError('Etapa inválida');
    if (ids.has(etapa.id)) throw new TypeError(`Etapa duplicada: ${etapa.id}`);
    ids.add(etapa.id);
  }
}

// Etapa com objetivo (ir_para, coletar, entregar, distribuir) acontece com o
// mundo à vista e a missão no topo: ela pede de volta o foco de `em_missao`
// antes de falar. Sem isso, se a missão tiver saído da pilha (F1: o registro
// do MissionController a libera na primeira jogada), o foco cai em
// `explorando` e o objetivo some calado. Já no topo, o pedido não faz nada.
const PEDIR_MISSAO = Object.freeze({ tipo: 'foco', acao: 'pedir', atividade: 'em_missao' });

export function criarAventura(def) {
  validarDefinicao(def);

  const inicial = () => ({
    aventura: def.id,
    indice: 0,
    tentativasEtapa: 0,
    tentativasTotal: 0,
    ajudas: 0,
    coletado: 0,
    // Progresso por slot da etapa `distribuir`. Vazio fora dela; `entrar()`
    // o dimensiona quando a etapa começa. Sempre SUBSTITUÍDO, nunca mutado:
    // `estado()` devolve cópia rasa, então mutar vazaria pro snapshot anterior.
    distribuido: [],
    esperandoDestaque: 0,
    aguardandoContinuacao: false,
    concluida: false,
    segundos: 0,
    v: 1,
  });

  let st = inicial();
  const etapa = () => def.etapas[st.indice] ?? null;

  const finalizar = () => {
    st.concluida = true;
    return [
      { tipo: 'foco', acao: 'liberar', atividade: 'em_missao' },
      {
        tipo: 'fim',
        aventura: def.id,
        tentativas: st.tentativasTotal,
        ajudas: st.ajudas,
        segundos: st.segundos,
      },
    ];
  };

  const entrar = () => {
    const atual = etapa();
    if (!atual) return finalizar();

    st.tentativasEtapa = 0;
    st.coletado = 0;
    st.distribuido = [];
    st.esperandoDestaque = 0;
    st.aguardandoContinuacao = false;

    const efeitos = [
      {
        tipo: 'telemetria',
        evento: 'etapa_iniciada',
        dados: { aventura: def.id, etapa: atual.id },
      },
    ];

    switch (atual.tipo) {
      case 'fala': {
        // H1: `botaoSecundario` transforma a fala num CONVITE que pode ser
        // recusado (AGORA NÃO). Só entra no efeito quando existe — a fala do
        // parque segue idêntica, campo a campo.
        const mensagem = { tipo: 'mensagem', texto: atual.texto, botao: atual.botao ?? 'VAMOS!' };
        if (atual.botaoSecundario) mensagem.botaoSecundario = atual.botaoSecundario;
        efeitos.push(
          { tipo: 'foco', acao: 'pedir', atividade: 'historia' },
          mensagem,
          { tipo: 'falar', texto: atual.texto }
        );
        if (atual.espera !== 'toque') efeitos.push(...avancar());
        break;
      }

      case 'ir_para':
        efeitos.push(
          PEDIR_MISSAO,
          { tipo: 'objetivo', texto: atual.texto, alvo: atual.lugar },
          { tipo: 'falar', texto: atual.texto }
        );
        break;

      case 'pergunta':
        efeitos.push(
          { tipo: 'foco', acao: 'pedir', atividade: 'pergunta' },
          { tipo: 'abrir_pergunta', texto: atual.texto, opcoes: atual.opcoes },
          { tipo: 'falar', texto: atual.texto }
        );
        break;

      case 'coletar':
        efeitos.push(
          PEDIR_MISSAO,
          {
            tipo: 'objetivo',
            texto: atual.texto,
            contador: { atual: 0, total: atual.quantidade },
          },
          { tipo: 'falar', texto: atual.texto }
        );
        break;

      // DISTRIBUIR — `coletar` generalizado de UM número para N posições.
      //
      // `coletar` conta: "pegue quatro baldes". `distribuir` REPARTE: "ponha
      // seis sementes igualmente em três canteiros". A diferença não é de
      // implementação — repartir É o conteúdo (a divisão sendo ensinada), e
      // um contador escalar não sabe representá-la.
      //
      // O contador emitido mantém `atual`/`total` no formato que o HUD já lê,
      // e acrescenta `slots`/`porSlot` para quem quiser desenhar canteiro a
      // canteiro. Assim o host existente não muda nada.
      case 'distribuir': {
        const slots = inteiroPositivo(atual.slots);
        const porSlot = inteiroPositivo(atual.porSlot);
        st.distribuido = Array(slots).fill(0);
        efeitos.push(
          PEDIR_MISSAO,
          {
            tipo: 'objetivo',
            texto: atual.texto,
            contador: {
              atual: 0,
              total: slots * porSlot,
              slots: [...st.distribuido],
              porSlot,
              item: atual.item,
            },
          },
          { tipo: 'falar', texto: atual.texto }
        );
        break;
      }

      case 'entregar':
        efeitos.push(
          PEDIR_MISSAO,
          { tipo: 'objetivo', texto: atual.texto, alvo: atual.lugar },
          { tipo: 'falar', texto: atual.texto }
        );
        break;

      case 'mundo':
        efeitos.push({ tipo: 'mundo', flag: atual.flag });
        efeitos.push(...avancar());
        break;

      case 'recompensa':
        for (const item of atual.itens ?? []) {
          efeitos.push({ tipo: 'recompensa', item });
        }
        for (const descoberta of atual.descobertas ?? []) {
          efeitos.push({ tipo: 'descoberta', item: descoberta });
        }
        efeitos.push(...avancar());
        break;

      case 'resumo':
        efeitos.push(
          { tipo: 'foco', acao: 'pedir', atividade: 'resumo' },
          {
            tipo: 'resumo',
            titulo: def.titulo,
            aprendizados: atual.aprendizados,
            recompensas: atual.recompensas ?? [],
          },
          { tipo: 'falar', texto: atual.fala ?? 'Olha quanta coisa a gente descobriu!' }
        );
        break;

      default:
        throw new TypeError(`Tipo de etapa desconhecido: ${atual.tipo}`);
    }

    return efeitos;
  };

  const avancar = () => {
    st.indice += 1;
    return entrar();
  };

  const responder = (atual, opcao) => {
    if (st.aguardandoContinuacao) return [];
    const escolha = atual.opcoes.find((item) => item.id === opcao);
    if (escolha?.correta) {
      return [
        {
          tipo: 'telemetria',
          evento: 'acerto',
          dados: { etapa: atual.id, tentativas: st.tentativasEtapa },
        },
        { tipo: 'fechar_painel' },
        { tipo: 'foco', acao: 'liberar', atividade: 'pergunta' },
        ...avancar(),
      ];
    }

    st.tentativasEtapa += 1;
    st.tentativasTotal += 1;
    const efeitos = [
      {
        tipo: 'telemetria',
        evento: 'tentativa',
        dados: { etapa: atual.id, n: st.tentativasEtapa },
      },
    ];

    if (st.tentativasEtapa < TENTATIVAS_ATE_REVELAR) {
      efeitos.push({ tipo: 'falar', texto: atual.reforco });
      return efeitos;
    }

    // A terceira tentativa revela com calma e avança sozinha. O host aplica
    // o timer declarado; o motor continua puro e testável.
    st.aguardandoContinuacao = true;
    const correta = atual.opcoes.find((item) => item.correta)?.id ?? null;
    if (atual.revelacao) {
      // Com `revelacao`, a pista (💡) e a resposta são textos diferentes, e a
      // próxima etapa só fala depois de a revelação terminar: pelo menos
      // 4,2 s (a carta certa à vista), no máximo o limite de segurança. A
      // revelação interrompe a fila da voz: um reforço ainda tocando não a
      // atrasa (conferência de 19/11: atrasada, ela era cortada pelo limite).
      efeitos.push(
        { tipo: 'revelar_resposta', opcao: correta },
        { tipo: 'falar', texto: atual.revelacao, aguardarFim: true, interromper: true },
        {
          tipo: 'agendar',
          depoisMs: TEMPO_DE_LEITURA_MS,
          aposFala: true,
          limiteMs: LIMITE_ESPERA_FALA_MS,
          evento: { tipo: 'continuar' },
        }
      );
      return efeitos;
    }
    // Sem `revelacao` (a pergunta do parque): exatamente como sempre foi.
    efeitos.push(
      { tipo: 'revelar_resposta', opcao: correta },
      { tipo: 'falar', texto: atual.dica },
      { tipo: 'agendar', depoisMs: 4200, evento: { tipo: 'continuar' } }
    );
    return efeitos;
  };

  const enviar = (evento) => {
    const atual = etapa();
    if (!atual || st.concluida) return [];

    if (evento.tipo === 'tick') {
      const segundos = Math.max(0, Number(evento.segundos) || 0);
      st.segundos += segundos;
      if (atual.tipo === 'ir_para' && atual.destacarApos) {
        const antes = st.esperandoDestaque;
        st.esperandoDestaque += segundos;
        if (antes < atual.destacarApos && st.esperandoDestaque >= atual.destacarApos) {
          return [{ tipo: 'destacar', lugar: atual.lugar, ligado: true }];
        }
      }
      return [];
    }

    if (evento.tipo === 'pedir_ajuda') {
      st.ajudas += 1;
      const dica = 'dica' in atual ? atual.dica : null;
      const alvo =
        atual.tipo === 'ir_para' || atual.tipo === 'entregar' ? atual.lugar : null;
      return [
        { tipo: 'telemetria', evento: 'ajuda_pedida', dados: { etapa: atual.id } },
        ...(dica ? [{ tipo: 'falar', texto: dica }] : []),
        ...(alvo ? [{ tipo: 'destacar', lugar: alvo, ligado: true }] : []),
      ];
    }

    if (evento.tipo === 'continuar' && st.aguardandoContinuacao) {
      st.aguardandoContinuacao = false;
      return [
        { tipo: 'fechar_painel' },
        { tipo: 'foco', acao: 'liberar', atividade: 'pergunta' },
        ...avancar(),
      ];
    }

    switch (atual.tipo) {
      case 'fala':
        // Convite recusado (H1): fecha sem recompensa, sem resumo e sem
        // contar erro — a aventura simplesmente não acontece agora.
        if (evento.tipo === 'recusar' && atual.botaoSecundario) {
          return [
            {
              tipo: 'telemetria',
              evento: 'convite_recusado',
              dados: { aventura: def.id, etapa: atual.id },
            },
            { tipo: 'fechar_painel' },
            { tipo: 'foco', acao: 'liberar', atividade: 'historia' },
            ...finalizar(),
          ];
        }
        if (evento.tipo !== 'toque') return [];
        return [
          { tipo: 'fechar_painel' },
          { tipo: 'foco', acao: 'liberar', atividade: 'historia' },
          ...avancar(),
        ];

      case 'pergunta':
        return evento.tipo === 'respondeu' ? responder(atual, evento.opcao) : [];

      case 'ir_para':
        if (evento.tipo !== 'chegou' || evento.lugar !== atual.lugar) return [];
        return [{ tipo: 'destacar', lugar: atual.lugar, ligado: false }, ...avancar()];

      case 'coletar':
        if (evento.tipo !== 'coletou' || evento.item !== atual.item) return [];
        st.coletado = Math.min(
          atual.quantidade,
          st.coletado + Math.max(0, Number(evento.quantidade) || 0)
        );
        return [
          {
            tipo: 'objetivo',
            texto: atual.texto,
            contador: { atual: st.coletado, total: atual.quantidade },
          },
          // Por extenso, como no repartir: a voz recebe "dois", não "2".
          { tipo: 'falar', texto: porExtenso(st.coletado) },
          ...(st.coletado >= atual.quantidade ? avancar() : []),
        ];

      // Ver a nota em `entrar()`. Esta etapa NÃO TEM caminho de erro, por
      // construção: não existe resposta errada a dar, só toques que não mudam
      // nada. Por isso ela não passa por `responder()` — aquela lógica é
      // acoplada a `opcoes`/`correta` e serve só à `pergunta`.
      //
      // Slot já cheio devolve [] — no-op SILENCIOSO, e não o `Math.min` com
      // refala que `coletar` faz. Repetir "2, 2, 2" a cada toque num canteiro
      // completo é repetição sem informação; a régua da casa é feedback
      // assimétrico — o avanço fala, o resto não castiga nem repete.
      case 'distribuir': {
        if (evento.tipo !== 'distribuiu' || evento.item !== atual.item) return [];
        const slots = st.distribuido.length;
        const porSlot = inteiroPositivo(atual.porSlot);
        const slot = Number(evento.slot);
        if (!Number.isInteger(slot) || slot < 0 || slot >= slots) return [];
        if (st.distribuido[slot] >= porSlot) return [];

        st.distribuido = st.distribuido.map((n, i) => (i === slot ? n + 1 : n));
        const encheu = st.distribuido[slot] >= porSlot;
        const completo = st.distribuido.every((n) => n >= porSlot);
        return [
          {
            tipo: 'objetivo',
            texto: atual.texto,
            contador: {
              atual: somar(st.distribuido),
              total: slots * porSlot,
              slots: [...st.distribuido],
              porSlot,
              item: atual.item,
            },
          },
          // Fala o TOTAL repartido até agora, por extenso: "um, dois, três".
          // Antes falava a conta do canteiro tocado — com uma por canteiro,
          // "um, um, um" (relato de 20/11/2026, faixa 3–5). Que cada canteiro
          // recebe a mesma quantidade fica com `aoEncher`, dito só no toque
          // que enche o canteiro ("Este canteiro tem duas.").
          { tipo: 'falar', texto: porExtenso(somar(st.distribuido)) },
          ...(encheu && atual.aoEncher ? [{ tipo: 'falar', texto: atual.aoEncher }] : []),
          ...(completo ? avancar() : []),
        ];
      }

      case 'entregar':
        if (evento.tipo !== 'chegou' || evento.lugar !== atual.lugar) return [];
        return [{ tipo: 'destacar', lugar: atual.lugar, ligado: false }, ...avancar()];

      case 'resumo':
        if (evento.tipo !== 'toque') return [];
        return [
          { tipo: 'fechar_painel' },
          { tipo: 'foco', acao: 'liberar', atividade: 'resumo' },
          ...avancar(),
        ];

      default:
        return [];
    }
  };

  return Object.freeze({
    iniciar() {
      st = inicial();
      return [
        { tipo: 'foco', acao: 'pedir', atividade: 'em_missao' },
        { tipo: 'telemetria', evento: 'aventura_iniciada', dados: { aventura: def.id } },
        ...entrar(),
      ];
    },
    enviar,
    etapa,
    estado: () => copiarEstado(st),
    snapshot: () => copiarEstado(st),
  });
}
