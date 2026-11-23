/**
 * DESVIO VISUAL DO BALÃO DA CARONA — geometria pura, sem React nem DOM.
 *
 * O balão "🐶 PARQUE?" vive no mundo 3D sobre o cachorrinho (`Carona.jsx`) e
 * fica sempre ABAIXO do HUD (`ZINDEX_BALAO_MUNDO`). Quando a câmera enquadra o
 * cão perto das bordas — por exemplo perto da PIZZA, sob a engrenagem e o sol —
 * o balão passaria por trás dos botões.
 *
 * Esta função calcula apenas o deslocamento visual `(dx, dy)` do balão para
 * sair da frente dos controles do HUD, preservando a posição do cachorro e da
 * área de embarque no mundo.
 */

export const SELETORES_CONTROLES_HUD = [
  '.sensory-trigger--game',
  '.ceu-btn',
  '.cad-btn',
  '.repetir-btn--hud',
  '.hud',
  '.mission-banner',
  '.adv-topo',
  '.tc-btn',
].join(', ');

const FOLGA_PADRAO = 8;
const MARGEM_BORDA_PADRAO = 8;

function clamp(valor, min, max) {
  if (max < min) return min;
  return Math.max(min, Math.min(max, valor));
}

function expandirRetangulo(rect, folga) {
  return {
    left: rect.left - folga,
    top: rect.top - folga,
    right: rect.right + folga,
    bottom: rect.bottom + folga,
  };
}

function intersecta(a, b) {
  return (
    a.left < b.right &&
    a.right > b.left &&
    a.top < b.bottom &&
    a.bottom > b.top
  );
}

function retanguloDoBalao(left, top, width, height) {
  return {
    left,
    top,
    right: left + width,
    bottom: top + height,
  };
}

