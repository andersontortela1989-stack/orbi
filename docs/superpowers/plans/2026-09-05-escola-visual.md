# Escola e entorno do Órbi — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Execute inline; no delegation is needed for this bounded pilot.

**Goal:** Implementar um piloto visual estático da escola, com fachada colorida, mural pixelado e entorno compacto, preservando a jogabilidade.

**Architecture:** Manter `Building` intacto e montar `SchoolEnvironment` como irmão dele somente para ESCOLA. Dados puramente visuais ficam num módulo local; caixas e copas usam instâncias compartilhadas. A decoração não participa do corpo físico nem do store.

**Tech Stack:** React 18, React Three Fiber 8, Drei 9, Three.js 0.170, Vite 5, testes nativos Node. Usar versões instaladas; nenhum upgrade.

**Spec:** [Escola visual — proposta](../specs/2026-09-05-escola-visual-design.md).

## Global Constraints

- Este documento prepara a execução; não registra implementação nem validação executada.
- Raiz: `C:/Users/ander/Cidade-Turbo-3D`; branch observada: `feature/orbi-golden-rebuild`.
- Revalidar HEAD/status antes de executar; preservar Padaria e hotfix da garagem ainda sem commit.
- Nenhuma dependência nova. Nenhum commit/push/deploy sem autorização correspondente.
- Não alterar `Building.jsx`, `bairros.js`, `Game.jsx`, câmera, carro, física, sensores, moedas, combustível, economia, HUD ou controles.
- Não alterar save v6, sua allowlist de 11 campos ou as habilidades persistidas.
- Sem conteúdo curricular, NPCs, novas missões ou animação neste primeiro piloto.
- Aprovação visual da imagem não substitui validação do componente no gameplay.

## Task 1: Planta decorativa da escola e regressão espacial

**Files:**
- Create: `src/components/school/school-layout.js`.
- Test: `tests/school-layout.test.js`.

**Interfaces:**
- Consumes: objeto de prédio com `slug`, `pos: [x,z]`, `size: [w,h,l]` vindo de `BAIRROS`; `TINTAS` vindo de `src/brand/paleta3d.js`.
- Produces: `createSchoolLayout(building)` retorna `null` para outro slug ou `{ origin, boxes, crowns }` para ESCOLA. Cada instância possui `id`, `position: [x,y,z]`, `scale: [sx,sy,sz]`, `color` e `zone` (`facade`, `mural`, `garden`, `paving`).

- [ ] Conferir raiz, branch, HEAD, status e todos os diffs existentes. Hash SHA-256 dos cinco arquivos da Padaria e dos dois arquivos do hotfix em relatório privado fora do Git.
- [ ] Executar `npm.cmd test` e `npm.cmd run build`. Registrar resultados reais antes de começar. Não usar os 40 testes da sessão anterior como evidência nova.
- [ ] Criar os testes abaixo e executar `node --test tests/school-layout.test.js`. A falha inicial deve ser ausência do módulo; após ele existir, a regressão cobre invasão de rota e geometria inválida.

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { TODOS_PREDIOS } from '../src/city/bairros.js';
import { MOEDAS, RAIO_COLETA } from '../src/city/moedas.js';
import { createSchoolLayout } from '../src/components/school/school-layout.js';

const school = TODOS_PREDIOS.find(p => p.slug === 'ESCOLA');

test('planta usa a escola real sem mudar os dados do destino', () => {
  const before = structuredClone(school);
  const layout = createSchoolLayout(school);
  assert.deepEqual(layout.origin, [0, 0, 38]);
  assert.deepEqual(school, before);
  assert.equal(createSchoolLayout({ slug: 'HOSPITAL' }), null);
});

