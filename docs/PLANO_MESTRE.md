# Plano mestre — Órbi

**Status: proposta, aguardando aprovação do Anderson.** Nada aqui autoriza
código, commit de código, push, merge ou deploy. Cada fatia só começa quando for
pedida e cumprir a definição de pronto (§2.1).

Escrito em 27/09/2026 na branch `codex/activity-coordinator-p0`, a partir do HEAD
`f945547`. Data-alvo de lançamento: **04/10/2026** (ver `docs/LANCAMENTO.md`).

---

## 0. Como ler

- **Fato** é o que foi lido no código, no git ou medido nesta rodada, com o
  arquivo indicado.
- **Proposta** e **estimativa** são opinião de planejamento: ordem, fatias,
  esforço, "cabe até 04/10".
- **Não verificado** marca o que não foi possível confirmar (lista em §8).

Nas fichas (§3), "Já existe" é sempre fato. "Arquitetura", "Fatias", "Esforço"
e "Cabe" são sempre proposta ou estimativa.

**Esforço** é contado em **fatias**, e cada fatia é um commit revisado.
**Capacidade assumida:** de 2 a 3 fatias revisadas por dia. É estimativa: o
limite real é o tempo de revisão do Anderson.

**Siglas de teste** usadas nas fichas:

| Sigla | Teste |
|---|---|
| **U** | unitário, com `node:test` |
| **R** | ponta a ponta pelo runtime da aventura, sem browser |
| **B** | `npm run build` |
| **V** | conferência visual no notebook |
| **C** | teste no celular (build de produção, Wi-Fi local) |
| **O** | observação com as crianças, registrada em `docs/TESTES_COM_CRIANCAS.md` |

---

## 1. Estado de partida (diagnóstico)

### 1.1 Linha de base — fato

- **Testes:** `npm test` passa 80 de 80 (27/09/2026).
- **Build:**

| Arquivo | Tamanho | Com gzip |
|---|---|---|
| `index-*.js` (pacote inicial) | **195,70 kB** | 63,57 kB |
| `GameExperience-*.js` (o jogo, carregado sob demanda) | 3.121,23 kB | 1.063,56 kB |
| `index-*.css` | 52,47 kB | 8,36 kB |

- **Save:** `SAVE_VERSION = 8` (`src/save.js:20`). A migração é genérica
  (`migrarEstadoPersistido`). A Área dos Pais já exporta e importa o save
  (`backupDoSaveAtual`, `validarSaveImportado`).
- **Preferências:** `normalizarPreferencias` e a migração **só aceitam
  booleanos** (`src/preferences.js:29`, `src/save.js:32`). Um valor de texto ou
  número guardado em `preferencias` é descartado e volta ao padrão.
- **Cidade:** 11 destinos em `src/city/bairros.js`, mais POSTO e GARAGEM, que
  são serviços.

### 1.2 Escala e distâncias — fato, com medidas calculadas dos dados reais

**Onde cada coisa é definida:**

| O quê | Onde |
|---|---|
| Prédios-destino (posição, tamanho, chão dos bairros) | `src/city/bairros.js`, fonte única. Sensores de chegada, GPS e marcador da aventura derivam dela. |
| POSTO | `src/components/GasStation.jsx:17`, fixo no componente |
| GARAGEM | `src/city/garagem.js` |
| Ruas | `src/components/RoadNetwork.jsx` (`CAMINHOS`), largura 6,5 (7,6 com a borda) |
| Carro | `src/components/Car.jsx`: 3,5 × 1,8, velocidade máxima 14 unidades/s |
| Zoom | `src/ui/responsive.js`: piso de toque 9, piso de desktop 11, teto 16 |
| Ângulo da câmera | `src/visual/world-style.js` (elevação de cerca de 39,6°) |
| Moedas | `src/city/moedas.js` (30 moedas) |
| Bichos | `src/city/bichos.js` (5 bichos) |
| Carona | `src/components/Carona.jsx:40`: cão em [-9, 5] e uma **cópia** da posição do PARQUE |
| Aventura do parque | as etapas usam só nomes de lugar; baldes em `BaldesAventura.jsx:8` (x = -44), flores em `FloresParque.jsx:7`, canteiro em `src/city/canteiro.js` |
| Decoração | `Cenario.jsx`, `DecoracaoExtra.jsx`, `CityLife.jsx`, `Landscape.jsx`, todas com coordenadas fixas |

**Medidas:**

- **Proporção:** carro 3,5 × 1,8; rua 6,5; prédio médio 13,3 × 12,4 de base e
  7,6 de altura. **Razão carro : rua : prédio ≈ 1 : 1,9 : 3,7**, comparando o
  comprimento do carro com a largura da rua e com o lado do prédio. Um hospital
  mede 4 carros de comprimento.
- **Pares colados:**
  - PIZZA↔POSTO: **2,0** unidades entre as paredes, com as calçadas sobrepostas.
    O sensor de chegada da PIZZA invade a zona do POSTO.
  - ZOO↔VET: **4,0** unidades entre as paredes, com as calçadas sobrepostas.
- **Demais vizinhos mais próximos:** de 10 a 25 unidades entre as paredes.
- **Tempo de viagem:** o par mais distante (FAROL↔PADARIA) fica a 124
  unidades, **cerca de 9 s** em linha reta na velocidade máxima, ou cerca de
  10 s pela rua. Os trajetos no centro levam de 2,5 a 3 s.
- **No celular:** o zoom bate no piso de toque (9). Uma tela Android de 800×360
  mostra cerca de 89×63 unidades de chão, com a cidade medindo cerca de
  134×118. O celular vê de 3 a 5 lugares de uma vez, e o carro fica com cerca
  de 32 px de comprimento. No desktop (zoom 16), são 56 px.

**O que depende das posições.** Derivam sozinhos de `bairros.js`, sem risco:
sensores de chegada, marcador da aventura, GPS, chão dos bairros, render dos
prédios, a lógica da aventura do parque (só nomes de lugar), `BuscaSensor` (lê
de `bichos.js`) e o quiz de contagem (lê de `canteiro.js`).

Precisam ser acompanhados à mão:

- a **cópia da posição do PARQUE** na Carona;
- os baldes, as flores e o canteiro;
- o POSTO e a GARAGEM;
- as moedas e os bichos, com folgas documentadas só em comentário;
- as ruas e toda a decoração.

Testes que dependem de posição: `tests/school-layout.test.js` exige a ESCOLA em
[0, 38]. O combustível gasta 0,08% por unidade andada; a viagem mais longa custa
hoje cerca de 10% do tanque.

### 1.3 Desempenho: causas prováveis e como medir

**Fatos lidos no código e medidos:**

- **Configuração do Canvas:** `dpr={[1, 2]}`, `antialias: true`,
  `powerPreference: 'high-performance'` (`src/GameExperience.jsx:97-105`).
- **Sombras reais: nenhuma.** São zero ocorrências de
  `castShadow`/`receiveShadow`/`shadows`; as sombras são planas (`BlobShadow`).
- **Chamadas de desenho: 290 por quadro**, estável (mínimo = mediana = máximo).
  Medido no build de produção, no navegador embutido do notebook, a 1280×720
  CSS px e DPR 1,25, parado no início com o painel da aventura aberto, durante
  120 quadros.
- **13 componentes com `useFrame`:** BaldesAventura, Bichos, BuscaSensor,
  CameraFollow, Car, Carona, Cenario, CityLife, FloresParque, FuelController,
  Game, Moedas e OpenPark.
- **Malhas escritas no código:** `Building` tem 55 `<mesh>` no molde, repetido
  por prédio e com partes condicionais; `Bichos` tem 70; `OpenPark`, 38; `Car`,
  14. `Cenario`, `DecoracaoExtra`, `Arvores`, `CityLife`, `Landscape` e
  `Moedas` usam `Instances`.
- **Física:** um único corpo dinâmico (o carro), colisores fixos dos prédios e
  cerca de 14 sensores (11 de chegada, POSTO, GARAGEM e carona). O comentário
  de `Ground.jsx` registra que o `<Physics>` "acumula o tempo perdido e roda
  até 0,5 s de simulação num frame só".
- **Combustível:** gravado no store em lotes de 0,5% (`FuelController.jsx`).
  Na velocidade máxima são cerca de 2 gravações por segundo, e cada uma passa
  pelo `persist` do save.
- **Balão da carona:** é DOM (`<Html>` do drei), reposicionado a cada quadro.
- **Letreiros:** `<Text>` do drei/troika sem a prop `font`. O pacote contém a
  URL de resolução de fontes `cdn.jsdelivr.net/gh/lojjic/unicode-font-resolver`.
