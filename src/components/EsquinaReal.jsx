import { criarEsquina } from '../visual/esquina/esquina.js';

/**
 * PILOTO DA ESQUINA (PADARIA + MERCADO) — `?estilo=real`, 19/11/2026.
 *
 * Carregado SOB DEMANDA (Game.jsx: `lazy(() => import('./EsquinaReal.jsx'))`):
 * quem joga no estilo padrão não baixa este pacote. O desenho vem pronto de
 * visual/esquina/esquina.js (dado puro, testado); aqui só o desenho:
 *   - 4 malhas mescladas com cor por vértice: opaco, brilho (vitrines e
 *     janelas acesas, sem iluminação: luz estável), contorno e sombra
 *     simulada (planos escuros translúcidos);
 *   - 2 letreiros (PADARIA, MERCADO);
 *   - a mancha de contato sob os 4 pneus, que acompanha o carro (só LÊ a
 *     posição e o giro do corpo físico, como o BlobShadow).
 * Sem colisor (o colisor do lote fica na City, igual ao do Building), sem
 * shadow map, sem pós-processamento, nada animado. No Modo Tranquilo a luz
 * das vitrines só fica mais suave — e continua parada.
 *
 * PRIMEIRA APARIÇÃO SEM PICO (acabamento, 20/11/2026). Compilar antes não
 * basta: medido no navegador, o custo do primeiro uso (verificação dos
 * programas, envio da textura dos letreiros e a espera pela GPU que esse
 * envio provoca) cai no primeiro DESENHO da esquina — e, com a esquina fora
 * da câmera, esse desenho só acontece quando a criança chega à esquina.
 * Por isso, quando o pacote chega, a esquina monta ESCONDIDA:
 *   1. compileAsync dos materiais dela (com as luzes da cena);
 *   2. os 2 letreiros terminam de montar (onSync);
 *   3. um desenho de 1×1 pixel, mesmo fora da câmera, dentro do quadro e
 *      antes do desenho normal (que cobre esse pixel) — nunca chega à tela;
 *   4. só então a esquina aparece.
 *
 * FÁBRICA SEM IMPORTS DO JOGO (nem JSX): React, three, R3F, drei e o estado
 * entram por parâmetro (Game.jsx). Assim este pacote não obriga o pacote do
 * jogo a exportar nada a mais, e o pacote inicial não muda nem um byte.
 */

const COR_BRILHO = '#ffffff';
const COR_BRILHO_TRANQUILO = '#d9d0c2';
// Se os letreiros não terminarem de montar (fonte indisponível, por exemplo),
// a esquina aparece assim mesmo depois deste prazo: nunca fica escondida.
const PRAZO_LETREIROS_MS = 4000;

