# HANDOFF — Cidade Turbo 3D · ADENDO: O CURRÍCULO (Fatias 6+)
### Como as 5 matérias entram sem quebrar o que já funciona

> **Status do jogo ao escrever este adendo:** Fatias 1–5 entregues e aprovadas
> (carro arcade, cidade mínima, store+HUD+voz, missão GPS de leitura, economia de
> combustível). Pendências já registradas: Fatia 5.1 (pedágio + fonte de moedas +
> extrair `<ZoneSensor>`). Este adendo rege as fatias **a partir da 6** e substitui
> o roadmap antigo da §8 dali pra frente.
>
> **Como usar:** este é contexto de arquitetura. Continua valendo o método —
> uma fatia por commit, build-validada, recon read-only, drop-in completo, e o
> Code commita ao fim de cada fatia validada. Não construir mais de uma fatia por vez.

---

## A. O modelo: fusão "mundo aberto que ensina" + "escola gamificada"

Decisão tomada com o Anderson. **Liberdade na superfície, currículo no motor.**

- **Liberdade (o que prende):** o Heitor dirige livre pela cidade. Ele **escolhe para qual bairro ir** — cada bairro é uma matéria. Sente que manda no jogo. É o "fator GTA".
- **Currículo (o que garante o aprendizado):** dentro do bairro escolhido, **o jogo escolhe a dificuldade** — sobe de nível conforme ele acerta, desce/repete se erra. Ele nunca vê uma "aula"; vê missões. Mas o motor sabe qual habilidade da BNCC cada missão treina.

**Quem decide a missão (regra-mãe):** *ele escolhe o bairro/tema; o jogo escolhe o nível dentro dali.* Não é missão aleatória, não é prova imposta. É agência de tema + controle de dificuldade.

**Princípio inegociável (já provado nas Fatias 4 e 5):** cada matéria entra **embutida numa ação do mundo** (dirigir, entregar, abastecer, levar alguém), **nunca como uma tela de quiz separada**. Cinco mecânicas diferentes viram um Frankenstein e quebram o "uma coisa por vez" que regula TEA+TDAH. A cidade É o currículo.

---

## B. A cidade vira BAIRROS temáticos (resolve a repetição)

Hoje há 3 prédios soltos. A partir daqui, a cidade se organiza em **regiões/bairros**, um por matéria, cada um com sua paleta e seus destinos. Isto, por si só, mata a repetição ("hospital→pizza→escola") e — de brinde — ensina **geografia espacial real** (regiões, trajetos, "fica longe/perto", pontos de referência).

Mantém os guard-rails: mundo legível, poucos elementos por bairro, paleta calma e distinta entre bairros, **uma missão ativa por vez**.

Um **HUB central** (ou um seletor simples) deixa o Heitor escolher para qual bairro dirigir. A escolha é dele; a dificuldade lá dentro é do jogo.

---

## C. Mapeamento matéria → mecânica de cidade

Cada matéria é uma **ação**, reusando o padrão "vá ao lugar certo / faça a quantidade certa" que já funciona. Banco de missões **fixo** (escrito por nós; sem IA por enquanto — ver §E).

| Matéria | Bairro / lugar | Mecânica (ação embutida) | Habilidade BNCC registrada |
|---|---|---|---|
| **Português** | já existe (GPS) | Ler a placa e dirigir até o destino. Cresce: mais palavras → frases curtas ("LEVE O CACHORRO AO VET") | `leituraGlobal` → depois `leituraFrase` |
| **Matemática** | posto + mercado | Já no abastecer (contagem). Cresce: "ENTREGUE 3 PIZZAS" (vá a 3 casas), pedágio 1–15, troco simples | `contagem` → `adicao` |
| **Geografia** | a própria cidade | Navegação por região: "vá para o bairro NORTE", "atravesse o RIO", "qual fica mais longe". A estrutura de bairros (§B) já é geografia | `navegacao`, `orientacao` |
| **Ciências** | parque / clínica vet | Destino temático: "leve o animal doente ao VETERINÁRIO", "qual lugar tem ÁRVORES", dia/noite, chuva | `cienciasVida`, `cienciasNatureza` |
| **História** | (entra por último, de leve) | Profissões via veículos (bombeiro, médico — ver Fatia 6): "vá ao BOMBEIRO". Sequências: antes/depois, dia da semana | `profissoes`, `tempo` |

**Ordem de entrada (do mais natural ao mais abstrato):** Português e Matemática já estão → Geografia (quase de graça com os bairros) → Ciências → História por último. História é a mais difícil de embutir num jogo de carro; entra leve, sem forçar.

---

## D. Roadmap de fatias (a partir da 6) — uma por commit

