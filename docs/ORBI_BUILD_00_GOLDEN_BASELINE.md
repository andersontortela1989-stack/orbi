# ÓRBI — BUILD 00 — GOLDEN BASELINE LOCK

**Projeto:** Órbi — um mundo pra descobrir  
**Fase:** BUILD 00 — Golden Baseline Lock  
**Data:** 01/09/2026  
**Status:** PASS  
**Objetivo:** registrar um baseline técnico, funcional e visual reproduzível antes de qualquer alteração do Golden Rebuild.

---

# 1. REGRA DESTA FASE

BUILD 00 é exclusivamente um checkpoint de contenção.

Nesta fase:

- NÃO foi alterado gameplay;
- NÃO foi alterado HUD;
- NÃO foi alterado `MissionController`;
- NÃO foi alterado `MissionSensors`;
- NÃO foi alterado `ChegadaVivaPanel`;
- NÃO foram alterados Touch Controls;
- NÃO foram alteradas moedas;
- NÃO foi alterado Caderninho;
- NÃO foi alterada Área dos Pais;
- NÃO foi alterado save;
- NÃO foi feito refactor;
- NÃO foi iniciada implementação do BUILD 01.

> **Functional changes realizadas: ZERO**

---

# 2. REPOSITÓRIO

**Repositório remoto:**  
`https://github.com/andersontortela1989-stack/orbi`

**Pasta local confirmada:**  
`C:\Users\ander\Cidade-Turbo-3D`

**Branch base:**  
`main`

**Branch do Golden Rebuild:**  
`feature/orbi-golden-rebuild`

**Baseline SHA:**  
`2db05d6df0deaf3c741ce319ce4bc5fdb1b34e0e`

A branch `feature/orbi-golden-rebuild` foi criada e enviada ao remoto apontando para o mesmo commit do baseline.

**Estado do working tree no checkpoint:**  
`clean`

**Rollback remoto:**  
SIM

---

# 3. TEST BASELINE

Comando executado:

```bash
npm test
```

Resultado:

```text
tests: 13
pass: 13
fail: 0
cancelled: 0
skipped: 0
todo: 0
```

## Status

> **13/13 PASS**

Os testes existentes concentram-se principalmente na infraestrutura de save.

Casos validados incluem:

- primeiro acesso sem save;
- save vazio/corrompido;
- backup de corrupção;
- shape parcial;
- save válido;
- recusa de versão futura;
- validação de import;
- resumo de descobertas;
- backup antes de substituição;
- export/import byte a byte.

---

# 4. PRODUCTION BUILD BASELINE

Comando executado:

```bash
npm run build
```

Resultado:

```text
vite v5.4.21
680 modules transformed

dist/index.html
dist/assets/index-BlHqHpOS.css
dist/assets/index-8wm_X6KJ.js

build: PASS
```

## Warning conhecido

O Vite reportou bundle JavaScript acima de 500 kB após minificação.

Baseline observado:

```text
JS ~ 3.27 MB
gzip ~ 1.11 MB
```

Mensagem:

```text
Some chunks are larger than 500 kB after minification.
```

### Decisão

> **WARNING REGISTRADO — NÃO BLOQUEANTE**

Não corrigir neste BUILD.

Code splitting / `manualChunks` / redução de bundle ficam fora do escopo do Golden Baseline Lock.

---

# 5. PREVIEW VALIDATION

Comando:

```bash
npm run preview
```

URL local utilizada:

```text
http://localhost:4173/
```

O build de produção foi validado visualmente através do `vite preview`.

---

# 6. SAVE CONTRACT — V6

O contrato de persistência atual foi preservado.

Campos persistidos no baseline:

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

## Golden Save

Foi criado um save privado de referência:

```text
ORBI_GOLDEN_SAVE_V6_PRIVATE.txt
```

### Regra

Este arquivo deve permanecer fora do GitHub público.

Ele serve como:

- prova de compatibilidade futura;
- save de restauração;
- referência para BUILD 01–03;
- teste manual de migração/hidratação.

> **Golden Save v6: CRIADO**

---

# 7. VISUAL BASELINE — DESKTOP

