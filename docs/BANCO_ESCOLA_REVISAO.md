# Revisão do banco da ESCOLA (`src/school/activities.js`)

Revisão de 19/11/2026, feita só com leitura do código, no HEAD `4d29764` da
branch `codex/activity-coordinator-p0`. Nenhum código foi alterado.

## Como ler

- **Variação:** `id da atividade #índice` (o índice é a posição em `variants`).
  `makeQuestion` embaralha as alternativas; a ordem abaixo é a do arquivo.
- **Dica** é o campo `hint` (mostrado antes de responder). **Explicação** é o
  campo `explanation` (o reforço depois da resposta).
- **Leitura:**
  - **não** — a voz e as imagens bastam;
  - **parcial** — o texto dá contexto, mas a voz pode substituí-lo;
  - **sim** — só o texto distingue as alternativas.
- **Painel atual** é o da pergunta de chegada (`ChegadaVivaPanel.jsx` e
  `chegadas-vivas.js`), que mostra:
  - um título curto em caixa alta, falado pela voz;
  - opcionalmente, uma fileira de **um único emoji** repetido N vezes
    (`mostra`);
  - **3 cartas**, cada uma com emoji e nome, número grande (sem emoji) ou
    bandeira desenhada;
  - quatro falas: pergunta, acerto, "tente de novo" e revelação, que vem
    depois de **2** toques errados.

  O painel **não** tem bolinhas nas cartas, amostras de cor, formas
  desenhadas, cena mista (emojis diferentes, sinal de mais, seta), texto
  corrido nem resposta em sequência.
- **Chegada na ESCOLA:**
  - **serve** — funciona no painel atual como está;
  - **ajuste** — o conteúdo serve, mas falta algo de conteúdo ou de
    apresentação;
  - **não serve** — o tipo não cabe numa escolha única de 3 cartas.

---

## Matemática

### `3-5-math` — "Vamos contar?" (faixa 3–5, choice)

| Var. | Enunciado exato | Alternativas | Certa | Dica | Explicação | Leitura |
|---|---|---|---|---|---|---|
| #0 (n=3) | Quantas maçãs você vê? Toque no grupo com a mesma quantidade. | 2, 3, 4 (cada uma com `dots` = bolinhas) | 3 | Toque em cada maçã com o dedo e conte devagar. Depois conte as bolinhas. | Temos 3 maçãs. O grupo com 3 bolinhas combina com elas! | não (com as bolinhas); sim (só com os números) |
| #1 (n=4) | igual ao #0 | 3, 4, 5 (com `dots`) | 4 | igual ao #0 | Temos 4 maçãs. O grupo com 4 bolinhas combina com elas! | igual ao #0 |
| #2 (n=5) | igual ao #0 | 4, 5, 6 (com `dots`) | 5 | igual ao #0 | Temos 5 maçãs. O grupo com 5 bolinhas combina com elas! | igual ao #0 |

Cena: `visual` com n × 🍎.

- **Chegada na ESCOLA: ajuste (as 3).** A fileira de maçãs cabe no `mostra`
  (🍎 × n), mas as cartas do painel mostram só o número, sem as bolinhas.
- **Problemas:**
  - o enunciado manda tocar "no grupo com a mesma quantidade", e no painel
    atual não há grupo, só o algarismo;
  - na faixa 3–5, reconhecer o algarismo vira exigência;
  - é a mesma mecânica da PADARIA (contar N e escolher entre N−1, N e N+1),
    com outro emoji.
- **Falta para funcionar sem leitura:** bolinhas nas cartas (o banco já tem
  `dots`; o painel não desenha). Ou o enunciado falado deixa de falar em
  "grupo".

### `6-7-math` — "Juntar e retirar" (faixa 6–7, choice)

| Var. | Enunciado exato | Alternativas | Certa | Dica | Explicação | Leitura |
|---|---|---|---|---|---|---|
| #0 | Havia 2 maçãs. Chegaram mais 3. Quantas ficaram? | 4, 5, 6 | 5 | Conte as duas maçãs e continue contando as outras três. | Duas mais três são cinco! | parcial |
| #1 | Havia 5 bolas. Duas foram guardadas. Quantas ficaram fora? | 2, 3, 4 | 3 | Comece com cinco dedos. Abaixe dois e conte os que ficaram. | Cinco menos dois são três. | parcial |
| #2 | Há 3 lápis azuis e 3 amarelos. Quantos lápis ao todo? | 5, 6, 7 | 6 | Junte os dois grupos de três. | Três mais três são seis! | parcial |

