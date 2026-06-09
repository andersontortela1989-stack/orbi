# Órbi — Design System

> **Órbi** é um jogo educativo infantil onde um amiguinho astronauta acompanha a criança numa cidade que ela explora dirigindo — aprendendo a ler, contar e descobrir o mundo.
>
> **Tagline (slogan oficial):** *um mundo pra descobrir*
> **Propósito (descrição para pais, não é slogan):** cada criança aprende no seu tempo.

Identidade visual do Órbi, construída em rodadas a partir do brief de marca.

- **1ª rodada** — logotipo, paleta e tipografia (exploração). *Arquivada em `arquivo/`.*
- **2ª rodada** — exploração de **3 climas visuais** numa direção mais lúdica/jogo. *Arquivada em `arquivo/`.*
- **Direção OFICIAL escolhida → "MUNDO ADESIVO".** Tudo daqui pra frente segue este clima. É a fonte de verdade deste sistema.

**Fonte do brief:** `uploads/brief-marca-orbi.md` (anexado pelo cliente).
**Status:** Não há codebase nem Figma — identidade criada do zero, direção confiada ao Claude Design.

---

## Quem é o público

- **A criança (4–9 anos)** — quem joga. Bate o olho e **quer jogar na hora**.
- **Pais e educadores** — quem escolhe. Sentem cuidado e propósito num olhar.
- **Foco especial:** famílias de crianças **neurodivergentes (TEA, TDAH)**. A marca acolhe **sem nunca rotular** — o cuidado aparece no jeito calmo, claro e legível, jamais em símbolos clínicos.

---

## A DIREÇÃO OFICIAL — "Mundo Adesivo"

O Órbi parece um **mundo feito de adesivos/stickers**: tudo é recortável, tocável, com cara de jogo de verdade. A criança olha e já sabe que dá pra apertar.

**Os 4 pilares (não-negociáveis):**
1. **Contorno navy grosso** (`--ink` = `#1C2746`) em tudo que é "recortável" — botões, cartões, chips, o próprio logotipo. É a assinatura.
2. **Sombra sólida navy** (offset sem blur — `--solid-1/2/3`) — o "degrau" que faz o adesivo parecer descolando da tela. No press, o degrau encolhe.
3. **Cores de brincar** sobre **céu claro** — sol, capim, coral, céu-forte, saturadas mas amarradas pelo navy e por bastante respiro.
4. **Contraste altíssimo navy-sobre-claro** = legibilidade sempre. Vibrante ≠ estridente.

**Régua de acessibilidade mantida:** calmo, alto contraste, nada que canse a vista, respiro generoso, movimento contido, Atkinson Hyperlegible no corpo. Saturação alegre, mas nunca berrante; o navy e o céu claro descansam a vista.

---

## CONTENT FUNDAMENTALS — como a marca fala

- **Idioma:** português do Brasil, sempre.
- **Tom:** gentil, animado, paciente, otimista. É o amigo que torce — nunca apressa, nunca cobra. O Órbi **comemora junto**. Agora com mais **energia de brincadeira**.
- **Pessoa:** fala com a criança de forma calorosa e direta ("vamos explorar", "muito bem!"). Para pais, fala com clareza e propósito, sem jargão.
- **Casing:** nome e títulos em Title Case ("Órbi"); o **jogo usa CAIXA ALTA** para legibilidade (rótulos, conquistas), em etiqueta-adesivo com tracking 0.08em.
- **Tagline:** *"um mundo pra descobrir"* — é o slogan. A frase antiga *"cada criança no seu tempo"* virou **descrição de propósito para pais**, não é mais slogan.
- **Evitar:** tom infantilizado demais, clínico/terapêutico, genérico de "app educativo", urgência/velocidade.
- **Emoji:** evitar. A ternura e a diversão vêm da cor, do contorno, do personagem e do ritmo — não de emoji.

---

## VISUAL FOUNDATIONS

