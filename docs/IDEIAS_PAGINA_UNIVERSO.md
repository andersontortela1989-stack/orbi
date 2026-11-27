# Ideias para a página do universo — Órbi

Registro de ideias para a **página de apresentação** do universo Órbi, a ser
publicada no domínio oficial. Só documentação: **nenhuma página foi criada**.
Nada aqui é tarefa aberta — cada item só vira trabalho quando for pedido como
fatia.

---

## Referência

Universo Rabisco (universo.rabisco.net e rabisco.net), de Alan Nicolas,
analisado em 27/09/2026 **só como referência de apresentação, não de
conteúdo**.

---

## Entram na primeira versão da página

Junto com o lançamento no domínio oficial, **depois do teste com a criança**.

1. **Frase de premissa na abertura**, a partir do que já existe no jogo: um
   alienzinho que acabou de chegar e não conhece nada da Terra; a criança não é
   testada, ela é quem sabe.
2. **Frase de diferença**: jogo calmo, feito para uma criança específica, onde
   errar não custa nada e ninguém disputa com ninguém.
3. **Estado honesto de cada parte do jogo** (pronto, em construção) e em quais
   aparelhos funciona.
4. **Som desligado por padrão** e botão para pausar animações, coerente com o
   Modo Tranquilo.

---

## Segunda versão

5. **Seção "do esboço ao jogo"**: comparação arrastável entre rascunho e jogo,
   mostrando o processo de criação e o papel da IA sem apagar a autoria do
   Anderson.

---

## Melhoria no jogo — avaliar depois do teste com a criança

6. **Dicas de controle uma de cada vez**, numeradas e fecháveis, no lugar da
   dica fixa "SETAS = DIRIGIR · ESPAÇO = FREIO DE MÃO". Decidir só depois de
   observar se a dica fixa atrapalha ou ajuda.

---

## Não entram (decisão registrada)

- **Vários jogos separados**: o universo cresce como uma cidade só.
- **Elenco grande ou personagens novos**: fica para depois da validação.
- **Envio de desenhos pelas crianças**: exigiria coletar dados de menores,
  contrariando a Área dos Pais.
- **Placar, conta de usuário, temas de combate ou disputa**: contrariam os
  princípios do jogo.
- **Competir em acabamento gráfico com o Rabisco**: a diferença do Órbi é
  pedagógica e sensorial, não de produção.

---

## Pendência antes do domínio

O Universo Rabisco usa "Órbita" como nome de personagem (astronauta de capacete
redondo) e de mapa. **Verificar disponibilidade da marca "Órbi" no INPI antes de
comprar o domínio.** O Órbi está publicado desde 05/08/2026.

---

## Conferido no código (27/09/2026)

Onde as ideias acima encostam no que o jogo já tem, na branch
`codex/activity-coordinator-p0`. É fato lido no código, não decisão.

- **Premissa e diferença (ideias 1 e 2).** A Área dos Pais já diz as duas coisas
  (`src/components/AreaPais.jsx:173-176`): jogo "feito por um pai para o filho
  autista com TDAH", numa "cidade calma", com o Órbi "um alienzinho que acabou
  de chegar e não conhece nada da Terra" — e "a criança não é testada: ela é
  quem sabe". O tom vem de `docs/handoff-orbi-ADENDO-narrativa.md`.
- **Dica fixa (ideia 6).** `src/GameExperience.jsx:124`, classe
  `.controls-hint`; na tela o texto termina em "(DRIFT)". **Só aparece com mouse
  ou trackpad:** em tela de toque ela some (`src/styles.css:1924`). No celular
  não há dica fixa — a observação só pode ser feita no notebook.
- **Área dos Pais (envio de desenhos).** `src/components/AreaPais.jsx:186-187`
  promete "Sem anúncios, sem compras, sem cadastro" e "O progresso fica salvo
  somente neste aparelho".
- **Figura do Órbi (pendência do nome).** O Órbi também é desenhado como
  astronauta, com capacete e viseira (`src/brand/orbi.js:86`).
