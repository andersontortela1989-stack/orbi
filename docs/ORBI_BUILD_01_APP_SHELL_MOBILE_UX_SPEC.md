# ÓRBI — BUILD 01 — APP SHELL + MOBILE UX v2 — GO SPEC

**Projeto:** Órbi — um mundo pra descobrir  
**Fase:** BUILD 01 — App Shell + Mobile UX v2  
**Data:** 01/09/2026  
**Status:** GO SPEC — PRONTO PARA EXECUÇÃO CONTROLADA  
**Branch de trabalho:** `feature/orbi-golden-rebuild`  
**Depende de:** BUILD 00 — PASS  
**Baseline funcional:** `2db05d6df0deaf3c741ce319ce4bc5fdb1b34e0e`  
**Commit de documentação BUILD 00:** baseline já versionado na branch  
**Save contract:** v6 — NÃO ALTERAR  
**Risco:** Médio  
**Functional scope:** UX / apresentação / controles / shell  
**Core loop:** NÃO ALTERAR

---

# 1. OBJETIVO DO BUILD 01

O BUILD 01 é a primeira alteração funcional do Golden Rebuild.

Ele deve melhorar a experiência de entrada, leitura da interface e uso mobile **sem tocar no motor educacional, no sistema de missões ou no contrato de persistência**.

A meta é transformar o Órbi de:

> **um jogo desktop que funciona no mobile**

para:

> **uma experiência cuja camada de interface foi conscientemente desenhada para mobile, preservando o mundo 3D e a engenharia já existente.**

---

# 2. PRINCÍPIO DESTA FASE

> **MUNDO > ÓRBI > SISTEMA**

O mundo deve recuperar área visual.

Órbi deve assumir progressivamente o papel de presença emocional.

A UI de sistema deve ocupar somente o espaço necessário.

---

# 3. O QUE ESTE BUILD PODE MUDAR

Somente estas quatro frentes:

1. **App Shell responsivo**
2. **Orientation Gate v2**
3. **HUD v2**
4. **Touch Controls v2**

Nenhuma quinta frente deve ser adicionada sem novo gate.

---

# 4. O QUE ESTE BUILD NÃO PODE MUDAR

BUILD 01 NÃO está autorizado a alterar:

- `MissionController`;
- `MissionSensors`;
- `processarChegada()`;
- `proximaMissao()`;
- lógica de geração de missões;
- sequência automática de missões;
- `ChegadaVivaPanel`;
- Padaria;
- Mercado;
- Zoológico;
- Estádio;
- Parque;
- MicroScene Engine;
- Caderninho como sistema de dados;
- categorias de descobertas;
- `registrarHabilidade()`;
- `habilidades`;
- sistema de save;
- `SAVE_VERSION`;
- schema persistido;
- garagem;
- economia;
- preço de cores;
- física Rapier;
- comportamento do carro;
- câmera ortográfica;
- layout da cidade;
- conteúdo educacional;
- áudio/TTS, exceto se necessário exclusivamente para preservar comportamento existente;
- Carona, salvo ocultação visual temporária explicitamente prevista neste documento;
- backend;
- login;
- analytics;
- novos conteúdos.

> **Se uma mudança exigir tocar em qualquer um desses sistemas, PARE e reporte o bloqueio. Não contorne silenciosamente.**

---

# 5. CONTRATO DE SAVE

BUILD 01 deve permanecer integralmente compatível com o save v6.

Campos atuais preservados:

- `nome`;
- `introVista`;
- `veiculo`;
- `desbloqueados`;
- `moedas`;
- `combustivel`;
- `corCarro`;
- `coresCompradas`;
- `missao`;
- `habilidades`;
- `descobertas`.

## Proibido

- bump para v7;
- adicionar campo persistido;
- remover campo;
- renomear campo;
- alterar shape;
- alterar semantics de hydrate/migrate;
- alterar import/export.

## Gate

O `ORBI_GOLDEN_SAVE_V6_PRIVATE.txt` deve continuar abrindo normalmente após BUILD 01.

---

# 6. BASELINE QUE DEVE SER PRESERVADO

Antes de qualquer alteração:

```text
npm test
13/13 PASS
```

```text
npm run build
PASS
```

