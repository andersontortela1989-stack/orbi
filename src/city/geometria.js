/**
 * GEOMETRIA COMPARTILHADA DOS LUGARES (fatia A1.2a) — fonte única das
 * medidas que antes moravam soltas dentro dos componentes React.
 *
 * Quem consome: Building.jsx (calçada), ArrivalSensor.jsx e ZoneSensor.jsx
 * (margem padrão dos sensores), OpenPark.jsx (gramado) e
 * tests/folgas-cidade.test.js, que mede folgas com estes mesmos números.
 * Mexeu aqui, o teste de folgas acompanha sozinho.
 *
 * Dados puros: sem React, sem three. Unidades de mundo (as de bairros.js).
 */

/**
 * Calçada ("lote") de todo prédio desenhado pelo Building: uma caixa de
 * (w + CALCADA_EXTRA) × (l + CALCADA_EXTRA), POR EIXO — não é um quadrado de
 * max(w, l). A calçada é só visual: o colisor do prédio continua w × l.
 */
export const CALCADA_EXTRA = 4.4;

/** A mesma calçada, medida de um lado só (metade do extra). */
export const CALCADA_POR_LADO = CALCADA_EXTRA / 2;

/**
 * Margem padrão do sensor de chegada em volta do prédio, por eixo
 * (ArrivalSensor). Passa da calçada em PADDING_CHEGADA − CALCADA_POR_LADO.
 */
export const PADDING_CHEGADA = 3.5;

/**
 * Margem padrão das zonas de serviço (ZoneSensor: POSTO, GARAGEM, entrega da
 * carona), por eixo.
 */
export const PADDING_ZONA = 4;

/**
 * Gramado do PARQUE (OpenPark): circleGeometry de raio GRAMADO_PARQUE_RAIO com
 * escala GRAMADO_PARQUE_ESCALA, deitado por [-π/2, 0, 0]. O círculo vive no
 * plano XY local e o giro leva o Y local para −Z do mundo; por isso, no chão,
 * a meia-largura é raio × escala[0] e a meia-profundidade é raio × escala[1].
 * A escala[2] não tem efeito (o círculo tem z = 0).
 */
export const GRAMADO_PARQUE_RAIO = 10.2;
export const GRAMADO_PARQUE_ESCALA = [1.38, 1, 1.02];