- **Fontes da interface:** Fredoka e Atkinson Hyperlegible vêm do Google Fonts.
- **Carregamento:** o `GameExperience` transferiu 1.039 kB em 301 ms no
  localhost. O Stats (medidor de FPS) só existe em desenvolvimento.

**Hipóteses, da mais para a menos compatível com "liso, mas travou em cerca de
10% do tempo"** — estimativa, a confirmar com medição:

1. **Quadros longos intermitentes de CPU:** coleta de lixo por alocações nos 13
   `useFrame`, re-render do React a cada mudança do store (combustível, moedas)
   com escrita síncrona do save, e o balão em DOM.
2. **Primeira aparição de algo:** compilação de shader quando surge um objeto
   ou material novo (baldes, flores, passageiro) e geração de glifos do troika,
   incluindo o carregamento de fonte pela CDN.
3. **Custo contínuo de GPU perto do limite:** DPR até 2, com antialias e
   `MeshStandardMaterial`, e cerca de 290 chamadas de desenho. Isso vira
   travada quando algo a mais entra em cena.
4. **Física em recuperação:** depois de um quadro longo, o Rapier roda vários
   passos de uma vez e o quadro seguinte também fica longo (efeito cascata).
5. **Aquecimento do aparelho** ao longo da sessão.
6. **Voz** (`speechSynthesis`) no Android.

**Pouco prováveis como causa de travada no meio do jogo:** tamanho do pacote
(pesa no carregamento, não durante o jogo), número de sensores e sombras
(não há sombras reais).

**Como medir de forma repetível** — proposta, fatia A3.1:

1. **Medidor no próprio build de produção**, ligado só com `?medir=1` no
   endereço. Mostra e permite copiar:
   - tempo de quadro (mediana e p95);
   - % de quadros acima de 50 ms e o maior quadro;
   - chamadas de desenho, triângulos, geometrias e texturas (`renderer.info`);
   - duração da sessão.

   Não grava nada no save e não envia nada para lugar nenhum. A matemática fica
   num módulo puro testável em `node:test`.
2. **Protocolo fixo:**
   - mesmo celular, bateria acima de 50% e economia de energia desligada;
   - mesmo Wi-Fi e recarga completa da página antes de cada rodada;
   - **rota padrão de cerca de 3 minutos:** início → PIZZA → ESCOLA → PARQUE →
     PORTO → MERCADO;
   - **3 rodadas com o Modo Tranquilo desligado e 3 com ele ligado**, anotando
     em que trecho cada travada aconteceu.
3. **Comparação de hipóteses** por parâmetros de medição (`?dpr=1`, `?aa=0`,
   `?balao=0`), que existem **só** com `?medir=1`. Nenhuma otimização entra no
   jogo sem ganho medido nessa comparação.
4. **Alternativa sem código:** depuração remota do Chrome por USB
   (`chrome://inspect`, painel Performance). Exige ativar a depuração USB no
   celular, o que é decisão e ação do Anderson.

### 1.4 Inventário: o que reaproveitar — fato

**Nesta base** (`codex/activity-coordinator-p0`) — pronto e ligado ao jogo:

- coordenador de atividades em pilha (12 atividades, com prioridade,
  `interrompivel`, `dirigir`, `mundo`, `hud` e `voz`);
- motor puro de aventuras, com as etapas `fala`, `pergunta`, `ir_para`,
  `coletar`, `distribuir`, `entregar`, `mundo`, `recompensa` e `resumo`;
- aventura **O parque está com sede**, que começa sozinha;
- parque florido (`worldFlags.parque_florido`);
- Carona, Garagem com cores, Moedas, Caderninho (6 categorias: lugares,
  bichos, frutas, números, países e objetos), quiz de bandeiras no ESTÁDIO,
  missões de busca de bichos e VET;
- Modo Tranquilo e preferências de voz, sons, animações e detalhes;
- Área dos Pais com exportação e importação do save;
- `OrientationGuard`, só dentro do jogo;
- 4 poses do Órbi: acenando, comemorando, curioso e parado.

**Nesta base, só como módulo puro e testes** — existe, mas **não está ligado
ao jogo**:

- `src/school/horta.js` e `horta-aventura.js` (Horta parametrizada por faixa,
  com etapas `distribuir`), e `iniciarHortaEscola` no runtime — **nenhum
  componente chama**;
- `src/school/activities.js`: faixas `BANDS` (3–5 Explorar, 6–7 Descobrir,
  8–10 Investigar), atividades dos tipos `choice`, `order` e `studio`, e
  `paintCell`;
- `school-layout.js` e `school-living-model.js` (planta da escola, cópia do
  mural, vista do jardim);
- `src/city/padaria-model.js` (pães na cesta, conferir pedido);
- `SchoolThankYou.jsx`.

**Só na branch congelada** `feature/orbi-golden-rebuild` (último commit
`8a3235e`, 20/09/2026, lida com `git show`):

| Assunto | Arquivos |
|---|---|
| Horta | `HortaPanel.jsx`, `horta.css`, `SchoolLivingEnvironment.jsx`, `ParkBedView.jsx`, `store/horta-actions.js` |
| Escola | `SchoolStudio.jsx` (ateliê), `SchoolArtMural.jsx` (mural), `SchoolActivity.jsx`, `SchoolMicroScene.jsx`, `SchoolEnvironment.jsx`, `school.css` |
| Padaria | `PadariaMicroScene.jsx`, com `ContextualInteractionHost.jsx` e `interactions/contextual-interactions.js`, que usam uma arquitetura própria, diferente do coordenador desta base |
| Repetir fala | `VoiceControls.jsx` e `audio/voice-state.js` |
| Orientação | `ui/build01.js` com `deveExigirLandscape(fase, retrato)`, função pura |
| Testes | `horta-store`, `padaria-micro-scene`, `school-interaction`, `orbi-voice`, `contextual-interaction`, `park-bed-view`, `build01-ui`, `garagem-exit` |
| Documentos | planos e resultados em `docs/superpowers/` e `docs/ORBI_*`, com evidências em `docs/evidence/` |

**Em lugar nenhum:**

- nome próprio e fala dos bichos;
- poses de admirar e apontar;
- dicas de controle em sequência;
- controle de volume (hoje só há liga/desliga de sons e de voz);
- seletor de faixa na interface;
- gatilho da Horta e sementes coletáveis;
- mecânicas de separar, montar palavras e comparar quantidades;
- educação física no ESTÁDIO;
- criações e lembranças no Caderninho;
- medidor de desempenho em produção;
- página do universo;
- registro central das mudanças da cidade.

### 1.5 Publicação — fato

Há **três alvos** no repositório:

- **Netlify:** `netlify.toml` nesta base.
- **Cloudflare Pages:** `.github/workflows/deploy.yml` **na `origin/main`**,
  que publica a cada push na `main` (`wrangler pages deploy dist
  --project-name=orbi`). O comentário do arquivo cita a URL
  `orbi-3ge.pages.dev` e um domínio próprio.
- **Vercel:** o README da `origin/main` aponta `https://orbi-kahe.vercel.app`.
  **Informado pelo Anderson em 27/09/2026:** o painel da Vercel indica que um
  push na `main` atualiza a produção de `orbi-kahe.vercel.app`. A Vercel
  publica automaticamente a partir da `main`, e **isso precisa ser desligado
  antes do merge** (E5.2). Não há arquivo de configuração da Vercel no
  repositório; a ligação está no painel.

**Relação entre `origin/main` e esta base:** 5 commits só na `main` e 25 só
aqui.

- Os commits só da `main` são: 2 correções de celular, `chore(release):
  v2.0.0` e 2 de README.
- A correção do chão já tem equivalente nesta base (`THICKNESS = 20`). A dos
  controles de toque **não foi conferida**.
- **Simulação de merge** (`git merge-tree`, sem gravar nada):
  - há conflito em `src/App.jsx` e em `README.md`;
  - `Ground.jsx` e `styles.css` se resolvem sozinhos;
  - o workflow do Cloudflare **sai**, porque esta base o removeu.

---

## 2. Governança comum

### 2.1 Definição de pronto para começar

Uma fatia só começa quando estiver escrito, antes de qualquer código:

1. **escopo** numa frase, e o que fica de fora;
2. **critério de aceite** verificável;
3. **arquivos afetados**, com uma leitura prévia só de consulta;
4. **impacto no save**: muda `SAVE_VERSION` ou não, e por quê;
5. **testes** que serão escritos ou ajustados, pelas siglas da §0;
6. **iniciativas das quais depende**, já concluídas.

### 2.2 Definição de concluído