Foram registrados visualmente os principais estados atuais do produto.

## Abertura

Validado:

- logo Órbi;
- tagline “um mundo pra descobrir”;
- personagem;
- CTA JOGAR;
- Área dos Pais.

## A Chegada

Validado:

- introdução narrativa;
- foguete;
- chegada à Terra;
- entrada do nome;
- fala “me mostra teu mundo?”;
- CTA VAMOS.

## Gameplay

Validado:

- câmera ortográfica;
- cidade;
- carro;
- landmarks;
- HUD;
- missão central;
- moedas;
- combustível;
- Caderninho;
- Órbi Companion.

## Missões / feedback

Validado:

- objetivo GPS;
- `CHEGAMOS!`;
- `ACHAMOS!`;
- mudança automática de objetivo.

## Chegadas Vivas

Foram observados exemplos de:

### Estádio

Formato atual:

> pergunta + três bandeiras/opções.

### Mercado

Formato atual:

> pergunta de cor + três frutas/opções.

### Padaria

Formato atual:

> “quantos pães?” + três números/opções.

Essas telas compõem a evidência visual “ANTES” do MicroScene Engine.

---

# 8. OUTROS SISTEMAS VISUALMENTE REGISTRADOS

## Caderninho

Validado em:

- estado praticamente vazio;
- estado parcialmente preenchido;
- categorias;
- slots com `?`;
- cards de descobertas.

### Observação de produto

A inversão narrativa já existe:

> **“O QUE O ÓRBI DESCOBRIU COM [NOME]”**

O redesign futuro deve preservar esse princípio.

O baseline evidencia também grande quantidade de slots vazios simultaneamente.

---

## Área dos Pais

Validado:

- “O que é o Órbi”;
- princípios de design;
- nota honesta;
- save/export;
- import;
- formulário de feedback;
- assinatura do projeto.

---

## Garagem / economia

Validado:

- pintura do carro;
- cores;
- preço em moedas;
- compra contextual.

O sistema permanece fora do Golden Core inicial, mas não será removido.

---

## Posto / abastecimento

Validado:

- quantidade de litros faltantes;
- slots de contagem;
- ação `+1 LITRO`;
- progressão até o total.

### Insight registrado

A interação do posto é uma referência interna útil porque envolve:

> **fazer uma ação / contar**

em vez de apenas selecionar uma resposta entre três cartões.

---

# 9. MOBILE BASELINE

## Portrait

Perfis testados visualmente incluem:

- iPhone 12 Pro;
- iPad Pro.

### Orientation Guard

Resultado:

> **PASS**

Mensagem atual:

> “Vire o celular na horizontal pra brincar!”

O guard bloqueia o gameplay em portrait.

---

## Landscape

Perfis observados:

- iPad Pro;
- iPhone 12 Pro;
- iPhone 15 Pro Max;
- Pixel 7;
- Samsung Galaxy S8+;
- Galaxy Z Fold 5.

Resultado geral:

> **GAMEPLAY LANDSCAPE: PASS**

---

# 10. TOUCH CONTROLS BASELINE

Na primeira emulação mobile, os controles não apareceram porque o projeto havia sido carregado inicialmente em contexto desktop.

Após recarregar a aplicação já com a emulação táctil ativa, os Touch Controls foram exibidos corretamente.

Isso é compatível com a implementação atual, que calcula a condição de dispositivo táctil no carregamento do módulo.

## Controles observados em viewport baixo

- VIRA esquerda;
- VIRA direita;
- RÉ;
- ACELERA.

Em alturas menores, os quatro controles essenciais ficam visíveis.

## Status

> **TOUCH CONTROLS: PASS**

### Observação para BUILD 01

O baseline confirma visualmente que HUD + missão + controles ocupam parcela relevante do viewport mobile.

Isso sustentará o redesign:

> **mundo > Órbi > sistema**

---

# 11. BASELINE UX — PRINCIPAIS EVIDÊNCIAS

O BUILD 00 não altera UX, mas registra os fatos observados.

## 11.1 Start Screen

A composição funciona, porém se comporta visualmente como uma tela fixa escalada em landscape mobile.

