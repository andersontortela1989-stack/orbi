import { coordenadorAtividade } from '../activity/index.js';
import { somSucesso } from '../audio/sons.js';
import { RECOMPENSA_HORTA, criarHortaEscola } from '../school/horta-aventura.js';
import { useGame } from '../store/useGame.js';
import { criarAventura } from './adventure-engine.js';
import { criarEsperaDaFala } from './espera-fala.js';
import { PARQUE_COM_SEDE } from './parque-com-sede.js';

const ouvintes = new Set();
const DONOS_DE_VOZ = new Set(['em_missao', 'historia', 'pergunta', 'resumo']);
let corredor = null;
let timerAgendado = null;
// Revelação com `aguardarFim` (padrão da Carona, ver espera-fala.js): a fala
// em curso — { motivo, espera } — e a espera que avança uma única vez.
let falaPendente = null;
let esperaAtual = null;

function cancelarEspera() {
  clearTimeout(timerAgendado);
  timerAgendado = null;
  esperaAtual?.cancelar();
  esperaAtual = null;
}
let ui = {
  ativa: false,
  id: null,
  titulo: null,
  objetivo: null,
  alvo: null,
  contador: null,
  destaque: null,
  painel: null,
  eventos: [],
};
let snapshotAtual;

function reconstruirSnapshot() {
  snapshotAtual = Object.freeze({
    ...ui,
    contador: ui.contador ? Object.freeze({ ...ui.contador }) : null,
    painel: ui.painel ? Object.freeze({ ...ui.painel }) : null,
    motor: corredor ? Object.freeze(corredor.estado()) : null,
    etapa: corredor?.etapa()?.id ?? null,
  });
}

function notificar() {
  reconstruirSnapshot();
  for (const ouvinte of ouvintes) ouvinte();
}

reconstruirSnapshot();

function registrarEvento(efeito) {
  const item = {
    evento: efeito.evento,
    dados: efeito.dados ?? null,
    em: Date.now(),
  };
  ui = { ...ui, eventos: [...ui.eventos.slice(-99), item] };
}

function aplicarEfeitos(efeitos) {
  for (const efeito of efeitos) {
    switch (efeito.tipo) {
      case 'foco':
        if (efeito.acao === 'pedir') coordenadorAtividade.pedirFoco(efeito.atividade);
        else coordenadorAtividade.liberar(efeito.atividade);
        break;

      case 'falar': {
        const dono = coordenadorAtividade.estado().foco;
        if (!efeito.aguardarFim) {
          if (DONOS_DE_VOZ.has(dono)) coordenadorAtividade.falar(dono, efeito.texto);
          break;
        }
        // Revelação: o navegador avisa o fim (`end`) ou o erro (`error`; a voz
        // liga os dois ao onEnd). Sem voz (desligada, indisponível, sem
        // foco), conta como terminada já: a espera segura o tempo de leitura.
        // Um aviso desta fala que chegue depois do avanço é ignorado.
        const fala = { motivo: null, espera: null };
        falaPendente = fala;
        const terminou = (motivo) => {
          if (falaPendente !== fala) return;
          if (fala.espera) fala.espera.falaTerminou(motivo);
          else fala.motivo ??= motivo;
        };
        const falou =
          DONOS_DE_VOZ.has(dono) &&
          coordenadorAtividade.falar(dono, efeito.texto, {
            interrupt: !!efeito.interromper,
            onEnd: (ev) => terminou(ev?.type === 'error' ? 'erro' : 'fim_da_fala'),
          });
        if (!falou) terminou('sem_voz');
        break;
      }

      case 'mensagem':
        ui = {
          ...ui,
          painel: {
            tipo: 'mensagem',
            texto: efeito.texto,
            botao: efeito.botao,
            ...(efeito.botaoSecundario ? { botaoSecundario: efeito.botaoSecundario } : {}),
          },
        };
        break;

      case 'objetivo':
        ui = {
          ...ui,
          objetivo: efeito.texto,
          alvo: efeito.alvo ?? null,
          contador: efeito.contador ?? null,
        };
        break;

      case 'destacar':
        ui = { ...ui, destaque: efeito.ligado ? efeito.lugar : null };
        break;

      case 'abrir_pergunta':
        ui = {
          ...ui,
          painel: {
            tipo: 'pergunta',
            texto: efeito.texto,
            opcoes: efeito.opcoes,
            respostaRevelada: null,
          },
        };
        break;

      case 'revelar_resposta':
        ui = {
          ...ui,
          painel: ui.painel
            ? { ...ui.painel, respostaRevelada: efeito.opcao }
            : ui.painel,
        };
        break;

      case 'fechar_painel':
        ui = { ...ui, painel: null };
        break;

      case 'mundo':
        useGame.getState().ativarWorldFlag(efeito.flag);
        somSucesso();
        break;

      case 'recompensa':
        useGame.getState().registrarRecompensa(efeito.item);
        break;

      case 'descoberta':
        useGame.getState().registrarDescoberta(
          efeito.item.categoria,
          efeito.item.id
        );
        break;

      case 'resumo':
        ui = {
          ...ui,
          objetivo: null,
          alvo: null,
          contador: null,
          destaque: null,
          painel: {
            tipo: 'resumo',
            titulo: efeito.titulo,
            aprendizados: efeito.aprendizados,
            recompensas: efeito.recompensas,
          },
        };
        break;

      case 'agendar':
        cancelarEspera();
        if (!efeito.aposFala) {
          timerAgendado = setTimeout(
            () => enviarEventoAventura(efeito.evento),
            efeito.depoisMs
          );
          break;
        }
        {
          // Espera o fim da fala anterior: no mínimo `depoisMs` (tempo de
          // leitura, a carta revelada à vista), no máximo `limiteMs` (limite
          // de segurança), avançando UMA vez — em vez de um atraso fixo que
          // cortaria a fala.
          const fala = falaPendente;
          const espera = criarEsperaDaFala({
            minimoMs: efeito.depoisMs,
            limiteMs: efeito.limiteMs ?? efeito.depoisMs,
            aoAvancar: (motivo) => {
              if (esperaAtual !== espera) return;
              esperaAtual = null;
              falaPendente = null;
              registrarEvento({ evento: 'revelacao_seguiu', dados: { motivo } });
              enviarEventoAventura(efeito.evento);
            },
          });
          esperaAtual = espera;
          if (!fala) espera.falaTerminou('sem_voz');
          else {
            fala.espera = espera;
            if (fala.motivo) espera.falaTerminou(fala.motivo);
          }
        }
        break;

      case 'telemetria':
        registrarEvento(efeito);
        break;

      case 'fim':
        cancelarEspera();
        falaPendente = null;
        ui = {
          ...ui,
          ativa: false,
          objetivo: null,
          alvo: null,
          contador: null,
          destaque: null,
          painel: null,
        };
        registrarEvento({
          tipo: 'telemetria',
          evento: 'aventura_concluida',
          dados: efeito,
        });
        break;
    }
  }
  notificar();
}