| # | Fatia | Entrega | Gate |
|---|---|---|---|
| **5.1** | Pedágio + fonte de moedas + `<ZoneSensor>` | (já planejada) moedas vêm de completar missões; pedágio 1–15; sensor unificado | matemática de pedágio funciona; moedas têm origem |
| **6** | Troca de veículo | bombeiro/polícia, cada um muda parâmetros de física; base pra missões de profissão | física muda perceptível por veículo; o Heitor aprova o feel |
| **7** | **Bairros + HUB de escolha** | cidade reorganizada em regiões temáticas; seletor de bairro; geografia espacial | dá pra escolher bairro e dirigir até ele; mundo legível, não polui |
| **8** | **Bairro Ciências** | clínica vet + parque; missões "leve o animal ao VET", "ache as árvores"; registra `cienciasVida` | missão temática funciona; habilidade registra +1 (não +2) |
| **9** | **Português nível 2** | frases curtas além de palavra única; mais destinos; registra `leituraFrase` | ler frase leva ao destino certo |
| **10** | **Matemática nível 2** | entregas com contagem ("3 pizzas"), troco simples; registra `adicao` | conta certo; sem alvo instável (lição do code-review da Fatia 5) |
| **11** | **Bairro História (leve)** | profissões via veículos; sequência simples (antes/depois) | funciona sem forçar; guard-rails intactos |
| **12** | **Adaptação de dificuldade** | dentro de cada bairro, o nível sobe com acerto / repete com erro (o "jogo escolhe a dificuldade") | a dificuldade responde ao desempenho real |
| **13** | **Relatório por habilidade (BNCC)** | tela que lê o registro acumulado e mostra o que ele domina por habilidade | relatório bate com o que foi jogado |

Ordem é guia, não dogma — mas **uma por vez**, cada uma validada (e idealmente aprovada pelo Heitor) antes da próxima.

---

## E. Conteúdo: banco FIXO agora, IA depois (a costura)

- **Agora:** todas as missões saem de um **banco fixo** escrito por nós, por matéria e por nível (como `destinos.js` já faz pro GPS). Previsível, sem custo, revisável — dá pra garantir que cada item está no nível certo e sem erro pedagógico.
- **Organização sugerida:** um arquivo por matéria em `src/missions/` (ex. `missoes-portugues.js`, `missoes-matematica.js`), cada um exportando níveis (`[[nível1...],[nível2...]]`), no mesmo formato que o banco do jogo educativo já usou. Um "registry" central liga bairro → banco.
- **A costura para IA (não construir agora, só deixar pronto):** as missões devem ser **consumidas por uma interface** (uma função `proximaMissao(materia, nivel)`), não lidas direto do array espalhado. Assim, quando o mundo amadurecer, trocar o banco fixo por geração via Claude API é trocar a implementação dessa função — sem tocar no resto do jogo. Documentar isso, não implementar.

---

## F. Registro por habilidade: a tela vem depois, o DADO começa JÁ

**Esta é a única regra que não pode esperar.** O relatório da BNCC (a evidência pra escola — a munição contra "tratam ele como criança de 3 anos") é uma tela que fica **pro fim** (Fatia 13). **Mas o registro do dado começa na próxima missão construída.**

- A store já tem `registrarHabilidade(chave, acertou)` desde a Fatia 3 e `habilidades` persistido em localStorage.
- **Regra para toda fatia daqui pra frente:** toda missão, ao ser concluída, chama `registrarHabilidade` com a chave da habilidade que ela treina. É **uma linha por missão**. Barato agora; salva semanas de retrabalho depois.
- Quando a Fatia 13 chegar, o relatório só **lê** esse acúmulo — o dado já estará todo lá, coletado desde a Fatia 6.
- **Cuidado herdado do code-review da Fatia 5:** registrar **+1 por conclusão, nunca +2** — efeitos de conclusão fora de updaters de `setState` (StrictMode duplica em dev). Esse dado precisa ser honesto, senão a evidência mente.

---

## G. O que NÃO fazer (guarda-corpos do adendo)

- **Não** transformar matéria em minigame/tela separada. Tudo embutido em ação de cidade.
- **Não** empilhar objetivos: uma missão ativa por vez, sempre visível e narrada (prioridade já estabelecida no HUD: aviso de combustível > missão).
- **Não** introduzir IA generativa agora (decisão tomada). Só deixar a costura pronta.
- **Não** colocar timer, game over, ou punição. Acerto comemora; erro é neutro.
- **Não** construir mais de uma fatia por prompt. O entusiasmo de "quero as 5 matérias" é justamente o que precisa ser fatiado — senão vira o Frankenstein.
- **Manter** `prefers-reduced-motion`, CAIXA ALTA, paleta calma, áudio pt-BR em tudo.
