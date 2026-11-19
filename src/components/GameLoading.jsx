import { Orbi } from './Orbi.jsx';
import {
  BOTAO_FALHA_CARGA,
  TEXTO_FALHA_CARGA,
  tentarDeNovo,
} from '../ui/carga-segura.js';

/**
 * Fallback honesto: não inventa porcentagem enquanto o mundo 3D é baixado.
 *
 * R2 — com `falhou`, a mesma tela vira a de falha de carga: Órbi parado
 * (nada se mexe, com ou sem Modo Tranquilo), uma frase curta e TENTAR DE
 * NOVO. Sem texto técnico, sem vermelho, sem som. Um componente só para as
 * duas telas: o pacote inicial não carrega a estrutura repetida.
 */
export function GameLoading({ falhou = false }) {
  return (
    <div className="game-loading" role="status" aria-live="polite">
      <div className={'game-loading-orbi' + (falhou ? ' parado' : '')} aria-hidden="true">
        <Orbi pose={falhou ? 'parado' : 'acenando'} />
      </div>
      <strong>{falhou ? TEXTO_FALHA_CARGA : 'PREPARANDO A CIDADE…'}</strong>
      {falhou ? (
        <button type="button" className="adv-continuar" onClick={tentarDeNovo}>
          {BOTAO_FALHA_CARGA}
        </button>
      ) : (
        <>
          <span>O Órbi está deixando tudo pronto para explorar.</span>
          <div className="game-loading-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </>
      )}
    </div>
  );
}
