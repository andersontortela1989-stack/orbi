import { Building } from './Building.jsx';

/**
 * Cidade mínima — três prédios à frente do spawn do carro (z > 0),
 * espaçados para o jogador dirigir ENTRE eles e ler as placas enquanto anda.
 * Sem trânsito, sem outros objetos (guard-rail sensorial: TEA+TDAH).
 *
 * Layout (visto de cima, com spawn do carro em (0,0)):
 *
 *      [ESCOLA]        ← z = +38, longe, no eixo central
 *
 *   [PIZZA]   [HOSPITAL]    ← z = +15, mais perto, esquerda e direita
 *
 *            🚗 spawn (0,0)
 *
 * Paleta calma, sem cores saturadas/agressivas. Cada prédio tem altura
 * diferente para reforçar identidade visual à parte da cor e da placa.
 */
export function City() {
  return (
    <>
      <Building
        floorPos={[-20, 15]}
        size={[12, 6, 12]}
        color="#c45c4c"
        label="PIZZA"
      />

      <Building
        floorPos={[20, 15]}
        size={[14, 10, 14]}
        color="#b6d3e3"
        label="HOSPITAL"
        labelColor="#1a2733"
        labelOutline="#ffffff"
      />

      <Building
        floorPos={[0, 38]}
        size={[16, 7, 12]}
        color="#d4b75c"
        label="ESCOLA"
        labelColor="#2a1f0a"
        labelOutline="#ffffff"
      />
    </>
  );
}