test('volumes cabem no lote e mantêm aproximação e moedas livres', () => {
  const layout = createSchoolLayout(school);
  const ids = new Set();
  for (const item of [...layout.boxes, ...layout.crowns]) {
    assert.ok(!ids.has(item.id)); ids.add(item.id);
    assert.ok(item.position.every(Number.isFinite));
    assert.ok(item.scale.every(n => Number.isFinite(n) && n > 0));
    // As copas usam icosaedro de raio 0.5: seu AABB cabe nesta mesma caixa.
    const [x,y,z] = item.position;
    const [w,h,l] = item.scale;
    const minX=x-w/2, maxX=x+w/2, minZ=z-l/2, maxZ=z+l/2;
    assert.ok(minX >= -10 && maxX <= 10 && minZ >= -10 && maxZ <= 10, item.id);
    if (item.zone !== 'paving' && y-h/2 < 2) {
      const blocksEntry = maxX > -3.2 && minX < 3.2 && maxZ > 6.4 && minZ < 10;
      assert.equal(blocksEntry, false, item.id);
    }
    if (item.zone === 'garden') {
      for (const [mx,mz] of MOEDAS) {
        const dx=Math.max(minX+school.pos[0]-mx, 0, mx-(maxX+school.pos[0]));
        const dz=Math.max(minZ+school.pos[1]-mz, 0, mz-(maxZ+school.pos[1]));
        assert.ok(Math.hypot(dx,dz) > RAIO_COLETA, item.id);
      }
    }
  }
});
```

- [ ] Implementar o módulo de planta com o código de referência abaixo. Ele preserva os dados de entrada; ajuste visual posterior deve continuar satisfazendo os limites do teste.

```js
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
  box('awning',[0,3.15,l/2+0.8],[4.2,0.3,1.6],TINTAS.blue);
  box('window-frame',[-5.4,2.5,face],[3.4,2.8,0.06],TINTAS.ink);
  box('window',[-5.4,2.5,face+0.05],[3.1,2.5,0.04],TINTAS.blueSoft);
  box('window-divider',[-5.4,2.5,face+0.08],[0.10,2.5,0.02],TINTAS.ink);
  // Faixa no fundo do telhado: não cruza a placa central existente.
  box('roof-accent',[0,h+0.26,-l/2+0.65],[w-1.2,0.06,0.7],TINTAS.blue);

  // Livro em azulejos: azul/creme, fora do eixo da porta.
  const book = ['........','...BB...','..B..B..','.B....B.','BBBBBBBB'];
  const tile = 0.44;
  book.forEach((row,r) => [...row].forEach((pixel,c) => {
    box(`tile-${r}-${c}`,[5.3+(c-3.5)*tile,3.8-r*tile,face+0.04],
      [tile-0.025,tile-0.025,0.06],pixel==='B'?TINTAS.blueDeep:TINTAS.paper,'mural');
  }));

  for (const side of [-1,1]) {
    const sx=side*6;
    box(`planter-${side}`,[sx,0.23,8.3],[3.6,0.4,1.5],TINTAS.blueSoft,'garden');
    [-1,0,1].forEach((offset,i) =>
      crown(`plant-${side}-${i}`,[sx+offset,0.77,8.3],[1.1,0.95,1.05],
        i%2?TINTAS.grassDeep:TINTAS.grass));
  }
  for (const side of [-1,1]) {
    box(`rear-bed-${side}`,[side*4.8,0.18,-8.4],[3.2,0.28,1.4],TINTAS.paper,'garden');
    [-0.9,0,0.9].forEach((offset,i) =>
      crown(`seedling-${side}-${i}`,[side*4.8+offset,0.53,-8.4],[0.65,0.6,0.65],TINTAS.grass));
  }
  // Pintura baixa no piso; não é mecanismo de resposta ou recompensa.
  [[-1,0],[0,0],[1,0],[0,1]].forEach(([dx,dz],i) =>
    box(`paving-${i}`,[dx*0.65,0.026,-8+dz*0.65],[0.58,0.006,0.58],
      [TINTAS.blueSoft,TINTAS.coralSoft,TINTAS.grassSoft,TINTAS.sunSoft][i],'paving'));
  return {origin:[x,0,z], boxes, crowns};
}
```

- [ ] Executar o teste espacial até passar e revisar o caso de alcance das moedas a leste. Nenhuma falha permite mover moedas ou alterar o raio de coleta.

## Task 2: Renderização e integração isolada

**Files:**
- Create: `src/components/school/SchoolEnvironment.jsx`.
- Modify: `src/components/City.jsx`.

**Interfaces:**
- Consumes: `createSchoolLayout(building)` da Task 1.
- Produces: `SchoolEnvironment({building})`, somente elementos visuais, sem callbacks de jogabilidade.

- [ ] Implementar o renderizador abaixo. A primeira versão usa vegetação facetada compacta, adequada ao lote; não introduzir árvores de tamanho que ocultem a placa.

```jsx
import { useMemo } from 'react';
import { Instances, Instance } from '@react-three/drei';
import { createSchoolLayout } from './school-layout.js';

export function SchoolEnvironment({building}) {
  const layout = useMemo(() => createSchoolLayout(building), [building]);
  if (!layout) return null;
  return (
    <group position={layout.origin}>
      <Instances limit={layout.boxes.length}>
        <boxGeometry args={[1,1,1]} />
        <meshLambertMaterial />
        {layout.boxes.map(item => (
          <Instance key={item.id} position={item.position} scale={item.scale} color={item.color} />
        ))}
      </Instances>
      <Instances limit={layout.crowns.length}>
        <icosahedronGeometry args={[0.5,0]} />
        <meshLambertMaterial />
        {layout.crowns.map(item => (
          <Instance key={item.id} position={item.position} scale={item.scale} color={item.color} />
        ))}
      </Instances>
    </group>
  );
}
```

- [ ] Importar `SchoolEnvironment` em City e substituir somente o corpo do `bairro.predios.map` pela composição abaixo. Deixar o restante de City exatamente como está.

```jsx
import { SchoolEnvironment } from './school/SchoolEnvironment.jsx';