Warning conhecido de bundle:

```text
JS ~3.27 MB
gzip ~1.11 MB
chunk >500 kB
```

Esse warning continua fora do escopo.

Não tentar corrigi-lo.

---

# 7. FATIA 01 — APP SHELL RESPONSIVO

## Problema atual

A Start Screen foi desenhada em uma composição fixa e funciona em mobile principalmente por escala.

O baseline mostrou que em landscape de celular ela fica legível, mas visualmente se comporta como:

> **desktop reduzido dentro do viewport**

O shell atual também mistura a exigência landscape do gameplay com o restante da experiência.

## Objetivo

Separar:

> **APP**

de:

> **GAME VIEWPORT**

Abertura, Área dos Pais e narrativa não devem depender da orientação de direção.

---

## 7.1 START SCREEN v2

### Deve preservar

- logo Órbi;
- personagem;
- tagline `um mundo pra descobrir`;
- CTA principal `JOGAR`;
- acesso `Área dos pais`;
- identidade visual;
- Mundo Adesivo;
- `prefers-reduced-motion`;
- personalidade atual.

### Deve melhorar

- composição fluida;
- uso real do viewport;
- espaçamento adaptativo;
- legibilidade portrait;
- legibilidade landscape;
- hierarquia de CTA;
- posicionamento da Área dos Pais;
- ausência de overflow/corte.

### Requisito

A Start Screen deve funcionar nativamente em:

- desktop;
- tablet portrait;
- tablet landscape;
- celular portrait;
- celular landscape.

### Regra

> **A Start Screen NÃO exige landscape.**

---

# 8. INTRO / “A CHEGADA”

## Decisão

Preservar fluxo e narrativa.

Não reescrever conteúdo nesta fatia.

## Deve funcionar em

- portrait;
- landscape;
- desktop.

## Deve preservar

- PULAR;
- toque para continuar;
- entrada de nome;
- CTA VAMOS;
- sequência existente;
- comportamento first-time.

## Permitido

Somente ajustes responsivos necessários para:

- evitar cortes;
- adaptar largura;
- adaptar tipografia;
- adaptar espaço vertical;
- manter toque confortável.

## Proibido

- reescrever narrativa;
- alterar número de frames;
- mudar persistência `introVista`;
- adicionar animações complexas.

---

# 9. FATIA 02 — ORIENTATION GATE v2

## Problema atual

O guard funciona, porém o conceito de “mobile = precisa virar” está acoplado demais à aplicação.

## Nova regra

> **Somente dirigir exige landscape.**

Abertura, Área dos Pais e introdução podem acontecer normalmente em portrait.

---

## 9.1 QUANDO O GATE PODE APARECER

Somente quando:

- a fase atual é gameplay;
- o dispositivo/viewport está em orientação portrait;
- o jogo exige direção.

## Não aparecer em

- Start Screen;
- Área dos Pais;
- IntroChegada;
- telas informativas anteriores ao gameplay.

---

## 9.2 MENSAGEM

Direção aprovada:

> **VIRE O CELULAR**

Texto secundário:

> **ASSIM FICA MAIS GOSTOSO DIRIGIR**

A mensagem pode manter ou reutilizar o ícone de rotação existente.

---

## 9.3 REQUISITOS TÉCNICOS

Preservar a proteção atual contra reset do Canvas/Rapier durante rotação.

O baseline técnico já contém uma estratégia de:

- montar o Canvas somente quando o landscape estabiliza no primeiro acesso;
- manter a simulação montada após o jogo começar;
- não reiniciar Rapier ao rotacionar portrait → landscape → portrait.

### Proibido

Simplificar OrientationGuard de modo que:

- o Canvas seja desmontado após gameplay iniciado;
- o carro resete;
- a missão resete;
- o save/estado transitório seja perdido.

---

# 10. FATIA 03 — HUD v2

## Problema atual

O baseline visual mostra competição simultânea entre:

- moedas;
- combustível;
- missão;
- botões superiores;
- Carona;
- Touch Controls;
- mundo.

No mobile, essa camada ocupa parcela relevante do viewport.

---

# 11. REGRA DO HUD v2

## Nível 1 — MUNDO

Elemento dominante.

