/**
 * MEDIDOR DE DESEMPENHO (fatia A3.1a) — matemática pura.
 *
 * Recebe a duração de cada quadro, em milissegundos, e devolve o resumo que o
 * docs/PLANO_MESTRE.md (A3) pede para comparar medições no celular: mediana,
 * p95, maior quadro, fração de quadros lentos e contagem de travadas.
 *
 * Sem React, sem three e sem browser: roda direto no node:test. A coleta mora
 * em components/MedidorDesempenho.jsx, que só é montado com `?medir=1`.
 *
 * AQUECIMENTO: os primeiros 10 s de sessão carregam shader, glifos e física
 * se assentando — não representam o jogo em regime. Esses quadros ficam fora
 * das estatísticas, mas entram na duração da sessão e são contados em
 * `ignorados`, para o número nunca esconder o que aconteceu.
 */

export const AQUECIMENTO_MS = 10000;
export const LIMIAR_LENTO_MS = 50;
export const LIMIAR_TRAVADA_MS = 250;

/** A medição só existe quando o endereço pede explicitamente `?medir=1`. */
export function medicaoAtiva(search) {
  if (typeof search !== 'string') return false;
  return new URLSearchParams(search).get('medir') === '1';
}

// Mediana: com quantidade par, a média dos dois do meio.
function mediana(ordenados) {
  const n = ordenados.length;
  const meio = Math.floor(n / 2);
  return n % 2 === 1 ? ordenados[meio] : (ordenados[meio - 1] + ordenados[meio]) / 2;
}

// Percentil pelo método do posto mais próximo: sempre um quadro que existiu.
function percentil(ordenados, p) {
  const posto = Math.ceil((p / 100) * ordenados.length);
  return ordenados[Math.max(0, posto - 1)];
}

/**
 * Resume uma lista de durações de quadro (ms).
 *
 * Um quadro é de aquecimento quando TERMINA dentro dos primeiros
 * `aquecimentoMs` da sessão. Valores inválidos (não numéricos, infinitos ou
 * negativos) são descartados antes de tudo e contados em `descartados`.
 *
 * Sem quadro medido, as estatísticas voltam `null` — nunca zero, porque zero
 * leria como "perfeito".
 */
export function resumirQuadros(duracoes, { aquecimentoMs = AQUECIMENTO_MS } = {}) {
  const lista = Array.isArray(duracoes) ? duracoes : [];
  const validas = lista.filter((d) => typeof d === 'number' && Number.isFinite(d) && d >= 0);

  let acumulado = 0;
  let ignorados = 0;
  const medidos = [];
  for (const d of validas) {
    acumulado += d;
    if (acumulado <= aquecimentoMs) ignorados += 1;
    else medidos.push(d);
  }

  const base = {
    quadros: medidos.length,
    ignorados,
    descartados: lista.length - validas.length,
    duracaoSessaoMs: acumulado,
  };

  if (medidos.length === 0) {
    return { ...base, mediana: null, p95: null, maior: null, pctAcima50: null, acima250: 0 };
  }

  const ordenados = [...medidos].sort((a, b) => a - b);
  const lentos = medidos.filter((d) => d > LIMIAR_LENTO_MS).length;

  return {
    ...base,
    mediana: mediana(ordenados),
    p95: percentil(ordenados, 95),
    maior: ordenados[ordenados.length - 1],
    pctAcima50: (lentos / medidos.length) * 100,
    acima250: medidos.filter((d) => d > LIMIAR_TRAVADA_MS).length,
  };
}

/**
 * ESTATÍSTICA INCREMENTAL — o que o painel lê enquanto a medição corre.
 *
 * `resumirQuadros` copia, filtra e ordena a lista inteira: serve para o resumo
 * final, mas repetido periodicamente geraria lixo de memória — e a coleta de
 * lixo é uma das hipóteses para as travadas. O medidor não pode produzir o
 * efeito que mede. Aqui, cada quadro só soma contadores: sem ordenar e sem
 * alocar.
 *
 * Por isso `registrarQuadro` ALTERA NO LUGAR o estado recebido em vez de
 * devolver um novo (devolver um objeto por quadro seria justamente a alocação
 * a evitar). É determinística e não toca em nada além desse estado.
 *
 * Mediana e p95 exigem a lista ordenada e ficam de fora de propósito: são
 * calculadas por `resumirQuadros` só quando alguém pede o resumo.
 */