- `npm test` verde, com os testes novos da fatia incluídos.
- `npm run build` verde, e o orçamento da §2.4 respeitado.
- Conferência visual no notebook (**V**) quando a fatia muda algo que se vê.
- Teste no celular (**C**) quando a fatia mexe em mundo, câmera, toque,
  desempenho ou layout.
- Registro em `docs/TESTES_COM_CRIANCAS.md` quando houve sessão com as
  crianças (**O**).
- `docs/DIVIDA_TECNICA.md` atualizado quando a fatia resolve ou cria um item.
- Checklist de princípios da §2.6 conferido.

### 2.3 Método

- **Uma fatia por vez, um commit por fatia.** Sem "aproveitar e corrigir" de
  passagem.
- **Nenhum commit sem o Anderson revisar o diff.**
- **Nenhum push, merge, PR, deploy ou compra de domínio sem autorização
  expressa.**
- A branch congelada só é **lida** (`git show`); nunca recebe merge nem
  checkout para edição.

### 2.4 Orçamento de desempenho

| Medida | Linha de base | Teto proposto |
|---|---|---|
| Pacote inicial `index-*.js` | 195,70 kB | **200 kB**; acima disso, só com justificativa escrita |
| `GameExperience-*.js` | 3.121,23 kB | **3.200 kB** sem justificativa |
| Chamadas de desenho (ponto fixo: início, painel aberto, notebook) | 290 | **+15% no máximo (≈ 335)** até a medição no celular dizer outra coisa |
| Fluidez no celular | a medir (A3.2) | **alvo provisório:** até 2% de quadros acima de 50 ms na rota padrão e nenhum acima de 250 ms depois dos primeiros 10 s |

O alvo de fluidez é **provisório** e será substituído pelo número definido
depois da primeira medição no aparelho (A3.2). Toda fatia que acrescenta coisas
ao mundo (A2, B1, B2, B4, B7) mede as chamadas de desenho antes e depois.

### 2.5 Política de save

**Sobe `SAVE_VERSION` quando:**

- entra uma chave nova no `partialize` de `useGame.js`;
- entra uma categoria nova aninhada em `descobertas` ou `habilidades`;
- entra uma preferência que **não seja booleana**, o que exige também mudar
  `normalizarPreferencias` e `migrarEstadoPersistido`, que hoje descartam
  valores não booleanos.

**Não sobe quando** a fatia só usa o que já existe: `worldFlags`,
`recompensas`, categorias atuais do Caderninho.

**Como testar a migração:**

1. **U:** um save da versão anterior como fixture em `tests/save.test.js`.
   Migrar e conferir que moedas, descobertas, `worldFlags`, `recompensas` e
   preferências continuam iguais, e que a chave nova chega com o padrão.
2. **U:** um save de versão futura continua sendo recusado pela importação.
3. **Manual:** exportar o save real do celular pela Área dos Pais **antes** de
   instalar a versão nova. Depois de carregar, conferir o Caderninho, as moedas
   e o parque florido. Guardar o arquivo exportado como plano de volta.

### 2.6 Checklist de princípios e acessibilidade (toda fatia)

- [ ] **Errar não pune nem trava:** sem som de erro, sem vermelho, sem perda;
      na terceira tentativa a resposta aparece.
- [ ] **Sem ranking, placar, cronômetro, sequência diária ou "volte amanhã".**
- [ ] **Uma coisa por vez:** a atividade nova passa pelo coordenador, com
      prioridade e `interrompivel` definidos.
- [ ] **Modo Tranquilo:** reduz som, movimento e detalhe, e **mantém a voz**.
- [ ] **Acessível a quem não lê:** ícone, cor e voz carregam a informação;
      texto é apoio.
- [ ] **A cidade cresce com a criança (D1):** toda mudança no mundo é causada
      pela criança, anunciada pelo Órbi, permanente, uma por vez e sem esteira
      de desbloqueio.
- [ ] **Tom do Órbi:** curiosidade, nunca cobrança; a chegada ensina de volta.
- [ ] **Alvo de toque grande** para crianças de 3 anos, e `prefers-reduced-motion`
      respeitado.
- [ ] **Nenhuma alegação pública** que o jogo não cumpra (E6).

---

## 3. Fichas das iniciativas

### A. Base e lançamento

#### A1. Escala e distâncias

- **Objetivo para a criança:** o carro parece carro, os lugares parecem
  lugares, e ir de um a outro é uma viagem. Menos lugares na tela ao mesmo
  tempo ajuda o foco.
- **Tese:** a criança guia o Órbi por distâncias que fazem sentido, e "fica
  perto / fica longe" vira geografia (adendo curricular, seção C).
- **Já existe:** `bairros.js` como fonte única; zoom responsivo com teste
  (`tests/responsive.test.js`); tudo o que deriva de `bairros.js` (§1.2).
- **Arquitetura:**
  - só dados puros: `src/ui/responsive.js`, `bairros.js` e a posição do POSTO;
  - um **teste de folgas** novo em `node:test`, que verifica sobreposição entre
    lotes, sensores, zonas de serviço, moedas e bichos;
  - sem componente novo, sem coordenador, sem motor;
  - **save não muda.**
- **Dependências:** A3.2 (medir antes, para não misturar causas). A2 vem
  depois, porque os adereços dependem das posições finais.
- **Riscos:**
  - *desempenho:* neutro a melhor, porque com zoom maior há menos objetos no
    campo de visão;
  - *sensorial:* com zoom maior, a mesma velocidade parece 22% mais rápida na
    tela;
  - *princípios:* nenhum.
- **Fatias:**
  - **A1.1 — teste de folgas.** Aceite: o teste falha hoje, apontando
    PIZZA↔POSTO e ZOO↔VET.
  - **A1.2 — separar os dois pares.** Mover POSTO e VET. Aceite: o teste de
    folgas passa, nenhuma calçada se sobrepõe, o sensor da PIZZA sai da zona
    do POSTO, e os baldes, as moedas e a decoração foram conferidos.
  - **A1.3 — zoom de toque de 9 para 11.** Aceite: a tela de 800×360 fica com
    zoom 11 e carro de cerca de 39 px; os testes de zoom passam; **C** e **O**
    dizem que não ficou rápido demais.
  - **A1.4 em diante (depois de 04/10) — espalhar a cidade em cerca de 1,4×.**
    Itens relativos (flores, canteiro, baldes, cão da carona, bichos) passam a
    ser deslocamentos a partir do lugar-âncora, e a cópia do PARQUE na Carona
    passa a ler de `bairros.js`.
- **Testes:** U, B, V, C, O.
- **Esforço:** 3 fatias para a opção leve; mais 5 a 7 para a opção maior.
- **Cabe até 04/10? Parcial.** A opção leve (A1.1 a A1.3) cabe. A opção maior
  mexe em cerca de 15 arquivos com folgas afinadas à mão e fica para depois,
  decidida pela observação com as crianças.

#### A2. Identidade dos lugares, sem mudar o estilo

- **Objetivo para a criança:** reconhecer cada lugar pelo que acontece nele,
  sem ler a placa: pães na vitrine, barcos, ambulância, balanço.
- **Tese:** a chegada já ensina ("então PADARIA é onde faz PÃO!"); a cena
  passa a mostrar isso antes mesmo da fala.
- **Já existe:**
  - `Building.jsx` varia só telhado, cor de acento e janela por prédio
    (`ESTILOS`);
  - `OpenPark.jsx` já é um lugar com identidade (fonte, brinquedos, bancos);
  - `school-layout.js` tem a planta da escola, só testada;
  - a identidade da padaria na congelada é uma micro-cena 2D (B5), não
    adereço no mundo.
- **Arquitetura:**
  - dado puro `src/city/identidade.js`: adereços por lugar, com posição
    relativa ao prédio;
  - componente `AderecosLugar.jsx` desenhado com `Instances` por tipo, para
    não multiplicar chamadas de desenho;
  - adereço é **estático** e continua no Modo Tranquilo, porque é informação,
    não enfeite;
  - sem coordenador, sem motor, **save não muda.**
- **Dependências:** A1.2 (posições finais), A3.2 (linha de base de chamadas de
  desenho).
- **Riscos:**
  - *desempenho:* cada adereço custa chamadas de desenho (teto da §2.4);
  - *sensorial:* excesso visual, por isso no máximo 1 ou 2 adereços por lugar;
  - *princípios:* informação por forma e cor, nunca só por texto.
- **Fatias:**
  - **A2.1 — estrutura e PADARIA** (pães na vitrine);
  - **A2.2 — PORTO** (barcos);
  - **A2.3 — HOSPITAL** (ambulância);
  - **A2.4 — ESCOLA** (balanço);
  - **A2.5 em diante:** PIZZA, MERCADO, FAROL, ZOO, VET e ESTÁDIO, um por
    fatia ou em pares.

  **Aceite de cada fatia:**
  - um adulto reconhece o lugar num print com a placa coberta;
  - chamadas de desenho dentro do teto;
  - o teste de folgas (A1.1) passa.