- **Régua inegociável:** paleta **calma + alto contraste + acolhedora**; simplicidade ("menos é mais"); movimento contido; respeita `prefers-reduced-motion`.
- **Cor — papéis (mudança-chave vinda das rodadas anteriores):**
  - O **navy deixou de ser superfície escura** e virou **contorno + tinta + sombra sólida** (`--ink` `#1C2746`).
  - A **superfície virou céu claro** (`--orbi-sky` `#DDF1FA`, profundidade `#A7DCF0`), com **branco** (`#FFFFFF`) como "recheio" do adesivo (cartões).
  - **Cores de brincar:** Sol `#FFC53D` (o astro / primária / CTA), Capim `#5BBE6E` (sucesso), Coral `#F0623E` (energia/alerta amistoso), Céu-forte `#58B6E8` (info). Cada uma tem variante `-deep` para press.
  - Papel quente `#FBF7EF` para leitura longa. Texto é navy de alto contraste sobre claro.
- **Tipografia:** **Fredoka** (display, arredondada e sólida) para nome, títulos e botões; **Atkinson Hyperlegible** (apoio) para corpo e interface — distinção máxima de caracteres (acessibilidade). Entrelinha 1.6 no corpo.
- **Wordmark:** estilo **adesivo** — preenchimento branco, contorno navy grosso (`-webkit-text-stroke` ~7px), sombra-texto sólida (`text-shadow: 0 6px 0 navy`). O acento do **"Ó" é um planeta-sticker**: círculo Sol com contorno navy + anel de órbita navy inclinado.
- **Fundos:** **céu claro**, liso ou com gradiente radial muito suave (céu-claro → céu-fundo na base). Nuvens-adesivo brancas esparsas e estrelas opcionais — sempre estáticas e calmas. Sem gradientes berrantes, sem fundo escuro amplo.
- **Cantos:** macios — raios 8 a 32px, pill para botões/etiquetas. Nunca pontas duras.
- **Contorno:** o traço navy tem escala — `--outline-thin` 2px (divisórias/inputs), `--outline` 3px (padrão: botões, cartões, chips), `--outline-bold` 4px (destaques, títulos-sticker).
- **Sombras:** a assinatura é a **sólida** (`--solid-1/2/3`, navy sem blur). Há também sombras **suaves** (`--shadow-sm/md/lg`) para elevação sutil quando o sólido não cabe. **Sem `glow`** — o Mundo Adesivo não brilha, ele tem degrau.
- **Animação:** contida. Easing suave (`--ease-soft`), 160–320ms, fades e movimentos pequenos. O gesto característico é o **press do adesivo**: degrau encolhe (`--solid-press`) + leve `translateY`. Sem loops decorativos infinitos. Sempre gated em `prefers-reduced-motion`.
- **Hover/press:** hover clareia levemente (ou usa a variante `-soft`); **press = degrau encolhe** e o elemento "afunda" alguns px. Foco usa anel navy nítido (`--focus-ring`).
- **Bordas:** o próprio contorno navy é a borda; divisórias suaves usam `--orbi-line` (`#C2DEEC`) sobre céu.
- **Layout:** muito respiro, poucos elementos por tela, hierarquia clara. Centrado e calmo.

---

## ICONOGRAPHY

- **A definir com o cliente.** Direção pretendida, coerente com o Mundo Adesivo: ícones **preenchidos com contorno navy grosso** (mesma régua dos componentes), cantos arredondados, poucos elementos — "adesivos" também. Cores de brincar como preenchimento.
- **Emoji:** não usar.
- O elemento icônico central é o **planeta-sticker do "Ó"** (ver logotipo) e o **personagem Órbi** (astronautinha) — ver abaixo — que serve de mascote e base do ícone de app.
- Quando o set for definido, entra em `assets/` como SVGs próprios. Recomendação de base, se quiserem um set pronto: ícones **filled** com contorno (ex.: Phosphor Fill com stroke adicionado), mas a definir.
- **Flag:** ainda não há set de ícones de interface neste sistema — pendente de aprovação.

