import { TINTAS } from '../../brand/paleta3d.js';

export function createSchoolLayout(building) {
  if (building.slug !== 'ESCOLA') return null;
  const [w,h,l] = building.size;
  const [x,z] = building.pos;
  const boxes = [], crowns = [];
  const box = (id,position,scale,color,zone='facade') =>
    boxes.push({id,position,scale,color,zone});
  const crown = (id,position,scale,color) =>
    crowns.push({id,position,scale,color,zone:'garden'});
  const face = l/2 + 0.27;

  // Superfícies além do hull visual do Building; nenhuma colisão nova.
  box('door-frame',[0,1.4,face],[3.3,2.8,0.06],TINTAS.coral);
  box('door',[0,1.3,face+0.05],[2.8,2.6,0.04],TINTAS.blueDeep);
  box('door-divider',[0,1.3,face+0.08],[0.08,2.6,0.02],TINTAS.ink);
  box('awning',[0,3.6,l/2+0.9],[4.8,0.3,1.8],TINTAS.blueDeep);
  [-1,0,1].forEach((stripe,i) =>
    box(`awning-stripe-${i}`,[stripe*1.5,3.77,l/2+0.9],[0.72,0.04,1.8],TINTAS.paper));
  box('window-frame',[-5.4,2.5,face],[3.4,2.8,0.06],TINTAS.ink);
  box('window',[-5.4,2.5,face+0.05],[3.1,2.5,0.04],TINTAS.blueSoft);
  box('window-divider',[-5.4,2.5,face+0.08],[0.10,2.5,0.02],TINTAS.ink);
  // Faixa no fundo do telhado: não cruza a placa central existente.
  box('roof-accent',[0,h+0.26,-4.3],[w-0.6,0.06,2.9],TINTAS.sun);
  box('roof-front',[0,h+0.26,4.3],[w-0.6,0.06,2.9],TINTAS.blueDeep);
  [-1,1].forEach(side => {
    box(`roof-side-${side}`,[side*7,h+0.26,0],[1.4,0.06,5.6],TINTAS.coral);
    box(`facade-paper-${side}`,[side*5.2,3.2,face-0.025],[5.4,5.8,0.02],TINTAS.paper);
  });
  box('facade-cornice',[0,6.6,face+0.02],[w,0.55,0.12],TINTAS.coral);
  box('facade-plinth',[0,0.4,face+0.02],[w,0.7,0.10],TINTAS.blueDeep);

  // Grandes símbolos pintados no teto, fora da placa: legíveis de cima.
  const roofBook = ['PPP..PPP','P..PP..P','P..PP..P','PPPPPPPP'];
  roofBook.forEach((row,r) => [...row].forEach((pixel,c) => {
    if (pixel === 'P') box(`roof-book-${r}-${c}`,[-3.4+(c-3.5)*0.42,h+0.31,3.65+r*0.43],
      [0.40,0.03,0.40],TINTAS.paper);
  }));
  const roofSun = ['..S..','.SSS.','SSSSS','.SSS.','..S..'];
  roofSun.forEach((row,r) => [...row].forEach((pixel,c) => {
    if (pixel === 'S') box(`roof-sun-${r}-${c}`,[4.1+(c-2)*0.4,h+0.31,3.5+r*0.4],
      [0.38,0.03,0.38],TINTAS.sun);
  }));
  [-5.7,-2.85,0,2.85,5.7].forEach((sx,i) =>
    box(`roof-banner-${i}`,[sx,h+0.31,-4.3],[1.9,0.04,1.2],
      [TINTAS.blue,TINTAS.coral,TINTAS.paper,TINTAS.grass,TINTAS.blue][i]));

  // Livro em azulejos: azul/creme, fora do eixo da porta.
  const book = ['BBB..BBB','B..BB..B','B..BB..B','B..BB..B','BBBBBBBB'];
  const tile = 0.44;
  book.forEach((row,r) => [...row].forEach((pixel,c) => {
    box(`tile-${r}-${c}`,[5.3+(c-3.5)*tile,3.8-r*tile,face+0.04],
      [tile-0.025,tile-0.025,0.06],pixel==='B'?TINTAS.blueDeep:TINTAS.paper,'mural');
  }));

  for (const side of [-1,1]) {
    const sx=side*6;
    box(`planter-${side}`,[sx,0.23,8.3],[3.6,0.4,1.5],TINTAS.coral,'garden');
    [-1,0,1].forEach((offset,i) =>
      crown(`plant-${side}-${i}`,[sx+offset,0.77,8.3],[1.1,0.95,1.05],
        i%2?TINTAS.grassDeep:TINTAS.grass));
    [-0.8,0.8].forEach((offset,i) =>
      box(`flower-${side}-${i}`,[sx+offset,1.12,8.3],[0.35,0.22,0.35],
        i?TINTAS.paper:TINTAS.sun,'garden'));
  }
  for (const side of [-1,1]) {
    // A câmera fixa esconde volumes baixos atrás do telhado. A horta fica
    // nas faixas laterais, ainda dentro do lote e longe das moedas a leste.
    box(`side-bed-${side}`,[side*9,0.18,-2],[1.2,0.28,3.2],TINTAS.paper,'garden');
    [-0.9,0,0.9].forEach((offset,i) =>
      crown(`seedling-${side}-${i}`,[side*9,0.53,-2+offset],[0.65,0.6,0.65],TINTAS.grass));
  }
  // Pintura baixa no piso; não é mecanismo de resposta ou recompensa.
  for (let row=0;row<3;row++) {
    [-1,0,1].forEach((column,i) =>
      box(`paving-${row}-${i}`,[column*1.05,0.026,7.2+row*0.85],[0.96,0.006,0.76],
        [TINTAS.blue,TINTAS.coral,TINTAS.sun,TINTAS.grass][(row+i)%4],'paving'));
  }
  return {origin:[x,0,z], boxes, crowns};
}
