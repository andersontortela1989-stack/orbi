/**
 * BICHOS NO MUNDO (frente extra "Bichos no mundo") — fonte única de ONDE
 * da fauna. Render em components/Bichos.jsx (par de sempre: dados aqui,
 * visual lá — como bairros↔City e moedas↔Moedas).
 *
 * CONTRATO COM O QUIZ (o propósito da frente): todo slug daqui DEVE
 * existir no banco ANIMAIS de missions/missoes-ciencias.js — o bicho que
 * a criança VÊ no mundo é o MESMO que aparece no quiz do ZOO e na missão
 * do VET (mesmo slug → mesmo emoji, som e frases). Bicho novo aqui sem
 * entrada no banco quebra a ponte mundo↔conteúdo (Bichos.jsx avisa em
 * dev). Este arquivo fica DADOS PUROS, sem importar o banco: a direção
 * de dependência do projeto é missions deriva de city, nunca o inverso.
 *
 * HONESTIDADE DA FRONTEIRA: na Frente 4 os bichos são presença visual
 * pura — nada deriva daqui AINDA. Eles nascem em src/city/ (e não no
 * Cenario.jsx) porque a Frente 5 ("eu vi um bicho perto da água! me
 * mostra onde?") vai derivar a BUSCA destas posições — e a regra da
 * fronteira manda o prop que vai virar jogável morar logo no destino.
 *
 * GUARD-RAILS (invioláveis):
 *   - ESTÁTICO PURO: nada anda, nada persegue, nada aparece/some — o
 *     pato de hoje está no mesmo lugar amanhã (previsibilidade TEA).
 *     Respiração sutil é alavanca de gate, não padrão.
 *   - SEM COLISÃO (precedente das árvores): atravessar = passa direto.
 *   - Poucos e calmos: 5 no mundo inteiro, dosagem das árvores.
 *
 * POSIÇÕES: âncoras semânticas derivadas de bairros.js (lote/calçada de
 * cada prédio = max(w,l)+4, ver Building), conferidas contra fileiras de
 * moedas (city/moedas.js), zonas de serviço (POSTO x -44..-24/z 14..34;
 * GARAGEM x 24..44/z -26..-6) e árvores/postes do Cenario. `heading` em
 * radianos, todos distintos (nenhum par paralelo — variedade calma).
 */

export const BICHOS = [
  // beira d'água do PORTO (chão azul), no vão entre os lotes PORTO/FAROL
  { slug: 'PATO',     pos: [-50, 34], heading: 0.6 },

  // esquina de vizinhança do CENTRO, entre os lotes de PIZZA e ESCOLA
  { slug: 'GATO',     pos: [-14, 32], heading: -2.2 },

  // pasto de capim do PARQUE, no vão entre os lotes PARQUE/ZOO
  { slug: 'VACA',     pos: [0, 84],   heading: 2.9 },

  // feira — leste do lote do MERCADO (chão sol-soft)
  { slug: 'GALINHA',  pos: [70, 22],  heading: -0.9 },

  // cão de oficina, ao lado da GARAGEM (fora da zona; fileira G de moedas
  // a ~3 — se atropelar visualmente, deslizar 2-3 unidades a leste no gate)
  { slug: 'CACHORRO', pos: [46, -14], heading: 1.7 },
];
