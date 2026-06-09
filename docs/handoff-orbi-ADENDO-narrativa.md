# ÓRBI — ADENDO DE NARRATIVA · "A Chegada"
### A história que dá alma ao jogo (rege as falas e fatias daqui pra frente)

> Complementa o adendo curricular. O currículo diz O QUE se aprende; este adendo diz
> POR QUE o jogo acontece — e muda o tom de todas as falas.

---

## A história em um parágrafo

**Órbi é um astronautinha de outro planeta.** Ele viaja pelo espaço, pousa na Terra
e não conhece NADA daqui — as palavras, os números, os lugares, os bichos, as cores.
Ao pousar, ele encontra uma criança (o jogador, que diz seu nome) e pede:
**"me mostra teu mundo?"**. Os dois saem juntos pela cidade — a criança dirige, o Órbi
pergunta e se encanta — e vão descobrindo a Terra juntos: palavras, matemática,
geografia, ciências, história, artes.

## A inversão pedagógica (o coração disto)

**A criança não é aluna — é a GUIA.** O Órbi é quem não sabe; a criança é quem mostra,
apresenta, ensina. Toda missão nasce da curiosidade genuína dele ("o que é PADARIA?
me leva lá!"), nunca de instrução ou cobrança. Acertar não é "passar na prova" — é
**ensinar o amigo**. Errar não existe na narrativa: o Órbi simplesmente continua curioso.

Por que isso importa: a criança que a escola coloca "atrás" aqui é quem está NA FRENTE.
A autoestima muda de lugar. E aprender-ensinando fixa mais que aprender-respondendo.

## O nome da criança

- Na primeira vez, a criança **digita o próprio nome** (teclado simples, letras grandes,
  CAIXA ALTA, sem validação punitiva — aceita o que vier; dá pra corrigir depois).
- Digitar o nome É o primeiro ato de letramento do jogo (escrever a palavra mais
  importante do mundo dela).
- O nome persiste (localStorage via zustand persist) e **a voz do Órbi fala o nome**
  ("Oi, Heitor!"). Usar com carinho e parcimônia: na saudação, em comemorações
  especiais — não em toda frase (vira ruído).
- O nome também personaliza, no futuro, o relatório BNCC ("relatório do Heitor").

## A intro (a chegada) — especificação

**Formato:** sequência curta de telas 2D animadas no clima Mundo Adesivo (NÃO cena 3D),
narrada pela voz do Órbi, ~20–30 segundos, em 3–4 quadros:

1. **Espaço** — o foguetinho do Órbi viajando entre estrelas. Voz: "Lá longe, em outro
   planeta, mora o Órbi…"
2. **Pouso** — o foguete desce na colina verde (a mesma da tela de abertura). "…ele
   viajou muito e chegou num lugar novo: a TERRA!"
3. **Encontro + nome** — Órbi acenando: "Oi! Eu sou o Órbi! Como você se chama?"
   → input do nome → "Que nome bonito, {NOME}! Eu não conheço nada daqui…
   **me mostra teu mundo?**"
4. → entra no jogo (a cidade).

**Regras invioláveis da intro:**
- **PULÁVEL sempre** — botão "PULAR" visível desde o primeiro quadro.
- Mostra inteira só na **primeira vez**; nas seguintes, a abertura vai direto ao JOGAR
  (com opção discreta "ver a história de novo").
- Ritmo calmo, um quadro por vez, CAIXA ALTA nos textos, narração pt-BR sincronizada.
- `prefers-reduced-motion`: animações viram cortes simples.
- Sem timer apertando; cada quadro avança por toque/tecla OU sozinho com folga.

## Reescrita das falas (regra de tom para TODAS as fatias)

Toda fala do jogo passa a sair da boca do Órbi-curioso. Padrão:

| Antes (instrução) | Depois (curiosidade do Órbi) |
|---|---|
| "QUERO HOSPITAL" | "O QUE É HOSPITAL? VAMOS VER!" |
| "Quero ir até a pizza" | "Que cheiro bom! O que é PIZZA? Me leva lá!" |
| "Boa! Chegamos no hospital!" | "UAU! Então isso é um HOSPITAL! Aqui cuida das pessoas!" |
| "Faltam 5 litros" | "Me ajuda a contar? FALTAM 5!" |
| "Acabou a gasolina, vamos abastecer" | "Ih, acabou! Me leva no POSTO?" |

Regras:
- A chegada num lugar SEMPRE ensina algo de volta (o Órbi "aprende" e repete o que o
  lugar é — reforço natural: "então PADARIA é onde faz PÃO!").
- Frases curtas, uma ideia por frase, vocabulário da criança.
- O Órbi nunca cobra, nunca apressa, nunca corrige com peso. Erro = silêncio (mantém
  o feedback assimétrico) ou curiosidade neutra.
- O banner do HUD pode manter a forma curta (legibilidade), com a voz carregando a
  personalidade: banner "HOSPITAL?" + voz "O que é hospital? Vamos ver!".

## O que NÃO muda

- Mecânicas, física, economia, GPS, sensores: intactos. Esta é uma camada de
  narrativa/tom, não de sistema.
- Guard-rails TEA: uma coisa por vez, feedback assimétrico, sem timer/punição,
  paleta calma, prefers-reduced-motion.
- O roadmap curricular do adendo anterior segue valendo — as matérias agora têm
  moldura narrativa ("o Órbi conhecendo as palavras/números/lugares/bichos/artes
  da Terra"), e **artes entra no mapa de matérias** (cores, formas, desenhos, música).