export function estadoIncremental() {
  return {
    duracaoSessaoMs: 0,
    ignorados: 0,
    quadros: 0,
    maior: null,
    acima50: 0,
    acima250: 0,
    descartados: 0,
  };
}

/** Soma um quadro ao estado (mesmas regras de aquecimento e descarte). */
export function registrarQuadro(estado, duracao, aquecimentoMs = AQUECIMENTO_MS) {
  if (typeof duracao !== 'number' || !Number.isFinite(duracao) || duracao < 0) {
    estado.descartados += 1;
    return estado;
  }
  estado.duracaoSessaoMs += duracao;
  if (estado.duracaoSessaoMs <= aquecimentoMs) {
    estado.ignorados += 1;
    return estado;
  }
  estado.quadros += 1;
  if (estado.maior === null || duracao > estado.maior) estado.maior = duracao;
  if (duracao > LIMIAR_LENTO_MS) estado.acima50 += 1;
  if (duracao > LIMIAR_TRAVADA_MS) estado.acima250 += 1;
  return estado;
}

/**
 * Leitura do estado incremental com os mesmos nomes de `resumirQuadros`
 * (menos mediana e p95). Aloca um objeto pequeno — é chamada pelo painel a
 * cada poucos segundos, nunca por quadro.
 */
export function lerIncremental(estado) {
  return {
    quadros: estado.quadros,
    ignorados: estado.ignorados,
    descartados: estado.descartados,
    duracaoSessaoMs: estado.duracaoSessaoMs,
    maior: estado.maior,
    pctAcima50: estado.quadros === 0 ? null : (estado.acima50 / estado.quadros) * 100,
    acima250: estado.acima250,
  };
}

// Formatação fixa (vírgula decimal) — não depende do locale do aparelho, então
// dois resumos de celulares diferentes ficam comparáveis linha a linha.
const decimal = (valor, casas = 1) =>
  valor === null || valor === undefined ? '—' : valor.toFixed(casas).replace('.', ',');

function duracaoLegivel(ms) {
  const segundos = Math.floor(ms / 1000);
  const min = Math.floor(segundos / 60);
  const s = segundos % 60;
  return min > 0 ? `${min} min ${s} s` : `${s} s`;
}

/**
 * Texto de resumo pronto para copiar e colar em docs/TESTES_COM_CRIANCAS.md.
 * `render` e `tela` são opcionais: linha ausente é omitida, nunca inventada.
 */
export function textoResumo(resumo, { render, tela, quando } = {}) {
  const linhas = ['ÓRBI — medição de desempenho'];
  if (quando) linhas.push(`quando: ${quando}`);
  linhas.push(
    `sessão: ${duracaoLegivel(resumo.duracaoSessaoMs)} ` +
      `(aquecimento de ${AQUECIMENTO_MS / 1000} s: ${resumo.ignorados} quadros ignorados)`
  );
  linhas.push(`quadros medidos: ${resumo.quadros}`);
  linhas.push(
    `mediana: ${decimal(resumo.mediana)} ms · p95: ${decimal(resumo.p95)} ms · ` +
      `maior: ${decimal(resumo.maior)} ms`
  );
  linhas.push(
    `acima de ${LIMIAR_LENTO_MS} ms: ${decimal(resumo.pctAcima50)}% · ` +
      `acima de ${LIMIAR_TRAVADA_MS} ms: ${resumo.acima250}`
  );
  if (resumo.descartados > 0) linhas.push(`valores inválidos descartados: ${resumo.descartados}`);
  if (render) {
    linhas.push(
      `render: ${render.chamadas} chamadas · ${render.triangulos} triângulos · ` +
        `${render.geometrias} geometrias · ${render.texturas} texturas`
    );
  }
  if (tela) linhas.push(`tela: ${tela.largura}×${tela.altura} · DPR ${decimal(tela.dpr, 2)}`);
  return linhas.join('\n');
}
