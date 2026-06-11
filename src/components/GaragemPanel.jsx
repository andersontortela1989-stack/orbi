import { useEffect, useRef } from 'react';
import { useGame } from '../store/useGame.js';
import { somSucesso } from '../audio/sons.js';
import { falar } from '../audio/voz.js';
import { CORES_CARRO, COR_POR_ID } from '../city/garagem.js';

/**
 * Painel da garagem (frente "Garagem") — escolher a cor do carro.
 *
 * Mesmo padrão do RefuelPanel: overlay 2D fora do <Canvas>, ancorado
 * embaixo (NÃO cobre a cena — o carro fica visível ali em cima, e é nele
 * que o preview acontece), abre na zona, fecha ao sair dirigindo. Espera
 * o caderninho fechar (uma coisa por vez), e o botão do caderninho some
 * enquanto este painel está aberto (Caderninho.jsx).
 *
 * FLUXO (mental model de criança):
 *   - clicar numa cor JÁ COMPRADA → veste na hora, grátis (reversível).
 *   - clicar numa cor nova → o CARRO 3D mostra a cor (preview ao vivo,
 *     corPreview transiente) ANTES de pagar; o botão PINTAR confirma.
 *   - experimentar NUNCA é bloqueado — inclusive cor que ainda não dá:
 *     visual neutro ("AINDA NÃO DÁ", sem vermelho, sem cadeado) e a voz
 *     faz a SUBTRAÇÃO com calma ("faltam N moedinhas! vamos buscar?") —
 *     micro-pedagogia, tom curioso, UMA fala por clique (interrupt).
 *
 * corPreview limpa em TODOS os caminhos de saída: o effect de !aberto
 * cobre qualquer fechamento (saiu da zona, caderninho por cima, unmount
 * do painel), e a action setGaragemPerto(false) zera no lado da zona.
 */
export function GaragemPanel() {
  const aberto = useGame((s) => s.garagemPerto && !s.caderninhoAberto);
  const moedas = useGame((s) => s.moedas);
  const corCarro = useGame((s) => s.corCarro);
  const coresCompradas = useGame((s) => s.coresCompradas);
  const corPreview = useGame((s) => s.corPreview);

  // Guard de "sem repetição" (ajuste da frente): re-clicar a MESMA swatch
  // já em preview não re-fala — uma fala por clique novo.
  const ultimaFala = useRef(null);

  // Voz de boas-vindas ao abrir (interrupt: abrir/fechar repetido não
  // enfileira) — tom do adendo: o Órbi convida, curto.
  useEffect(() => {
    if (aberto) {
      ultimaFala.current = null;
      falar('Uau, uma garagem! Aqui pinta o carro! Qual cor você quer?', {
        interrupt: true,
      });
    }
  }, [aberto]);

  // Painel fechou por QUALQUER caminho → preview nunca sobrevive.
  useEffect(() => {
    if (!aberto) useGame.getState().setCorPreview(null);
  }, [aberto]);

  if (!aberto) return null;

  const escolher = (cor) => {
    const s = useGame.getState();

    if (s.coresCompradas.includes(cor.id)) {
      // Já comprada → veste na hora, grátis. Mesma cor vestida = no-op.
      const trocou = cor.id !== s.corCarro;
      s.comprarCor(cor.id);
      s.setCorPreview(null);
      ultimaFala.current = null;
      if (trocou) falar(`Carro ${cor.nome}!`, { interrupt: true });
      return;
    }

    // Cor nova: preview ao vivo no carro 3D, SEMPRE (experimentar nunca é
    // bloqueado). A fala depende da conta — uma por clique, sem repetir.
    s.setCorPreview(cor.id);
    if (ultimaFala.current === cor.id) return;
    ultimaFala.current = cor.id;

    if (s.moedas >= cor.preco) {
      falar(`Carro ${cor.nome}! Gostou? São ${cor.preco} moedinhas!`, {
        interrupt: true,
      });
    } else {
      // Micro-pedagogia: subtração contextualizada, tom curioso, zero
      // negação — "ainda não dá" vira plano ("vamos buscar?").
      const faltam = cor.preco - s.moedas;
      falar(
        `Essa custa ${cor.preco}! Faltam ${faltam} moedinhas... vamos buscar?`,
        { interrupt: true }
      );
    }
  };

  const confirmar = () => {
    const s = useGame.getState();
    const cor = COR_POR_ID[s.corPreview];
    if (!cor) return;
    if (s.comprarCor(cor.id)) {
      s.setCorPreview(null);
      ultimaFala.current = null;
      somSucesso();
      falar(`Uau! Carro ${cor.nome}! Ficou lindo!`, { interrupt: true });
    }
    // false (insuficiente) não acontece por aqui: o botão PINTAR só
    // renderiza quando dá — e se desse, seria no-op silencioso mesmo.
  };

  const preview = corPreview ? COR_POR_ID[corPreview] : null;
  const previewAlcancavel = preview && moedas >= preview.preco;

  return (
    <div className="garagem-overlay">
      <div className="garagem-painel" role="dialog" aria-label="garagem">
        <div className="garagem-titulo">🎨 PINTAR O CARRO</div>

        <div className="garagem-cores">
          {CORES_CARRO.map((cor) => {
            const comprada = coresCompradas.includes(cor.id);
            const vestida = cor.id === corCarro;
            const emPreview = cor.id === corPreview;
            return (
              /* tabIndex=-1 + blur(): ESPAÇO (freio de mão/drift) não
                 reativa a swatch clicada — padrão dos painéis. */
              <button
                key={cor.id}
                type="button"
                tabIndex={-1}
                className={
                  'garagem-cor' +
                  (vestida ? ' is-vestida' : '') +
                  (emPreview ? ' is-preview' : '')
                }
                onClick={(e) => {
                  escolher(cor);
                  e.currentTarget.blur();
                }}
              >
                <span
                  className="garagem-swatch"
                  style={{ background: cor.tinta }}
                  aria-hidden="true"
                />
                <span className="garagem-nome">{cor.nome}</span>
                <span className="garagem-sub">
                  {vestida ? '✓ É ESSA' : comprada ? '✓' : `🪙 ${cor.preco}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* UMA linha de ação por vez: botão de compra (alcançável), chip
            neutro (ainda não dá — sem vermelho, sem cadeado), ou a dica. */}
        {preview && !coresCompradas.includes(preview.id) ? (
          previewAlcancavel ? (
            <button
              type="button"
              className="garagem-botao"
              tabIndex={-1}
              onClick={(e) => {
                confirmar();
                e.currentTarget.blur();
              }}
            >
              ✓ PINTAR DE {preview.nome} · 🪙 {preview.preco}
            </button>
          ) : (
            <div className="garagem-neutro">AINDA NÃO DÁ... VAMOS BUSCAR?</div>
          )
        ) : (
          <div className="garagem-dica">CLIQUE NUMA COR PARA EXPERIMENTAR</div>
        )}
      </div>
    </div>
  );
}
