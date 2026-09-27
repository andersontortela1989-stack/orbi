import { useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  estadoIncremental,
  lerIncremental,
  registrarQuadro,
  resumirQuadros,
  textoResumo,
} from '../perf/medidor.js';

/**
 * MEDIDOR DE DESEMPENHO (fatia A3.1a) — só existe com `?medir=1` no endereço.
 *
 * Ferramenta do adulto para medir no celular (protocolo em
 * docs/PLANO_MESTRE.md, A3), nunca parte da brincadeira:
 *   - não grava nada no save, não usa localStorage e não envia nada pela rede —
 *     o resumo sai só pelo botão COPIAR RESUMO;
 *   - não participa do coordenador de atividades: não pede foco, não fala, não
 *     bloqueia direção;
 *   - sem `?medir=1`, GameExperience nem monta estes componentes, então não há
 *     custo nenhum rodando.
 *
 * DUAS PEÇAS, porque o `renderer.info` só existe dentro do <Canvas> e o painel
 * é DOM (fora dele):
 *   - <ColetorDesempenho/>, dentro do Canvas: a cada quadro grava a duração num
 *     Float32Array pré-alocado e soma os contadores incrementais;
 *   - <MedidorDesempenho/>, fora do Canvas: a cada 2 s só LÊ os contadores.
 *
 * O MEDIDOR NÃO PODE PRODUZIR O QUE MEDE: nada aqui aloca por quadro nem
 * ordena periodicamente (lixo de memória é uma das hipóteses das travadas).
 * Mediana e p95, que exigem ordenar, são calculados só ao tocar em COPIAR
 * RESUMO, sobre o trecho gravado.
 */

// 15 minutos a 60 quadros por segundo. Cobre com folga a rota padrão (~3 min)
// e as 6 rodadas do protocolo feitas uma por recarga.
const CAPACIDADE = 15 * 60 * 60;

// Memória desta página apenas: recarregar zera a medição.
const coleta = {
  // Alocado no PRIMEIRO quadro medido, não no carregamento do módulo: este
  // arquivo viaja no pacote do jogo, e sem `?medir=1` nada deve ser reservado.
  duracoes: null,
  gravados: 0,
  limiteAtingido: false,
  estado: estadoIncremental(),
  // Preenchido no lugar a cada quadro (sem alocar objeto novo no hot path).
  render: { chamadas: 0, triangulos: 0, geometrias: 0, texturas: 0 },
  temRender: false,
  // Ao voltar de uma aba escondida, o primeiro delta mede o tempo fora da aba,
  // não um quadro lento do jogo — esse um é descartado.
  pularProximo: false,
};

const INTERVALO_PAINEL_MS = 2000;

export function ColetorDesempenho() {
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    const aoMudarVisibilidade = () => {
      if (document.visibilityState === 'visible') coleta.pularProximo = true;
    };
    document.addEventListener('visibilitychange', aoMudarVisibilidade);
    return () => document.removeEventListener('visibilitychange', aoMudarVisibilidade);
  }, []);

  // Prioridade padrão (0) de propósito: prioridade > 0 tomaria para si o
  // render do R3F. Lido antes do render deste quadro, o `info` reflete o
  // quadro anterior — suficiente para acompanhar a cena.
  useFrame((_, delta) => {
    if (coleta.pularProximo) {
      coleta.pularProximo = false;
      return;
    }
    // Limite atingido: a medição para por inteiro (array E contadores), para o
    // painel e o resumo copiado continuarem falando dos mesmos quadros.
    if (coleta.limiteAtingido) return;
    if (coleta.duracoes === null) coleta.duracoes = new Float32Array(CAPACIDADE);

    const i = coleta.gravados;
    coleta.duracoes[i] = delta * 1000;
    // Soma o valor JÁ arredondado para 32 bits: contadores do painel e resumo
    // copiado (feito sobre o Float32Array) falam exatamente dos mesmos números.
    registrarQuadro(coleta.estado, coleta.duracoes[i]);
    coleta.gravados = i + 1;
    if (coleta.gravados === CAPACIDADE) coleta.limiteAtingido = true;

    const { render, memory } = gl.info;
    coleta.render.chamadas = render.calls;
    coleta.render.triangulos = render.triangles;
    coleta.render.geometrias = memory.geometries;
    coleta.render.texturas = memory.textures;
    coleta.temRender = true;
  });

  return null;
}