Isso será comparado ao App Shell responsivo do BUILD 01.

## 11.2 HUD

Elementos de alta atenção simultâneos:

- moedas;
- combustível;
- missão;
- Caderninho;
- clima/estado;
- Carona quando ativa;
- Touch Controls em mobile.

## 11.3 Moedas

Além do contador da HUD, as moedas aparecem fisicamente no mundo.

## 11.4 Chegadas Vivas

Os exemplos observados são visualmente consistentes, porém seguem o padrão:

> **pergunta → três respostas → escolha**

Essa é a fotografia oficial “ANTES” das Microcenas.

## 11.5 Caderninho

O painel possui personalidade e narrativa correta, mas o estado atual exibe muitos slots vazios e ocupa grande parte do viewport.

---

# 12. TEST COVERAGE GAP

Cobertura automatizada confirmada para save.

Não foi identificada cobertura equivalente neste baseline para:

- `MissionController`;
- `MissionSensors`;
- `processarChegada()`;
- HUD;
- Touch Controls;
- `ChegadaVivaPanel`;
- futuras Microcenas.

### Decisão

Isso não bloqueia BUILD 00.

Aumenta a importância do método:

> **mudança pequena → build → validação manual → commit → gate**

---

# 13. KNOWN TECHNICAL ITEMS — NÃO CORRIGIDOS

Registrados para referência:

1. bundle JS grande;
2. ausência de cobertura automatizada ampla fora do save;
3. Touch Controls dependem da detecção táctil feita no carregamento do módulo;
4. mobile landscape ainda herda alta densidade de HUD/sistema;
5. experiência atual permanece mission-driven;
6. Chegadas Vivas permanecem quiz-driven.

Nenhum destes itens foi corrigido no BUILD 00.

---

# 14. ROLLBACK CONTRACT

Rollback point confirmado:

```text
2db05d6df0deaf3c741ce319ce4bc5fdb1b34e0e
```

Branch remota:

```text
origin/feature/orbi-golden-rebuild
```

Em caso de regressão futura, esse commit representa o Golden Baseline anterior ao rebuild.

---

# 15. BUILD 00 — FINAL GATE

```text
BUILD 00 — PASS

Baseline reproduzível: SIM
Branch de rebuild: feature/orbi-golden-rebuild
Baseline SHA: 2db05d6df0deaf3c741ce319ce4bc5fdb1b34e0e

Working tree no baseline: CLEAN
Remote rollback: SIM

Tests: 13/13 PASS
Production build: PASS
Bundle warning: REGISTRADO / NÃO BLOQUEANTE

Save v6 preservado: SIM
Golden Save v6 privado: CRIADO

Desktop baseline: PASS
Abertura / Intro: PASS
Gameplay: PASS
HUD: PASS
Caderninho: PASS
Área dos Pais: PASS
Garagem: PASS
Posto: PASS
Padaria: PASS
Mercado: PASS
Estádio: PASS

Mobile portrait: PASS
Orientation Guard: PASS
Mobile landscape: PASS
Touch Controls: PASS

Functional changes realizadas: ZERO

BUILD 01: NÃO INICIADO
```

---

# 16. STATUS DO PROJETO APÓS ESTE CHECKPOINT

**RECON 01 — CONCLUÍDO**  
State Recovery & Product Diagnosis

**RECON 02 — CONCLUÍDO**  
Product & UX Rebuild Blueprint

**RECON 03 — CONCLUÍDO**  
Golden UX Specification

**RECON 03.1 — APROVADO**  
Decision Reconciliation & Migration Impact  
Technical Gate: PASS

**BUILD 00 — PASS**  
Golden Baseline Lock

**PRÓXIMO GATE:**

> **BUILD 01 — App Shell + Mobile UX v2**

BUILD 01 permanece não iniciado até autorização explícita.

---

# PRINCÍPIO DE CONTINUIDADE

A partir deste checkpoint:

> **nenhuma melhoria futura será comparada com uma lembrança subjetiva do jogo antigo.**

Ela será comparada com este baseline reproduzível.

Esse é o ponto oficial “ANTES” do Órbi Golden Rebuild.