- **Testes:** U (contrato: todo adereço dentro do lote, sem invadir rua nem
  sensor), B, V, C, O.
- **Esforço:** 4 fatias até 04/10, mais 3 a 4 depois.
- **Cabe até 04/10? Parcial.** PADARIA, PORTO, HOSPITAL e ESCOLA cabem; os
  demais ficam para depois.

#### A3. Desempenho no celular

- **Objetivo para a criança:** dirigir sem engasgo. Travada quebra a sensação
  de controle, e imprevisibilidade incomoda o perfil TEA.
- **Tese:** a cidade responde **na hora** ao que a criança faz, e resposta
  imediata é pré-requisito disso.
- **Já existe:** o Stats, só em desenvolvimento; o Modo Tranquilo; sombras
  planas; o combustível gravado em lote; as medições do notebook (33–55 FPS) e
  do celular (cerca de 10% travado).
- **Arquitetura:**
  - módulo puro `src/perf/medidor.js` (tempos de quadro, percentis, contagem
    de quadros longos);
  - componente `MedidorDesempenho.jsx` montado só com `?medir=1`;
  - fora do coordenador, porque não é atividade da criança;
  - **save não muda**, porque o resultado é mostrado e copiado, não gravado.
- **Dependências:** nenhuma. **Destrava** A1, A2, B7 e os demais itens que
  acrescentam coisas ao mundo.
- **Riscos:**
  - *desempenho:* o medidor precisa custar quase nada;
  - *sensorial:* o painel só aparece com `?medir=1`, e a criança nunca o vê;
  - *privacidade:* nada é enviado.
- **Fatias:**
  - **A3.1 — medidor puro e painel com `?medir=1`.** Aceite: sem o parâmetro,
    o build fica idêntico em comportamento; com ele, mostra e copia o resumo;
    há teste U do módulo.
  - **A3.2 — medição de base no celular** pelo protocolo da §1.3. É ação do
    Anderson, com cerca de 20 minutos. Aceite: 6 rodadas registradas em
    `docs/TESTES_COM_CRIANCAS.md` (seção de medição) e alvo de fluidez
    definido.
  - **A3.3 — correção da maior causa medida,** uma causa por fatia. Aceite:
    melhora medida na rota padrão.
  - **A3.4 — nova medição e registro.**
- **Testes:** U, B, C; O confirma pela sensação.
- **Esforço:** de 3 a 5 fatias.
- **Cabe até 04/10? Parcial.** Medir cabe com certeza. Corrigir depende do que
  a medição mostrar: uma causa clara, como DPR ou antialias, cabe; uma causa
  difusa, como coleta de lixo, não.

#### A4. Tela inicial em retrato

- **Objetivo para a criança:** com o celular em pé, receber o mesmo convite
  calmo de virar, em vez de ver uma abertura minúscula.
- **Tese:** indireta. Remove um atrito antes da brincadeira começar.
- **Já existe:**
  - `OrientationGuard` só em `GameExperience.jsx` (fato);
  - a abertura é um canvas fixo de 1280×800 (item 10 da dívida técnica);
  - na congelada existe `deveExigirLandscape(fase, retrato)`, função pura.
- **Arquitetura:** portar a função pura, com teste, e montar o aviso também
  sobre a abertura e a intro (`App.jsx`). Sem coordenador; **save não muda.**
- **Dependências:** nenhuma.
- **Riscos:**
  - *sensorial:* nenhum novo, porque é o mesmo aviso de hoje;
  - *técnico:* `(orientation: portrait)` depende da proporção da janela, então
    uma janela de desktop mais alta que larga também mostra o aviso, como já
    acontece hoje dentro do jogo;
  - no campo do nome da intro, conferir que o teclado do celular não faz o
    aviso aparecer.
- **Fatias:** **A4.1.** Aceite: em retrato aparece o aviso na abertura, na
  intro e no jogo; em paisagem a abertura aparece inteira; o desktop fica
  inalterado.
- **Testes:** U, B, V, C.
- **Esforço:** 1 fatia.
- **Cabe até 04/10? Sim.**

#### A5. Painel de pergunta transparente (dívida técnica, item 1)

- **Objetivo para a criança:** ler a pergunta sem o mundo 3D aparecendo por
  trás.
- **Tese:** pergunta legível é o que permite à criança ensinar o Órbi.
- **Já existe:**
  - a hipótese do item 1: o fundo é opaco, e a transparência seria o fade de
    entrada `postoEntra` de 320 ms;
  - nesta rodada, uma captura do navegador embutido mostrou o painel da
    aventura opaco depois da entrada (**não conclusivo**: foi no notebook e em
    outro painel).
- **Arquitetura:** só CSS, se houver mudança. **Save não muda.**
- **Dependências:** nenhuma.
- **Riscos:** a animação é usada por **8 painéis**, então mexer nela afeta
  todos.
- **Fatias:**
  - **A5.1 — teste com `prefers-reduced-motion`,** sem código, 5 minutos do
    Anderson. Aceite: causa decidida.
  - **A5.2 — ajuste,** só se for bug de verdade ou se o Anderson decidir
    encurtar o fade. Aceite: nenhum painel transparente depois da entrada.
- **Testes:** V, C.
- **Esforço:** de 0 a 1 fatia.
- **Cabe até 04/10? Sim.**

#### A6. Declarar `esbuild` em `devDependencies` (dívida técnica, item 2)

- **Objetivo para a criança:** nenhum direto. Evita que um teste suma sem
  aviso.
- **Tese:** não se aplica, é infraestrutura.
- **Já existe:** `tests/garagem-saida.test.js` importa `esbuild`, que hoje
  chega pelo vite.
- **Arquitetura:** `package.json` e `package-lock.json`, fixando a mesma
  versão que o vite já instala. **Save não muda.**
- **Dependências:** nenhuma.
- **Riscos:** mudar a versão por engano. Por isso fixar exatamente a instalada
  e não rodar `npm audit fix`.
- **Fatias:** **A6.1.** Aceite: `esbuild` aparece em `devDependencies`,
  `npm ls esbuild` não mostra duplicata, `npm test` e o build passam.
- **Testes:** U (suíte inteira), B.
- **Esforço:** 1 fatia.
- **Cabe até 04/10? Sim.**

#### A7. Resumo da Horta nas repetições (dívida técnica, item 4)

- **Objetivo para a criança:** não ouvir "ganhou o adesivo" por algo que já
  tinha.
- **Tese:** o Órbi celebra a brincadeira, não o prêmio.
- **Já existe:** `src/school/horta-aventura.js:123`, com o texto fixo do
  resumo.
- **Arquitetura:** a definição da aventura recebe "já tem o adesivo?" e escolhe
  a linha. Função pura; **save não muda.**
- **Dependências:**
  - **B1**, porque a Horta não tem gatilho nesta base e a criança não vê esse
    resumo hoje;
  - observar o Heitor repetindo a Horta.
- **Riscos:** nenhum relevante.
- **Fatias:** **A7.1**, depois da decisão entre as 3 saídas registradas.
  Aceite: a segunda conclusão não anuncia o adesivo como novo.
- **Testes:** U, R.
- **Esforço:** 1 fatia.
- **Cabe até 04/10? Não.** Não tem efeito visível até B1 existir, e a decisão
  depende de observação.

### B. Experiências na cidade

#### B1. Horta jogável

- **Objetivo para a criança:** buscar sementes, plantar, regar e ver a horta
  da escola crescer para sempre. Conta e reparte sementes pelos canteiros.
- **Tese:** a criança ensina o Órbi o que a planta precisa, e a escola ganha
  uma horta viva.
- **Já existe:**
  - **nesta base:** `horta.js`, `horta-aventura.js` (`criarHortaEscola(band)`
    com etapas `distribuir`), `iniciarHortaEscola` no runtime,
    `school-living-model.gardenView`, `SchoolThankYou.jsx`, `BANDS` e os
    testes `horta`, `horta-aventura`, `adventure-distribuir` e
    `school-living`;
  - **na congelada:** `HortaPanel.jsx`, `horta.css`,
    `SchoolLivingEnvironment.jsx`, `ParkBedView.jsx`, `store/horta-actions.js`,
    e o plano e as evidências da "frente 01".