function distanciaQuad(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

/**
 * Calcula o menor deslocamento visual `(dx, dy)` em pixels para que o balão
 * centrado em `(x, y)` com tamanho `(width, height)` não se sobreponha aos
 * obstáculos do HUD dentro do viewport.
 *
 * @param {{ x: number, y: number, width: number, height: number }} balao
 * @param {Array<{ left: number, top: number, right: number, bottom: number }>} obstaculos
 * @param {{ width: number, height: number }} viewport
 * @param {{ folga?: number, margemBorda?: number }} [opcoes]
 * @returns {{ dx: number, dy: number, desviado: boolean }}
 */
export function calcularDesvioBalao(
  balao,
  obstaculos,
  viewport,
  { folga = FOLGA_PADRAO, margemBorda = MARGEM_BORDA_PADRAO } = {}
) {
  if (
    !balao ||
    !viewport ||
    balao.width <= 0 ||
    balao.height <= 0 ||
    viewport.width <= 0 ||
    viewport.height <= 0
  ) {
    return { dx: 0, dy: 0, desviado: false };
  }

  const naturalLeft = balao.x - balao.width / 2;
  const naturalTop = balao.y - balao.height / 2;
  const naturalRect = retanguloDoBalao(
    naturalLeft,
    naturalTop,
    balao.width,
    balao.height
  );

  // Fora da tela visível: não há o que desviar.
  if (
    naturalRect.right <= 0 ||
    naturalRect.left >= viewport.width ||
    naturalRect.bottom <= 0 ||
    naturalRect.top >= viewport.height
  ) {
    return { dx: 0, dy: 0, desviado: false };
  }

  const validos = (obstaculos || [])
    .filter(
      (r) =>
        r &&
        Number.isFinite(r.left) &&
        Number.isFinite(r.top) &&
        Number.isFinite(r.right) &&
        Number.isFinite(r.bottom) &&
        r.right > r.left &&
        r.bottom > r.top
    )
    .map((r) => expandirRetangulo(r, folga));

  const atingidos = validos.filter((obs) => intersecta(naturalRect, obs));
  if (atingidos.length === 0) {
    return { dx: 0, dy: 0, desviado: false };
  }

  const minLeft = margemBorda;
  const maxLeft = Math.max(margemBorda, viewport.width - margemBorda - balao.width);
  const minTop = margemBorda;
  const maxTop = Math.max(margemBorda, viewport.height - margemBorda - balao.height);

  // Coletamos candidatos em volta de cada obstáculo atingido e também do bloco
  // unido dos obstáculos próximos (ex.: engrenagem + sol + caderninho).
  const grupo = {
    left: Math.min(...atingidos.map((r) => r.left)),
    top: Math.min(...atingidos.map((r) => r.top)),
    right: Math.max(...atingidos.map((r) => r.right)),
    bottom: Math.max(...atingidos.map((r) => r.bottom)),
  };

  // Também expande o grupo para incluir outros controles encostados na mesma
  // faixa (ex.: sol ao lado da engrenagem ou 🔊 abaixo do caderninho).
  const grupoExpandido = { ...grupo };
  let cresceu = true;
  while (cresceu) {
    cresceu = false;
    for (const obs of validos) {
      if (intersecta(grupoExpandido, expandirRetangulo(obs, folga))) {
        const novoLeft = Math.min(grupoExpandido.left, obs.left);
        const novoTop = Math.min(grupoExpandido.top, obs.top);
        const novoRight = Math.max(grupoExpandido.right, obs.right);
        const novoBottom = Math.max(grupoExpandido.bottom, obs.bottom);
        if (
          novoLeft !== grupoExpandido.left ||
          novoTop !== grupoExpandido.top ||
          novoRight !== grupoExpandido.right ||
          novoBottom !== grupoExpandido.bottom
        ) {
          grupoExpandido.left = novoLeft;
          grupoExpandido.top = novoTop;
          grupoExpandido.right = novoRight;
          grupoExpandido.bottom = novoBottom;
          cresceu = true;
        }
      }
    }
  }

  const referencias = [...atingidos, grupo, grupoExpandido];
  const candidatos = [];
  const adicionar = (left, top) => {
    candidatos.push({
      left: clamp(left, minLeft, maxLeft),
      top: clamp(top, minTop, maxTop),
    });
  };

  const baseLeft = clamp(naturalLeft, minLeft, maxLeft);
  const baseTop = clamp(naturalTop, minTop, maxTop);

  for (const ref of referencias) {
    // 1 eixo (movimento mais contínuo na aproximação e saída da curva)
    adicionar(baseLeft, ref.bottom);
    adicionar(ref.left - balao.width, baseTop);
    adicionar(ref.right, baseTop);
    adicionar(baseLeft, ref.top - balao.height);

    // 2 eixos (quando a faixa do topo e a coluna da direita bloqueiam juntas)
    adicionar(ref.left - balao.width, ref.bottom);
    adicionar(ref.right, ref.bottom);
    adicionar(ref.left - balao.width, ref.top - balao.height);
    adicionar(ref.right, ref.top - balao.height);
  }

  let melhorLivre = null;
  let melhorLivreDist = Infinity;

  let melhorFallback = null;
  let menorAreaSobreposicao = Infinity;
  let melhorFallbackDist = Infinity;

  for (const cand of candidatos) {
    const rect = retanguloDoBalao(cand.left, cand.top, balao.width, balao.height);
    let areaOverlap = 0;
    for (const obs of validos) {
      if (intersecta(rect, obs)) {
        const w = Math.min(rect.right, obs.right) - Math.max(rect.left, obs.left);
        const h = Math.min(rect.bottom, obs.bottom) - Math.max(rect.top, obs.top);
        areaOverlap += w * h;
      }
    }

    const dist = distanciaQuad(cand.left, cand.top, naturalLeft, naturalTop);
    if (areaOverlap === 0) {
      if (dist < melhorLivreDist) {
        melhorLivreDist = dist;
        melhorLivre = cand;
      }
    } else if (
      areaOverlap < menorAreaSobreposicao ||
      (areaOverlap === menorAreaSobreposicao && dist < melhorFallbackDist)
    ) {
      menorAreaSobreposicao = areaOverlap;
      melhorFallbackDist = dist;
      melhorFallback = cand;
    }
  }

  const escolhido = melhorLivre || melhorFallback;
  if (!escolhido) {
    return { dx: 0, dy: 0, desviado: false };
  }

  const dx = escolhido.left - naturalLeft;
  const dy = escolhido.top - naturalTop;
  return {
    dx,
    dy,
    desviado: Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5,
  };
}