// Dentro do map de prédios já existente:
<group key={p.slug}>
  <Building floorPos={p.pos} size={p.size} color={p.cor} label={p.slug} />
  {p.slug === 'ESCOLA' && <SchoolEnvironment building={p} />}
</group>
```

- [ ] Confirmar no diff que `Building` recebe os mesmos dados. A camada irmã não pode ser movida para dentro do `RigidBody` para corrigir um alinhamento.
- [ ] Rodar `npm.cmd test`, `npm.cmd run build` e `git diff --check`; revisar integralmente também os arquivos novos.
- [ ] Comparar hashes pré/pós de Padaria e hotfix; confirmar que todos os arquivos protegidos estão idênticos.

## Task 3: Validar o piloto no mundo real e documentar

**Files:**
- Create: `docs/ORBI_SCHOOL_VISUAL_RESULT.md` somente após executar as verificações, com resultados reais.
- Nenhuma alteração de código adicional, salvo ajuste visual dentro dos arquivos do piloto motivado por falha observada.

**Interfaces:**
- Consumes: piloto da Task 2, imagem aprovada e baseline do mesmo aparelho.
- Produces: relatório com PASS/FAIL/PENDING por critério, amostras e validação humana pendente ou confirmada.

- [ ] Disponibilizar preview de produção em porta livre e confirmar HTTP 200 no PC e na LAN. Usar processo destacado oculto no Windows; não parar um preview que o usuário está usando.
- [ ] No gameplay real, comparar aproximação, placa, fachada e pátio com a base. Percorrer os quatro lados da escola e coletar moedas no corredor leste. Confirmar a mesma reação de chegada.
- [ ] Capturar desktop e viewports 740×360, 844×390 e 915×412, usando a câmera atual. O modo portrait mantém o gate existente. Testar estados de iluminação e confirmar ausência de cintilação nas superfícies.
- [ ] Aplicar as medições da spec: duas amostras de 30 segundos após aquecimento, mesmo aparelho e percurso. Registrar mediana/p95 do tempo de quadro e diferenças em draw calls e triângulos. Ausência de instrumentos/medidas é PENDING, nunca PASS inferido.
- [ ] Limites propostos: +20 draw calls, +8.000 triângulos; mediana <= 110% da base, p95 <= 115% da base, mediana <= 33,3 ms. Se falhar, reduzir decoração e repetir a parte afetada.
- [ ] Registrar evidências em `docs/ORBI_SCHOOL_VISUAL_RESULT.md`: branch/HEAD, arquivos, resultados automatizados, dimensões testadas, métricas, fotos/capturas, hashes preservados, limitações e status humano. Não declarar validação mobile usando apenas simulação desktop.
- [ ] Entregar preview para avaliação humana do piloto. Garagem e Padaria mantêm seus próprios critérios de aprovação.
- [ ] Quando houver autorização de commit, incluir explicitamente apenas City, a pasta `school`, seu teste e relatório. Não usar `git add -A`; não incluir Padaria, garagem, nem documentação alheia por acidente. Mensagem proposta: `feat: add Orbi school visual pilot`.

## Limites deste plano

O código acima é a base concreta do piloto, não tentativa de reproduzir toda a imagem em uma etapa. Ele entrega identidade cromática, janelas/porta, cobertura, mural, canteiros, pequena horta cenográfica e pintura de pátio. Ajustes de proporção pertencem à revisão visual da Task 3 e devem respeitar limites espaciais e de desempenho.

Personagens ambulantes, animação ambiental, entrada no prédio, atividades por idade, seleção de matéria e aprendizagem persistida precisam de propostas próprias. Nenhuma dessas funcionalidades foi executada ou aprovada tecnicamente por este plano.

## Revisão do plano — 05/09/2026

- Quatro blocos de código tiveram sintaxe verificada com o compilador JSX já instalado.
- O modelo e os dois testes de exemplo foram executados em memória, usando os dados reais de prédios e moedas: 2/2 passaram. Nenhum módulo de aplicação foi criado para essa conferência.
- Campos e interfaces do renderizador correspondem ao modelo. Os caminhos da spec e da imagem foram conferidos.
- Renderização, custo gráfico, colisões em jogo e teste touch continuam sem execução para este piloto. Esses resultados não são aprovação de implementação.