- **Arquitetura:**
  - a **faixa** é uma preferência de texto (`'3-5'`), o que exige mudar
    `normalizarPreferencias` e a migração, e **sobe `SAVE_VERSION` para 9**;
  - o **seletor** fica na Área dos Pais (é com um adulto), sempre acessível e
    trocável a qualquer momento, valendo na próxima aventura; o texto diz
    "ponto de partida, não medida";
  - o **gatilho de início** é a chegada à ESCOLA oferecendo a aventura (painel
    `historia`) e em seguida `em_missao`;
  - as **sementes** são coletáveis por proximidade, no padrão de
    `BaldesAventura`;
  - o **toque nos canteiros**: proponho começar pelo painel 2D, portando o
    `HortaPanel` com alvos grandes, e deixar o toque 3D para depois;
  - a **horta viva no mundo** usa `worldFlags` e o anúncio do Órbi (D1).
- **Dependências:** A1.2, porque a ESCOLA e o MERCADO podem mudar de lugar;
  D1.1. A7 vem logo depois.
- **Riscos:**
  - *desempenho:* os canteiros entram no teto de chamadas de desenho;
  - *sensorial:* são várias etapas, e cada uma passa pelo coordenador, uma de
    cada vez;
  - *princípios:* a faixa nunca aparece como nota nem como "nível".
- **Fatias:**
  - **B1.1 — faixa no save** (normalização e migração v8→v9) **e seletor na
    Área dos Pais.** Aceite: teste de migração verde e a faixa sobrevive ao
    recarregar.
  - **B1.2 — gatilho na ESCOLA.** Aceite: R ponta a ponta da aventura com
    faixa.
  - **B1.3 — sementes no mundo.** Aceite: coleta por proximidade, sem física.
  - **B1.4 — painel dos canteiros.** Aceite: `distribuir` concluído pelo toque.
  - **B1.5 — horta viva e anúncio.** Aceite: a flag persiste e o Órbi anuncia
    uma única vez.
  - **B1.6 — A7.**
- **Testes:** U, R, B, V, C, O.
- **Esforço:** 6 fatias.
- **Cabe até 04/10? Não.** São seis fatias com mudança de save, e o caminho
  crítico do lançamento já ocupa a semana.

#### B2. Escola com ateliê de pintura e mural na fachada

- **Objetivo para a criança:** pintar e ver a própria pintura na parede da
  escola.
- **Tese:** a criança mostra ao Órbi cores e formas (o adendo põe artes no
  mapa), e o mural fica para sempre.
- **Já existe:**
  - **nesta base:** `activities.js` (tipo `studio`, `paintCell`),
    `copySchoolArt`, `school-layout.js`;
  - **na congelada:** `SchoolStudio.jsx`, `SchoolArtMural.jsx`,
    `SchoolActivity.jsx`, `SchoolMicroScene.jsx`, `school.css` e a spec visual
    aprovada (`docs/superpowers/specs/`).
- **Arquitetura:**
  - atividade nova `atelie` no coordenador (painel, `dirigir: false`, não
    interrompível), definida no módulo puro com teste;
  - o mural é uma **grade pequena de ids de cor**, não uma imagem, desenhada
    como textura de uma chamada de desenho;
  - chave nova no save, portanto **`SAVE_VERSION` sobe.**
- **Dependências:** A2.4 (identidade da escola), D1.1, e C5 para guardar a
  criação.
- **Riscos:**
  - *desempenho:* a textura do mural precisa ser pequena;
  - *sensorial:* paleta calma;
  - *princípios:* a arte nunca é avaliada ("cada criação pode ser diferente").
- **Fatias:**
  - **B2.1 — atividade `atelie` no coordenador** (U);
  - **B2.2 — painel do ateliê portado** (V, C);
  - **B2.3 — mural na fachada, com save e migração** (U, V);
  - **B2.4 — anúncio do Órbi (D1)** (R, O).
- **Testes:** U, R, B, V, C, O.
- **Esforço:** 4 fatias.
- **Cabe até 04/10? Não.**

#### B3. Animais com identidade

- **Objetivo para a criança:** cada bicho da cidade tem nome e uma fala curta,
  e a criança os apresenta ao Órbi.
- **Tese:** "Esse é o TOTÓ? Ele faz au au!": o Órbi aprende o nome com a
  criança.
- **Já existe:** 5 bichos em `bichos.js` (slug, posição, pista); o banco
  `ANIMAIS` (emoji, som, artigo); a detecção por proximidade de `BuscaSensor`;
  a categoria `animais` no Caderninho.
- **Arquitetura:**
  - `nome` e `fala` como dados puros em `bichos.js`;
  - fala por proximidade **só quando a atividade é `explorando`** (prioridade
    0, nunca interrompe missão), com intervalo mínimo entre falas;
  - **save não muda**, porque usa `descobertas.animais`.
- **Dependências:** nenhuma técnica. Os nomes são decisão de produto, e uma
  ideia coerente com a tese é deixar os meninos escolherem.
- **Riscos:**
  - *sensorial:* voz demais vira ruído, por isso uma fala por visita e com
    intervalo;
  - *Modo Tranquilo:* mantém a voz, mas pode aumentar o intervalo.
- **Fatias:**
  - **B3.1 — dados e teste de contrato.** Aceite: todo bicho tem nome e fala
    de no máximo 8 palavras.
  - **B3.2 — gatilho de proximidade.** Aceite: fala só explorando; nunca
    durante missão, carona ou painel.
- **Testes:** U, R, V, C, O.
- **Esforço:** 2 fatias.
- **Cabe até 04/10? Parcial.** Cabe só se sobrar capacidade depois do caminho
  crítico e se os nomes estiverem decididos até 30/09.

#### B4. Estádio com educação física

- **Objetivo para a criança:** ensinar o Órbi a jogar bola ou a fazer outra
  brincadeira de movimento, sem placar, sem vencedor e sem perdedor.
- **Tese:** o Órbi nunca viu futebol; a criança mostra.
- **Já existe:** o ESTÁDIO e o quiz de bandeiras; o motor de aventuras; o
  padrão de coletáveis por proximidade.
- **Arquitetura:**
  - aventura pura nova, `estadio-*.js`;
  - duas propostas de mecânica para o Anderson escolher:
    - **(a)** levar a bola até o gol empurrando com o carro, com uma bola
      **sem física**, movida por proximidade;
    - **(b)** movimento de verdade: a criança pula ou gira na vida real e toca
      em PRONTO, e o Órbi imita. Isso exige uma etapa nova `movimento` no
      motor;
  - **save não muda** (usa `recompensa` e `descobertas`).
- **Dependências:** D1.1.
- **Riscos:**
  - *técnico:* os sensores de chegada e de zona tratam **qualquer corpo
    dinâmico** como o carro (fato, `ArrivalSensor.jsx` e `ZoneSensor.jsx`), e
    uma bola com física dispararia sensores; por isso, bola sem física;
  - *princípios:* nada de contagem de gols.
- **Fatias:**
  - **B4.1 — decisão de mecânica** (documento);
  - **B4.2 — aventura pura**, e etapa nova se for a opção (b) (U, R);
  - **B4.3 — objetos no estádio** (V, C);
  - **B4.4 — anúncio e mudança permanente no estádio (D1)** (O).
- **Testes:** U, R, B, V, C, O.
- **Esforço:** 4 fatias.
- **Cabe até 04/10? Não.**

#### B5. Padaria com pães manipuláveis

- **Objetivo para a criança:** pôr na cesta a quantidade de pães que o Órbi
  pediu, contando com as mãos.
- **Tese:** a criança ensina o Órbi a contar.
- **Já existe:**
  - **nesta base:** `padaria-model.js` com teste, e o quiz de contagem da
    chegada à PADARIA;
  - **na congelada:** `PadariaMicroScene.jsx`, sobre uma arquitetura própria
    (`ContextualInteractionHost`).
- **Arquitetura:** reescrever a micro-cena como **painel do coordenador**
  (atividade `pergunta` ou uma nova `micro_cena`), usando `padaria-model.js`.
  **Não** portar o host contextual. **Save não muda.**
- **Dependências:** A2.1 (vitrine da padaria), D1.
- **Riscos:**
  - *sensorial:* arrastar pode ser difícil aos 3 anos, então tocar para pôr e
    tocar para tirar;
  - *princípios:* o terceiro erro revela a resposta.
- **Fatias:**
  - **B5.1 — painel e ligação à chegada** (U, V);
  - **B5.2 — ajuste de alvo de toque e voz** (C, O).
- **Testes:** U, R, B, V, C, O.
- **Esforço:** de 2 a 3 fatias.
- **Cabe até 04/10? Não.** O caminho crítico ocupa a capacidade, e é a
  primeira candidata depois do lançamento.

#### B6. Aprender fazendo com mais variedade

- **Objetivo para a criança:** separar, repartir, montar palavras, comparar
  quantidades e ordenar acontecimentos, sempre dentro de uma ação na cidade.
