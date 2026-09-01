# ÓRBI — BUILD 01 — APP SHELL + MOBILE UX v2 — RESULT

**Data da execução:** 01/09/2026

**Branch:** `feature/orbi-golden-rebuild`

**Baseline BUILD 00:** `2db05d6df0deaf3c741ce319ce4bc5fdb1b34e0e`

**Base imediata da implementação BUILD 01:** `99b29af419fa45f123a723ca459a7ae05a06b73f`

**Save contract:** v6

**Status deste documento:** PRONTO PARA REVISÃO INDEPENDENTE

**BUILD 01 PASS final:** NÃO DECLARADO

**BUILD 02:** NÃO INICIADO

---

## 1. Escopo executado

O BUILD 01 foi executado nas quatro frentes autorizadas pela SPEC:

1. App Shell responsivo;
2. Orientation Gate v2;
3. HUD v2;
4. Touch Controls v2.

A fatia 01.E foi limitada a regressão, save e build final. Nenhuma feature, polimento adicional ou mudança de UX foi introduzida durante 01.E.

O core loop permanece:

> missão → dirigir → chegar → interação atual

Nenhum trabalho do BUILD 02 foi iniciado.

---

## 2. Baseline BUILD 00

Referência: `docs/ORBI_BUILD_00_GOLDEN_BASELINE.md`.

O BUILD 00 registrou:

- baseline funcional `2db05d6df0deaf3c741ce319ce4bc5fdb1b34e0e`;
- 13/13 testes passando;
- production build passando;
- warning conhecido de bundle acima de 500 kB, não bloqueante;
- save v6 como contrato de persistência;
- Golden Save privado fora do Git;
- desktop, mobile landscape, Orientation Guard e Touch Controls funcionais.

---

## 3. Commits do BUILD 01

### BUILD 01.A — App Shell

`ab49101669bfb6207308a7ede961ebb45fd3ba3c`

`feat: make Orbi app shell responsive`

Arquivos:

- `src/components/StartScreen.jsx`;
- `src/styles.css`.

Gate informado: PASS.

### BUILD 01.B — Orientation Gate

`c26255a90622f8716cc893d5b56a594bc76c3ac4`

`feat: scope orientation guard to gameplay`

Arquivos:

- `src/App.jsx`;
- `src/components/OrientationGuard.jsx`;
- `src/ui/build01.js`;
- `tests/build01-ui.test.js`.

Gate informado: PASS.

### BUILD 01.C — HUD

`95142ed1c22376a44305802a743469db35869702`

`feat: simplify golden gameplay HUD`

Arquivos:

- `src/components/HUD.jsx`;
- `src/styles.css`;
- `src/ui/build01.js`;
- `tests/build01-ui.test.js`.

Gate informado: PASS.

### BUILD 01.D — Touch Controls

`c4b8747c7645c0c048b2eb0363d9abbe2e4d9230`

`feat: redesign Orbi mobile touch controls`

Arquivos:

- `src/components/TouchControls.jsx`;
- `src/styles.css`;
- `src/ui/build01.js`;
- `tests/build01-ui.test.js`.

Gate: PASS após validação humana em dispositivo touch real.

---

## 4. Arquivos modificados no BUILD 01

Comparação: `99b29af..c4b8747`.

- `src/App.jsx`;
- `src/components/HUD.jsx`;
- `src/components/OrientationGuard.jsx`;
- `src/components/StartScreen.jsx`;
- `src/components/TouchControls.jsx`;
- `src/styles.css`;
- `src/ui/build01.js`;
- `tests/build01-ui.test.js`.

Resumo acumulado:

```text
8 files changed, 354 insertions(+), 165 deletions(-)
```

Este documento é o único arquivo criado na fatia 01.E.

---

## 5. Antes e depois

### Antes — BUILD 00

- Start Screen funcional, porém composta como tela fixa escalada no mobile landscape;
- Orientation Guard associado de forma mais ampla à experiência;
- HUD com moedas, combustível, missão e ações competindo por atenção;
- touch com controles primários e secundários ocupando parcela maior da tela.

### Depois — BUILD 01

- Start Screen fluida em portrait e landscape;
- Orientation Gate restrito ao gameplay;
- Canvas/Rapier preservado durante a rotação após a primeira montagem;
- contador de moedas removido somente da representação da HUD;
- combustível saudável oculto e estados baixos tratados de forma contextual;
- missão preservada com apresentação menos dominante;
- direção touch agrupada à esquerda;
- `IR` dominante à direita;
- `RÉ` secundária e sempre acessível;
- DRIFT e buzina fora da superfície touch primária;
- teclado desktop, física e sistema de buzina preservados.

