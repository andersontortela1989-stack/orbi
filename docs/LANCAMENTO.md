# Lançamento — Órbi

> **APROVADO pelo Anderson em 27/09/2026**, com o escopo proposto pelo
> `docs/PLANO_MESTRE.md`. A aprovação do escopo **não** autoriza por si só
> nenhum push, merge, deploy ou compra de domínio: cada um continua exigindo
> autorização expressa no momento.

**Data-alvo: 04/10/2026 (domingo).**
**Último portão:** o teste com as crianças de 03/10/2026.

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
merge publica a versão nova **antes** do teste de 03/10 e do go/no-go de
04/10.

**Ação do Anderson no painel.** O merge não acontece enquanto este passo não
estiver confirmado.

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

## 2. Critérios de go / no-go (04/10)

Todos precisam ser **sim**:

- [ ] `npm test` verde na branch de produção.
- [ ] `npm run build` verde; `index-*.js` ≤ 200 kB e `GameExperience-*.js`
      ≤ 3.200 kB.
- [ ] Desempenho no celular **não pior** que a medição de base (A3.2), pela
      rota padrão.
- [ ] Teste de 03/10 com as crianças sem regressão: o que funcionava em 27/09
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
  precisa ser **conferido no painel** antes de 04/10.
- **Código:** o último commit aprovado da branch de produção é a referência.
  Nenhum `push --force`.