- **Tese:** o Órbi não sabe separar as frutas nem montar a palavra PÃO; a
  criança mostra.
- **Já existe:**
  - repartir: a etapa `distribuir` do motor, usada só pela Horta;
  - ordenar: o tipo `order` em `activities.js`, que só existe em dados;
  - os bancos `FRUTAS` e `QUANTIDADES`.
- **Arquitetura:**
  - uma etapa nova de motor por mecânica (`separar`, `montar_palavra`,
    `comparar`, `ordenar`), pura e com teste;
  - um painel genérico por etapa;
  - **save não muda**, salvo categoria nova no Caderninho.
- **Dependências:** B1 (repartir em uso de verdade), D1.
- **Riscos:**
  - *sensorial:* uma mecânica por aventura, nunca duas juntas;
  - *princípios:* sem tela de quiz solta; a mecânica fica dentro de uma ação
    (guarda-corpo G do adendo curricular).
- **Fatias:** uma por mecânica (4), mais uma aventura que use cada uma (4).
- **Testes:** U, R, B, V, C, O.
- **Esforço:** de 6 a 8 fatias.
- **Cabe até 04/10? Não.**

#### B7. Mais vida sonora e visual por lugar

- **Objetivo para a criança:** cada bairro tem som e movimento próprios,
  baixos e calmos, com volume ajustável.
- **Tese:** a cidade responde, e o som do lugar reforça a identidade (A2).
- **Já existe:** `sons.js`; preferências de sons e voz (liga/desliga);
  `CityLife`; `DecoracaoExtra`; `perfilVisual`. **Não há controle de volume.**
- **Arquitetura:**
  - módulo puro `ambiente-sonoro.js` (som por bairro, volume pela distância);
  - `volume` numérico nas preferências, o que exige mudar a normalização e
    **subir `SAVE_VERSION`**;
  - no Modo Tranquilo, o som ambiente fica desligado e a voz continua.
- **Dependências:** A2, A3 (orçamento), C1.
- **Riscos:** *sensorial:* é o risco mais alto do plano. Tem de começar
  desligado ou baixo e ser observado com as crianças.
- **Fatias:**
  - **B7.1 — volume nas preferências, com migração** (U);
  - **B7.2 — som por bairro** (V, C, O);
  - **B7.3 — detalhe visual por lugar**, dentro do orçamento (C).
- **Testes:** U, B, V, C, O.
- **Esforço:** de 3 a 4 fatias.
- **Cabe até 04/10? Não.**

### C. Órbi e conforto

#### C1. Repetir a última fala do Órbi (dívida técnica, item 3)

- **Objetivo para a criança:** ouvir de novo quando perdeu uma instrução.
  Essencial para quem não lê.
- **Tese:** a criança só ensina o que entendeu que o Órbi pediu.
- **Já existe:** a voz liga/desliga, persistida; `falarDaAtividade`; o
  coordenador com dono único de voz. Na congelada: `VoiceControls` e
  `voice-state`, como referência de interface.
- **Arquitetura:**
  - o coordenador guarda a **última fala por atividade**, num módulo puro com
    teste;
  - o botão repete a fala da **atividade em foco**;
  - **proposta de lugar:** botão fixo num canto do HUD, **e também dentro dos
    painéis de pergunta**, que é quando mais se precisa; desabilitado com a
    voz desligada;
  - **save não muda.**
- **Dependências:** a decisão de design do Anderson (lugar, painéis, o que
  repete).
- **Riscos:**
  - *sensorial:* repetir sem limite pode virar brincadeira de apertar; é
    aceitável, porque não pune;
  - *alvo de toque:* grande.
- **Fatias:**
  - **C1.1 — última fala no coordenador** (U);
  - **C1.2 — botão no HUD e nos painéis de pergunta** (V, C, O).
- **Testes:** U, R, B, V, C, O.
- **Esforço:** 2 fatias, mais a decisão.
- **Cabe até 04/10? Sim, se a decisão sair até 29/09.** Se não sair, fica para
  depois.

#### C2. Órbi mais expressivo

- **Objetivo para a criança:** o Órbi admira, aponta e reage ao que ela faz.
- **Tese:** o Órbi aprende e demonstra que aprendeu.
- **Já existe:** 4 poses (`src/brand/orbi.js`), `OrbiCompanion` e
  `OrbiMoment`.
- **Arquitetura:**
  - poses novas `admirando` e `apontando`, em SVG puro;
  - mapa puro de evento para pose (`reacoes.js`), com teste;
  - as reações obedecem ao dono do HUD no coordenador;
  - **save não muda.**
- **Dependências:** D1 (reagir à mudança anunciada).
- **Riscos:**
  - *sensorial:* reações demais, por isso só em eventos causados pela criança;
  - *Modo Tranquilo:* a pose muda sem animação.
- **Fatias:**
  - **C2.1 — duas poses novas** (U, V);
  - **C2.2 — mapa de reações** (U, R, O).
- **Testes:** U, R, V, C, O.
- **Esforço:** 2 a 3 fatias.
- **Cabe até 04/10? Não.**

#### C3. Dicas de controle, uma de cada vez

- **Objetivo para a criança:** aprender os controles aos poucos, sem uma faixa
  de texto fixa.
- **Tese:** o Órbi mostra um controle por vez e para de mostrar quando a
  criança já sabe.
- **Já existe:**
  - a dica fixa `.controls-hint` (`GameExperience.jsx:124`), **só com mouse**;
    no toque não há dica nenhuma;
  - a atividade `tutorial` (prioridade 20) já existe no coordenador.
- **Arquitetura:**
  - módulo puro `dicas.js` (sequência de dicas, próxima dica, critério de
    "aprendida" = a ação feita N vezes);
  - usa a atividade `tutorial`;
  - "aprendidas" é chave nova no save, portanto **`SAVE_VERSION` sobe.**
- **Dependências:** observação: IDEIAS item 6 manda decidir só depois de ver
  se a dica fixa ajuda ou atrapalha, e no celular não há dica para observar.
- **Riscos:** *sensorial:* dica que volta vira cobrança, por isso some para
  sempre depois de aprendida.
- **Fatias:**
  - **C3.1 — módulo e save** (U);
  - **C3.2 — dicas no toque e no teclado** (V, C, O).
- **Testes:** U, B, V, C, O.
- **Esforço:** 2 a 3 fatias.
- **Cabe até 04/10? Não.** Depende de observação.

#### C4. Balão da carona só perto do cachorro (dívida técnica, item 5)

- **Objetivo para a criança:** não ver um convite no mundo ao lado de uma
  instrução na tela.
- **Tese:** uma coisa por vez.
- **Já existe:** o balão permanente (`Carona.jsx:133`). O **teste de 27/09
  registrou "sem confusão com a missão ativa".**
- **Arquitetura, se um dia mudar:** exibir o balão por proximidade, no padrão
  de `BuscaSensor`. **Save não muda.**
- **Dependências:** observação, que já existe.
- **Proposta:** **manter como está** e fechar o item 5 como "observado, sem
  confusão". Reabrir se a confusão aparecer num próximo teste.
- **Fatias:** **C4.1 (condicional)** — balão por proximidade. Aceite: o balão
  só aparece num raio fixo em volta do cão.
- **Testes:** V, C, O.
- **Esforço:** 0 fatias, ou 1 se reaberto.
- **Cabe até 04/10? Sim**, com a decisão de manter, pendente da aprovação do
  Anderson.

#### C5. Caderninho guardando criações e lembranças

- **Objetivo para a criança:** rever o que criou (mural, horta) e momentos
  (primeira carona, parque florido).
- **Tese:** o caderninho é o registro do que a criança ensinou ao Órbi.
- **Já existe:** o Caderninho com 6 categorias, persistidas em `descobertas`.
- **Arquitetura:**
  - categorias `criacoes` e `lembrancas`;
  - a criação é guardada como dado pequeno (a grade de cores do mural), nunca
    como imagem;
  - fica só no aparelho;
  - **`SAVE_VERSION` sobe.**
- **Dependências:** B2 e B1 (o que guardar), D1 (lembranças = mudanças
  anunciadas).
- **Riscos:**
  - *privacidade:* nada sai do aparelho, coerente com a Área dos Pais;
  - *tamanho do save:* limitar a quantidade guardada.
- **Fatias:**
  - **C5.1 — definir o que é salvo** (documento);
  - **C5.2 — categorias e migração** (U);
  - **C5.3 — telas no Caderninho** (V, C, O).
- **Testes:** U, B, V, C, O.
- **Esforço:** 3 fatias.
- **Cabe até 04/10? Não.**

### D. Regra do universo

#### D1. "A cidade cresce com a criança" em todas as iniciativas

