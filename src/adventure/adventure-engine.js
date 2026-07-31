/**
 * Motor puro de aventuras do Órbi.
 *
 * Recebe eventos e devolve efeitos declarativos. Não conhece React, Zustand,
 * Three.js, áudio nem timers reais; por isso todo o fluxo roda em node:test.
 */

const TENTATIVAS_ATE_REVELAR = 3;

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

export function criarAventura(def) {
  validarDefinicao(def);

  const inicial = () => ({
    aventura: def.id,
    indice: 0,
    tentativasEtapa: 0,
    tentativasTotal: 0,
    ajudas: 0,
    coletado: 0,
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
      case 'fala':
        efeitos.push(
          { tipo: 'foco', acao: 'pedir', atividade: 'historia' },
          { tipo: 'mensagem', texto: atual.texto, botao: atual.botao ?? 'VAMOS!' },
          { tipo: 'falar', texto: atual.texto }
        );
        if (atual.espera !== 'toque') efeitos.push(...avancar());
        break;

      case 'ir_para':
        efeitos.push(
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
          {
            tipo: 'objetivo',
            texto: atual.texto,
            contador: { atual: 0, total: atual.quantidade },
          },
          { tipo: 'falar', texto: atual.texto }
        );
        break;

      case 'entregar':
        efeitos.push(
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
          { tipo: 'falar', texto: String(st.coletado) },
          ...(st.coletado >= atual.quantidade ? avancar() : []),
        ];

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
