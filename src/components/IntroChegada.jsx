import { useEffect, useRef, useState } from 'react';
import { useGame } from '../store/useGame.js';
import { falar, pararFala, nomeParaVoz } from '../audio/voz.js';
import { Orbi } from './Orbi.jsx';

/**
 * INTRO "A CHEGADA" (adendo de narrativa) — sequência 2D no clima Mundo Adesivo.
 *
 * 3 quadros narrados pela voz do Órbi: espaço → pouso na Terra → encontro
 * ("como você se chama?"). Ao concluir, entra no jogo (a cidade).
 *
 * Regras invioláveis do adendo:
 *  - PULAR visível desde o 1º quadro.
 *  - Só toca inteira na 1ª vez (a flag introVista é marcada ao concluir/pular;
 *    quem decide tocar ou não é o App). "Ver a história de novo" reusa este
 *    mesmo componente.
 *  - Ritmo calmo: cada quadro avança por toque/tecla OU sozinho com folga.
 *    O último quadro (encontro) NÃO auto-avança — espera a criança continuar.
 *  - CAIXA ALTA na legenda; narração pt-BR sincronizada (legenda em caixa alta,
 *    voz em caixa normal — o TTS lê melhor).
 *  - prefers-reduced-motion: animações viram cortes simples (gated no CSS).
 *
 * CAPTURA DO NOME (Parte 2): o quadro do encontro tem duas cenas — PERGUNTA
 * (input CAIXA ALTA, letras grandes) e RESPOSTA ("Que nome bonito, {NOME}!…").
 * Sem validação punitiva: aceita o que vier; vazio segue em frente sem
 * sobrescrever um nome já salvo ("ver a história de novo" é o caminho de
 * corrigir — o input vem pré-preenchido). Digitar o nome é o primeiro ato de
 * letramento do jogo.
 *
 * Sem conflito de controles: o jogo (Canvas + teclado) só monta depois desta
 * intro; aqui o teclado é só avanço de quadro — e, no encontro, é do input.
 */

const QUADROS = [
  {
    key: 'espaco',
    voz: 'Lá longe, em outro planeta, mora o Órbi.',
    legenda: 'LÁ LONGE, EM OUTRO PLANETA,\nMORA O ÓRBI…',
  },
  {
    key: 'pouso',
    voz: 'Ele viajou muito e chegou num lugar novo: a Terra!',
    legenda: 'ELE VIAJOU MUITO E CHEGOU\nNUM LUGAR NOVO: A TERRA!',
  },
  {
    key: 'encontro',
    voz: 'Oi! Eu sou o Órbi! Como você se chama?',
    legenda: 'OI! EU SOU O ÓRBI!\nCOMO VOCÊ SE CHAMA?',
  },
];

const AUTO_AVANCO_MS = 6000; // folga generosa; sem timer apertando
const RESPIRO_MS = 800; // respiro entre o fim da fala da resposta e entrar no jogo
const RESPOSTA_FALLBACK_MS = 4500; // sem suporte a voz: tempo de ler a resposta

const ROCKET_SVG = `
<svg viewBox="0 0 120 168" xmlns="http://www.w3.org/2000/svg">
  <path d="M48 130 Q60 168 72 130 Z" fill="#FFC53D" stroke="#1C2746" stroke-width="5" stroke-linejoin="round"/>
  <path d="M60 8 C82 28 84 72 80 112 L40 112 C36 72 38 28 60 8 Z" fill="#fff" stroke="#1C2746" stroke-width="6"/>
  <path d="M40 94 L20 126 L42 116 Z" fill="#F0623E" stroke="#1C2746" stroke-width="5" stroke-linejoin="round"/>
  <path d="M80 94 L100 126 L78 116 Z" fill="#F0623E" stroke="#1C2746" stroke-width="5" stroke-linejoin="round"/>
  <circle cx="60" cy="56" r="16" fill="#58B6E8" stroke="#1C2746" stroke-width="6"/>
  <circle cx="60" cy="14" r="6" fill="#FFC53D" stroke="#1C2746" stroke-width="4"/>
</svg>`;