Cenas:
- #0: `🍎🍎 + 🍎🍎🍎`
- #1: `⚽ ⚽ ⚽ ⚽ ⚽`
- #2: `✏️✏️✏️ + ✏️✏️✏️`

- **Chegada na ESCOLA: ajuste (as 3).**
- **Problemas:**
  - **#0:** "Quantas ficaram?" é a pergunta de quem tira; numa soma soa
    estranho. O natural seria perguntar quantas há agora. "Maçãs chegaram"
    também é esquisito.
  - **#1:** a cena mostra as **5** bolas, sem marcar as 2 guardadas. Quem
    conta a cena chega a 5, que nem está entre as cartas. O enunciado também
    mistura algarismo ("5") e palavra ("Duas").
  - **#2:** o emoji ✏️ é um lápis amarelo só. Os lápis "azuis" não aparecem
    como azuis, e a cena contradiz o enunciado.
  - As três dicas mostram o caminho, sem dar o número; nenhuma entrega a
    resposta.
- **Falta para funcionar sem leitura:**
  - o enunciado inteiro na voz (hoje o título do painel é curto);
  - cena com dois grupos e o sinal de mais (#0, #2), ou com as bolas
    guardadas marcadas (#1). O `mostra` atual repete um único emoji e não
    mostra "2 + 3".

### `8-10-math` — "Contas da aventura" (faixa 8–10, choice)

| Var. | Enunciado exato | Alternativas | Certa | Dica | Explicação | Leitura |
|---|---|---|---|---|---|---|
| #0 | Cada caderno custa 2 moedas. Quanto custam 3 cadernos? | 5, 6, 7 | 6 | Some duas moedas para cada caderno: 2 + 2 + 2. | Três grupos de duas moedas formam seis moedas. | parcial |
| #1 | Vamos repartir 12 lápis igualmente entre 4 crianças. Quantos para cada uma? | 2, 3, 4 | 3 | Distribua um lápis por vez para cada criança. Quantas rodadas dá para fazer? | Cada criança recebe três lápis. Quatro grupos de três formam doze. | parcial |
| #2 | Você tinha 10 moedas e usou 4 em um livro. Quantas sobraram? | 5, 6, 7 | 6 | Retire quatro das dez moedas. | Dez menos quatro são seis moedas. | parcial |

Cenas:
- #0: `📒 📒 📒`
- #1: `✏️ → 🧒 🧒 🧒 🧒`
- #2: `🪙 → 📖`

- **Chegada na ESCOLA: ajuste (as 3).**
- **Problemas:**
  - **#0:** a dica escreve a conta pronta ("2 + 2 + 2"). Falta só somar:
    está perto de entregar a resposta. A cena mostra os cadernos, mas não as
    moedas.
  - **#1:** a cena mistura emojis e seta; o `mostra` não desenha isso.
  - **#2:** "Você tinha 10 moedas" pode ser confundido com as moedas do
    próprio jogo (o HUD mostra 🪙 com o saldo da criança). A cena não mostra
    as 10 moedas.
- **Falta para funcionar sem leitura:** o enunciado completo na voz (na faixa
  8–10 a leitura é esperada, mas o painel só tem título curto) e uma cena que
  o painel consiga desenhar.

---

## Português

### `3-5-words` — "Quem faz esse som?" (faixa 3–5, choice)

| Var. | Enunciado exato (também em `spoken`) | Alternativas | Certa | Dica | Explicação | Leitura |
|---|---|---|---|---|---|---|
| #0 | Ouça: miau! Qual bichinho faz esse som? | gato "Gato" 🐱, cachorro "Cachorro" 🐶, vaca "Vaca" 🐮 | gato | Vamos ouvir de novo: miau. Pense nos bichinhos que você conhece. | É o gato! Vamos brincar com o som: miau! | não |
| #1 | Ouça: au au! Qual bichinho faz esse som? | as mesmas três | cachorro | Vamos ouvir de novo: au au. Pense nos bichinhos que você conhece. | É o cachorro! Vamos brincar com o som: au au! | não |
| #2 | Ouça: muuu! Qual bichinho faz esse som? | as mesmas três | vaca | Vamos ouvir de novo: muuu. Pense nos bichinhos que você conhece. | **É o vaca!** Vamos brincar com o som: muuu! | não |

Cena: `👂`.

- **Chegada na ESCOLA:**
  - #0 e #1 **servem** como estão: 3 cartas com emoji, pergunta falada e
    nada para ler;
  - #2 precisa de **ajuste**.
- **Problemas:**
  - **#2:** a explicação usa o artigo fixo "o" do modelo e sai "É o vaca!".
  - **Todas:** as três cartas são sempre as mesmas; só muda o som.
  - **Todas:** é o mesmo conteúdo da chegada do ZOO (som de animal, cartas
    com emoji), o que repete a experiência em outro lugar.
  - "muuu" depende de como a voz sintetizada pronuncia (não verificado).
  - A dica repete o som, mas não entrega o bicho.
- **Falta para funcionar sem leitura:** nada além do artigo de #2. O som é a
  voz sintetizada dizendo a onomatopeia, como no ZOO, e não um som gravado.

### `6-7-words` — "Monte a palavra" (faixa 6–7, order)

| Var. | Enunciado exato | Alternativas | Certa (ordem) | Dica | Explicação | Leitura |
|---|---|---|---|---|---|---|
| #0 | Monte a palavra CASA. Toque nas sílabas na ordem. | CA, SA, BO | CA → SA | casa começa com CA e termina com SA. | CA com SA: casa! | sim |
| #1 | Monte a palavra BOLA. Toque nas sílabas na ordem. | BO, LA, PA | BO → LA | bola começa com BO e termina com LA. | BO com LA: bola! | sim |
| #2 | Monte a palavra PATO. Toque nas sílabas na ordem. | PA, TO, CA | PA → TO | pato começa com PA e termina com TO. | PA com TO: pato! | sim |

Cenas: 🏠, ⚽ e 🦆.

- **Chegada na ESCOLA: não serve (as 3).** A resposta é uma sequência de dois
  toques; o painel aceita um toque só.
- **Problemas:**
  - **as 3 dicas entregam a resposta inteira** (dizem a primeira e a última
    sílaba);
  - o enunciado escreve a palavra montada ("Monte a palavra CASA"), então
    quem lê já vê a resposta.
- **Falta para funcionar sem leitura:** a atividade é de leitura de sílabas.
  Sem leitura, ela perde o objetivo.

### `8-10-words` — "Uma história curtinha" (faixa 8–10, choice)

| Var. | Texto (`passage`) | Enunciado exato | Alternativas | Certa | Dica | Explicação | Leitura |
|---|---|---|---|---|---|---|---|
| #0 | Lia levou um livro para a praça. Ela leu à sombra de uma árvore. | Onde Lia leu? | praca "Na praça" 🌳, praia "Na praia" 🏖️, escola "Na escola" 🏫 | praca | Volte à primeira frase. Ela diz para onde Lia levou o livro. | Lia levou o livro para a praça e leu ali. | sim (o texto) |
| #1 | Davi olhou pela janela e viu a chuva. Antes de sair, pegou seu guarda-chuva. | Por que Davi pegou o guarda-chuva? | chuva "Porque chovia" 🌧️, sol "Para guardar um livro" 📖, bola "Para jogar bola" ⚽ | chuva | O que Davi viu pela janela? | Ele viu a chuva e pegou o guarda-chuva para sair. | sim (o texto) |
| #2 | Nina plantou uma semente. Depois regou a terra. Dias mais tarde, viu um brotinho. | O que Nina fez primeiro? | plantou "Plantou" 🌱, regou "Regou" 💧, colheu "Colheu" 🌼 | plantou | Procure a ação que aparece no começo da história. | Primeiro Nina plantou. Depois regou. | sim (o texto) |

- **Chegada na ESCOLA: ajuste (as 3).** A pergunta só faz sentido depois de
  ouvir ou ler a história. O painel não tem espaço para texto corrido, e a
  fala da pergunta teria de contar a história antes.
- **Problemas:**
  - **#1:** o id da alternativa "Para guardar um livro" é `sol`. O id não
    corresponde ao texto; não afeta a criança, mas confunde quem mantém o
    banco.
  - **#2:** 🌼 para "Colheu" não representa colher.
  - **#0:** a dica aponta a primeira frase, onde está a resposta. É uma pista
    de onde procurar, aceitável na faixa 8–10.
- **Falta para funcionar sem leitura:** a história falada pela voz antes da
  pergunta, e um jeito de ouvi-la de novo (o 🔊 repete só a última fala).

---

## História e vida

### `3-5-history` — "Primeiro e depois" (faixa 3–5, order)

| Var. | Enunciado exato | Alternativas | Certa (ordem) | Dica | Explicação | Leitura |
|---|---|---|---|---|---|---|
| #0 | Vamos acompanhar uma planta. O que vem primeiro e depois? | semente "Semente" 🫘, broto "Broto" 🌱, flor "Flor" 🌻 | semente → broto → flor | Primeiro plantamos a semente. Dela pode nascer um broto, que cresce e pode dar uma flor. | Semente, broto e flor: as coisas mudam com o tempo! | não |
| #1 | Vamos fazer um desenho. Coloque os momentos na ordem. | folha "Papel em branco" 📄, desenhar "Desenhando" 🖍️, quadro "Desenho pronto" 🖼️ | folha → desenhar → quadro | Primeiro pegamos o papel. Depois desenhamos. No fim mostramos a criação. | Papel, desenho e criação pronta. Você organizou os momentos! | não |

- **Chegada na ESCOLA: não serve (as 2).** É uma sequência de três toques.
- **Problemas:**
  - **as 2 dicas contam a ordem inteira**, ou seja, entregam a resposta;
  - "momentos" (#1) é abstrato para 3–5;
  - 🫘 é um feijão, o que serve como semente, mas vale conferir se a criança
    reconhece;
  - a explicação de #1 diz "Você organizou os momentos!", que põe a criança
    como sujeito de uma habilidade, num tom diferente da regra dos resumos
    (§2.3 do `PLANO_MESTRE`). A regra vale para os resumos de aventura; aqui
    é só um alerta.
- **Falta para funcionar sem leitura:** nada de leitura (emoji e voz
  bastam). O que impede é o tipo `order`.

### `6-7-history` — "Objetos contam histórias" (faixa 6–7, choice)

| Var. | Texto (`passage`) | Enunciado exato | Alternativas | Certa | Dica | Explicação | Leitura |
|---|---|---|---|---|---|---|---|
| #0 | A família de Bia guardou um telefone com disco. Bia colocou um celular ao lado para comparar. | Neste par, qual telefone tem uma tela? | disco "Telefone com disco" ☎️, tela "Celular com tela" 📱 | tela | Observe o visor. Em qual objeto podemos ver imagens na tela? | O celular tem tela. Telefones de formatos diferentes ajudam a contar histórias de outras épocas. | parcial |
| #1 | Na história de Bia, a família quer guardar uma imagem do encontro de hoje. | Qual objeto ajuda a guardar uma lembrança da família? | foto "Uma fotografia" 📷, bola "Uma bola sem história contada" ⚽, colher "Uma colher nova" 🥄 | foto | Qual pode mostrar as pessoas reunidas naquele dia? | Uma fotografia pode registrar um momento. Perguntar a quem estava lá ajuda a entender sua história. | sim (os qualificadores) |

- **Chegada na ESCOLA: ajuste (as 2).**
- **Problemas:**
  - **#0:**
    - só **2 alternativas** (o painel e a regra são de 3 cartas);
    - o rótulo "Celular com tela" repete a palavra do enunciado e entrega a
      resposta a quem lê;
    - a dica também aponta a tela;
    - "visor" é palavra difícil para 6–7;
    - a pergunta testa percepção (qual tem tela), não história.
  - **#1:**
    - os distratores só ficam errados por causa do qualificador escrito
      ("sem história contada", "nova"). Sem ler, uma bola ou uma colher
      também podem guardar uma lembrança de família, e a resposta fica
      **ambígua**;
    - quem lê vê a resposta no próprio rótulo;
    - o emoji 📷 é uma câmera, não uma fotografia.
- **Falta para funcionar sem leitura:**
  - uma terceira alternativa em #0;
  - em #1, distratores que sejam errados pela imagem, sem depender do texto;
  - o contexto (`passage`) falado.

### `8-10-history` — "Investigue as lembranças" (faixa 8–10, choice)

| Var. | Texto (`passage`) | Enunciado exato | Alternativas | Certa | Dica | Explicação | Leitura |
|---|---|---|---|---|---|---|---|
| #0 | Num álbum fictício da cidade, uma foto antiga mostra a praça com caminho de terra e uma árvore. Na foto atual, o caminho tem piso e a mesma árvore continua lá. | O que mudou na praça desta história? | caminho "O caminho" 🛤️, arvore "A árvore desapareceu" 🌳, lago "Surgiu um lago" 🌊 | caminho | Compare o chão descrito nas duas fotos. | O caminho de terra ganhou piso. As fotografias ajudam a comparar mudanças e permanências. | sim |
| #1 | A turma quer descobrir como era a escola antes. Há fotografias antigas e pessoas que estudaram nela. | Como investigar a história desta escola? | fontes "Comparar fotos e ouvir relatos" 🖼️, chutar "Adivinhar pela cor da parede" 🎨, inventar "Inventar uma data" 📅 | fontes | Procure registros e pessoas que possam contar o que viveram. | Fotos e relatos são fontes. Comparar fontes ajuda a investigar o passado, e elas podem deixar perguntas em aberto. | sim |

- **Chegada na ESCOLA: ajuste (as 2).**
- **Problemas:**
  - **#0:**
    - a dica ("o chão") aponta direto para o caminho e **entrega a
      resposta**;
    - as alternativas têm formatos diferentes (um substantivo contra duas
      frases completas), e a diferente chama atenção;
    - o emoji 🌳 da distratora mostra uma árvore presente, o contrário de
      "desapareceu".
  - **#1:**
    - os distratores são absurdos ("Adivinhar pela cor da parede", "Inventar
      uma data"), então a pergunta fica trivial para quem lê;
    - a dica repete a resposta com outras palavras ("registros e pessoas" ≈
      "fotos e relatos") e **entrega**;
    - os emojis não distinguem as alternativas sem o texto.
- **Falta para funcionar sem leitura:** na faixa 8–10 a leitura é esperada.
  Ainda assim, o painel precisaria da história falada e de rótulos longos
  legíveis nas cartas (hoje o nome da carta é curto).

---

## Artes

### `3-5-arts` — "Brincar com cores e formas" (faixa 3–5, studio)

| Var. | Enunciado exato | Alternativas | Certa | Dica | Explicação | Leitura |
|---|---|---|---|---|---|---|
| #0 | Vamos espalhar cores! Escolha uma cor e toque no papel. | — | — (criação livre) | Você pode mudar a cor e escolher círculo, quadrado ou triângulo. | Cada criação pode ser diferente. Adorei conhecer a sua ideia! | não |
| #1 | Crie um jardim de formas do seu jeito. | — | — | Círculos podem virar flores. Triângulos podem lembrar folhas. Você decide! | Cada criação pode ser diferente. Adorei conhecer a sua ideia! | não |

- **Chegada na ESCOLA: não serve (as 2).** É criação livre, sem resposta;
  `checkAnswer` devolve `false` para `studio`.
- **Problemas de conteúdo:** nenhum. O texto é acolhedor e sem certo ou
  errado.
- **Falta para funcionar sem leitura:** nada de leitura. O que falta é a tela
  de pintura, que não é o painel de pergunta.

### `6-7-arts` — "Descobrir padrões" (faixa 6–7, choice)

| Var. | Enunciado exato | Alternativas | Certa | Dica | Explicação | Leitura |
|---|---|---|---|---|---|---|
| #0 | Azul, amarelo, azul, amarelo… Qual cor continua? | blue "Azul" (cor), sun "Amarelo" (cor), coral "Coral" (cor) — sem emoji | blue | O par azul e amarelo se repete. Depois do amarelo, ele começa de novo. | O azul recomeça o par. Você encontrou um padrão! | sim (no painel atual) |
| #1 | Círculo, quadrado, círculo, quadrado… Qual forma continua? | circle "Círculo", square "Quadrado", triangle "Triângulo" (forma) — sem emoji | circle | Veja o par círculo e quadrado. Qual forma começa o par? | O círculo começa novamente. Agora você pode inventar seu próprio padrão! | sim (no painel atual) |

Cenas:
- #0: `pattern` = azul, sol, azul, sol;
- #1: `● ■ ● ■ …`

- **Chegada na ESCOLA: ajuste (as 2).**
- **Problemas:**
  - **as 2 dicas praticamente entregam a resposta**: "começa de novo" depois
    do par azul–amarelo é o azul, e "qual forma começa o par" é o círculo;
  - **#0:** "Coral" como nome de cor é difícil para 6–7, porque poucas
    crianças conhecem;
  - o conteúdo em si (padrão AB) é bom e serviria até para 3–5 com imagem.
- **Falta para funcionar sem leitura:**
  - o painel não desenha amostra de cor nem forma; sem emoji, a carta mostra
    o **rótulo escrito em letras grandes**, o que obriga a ler;
  - faltam cartas com a cor ou a forma desenhada (ou um emoji equivalente);
  - falta uma fileira do padrão com elementos diferentes (o `mostra` repete
    um único emoji).

### `8-10-arts` — "Compor uma imagem" (faixa 8–10, studio)

| Var. | Enunciado exato | Alternativas | Certa | Dica | Explicação | Leitura |
|---|---|---|---|---|---|---|
| #0 | Crie uma praça usando formas e cores. | — | — | Experimente repetir uma forma ou destacar uma cor. Sua composição pode contar uma ideia. | Cada criação pode ser diferente. Adorei conhecer a sua ideia! | parcial |
| #1 | Crie duas regiões de cores diferentes na mesma imagem. | — | — | Você pode aproximar cores parecidas ou colocar cores diferentes lado a lado e observar o resultado. | Cada criação pode ser diferente. Adorei conhecer a sua ideia! | parcial |

- **Chegada na ESCOLA: não serve (as 2).** É criação livre.
- **Problemas:** "composição" e "regiões" são termos técnicos, mas adequados
  para 8–10.
- **Falta:** a tela de pintura, como em `3-5-arts`.

---

## Resumo

Total: **30 variações** em 12 atividades: 21 do tipo `choice`, 5 `order` e
4 `studio`.

| Situação | Quantas | Quais |
|---|---|---|
| Servem como estão | **2** | `3-5-words` #0 (miau, gato) e #1 (au au, cachorro) |
| Precisam de ajuste | **19** | `3-5-math` #0–2, `6-7-math` #0–2, `8-10-math` #0–2, `3-5-words` #2 (vaca), `8-10-words` #0–2, `6-7-history` #0–1, `8-10-history` #0–1, `6-7-arts` #0–1 |
| Não servem para a chegada | **9** | `6-7-words` #0–2 e `3-5-history` #0–1 (`order`); `3-5-arts` #0–1 e `8-10-arts` #0–1 (`studio`) |

**Padrões que se repetem:**
- **Dica que entrega a resposta** em 11 variações:
  - `6-7-words` #0–2 e `3-5-history` #0–1 (do tipo `order`);
  - `8-10-math` #0, de perto (a conta pronta);
  - `6-7-history` #0;
  - `8-10-history` #0–1;
  - `6-7-arts` #0–1.

  Pela regra do jogo, a pista ajuda a pensar e a resposta fica para a
  revelação.
- **Cena que o painel atual não desenha:** bolinhas, cena mista, sinal de
  mais, seta, cor, forma e texto corrido. O `mostra` repete um único emoji.
- **Rótulo que entrega ou é necessário** (só quem lê acerta, ou quem lê vê a
  resposta): `6-7-history` #0–1 e `8-10-history` #0–1.
- **Erros pontuais:**
  - artigo "É o vaca!" em `3-5-words` #2;
  - só 2 alternativas em `6-7-history` #0;
  - id `sol` para "Para guardar um livro" em `8-10-words` #1;
  - cena que contradiz o enunciado (`6-7-math` #1 e #2);
  - emoji que não representa a ideia (📷, 🌼, 🌳 em "desapareceu").
- **Repetição com outras chegadas:** `3-5-math` repete a mecânica da
  PADARIA, e `3-5-words` repete o conteúdo do ZOO.