## Nível 2 — ÓRBI / contexto

Informação emocional ou contextual.

## Nível 3 — SISTEMA

Somente o necessário.

---

# 12. MOEDAS — DECISÃO BUILD 01

## Estado/economia

> **KEEP**

Não alterar store.

Não alterar garagem.

Não alterar preços.

Não alterar save.

## Contador de moedas no HUD

> **HIDE**

Não deve aparecer no Golden HUD v2.

### Importante

Neste BUILD 01, ocultar somente a representação de HUD.

A decisão de ocultar `Moedas.jsx` do mundo durante Golden Validation pode ser executada **somente se for possível por uma alteração isolada e reversível de apresentação**, sem alterar economia/store.

Se isso introduzir acoplamento adicional:

> PARE e deixe `Moedas.jsx` para gate específico.

---

# 13. COMBUSTÍVEL — DECISÃO BUILD 01

A lógica de combustível NÃO muda.

## HUD

### Combustível saudável

Não deve dominar permanentemente a tela.

### Permitido

- reduzir;
- simplificar;
- ocultar em condição saudável;
- tornar contextual.

### Quando baixo

Pode aparecer um sinal visual discreto.

### Quando crítico

Pode ganhar atenção maior.

## Proibido

- alterar consumo;
- alterar tanque;
- alterar reserva;
- alterar posto;
- alterar `FuelController`;
- alterar regra que impede bloqueio definitivo da criança.

---

# 14. MISSÃO — DECISÃO BUILD 01

O sistema de missões continua exatamente como está.

> **BUILD 01 NÃO É O EXPLORATION LOOP.**

## Permitido

Somente alterar a apresentação visual do objetivo.

## Objetivo

Reduzir dominância do grande banner central.

## Possibilidades permitidas

- menor escala;
- posicionamento menos central;
- apresentação mais discreta;
- integração visual com Órbi.

## Proibido

- remover missão;
- impedir próxima missão;
- mudar wording sem necessidade;
- transformar missão em curiosidade contextual;
- alterar timing;
- alterar store.

Isso pertence ao BUILD 02.

---

# 15. CADERNINHO — DECISÃO BUILD 01

## Dados e painel

> **KEEP**

O Caderninho v2 não pertence a esta fase.

## Botão de acesso

Pode ser reposicionado e reduzido para harmonizar com o novo HUD.

## Proibido

- alterar grid;
- alterar categorias;
- remover `?`;
- transformar em Knowledge Map;
- alterar conteúdo;
- alterar lógica de fala.

Isso pertence ao BUILD 04.

---

# 16. CARONA — BUILD 01

O sistema deve permanecer no código.

## Preferência Golden

Se tecnicamente simples, permitir uma flag de apresentação para não iniciar/mostrar Carona durante a validação visual do shell.

Entretanto:

> **não refatorar Carona neste BUILD.**

Se esconder exigir alterar lógica do sistema:

> não tocar.

---

# 17. FATIA 04 — TOUCH CONTROLS v2

## Problema atual

No baseline mobile de baixa altura aparecem:

- VIRA esquerda;
- VIRA direita;
- RÉ;
- ACELERA.

A implementação reutiliza eventos de teclado.

Isso é um ativo e deve ser preservado.

---

# 18. PRINCÍPIO DE CONTROLE v2

> **A criança deve olhar para o carro, não para os botões.**

---

# 19. LAYOUT GOLDEN v1

## LADO ESQUERDO

Direção.

Pode continuar internamente como:

- ArrowLeft;
- ArrowRight.

Visualmente, reduzir sensação de quatro botões gamer separados.

### Permitido

Uma zona ampla ou dois controles adjacentes.

### Rótulos

Evitar depender do texto `VIRA` como informação principal.

Setas/forma devem comunicar direção.

---

## LADO DIREITO

Botão principal:

> **IR**

Internamente:

> `ArrowUp`

### Regra

É o maior e mais evidente controle de ação.

---

# 20. RÉ

Golden v1:

> **pequena, secundária, sempre disponível**

Internamente:

> `ArrowDown`

Não implementar ré contextual neste BUILD.

Motivo:

A ré contextual exigiria telemetria do `RigidBody` para a camada DOM.