const HILL_SVG = `
<svg viewBox="0 0 1280 300" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 120 Q 360 64 640 96 Q 960 128 1280 92 L1280 300 L0 300 Z" fill="#5BBE6E" stroke="#1C2746" stroke-width="6"/>
  <path d="M120 300 Q 220 214 320 300 Z" fill="#3F9E52" opacity="0.28"/>
  <path d="M900 300 Q 1010 206 1120 300 Z" fill="#3F9E52" opacity="0.28"/>
</svg>`;

// estrelas-adesivo estáticas (posições fixas, calmas) — só no quadro do espaço
const ESTRELAS = [
  { left: '14%', top: '22%', s: 18 },
  { left: '28%', top: '54%', s: 12 },
  { left: '44%', top: '16%', s: 14 },
  { left: '68%', top: '30%', s: 16 },
  { left: '82%', top: '60%', s: 12 },
  { left: '60%', top: '70%', s: 14 },
  { left: '20%', top: '78%', s: 10 },
  { left: '90%', top: '20%', s: 10 },
];
const STAR_SVG = (s) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 34 34"><path d="M17 1 l4 12 12 4 -12 4 -4 12 -4 -12 -12 -4 12 -4 z" fill="#FFE0A0" stroke="#1C2746" stroke-width="3"/></svg>`;

