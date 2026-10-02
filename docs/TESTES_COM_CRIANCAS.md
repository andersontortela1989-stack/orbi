# Testes com crianças — Órbi

Registro do que foi observado jogando com as crianças. Uma seção por sessão,
da mais recente para a mais antiga. É observação, não decisão: o que vira
trabalho vai para uma fatia; o que fica em aberto vai para
`docs/DIVIDA_TECNICA.md`.

Cada sessão diz **quando**, **com quem**, **em que condições** e **o que foi
visto**. As observações do pai ficam separadas das reações das crianças.

---

## Teste intermediário de 04/10/2026 — A/B de estilo

- A/B de estilo: qual as crianças preferem (observar, não perguntar "qual é
  mais bonito" de forma indutiva);
- reconhecem a PADARIA e o MERCADO sem placa em cada estilo?;
- o que chamam de "de verdade";
- medição de desempenho nos dois estilos pela rota padrão, resumos colados no
  repositório no mesmo dia.
- Copiar o resumo completo; as listas de picos por atividade substituem a
  anotação manual do trecho, que continua opcional.

**V1 — PADARIA no estilo real (`?estilo=real`)**

- [ ] A PADARIA real é reconhecida sem a placa.
- [ ] Sem o contorno de adesivo, tudo continua legível no celular.
- [ ] O carro passa sob o toldo sem parecer atravessá-lo.

### Roteiro executável do A/B (04/10)

**Endereços**

- Prévia da Vercel da branch (https), com e sem `&estilo=real`.
- Base de desempenho: deployment `5944kBqzB`.
- V1.4 (carro real) fica fora do A/B.

**Ordem**

- Uma criança começa pelo estilo real e a outra pelo atual.
- Cerca de 5 min por estilo.
- Levar cada uma ao quarteirão PADARIA/MERCADO pela missão do roteiro.

**Observar, sem perguntas indutivas**

- [ ] Reconhecem PADARIA e MERCADO sem a placa?
- [ ] Notam a banca?
- [ ] Estranham o contraste entre o quarteirão real e o resto?
- [ ] O carro some de vista?
- [ ] O que pedem para jogar de novo?

**Medição no celular (só o Anderson)**

- Rota padrão.
- 3 rodadas com e 3 sem Modo Tranquilo no estilo atual (critério da A3.3) + 3
  sem Modo Tranquilo no estilo real.
- Resumo completo, com as listas da M1 e da M1b, colado no repositório no
  mesmo dia.

**Decisão de 05/10**

- Estilo real para a cidade ou lançamento no estilo atual.
- Critérios: reconhecimento, reação das crianças e desempenho ("não pior" vale
  para o estilo real).

---

## Roteiro do teste geral de 10/10/2026

**Registro honesto.** 29/09 e 30/09: medição e teste curto realizados,
resultados não registrados.

**Regra.** Cada fatia, até o congelamento do código (fim de 09/10), acrescenta
aqui os seus itens de verificação manual.

**Medição (A3.4).** 12 rodadas, base × candidato, pelo protocolo de
`docs/LANCAMENTO.md` §2 (revisão de 01/10) e pelas notas de protocolo da
seção "Medições de desempenho".

### Lista única de verificação no celular

**A4.1 — aviso de virar o celular na abertura**

- [ ] Com o celular em pé, o aviso 🔄 aparece na abertura.
- [ ] Ao virar para paisagem, o aviso some sozinho, sem toque.
- [ ] Com o Modo Tranquilo ligado, o aviso é o mesmo e fica parado.
- [ ] Com a Área dos Pais aberta em paisagem, virar para retrato não põe o
      aviso por cima dela.

**A1.3 — zoom de toque**

- [ ] O carro está maior que no teste de 27/09.
- [ ] As placas são legíveis ao chegar perto de cada lugar.
- [ ] Velocidade aparente: com o zoom maior, o carro parece rápido demais?

**A1.2b — lugares separados**

- [ ] PIZZA e VET aparecem nas posições novas.
- [ ] O VET é fácil de alcançar.
- [ ] O cão da carona não embarca ao chegar à PIZZA pelo sul.

**R1 — roteiro "Um dia do Órbi"**

- [ ] A ordem do dia é seguida (PADARIA → ESCOLA → ESTÁDIO → GATO → ZOO → VET
      → MERCADO → PIZZA).
- [ ] Dá para perceber o rumo de cada parada.
- [ ] ESCOLA e PIZZA prendem a atenção.
- [ ] Anotar as tentativas de visitar lugares fora do dia.

**A2.1 — identidade da PADARIA**

- [ ] Num print com a placa coberta, um adulto reconhece a PADARIA.
- [ ] Os pães na vitrine dão para ver no celular, com o zoom de toque.
- [ ] O pão no telhado aparece de longe.
- [ ] Com o Modo Tranquilo ligado, os pães continuam lá, parados.
- [ ] A chegada à PADARIA (pergunta de contagem 🍞) funciona igual a antes, e
      o carro não bate em nada novo.
- [ ] O carro não atravessa os pães da vitrine ao encostar na PADARIA.
- [ ] Observação: as crianças dizem "pão" ou "padaria" antes da fala do Órbi?
- [ ] Os pães da vitrine não são confundidos com moedas (a criança não tenta
      coletá-los).
- [ ] O pão do telhado é reconhecido como pão de vários ângulos.

**C1 — botão de repetir a fala (🔊)**

- [ ] O botão aparece no HUD e nos painéis de pergunta (chegada viva e
      pergunta da aventura).
- [ ] Repete a última fala certa (a da atividade em foco).
- [ ] Não aparece ativo com a voz desligada.
- [ ] Observação: a criança encontra o botão sozinha?
- [ ] Toques repetidos não empilham falas.
- [ ] Depois de sair e voltar ao app, o 🔊 repete o pedido atual.
- [ ] Trocar o céu não muda o que o 🔊 repete.

**F1 — objetivo da aventura falado**

- [ ] Na aventura do parque, depois da pergunta, o Órbi diz aonde ir; o 🔊
      repete o objetivo.
- [ ] Ao terminar a aventura, o Órbi volta a pedir a mesma parada do roteiro, e
      o 🔊 repete esse pedido (não o último objetivo da aventura).

---

## 28/09/2026 — teste do Anderson no notebook (sem as crianças)

**Condições.** `npm run dev` no notebook, Chrome, com a fatia A1.2b aplicada
(PIZZA, VET e cão da carona nas posições novas). Cerca de 5 minutos.

**Com quem.** Anderson, adulto. Sem as crianças.

### O que foi visto

| Ponto | Resultado |
|---|---|
| **Sequência das missões** | **Confusa.** O jogo levou 5 a 6 vezes ao VET em cerca de 5 minutos, numa ordem sem sentido (VET → FAROL → VET). |
| **Causa** | A próxima missão era sorteada: 50% leitura, 25% ciências (sempre no VET) e 25% busca. |
| **A1.2b (roteiro manual)** | O início não disparou a carona; chegar à PIZZA pelo sul com a missão PIZZA ativa **não** embarcou o cão; a carona completa funcionou. |

### Decisão que saiu deste teste

O sorteio dá lugar a um **roteiro fixo, "Um dia do Órbi"** (fatia R1):
PADARIA → ESCOLA → ESTÁDIO → busca do GATO → ZOO → VET → MERCADO → PIZZA, e
recomeça. Detalhes na §9 do `docs/PLANO_MESTRE.md`.

### O que observar em 30/09, com as crianças

- A **ordem do dia faz sentido** para eles? (café → escola → bola → gatinho →
  bichos → veterinário → mercado → jantar)
- **ESCOLA e PIZZA**, que são só leitura, sem atividade na chegada, **prendem a
  atenção**?
- Eles **tentam visitar lugares fora do dia** (PARQUE, PORTO, FAROL, HOSPITAL)?
  Hoje, chegar a um lugar que não foi pedido não produz nenhuma reação.
- O **VET continua fácil de alcançar**? (item 17 da dívida técnica: ele ficou
  cerca de 8,6 fora da rua mais próxima)

---

## 27/09/2026 — build de produção no celular

**Condições.** Build de produção (`npm run build` + `npm run preview -- --host`),
aberto num celular Android pela rede Wi-Fi local. Branch
`codex/activity-coordinator-p0`, commit `f954952`.

**Com quem.** Heitor e Higor (3 anos e 9 meses).

### O que foi visto

| Ponto | Resultado |
|---|---|
| **Garagem** | O botão VOLTAR À CIDADE foi fácil de acertar. OK. |
| **Desempenho** | Rodou liso na maior parte do tempo; travou em cerca de 10% do tempo. |
| **Parque** | As flores deixaram o parque mais atrativo e foram notadas. |
| **Carona** | Sem confusão com a missão ativa. |
| **Higor** | Dirigiu bem para a idade. |
| **Voltar a jogar** | Os dois quiseram jogar de novo. |

### Observações do pai

- **Proporções precisam de ajuste** — tamanho do carro e tamanho dos lugares.
- **Lugares muito próximos** uns dos outros.
- **Lugares genéricos demais** — precisam de mais identidade.

### Ligações com a dívida técnica

- **Carona sem confusão** é a primeira observação com criança sobre o item 5
  (balão da carona durante missão ativa), que estava pendente exatamente disso.
- **Travadas em ~10% do tempo** é a primeira medição no aparelho alvo — ver
  item 6 (desempenho).

---

## Medições de desempenho

Resumos copiados do medidor (`?medir=1`, fatia A3.1a), **exatamente como
saíram**, com o contexto de cada medição. Em ordem cronológica.
Só medições pela rota padrão do protocolo (`docs/PLANO_MESTRE.md`, A3) servem
para comparar versões; as demais ficam marcadas como referência.

### 27/09/2026 — referência no notebook

**Contexto.** Notebook, build de produção (`npm run preview`), navegador
Chrome, cerca de 1 minuto de direção livre. **Não é a rota padrão do
protocolo.** Commit `f17516e`.

```
ÓRBI — medição de desempenho
quando: 27/09/2026, 18:06:42
sessão: 1 min 15 s (aquecimento de 10 s: 539 quadros ignorados)
quadros medidos: 3699
mediana: 16,9 ms · p95: 23,0 ms · maior: 41,0 ms
acima de 50 ms: 0,0% · acima de 250 ms: 0
render: 228 chamadas · 34016 triângulos · 401 geometrias · 1 texturas
tela: 1707×879 · DPR 1,13
```

### 27/09/2026, 18:10 — segunda referência no notebook

**Contexto.** Notebook, build de produção, navegador Chrome, cerca de 3 minutos
de direção livre. **Não é a rota padrão do protocolo.** Confirma a medição
anterior: nenhum quadro acima de 50 ms. **Esta é a referência de notebook para
comparar com o celular na medição A3.2.**

```
ÓRBI — medição de desempenho
quando: 27/09/2026, 18:10:34
sessão: 3 min 9 s (aquecimento de 10 s: 539 quadros ignorados)
quadros medidos: 10307
mediana: 16,8 ms · p95: 20,5 ms · maior: 47,8 ms
acima de 50 ms: 0,0% · acima de 250 ms: 0
render: 211 chamadas · 28938 triângulos · 408 geometrias · 1 texturas
tela: 1707×879 · DPR 1,13
```

### 29/09/2026 — notas de protocolo para a A3.2 (celular)

Protocolo completo e critério de decisão da A3.3: `docs/PLANO_MESTRE.md`,
ficha A3.

- Build do commit `c8aca64` (pacote inicial 197,98 kB).
- Save com a aventura da água já concluída; não apagar o progresso entre
  rodadas, só recarregar.
- Ignorar os pedidos do roteiro e seguir a rota padrão. A PIZZA mudou de lugar
  na A1.2b; não há medição de celular anterior pela rota, então não se perde
  comparação.
- Desviar do cão da carona (perto do início, ao sul da PIZZA); se embarcar,
  anotar na rodada.
- Anotar à mão o trecho de cada travada.
- Método de servir o build: registrar em cada rodada se foi a prévia da Vercel
  (`orbi-kahe-git-codex-activity-coordinator-p0-androm.vercel.app`, deployment
  `5944kBqzB`, commit `3a1fafa`, código idêntico a `c8aca64`) ou
  `npm run preview` local. A A3.4 (10/10) usa o **mesmo** método.

### 01/10/2026 — custo da A2.1 (pães da PADARIA)

A2.1, custo calculado em node com as peças reais (`tests/pao-3d.test.js`):
4 chamadas, 736 triângulos, 3 materiais compartilhados. A leitura no
navegador em 01/10 foi inconclusiva (pontos de cópia diferentes; pico de
98,2 ms na versão nova sem causa identificada). A comparação real fica para a
medição base × candidato de 03/10.

### 02/10/2026 — ponto fixo da PADARIA, estilo atual × estilo real (V1)

**Contexto.** Notebook, build de produção (`npm run preview`, código do
commit `0358947`), ponto fixo `?medir=1&ponto=PADARIA`, com e sem
`?estilo=real`. Revisão do Anderson. Resumos como foram colados:

```
[ESTILO ATUAL] 02/10/2026 10:47:01 · sessão 1 min 26 s · 4448 quadros medidos · mediana 16,7 ms · p95 21,6 ms · maior 63,4 ms · >50 ms 0,0% · >250 ms 0 · 218 chamadas · 32720 triângulos · 412 geometrias · 1707×879 DPR 1,13
```

```
[ESTILO REAL] 02/10/2026 10:48:05 · sessão 1 min 20 s · 4168 quadros medidos · mediana 16,7 ms · p95 19,5 ms · maior 76,5 ms · >50 ms 0,0% · >250 ms 0 · 220 chamadas · 33468 triângulos · 398 geometrias · 1707×879 DPR 1,13
```

**Desempenho.** Igual nos dois estilos no notebook: mediana 16,7 ms nos dois;
p95 19,5 ms (real) × 21,6 ms (atual); 0% acima de 50 ms.

**Avaliação visual.** REPROVADA na legibilidade: a PADARIA real se confunde com
o terreno (fachada bege e calçada caramelo sobre areia, sem contorno), o
letreiro fica ilegível e a vitrine e o toldo quase não aparecem. A V1 fica
como ponto de salvamento atrás da chave; os ajustes vão para a V1.2b.

### 02/10/2026, 11:22 — PADARIA real legível (V1.2b), sessão longa

02/10/2026 11:22, notebook, prévia de produção,
`?medir=1&ponto=PADARIA&estilo=real`, janela anônima, sessão de 5 min 54 s com
aventura do parque completa, garagem e chegada viva: 19.980 quadros medidos ·
mediana 16,8 ms · p95 20,7 ms · maior 146,2 ms · >50 ms 0,0% · >250 ms 0 · 232
chamadas · 32.016 triângulos · 1707×879 DPR 1,13. O pico de 146 ms não tem
evento identificado (motiva a M1).

### 02/10/2026, 15:39 — quarteirão real (V1.3), picos por atividade (M1)

02/10/2026 15:39, notebook, prévia de produção,
`?medir=1&ponto=MERCADO&estilo=real`, sessão de 2 min 35 s (missões PIZZA e
PADARIA): 8197 quadros · mediana 16,8 ms · p95 23,9 ms · maior 248,4 ms · >50 ms
0,1% · >250 ms 0 · 139 chamadas · 30980 triângulos · 1707×879 DPR 1,13.

Picos: 248,4 ms 02:08 em_missao; 222,9 ms 01:08 pergunta; 149,5 ms 00:38
em_missao; 107,5 ms 02:30 pergunta; 103,9 ms 02:30 pergunta. Acima de 50 ms por
atividade: em_missao 5 · pergunta 6.

Leitura: picos concentrados nas transições (chegada, abertura da pergunta), não
ao dirigir; os painéis são iguais nos dois estilos. Motiva a M1b.

---

## Modelo para os próximos testes

Copie o bloco abaixo para **cima** da sessão mais recente (a ordem é da mais
nova para a mais antiga) e preencha. Os pontos são os mesmos do teste de
27/09, para que as sessões possam ser comparadas entre si. Ponto que não foi
observado fica como "não observado" — nunca apagado.

Quando a sessão testar algo novo (uma fatia do `docs/PLANO_MESTRE.md`),
acrescente uma linha ao fim da tabela com o código da iniciativa (ex.: `A1`).

```markdown
## DD/MM/AAAA — <o que foi testado, em poucas palavras>

**Condições.** <build de produção ou dev> · <aparelho e sistema> ·
<rede: Wi-Fi local / outra> · branch `<branch>`, commit `<hash>` ·
Modo Tranquilo <ligado / desligado> · duração aproximada <N> min.

**Com quem.** <nomes e idades>.

**Medição.** <se houver: resultado do medidor (`?medir=1`) ou "sem medição">.

### O que foi visto

| Ponto | Resultado |
|---|---|
| **Garagem** | <botão VOLTAR À CIDADE: acertou? precisou de ajuda?> |
| **Desempenho** | <liso / travou — em que momentos, quanto do tempo> |
| **Parque** | <flores e parque: notou? foi até lá sozinho?> |
| **Carona** | <confundiu com a missão ativa?> |
| **Direção** | <como cada criança dirigiu, uma linha por criança> |
| **Voltar a jogar** | <quis jogar de novo?> |
| **<código>** | <o que a fatia testada mudou na experiência> |

### Observações do pai

- <proporções, distâncias, identidade dos lugares, outras>

### Ligações com a dívida técnica e o plano

- <item da `docs/DIVIDA_TECNICA.md` ou iniciativa do plano que esta sessão
  confirma, contradiz ou deixa em aberto>
```