---

## PERSONAGEM — Órbi

O astronautinha companheiro: criança de capacete espacial, no clima adesivo (contorno navy grosso, cores de brincar, formas macias coerentes com a Fredoka). É o amigo que acompanha, fica curioso junto e comemora junto — nunca apressa.

**Anatomia:** antena-astro (bolinha-sol, aceno ao "Ó") · capacete branco + visor azul-claro onde vive o rosto (olhos grandes, sorriso simples) · emblema-planeta no peito (repete o astro do logo) · membros-cápsula roliços com contorno navy · botinhas coral.

**Expressões entregues:** `acenando` (oi! / parado-acolhedor), `comemorando` (conquista, braços pro alto + estrelas), `curioso` (mão no queixo, olhando o astro). Há também uma pose `parado` neutra.

**Reconhecível pequeno:** poucos elementos + contorno grosso = lê bem como ícone de app (testado a 96/64/40px) e no HUD do jogo.

**Como usar (gerador):** `assets/orbi.js` expõe `window.OrbiChar`. `OrbiChar.svg('acenando'|'comemorando'|'curioso'|'parado')` devolve o SVG completo; `OrbiChar.inner(kind)` devolve só o conteúdo (para recortar busto/avatar com um `viewBox` próprio). Carregue com `<script src=".../assets/orbi.js"></script>`. Também há SVGs planos prontos: `assets/orbi-{pose}.svg`.

---

## Índice — o que tem aqui

**Foundations**
- `styles.css` — ponto de entrada (só `@import`s).
- `tokens/colors.css` — **Mundo Adesivo**: tinta/contorno, cores de brincar, superfícies (céu claro), aliases semânticos.
- `tokens/typography.css` — fontes, pesos, escala, métricas.
- `tokens/fonts.css` — `@import` Fredoka + Atkinson Hyperlegible (Google Fonts).
- `tokens/spacing.css` — espaçamento, raios, **contorno**, **sombra sólida** + suave, movimento.

**Design System cards** (em `guidelines/`)
- **Colors:** cores de brincar · tinta & contorno · superfícies.
- **Type:** Fredoka display · Atkinson apoio · caixa alta (etiqueta-adesivo).
- **Spacing:** raios & contorno · sombra sólida + suave.
- **Brand:** logotipo Órbi oficial (wordmark adesivo + ícone) · personagem Órbi (3 expressões).

**Assets**
- `assets/orbi.js` — gerador do personagem (`window.OrbiChar`).
- `assets/orbi-{acenando,comemorando,curioso,parado}.svg` — SVGs planos do personagem.

  - **Personagem:** Órbi — o astronautinha (4 poses + expressões).
  - **Telas:** tela de abertura do jogo.

**Apresentações** (raiz)
- `Órbi — Direção Oficial.html` — fonte de verdade do clima Mundo Adesivo.
- `Órbi — Personagem.html` — poses, prova de ícone e construção do astronautinha.
- `Órbi — Tela de Abertura.html` — logo + Órbi acenando + tagline + JOGAR (interativo).

**Arquivo** (exploração, não é mais a direção)
- `arquivo/Órbi — Climas Visuais.html` — os 3 climas comparados (Dia de Festa, Expedição, Mundo Adesivo).
- `arquivo/Órbi — Primeira Rodada (standalone).html` — logotipo A/B/C + paleta + tipo da 1ª rodada.

---

## Próximos passos

1. ~~Tela de abertura~~ — ✅ feita.
2. **Componentes** reutilizáveis (Botão, Cartão, Chip, etc.) no clima adesivo.
3. **UI kit** de telas do jogo (mapa da cidade, atividade, recompensa).
4. **Ícone de app** final a partir do Órbi (busto) + set de ícones de interface.

> **Flag de fontes:** Fredoka e Atkinson Hyperlegible estão via Google Fonts. Para produção, recomenda-se auto-hospedar os `.woff2` e declarar `@font-face` local. Posso fazer isso quando aprovado.