- **Objetivo para a criança:** perceber que a cidade mudou por causa dela, e
  que a mudança fica.
- **Tese:** é a própria tese: a criança ensina, o Órbi aprende, a cidade
  responde.
- **Já existe:** `worldFlags` persistidos (`parque_florido`, e a flag da Horta
  na definição); a transição das flores; o anúncio no resumo da aventura;
  as quatro condições em `docs/START-HERE.md`.
- **Arquitetura:**
  - registro puro `src/city/mudancas.js`: cada mudança tem flag, lugar, ação
    que a causa e fala de anúncio;
  - teste de contrato: toda flag usada tem causa e anúncio; nenhuma depende de
    tempo ou de contagem;
  - os anúncios passam pelo coordenador, um por vez;
  - **save não muda** (usa `worldFlags`).
- **Dependências:** nenhuma. **B1, B2, B4 e C5 dependem de D1.1.**
- **Riscos:** *princípios:* é a salvaguarda contra esteira de desbloqueio.
- **Fatias:**
  - **D1.1 — registro e teste de contrato**, migrando `parque_florido` para
    ele (U, R);
  - **D1.2 — a regra vira item obrigatório do checklist da §2.6**, sem código
    (já feito neste documento).
- **Testes:** U, R.
- **Esforço:** 1 fatia.
- **Cabe até 04/10? Parcial.** D1.2 já vale como regra. D1.1 é recomendada
  antes de B1, mas não bloqueia o lançamento.

### E. Apresentação e lançamento público

#### E1. Página do universo, primeira versão

- **Objetivo para a criança:** nenhum direto. Para os pais: entender o que é o
  Órbi antes de entregar o celular.