---

## 6. Testes automatizados

Comando executado antes do commit da 01.D e novamente no gate final:

```bash
npm test
```

Resultado observado:

```text
tests: 16
pass: 16
fail: 0
cancelled: 0
skipped: 0
todo: 0
```

Além dos 13 testes do baseline de save, três testes BUILD 01 validam:

- Orientation Gate somente no gameplay portrait;
- Touch Controls com ArrowLeft, ArrowRight, ArrowDown e ArrowUp, sem Space/KeyB na superfície touch;
- HUD de combustível oculto quando saudável e contextual quando baixo.

---

## 7. Production build

Comando:

```bash
npm run build
```

Resultado observado:

```text
vite v5.4.21
681 modules transformed
dist/assets/index-DevDQSKx.css  39.56 kB | gzip 6.91 kB
dist/assets/index-0OHYeOlc.js   3,273.17 kB | gzip 1,114.13 kB
final verification built in 16.97s
```

Status: PASS.

O warning conhecido de chunk acima de 500 kB permanece registrado e fora do escopo.

---

## 8. Validação desktop e browser local

Preview utilizado:

```bash
npm run preview -- --host 0.0.0.0 --port 4175 --strictPort
```

Evidências obtidas no build de produção:

- título e Start Screen carregaram no desktop;
- CTA `JOGAR` e Área dos Pais acessíveis;
- Intro exibiu `PULAR` e avançou para o gameplay;
- missão `PARQUE?` presente e preservada;
- Caderninho abriu com suas categorias existentes;
- aceleração por `ArrowUp` movimentou o carro/câmera;
- hint de teclado desktop e DRIFT permaneceu disponível;
- reload retornou à Start Screen com `introVista` preservado;
- novo `JOGAR` após reload entrou diretamente no gameplay;
- zero erros no console durante o smoke.

Não houve mudança nos handlers de teclado desktop, `Car.jsx`, Rapier ou física.

---

## 9. Orientation behavior e continuidade

Smoke executado no mesmo documento, sem reload entre rotações:

```text
landscape 844x390: Canvas count = 1
portrait 390x844:  Canvas count = 1 + Orientation Gate visível
landscape 844x390: Canvas count = 1 + Orientation Gate oculto
missão após ciclo: PARQUE?
```

Isso comprova que o Canvas permaneceu montado durante o ciclo e que o objetivo não foi reiniciado pelo gate.

Também foi validado:

- Start Screen em portrait sem Orientation Gate;
- gameplay portrait com `VIRE O CELULAR`;
- texto secundário `ASSIM FICA MAIS GOSTOSO DIRIGIR`;
- entrada no gameplay landscape após rotação.

---

## 10. Validação mobile/touch real

Validação humana concluída em celular real conectado ao preview pela rede local.

Resultado informado: PASS para todos os itens:

- controles aparecem no gameplay;
- esquerda e direita funcionam;
- `IR` acelera;
- `RÉ` funciona;
- `IR` é o controle principal;
- `RÉ` é secundária e acessível;
- DRIFT não aparece;
- buzina permanece secundária;
- controles preservam boa área jogável;
- dirigir continua possível;
- segurar mantém o comando;
- soltar interrompe o comando;
- soltar fora/cancelar não deixa comando preso;
- física e comportamento do carro permanecem normais;
- telas, modais e gameplay renderizam corretamente.

Foram fornecidas 11 capturas externas, mantidas fora do Git:

- 9 capturas landscape, `1600x702`;
- 2 capturas portrait, `702x1600`.

As capturas registram Start Screen, Área dos Pais, gameplay com os controles Golden v1 e diferentes Chegadas Vivas/modais educacionais. A validação anterior por DevTools também cobriu referências equivalentes a `844x390` e `740x360`; `915x412` permanece como referência de revisão visual adicional, não como mudança de código.

---

## 11. Save v6

### Evidência estrutural

- `SAVE_VERSION` permanece `6`;
- `src/save.js` não foi alterado;
- `src/store/useGame.js` não foi alterado;
- migrate, hydrate, import/export e partialize não foram alterados;
- nenhum campo persistido foi adicionado, removido ou renomeado.

Campos confirmados no round-trip real do build:

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

### Round-trip no preview

Resultado:

```text
version: 6
state presente: SIM
11/11 campos esperados: SIM
exportação: PASS
validação e resumo antes da importação: PASS
confirmação e reload: PASS
missão após import/reload: PARQUE?
jogo após import/reload: PASS
```