// Copia com duas tentativas. Pela rede local (http://192.168...) o navegador
// não considera o endereço seguro e esconde a Clipboard API — por isso o
// fallback com textarea, e, se até ele falhar, o painel mostra o texto para
// copiar à mão.
async function copiarTexto(texto) {
  try {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch (_) {
    /* cai no fallback abaixo */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = texto;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (_) {
    return false;
  }
}

const numero = (valor) => (valor === null ? '—' : valor.toFixed(1).replace('.', ','));

// Estilos inline: o medidor inteiro fica no pacote do jogo, sem tocar no CSS
// global da abertura. Canto esquerdo, meio da tela — livre de HUD (alto à
// esquerda), pílula da missão (alto, centro), botões (alto à direita),
// controles de toque e Órbi (cantos de baixo). z-index acima do HUD (10) e
// abaixo dos painéis e dos controles de toque: nunca tampa uma pergunta.
const ESTILO_PAINEL = {
  position: 'fixed',
  left: 'var(--ui-safe-left)',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 12,
  width: 196,
  padding: '8px 10px',
  background: 'rgba(255, 255, 255, 0.92)',
  color: '#1C2746',
  border: '2px solid #1C2746',
  borderRadius: 12,
  font: '600 11px/1.4 var(--font-body, system-ui), system-ui, sans-serif',
  pointerEvents: 'auto',
};

const ESTILO_BOTAO = {
  marginTop: 6,
  width: '100%',
  minHeight: 32,
  border: '2px solid #1C2746',
  borderRadius: 8,
  background: '#FFE9A8',
  color: '#1C2746',
  font: 'inherit',
  fontWeight: 700,
  cursor: 'pointer',
};

export function MedidorDesempenho() {
  // A cada 2 s o painel só relê os contadores — leitura barata, sem ordenar.
  const [leitura, setLeitura] = useState(() => lerIncremental(coleta.estado));
  // Mediana e p95 do último COPIAR RESUMO (null até o primeiro toque).
  const [ordenado, setOrdenado] = useState(null);
  const [copia, setCopia] = useState({ estado: 'pronto', texto: '' });

  useEffect(() => {
    const id = setInterval(
      () => setLeitura(lerIncremental(coleta.estado)),
      INTERVALO_PAINEL_MS
    );
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (copia.estado !== 'copiado') return undefined;
    const id = setTimeout(() => setCopia({ estado: 'pronto', texto: '' }), 2000);
    return () => clearTimeout(id);
  }, [copia.estado]);

  const copiarResumo = async (e) => {
    // Sem foco no botão: ESPAÇO é o freio de mão e não pode reacionar a cópia.
    e.currentTarget.blur();
    // Única hora em que se ordena: sob demanda, sobre o trecho gravado.
    const gravado = coleta.duracoes
      ? Array.from(coleta.duracoes.subarray(0, coleta.gravados))
      : [];
    const resumo = resumirQuadros(gravado);
    setLeitura(lerIncremental(coleta.estado));
    setOrdenado({ mediana: resumo.mediana, p95: resumo.p95 });

    let texto = textoResumo(resumo, {
      render: coleta.temRender ? { ...coleta.render } : undefined,
      tela: {
        largura: window.innerWidth,
        altura: window.innerHeight,
        dpr: window.devicePixelRatio || 1,
      },
      quando: new Date().toLocaleString('pt-BR'),
    });
    if (coleta.limiteAtingido) {
      texto += `\nlimite atingido: medição parou em ${CAPACIDADE} quadros`;
    }
    const ok = await copiarTexto(texto);
    setCopia(ok ? { estado: 'copiado', texto: '' } : { estado: 'manual', texto });
  };

  const segundos = Math.floor(leitura.duracaoSessaoMs / 1000);

  return (
    <div style={ESTILO_PAINEL} aria-label="Medidor de desempenho">
      <div>
        {coleta.limiteAtingido ? 'LIMITE ATINGIDO' : 'MEDINDO'} ·{' '}
        {Math.floor(segundos / 60)} min {segundos % 60} s
      </div>
      <div>
        quadros: {leitura.quadros} (+{leitura.ignorados} aquecimento)
      </div>
      <div>maior {numero(leitura.maior)} ms</div>
      <div>
        &gt;50 ms: {numero(leitura.pctAcima50)}% · &gt;250 ms: {leitura.acima250}
      </div>
      <div>
        {ordenado
          ? `mediana ${numero(ordenado.mediana)} · p95 ${numero(ordenado.p95)} ms`
          : 'mediana e p95: ao copiar'}
      </div>
      {coleta.temRender && (
        <div>
          {coleta.render.chamadas} chamadas · {coleta.render.triangulos} triâng.
        </div>
      )}

      <button type="button" style={ESTILO_BOTAO} onClick={copiarResumo}>
        {copia.estado === 'copiado' ? 'COPIADO!' : 'COPIAR RESUMO'}
      </button>

      {copia.estado === 'manual' && (
        <textarea
          readOnly
          value={copia.texto}
          onFocus={(e) => e.currentTarget.select()}
          rows={6}
          style={{ marginTop: 6, width: '100%', font: '10px/1.3 monospace' }}
          aria-label="Resumo para copiar à mão"
        />
      )}
    </div>
  );
}
