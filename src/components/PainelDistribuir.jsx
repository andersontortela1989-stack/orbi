import { enviarEventoAventura } from '../adventure/runtime.js';
import { useAdventure } from '../adventure/useAdventure.js';
import { cartaoDistribuir, eventoDoCanteiro } from '../adventure/distribuir.js';
import { useActivity } from '../activity/useActivity.js';

// O que cada vaga mostra: cheia e vazia, por item.
const MARCAS = {
  semente: { cheia: '🌱', vazia: '○', acao: 'plantar' },
  agua: { cheia: '💧', vazia: '○', acao: 'regar' },
};

/**
 * Cartão de repartir (H1) — um botão grande por canteiro, nas etapas
 * `distribuir` (plantar e regar na Horta). Fica SOBRE o mundo, sem tomar o
 * foco: a etapa acontece com a missão no topo, como coletar e ir_para.
 * O Órbi fala o total repartido até agora, por extenso, e — com mais de um
 * por canteiro — quantos tem o canteiro que encheu (o motor emite a fala).
 * Canteiro cheio fica desabilitado; nada pune nem trava.
 */
export function PainelDistribuir() {
  const aventura = useAdventure();
  const { foco } = useActivity();
  const cartao = cartaoDistribuir(aventura);
  if (!cartao || foco !== 'em_missao') return null;
  const marca = MARCAS[cartao.item] ?? MARCAS.semente;

  return (
    <div className="adv-repartir" role="group" aria-label="canteiros da horta">
      {cartao.canteiros.map((canteiro) => (
        <button
          type="button"
          key={canteiro.indice}
          className={'adv-canteiro' + (canteiro.cheio ? ' adv-canteiro--cheio' : '')}
          disabled={canteiro.cheio}
          aria-label={`${marca.acao} no canteiro ${canteiro.indice + 1}: ${canteiro.quantidade} de ${cartao.porSlot}`}
          onClick={(e) => {
            enviarEventoAventura(eventoDoCanteiro(cartao, canteiro.indice));
            e.currentTarget.blur();
          }}
        >
          <span className="adv-canteiro-vagas" aria-hidden="true">
            {Array.from({ length: cartao.porSlot }, (_, i) =>
              i < canteiro.quantidade ? marca.cheia : marca.vazia
            ).join(' ')}
          </span>
          <span className="adv-canteiro-terra" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
