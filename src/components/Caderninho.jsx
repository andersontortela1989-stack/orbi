import { useEffect } from 'react';
import { useGame } from '../store/useGame.js';
import { falar, pararFala } from '../audio/voz.js';
import { postoAtivo } from '../economia.js';
import {
  CATEGORIAS_CADERNINHO,
  conteudoDescoberta,
} from '../missions/descobertas.js';

/**
 * CADERNINHO DO ÓRBI — o álbum do que ele aprendeu COM a criança.
 *
 * Inversão pedagógica inviolável: nunca "o que você aprendeu", sempre
 * "O QUE O ÓRBI DESCOBRIU COM {NOME}". A criança é a guia; o caderninho é
 * a prova visível de que ela ensinou um alienígena sobre a Terra.
 *
 * Duas partes num componente só (um ponto de montagem no App):
 *
 *  BOTÃO-ADESIVO (canto sup-direito) — 100% ESTÁTICO por guard-rail TEA:
 *  sem pulso, sem badge, sem contador de novidades. A celebração já
 *  aconteceu no quiz; o caderninho é revisita por iniciativa da criança.
 *  Suprimido enquanto qualquer outro painel está aberto (quiz, posto).
 *
 *  OVERLAY — página única, 4 seções empilhadas (LUGARES primeiro: enche a
 *  cada chegada, garante conteúdo no topo). Descobertos = adesivos
 *  vibrantes na ordem da descoberta; o resto = slots-mistério "?" em
 *  tracejado calmo e NEUTRO (curiosidade do Órbi, não déficit da criança;
 *  Sol é celebração — fica nos descobertos). PROIBIDO em todo o caderninho:
 *  contadores, barras, "X de Y", "faltam N", porcentagens.
 *
 *  Com o caderninho aberto o input de direção não move o carro (ver
 *  useKeyboard) — previsibilidade > física viva sob overlay.
 */
export function Caderninho() {
  const aberto = useGame((s) => s.caderninhoAberto);
  const descobertas = useGame((s) => s.descobertas);
  const nome = useGame((s) => s.nome);

  // Botão suprimido enquanto outro painel está aberto (uma coisa por vez):
  // quiz, posto e garagem.
  const quizAberto = useGame((s) => !!s.chegadaViva);
  const postoAberto = useGame((s) => postoAtivo(s.combustivel, s.postoPerto));
  const garagemAberta = useGame((s) => s.garagemPerto);

  // Voz na abertura — cancela qualquer fala anterior (interrupt) pra
  // abrir/fechar repetido não enfileirar utterances.
  useEffect(() => {
    if (!aberto) return;
    const d = useGame.getState().descobertas;
    const temAlgo = Object.values(d ?? {}).some((lista) => lista.length > 0);
    falar(
      temAlgo
        ? 'Olha tudo que eu descobri com você!'
        : 'Ainda não anotei nada... me mostra teu mundo?',
      { interrupt: true }
    );
  }, [aberto]);

  // ESC fecha (não conflita com as setas/espaço, que dirigem).
  useEffect(() => {
    if (!aberto) return;
    const onKey = (e) => {
      if (e.code === 'Escape') fechar();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aberto]);

  const fechar = () => {
    pararFala(); // fechou = a fala do caderninho também encerra
    useGame.getState().fecharCaderninho();
  };

  if (!aberto) {
    if (quizAberto || postoAberto || garagemAberta) return null;
    return (
      /* tabIndex=-1 + blur(): ESPAÇO (freio de mão) não reabre o botão
         que acabou de ser clicado — mesmo padrão dos painéis. */
      <button
        type="button"
        className="cad-btn"
        tabIndex={-1}
        aria-label="Caderninho do Órbi"
        onClick={(e) => {
          useGame.getState().abrirCaderninho();
          e.currentTarget.blur();
        }}
      >
        📒
      </button>
    );
  }

  return (
    <div className="cad-overlay">
      <div className="cad-painel" role="dialog" aria-label="Caderninho do Órbi">
        <div className="cad-topo">
          <div className="cad-titulo">
            O QUE O ÓRBI DESCOBRIU COM {nome || 'VOCÊ'}
          </div>
          <button
            type="button"
            className="cad-fechar"
            tabIndex={-1}
            onClick={(e) => {
              fechar();
              e.currentTarget.blur();
            }}
          >
            FECHAR
          </button>
        </div>

        {CATEGORIAS_CADERNINHO.map((cat) => {
          const achados = descobertas?.[cat.id] ?? [];
          const misterios = cat.possiveis.filter((id) => !achados.includes(id));
          return (
            <section className="cad-secao" key={cat.id}>
              <div className="cad-secao-titulo">{cat.titulo}</div>
              <div className="cad-grid">
                {/* descobertos primeiro, na ORDEM da descoberta (a ordem
                    conta a história do álbum) */}
                {achados.map((id) => {
                  const c = conteudoDescoberta(cat.id, id);
                  if (!c) return null;
                  return (
                    <div className="cad-adesivo" key={id}>
                      {c.emoji ? (
                        <span className="cad-emoji" aria-hidden="true">
                          {c.emoji}
                        </span>
                      ) : (
                        <span
                          className="cad-chip"
                          style={{ background: c.cor }}
                          aria-hidden="true"
                        />
                      )}
                      <span className="cad-nome">{c.rotulo}</span>
                      <span className="cad-fato">{c.fato}</span>
                    </div>
                  );
                })}
                {/* slots-mistério: o que o Órbi AINDA vai descobrir —
                    tracejado calmo e neutro, sem Sol, sem contagem */}
                {misterios.map((id) => (
                  <div className="cad-misterio" key={id} aria-hidden="true">
                    ?
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
