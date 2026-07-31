import { useEffect } from 'react';
import { useGame } from '../store/useGame.js';
import { coordenadorAtividade, falarDaAtividade } from '../activity/index.js';
import { useRegistrarAtividade } from '../activity/useActivity.js';
import { postoAtivo } from '../economia.js';
import {
  CATEGORIAS_CADERNINHO,
  conteudoDescoberta,
  falaDescoberta,
} from '../missions/descobertas.js';
import { Bandeira } from './Bandeira.jsx';

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
 *  OVERLAY — página única, seções empilhadas (LUGARES primeiro: enche a
 *  cada chegada, garante conteúdo no topo). Descobertos = adesivos
 *  vibrantes na ordem da descoberta; o resto = slots-mistério "?" em
 *  tracejado calmo e NEUTRO (curiosidade do Órbi, não déficit da criança;
 *  Sol é celebração — fica nos descobertos). PROIBIDO em todo o caderninho:
 *  contadores, barras, "X de Y", "faltam N", porcentagens.
 *
 *  FALANTE (frente "Caderninho falante"): tocar num adesivo descoberto =
 *  o Órbi fala o fato (falaDescoberta — derivada do MESMO conteúdo do
 *  card, rótulo em minúsculas na voz). Re-toque REPETE de propósito:
 *  fala = conteúdo, não transação — repetição é conforto (TEA); o
 *  interrupt resolve a rajada real (cancela, nunca sobrepõe). Mistério
 *  fala UMA linha curiosa fixa, sem contar nem apontar o que falta.
 *  Fechar libera o foco e corta a fala imediatamente.
 *
 *  Com o caderninho aberto o input de direção não move o carro (ver
 *  useKeyboard) — previsibilidade > física viva sob overlay.
 */
export function Caderninho() {
  const aberto = useGame((s) => s.caderninhoAberto);
  const descobertas = useGame((s) => s.descobertas);
  const nome = useGame((s) => s.nome);
  useRegistrarAtividade('caderninho', aberto);

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
    falarDaAtividade(
      'caderninho',
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
    coordenadorAtividade.liberar('caderninho');
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
                    conta a história do álbum). Cada adesivo é um BOTÃO que
                    fala o fato ao toque — tabIndex=-1 + blur(): ESPAÇO
                    (freio de mão) nunca reativa o último card tocado. */}
                {achados.map((id) => {
                  const c = conteudoDescoberta(cat.id, id);
                  if (!c) return null;
                  return (
                    <button
                      type="button"
                      className="cad-adesivo"
                      key={id}
                      tabIndex={-1}
                      onClick={(e) => {
                        const fala = falaDescoberta(cat.id, id);
                        if (fala) {
                          falarDaAtividade('caderninho', fala, { interrupt: true });
                        }
                        e.currentTarget.blur();
                      }}
                    >
                      {c.bandeira ? (
                        /* adesivo de PAÍS (Frente 6): SVG da bandeira */
                        <Bandeira slug={c.bandeira} className="cad-bandeira" />
                      ) : c.emoji ? (
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
                    </button>
                  );
                })}
                {/* slots-mistério: o que o Órbi AINDA vai descobrir —
                    tracejado calmo e neutro, sem Sol, sem contagem. Ao
                    toque, UMA linha curiosa fixa (igual pra todos —
                    previsível): convite, nunca déficit. */}
                {misterios.map((id) => (
                  <button
                    type="button"
                    className="cad-misterio"
                    key={id}
                    tabIndex={-1}
                    aria-label="ainda não descoberto"
                    onClick={(e) => {
                      falarDaAtividade(
                        'caderninho',
                        'Hmm, esse eu ainda não descobri... me mostra?',
                        { interrupt: true }
                      );
                      e.currentTarget.blur();
                    }}
                  >
                    ?
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
