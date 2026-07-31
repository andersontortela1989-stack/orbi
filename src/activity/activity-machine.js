/**
 * Órbi — coordenador puro de atividade.
 *
 * Uma única atividade detém o foco de voz/HUD/controles. Atividades anteriores
 * permanecem na pilha e são retomadas quando a atividade do topo termina.
 *
 * Este módulo não conhece React, Zustand, Three.js nem o navegador. Isso é
 * intencional: as regras de coordenação rodam diretamente no `node:test`.
 */

export const ATIVIDADES = Object.freeze([
  'explorando',
  'em_missao',
  'tutorial',
  'carona',
  'abastecendo',
  'garagem',
  'caderninho',
  'pergunta',
  'resumo',
  'pausado',
]);

export const ESPEC_ATIVIDADE = Object.freeze({
  explorando: Object.freeze({
    prioridade: 0,
    dirigir: true,
    voz: true,
    hud: 'missao',
    mundo: true,
    interrompivel: true,
  }),
  em_missao: Object.freeze({
    prioridade: 10,
    dirigir: true,
    voz: true,
    hud: 'missao',
    mundo: true,
    interrompivel: true,
  }),
  tutorial: Object.freeze({
    prioridade: 20,
    dirigir: true,
    voz: true,
    hud: 'tutorial',
    mundo: true,
    interrompivel: true,
  }),
  carona: Object.freeze({
    prioridade: 30,
    dirigir: true,
    voz: true,
    hud: 'carona',
    mundo: true,
    interrompivel: true,
  }),

  // POSTO e GARAGEM preservam o contrato atual: abrem por proximidade e
  // fecham quando o carro sai da zona. Bloquear direção aqui criaria softlock,
  // sobretudo no touch. Eles comandam HUD/voz, mas continuam dirigíveis.
  abastecendo: Object.freeze({
    prioridade: 50,
    dirigir: true,
    voz: true,
    hud: 'painel',
    mundo: true,
    interrompivel: false,
  }),
  garagem: Object.freeze({
    prioridade: 50,
    dirigir: true,
    voz: true,
    hud: 'painel',
    mundo: true,
    interrompivel: false,
  }),

  caderninho: Object.freeze({
    prioridade: 55,
    dirigir: false,
    voz: true,
    hud: 'painel',
    mundo: false,
    interrompivel: false,
  }),
  pergunta: Object.freeze({
    prioridade: 60,
    dirigir: false,
    voz: true,
    hud: 'painel',
    mundo: false,
    interrompivel: false,
  }),
  resumo: Object.freeze({
    prioridade: 70,
    dirigir: false,
    voz: true,
    hud: 'painel',
    mundo: false,
    interrompivel: false,
  }),
  pausado: Object.freeze({
    prioridade: 100,
    dirigir: false,
    voz: false,
    hud: 'nenhum',
    mundo: false,
    interrompivel: false,
  }),
});

const BASE = 'explorando';

function validarAtividade(atividade) {
  if (!ESPEC_ATIVIDADE[atividade]) {
    throw new TypeError(`Atividade desconhecida: ${String(atividade)}`);
  }
}

/**
 * @param {{
 *   voz?: { falar(texto: string, opts?: object): boolean | void, calar(): void },
 *   agora?: () => number,
 *   aoEvento?: (evento: object) => void,
 * }} opcoes
 */
export function criarCoordenadorAtividade(opcoes = {}) {
  const agora = opcoes.agora ?? (() => Date.now());
  const ouvintes = new Set();
  let pilha = [BASE];
  let snapshotAtual;

  const topo = () => pilha[pilha.length - 1];
  const emitir = (evento) => opcoes.aoEvento?.({ ...evento, em: agora() });

  const reconstruirSnapshot = () => {
    const foco = topo();
    const espec = ESPEC_ATIVIDADE[foco];
    snapshotAtual = Object.freeze({
      foco,
      pilha: Object.freeze([...pilha]),
      suspensas: Object.freeze(pilha.slice(1, -1)),
      dirigir: espec.dirigir,
      voz: espec.voz,
      hud: espec.hud,
      mundo: espec.mundo,
    });
  };

  const notificar = () => {
    reconstruirSnapshot();
    for (const ouvinte of ouvintes) ouvinte(snapshotAtual);
  };

  reconstruirSnapshot();

  const pedirFoco = (atividade) => {
    validarAtividade(atividade);
    const atual = topo();
    if (atual === atividade) return true;

    // Já está ativa, mas suspensa: não duplica a entrada na pilha e não afirma
    // que ganhou o foco. Ela será retomada quando quem está acima liberar.
    if (pilha.includes(atividade)) return false;

    const permitido =
      atividade === 'pausado' ||
      (ESPEC_ATIVIDADE[atual].interrompivel &&
        ESPEC_ATIVIDADE[atividade].prioridade >= ESPEC_ATIVIDADE[atual].prioridade);

    if (!permitido) {
      emitir({ tipo: 'foco_recusado', pedida: atividade, topo: atual });
      return false;
    }

    // Toda troca de proprietário corta a fala anterior, mesmo quando a nova
    // atividade também pode falar. Assim não sobra frase de missão sob painel.
    opcoes.voz?.calar();
    pilha.push(atividade);
    emitir({ tipo: 'suspensa', atividade: atual });
    emitir({ tipo: 'foco', de: atual, para: atividade });
    notificar();
    return true;
  };

  const liberar = (atividade) => {
    validarAtividade(atividade);
    if (atividade === BASE) return false;
    const indice = pilha.lastIndexOf(atividade);
    if (indice <= 0) return false;

    const eraTopo = indice === pilha.length - 1;
    pilha.splice(indice, 1);

    if (eraTopo) {
      const novo = topo();
      opcoes.voz?.calar();
      emitir({ tipo: 'retomada', atividade: novo });
      emitir({ tipo: 'foco', de: atividade, para: novo });
    }
    notificar();
    return true;
  };

  return Object.freeze({
    estado: () => snapshotAtual,
    pedirFoco,
    liberar,

    pausar() {
      return pedirFoco('pausado');
    },

    retomar() {
      return liberar('pausado');
    },

    reiniciar() {
      const anterior = topo();
      opcoes.voz?.calar();
      pilha = [BASE];
      emitir({ tipo: 'foco', de: anterior, para: BASE });
      notificar();
    },

    falar(dono, texto, opts) {
      validarAtividade(dono);
      const atual = topo();
      if (dono !== atual || !ESPEC_ATIVIDADE[atual].voz) {
        emitir({ tipo: 'voz_bloqueada', dono, topo: atual, texto: String(texto) });
        return false;
      }
      return opcoes.voz?.falar(String(texto), opts) ?? false;
    },

    temFoco: (atividade) => topo() === atividade,
    estaAtiva: (atividade) => pilha.includes(atividade),
    podeDirigir: () => ESPEC_ATIVIDADE[topo()].dirigir,
    slotHud: () => ESPEC_ATIVIDADE[topo()].hud,

    assinar(ouvinte) {
      ouvintes.add(ouvinte);
      return () => ouvintes.delete(ouvinte);
    },
  });
}
