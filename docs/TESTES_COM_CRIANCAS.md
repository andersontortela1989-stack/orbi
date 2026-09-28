# Testes com crianças — Órbi

Registro do que foi observado jogando com as crianças. Uma seção por sessão,
da mais recente para a mais antiga. É observação, não decisão: o que vira
trabalho vai para uma fatia; o que fica em aberto vai para
`docs/DIVIDA_TECNICA.md`.

Cada sessão diz **quando**, **com quem**, **em que condições** e **o que foi
visto**. As observações do pai ficam separadas das reações das crianças.

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
