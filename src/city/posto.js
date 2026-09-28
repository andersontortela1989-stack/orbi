/**
 * POSTO (Fatia 5) — fonte única de ONDE fica o posto de gasolina. Render 3D e
 * zona de abastecimento em components/GasStation.jsx; mesmo padrão de
 * city/garagem.js.
 *
 * SERVIÇO ≠ DESTINO: o posto não entra em bairros.js (tudo lá ganha sensor de
 * chegada do GPS). Como a garagem, é prédio próprio + zona entra/sai + painel.
 *
 * Vizinhos que dependem desta posição: as fileiras de moedas do corredor do
 * PORTO (city/moedas.js) e os baldes da aventura do parque
 * (components/BaldesAventura.jsx). Mexeu na posição, conferir os dois e rodar
 * tests/folgas-cidade.test.js.
 */

// Asfalto oeste, área aberta (a GARAGEM guarda o lado leste).
export const POSTO_POS = [-34, 24]; // [x, z] no plano
export const POSTO_SIZE = [12, 5, 12]; // [w, h, l] — baixo e largo, cara de posto