export function criarEsquinaReal(dep) {
  const { React, THREE, useFrame, useThree, Text, useGame, perfilVisual, PALETA3D, SOMBRA_SOLIDA } = dep;
  const { createElement: h, useEffect, useMemo, useRef, useState } = React;
  const E = criarEsquina(dep);
  const LETREIROS = E.letreirosDaEsquina();

  /**
   * Primeiro desenho da esquina num pixel só (tesoura 1×1), com a cena
   * inteira (mesmas luzes, mesmo destino: os mesmos programas do desenho de
   * verdade) e sem o corte pela câmera. Roda dentro do quadro, antes do
   * desenho normal, que limpa e cobre esse pixel: nada disso chega à tela.
   */
  function aquecer(gl, scene, camera, grupo) {
    const corte = [];
    grupo.traverse((o) => {
      corte.push([o, o.frustumCulled]);
      o.frustumCulled = false;
    });
    const tesoura = gl.getScissor(new THREE.Vector4());
    const tesouraLigada = gl.getScissorTest();
    grupo.visible = true;
    gl.setScissorTest(true);
    gl.setScissor(0, 0, 1, 1);
    gl.render(scene, camera);
    gl.setScissor(tesoura);
    gl.setScissorTest(tesouraLigada);
    grupo.visible = false; // aparece no próximo quadro, pelo estado `pronto`
    corte.forEach(([o, valor]) => {
      o.frustumCulled = valor;
    });
  }

  return function EsquinaReal({ targetRef }) {
    const geo = useMemo(() => {
      const m = E.malhasDaEsquina();
      return {
        opaco: E.geometriaDe(m.opaco),
        brilho: E.geometriaDe(m.brilho),
        contorno: E.geometriaDe(m.contorno),
        sombra: E.geometriaDe(m.sombra),
        contato: E.geometriaDe(E.montarMalhaEsquina(E.pecasDoContato())),
      };
    }, []);
    const materiais = useMemo(
      () => ({
        opaco: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0 }),
        brilho: new THREE.MeshBasicMaterial({ vertexColors: true }),
        contorno: new THREE.MeshBasicMaterial({ color: PALETA3D.contorno, side: THREE.BackSide }),
        sombra: new THREE.MeshBasicMaterial({ color: SOMBRA_SOLIDA.cor, transparent: true, opacity: SOMBRA_SOLIDA.opacidade + 0.06, depthWrite: false }),
        contato: new THREE.MeshBasicMaterial({ color: SOMBRA_SOLIDA.cor, transparent: true, opacity: E.CONTATO.opacidade, depthWrite: false }),
      }),
      []
    );
    // Geometria e material passados por prop não são descartados pelo R3F.
    useEffect(
      () => () => {
        Object.values(geo).forEach((g) => g.dispose());
        Object.values(materiais).forEach((m) => m.dispose());
      },
      [geo, materiais]
    );

    const preferencias = useGame((s) => s.preferencias);
    const { tranquilo } = perfilVisual(preferencias);
    useEffect(() => {
      materiais.brilho.color.set(tranquilo ? COR_BRILHO_TRANQUILO : COR_BRILHO);
    }, [materiais, tranquilo]);

    // Escondida até compilar, montar os letreiros e aquecer (cabeçalho).
    const [pronto, setPronto] = useState(false);
    const grupo = useRef(null);
    const etapa = useRef({ compilado: false, letreiros: 0, aquecido: false });
    const letreiroPronto = () => {
      etapa.current.letreiros += 1;
    };
    // quando o pacote chega e a esquina monta: compila os materiais dela com
    // as luzes da cena (sem travar o quadro onde o navegador compila em
    // paralelo)
    const gl = useThree((s) => s.gl);
    const scene = useThree((s) => s.scene);
    const camera = useThree((s) => s.camera);
    useEffect(() => {
      let vivo = true;
      Promise.resolve()
        .then(() => gl.compileAsync(grupo.current, camera, scene))
        .catch(() => {})
        .then(() => {
          if (vivo) etapa.current.compilado = true;
        });
      const prazo = setTimeout(() => {
        if (vivo) etapa.current.letreiros = Math.max(etapa.current.letreiros, LETREIROS.length);
      }, PRAZO_LETREIROS_MS);
      return () => {
        vivo = false;
        clearTimeout(prazo);
      };
    }, [gl, scene, camera]);

    // Um único useFrame: o aquecimento (uma vez) e a mancha de contato, que
    // segue a posição e o rumo do carro a cada quadro.
    const contato = useRef(null);
    useFrame((state) => {
      const e = etapa.current;
      if (!e.aquecido && e.compilado && e.letreiros >= LETREIROS.length && grupo.current) {
        e.aquecido = true;
        aquecer(state.gl, state.scene, state.camera, grupo.current);
        setPronto(true);
      }
      const rb = targetRef.current;
      const g = contato.current;
      if (!rb || !g) return;
      const t = rb.translation();
      const q = rb.rotation();
      g.position.set(t.x, E.CONTATO.y, t.z);
      g.rotation.set(0, 2 * Math.atan2(q.y, q.w), 0);
    });

    const malha = (camada) => h('mesh', { key: camada, geometry: geo[camada], material: materiais[camada] });
    return h(
      'group',
      { name: 'esquina-real', ref: grupo, visible: pronto },
      malha('contorno'),
      malha('opaco'),
      malha('brilho'),
      malha('sombra'),
      ...LETREIROS.map((t) =>
        h(
          Text,
          {
            key: t.slug,
            position: t.posicao,
            fontSize: t.tamanho,
            color: t.cor,
            anchorX: 'center',
            anchorY: 'middle',
            letterSpacing: 0.045,
            fontWeight: 700,
            onSync: letreiroPronto,
          },
          t.texto
        )
      ),
      h('group', { key: 'contato', ref: contato }, h('mesh', { geometry: geo.contato, material: materiais.contato }))
    );
  };
}