### Golden Save privado

O arquivo específico `ORBI_GOLDEN_SAVE_V6_PRIVATE.txt` não foi localizado no repositório, Downloads, Documents, OneDrive ou nas pastas usuais consultadas. A ausência é coerente com a regra de mantê-lo fora do Git, mas impede afirmar que esse artefato privado nominal foi importado nesta execução.

Portanto:

> Contrato e round-trip de save v6: PASS.
>
> Importação do artefato Golden Save privado nominal: PENDING por arquivo indisponível.

Nenhuma migration foi criada ou executada pelo BUILD 01.

---

## 12. Gates de proteção

Comparação de `99b29af..c4b8747` confirmou ausência de alterações em:

- `src/store/useGame.js`;
- `src/components/MissionController.jsx`;
- `src/components/MissionSensors.jsx`;
- `src/components/ArrivalSensor.jsx`;
- `src/components/ChegadaVivaPanel.jsx`;
- `src/missions/*`;
- `src/components/Car.jsx`;
- `src/components/FuelController.jsx`;
- `src/components/GasStation.jsx`;
- `src/components/Carona.jsx`;
- `src/save.js`;
- `package.json` e `package-lock.json`.

Confirmações:

- core loop alterado: NÃO;
- MissionController alterado: NÃO;
- MissionSensors alterado: NÃO;
- Chegada Viva alterada: NÃO;
- física/Rapier alterados: NÃO;
- comportamento do carro alterado: NÃO;
- câmera ortográfica alterada: NÃO;
- save schema alterado: NÃO;
- conteúdo pedagógico alterado: NÃO;
- economia/garagem/posto alterados: NÃO;
- BUILD 02 iniciado: NÃO.

---

## 13. Regression checklist da SPEC

| Item | Resultado | Evidência |
|---|---|---|
| Start desktop | PASS | smoke no preview |
| Start mobile portrait | PASS | dispositivo real + viewport 390x844 |
| Intro | PASS | fluxo e `PULAR` no preview; conteúdo inalterado |
| Orientation Gate | PASS | somente gameplay portrait |
| Gameplay desktop | PASS | Canvas, missão e direção |
| Gameplay mobile landscape | PASS | dispositivo touch real |
| Touch direção | PASS | validação humana real |
| IR | PASS | validação humana real |
| RÉ | PASS | validação humana real |
| Missão | PASS | `PARQUE?` antes/depois de rotação e reload |
| Chegada | PASS informado | gameplay e modais reais; sensores inalterados |
| Uma Chegada Viva | PASS informado | múltiplas capturas reais; componente inalterado |
| Posto | baseline preservado | lógica e componentes inalterados; não reexecutado isoladamente em 01.E |
| Garagem | baseline preservado | lógica e componentes inalterados; não reexecutado isoladamente em 01.E |
| Caderninho | PASS | abriu no preview após mudanças |
| Área dos Pais | PASS | desktop + dispositivo real |
| Reload | PASS | introVista, missão e gameplay preservados |
| Save v6 | PASS de contrato / Golden PENDING | 16 testes + round-trip real; artefato privado ausente |

---

## 14. Regressões e limitações conhecidas

### Regressões observadas

Nenhuma regressão crítica foi observada no escopo efetivamente exercitado.

### Limitações conhecidas

1. O warning de bundle acima de 500 kB permanece, conforme baseline e SPEC.
2. A detecção touch continua avaliada no carregamento do módulo; não foi criado workaround.
3. O Golden Save privado nominal não estava disponível para importação nesta execução.
4. Posto e garagem foram protegidos por diff e permanecem no baseline, mas não tiveram seus painéis reexecutados isoladamente durante o smoke automatizado da 01.E.
5. A aprovação final depende de revisão independente destas evidências.

---

## 15. Status proposto

```text
BUILD 01.A: PASS
BUILD 01.B: PASS
BUILD 01.C: PASS
BUILD 01.D: PASS
BUILD 01.E: EXECUTADA / EVIDÊNCIAS REGISTRADAS

npm test: 16/16 PASS
npm run build: PASS
git diff --check: PASS nos gates da 01.D e 01.E
Save v6 contract: PASS
Golden Save privado nominal: PENDING — arquivo indisponível
Regressões críticas observadas: ZERO no escopo exercitado
BUILD 02 iniciado: NÃO

BUILD 01 PASS FINAL: NÃO DECLARADO
STATUS: PRONTO PARA REVISÃO INDEPENDENTE
```
