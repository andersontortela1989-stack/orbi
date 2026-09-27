# Testes com crianças — Órbi

Registro do que foi observado jogando com as crianças. Uma seção por sessão,
da mais recente para a mais antiga. É observação, não decisão: o que vira
trabalho vai para uma fatia; o que fica em aberto vai para
`docs/DIVIDA_TECNICA.md`.

Cada sessão diz **quando**, **com quem**, **em que condições** e **o que foi
visto**. As observações do pai ficam separadas das reações das crianças.

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
