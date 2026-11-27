# Lançamento — Órbi

> **APROVADO pelo Anderson em 27/09/2026**, com o escopo proposto pelo
> `docs/PLANO_MESTRE.md`. A aprovação do escopo **não** autoriza por si só
> nenhum push, merge, deploy ou compra de domínio: cada um continua exigindo
> autorização expressa no momento.

**Data-alvo: 12/10/2026 (segunda-feira, Dia das Crianças).**
**Último portão:** o teste com as crianças de 10/10/2026.

---

## 0. Decisões do Anderson (27/09/2026)

| Código | Decisão |
|---|---|
| **E5** | Mesclar `codex/activity-coordinator-p0` na `main` **por PR revisado**. Tem um pré-requisito obrigatório (ver abaixo). |
| **C1** | Botão fixo no canto do HUD **e** dentro dos painéis de pergunta. Repete a última fala da **atividade em foco**. Fica desabilitado com a voz desligada. |
| **Testes com as crianças** | **30/09/2026** (curto) e **03/10/2026** (completo). |
| **C4** | Manter o balão da carona como está. Reabrir só se houver confusão. |
| **B3** | Entra só se os **nomes dos bichos forem escolhidos pelas crianças** até 30/09/2026. Sem isso, fica para depois do lançamento. |

### Pré-requisito obrigatório de E5.2 (antes do merge)

**Desconectar o repositório no painel da Vercel, ou pausar seus deploys.**

A Vercel está ligada à `main`. Segundo o Anderson, o painel indica que um push
na `main` atualiza a produção de `orbi-kahe.vercel.app`. Sem esse passo, o
merge publica a versão nova **antes** do teste de 10/10 e do go/no-go de
11/10.

**Ação do Anderson no painel.** O merge não acontece enquanto este passo não
estiver confirmado.

**Confirmado em 28/09/2026:** o projeto `orbi-kahe` gera prévia automática a
cada push, em qualquer branch (ex.: deployment `5944kBqzB`, commit `3a1fafa`;
a branch congelada `feature/orbi-golden-rebuild` tem prévia desde 20/09). O
push de 28/09 aparece ligado a 2 projetos na Vercel; o segundo ainda não foi
identificado. Antes do merge, identificar os dois e desconectar ou pausar
ambos.

---

## 1. Escopo proposto

### 1.1 Obrigatório — sem isto, não há lançamento

| Código | Entrega | Por quê |
|---|---|---|
| A6.1 | `esbuild` em `devDependencies` | A suíte de testes não pode depender de acaso |
| A3.1–A3.2 | Medidor `?medir=1` e medição de base no celular | Sem número não há decisão de "go" sobre desempenho |
| A1.1–A1.3 | Teste de folgas, pares PIZZA↔POSTO e ZOO↔VET separados, zoom de toque 11 | Resposta direta à observação "lugares muito próximos" |
| A4.1 | Aviso de virar o celular também na abertura e na intro | Primeira tela vista pela criança |
| E5.1–E5.2 | Branch de produção definida (merge na `main` por PR) e aplicada; **antes do merge, Vercel desconectada ou pausada** (§0) | Uma única fonte do que está no ar |
| E4.1 | Site na Netlify publicando só a branch de produção | Endereço oficial |
| E6.1–E6.2 | README e textos públicos coerentes com o jogo | O README atual promete Horta, "repartir" e faixas etárias, que não estão no jogo |

### 1.2 Desejável — entra se couber, sai primeiro se atrasar

Estão na ordem em que saem:

| Código | Entrega |
|---|---|
| E1.1 | Página do universo, primeira versão, no subdomínio da Netlify |
| C1.1–C1.2 | Botão de repetir a última fala do Órbi (design decidido em 27/09, ver §0) |
| A2.3–A2.4 | Identidade do HOSPITAL (ambulância) e da ESCOLA (balanço) |
| A2.1–A2.2 | Identidade da PADARIA (pães na vitrine) e do PORTO (barcos) |
| A3.3 | Correção da maior causa de travada, **se a medição apontar uma causa clara** |
| A5.2 | Ajuste do painel transparente, **se** o teste do item A5.1 mostrar que é bug |
| E4.2 | Domínio oficial e SSL, **só se** a busca no INPI (E3.1) estiver concluída e favorável |

### 1.3 Decisões que acompanham o lançamento, sem código

- **C4:** manter o balão da carona como está (decidido em 27/09). O teste de
  27/09 registrou "sem confusão".
- **B3:** fora do escopo, a menos que as crianças escolham os nomes dos bichos
  até 30/09 (decidido em 27/09).
- **D1:** a regra "a cidade cresce com a criança" vira item obrigatório do
  checklist de toda fatia.
- **E3.1:** busca preliminar da marca no INPI, feita pelo Anderson.
- **E4.3:** destino do Vercel e do Cloudflare Pages. A proposta é mantê-los no
  ar até o endereço novo ser validado e só então redirecionar.

### 1.4 Fora deste lançamento (nada é descartado)

A1.4 em diante, A2.5 em diante, A7, B1 a B7, C2, C3, C5, D1.1, E1.2, E2.
Ordem e motivo na §7 do plano mestre.

---

## 2. Critérios de go / no-go (11/10)

Todos precisam ser **sim**:

- [ ] `npm test` verde na branch de produção.
- [ ] `npm run build` verde; `index-*.js` ≤ 200 kB e `GameExperience-*.js`
      ≤ 3.200 kB.
- [ ] Desempenho no celular **não pior** que a medição de base (A3.2), pela
      rota padrão.

      **Definição de "não pior"** (decidida em 28/09/2026, antes da medição
      de base):
      - **Base:** as 6 rodadas da A3.2 (29/09), build `c8aca64`.
      - **Comparação:** nova medição do build candidato em 10/10 (A3.4), com
        o **mesmo** protocolo: mesmo celular, rota padrão, 3 rodadas com e 3
        sem Modo Tranquilo, notas de protocolo de `TESTES_COM_CRIANCAS.md`.
      - **"Não pior"** = em **cada** modo: (a) a mediana das 3 rodadas da %
        de quadros acima de 50 ms fica no máximo 1 ponto percentual acima da
        mediana da base; (b) o total de travadas acima de 250 ms nas 3
        rodadas fica no máximo 1 acima do total da base.
      - Se um dos modos não cumprir, é no-go de desempenho até a causa ser
        investigada.
      - Não há limite absoluto de desempenho para o lançamento; o alvo
        absoluto vale só para decidir a A3.3 (ficha A3 do `PLANO_MESTRE.md`).

      **Revisão de 01/10/2026:** a medição de base de 29/09 não foi
      registrada. A base passa a ser medida em 10/10, na **mesma** sessão do
      candidato:
      - **base** = deployment `5944kBqzB` (commit `3a1fafa`, código idêntico
        a `c8aca64`), no endereço fixo
        `orbi-kahe-aejxe15zy-androm.vercel.app`;
      - **candidato** = deployment do build congelado.

      Mesmo celular, mesma rota, 3 rodadas com e 3 sem Modo Tranquilo para
      **cada** build (12 no total), alternando base e candidato. A regra de
      "não pior" continua a mesma. O deployment `5944kBqzB` não pode ser
      apagado até o go/no-go de 11/10.

- [ ] Teste de 10/10 com as crianças sem regressão: o que funcionava em 27/09
      continua funcionando, e elas querem jogar de novo.
- [ ] Nenhum item do checklist de princípios (§2.6 do plano) violado nas
      fatias entregues.
- [ ] Tabela de coerência (§3) toda verdadeira.
- [ ] Save de 27/09 migrado sem perda, se alguma fatia tiver mudado o save.
      Pelo escopo proposto, **nenhuma muda**.