function eventoPermitido(evento) {
  if (!ui.ativa || !corredor) return false;
  const atividade = coordenadorAtividade.estado();

  // `distribuiu` entra aqui, e não num grupo próprio: a etapa `distribuir`
  // não pede foco em `entrar()` — como `coletar` e `ir_para`, ela acontece
  // com o mundo à vista e a missão no topo da pilha.
  if (['chegou', 'coletou', 'entregou', 'distribuiu', 'tick'].includes(evento.tipo)) {
    return atividade.foco === 'em_missao' && atividade.mundo;
  }
  if (evento.tipo === 'respondeu' || evento.tipo === 'continuar') {
    return atividade.foco === 'pergunta';
  }
  if (evento.tipo === 'toque') {
    if (ui.painel?.tipo === 'resumo') return atividade.foco === 'resumo';
    if (ui.painel?.tipo === 'mensagem') return atividade.foco === 'historia';
    return atividade.foco === 'em_missao';
  }
  if (evento.tipo === 'recusar') {
    return atividade.foco === 'historia' && ui.painel?.tipo === 'mensagem';
  }
  if (evento.tipo === 'pedir_ajuda') {
    return atividade.foco === 'em_missao' || atividade.foco === 'pergunta';
  }
  return false;
}

/**
 * Só há UM `corredor` por vez, e a aventura fala assim que começa: partir com
 * um painel aberto seria fala perdida sob ele. Daí as duas condições.
 */
function podeComecar() {
  return (
    !ui.ativa &&
    ['explorando', 'em_missao'].includes(coordenadorAtividade.estado().foco)
  );
}

/** Fronteira única de partida: monta o corredor e zera a UI da aventura. */
function comecar(def) {
  corredor = criarAventura(def);
  ui = {
    ativa: true,
    id: def.id,
    titulo: def.titulo,
    objetivo: null,
    alvo: null,
    contador: null,
    destaque: null,
    painel: null,
    eventos: [],
  };
  aplicarEfeitos(corredor.iniciar());
  return true;
}

export function iniciarParqueComSede() {
  if (!podeComecar()) return false;
  if (useGame.getState().worldFlags?.parque_florido) return false;
  return comecar(PARQUE_COM_SEDE);
}

/**
 * A Horta é a primeira aventura PARAMETRIZADA: a definição nasce da faixa
 * escolhida, não de um arquivo fixo. Faixa desconhecida não começa nada.
 *
 * REPETÍVEL, ao contrário do Parque. `horta_escola_viva` continua sendo gravada
 * e continua significando a mudança permanente no mundo — ela só não TRANCA
 * mais a porta. Plantar de novo, em qualquer faixa, é brincar de novo; o mundo
 * já mudou e segue mudado.
 *
 * O adesivo não precisa de guarda aqui: `registrarRecompensa` e
 * `registrarDescoberta` já ignoram repetido, então a recompensa é da primeira
 * conclusão e as repetições rendem só a fala e o resumo.
 */
export function iniciarHortaEscola(band, { random } = {}) {
  if (!podeComecar()) return false;
  // H3: com o broto já nas recompensas, é repetição — o resumo celebra a
  // ação e não anuncia o adesivo de novo. `random` fixa o sorteio das cartas
  // (testes e ponte de teste com ?medir=1); o jogo usa o padrão.
  const repetida = !!useGame.getState().recompensas?.includes(RECOMPENSA_HORTA);
  const def = criarHortaEscola(band, { repetida, ...(random ? { random } : {}) });
  return def ? comecar(def) : false;
}

export function enviarEventoAventura(evento) {
  if (!eventoPermitido(evento)) return false;
  const efeitos = corredor.enviar(evento);
  // Tick sem efeito ainda altera segundos no snapshot do motor.
  if (efeitos.length) aplicarEfeitos(efeitos);
  else notificar();
  return efeitos.length > 0;
}

export function aventuraAtiva() {
  return ui.ativa;
}

export const aventuraRuntime = Object.freeze({
  estado: () => snapshotAtual,
  assinar(ouvinte) {
    ouvintes.add(ouvinte);
    return () => ouvintes.delete(ouvinte);
  },
});