function Raw({ html, className, style }) {
  return <div className={className} style={style} aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function IntroChegada({ onConcluir }) {
  const [i, setI] = useState(0);
  const marcarIntroVista = useGame((s) => s.marcarIntroVista);
  const nome = useGame((s) => s.nome);
  const setNome = useGame((s) => s.setNome);

  // captura do nome: o input vem pré-preenchido (corrigir = regravar por cima)
  const [valor, setValor] = useState(nome);
  const [respondeu, setRespondeu] = useState(false); // encontro: pergunta → resposta
  const finalizou = useRef(false); // contra dupla conclusão (onEnd da fala + clique)
  const respiroTO = useRef(null);

  const quadro = QUADROS[i];
  const ultimo = i === QUADROS.length - 1;

  // narração sincronizada por quadro (chega aqui via clique no JOGAR → áudio liberado)
  useEffect(() => {
    falar(quadro.voz, { interrupt: true });
  }, [i, quadro.voz]);

  // auto-avanço com folga (menos no último quadro, que espera a criança)
  useEffect(() => {
    if (ultimo) return;
    const t = setTimeout(() => setI((n) => Math.min(n + 1, QUADROS.length - 1)), AUTO_AVANCO_MS);
    return () => clearTimeout(t);
  }, [i, ultimo]);

  const concluir = () => {
    if (finalizou.current) return;
    finalizou.current = true;
    pararFala();
    marcarIntroVista();
    onConcluir && onConcluir();
  };

  // confirma o nome (CONTINUAR / Enter no input) → Órbi responde e entra no jogo
  const confirmarNome = (e) => {
    e.preventDefault();
    const v = valor.trim();
    if (v) setNome(v); // vazio: segue em frente sem apagar um nome já salvo
    const quem = v || nome;
    setRespondeu(true);

    const texto = quem
      ? `Que nome bonito, ${nomeParaVoz(quem)}! Eu não conheço nada daqui… me mostra teu mundo?`
      : 'Eu não conheço nada daqui… me mostra teu mundo?';
    const falou = falar(texto, {
      interrupt: true,
      // fala acabou → respiro → cidade (o botão VAMOS! deixa pular a espera)
      onEnd: () => {
        respiroTO.current = setTimeout(concluir, RESPIRO_MS);
      },
    });
    if (!falou) respiroTO.current = setTimeout(concluir, RESPOSTA_FALLBACK_MS);
  };

  const avancar = () => {
    if (ultimo) return; // no encontro, quem manda é o input do nome
    setI((n) => n + 1);
  };

  // toque/tecla avança os quadros não-finais
  useEffect(() => {
    const onKey = (e) => {
      if (ultimo) return; // no encontro o teclado é do input (Enter envia o form)
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight') {
        e.preventDefault();
        avancar();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ultimo]);

  // limpa fala e timers se desmontar no meio
  useEffect(
    () => () => {
      pararFala();
      clearTimeout(respiroTO.current);
    },
    []
  );

  // legenda do encontro muda com a sub-cena (pergunta → resposta)
  const nomeRespondido = valor.trim() || nome;
  const legenda = !respondeu
    ? quadro.legenda
    : nomeRespondido
      ? `QUE NOME BONITO, ${nomeRespondido}!\nEU NÃO CONHEÇO NADA DAQUI…\nME MOSTRA TEU MUNDO?`
      : 'EU NÃO CONHEÇO NADA DAQUI…\nME MOSTRA TEU MUNDO?';

  return (
    <div className={'intro intro--' + quadro.key}>
      {/* PULAR sempre visível */}
      <button
        className="intro-pular"
        onClick={(e) => {
          e.stopPropagation();
          concluir();
        }}
      >
        PULAR
      </button>

      {/* área clicável p/ avançar (só nos quadros não-finais) */}
      <div
        className="intro-palco"
        onClick={ultimo ? undefined : avancar}
        role={ultimo ? undefined : 'button'}
      >
        {/* QUADRO 1 — ESPAÇO */}
        {quadro.key === 'espaco' && (
          <div className="intro-cena intro-espaco">
            {ESTRELAS.map((e, idx) => (
              <Raw key={idx} className="intro-estrela" style={{ left: e.left, top: e.top }} html={STAR_SVG(e.s)} />
            ))}
            <Raw className="intro-foguete intro-foguete--voa" html={ROCKET_SVG} />
          </div>
        )}

        {/* QUADRO 2 — POUSO */}
        {quadro.key === 'pouso' && (
          <div className="intro-cena intro-pouso">
            <Raw className="intro-foguete intro-foguete--pousa" html={ROCKET_SVG} />
            <Raw className="intro-colina" html={HILL_SVG} />
          </div>
        )}

        {/* QUADRO 3 — ENCONTRO (pergunta → resposta) */}
        {quadro.key === 'encontro' && (
          <div className="intro-cena intro-encontro">
            <div className="intro-orbi-wrap">
              <Orbi pose={respondeu ? 'comemorando' : 'acenando'} className="intro-orbi" />
            </div>
            <Raw className="intro-colina" html={HILL_SVG} />
          </div>
        )}

        {/* LEGENDA (CAIXA ALTA) */}
        <div className="intro-legenda" aria-live="polite">
          {legenda}
        </div>

        {/* avanço explícito */}
        {!ultimo ? (
          <div className="intro-dica">TOQUE PARA CONTINUAR</div>
        ) : !respondeu ? (
          /* CAPTURA DO NOME — letras grandes, CAIXA ALTA, sem validação punitiva */
          <form className="intro-nome-form" onSubmit={confirmarNome}>
            <input
              className="intro-nome"
              type="text"
              value={valor}
              onChange={(e) => setValor(e.target.value.toUpperCase())}
              placeholder="SEU NOME"
              aria-label="seu nome"
              maxLength={16}
              autoFocus
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              enterKeyHint="done"
            />
            <button type="submit" className="intro-continuar">
              CONTINUAR
            </button>
          </form>
        ) : (
          /* resposta: a fala leva à cidade sozinha; o botão deixa ir já */
          <button
            className="intro-continuar"
            onClick={(e) => {
              e.stopPropagation();
              concluir();
            }}
          >
            VAMOS!
          </button>
        )}
      </div>
    </div>
  );
}