- [ ] Vercel desconectada ou com deploys pausados **antes** do merge (§0).
- [ ] Autorização expressa do Anderson para o merge e para o deploy.

**No-go** mantém o que está no ar hoje e remarca a data. Não é fracasso: é a
regra "uma fatia por vez" aplicada ao lançamento.

---

## 3. Tabela de coerência dos textos públicos

A ser preenchida em E6.2 e conferida a cada lançamento.

| Afirmação | README | Área dos Pais | Página (E1) | Verdade no jogo? |
|---|---|---|---|---|
| Sem anúncios, sem compras, sem cadastro | sim | sim (`AreaPais.jsx:186`) | a definir | **Sim**, hoje |
| Progresso salvo só no aparelho | sim | sim | a definir | **Sim** |
| Cuidar de uma horta | **sim** | não | a definir | **Não** nesta base, porque a Horta não tem gatilho |
| Repartir | **sim** | não | a definir | **Não** nesta base, porque só a Horta usa `distribuir` |
| Faixas etárias "que aparecem no jogo" | **sim** | não | a definir | **Não**, porque nenhuma tela mostra faixa |
| Alinhamento à BNCC ou domínio de conteúdo | não | não | **proibido** sem matriz revisada por profissional | — |

---

## 4. Plano de volta

- **Save:** exportar o save do celular pela Área dos Pais **antes** de
  instalar a versão nova.
- **Publicação:** republicar o deploy anterior no painel da Netlify. O recurso
  precisa ser **conferido no painel** antes de 12/10.
- **Código:** o último commit aprovado da branch de produção é a referência.
  Nenhum `push --force`.

---

## 5. Mudança de escopo (28/09/2026)

- **Entra como obrigatório: R1, roteiro "Um dia do Órbi" (peça 1).** A ordem
  fixa das missões substitui o sorteio que, no teste de 28/09, levou 5 a 6
  vezes ao VET em cerca de 5 minutos. Lista: PADARIA → ESCOLA → ESTÁDIO → busca
  do GATO → ZOO → VET → MERCADO → PIZZA, e recomeça. Detalhes na §9 do
  `PLANO_MESTRE.md`.
- **Saem do lançamento:** A2.2 (PORTO) e A2.3 (HOSPITAL), porque os dois
  lugares ficaram fora do dia.
- **Continua valendo:** C4 (balão da carona como está). Carona, aventura da
  água e horta funcionam como antes.
- **Ideias para depois, não aprovadas:** peça 2 (carona, busca e aventura como
  paradas) e peça 3 (momentos novos e reação a visita livre).

---

## 6. Estilo visual (02/10/2026)

02/10/2026 — Decisão do Anderson: o estilo visual passa a ser mais realista,
mais próximo do mundo real e mais vivo, dentro do lançamento de 12/10
(substitui "estilo realista: não agora"). Execução com ponto de retorno:

1. fatia vertical de um quarteirão (PADARIA, MERCADO, rua entre eles, carro)
   atrás da chave `?estilo=real`, com o estilo atual intacto;
2. teste A/B com as crianças e medição dos dois estilos em 04/10;
3. decisão do estilo em 05/10: expandir para a cidade ou lançar no estilo
   atual com a PADARIA refinada.

A regra "não pior que a base" do go/no-go vale também para o estilo novo,
salvo decisão explícita do Anderson em contrário.

---

## 7. Data de lançamento (02/10/2026)

02/10/2026 — data de lançamento alterada de 04/10 para 12/10/2026
(segunda-feira, Dia das Crianças), por decisão do Anderson. O escopo não cresce
com o prazo além do já registrado (§6 estilo, A2.4 ESCOLA, A3.3 se a medição
cair no caso B). Continuam fora, salvo revisão explícita do Anderson: E1, A5.2,
A2.2, A2.3 e iniciativas novas.
