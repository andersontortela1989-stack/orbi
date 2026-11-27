
/**
 * PILOTO DA ESQUINA (PADARIA + MERCADO) em `?estilo=real` — 19/11/2026.
 *
 * Direção: maquete isométrica de bairro brasileiro, com luz quente, vitrines
 * com profundidade e materiais reconhecíveis, mantendo a identidade do estilo
 * padrão (pão no telhado da PADARIA; MERCADO amarelo com o verde de mercado).
 * Mesma câmera, mesmo trajeto, mesmos colisores: só o DESENHO muda, e todo
 * este código chega num pacote carregado sob demanda (EsquinaReal.jsx).
 *
 * Técnica escolhida pelo resultado na câmera do jogo e pelo custo no celular:
 * geometria simples mesclada com cor por vértice (sem textura), vitrines
 * rebaixadas na parede (profundidade de verdade, dentro do colisor), luz
 * interna sem iluminação (estável) e sombras simuladas em planos escuros
 * translúcidos — sem shadow map, sem pós-processamento.
 *
 * Peça: { id, zona, camada, forma: 'caixa'|'cilindro'|'esfera', pos, tam |
 * raio/comprimento/lados/aneis, rot?, esc?, cor }, em coordenadas do LOTE
 * (x/z do centro do prédio, y do chão). A câmera vê as faces +Z e +X.
 * Zonas e camadas: ver tests/esquina-real.test.js.
 *
 * FÁBRICA SEM IMPORTS: este módulo chega no pacote do piloto, e um pacote
 * que importasse three ou o estado do jogo faria o pacote do jogo exportar
 * nomes a mais — o que custa bytes ao pacote INICIAL (o `import()` do jogo
 * ganha um `.then`). Por isso as dependências entram por parâmetro: só as
 * classes do three e os dados que o jogo já usa.
 *
 * As cores entram propriedade por propriedade (Game.jsx): passar os objetos
 * inteiros (PALETA3D, TINTAS) impediria o empacotador de descartar as cores
 * sem uso, e o pacote inicial — onde a paleta mora — cresceria.
 */
