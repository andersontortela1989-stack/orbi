import { useEffect } from 'react';

/**
 * ÁREA DOS PAIS — painel estático informativo sobre a abertura.
 *
 * Overlay que explica o Órbi para o adulto: o que é, como foi desenhado
 * (os guard-rails TEA+TDAH, ditos em linguagem de pai) e uma nota honesta
 * de que é jogo, não terapia. 100% ESTÁTICO: zero estado persistido, zero
 * store, zero lógica de jogo, zero TTS — nada aqui passa por falar(). É
 * texto e um botão FECHAR, só isso.
 *
 * Espelha o padrão visual do Caderninho (card claro, contorno navy, cantos
 * arredondados, FECHAR grande no topo), mas com classes próprias `pais-*`
 * (desacoplado do caderninho — este painel não é do jogo).
 *
 * MONTAGEM: renderizado como filho de `.orbi-start` (NÃO de `.start-screen`,
 * que tem transform: scale() — position:fixed dentro dele seria escalado).
 * Abre só por toque (a criança/adulto conduz); FECHAR ou ESC volta à
 * abertura. Fade de entrada gated em prefers-reduced-motion (no CSS).
 * Scroll interno pelo overlay quando não couber (celular em paisagem).
 */
export function AreaPais({ onFechar }) {
  // ESC fecha (mesmo padrão do Caderninho). Na abertura não há teclado de
  // jogo competindo, mas ESC é o gesto universal de "voltar".
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Escape') onFechar();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onFechar]);

  return (
    <div className="pais-overlay">
      <div className="pais-painel" role="dialog" aria-label="Área dos pais">
        <div className="pais-topo">
          <div className="pais-titulo">ÁREA DOS PAIS</div>
          {/* tabIndex=-1 + blur(): mesma higiene dos outros painéis — o botão
              clicado não fica focado (aqui não há ESPAÇO/freio, mas mantém o
              padrão e evita re-clique por teclado). */}
          <button
            type="button"
            className="pais-fechar"
            tabIndex={-1}
            onClick={(e) => {
              onFechar();
              e.currentTarget.blur();
            }}
          >
            FECHAR
          </button>
        </div>

        <section className="pais-secao">
          <h3 className="pais-secao-titulo">O que é o Órbi</h3>
          <p className="pais-texto">
            O Órbi é um jogo educativo gratuito, feito por um pai para o filho
            autista com TDAH. A criança dirige por uma cidade calma e ensina o
            Órbi — um alienzinho que acabou de chegar e não conhece nada da
            Terra. Aqui, a criança não é testada: ela é quem sabe.
          </p>
        </section>

        <section className="pais-secao">
          <h3 className="pais-secao-titulo">Como o jogo foi desenhado</h3>
          <ul className="pais-lista">
            <li>Errar nunca é punido — sem vermelho, sem som de erro, sem "você perdeu"</li>
            <li>Sem cronômetro e sem pressão — cada criança no seu ritmo</li>
            <li>Uma coisa de cada vez — nada aparece de surpresa</li>
            <li>Sem anúncios, sem compras, sem cadastro</li>
            <li>O progresso fica salvo somente neste aparelho</li>
          </ul>
        </section>

        <section className="pais-secao">
          <h3 className="pais-secao-titulo">Nota honesta</h3>
          <p className="pais-texto">
            O Órbi é um jogo educativo. Ele não trata, não cura e não substitui
            terapias, diagnóstico ou acompanhamento profissional.
          </p>
        </section>

        <p className="pais-rodape">
          Feito com carinho por Anderson Tortela — para o Heitor
        </p>
      </div>
    </div>
  );
}
