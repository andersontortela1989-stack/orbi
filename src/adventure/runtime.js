import { coordenadorAtividade } from '../activity/index.js';
import { somSucesso } from '../audio/sons.js';
import { useGame } from '../store/useGame.js';
import { criarAventura } from './adventure-engine.js';
import { PARQUE_COM_SEDE } from './parque-com-sede.js';

const ouvintes = new Set();
const DONOS_DE_VOZ = new Set(['em_missao', 'historia', 'pergunta', 'resumo']);
let corredor = null;
let timerAgendado = null;
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
        if (DONOS_DE_VOZ.has(dono)) {
          coordenadorAtividade.falar(dono, efeito.texto);
        }
        break;
      }

      case 'mensagem':
        ui = {
          ...ui,
          painel: { tipo: 'mensagem', texto: efeito.texto, botao: efeito.botao },
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
        clearTimeout(timerAgendado);
        timerAgendado = setTimeout(
          () => enviarEventoAventura(efeito.evento),
          efeito.depoisMs
        );
        break;

      case 'telemetria':
        registrarEvento(efeito);
        break;

      case 'fim':
        clearTimeout(timerAgendado);
        timerAgendado = null;
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

  if (['chegou', 'coletou', 'entregou', 'tick'].includes(evento.tipo)) {
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
  if (evento.tipo === 'pedir_ajuda') {
    return atividade.foco === 'em_missao' || atividade.foco === 'pergunta';
  }
  return false;
}

export function iniciarParqueComSede() {
  if (ui.ativa || useGame.getState().worldFlags?.parque_florido) return false;
  if (!['explorando', 'em_missao'].includes(coordenadorAtividade.estado().foco)) {
    return false;
  }
  corredor = criarAventura(PARQUE_COM_SEDE);
  ui = {
    ativa: true,
    id: PARQUE_COM_SEDE.id,
    titulo: PARQUE_COM_SEDE.titulo,
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