export function criarEsquina({ THREE, PALETA3D, TINTAS, SOMBRA_SOLIDA, LOTES, SLUGS_ESQUINA }) {
  // Toldo e beiral: acima do carro (cabine e enfeite até ~1,7) com folga.
  const ALTURA_LIVRE_TOLDO = 2.6;
  // O toldo projeta no máximo isto além da fachada: a câmera desce ~1,13 de
  // altura por unidade de profundidade, e toldo fundo esconde a entrada.
  const PROJECAO_TOLDO = 1.0;

  const PISO = 0.16; // topo da calçada (o mesmo do lote do Building)
  const CALCADA = 2.2; // por lado (CALCADA_POR_LADO)
  const MEIO_FIO = Object.freeze({ largura: 0.3, altura: 0.24 });
  const TRACO = 0.12; // contorno fino escuro (o Building usa 0,2)

  // Rodas do carro, em coordenadas locais (Car.jsx: CAR_W 1,8; WHEEL_T 0,3;
  // CAR_L 3,5; eixos a ±CAR_L/3) — para a mancha de contato dos pneus.
  const RODAS_DO_CARRO = Object.freeze(
    [1, -1].flatMap((sx) => [1, -1].map((sz) => Object.freeze([sx * (0.9 + 0.15), sz * (3.5 / 3)])))
  );

  // Mancha de contato sob os pneus. Altura própria na pilha do chão: acima
  // do asfalto (0,032, RoadNetwork) e do blob do carro (0,045, Cenario) — a
  // 0,03 ela ficava DEBAIXO do asfalto e não aparecia. Opacidade: somada ao
  // blob, ainda bem longe do preto.
  const CONTATO = Object.freeze({ y: 0.05, opacidade: 0.38 });

  const COR = Object.freeze({
    calcada: PALETA3D.calcada.toLowerCase(),
    junta: '#cbc3df',
    meioFio: '#b9b0d1',
    rebaixo: '#a9a0c4',
    rebaixoPiso: '#d6cfe6',
    contorno: PALETA3D.contorno,
    moldura: TINTAS.violetDeep,
    madeira: '#a9784e',
    madeiraEscura: '#7a5233',
    prateleira: '#b98a5a',
    porta: '#8a5a3a',
    pedra: '#ddd5c8', // soleira das portas
    forro: '#8f6440', // laterais do recuo das vitrines: a profundidade aparece
    luzPadaria: '#ffd9a0', // vitrine acesa, quente
    luzMercado: '#ffe7b0',
    miolo: '#e8c07a', // corte do pão: o miolo claro aparece
    laranja: '#f28c28',
    maca: '#d9443a',
    vaso: '#b5653e',
  });

  const caixa = (id, zona, pos, tam, cor, extra = {}) => ({ id, zona, camada: 'opaco', forma: 'caixa', pos, tam, cor, ...extra });

  /** Casca do contorno (pelo avesso) de uma peça alta: TRACO maior por lado. */
  function contorno(peca) {
    const casca = { ...peca, id: `contorno-${peca.id}`, camada: 'contorno', cor: COR.contorno };
    if (peca.forma === 'caixa') casca.tam = peca.tam.map((v) => v + 2 * TRACO);
    else if (peca.forma === 'esfera') casca.esc = (peca.esc ?? [1, 1, 1]).map((v) => v + TRACO / peca.raio);
    return casca;
  }

  /**
   * Parede rasa com vãos (vitrine, porta, nicho): decompõe em caixas, faixa a
   * faixa de altura. `eixo` 'z' = fachada da frente (comprimento em x), 'x' =
   * lateral (comprimento em z). `p0`–`p1`: a espessura (do fundo dos vãos até
   * a face da parede). `faixas`: [{ y0, y1, cor, id }] (rodapé e corpo).
   */
  function paredeComVaos({ eixo, a0, a1, p0, p1, faixas, vaos }) {
    const pecas = [];
    const eps = 1e-6;
    for (const faixa of faixas) {
      const cortes = [faixa.y0, faixa.y1, ...vaos.flatMap((v) => [v.y0, v.y1])]
        .filter((y) => y >= faixa.y0 - eps && y <= faixa.y1 + eps);
      const ys = [...new Set(cortes.map((y) => +y.toFixed(4)))].sort((a, b) => a - b);
      for (let k = 0; k < ys.length - 1; k += 1) {
        const [y0, y1] = [ys[k], ys[k + 1]];
        if (y1 - y0 < eps) continue;
        const ativos = vaos.filter((v) => v.y0 < y1 - eps && v.y1 > y0 + eps).sort((a, b) => a.a0 - b.a0);
        const trechos = [];
        let cursor = a0;
        for (const v of ativos) {
          if (v.a0 > cursor + eps) trechos.push([cursor, v.a0]);
          cursor = Math.max(cursor, v.a1);
        }
        if (cursor < a1 - eps) trechos.push([cursor, a1]);
        trechos.forEach(([t0, t1], i) => {
          const ca = (t0 + t1) / 2;
          const cp = (p0 + p1) / 2;
          const pos = eixo === 'z' ? [ca, (y0 + y1) / 2, cp] : [cp, (y0 + y1) / 2, ca];
          const tam = eixo === 'z' ? [t1 - t0, y1 - y0, p1 - p0] : [p1 - p0, y1 - y0, t1 - t0];
          pecas.push(caixa(`${faixa.id}-${k + 1}-${i + 1}`, 'corpo', pos, tam, faixa.cor));
        });
      }
    }
    return pecas;
  }

  /** Converte [ao longo da parede, altura, profundidade] para x/y/z do lote. */
  const naFace = (eixo) => (a, y, p) => (eixo === 'z' ? [a, y, p] : [p, y, a]);
  const tamNaFace = (eixo) => (ta, ty, tp) => (eixo === 'z' ? [ta, ty, tp] : [tp, ty, ta]);

  /**
   * Moldura escura em volta de um vão, na face da parede (face = p da face),
   * e o peitoril. `prefixo` dá os ids (moldura-frente-1-cima...).
   */
  function moldura(prefixo, eixo, face, { a0, a1, y0, y1 }, { peitoril = true } = {}) {
    const P = naFace(eixo);
    const T = tamNaFace(eixo);
    const e = 0.12; // largura da moldura
    const ca = (a0 + a1) / 2;
    const largura = a1 - a0;
    const pecas = [
      caixa(`${prefixo}-cima`, 'fachada', P(ca, y1 + e / 2, face + 0.03), T(largura + 2 * e, e, 0.06), COR.moldura),
      caixa(`${prefixo}-esquerda`, 'fachada', P(a0 - e / 2, (y0 + y1) / 2, face + 0.03), T(e, y1 - y0, 0.06), COR.moldura),
      caixa(`${prefixo}-direita`, 'fachada', P(a1 + e / 2, (y0 + y1) / 2, face + 0.03), T(e, y1 - y0, 0.06), COR.moldura),
    ];
    if (peitoril) {
      pecas.push(caixa(`${prefixo}-peitoril`, 'fachada', P(ca, y0 - 0.05, face + 0.05), T(largura + 2 * e, 0.1, 0.14), COR.moldura));
    }
    return pecas;
  }

  /**
   * Laterais de um vão rebaixado (as faces que mostram a fundura), do fundo
   * do vão até a face da parede, numa cor diferente da parede: sem isso o
   * recuo some na câmera do jogo, que olha de cima.
   */
  function recuo(prefixo, eixo, fundo, face, { a0, a1, y0, y1 }, cor) {
    const P = naFace(eixo);
    const T = tamNaFace(eixo);
    const e = 0.06;
    const cp = (fundo + face) / 2;
    return [
      caixa(`${prefixo}-esquerda`, 'corpo', P(a0 + e / 2, (y0 + y1) / 2, cp), T(e, y1 - y0, face - fundo), cor),
      caixa(`${prefixo}-direita`, 'corpo', P(a1 - e / 2, (y0 + y1) / 2, cp), T(e, y1 - y0, face - fundo), cor),
    ];
  }

  /** Soleira de pedra no piso de uma porta da frente, um pouco para fora. */
  function soleira(id, fundo, face, { a0, a1 }) {
    const fora = 0.2; // dentro de LIMITE_FACHADA
    return caixa(id, 'fachada', [(a0 + a1) / 2, PISO + 0.03, (fundo + face + fora) / 2], [a1 - a0 + 0.2, 0.06, face + fora - fundo], COR.pedra);
  }

  /**
   * Pão GRANDE de vitrine (elipsoide deitado): legível no celular. 8 lados
   * (eram 10): os 9 pães custavam 180 triângulos a mais e a PADARIA passava
   * da regra 7 do estilo real (3.000 por lugar).
   */
  const PAO_VITRINE = Object.freeze({ raio: 0.32, esc: Object.freeze([1.45, 0.8, 0.85]) });
  const paoDeVitrine = (id, pos, cor, rotY = 0) => ({
    id, zona: 'corpo', camada: 'opaco', forma: 'esfera', pos, raio: PAO_VITRINE.raio, esc: [...PAO_VITRINE.esc],
    lados: 8, aneis: 6, rot: [0, rotY, 0], cor,
  });

  /**
   * Vitrine rebaixada com luz interna estável: o fundo aceso fica no fundo do
   * vão (camada brilho); laterais forradas (a fundura aparece); prateleiras
   * (alturas `prateleiras`, a partir da base do vão) e itens entre o fundo e a
   * face da parede — dentro da pegada, longe do carro.
   */
  function vitrine({ prefixo, eixo, fundo, face, vao, luz, itens, prateleiras }) {
    const P = naFace(eixo);
    const T = tamNaFace(eixo);
    const { a0, a1, y0, y1 } = vao;
    const ca = (a0 + a1) / 2;
    const largura = a1 - a0;
    const meio = (fundo + face) / 2;
    const pecas = [
      { ...caixa(`vitrine-${prefixo}`, 'corpo', P(ca, (y0 + y1) / 2, fundo + 0.02), T(largura, y1 - y0, 0.04), luz), camada: 'brilho' },
      ...recuo(`forro-${prefixo}`, eixo, fundo, face, vao, COR.forro),
    ];
    prateleiras.forEach((dy, k) => {
      const y = y0 + dy;
      pecas.push(caixa(`prateleira-${prefixo}-${k + 1}`, 'corpo', P(ca, y, meio), T(largura - 0.06, 0.06, face - fundo - 0.06), COR.prateleira));
      pecas.push(...itens(y + 0.03, k, P, ca, largura, meio));
    });
    return pecas;
  }

  // ------------------------------------------------------------- calçada

  /**
   * Calçada do lote com meio-fio de espessura, juntas discretas nas faixas que
   * a câmera vê (+Z e +X) e, se houver, o rebaixo alinhado à porta.
   */
  function calcada(w, l, { rebaixo } = {}) {
    const fx = w / 2 + CALCADA;
    const fz = l / 2 + CALCADA;
    const { largura: mf, altura: hm } = MEIO_FIO;
    const pecas = [caixa('calcada', 'chao', [0, PISO / 2, 0], [2 * fx, PISO, 2 * fz], COR.calcada)];
    // meio-fio: a frente (do lado da rua no MERCADO) abre no rebaixo
    const frente = rebaixo
      ? [[-fx, rebaixo.x - rebaixo.largura / 2], [rebaixo.x + rebaixo.largura / 2, fx]]
      : [[-fx, fx]];
    frente.forEach(([a, b], i) =>
      pecas.push(caixa(`meio-fio-frente-${i + 1}`, 'chao', [(a + b) / 2, hm / 2, fz - mf / 2], [b - a, hm, mf], COR.meioFio))
    );
    pecas.push(
      caixa('meio-fio-fundo', 'chao', [0, hm / 2, -fz + mf / 2], [2 * fx, hm, mf], COR.meioFio),
      caixa('meio-fio-esquerda', 'chao', [-fx + mf / 2, hm / 2, 0], [mf, hm, 2 * fz - 2 * mf], COR.meioFio),
      caixa('meio-fio-direita', 'chao', [fx - mf / 2, hm / 2, 0], [mf, hm, 2 * fz - 2 * mf], COR.meioFio)
    );
    if (rebaixo) {
      // meio-fio rebaixado (mais baixo que o piso) e o piso inclinado à frente
      // da porta: o "onde estacionar" da entrada
      pecas.push(
        caixa('rebaixo', 'chao', [rebaixo.x, 0.05, fz - mf / 2], [rebaixo.largura, 0.1, mf], COR.rebaixo),
        caixa('rebaixo-rampa', 'chao', [rebaixo.x, PISO - 0.03, fz - mf - 0.45], [rebaixo.largura, 0.06, 0.9], COR.rebaixoPiso, { rot: [-0.12, 0, 0] })
      );
    }
    // juntas: faixas visíveis da calçada (frente e lado), a cada 1,5
    const largura = CALCADA - mf;
    const juntas = [];
    for (let x = -fx + 1.5; x < fx - 0.5; x += 1.5) {
      juntas.push(caixa(`junta-frente-${juntas.length + 1}`, 'chao', [x, PISO + 0.004, l / 2 + largura / 2], [0.05, 0.012, largura], COR.junta));
    }
    for (let z = -fz + 1.5; z < l / 2; z += 1.5) {
      juntas.push(caixa(`junta-lado-${juntas.length + 1}`, 'chao', [w / 2 + largura / 2, PISO + 0.004, z], [largura, 0.012, 0.05], COR.junta));
    }
    juntas.push(
      caixa('junta-frente-meio', 'chao', [0, PISO + 0.004, l / 2 + largura / 2], [2 * fx - 2 * mf, 0.012, 0.05], COR.junta),
      caixa('junta-lado-meio', 'chao', [w / 2 + largura / 2, PISO + 0.004, 0], [0.05, 0.012, 2 * fz - 2 * mf], COR.junta)
    );
    return [...pecas, ...juntas];
  }

  /** Sombra do prédio no piso, no mesmo desvio da sombra sólida da cidade. */
  const sombraDoPredio = (w, l) => ({
    ...caixa('sombra-predio', 'chao', [SOMBRA_SOLIDA.dx, PISO + 0.01, SOMBRA_SOLIDA.dz], [w + 0.5, 0.01, l + 0.5], SOMBRA_SOLIDA.cor),
    camada: 'sombra',
  });

  /** Contorno do volume: cresce para os lados e para cima, nunca para baixo. */
  const contornoDoCorpo = (w, h, l) => ({
    ...caixa('contorno-corpo', 'fachada', [0, h / 2, 0], [w + 2 * TRACO, h, l + 2 * TRACO], COR.contorno),
    camada: 'contorno',
  });

  // ------------------------------------------------------------- PADARIA

  // Profundidade das vitrines e da porta. Acabamento (20/11): de 0,4 para
  // 0,8 — com 0,4 o recuo não aparecia na câmera do jogo, que olha de cima.
  const REC_PADARIA = 0.8;
  // Vitrines altas (2,85 de vão, antes 1,7): menos parede acima delas; a
  // placa sobe para a faixa entre as vitrines e o beiral.
  const VAOS_PADARIA_FRENTE = Object.freeze([
    Object.freeze({ id: 'frente-1', a0: -5.0, a1: -1.6, y0: 0.6, y1: 3.45 }),
    Object.freeze({ id: 'porta', a0: -0.9, a1: 0.9, y0: 0, y1: 2.7 }),
    Object.freeze({ id: 'frente-2', a0: 1.6, a1: 5.0, y0: 0.6, y1: 3.45 }),
  ]);
  const VAO_PADARIA_LADO = Object.freeze({ id: 'lado', a0: -2.4, a1: 2.4, y0: 0.6, y1: 3.45 });
  const PLACA_PADARIA_Y = 4.5; // centro da placa (e do letreiro)
  // uma prateleira só, baixa: a câmera vê o fundo do vão até ~0,9 abaixo do
  // alto da vitrine (o resto fica atrás da verga)
  const PRATELEIRA_PADARIA = [0.6];

  function paesDaPrateleira(prefixo, eixo) {
    // 3 pães grandes; o comprimento corre ao longo da vitrine (na lateral, gira 90°)
    const giro = eixo === 'x' ? Math.PI / 2 : 0;
    const altura = PAO_VITRINE.raio * PAO_VITRINE.esc[1];
    return (y, k, P, ca, largura, meio) =>
      [-1, 0, 1].map((n, i) =>
        paoDeVitrine(`pao-vitrine-${prefixo}-${i + 1}`, P(ca + n * (largura / 2 - 0.6), y + altura, meio), i % 2 ? PALETA3D.pao.lateral : PALETA3D.pao.casca, giro)
      );
  }

  /** Pão grande do telhado: elipsoide com volume, 3 cortes, contorno e sombra. */
  function paoDoTelhado(h) {
    const topo = h + 0.54; // superfície do telhado
    const centro = [0.3, topo + 0.85, -0.4];
    const giro = 0.55; // na diagonal: lido de longe, como no estilo padrão
    const esc = [3.0, 1.35, 1.4]; // alto: a câmera vê o volume, não só o topo
    const pao = {
      id: 'pao-telhado', zona: 'telhado', camada: 'opaco', forma: 'esfera', pos: centro, raio: 1, esc,
      lados: 18, aneis: 10, rot: [0, giro, 0], cor: PALETA3D.pao.casca,
    };
    const cortes = [-1.45, 0, 1.45].map((a, i) => {
      const yTopo = esc[1] * Math.sqrt(1 - (a / esc[0]) ** 2);
      // ponto do eixo do pão girado em torno de Y (x' = x·cos + z·sen; z' = −x·sen + z·cos)
      const pos = [centro[0] + a * Math.cos(giro), centro[1] + yTopo - 0.05, centro[2] - a * Math.sin(giro)];
      return {
        id: `pao-corte-${i + 1}`, zona: 'telhado', camada: 'opaco', forma: 'esfera', pos, raio: 1, esc: [0.22, 0.12, 1.05],
        lados: 10, aneis: 6, rot: [0, giro + 0.5, 0], cor: COR.miolo,
      };
    });
    // contorno: mais largo dos lados e para cima, apoiado no telhado
    const casca = {
      ...pao, id: 'contorno-pao-telhado', camada: 'contorno', cor: COR.contorno,
      pos: [centro[0], centro[1] + 0.05, centro[2]], esc: [esc[0] + 0.1, esc[1] + 0.05, esc[2] + 0.1],
    };
    const sombra = {
      ...pao, id: 'sombra-pao', camada: 'sombra', cor: SOMBRA_SOLIDA.cor, lados: 16, aneis: 4,
      pos: [centro[0] + SOMBRA_SOLIDA.dx, topo + 0.012, centro[2] + SOMBRA_SOLIDA.dz], esc: [esc[0], 0.01, esc[2]],
    };
    return [pao, ...cortes, casca, sombra];
  }

  /** Todas as peças da PADARIA para o lote [w, h, l]. */
  function pecasDaPadaria([w, h, l]) {
    const f = l / 2;
    const s = w / 2;
    const cor = PALETA3D.predios.PADARIA;
    const faixas = (lado) => [
      { id: `faixa-base-${lado}`, y0: 0, y1: 0.5, cor: TINTAS.sunDeep },
      { id: `corpo-${lado}`, y0: 0.5, y1: h, cor },
    ];
    const pecas = [
      ...calcada(w, l),
      sombraDoPredio(w, l),
      caixa('corpo', 'corpo', [-REC_PADARIA / 2, h / 2, -REC_PADARIA / 2], [w - REC_PADARIA, h, l - REC_PADARIA], cor),
      ...paredeComVaos({ eixo: 'z', a0: -s, a1: s, p0: f - REC_PADARIA, p1: f, faixas: faixas('frente'), vaos: VAOS_PADARIA_FRENTE }),
      ...paredeComVaos({ eixo: 'x', a0: -f, a1: f - REC_PADARIA, p0: s - REC_PADARIA, p1: s, faixas: faixas('lado'), vaos: [VAO_PADARIA_LADO] }),
      contornoDoCorpo(w, h, l),
    ];

    // vitrines: duas na frente, uma no lado (uma prateleira, pães grandes)
    for (const vao of VAOS_PADARIA_FRENTE.filter((v) => v.id !== 'porta')) {
      pecas.push(
        ...vitrine({ prefixo: vao.id, eixo: 'z', fundo: f - REC_PADARIA, face: f, vao, luz: COR.luzPadaria, itens: paesDaPrateleira(vao.id, 'z'), prateleiras: PRATELEIRA_PADARIA }),
        ...moldura(`moldura-${vao.id}`, 'z', f, vao)
      );
    }
    pecas.push(
      ...vitrine({ prefixo: 'lado', eixo: 'x', fundo: s - REC_PADARIA, face: s, vao: VAO_PADARIA_LADO, luz: COR.luzPadaria, itens: paesDaPrateleira('lado', 'x'), prateleiras: PRATELEIRA_PADARIA }),
      ...moldura('moldura-lado', 'x', s, VAO_PADARIA_LADO)
    );

    // porta de madeira no fundo do vão (recuo forrado de madeira escura e
    // soleira de pedra), com visor aceso e maçaneta à altura que a câmera vê
    const porta = VAOS_PADARIA_FRENTE.find((v) => v.id === 'porta');
    const zp = f - REC_PADARIA + 0.06;
    pecas.push(
      caixa('porta', 'corpo', [0, PISO + (porta.y1 - PISO) / 2, zp], [porta.a1 - porta.a0, porta.y1 - PISO, 0.08], COR.porta),
      { ...caixa('porta-visor', 'corpo', [0, 1.6, zp + 0.05], [0.9, 0.6, 0.02], COR.luzPadaria), camada: 'brilho' },
      caixa('porta-macaneta', 'corpo', [0.6, 1.1, zp + 0.06], [0.08, 0.2, 0.04], TINTAS.sunSoft),
      ...recuo('recuo-porta', 'z', f - REC_PADARIA, f, { ...porta, y0: PISO }, COR.madeiraEscura),
      soleira('soleira-porta', f - REC_PADARIA, f, porta),
      ...moldura('moldura-porta', 'z', f, porta, { peitoril: false })
    );

    // placa PADARIA acima das vitrines, sem cobri-las (texto em letreirosDaEsquina)
    pecas.push(
      caixa('placa-moldura', 'fachada', [0, PLACA_PADARIA_Y, f + 0.03], [6.8, 1.6, 0.06], COR.moldura),
      caixa('placa', 'fachada', [0, PLACA_PADARIA_Y, f + 0.1], [6.4, 1.2, 0.12], TINTAS.sunDeep)
    );

    // vasos de planta junto à porta (rentes à parede: dentro de LIMITE_FACHADA)
    [-1.35, 1.35].forEach((x, i) =>
      pecas.push(
        { id: `vaso-${i + 1}`, zona: 'fachada', camada: 'opaco', forma: 'cilindro', pos: [x, PISO + 0.2, f + 0.08], raio: 0.2, comprimento: 0.4, lados: 10, cor: COR.vaso },
        { id: `planta-${i + 1}`, zona: 'fachada', camada: 'opaco', forma: 'esfera', pos: [x, PISO + 0.58, f + 0.05], raio: 0.24, lados: 8, aneis: 5, cor: TINTAS.grassDeep }
      )
    );

    // telhado plano: beiral escuro, laje sol e o pão
    const beiral = caixa('beiral', 'alta', [0, h + 0.18, 0], [w + 0.5, 0.36, l + 0.5], COR.moldura);
    pecas.push(
      beiral,
      contorno(beiral),
      caixa('telhado', 'telhado', [0, h + 0.45, 0], [w * 0.82, 0.18, l * 0.82], TINTAS.sunDeep),
      ...paoDoTelhado(h)
    );
    return pecas;
  }

  // ------------------------------------------------------------- MERCADO

  // Acabamento (20/11): recuos mais fundos (entrada 0,85, vitrine 0,6), para
  // a profundidade aparecer na câmera do jogo.
  const REC_MERCADO_FRENTE = 0.85; // nichos das caixas e a entrada
  const REC_MERCADO_LADO = 0.6; // vitrine lateral
  const PORTA_MERCADO = Object.freeze({ x: 0, largura: 2.6 });
  const VAOS_MERCADO_FRENTE = Object.freeze([
    Object.freeze({ id: 'nicho-1', a0: -4.7, a1: -2.5, y0: 0, y1: 1.3 }),
    Object.freeze({ id: 'entrada', a0: -1.3, a1: 1.3, y0: 0, y1: 2.7 }),
    Object.freeze({ id: 'nicho-2', a0: 2.5, a1: 4.7, y0: 0, y1: 1.3 }),
  ]);
  // vitrine lateral alta (2,85 de vão, antes 1,8): menos parede acima dela
  const VAO_MERCADO_LADO = Object.freeze({ id: 'lado', a0: -3.4, a1: 2.0, y0: 0.6, y1: 3.45 });
  // base e uma prateleira; 4 produtos GRANDES em cada (antes, 14 pequenos que
  // viravam traços no celular), em cores fortes contra o fundo aceso
  const PRATELEIRAS_MERCADO = [0.05, 1.2];
  const CORES_PRODUTO = [TINTAS.coral, TINTAS.blue, TINTAS.violet, TINTAS.grassDeep];

  function produtos(y, k, P, ca, largura, meio) {
    return Array.from({ length: 4 }, (_, i) => {
      const a = ca - largura / 2 + 0.75 + i * ((largura - 1.5) / 3);
      const alto = (i + k) % 2 === 0 ? 0.72 : 0.55;
      return caixa(`produto-${k + 1}-${i + 1}`, 'corpo', P(a, y + alto / 2, meio), [0.4, alto, 0.6], CORES_PRODUTO[(i + k) % CORES_PRODUTO.length]);
    });
  }

  /** Caixa de fruta de madeira, num nicho da fachada, com 2 fileiras de frutas. */
  function caixaDeFruta(n, x, f, cor) {
    const z = f - 0.34; // rente à fachada, dentro da pegada
    const pecas = [
      caixa(`caixa-fruta-${n}`, 'corpo', [x, PISO + 0.21, z], [1.6, 0.42, 0.56], COR.madeira),
      caixa(`caixa-fruta-${n}-ripa-1`, 'corpo', [x, PISO + 0.12, z + 0.285], [1.6, 0.05, 0.03], COR.madeiraEscura),
      caixa(`caixa-fruta-${n}-ripa-2`, 'corpo', [x, PISO + 0.3, z + 0.285], [1.6, 0.05, 0.03], COR.madeiraEscura),
    ];
    [-0.57, -0.19, 0.19, 0.57].forEach((dx, i) =>
      [-0.14, 0.14].forEach((dz, j) =>
        pecas.push({
          id: `fruta-${n}-${i * 2 + j + 1}`, zona: 'corpo', camada: 'opaco', forma: 'esfera',
          pos: [x + dx, PISO + 0.5, z + dz], raio: 0.12, lados: 7, aneis: 5, cor,
        })
      )
    );
    return pecas;
  }

  /**
   * Toldo curto listrado (verde-escuro e branco) acima da entrada e a faixa
   * de sombra dele na parede. `topoEntrada`: { a0, a1, topo } do vão da
   * entrada com a moldura.
   */
  function toldo(f, topoEntrada) {
    const alto = 3.35; // onde encosta na fachada (a moldura da placa começa em 3,4)
    // curto e alto: conferido na câmera, 0,85 de fundo e a borda a 2,88
    // escondiam o alto da entrada (1/4 das amostras da porta, pelo contorno
    // da sanefa); com 0,65 e a borda a 3,15 a entrada fica à vista
    const baixo = 3.15; // borda da frente
    const fundo = 0.65;
    const largura = 4.0;
    const n = 8;
    const giro = Math.atan2(alto - baixo, fundo);
    const comprimento = Math.hypot(alto - baixo, fundo);
    const listra = largura / n;
    const pecas = [];
    for (let i = 0; i < n; i += 1) {
      const x = -largura / 2 + listra * (i + 0.5);
      const cor = i % 2 ? TINTAS.white : TINTAS.grassDeep;
      pecas.push(
        caixa(`toldo-${i + 1}`, 'alta', [x, (alto + baixo) / 2, f + fundo / 2], [listra, 0.06, comprimento], cor, { rot: [giro, 0, 0] }),
        caixa(`toldo-sanefa-${i + 1}`, 'alta', [x, baixo - 0.06, f + fundo + 0.01], [listra, 0.16, 0.04], cor)
      );
    }
    const inteiro = caixa('toldo', 'alta', [0, (alto + baixo) / 2, f + fundo / 2], [largura, 0.06, comprimento], TINTAS.grassDeep, { rot: [giro, 0, 0] });
    const sanefa = caixa('toldo-sanefa', 'alta', [0, baixo - 0.06, f + fundo + 0.01], [largura, 0.16, 0.04], TINTAS.grassDeep);
    // Faixa de sombra do toldo na parede, marcando a entrada (acabamento,
    // 20/11): uma faixa da largura do toldo logo abaixo dele, que desce dos
    // dois lados da entrada até 1,6 — a câmera olha de cima e o próprio
    // toldo esconde a parede até ~2,4 (conferido nos pixels). Rente à
    // parede, nunca na frente do vão (a sombra antiga flutuava diante da
    // porta e não aparecia).
    const parede = (id, x0, x1, y0, y1) => ({
      ...caixa(`sombra-toldo-parede-${id}`, 'fachada', [(x0 + x1) / 2, (y0 + y1) / 2, f + 0.03], [x1 - x0, y1 - y0, 0.01], SOMBRA_SOLIDA.cor),
      camada: 'sombra',
    });
    const meia = largura / 2;
    const vao = topoEntrada; // { a0, a1, topo } da entrada com a moldura
    return [
      ...pecas,
      contorno(inteiro),
      contorno(sanefa),
      parede('cima', -meia, meia, vao.topo + 0.03, alto - 0.05),
      parede('esquerda', -meia, vao.a0 - 0.03, 1.6, vao.topo + 0.03),
      parede('direita', vao.a1 + 0.03, meia, 1.6, vao.topo + 0.03),
      // e no piso, para o lado da sombra da cidade
      { ...caixa('sombra-toldo-piso', 'chao', [SOMBRA_SOLIDA.dx, PISO + 0.012, f + 0.75], [largura, 0.01, 1.1], SOMBRA_SOLIDA.cor), camada: 'sombra' },
    ];
  }

  /** Todas as peças do MERCADO para o lote [w, h, l]. */
  function pecasDoMercado([w, h, l]) {
    const f = l / 2;
    const s = w / 2;
    const cor = PALETA3D.predios.MERCADO;
    const faixas = (lado) => [
      { id: `faixa-base-${lado}`, y0: 0, y1: 0.6, cor: TINTAS.grass },
      { id: `corpo-${lado}`, y0: 0.6, y1: h, cor },
    ];
    const pecas = [
      ...calcada(w, l, { rebaixo: PORTA_MERCADO }),
      sombraDoPredio(w, l),
      caixa('corpo', 'corpo', [-REC_MERCADO_LADO / 2, h / 2, -REC_MERCADO_FRENTE / 2], [w - REC_MERCADO_LADO, h, l - REC_MERCADO_FRENTE], cor),
      ...paredeComVaos({ eixo: 'z', a0: -s, a1: s, p0: f - REC_MERCADO_FRENTE, p1: f, faixas: faixas('frente'), vaos: VAOS_MERCADO_FRENTE }),
      ...paredeComVaos({ eixo: 'x', a0: -f, a1: f - REC_MERCADO_FRENTE, p0: s - REC_MERCADO_LADO, p1: s, faixas: faixas('lado'), vaos: [VAO_MERCADO_LADO] }),
      contornoDoCorpo(w, h, l),
      // caixas de fruta nos nichos dos dois lados da entrada
      ...caixaDeFruta(1, -3.6, f, COR.laranja),
      ...caixaDeFruta(2, 3.6, f, COR.maca),
    ];

    // entrada iluminada no fundo do vão (recuo forrado escuro e soleira de
    // pedra), com montante e moldura; o vidro fica abaixo da altura livre
    const entrada = VAOS_MERCADO_FRENTE.find((v) => v.id === 'entrada');
    const ze = f - REC_MERCADO_FRENTE + 0.03;
    const vidro = { y0: PISO, y1: ALTURA_LIVRE_TOLDO - 0.02 };
    const vidroY = (vidro.y0 + vidro.y1) / 2;
    const vidroAltura = vidro.y1 - vidro.y0;
    pecas.push(
      { ...caixa('entrada-vidro', 'corpo', [PORTA_MERCADO.x, vidroY, ze], [PORTA_MERCADO.largura - 0.2, vidroAltura, 0.04], COR.luzMercado), camada: 'brilho' },
      caixa('entrada-montante', 'corpo', [PORTA_MERCADO.x, vidroY, ze + 0.04], [0.1, vidroAltura, 0.04], COR.moldura),
      caixa('entrada-travessa', 'corpo', [PORTA_MERCADO.x, PISO + 2.25, ze + 0.04], [PORTA_MERCADO.largura - 0.2, 0.1, 0.04], COR.moldura),
      ...recuo('recuo-entrada', 'z', f - REC_MERCADO_FRENTE, f, { ...entrada, y0: PISO }, COR.moldura),
      soleira('soleira-entrada', f - REC_MERCADO_FRENTE, f, entrada),
      ...moldura('moldura-entrada', 'z', f, entrada, { peitoril: false }),
      ...toldo(f, { a0: entrada.a0 - 0.12, a1: entrada.a1 + 0.12, topo: entrada.y1 + 0.12 })
    );

    // vitrine lateral (+X): base e uma prateleira de produtos grandes
    pecas.push(
      ...vitrine({ prefixo: 'lado', eixo: 'x', fundo: s - REC_MERCADO_LADO, face: s, vao: VAO_MERCADO_LADO, luz: COR.luzMercado, itens: produtos, prateleiras: PRATELEIRAS_MERCADO }),
      ...moldura('moldura-lado', 'x', s, VAO_MERCADO_LADO)
    );

    // placa MERCADO (texto em letreirosDaEsquina)
    pecas.push(
      caixa('placa-moldura', 'fachada', [0, 4.35, f + 0.03], [7.8, 1.9, 0.06], COR.moldura),
      caixa('placa', 'fachada', [0, 4.35, f + 0.1], [7.4, 1.5, 0.12], TINTAS.grassDeep)
    );

    // janelas altas acesas (frente e lado), como as do estilo padrão
    [-3.6, 3.6].forEach((x, i) => {
      pecas.push(
        caixa(`janela-alta-frente-${i + 1}-moldura`, 'fachada', [x, 6.4, f + 0.015], [4.5, 1.5, 0.03], COR.moldura),
        { ...caixa(`janela-alta-frente-${i + 1}`, 'fachada', [x, 6.4, f + 0.035], [4.2, 1.2, 0.03], COR.luzMercado), camada: 'brilho' },
        caixa(`janela-alta-frente-${i + 1}-montante`, 'fachada', [x, 6.4, f + 0.055], [0.08, 1.2, 0.02], COR.moldura)
      );
    });
    pecas.push(
      caixa('janela-alta-lado-moldura', 'fachada', [s + 0.015, 6.4, -1.5], [0.03, 1.5, 6.3], COR.moldura),
      { ...caixa('janela-alta-lado', 'fachada', [s + 0.035, 6.4, -1.5], [0.03, 1.2, 6.0], COR.luzMercado), camada: 'brilho' }
    );

    // telhado: beiral escuro e laje verde listrada (a identidade verde)
    const beiral = caixa('beiral', 'alta', [0, h + 0.2, 0], [w + 0.6, 0.4, l + 0.6], COR.moldura);
    pecas.push(beiral, contorno(beiral), caixa('telhado-verde', 'telhado', [0, h + 0.5, 0], [w * 0.78, 0.2, l * 0.78], TINTAS.grass));
    for (let i = 0; i < 6; i += 1) {
      const x = -w * 0.39 + 0.9 + i * ((w * 0.78 - 1.8) / 5);
      pecas.push(caixa(`telhado-verde-listra-${i + 1}`, 'telhado', [x, h + 0.61, 0], [0.14, 0.02, l * 0.78 - 0.4], TINTAS.grassDeep));
    }
    return pecas;
  }

  // ------------------------------------------------------------- montagem

  // LOTES: { PADARIA: { pos, size }, MERCADO: { pos, size } } (de bairros.js)
  const PREDIO = new Map(Object.entries(LOTES));
  const PECAS_DO_LUGAR = { PADARIA: pecasDaPadaria, MERCADO: pecasDoMercado };

  /** Letreiros (texto do troika), em coordenadas do MUNDO. */
  function letreirosDaEsquina() {
    const { pos: [px, pz], size: [, , lp] } = PREDIO.get('PADARIA');
    const { pos: [mx, mz], size: [, , lm] } = PREDIO.get('MERCADO');
    return [
      { slug: 'PADARIA', texto: 'PADARIA', posicao: [px, PLACA_PADARIA_Y, pz + lp / 2 + 0.17], tamanho: 0.95, cor: TINTAS.ink },
      { slug: 'MERCADO', texto: 'MERCADO', posicao: [mx, 4.35, mz + lm / 2 + 0.17], tamanho: 1.05, cor: TINTAS.white },
    ];
  }

  /** Todas as peças da esquina, em coordenadas do MUNDO. */
  function pecasDaEsquina() {
    return SLUGS_ESQUINA.flatMap((slug) => {
      const { pos: [x, z], size } = PREDIO.get(slug);
      return PECAS_DO_LUGAR[slug](size).map((p) => ({ ...p, id: `${slug}:${p.id}`, pos: [p.pos[0] + x, p.pos[1], p.pos[2] + z] }));
    });
  }

  /**
   * Mancha de contato sob cada pneu (coordenadas locais do carro): centrada
   * no pneu e mais larga que ele, para aparecer além da carroceria (a
   * câmera olha de cima e a carroceria cobre o pneu).
   */
  function pecasDoContato() {
    return RODAS_DO_CARRO.map(([x, z], i) => ({
      id: `contato-${i + 1}`, zona: 'chao', camada: 'sombra', forma: 'cilindro', pos: [x, 0, z],
      raio: 0.48, comprimento: 0.01, lados: 16, esc: [1, 1, 1.6], cor: SOMBRA_SOLIDA.cor,
    }));
  }

  // ---------------------------------------------------------- geometria

  // Variação sutil e ESTÁVEL por peça (±3% de brilho): tira a cara de cor
  // chapada sem textura e sem sorteio.
  function variacao(i) {
    const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    return 1 + ((x - Math.floor(x)) * 2 - 1) * 0.03;
  }

  const EIXO_PARA_Y = { y: new THREE.Euler(0, 0, 0), x: new THREE.Euler(0, 0, Math.PI / 2), z: new THREE.Euler(Math.PI / 2, 0, 0) };

  function geometriaDaPeca(peca) {
    if (peca.forma === 'caixa') return new THREE.BoxGeometry(...peca.tam);
    if (peca.forma === 'cilindro') {
      return new THREE.CylinderGeometry(peca.raio, peca.raio, peca.comprimento, peca.lados ?? 12)
        .applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(EIXO_PARA_Y[peca.eixo ?? 'y']));
    }
    if (peca.forma === 'esfera') return new THREE.SphereGeometry(peca.raio, peca.lados ?? 8, peca.aneis ?? 6);
    throw new TypeError(`Forma desconhecida: ${peca.forma}`);
  }

  function matrizDaPeca(peca) {
    return new THREE.Matrix4().compose(
      new THREE.Vector3(...peca.pos),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...(peca.rot ?? [0, 0, 0]))),
      new THREE.Vector3(...(peca.esc ?? [1, 1, 1]))
    );
  }

  /** Caixa alinhada aos eixos que envolve a peça (escala e giro inclusos). */
  function limitesDaPeca(peca) {
    const g = geometriaDaPeca(peca).applyMatrix4(matrizDaPeca(peca));
    g.computeBoundingBox();
    const { min, max } = g.boundingBox;
    g.dispose();
    return { min: [min.x, min.y, min.z], max: [max.x, max.y, max.z] };
  }

  /** Junta as peças numa malha só, com cor por vértice e escala por eixo. */
  function montarMalhaEsquina(pecas) {
    const partes = pecas.map((peca, i) => ({
      g: geometriaDaPeca(peca).applyMatrix4(matrizDaPeca(peca)),
      cor: new THREE.Color(peca.cor).multiplyScalar(variacao(i)),
    }));
    const nv = partes.reduce((s, { g }) => s + g.attributes.position.count, 0);
    const ni = partes.reduce((s, { g }) => s + g.index.count, 0);
    const posicoes = new Float32Array(nv * 3);
    const normais = new Float32Array(nv * 3);
    const cores = new Float32Array(nv * 3);
    const indices = new Uint32Array(ni);
    let v = 0;
    let k = 0;
    for (const { g, cor } of partes) {
      const n = g.attributes.position.count;
      posicoes.set(g.attributes.position.array, v * 3);
      normais.set(g.attributes.normal.array, v * 3);
      for (let i = 0; i < n; i += 1) cores.set([cor.r, cor.g, cor.b], (v + i) * 3);
      const idx = g.index.array;
      for (let i = 0; i < idx.length; i += 1) indices[k + i] = idx[i] + v;
      v += n;
      k += idx.length;
      g.dispose();
    }
    return { posicoes, normais, cores, indices, triangulos: ni / 3 };
  }

  /** BufferGeometry pronta para um <mesh> com cor por vértice. */
  function geometriaDe(malha) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(malha.posicoes, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(malha.normais, 3));
    g.setAttribute('color', new THREE.BufferAttribute(malha.cores, 3));
    g.setIndex(new THREE.BufferAttribute(malha.indices, 1));
    g.computeBoundingSphere();
    return g;
  }

  /** As 4 malhas da esquina (uma chamada de desenho cada), no mundo. */
  function malhasDaEsquina() {
    const pecas = pecasDaEsquina();
    const camada = (c) => montarMalhaEsquina(pecas.filter((p) => p.camada === c));
    return { opaco: camada('opaco'), brilho: camada('brilho'), contorno: camada('contorno'), sombra: camada('sombra') };
  }

  /** Chamadas e triângulos: 4 malhas, 2 letreiros (2 triângulos por letra) e o contato. */
  function orcamentoDaEsquina() {
    const malhas = Object.values(malhasDaEsquina());
    const letras = letreirosDaEsquina().reduce((s, t) => s + t.texto.length, 0);
    const contato = montarMalhaEsquina(pecasDoContato());
    return {
      chamadas: malhas.filter((m) => m.triangulos > 0).length + letreirosDaEsquina().length + 1,
      triangulos: malhas.reduce((s, m) => s + m.triangulos, 0) + letras * 2 + contato.triangulos,
    };
  }

  return {
    ALTURA_LIVRE_TOLDO,
    CONTATO,
    PROJECAO_TOLDO,
    RODAS_DO_CARRO,
    pecasDaPadaria,
    PORTA_MERCADO,
    pecasDoMercado,
    letreirosDaEsquina,
    pecasDaEsquina,
    pecasDoContato,
    limitesDaPeca,
    montarMalhaEsquina,
    malhasDaEsquina,
    orcamentoDaEsquina,
    geometriaDe,
  };
}
