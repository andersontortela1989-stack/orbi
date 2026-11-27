/**
 * PONTE DE TESTE — só com `?medir=1`. Ferramenta do adulto para conferir no
 * navegador o que os testes automáticos não mostram (cartas, HUD, flores),
 * sem precisar dirigir pela cidade inteira:
 *
 *   __orbiTeste.horta()                     começa a Horta na faixa de teste
 *   __orbiTeste.horta({ cartas: 'altas' })  …com as cartas {total…total+2}
 *                                           ('baixas', 'meio'): sorteio fixo
 *   __orbiTeste.enviar({ tipo: 'chegou', lugar: 'MERCADO' })
 *   __orbiTeste.estado()                    estado da aventura
 *   __orbiTeste.vozes                       registro de voz
 *
 * O registro de voz guarda o texto entregue ao `speechSynthesis.speak` e o
 * momento do fim da fala (`end`, `error`), para separar o que foi de fato
 * pedido à voz do que é inferido. Não altera a fala: só observa.
 *
 * Sem `?medir=1`, não instala nada.
 */
import { medicaoAtiva } from './medidor.js';
import { faixaDaHorta } from '../adventure/convites.js';

// Sorteio fixo das cartas da pergunta (sem tocar no Math.random da página).
const JANELAS = Object.freeze({ baixas: 0, meio: 0.5, altas: 0.999 });

export function instalarPonteDeTeste(janela, search, { enviar, iniciarHorta, estado, agora = () => Date.now() }) {
  if (!medicaoAtiva(search)) return false;
  const vozes = [];
  const sintese = janela.speechSynthesis;
  if (sintese && !sintese.__orbiRegistrando) {
    const falarDeVerdade = sintese.speak.bind(sintese);
    sintese.speak = (u) => {
      const item = { texto: String(u.text), inicio: agora(), fim: null, como: null };
      vozes.push(item);
      const fim = (como) => () => {
        if (item.fim === null) Object.assign(item, { fim: agora(), como });
      };
      u.addEventListener?.('end', fim('end'));
      u.addEventListener?.('error', fim('error'));
      return falarDeVerdade(u);
    };
    sintese.__orbiRegistrando = true;
  }
  janela.__orbiTeste = {
    vozes,
    enviar,
    estado,
    horta: ({ cartas } = {}) =>
      iniciarHorta(faixaDaHorta(search), cartas in JANELAS ? { random: () => JANELAS[cartas] } : {}),
  };
  return true;
}