Isso adicionaria complexidade fora do objetivo.

---

# 21. DRIFT

## Mobile infantil

> **HIDE da superfície primária**

A física continua existindo.

Teclado desktop continua podendo usar Space.

Não remover capacidade do `Car`.

---

# 22. BUZINA

Não ocupar espaço primário.

## Permitido

- esconder em viewports baixos;
- tornar secundária;
- manter apenas em telas maiores.

## Proibido

Refatorar sistema de som/buzina.

---

# 23. CONTRATO DE INPUT

Touch Controls v2 deve continuar preferencialmente reutilizando os mesmos eventos que o jogo já consome.

Objetivo:

> **UI muda; física não.**

## Não criar

- novo motor de input;
- novo store de direção;
- nova camada de física;
- joystick analógico complexo.

Sem autorização adicional.

---

# 24. TOUCH DETECTION

O baseline mostrou que a detecção atual de touch é avaliada no carregamento do módulo.

## Neste BUILD

Não é obrigatório refatorar isso.

### Permitido apenas se

- a correção for pequena;
- isolada;
- sem impacto desktop;
- facilmente testável.

Caso contrário:

> registrar como known issue e preservar.

---

# 25. VIEWPORTS DE VALIDAÇÃO OBRIGATÓRIOS

O BUILD 01 não pode ser aprovado testando apenas desktop.

## Desktop

- 1440×900 ou equivalente;
- 1366×768 ou equivalente.

## Mobile portrait

- iPhone 12 Pro ~390×844;
- Android equivalente.

## Mobile landscape

No mínimo:

- 844×390;
- ~740×360;
- ~915×412.

## Tablet

- ~1024×1366 portrait;
- ~1366×1024 landscape.

---

# 26. CRITÉRIOS VISUAIS — START SCREEN

PASS somente se:

- nenhum elemento essencial estiver cortado;
- `JOGAR` for óbvio;
- Área dos Pais continuar acessível;
- portrait parecer intencional;
- landscape não parecer apenas canvas desktop miniaturizado;
- logo/personagem continuarem reconhecíveis;
- tipografia não ficar pequena demais;
- não houver scroll acidental.

---

# 27. CRITÉRIOS VISUAIS — GAMEPLAY MOBILE

PASS somente se:

- mundo ocupar claramente mais área;
- Touch Controls não cobrirem landmarks importantes de forma excessiva;
- `IR` for facilmente identificável;
- esquerda/direita puderem ser usados sem olhar continuamente;
- RÉ estiver disponível sem competir com IR;
- HUD não disputar atenção com os controles;
- botão de Caderninho continuar acessível;
- nenhuma função necessária desapareça;
- safe areas sejam respeitadas;
- nenhuma UI extrapole o viewport.

---

# 28. CRITÉRIOS FUNCIONAIS

Depois das mudanças:

## Deve continuar funcionando

- dirigir com teclado;
- dirigir com touch;
- esquerda;
- direita;
- acelerar;
- ré;
- drift no desktop;
- buzina conforme baseline permitido;
- combustível;
- posto;
- garagem;
- moedas/economia;
- missões;
- chegada;
- Chegada Viva;
- Caderninho;
- Área dos Pais;
- IntroChegada;
- Orientation Guard;
- save;
- import/export.

---

# 29. TEST CONTRACT

Ao final:

```bash
npm test
```

Esperado:

```text
13/13 PASS
```

E:

```bash
npm run build
```

Esperado:

```text
PASS
```

O warning de bundle pode continuar.

---

# 30. GOLDEN SAVE VALIDATION

Testar o `ORBI_GOLDEN_SAVE_V6_PRIVATE.txt`.

Critérios:

- importa sem erro;
- nome recuperado;
- moedas recuperadas;
- combustível recuperado;
- descobertas recuperadas;
- habilidades recuperadas;
- missão não causa crash;
- Caderninho abre;
- jogo inicia.

> **Nenhuma migration deve ocorrer.**

---

# 31. REGRESSION CHECK — OBRIGATÓRIO

Antes de aprovar BUILD 01, validar manualmente:

1. Start desktop;
2. Start mobile portrait;
3. Intro;
4. Orientation Gate;
5. gameplay desktop;
6. gameplay mobile landscape;
7. touch direção;
8. IR;
9. ré;
10. missão;
11. chegada;
12. uma Chegada Viva;
13. posto;
14. garagem;
15. Caderninho;
16. Área dos Pais;
17. reload;
18. save v6.

---

# 32. ARQUIVOS PROVAVELMENTE PERMITIDOS

Esta lista é indicativa, não autorização para alterar todos.

Arquivos esperados:

```text
src/App.jsx
src/styles.css
src/components/StartScreen.jsx
src/components/IntroChegada.jsx
src/components/OrientationGuard.jsx
src/components/HUD.jsx
src/components/TouchControls.jsx
```

Possivelmente:

```text
src/components/OrbiCompanion.jsx
```

somente se necessário para apresentação visual e sem alterar semântica do core loop.

---

# 33. ARQUIVOS DE ALTO RISCO — NÃO TOCAR

```text
src/store/useGame.js
src/components/MissionController.jsx
src/components/MissionSensors.jsx
src/components/ArrivalSensor.jsx
src/components/ChegadaVivaPanel.jsx
src/missions/*
src/components/Car.jsx
src/components/FuelController.jsx
src/components/GasStation.jsx
src/components/Carona.jsx
```

Exceção:

Apenas se uma leitura comprovar que uma alteração visual mínima depende inevitavelmente de um desses arquivos.

Nesse caso:

> **NÃO ALTERAR. REPORTAR BLOCKER.**

---

# 34. POLÍTICA DE IMPLEMENTAÇÃO

Usar fatias pequenas.

Ordem recomendada:

## BUILD 01.A

Start Screen responsivo + shell.

Gate.

## BUILD 01.B

Orientation Gate v2.

Gate.

## BUILD 01.C

HUD v2.

Gate.

## BUILD 01.D

Touch Controls v2.

Gate.

## BUILD 01.E

Regression + save + build final.

Não implementar A+B+C+D em um único commit gigante.

---

# 35. COMMITS RECOMENDADOS

Exemplos:

```text
feat: make Orbi app shell responsive
```

```text
feat: scope orientation guard to gameplay
```

```text
feat: simplify golden gameplay HUD
```

```text
feat: simplify mobile driving controls
```

```text
test: validate build 01 regressions
```

---

# 36. PROIBIÇÃO DE “APROVEITAR E CORRIGIR”

Durante BUILD 01 podem aparecer:

- bugs antigos;
- nomes inconsistentes;
- CSS redundante;
- código legado;
- bundle grande;
- ideias de novas features.

Regra:

> **registrar, não corrigir.**

Somente corrigir se:

1. a regressão foi causada pelo BUILD 01; ou
2. o problema bloqueia diretamente um critério obrigatório desta fase.

---

# 37. EXPECTED UX AFTER BUILD 01

Ao terminar esta fase:

## Antes de jogar

A criança pode:

- abrir o Órbi em portrait;
- ver uma Start Screen adequada ao aparelho;
- rever introdução;
- acessar Área dos Pais.

## Ao iniciar gameplay

Se estiver portrait:

> Orientation Gate.

Ao virar:

> entra no mundo sem reset.

## Durante gameplay

A tela apresenta:

- mais mundo;
- menos sistema;
- objetivo ainda existente, porém menos dominante;
- moedas fora da HUD;
- combustível menos invasivo;
- Caderninho acessível;
- controles mobile simplificados.

## Core loop

Continua:

> missão → dirigir → chegar → interação atual.

A mudança para:

> curiosidade → exploração → descoberta

somente começa no BUILD 02.

---

# 38. NÃO CONFUNDIR BUILD 01 COM BUILD 02

## BUILD 01

> **Como a experiência aparece e é controlada.**

## BUILD 02

> **Quem dirige a experiência: missão ou curiosidade.**

Essa separação é obrigatória.

---

# 39. GATE DE APROVAÇÃO

BUILD 01 = PASS somente se todos os itens abaixo forem verdadeiros:

```text
Start desktop: PASS
Start portrait: PASS
Start landscape: PASS

Intro portrait: PASS
Intro landscape: PASS

Orientation Gate restrito ao gameplay: PASS
Rotation sem reset de simulação: PASS

HUD v2: PASS
Moedas fora da HUD: PASS
Combustível menos dominante: PASS
Missão funcional: PASS
Caderninho acessível: PASS

Touch Controls v2: PASS
Direção: PASS
IR: PASS
RÉ: PASS
Desktop keyboard: PASS

MissionController inalterado: SIM
MissionSensors inalterado: SIM
ChegadaViva inalterada: SIM
Core loop inalterado: SIM

Save version: v6
Save schema alterado: NÃO
Golden Save v6: PASS

npm test: 13/13 PASS
npm run build: PASS

Functional regressions críticas: ZERO
BUILD 02 iniciado: NÃO
```

---

# 40. CRITÉRIO DE FAIL

BUILD 01 = FAIL se ocorrer qualquer um:

- save v6 quebrado;
- missão quebrada;
- carro resetar ao rotacionar;
- Touch Controls não operarem;
- desktop piorar funcionalmente;
- intro ficar inacessível;
- Área dos Pais ficar inacessível;
- alterações em core loop;
- alteração silenciosa no schema;
- refactor de física;
- mudança em conteúdo educacional;
- nova feature fora de escopo.

---

# 41. SAÍDA OBRIGATÓRIA

Ao terminar, criar:

```text
docs/ORBI_BUILD_01_RESULT.md
```

Conteúdo mínimo:

- commits;
- arquivos alterados;
- antes/depois;
- screenshots;
- testes;
- build;
- save validation;
- regressões;
- known issues;
- PASS/FAIL;
- itens explicitamente não alterados.

---

# 42. INSTRUÇÃO DE EXECUÇÃO PARA CODEX

Usar esta seção como comando operacional.

> Execute **somente ÓRBI BUILD 01 — App Shell + Mobile UX v2** conforme este documento.
>
> Leia antes:
>
> - `ORBI_MASTER_PRODUCT_RECON.md`, se disponível no workspace;
> - `ORBI_RECON_03.1_Decision_Reconciliation_APPROVED.md`, se disponível;
> - `docs/ORBI_BUILD_00_GOLDEN_BASELINE.md`;
> - este `ORBI_BUILD_01_APP_SHELL_MOBILE_UX_SPEC.md`.
>
> Trabalhe exclusivamente na branch:
>
> `feature/orbi-golden-rebuild`
>
> Antes de alterar:
>
> - confirmar branch;
> - confirmar `git status`;
> - confirmar HEAD;
> - executar `npm test`;
> - executar `npm run build`.
>
> Não alterar:
>
> - core loop;
> - MissionController;
> - MissionSensors;
> - Chegada Viva;
> - save v6;
> - física;
> - câmera;
> - conteúdo.
>
> Execute em pequenas fatias:
>
> A. App Shell  
> B. Orientation Gate  
> C. HUD  
> D. Touch Controls  
> E. Regression
>
> Após cada fatia:
>
> - build;
> - validação;
> - commit isolado.
>
> Se qualquer mudança exigir tocar em sistema proibido:
>
> **PARE e reporte BLOCKED.**
>
> Não contorne o gate.
>
> Ao final:
>
> - `npm test`;
> - `npm run build`;
> - validar Golden Save v6;
> - criar `docs/ORBI_BUILD_01_RESULT.md`;
> - informar PASS/FAIL.
>
> **Pare após BUILD 01.**
>
> Não iniciar BUILD 02.

---

# 43. STATUS APÓS EMISSÃO DESTA SPEC

```text
RECON 01 — CONCLUÍDO
RECON 02 — CONCLUÍDO
RECON 03 — CONCLUÍDO
RECON 03.1 — APROVADO

BUILD 00 — PASS
BUILD 01 — GO SPEC EMITIDA
BUILD 01 — AINDA NÃO EXECUTADO
BUILD 02 — BLOQUEADO
```

---

# 44. PRINCÍPIO FINAL

O BUILD 01 não precisa deixar o Órbi “pronto”.

Precisa deixar uma coisa muito melhor:

> **a criança entra, entende e dirige com menos interface entre ela e o mundo.**

Se conseguirmos isso sem tocar no core loop, o BUILD 01 cumpriu sua função.