- **Tese:** a página conta a inversão ("a criança não é testada: ela é quem
  sabe").
- **Já existe:** `docs/IDEIAS_PAGINA_UNIVERSO.md`; o texto da Área dos Pais
  (`AreaPais.jsx:173-187`); a pasta `orbi-brand/` na raiz (conteúdo não
  conferido).
- **Arquitetura:**
  - página estática como **segunda entrada do Vite** (`universo.html`), sem
    carregar o pacote do jogo;
  - som desligado por padrão, botão de pausar animações e
    `prefers-reduced-motion`;
  - exige mudança em `vite.config.js`, com autorização explícita;
  - **save não muda.**
- **Dependências:** E6 (textos coerentes), a escala do lançamento definida
  (para o "estado honesto"), E4 (onde publicar), E3 (nome no domínio).
- **Riscos:**
  - *reputação:* nenhuma alegação que o jogo não cumpra (E6);
  - *pacote:* não pode inflar o pacote do jogo.
- **Fatias:**
  - **E1.1 — página e segunda entrada no build.** Aceite: o `index-*.js` do
    jogo continua dentro do teto; a página funciona sem som e com as animações
    pausáveis.
  - **E1.2 — texto de estado honesto por parte do jogo** (V, C).
- **Testes:** B, V, C.
- **Esforço:** 2 fatias.
- **Cabe até 04/10? Parcial.** A página cabe; publicá-la no domínio oficial
  depende de E3.

#### E2. Página do universo, segunda versão: "do esboço ao jogo"

- **Objetivo para a criança:** nenhum direto. Mostra o processo e a autoria
  do Anderson.
- **Tese:** o universo é feito por um pai; a IA é ferramenta, não autora.
- **Já existe:** nada na base. A congelada tem evidências visuais (`docs/evidence/`)
  que podem servir de "antes/depois", se o Anderson quiser.
- **Arquitetura:** comparação arrastável na mesma página de E1, com imagens
  escolhidas pelo Anderson e alternativa acessível (botões antes/depois).
- **Dependências:** E1.
- **Riscos:** *privacidade:* nenhuma foto das crianças; *acessibilidade:* o
  arraste precisa de alternativa por botão.
- **Fatias:**
  - **E2.1 — escolha do material** (Anderson);
  - **E2.2 — componente e textos** (B, V, C).
- **Testes:** B, V, C.
- **Esforço:** 2 fatias.
- **Cabe até 04/10? Não.**

#### E3. Verificação da marca "Órbi" no INPI

- **Objetivo:** não comprar um domínio para um nome que talvez não se possa
  usar.
- **Já existe:** a pendência registrada em `docs/IDEIAS_PAGINA_UNIVERSO.md`
  ("Órbita" no Universo Rabisco). O Órbi está publicado desde 05/08/2026.
- **Arquitetura:** não se aplica. É **ação do Anderson**: busca preliminar no
  sistema de busca do INPI, pelas classes que ele julgar pertinentes (sugestão
  a confirmar: 9 e 41).
- **Riscos:** a busca preliminar **não garante** registro nem ausência de
  conflito. Este plano **não é orientação jurídica**, e consultar um
  profissional é decisão do Anderson.
- **Fatias:** **E3.1 — busca e registro do resultado** em documento.
- **Testes:** não se aplica.
- **Esforço:** menos de 1 dia de trabalho do Anderson.
- **Cabe até 04/10? Sim**, a busca. O resultado decide se o domínio entra no
  lançamento.

#### E4. Site na Netlify

- **Objetivo:** um endereço oficial, estável e com SSL.
- **Já existe:** `netlify.toml` (build, `dist/`, redirect de SPA, Node 20).
  Os alvos concorrentes estão na §1.5: o Cloudflare Pages pelo workflow da
  `main` e o Vercel pelo link do README da `main`.
- **Arquitetura (configuração no painel, ação do Anderson):**
  - site ligado ao repositório, com **branch de produção** igual à decidida em
    E5;
  - **deploys de outras branches e Deploy Previews desligados**;
  - domínio só depois de E3; SSL automático da Netlify, **a confirmar no
    painel**.
- **O que fazer com Vercel e Cloudflare:**
  - **opção 1:** manter no ar com aviso ou redirecionamento para o endereço
    novo até o domínio existir;
  - **opção 2:** desligar;
  - **proposta:** manter no ar até o endereço novo estar validado com as
    crianças, e só então redirecionar.
  - O Cloudflare deixa de receber deploy se o workflow sair da `main`, o que a
    simulação de merge indica (§1.5).
- **Dependências:** E5, E3 (domínio), E6.
- **Riscos:**
  - *operacional:* três endereços públicos com versões diferentes confundem os
    pais;
  - *reversão:* a Netlify permite republicar um deploy anterior (**a confirmar
    no painel**).
- **Fatias:**
  - **E4.1 — configuração do site e primeiro deploy** (com autorização);
  - **E4.2 — domínio e SSL** (depois de E3);
  - **E4.3 — destino de Vercel e Cloudflare.**
- **Testes:** B; C no endereço publicado.
- **Esforço:** 2 a 3 fatias, a maior parte no painel.
- **Cabe até 04/10? Parcial.** O site no subdomínio da Netlify cabe; o domínio
  depende de E3.

#### E5. Definir a branch de produção

- **Objetivo:** uma única fonte do que está publicado.
- **Já existe:** os fatos da §1.5 (divergência de 5 e 25 commits, simulação de
  merge com 2 conflitos, workflow do Cloudflare na `main`).
- **Opções:**
  - **(a) mesclar esta base na `main` por PR:** resolver `App.jsx` e
    `README.md`, conferir a correção dos controles de toque que só existe na
    `main`, e o workflow do Cloudflare sai no mesmo merge;
  - **(b) apontar a Netlify direto para `codex/activity-coordinator-p0`:** é
    rápido, mas a `main` continua sendo a branch padrão do GitHub e fica
    desatualizada;
  - **(c) criar uma branch `producao`** a partir desta base.
- **Proposta: (a)**, porque a `main` já é a padrão (`origin/HEAD`) e o merge
  remove o deploy duplicado no Cloudflare. Tudo só com autorização expressa,
  com o diff do PR revisado.
- **Dependências:** nenhuma técnica; decisão do Anderson.
- **Decisão do Anderson (27/09/2026):** opção **(a)**, merge na `main` por PR
  revisado.
- **Pré-requisito obrigatório de E5.2:** desconectar o repositório no painel da
  Vercel ou pausar seus deploys. A Vercel publica automaticamente a partir da
  `main` (§1.5); sem esse passo, o merge publica a versão nova em
  `orbi-kahe.vercel.app` antes do teste de 03/10 e do go/no-go de 04/10. É
  ação do Anderson no painel, confirmada antes do merge.
- **Riscos:**
  - o merge na `main` publica na Vercel se o pré-requisito acima não for
    cumprido;
  - o push na `main` hoje dispara o workflow do Cloudflare; o commit de merge
    não terá mais o arquivo, e pelo funcionamento do GitHub Actions não
    deveria disparar (**não verificado**);
  - os conflitos precisam de revisão linha a linha.
- **Fatias:**
  - **E5.1 — decisão** (documento);
  - **E5.2 — PR de merge com os conflitos resolvidos.** Aceite: `npm test` e
    build verdes na branch do PR; nenhuma regressão de toque (C).
- **Testes:** U (suíte inteira), B, C.
- **Esforço:** 1 a 2 fatias.
- **Cabe até 04/10? Sim.**

#### E6. Textos públicos coerentes

- **Objetivo:** pais leem só o que é verdade.
- **Já existe:**
  - a Área dos Pais: "Sem anúncios, sem compras, sem cadastro", **verdadeiro
    hoje**;
  - a BNCC aparece **só em comentários de código**, nunca na interface.
  - **O README desta base promete o que o jogo desta base não entrega:**
    - "cuidar de uma horta" — a Horta não tem gatilho;
    - "repartir" — a etapa `distribuir` só é usada pela Horta;
    - "As faixas etárias que aparecem no jogo" — nenhum componente mostra
      faixa.
  - O README da `main` tem o link do Vercel.
- **Arquitetura:** só texto. Mais uma **tabela de coerência** (README × Área
  dos Pais × página E1) em `docs/LANCAMENTO.md`, conferida a cada lançamento.
- **Dependências:** a escala final do lançamento.
- **Riscos:** *reputação:* nenhuma alegação de domínio de conteúdo ou
  alinhamento à BNCC sem matriz revisada por profissional.
- **Fatias:**
  - **E6.1 — README ajustado ao que existe no lançamento;**
  - **E6.2 — tabela de coerência preenchida.**
- **Testes:** leitura pelo Anderson.
- **Esforço:** 1 a 2 fatias.
- **Cabe até 04/10? Sim.**

---

## 4. Ordem das iniciativas (dependências)

```
A6 ─────────────────────────────────────────────┐
A3.1 → A3.2 → A3.3 → A3.4 ──────────────────────┤
A1.1 → A1.2 → A1.3 → A2.1…A2.4 ─────────────────┤
A4.1 ───────────────────────────────────────────┤→ teste 03/10 → lançamento 04/10
A5.1 (→ A5.2) ──────────────────────────────────┤
C1 (decisão até 29/09) → C1.1 → C1.2 ───────────┤
E5.1 → E5.2 → E4.1 ─────────────────────────────┤
E3.1 → (E4.2 domínio) ──────────────────────────┤
E6.1 → E6.2 → E1.1 → E1.2 ──────────────────────┘

Depois de 04/10:
D1.1 → B1 (→ A7) → C5 ; D1.1 → B2 ; D1.1 → B4
A2.1 → B5 ; B1 → B6 ; A2 + A3 → B7 ; D1.1 → C2 ; observação → C3
A1.4+ (espalhar) só depois de observação com as crianças
E1 → E2
```

**Ordem proposta depois do lançamento**, por valor para a criança e
reaproveitamento:

1. D1.1
2. B5 (padaria, módulo puro já pronto)
3. B3 (se não entrou)
4. B1 e A7
5. C1 (se não entrou)
6. B2 e C5
7. A2.5 em diante
8. C2
9. B4
10. B6
11. C3
12. B7
13. A1.4 em diante
14. E2

---

## 5. Caminho crítico até 04/10/2026

O lançamento depende de quatro correntes. Qualquer atraso nelas atrasa a data:

1. **Publicação:** decisão E5.1 → PR E5.2 (com autorização) → configuração
   E4.1 → deploy no dia 04/10 (com autorização).
2. **Desempenho:** A3.1 → medição A3.2 no celular → A3.3, se a causa for
   clara → nova medição A3.4. Sem A3.2 não há número para decidir "go".
3. **Mundo:** A1.1 → A1.2 → A1.3, e então o **teste com as crianças de
   03/10**, que é o último portão.
4. **Textos:** E6.1, porque o README não pode prometer a Horta.

**Fora do caminho crítico** (saem primeiro se houver atraso, nesta ordem): E1,
C1, A2.3 e A2.4, A2.1 e A2.2, A5.2. O domínio (E4.2) depende de E3 e **não
bloqueia** o lançamento no subdomínio da Netlify.

---

## 6. Cronograma dia a dia (28/09 a 04/10) — proposta

Capacidade de 2 a 3 fatias por dia (estimativa). **As datas dos testes com as
crianças precisam ser confirmadas pelo Anderson.**

| Dia | Fatias (código) | Ações do Anderson |
|---|---|---|
| **28/09 (seg)** | A6.1; A3.1 (medidor `?medir=1`); A1.1 (teste de folgas) | Aprovar este plano; decidir E5; iniciar a busca no INPI (E3.1); A5.1 (5 min) |
| **29/09 (ter)** | A1.2 (separar pares); A1.3 (zoom de toque); A4.1 (retrato) | **A3.2: medição de base no celular (cerca de 20 min)**; decidir o design de C1 |
| **30/09 (qua)** | A3.3 (maior causa medida, se clara); A2.1 (PADARIA) | **TESTE COM AS CRIANÇAS — curto (15 min):** zoom, pares separados, padaria reconhecível. Nomes dos bichos, se B3 for entrar. |
| **01/10 (qui)** | A2.2 (PORTO); A2.3 (HOSPITAL); C1.1 | Revisão dos diffs |
| **02/10 (sex)** | A2.4 (ESCOLA); C1.2; E6.1 (README) | Autorizar E5.2 (PR/merge) e E4.1 (site na Netlify) |
| **03/10 (sáb)** | Build candidato; A3.4 (nova medição); E6.2; E1.1 se houver folga. **Escopo congelado:** só correções pequenas. | **TESTE COM AS CRIANÇAS — completo,** no build candidato, pela rede local; registro em `TESTES_COM_CRIANCAS.md` |
| **04/10 (dom)** | Correção pequena, se o teste pedir | **Go / no-go** pelo checklist de `docs/LANCAMENTO.md`; autorizar o deploy; domínio se E3 estiver ok |

**Contagem:** cerca de 17 fatias em 7 dias, dentro de 2 a 3 por dia, mas
**sem folga**. Por isso a ordem de corte da §5.

---

## 7. O que fica para depois de 04/10 (nada é descartado)

| Iniciativa | Situação em 04/10 | Próximo passo |
|---|---|---|
| A1.4 em diante | não iniciada | Decidir com a observação de 03/10 |
| A2.5 em diante | não iniciada | Um lugar por fatia |
| A3 (correções difusas) | medida | Uma causa por fatia, sempre com medição |
| A7 | não iniciada | Junto com B1 |
| B1–B7 | não iniciadas | Ordem da §4 |
| C2, C3, C5 | não iniciadas | Ordem da §4; C3 depende de observação |
| C1 | se não entrar | Primeira depois de D1.1 |
| C4 | decisão de manter | Reabrir só se houver confusão |
| D1.1 | não iniciada | Primeira fatia depois do lançamento |
| E1.2, E2 | parcial / não iniciada | Depois do domínio |
| E4.2 | depende de E3 | Quando a busca no INPI estiver concluída |

---

## 8. O que não foi possível verificar nesta rodada

- **As causas reais das travadas.** Tudo em §1.3 é hipótese até a medição
  A3.2.
- **Se o troika de fato baixa a fonte pela CDN em execução.** A URL está no
  pacote e os letreiros não passam `font`, mas a lista de rede do navegador
  embutido não mostra requisições feitas por workers.
- **Se o painel de pergunta fica transparente depois da entrada** (item 1 da
  dívida técnica). A captura do notebook foi de outro painel e não é
  conclusiva.
- **Se a correção dos controles de toque que só existe na `main`**
  (`77f8187`) tem equivalente nesta base.
- **Qual endereço está de fato no ar** (Vercel, Cloudflare Pages ou outro) e
  se existe domínio próprio no Cloudflare (o comentário do workflow cita um).
- **Se o commit de merge na `main` deixaria de disparar o workflow do
  Cloudflare.** É o esperado, mas não foi testado.
- **Se a Vercel também publica outras branches como prévia** (deploys de
  preview). Que ela publica a `main` em produção foi informado pelo Anderson a
  partir do painel; o comportamento com as demais branches, inclusive
  `codex/activity-coordinator-p0`, não foi conferido.
- **O funcionamento dos painéis da Netlify** (SSL, republicar deploy
  anterior): conhecimento geral, a confirmar no painel.
- **O conteúdo da pasta `orbi-brand/`.**
- **A disponibilidade da marca "Órbi" no INPI.**
- **As estimativas de esforço e de capacidade.** São estimativas; o limite
  real é o tempo de revisão.
