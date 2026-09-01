# ÓRBI — BUILD 02 — CONTEXTUAL INTERACTION — REVIEW SPEC

**Projeto:** Órbi — um mundo pra descobrir

**Fase:** BUILD 02 PREP — especificação técnica e de produto

**Golden MicroScene:** Padaria

**Data:** 01/09/2026

**Status:** REVIEW SPEC RECONCILIADA — PRONTA PARA GATE INDEPENDENTE

**Branch auditada:** `feature/orbi-golden-rebuild`

**HEAD auditado:** `e858981bb0a2fda22d9f0077df345e2935cef083`

**Depende de:** BUILD 01 aprovado

**Save contract:** v6 — NÃO ALTERAR

**Implementação autorizada por este documento:** NÃO

---

## 1. Objetivo

Validar, com a menor alteração arquitetural possível, o primeiro passo da transição de:

> missão → dirigir → chegar → quiz/interação → próxima missão

para:

> curiosidade → explorar → descobrir → interagir → ensinar o Órbi → mundo responde

A BUILD 02 deve provar esse novo sentido de interação em **um único lugar: a Padaria**.

A criança não escolhe uma resposta pronta. Ela age sobre objetos do mundo, observa o resultado e mostra ao Órbi o que sabe. O restante do jogo continua compatível com o fluxo atual enquanto essa hipótese é validada.

### Tese de produto

> **A criança não é testada — ela é quem sabe.**

### Resultado esperado

Ao chegar ou explorar a Padaria, a criança pode separar e contar pães para atender a uma curiosidade do Órbi. A ação concluída produz uma resposta do personagem e uma única evidência pedagógica da unidade de interação.

---

## 2. Non-goals

A BUILD 02 não deve:

- reescrever o jogo;
- substituir o loop inteiro de missões;
- remover `MissionController`;
- remover `MissionSensors`;
- remover `ChegadaVivaPanel`;
- migrar Mercado, Zoológico ou qualquer outro lugar;
- criar uma engine genérica de MicroScenes;
- criar editor, DSL, schema de cenas ou sistema de plugins;
- transformar pães em corpos físicos 3D;
- alterar cidade, prédio ou sensor físico da Padaria;
- alterar física, Rapier, `Car.jsx` ou câmera;
- alterar combustível, economia, moedas, garagem ou recompensas;
- alterar a allowlist top-level do schema persistido;
- alterar importação, exportação ou migração de save;
- alterar `SAVE_VERSION`, que permanece `6`;
- criar nova habilidade ou categoria persistida, com a única exceção autorizada de linhagem `habilidades.contagem_contextual_v1`;
- agregar automaticamente `contagem_contextual_v1` a `contagem` ou ao relatório BNCC durante a BUILD 02;
- substituir o Caderninho;
- reescrever conteúdo educacional legado;
- iniciar BUILD 03;
- preparar abstrações para MicroScenes ainda não aprovadas.

---

## 3. Evidência da auditoria

A auditoria foi feita sobre o código atual, com working tree limpo no início da preparação desta SPEC.

Foram inspecionados:

- `src/components/MissionController.jsx`;
- `src/components/MissionSensors.jsx`;
- `src/components/ArrivalSensor.jsx`;
- `src/components/ChegadaVivaPanel.jsx`;
- `src/missions/chegadas-vivas.js`;
- `src/missions/missoes.js`;
- `src/missions/destinos.js`;
- `src/missions/descobertas.js`;
- `src/store/useGame.js`;
- `src/components/OrbiCompanion.jsx`;
- `src/components/Game.jsx`;
- `src/components/HUD.jsx`;
- `src/components/Caderninho.jsx`;
- `src/components/TouchControls.jsx`;
- `src/hooks/useKeyboard.js`;
- `src/App.jsx`;
- testes de save e BUILD 01.

Baseline herdado da BUILD 01 aprovada:

```text
npm test: 16/16 PASS
npm run build: PASS
SAVE_VERSION: 6
campos persistidos: 11
```

---

## 4. Arquitetura atual relevante

### 4.1 Chegada física

`MissionSensors` monta um `ArrivalSensor` para cada entrada de `PREDIOS_GPS`.

`ArrivalSensor` usa o sensor Rapier existente e chama o callback quando o carro entra na área do prédio. Ele não conhece missão, pergunta ou conteúdo pedagógico.

Hoje o callback executa somente:

```text
processarChegada(slug)
```

### 4.2 Conclusão da missão

`processarChegada(slug)`:

1. verifica se existe missão ativa, não concluída e com destino igual ao `slug`;
2. aceita somente os tipos GPS ou Ciências;
3. marca a missão como concluída;
4. registra a habilidade de chegada correspondente;
5. registra as descobertas existentes;
6. retorna `true` quando processou a chegada e `false` nos demais casos.

Esse retorno já fornece a distinção necessária entre:

- **chegada que concluiu a missão atual**; e
- **chegada exploratória, sem correspondência com a missão atual**.

A elegibilidade contextual futura deve reutilizar esse resultado. Não deve existir uma segunda lista de tipos de missão autorizados para a Padaria: se `processarChegada('PADARIA')` retornar `true`, a chegada é elegível como origem `missao`, independentemente de o tipo interno aceito ser GPS ou Ciências.

### 4.3 Orquestração pós-chegada

`MissionController` observa `missao.concluida`.

Na primeira transição para concluída ele:

1. toca sucesso;
2. fala a frase de chegada;
3. aguarda `CELEBRACAO_MS`;
4. abre `ChegadaViva` quando a missão GPS concluída tem destino com conteúdo registrado;
5. caso contrário, chama `proximaMissao()`.

Quando uma Chegada Viva abre, o painel assume a responsabilidade de chamar `proximaMissao()` ao finalizar.

### 4.4 Padaria atual

A Padaria já existe na cidade com `slug` `PADARIA` e já recebe um sensor de chegada.

Sua Chegada Viva atual:

- sorteia uma quantidade entre 2, 3, 4 e 5;
- mostra pães como representação;
- oferece três alternativas numéricas;
- registra `contagem` em cada resposta, inclusive tentativas incorretas;
- registra a descoberta de contagem quando conclui ou revela.

Esse conteúdo continua necessário como fallback durante a validação Golden.

### 4.5 Habilidades e descobertas

`registrarHabilidade(chave, acertou)` incrementa:

- `tentativas` em toda chamada;
- `acertos` quando `acertou === true`.

Logo, chamar essa função por pão tocado produziria evidência artificial. A unidade correta da nova experiência é a **MicroScene concluída**, não o gesto físico.

O fluxo legado da Padaria usa `habilidades.contagem` e registra respostas/tentativas sob uma metodologia de quiz. A Golden MicroScene não pode reutilizar essa chave: sua linhagem exclusiva será `habilidades.contagem_contextual_v1`, cuja unidade é uma interação contextual concluída.

`registrarDescoberta(categoria, id)` já é idempotente e pode continuar registrando a quantidade conhecida no Caderninho sem nova categoria.

### 4.6 Órbi atual

`OrbiCompanion` reage a três sinais globais:

- missão concluída;
- aumento de acertos em `contagem`;
- nova missão.

Ele ainda não conhece uma interação contextual. A nova chave não dispara o observador legado de `contagem`, mas a interação ainda precisa de prioridade explícita para não competir com reação de missão concluída, nova missão ou timers antigos.

### 4.7 Save atual

O persist usa `partialize` explícito com 11 campos:

```text
nome
introVista
veiculo
desbloqueados
moedas
combustivel
corCarro
coresCompradas
missao
habilidades
descobertas
```

Estados de painel, como `chegadaViva` e `caderninhoAberto`, são transitórios. A nova interação deve seguir esse padrão e permanecer fora do save.

`contagem_contextual_v1` é uma extensão aditiva autorizada **dentro** do campo persistido `habilidades`; não adiciona campo top-level. Saves v6 anteriores não possuem essa chave, portanto a 02.D deve garantir inicialização compatível no primeiro registro, sem migration e sem bump de versão. Os 11 campos top-level continuam exatamente os mesmos.

Para o contrato desta BUILD, “schema persistido inalterado” significa: mesma versão, mesma allowlist top-level e mesmos shapes de missão/descobertas/economia. A única evolução aninhada permitida é `habilidades.contagem_contextual_v1`; tratá-la como autorização para qualquer outra chave é proibido.

---

## 5. Classificação da arquitetura atual

| Elemento | Decisão | Motivo |
|---|---|---|
| `ArrivalSensor` e geometria dos sensores | **KEEP** | A chegada física já é estável e não precisa conhecer conteúdo. |
| `processarChegada()` | **KEEP** | Seu contrato booleano separa missão concluída de exploração e preserva habilidades atuais. |
| `proximaMissao()` e sorteio atual | **KEEP** | Compatibilidade integral com o loop legado. |
| `registrarHabilidade()` | **ADAPT EM 02.D** | O legado mantém `contagem`; a única chave nova autorizada é `contagem_contextual_v1`, criada de modo compatível quando ausente em save v6 antigo. |
| `registrarDescoberta()` | **KEEP** | Já é idempotente e compatível com as quantidades existentes. |
| `ChegadaVivaPanel` | **KEEP** | Continua atendendo Mercado, Zoológico e demais conteúdos legados. |
| Padaria em `chegadas-vivas.js` | **DEPRECATE GRADUALMENTE** | Permanece como fallback até a validação Golden; não remover na BUILD 02. |
| `MissionSensors` | **ADAPT** | Deve oferecer a Padaria contextual quando a chegada não concluiu a missão atual. |
| `MissionController` | **ADAPT** | Deve priorizar a MicroScene da Padaria após uma missão correspondente e manter fallback legado. |
| `useGame.js` | **ADAPT COM GATE DE SAVE** | Recebe estado/ações transitórias em 02.A e, somente em 02.D, a chave aninhada autorizada `contagem_contextual_v1`. |
| `OrbiCompanion` | **ADAPT** | Precisa observar a interação e evitar reação genérica duplicada. |
| superfícies HUD/input | **ADAPT MINIMAMENTE** | Uma coisa por vez; direção fica neutra enquanto a MicroScene está aberta. |
| física, carro, câmera e economia | **KEEP / PROIBIDO ALTERAR** | Não participam da hipótese da BUILD 02. |

Nenhum elemento deve ser removido nesta etapa.

---

## 6. Alternativas consideradas

### Opção 1 — estado transitório no store atual + registry mínimo

**Recomendada.**

Usa o mesmo padrão de `chegadaViva`:

- um estado transitório `interacaoContextual`;
- três ações de ciclo de vida;
- um registry puro com somente Padaria;
- um host DOM para montar a MicroScene correta.

Vantagens:

- menor mudança;
- integração direta com missão, habilidades e UI atuais;
- nenhum segundo sistema de estado;
- fallback simples;
- save protegido pelo `partialize` existente.

### Opção 2 — store separado para MicroScenes

Não recomendada agora.

Criaria coordenação entre dois stores para missão, habilidade, descoberta, voz e overlays. A separação parece limpa, mas aumenta os estados intermediários e não traz benefício comprovado para uma única cena.

### Opção 3 — generalizar ou substituir `ChegadaVivaPanel`

Rejeitada nesta etapa.

Forçaria Mercado, Zoológico e demais conteúdos a compartilhar uma arquitetura ainda não validada. Também aumentaria o risco de regressão pedagógica e de navegação.

### Decisão

Implementar futuramente somente a Opção 1, após aprovação independente desta SPEC.

---

## 7. Arquitetura proposta

```text
ArrivalSensor existente
        │
        ▼
MissionSensors
        │
        ├─ processarChegada('PADARIA') === true
        │       │
        │       ├─ prepara contexto com status aguardando-celebracao
        │       ▼
        │  MissionController celebra
        │       │
        │       ├─ contexto pendente válido → ativa MicroScene
        │       └─ indisponível → ChegadaViva legada / próxima missão
        │
        └─ processarChegada(slug) === false
                │
                ├─ Padaria contextual habilitada → abre por exploração
                └─ outro lugar → comportamento atual, silêncio

interacaoContextual transitória
        │
        ▼
ContextualInteractionHost
        │
        ▼
PadariaMicroScene
        ├─ manipulação local dos pães
        ├─ resposta contextual do Órbi
        ├─ 02.A–02.C: conclusão somente funcional
        ├─ 02.D: 1 conclusão → 1 registro em contagem_contextual_v1
        └─ encerra preservando ou avançando missão conforme a origem
```

### 7.1 Novas abstrações estritamente necessárias

Somente quatro conceitos novos:

1. **Registry/capability contextual:** informa se um lugar possui interação contextual e cria seu estado inicial.
2. **Estado transitório `interacaoContextual`:** descreve a interação aberta e sua origem.
3. **`ContextualInteractionHost`:** traduz o tipo ativo em um componente visual.
4. **`PadariaMicroScene`:** implementação concreta e única da Golden MicroScene.

Não criar interface abstrata de cenas, hooks genéricos, event bus, máquina de estados externa ou pacote novo.

### 7.2 Estado transitório mínimo

Shape proposto:

```js
null | {
  tipo: 'padaria-paes-v1',
  lugar: 'PADARIA',
  origem: 'missao' | 'exploracao',
  alvo: 2 | 3 | 4 | 5,
  status: 'aguardando-celebracao' | 'ativa' | 'concluida'
}
```

Regras:

- `alvo` é sorteado uma vez na criação do contexto e fica congelado;
- origem `missao` nasce como `aguardando-celebracao`, registrando de forma transitória que `processarChegada('PADARIA')` retornou `true`;
- origem `exploracao` nasce diretamente como `ativa`;
- o host não renderiza a MicroScene enquanto o status for `aguardando-celebracao`;
- a quantidade manipulada permanece local à MicroScene;
- o estado não contém moedas, pontuação, erro, tentativas ou recompensa;
- o estado não é persistido;
- reload nunca restaura painel contextual preso.

---

## 8. Before / after

### Before — missão Padaria

```text
missão PADARIA
→ dirigir
→ sensor conclui missão
→ comemoração
→ ChegadaViva
→ escolher 3/4/5
→ registrar resposta
→ próxima missão automática
```

### After — missão Padaria

```text
missão PADARIA
→ dirigir
→ sensor conclui missão pelo fluxo atual
→ comemoração atual
→ MicroScene Padaria
→ Órbi pergunta
→ criança separa pães
→ criança mostra o resultado
→ Órbi observa e responde
→ em 02.D, uma evidência em contagem_contextual_v1
→ criança volta à cidade
→ próxima missão pelo fluxo atual
```

### After — descoberta exploratória

```text
missão atual aponta para outro objetivo
→ criança explora a cidade
→ entra na Padaria
→ missão atual permanece intacta
→ MicroScene Padaria
→ criança separa pães e ensina o Órbi
→ mundo/Órbi responde
→ criança volta à cidade
→ missão anterior continua, sem chamar proximaMissao()
```

É o segundo fluxo que comprova que a interação contextual não depende obrigatoriamente de “próxima missão”.

---

## 9. Contratos entre componentes

### 9.1 Registry contextual

API mínima sugerida:

```text
temInteracaoContextual(lugar) → boolean
criarInteracaoContextual(lugar, origem) → estado | null
```

Contrato:

- reconhece somente `PADARIA`;
- usa as quantidades atuais 2–5;
- não conhece Zustand, React, voz ou física;
- expõe um único ponto estático para desabilitar a Padaria contextual em rollback;
- lugar desconhecido retorna `false`/`null`, sem exceção e sem efeito colateral.

### 9.2 Store

API mínima sugerida:

```text
prepararInteracaoContextual(lugar, origem) → boolean
ativarInteracaoContextualPendente(lugar) → boolean
abrirInteracaoContextual(lugar, origem) → boolean
concluirInteracaoContextual({ quantidade }) → boolean
encerrarInteracaoContextual() → void
```

`prepararInteracaoContextual`:

- é chamado somente quando `processarChegada('PADARIA')` retornou `true`;
- cria o contexto com origem `missao` e status `aguardando-celebracao`;
- não abre UI, não fala e não grava Learning Data;
- preserva o resultado da chegada até o callback pós-celebração, sem guardar tipo de missão.

`ativarInteracaoContextualPendente`:

- aceita somente o contexto pendente do mesmo lugar;
- troca `aguardando-celebracao` por `ativa`;
- retorna `true` somente quando consumiu o contexto preparado;
- em falha, permite ao `MissionController` limpar o pendente inválido e executar o fallback legado.

`abrirInteracaoContextual`:

- falha em silêncio se o lugar não for suportado;
- falha se outra interação ou painel incompatível estiver ativo;
- congela o alvo na criação;
- não altera missão, habilidade, descoberta ou save;
- retorna `true` somente quando abriu.

`concluirInteracaoContextual`:

- aceita apenas a interação Padaria ativa;
- aceita somente quando `quantidade === alvo`;
- faz uma transição síncrona e idempotente de `ativa` para `concluida`;
- em 02.A, 02.B e 02.C, trata somente estado funcional/transitório;
- em 02.A, 02.B e 02.C, não chama `registrarHabilidade` nem `registrarDescoberta`;
- somente em 02.D, a primeira transição válida também chama `registrarHabilidade('contagem_contextual_v1', true)` exatamente uma vez;
- somente em 02.D, a primeira transição válida também chama `registrarDescoberta('contagens', String(alvo))` exatamente uma vez;
- chamadas repetidas após conclusão retornam `false` e não gravam nova evidência;
- a UI nunca registra Learning Data diretamente.

`encerrarInteracaoContextual`:

- limpa o estado transitório;
- se a origem era `missao`, chama `proximaMissao()` no máximo uma vez;
- se a origem era `exploracao`, preserva integralmente a missão atual;
- se a criança sair antes de concluir, não registra habilidade nem descoberta;
- nunca distribui moedas ou altera economia.

### 9.3 `MissionSensors`

Contrato futuro:

1. chama primeiro `processarChegada(slug)` sem alterar sua semântica;
2. se `processarChegada('PADARIA')` retornar `true`, chama `prepararInteracaoContextual('PADARIA', 'missao')` e não abre UI imediatamente;
3. o contexto pendente é a evidência transitória do retorno verdadeiro que o `MissionController` consumirá após a comemoração;
4. se retornar `false`, tenta abrir interação contextual com origem `exploracao`;
5. para qualquer lugar diferente de Padaria, mantém o silêncio atual;
6. não interrompe um painel já aberto nem um fluxo transitório de maior prioridade, inclusive Carona a bordo;
7. não altera `ArrivalSensor` nem geometria Rapier.

### 9.4 `MissionController`

No callback pós-celebração de uma missão concluída por `processarChegada('PADARIA') === true`:

1. tenta `ativarInteracaoContextualPendente('PADARIA')`;
2. se ativar, encerra o callback e delega a continuidade à MicroScene;
3. se não houver pendente válido, limpa qualquer pendência inconsistente e executa exatamente o fallback atual:
   - `abrirChegadaViva` quando disponível;
   - ou `proximaMissao()`;
4. evita narração de nova missão e re-dica enquanto uma interação contextual estiver aberta;
5. não muda pesos, conteúdo, timers ou geração de missões além dessa prioridade.

A regra é determinada por **destino + resultado de `processarChegada()`**, não por uma verificação paralela de `missao.tipo`. Ela vale para qualquer tipo que `processarChegada()` considere elegível, hoje GPS e Ciências. O banco atual de Ciências usa VET como destino, mas essa característica de conteúdo não deve virar uma restrição arquitetural adicional.

### 9.5 Host

`ContextualInteractionHost`:

- retorna `null` quando não há interação;
- renderiza `PadariaMicroScene` somente para `padaria-paes-v1`;
- não contém regra pedagógica;
- não sorteia conteúdo;
- não chama missão diretamente;
- tipo desconhecido deve falhar fechado e nunca avançar missão silenciosamente.

### 9.6 Entrada e overlays

Enquanto a MicroScene estiver ativa:

- `useKeyboard` zera e ignora setas/espaço pelo mesmo padrão já usado pelo Caderninho;
- `TouchControls` se oculta e libera qualquer tecla virtual pressionada;
- HUD, Caderninho e hint de teclado não competem visualmente com a cena;
- `Buzina` ignora `KeyB` durante a cena, sem alterar o sistema de áudio;
- o Canvas e Rapier permanecem montados;
- `Car.jsx` não é alterado;
- ao fechar, os controles retornam neutros e exigem um novo press/keydown.

Isso é bloqueio de **entrada**, não pausa ou alteração de física.

### 9.7 Voz

- toda fala contextual usa `falar(..., { interrupt: true })`;
- não fala a cada toque em pão;
- fala somente na abertura, ao pedir conferência com quantidade ainda diferente e na conclusão;
- fechar ou desmontar a cena interrompe a fala contextual;
- nenhuma re-dica de missão pode sobrepor a fala da MicroScene.

---

## 10. Desenho funcional — Padaria Golden MicroScene

### 10.1 Cenário

A Padaria recebeu uma cesta/sacola para separar um pequeno pedido de pães. Os pães são objetos DOM com aparência de adesivo, não corpos 3D.

### 10.2 Pergunta do Órbi

Estrutura de texto e voz:

> “Eu preciso de **N pães**. Você me mostra como separar?”

O texto deve ser curto, sempre mostrar o numeral e ser acompanhado pela representação concreta dos pães.

### 10.3 Ação da criança

- bandeja inicial com pelo menos cinco pães visíveis;
- cesta/sacola de destino;
- tocar num pão da bandeja move esse pão para a cesta;
- tocar num pão da cesta devolve para a bandeja;
- contagem atual fica visível e se atualiza imediatamente;
- botão principal: `MOSTRAR PRO ÓRBI`;
- botão secundário discreto: `VOLTAR À CIDADE`.

Tap-to-transfer é preferido a drag-and-drop nesta etapa porque exige menor precisão motora, funciona com mouse e touch e reduz estados de cancelamento. Não implementar física de arraste.

### 10.4 Quantidade diferente do alvo

Ao tocar `MOSTRAR PRO ÓRBI` com quantidade diferente:

- a cena permanece aberta;
- nenhum pão é movido automaticamente;
- nenhuma evidência é registrada;
- não há vermelho, buzzer, “errou”, perda ou contador de tentativas;
- Órbi descreve o que observou e convida a ajustar.

Exemplo:

> “Eu contei X. Vamos ajeitar até ficar N?”

Essa fala descreve o mundo; não classifica a criança.

### 10.5 Quantidade igual ao alvo

Ao tocar `MOSTRAR PRO ÓRBI` com a quantidade correta:

1. a interação muda para `concluida` uma única vez;
2. em 02.A, 02.B e 02.C, não registra Learning Data;
3. somente a partir de 02.D, registra uma evidência em `contagem_contextual_v1` e a descoberta da quantidade;
4. toca o sucesso já existente;
5. os pães/cesta respondem com celebração visual curta e compatível com `prefers-reduced-motion`;
6. Órbi verbaliza o que aprendeu;
7. `VOLTAR À CIDADE` encerra a cena.

Exemplo de resposta:

> “Agora eu entendi: você separou N pães! Então N é assim. Obrigado por me ensinar!”

A resposta do mundo nesta primeira Golden MicroScene é local: a cesta assume visual de pedido concluído e os pães respondem à ação. Não criar alteração persistente no prédio, na cidade ou na física.

### 10.6 Saída sem concluir

`VOLTAR À CIDADE` deve permanecer disponível para não aprisionar a criança.

- não registra evidência;
- origem `exploracao`: retoma a missão que já estava ativa;
- origem `missao`: avança para a próxima missão porque a chegada já foi concluída pelo fluxo legado;
- Órbi aceita a saída sem punição ou insistência.

### 10.7 Regras pedagógicas e de UX

Proibido na MicroScene:

- alternativas 3/4/5;
- seleção de card como resposta;
- cronômetro;
- vidas;
- score;
- recompensa em moedas;
- resposta automática;
- revelar a “alternativa certa”;
- registrar erro por toque;
- discurso de prova, acerto ou fracasso;
- animação obrigatória não reduzível.

---

## 11. Integração com `OrbiCompanion`

### Estados contextuais mínimos

| Momento | Papel do Órbi | Comportamento |
|---|---|---|
| Abertura | pergunta | aparece curioso e faz uma pergunta curta. |
| Manipulação | observa | permanece presente e silencioso; não avalia cada gesto. |
| Conferência diferente | descreve | conta o resultado observado e convida a ajustar. |
| Conclusão | aprende | agradece e repete o conhecimento ensinado pela criança. |
| Saída | respeita | retorna ao mundo sem cobrança. |

### Prioridade de reação

Enquanto `interacaoContextual` existir:

1. reação contextual tem prioridade sobre missão concluída, nova missão e reação genérica de contagem;
2. `contagem_contextual_v1` não é tratada como `contagem` pelo observador legado do posto;
3. a reação genérica de `contagem` continua funcionando fora da MicroScene;
4. o personagem não some no meio da fala contextual por causa de timer antigo.

O `OrbiCompanion` continua sendo apresentação. Em 02.C ele não registra habilidade nem descoberta. A autoridade de concluir permanece no store, e a persistência pedagógica só é ligada nessa autoridade em 02.D.

---

## 12. Learning Evidence

### Unidade de evidência

> **Uma MicroScene Padaria concluída = uma tentativa e um acerto em `contagem_contextual_v1`.**

Interpretação autorizada durante a BUILD 02:

> **`contagem_contextual_v1` mede unidades de interação contextual concluídas.**

Ela não mede:

- crianças únicas;
- domínio ou mastery;
- quantidade única de conhecimento adquirido;
- taxa comparável ao quiz legado;
- progresso agregado de toda a habilidade de contagem.

### Matriz obrigatória

| Evento físico/funcional | `tentativas` | `acertos` | descoberta |
|---|---:|---:|---:|
| tocar num pão da bandeja | +0 | +0 | não |
| devolver um pão | +0 | +0 | não |
| mostrar quantidade diferente | +0 | +0 | não |
| continuar ajustando | +0 | +0 | não |
| mostrar exatamente o alvo pela primeira vez | +1 | +1 | sim, idempotente |
| tocar novamente após conclusão | +0 | +0 | não duplica |
| sair sem concluir | +0 | +0 | não |

### Relação com a chegada da missão

`processarChegada()` continua registrando a evidência de navegação/leitura já existente quando uma missão é concluída. Essa é uma unidade diferente: **chegar ao destino**.

A MicroScene registra somente a unidade **separar e contar os pães**.

Não remover nem fundir essas evidências na BUILD 02.

### Linhagem e comparabilidade

- o quiz legado continua escrevendo exclusivamente em `habilidades.contagem`;
- a Golden Padaria escreve exclusivamente em `habilidades.contagem_contextual_v1`;
- `contagem` e `contagem_contextual_v1` não devem ser somadas ou comparadas automaticamente;
- o relatório BNCC não deve consumir nem agregar a nova chave durante a BUILD 02;
- a separação é obrigatória porque o modelo v6 não possui timestamp nem provenance por evento;
- nenhuma escrita Golden pode cair em `contagem`, inclusive por fallback ou compatibilidade.

### Staging de Learning Data

| Bloco | Habilidade | Descoberta |
|---|---|---|
| 02.A Foundation | nenhuma escrita | nenhuma escrita |
| 02.B Padaria MicroScene | nenhuma escrita | nenhuma escrita |
| 02.C Orbi Response | nenhuma escrita | nenhuma escrita |
| 02.D Learning Evidence | `contagem_contextual_v1`, uma vez por conclusão válida | `contagens`, idempotente |

Até o commit da 02.D, a conclusão é exclusivamente funcional/transitória.

### Persistência

- preservar `habilidades.contagem` exclusivamente para o fluxo legado;
- adicionar somente `habilidades.contagem_contextual_v1` como chave aninhada autorizada;
- reutilizar `descobertas.contagens` existente;
- não criar novo campo top-level;
- manter a allowlist top-level exata de 11 campos;
- não criar histórico de eventos;
- não persistir origem, alvo, status ou gestos;
- `SAVE_VERSION` permanece `6`.

Compatibilidade obrigatória com saves v6 antigos:

- ausência de `contagem_contextual_v1` deve ser tratada como `{ acertos: 0, tentativas: 0 }`;
- a chave só passa a existir no save antigo quando a primeira evidência contextual for registrada;
- isso não pode exigir migration, reset ou import/export especial;
- habilidades legadas presentes no save devem ser preservadas byte a byte fora da nova chave.

### Repetição exploratória — decisão deliberada

Durante o Golden Gate, cada **nova instância** da MicroScene Padaria concluída é uma nova unidade de interação e pode adicionar:

```text
contagem_contextual_v1.tentativas +1
contagem_contextual_v1.acertos +1
```

Idempotência vale dentro da mesma instância: conclusão repetida, duplo toque ou re-render não duplica. Sair, revisitar a Padaria, abrir outra instância e concluí-la constitui uma nova unidade válida.

Não implementar nesta BUILD:

- cooldown;
- deduplicação entre visitas;
- timestamp;
- session id;
- mastery score;
- limite persistido de evidências.

O risco de inflação por revisitas é aceito deliberadamente para o Golden Gate. Como a linhagem é separada, ele não contamina a métrica histórica `contagem`; ainda assim, `contagem_contextual_v1` não pode ser interpretada como domínio ou número de conhecimentos únicos.

---

## 13. Compatibilidade com o fluxo atual

### MissionController permanece autoridade do loop legado

A nova arquitetura não substitui o controlador. Ela adiciona uma prioridade estreita:

```text
Padaria contextual disponível?
  sim → delega temporariamente a continuidade
  não → executa o fluxo atual sem diferença
```

### Fallback da Padaria

A entrada legada da Padaria em `chegadas-vivas.js` permanece intacta durante toda a BUILD 02.

Se o registry contextual estiver desabilitado ou não conseguir criar a cena:

- missão Padaria abre a Chegada Viva atual;
- opções numéricas continuam funcionando;
- `ChegadaVivaPanel` continua chamando `proximaMissao()`;
- Mercado e Zoológico não percebem a existência da nova arquitetura.

### Exploração

A exploração contextual é aditiva:

- não conclui missão incompatível;
- não troca missão;
- não registra chegada falsa;
- não chama `proximaMissao()` ao terminar;
- não abre MicroScene em outros lugares.

### Reload

Como a MicroScene é transitória:

- reload durante interação não restaura o painel;
- se a missão ainda não havia sido concluída, ela permanece válida;
- se a missão já estava concluída, o bootstrap atual substitui a missão concluída por uma missão válida;
- evidência só existe se a conclusão atômica já ocorreu;
- nenhum save fica preso em estado intermediário novo.

---

## 14. Arquivos candidatos a alteração

Lista indicativa para uma futura execução aprovada. Não autoriza alteração nesta PREP.

### Criar

```text
src/interactions/contextual-interactions.js
src/components/ContextualInteractionHost.jsx
src/components/micro-scenes/PadariaMicroScene.jsx
tests/contextual-interaction.test.js
```

### Adaptar

```text
src/App.jsx
src/store/useGame.js
src/components/MissionSensors.jsx
src/components/MissionController.jsx
src/components/OrbiCompanion.jsx
src/components/HUD.jsx
src/components/Caderninho.jsx
src/components/TouchControls.jsx
src/components/Buzina.jsx
src/hooks/useKeyboard.js
src/styles.css
tests/save.test.js
```

Nem todos precisam necessariamente mudar. Cada alteração deve provar relação direta com um contrato desta SPEC.

### Manter sem alteração funcional

```text
src/components/ChegadaVivaPanel.jsx
src/missions/chegadas-vivas.js
src/missions/missoes.js
src/missions/descobertas.js
src/missions/destinos.js
```

A Padaria legada deve continuar presente nesses registries durante o gate Golden.

---

## 15. Arquivos e sistemas proibidos

```text
src/components/Car.jsx
src/components/ArrivalSensor.jsx
src/components/CameraFollow.jsx
src/components/Game.jsx
src/components/FuelController.jsx
src/components/GasStation.jsx
src/components/GaragemPanel.jsx
src/components/Moedas.jsx
src/economia.js
src/save.js
package.json
package-lock.json
```

Também são proibidos:

- configuração ou dependências Rapier;
- parâmetros de física;
- comportamento do carro;
- câmera e enquadramento;
- layout/posição/colisão dos prédios;
- qualquer alteração da allowlist top-level ou migration de save;
- `SAVE_VERSION`;
- economia, moedas e preços;
- conteúdo do Mercado;
- conteúdo do Zoológico;
- migração de qualquer outra Chegada Viva;
- conteúdo educacional fora da substituição funcional da Padaria aprovada nesta SPEC;
- qualquer trabalho de BUILD 03.

Exceção única e fechada: 02.D pode adicionar `contagem_contextual_v1` dentro do objeto `habilidades` já persistido. Nenhuma outra chave pedagógica nova está autorizada. Essa extensão não permite alterar os 11 campos top-level, `src/save.js`, migration ou versão.

Se um critério depender de alterar um item proibido, a futura execução deve parar e reportar **BLOCKED**.

---

## 16. Critérios de PASS por bloco

### 02.A — Contextual Interaction Foundation

PASS somente se:

- existe suporte contextual somente para `PADARIA`;
- chegada de missão continua passando primeiro por `processarChegada()`;
- `processarChegada('PADARIA') === true` agenda a origem `missao` sem nova regra por tipo, cobrindo GPS e qualquer outro tipo elegível pelo contrato atual, inclusive Ciências;
- chegada exploratória abre a Padaria sem concluir ou trocar missão;
- chegada de missão abre após a comemoração atual;
- fallback legado funciona quando o suporte contextual está desabilitado;
- nenhum outro lugar muda;
- estado contextual é transitório e ausente do save;
- conclusão em 02.A altera somente estado transitório: zero habilidade e zero descoberta;
- retorno verdadeiro em Padaria cria `aguardando-celebracao`, e somente o callback posterior do Controller muda para `ativa`;
- direção é neutralizada ao abrir e não fica presa ao fechar;
- testes automatizados cobrem resultado `true`/`false`, GPS/Ciências via contrato, origem, idempotência funcional, zero Learning Data e fallback.

### 02.B — Padaria Golden MicroScene

PASS somente se:

- não existem alternativas 3/4/5;
- a criança manipula pães individualmente;
- adicionar e devolver pão funciona com mouse e touch;
- alvo 2–5 permanece congelado durante a unidade;
- `MOSTRAR PRO ÓRBI` verifica o estado do mundo, não uma alternativa;
- quantidade diferente não pune nem registra tentativa;
- quantidade correta conclui uma única vez;
- conclusão em 02.B continua com zero escrita de habilidade e descoberta;
- saída sem concluir não deixa missão ou input presos;
- UI funciona em desktop e mobile landscape sem cobrir excessivamente o mundo.

### 02.C — Orbi Companion Response

PASS somente se:

- Órbi pergunta, observa e aprende em momentos distintos;
- não fala a cada toque;
- não usa linguagem de prova, erro ou derrota;
- resposta final descreve o que a criança ensinou;
- não ocorre fala sobreposta com missão/re-dica;
- não ocorre reação genérica duplicada de contagem;
- 02.C registra zero Learning Data; `OrbiCompanion` permanece apresentação;
- `prefers-reduced-motion` é respeitado.

### 02.D — Learning Evidence

PASS somente se:

- cada conclusão válida incrementa `contagem_contextual_v1.tentativas` em 1;
- a mesma conclusão incrementa `contagem_contextual_v1.acertos` em 1;
- `habilidades.contagem` permanece inalterada pela Golden MicroScene;
- nenhum gesto físico ou conferência diferente incrementa habilidade;
- duplo toque/re-render/StrictMode não duplica evidência;
- uma nova visita concluída conta como nova unidade e incrementa novamente;
- descoberta da quantidade continua idempotente;
- nenhuma outra nova chave pedagógica existe;
- não existe novo campo top-level persistido;
- `SAVE_VERSION === 6`;
- os 11 campos persistidos continuam exatamente os mesmos.

### 02.E — Regression / Golden Validation

PASS somente se todos os critérios da seção 17 forem comprovados e não houver regressão crítica.

---

## 17. Regression / Golden Validation

### 17.1 Testes automatizados mínimos

- suite anterior continua passando: baseline 16/16;
- registry reconhece somente Padaria;
- alvo criado pertence a 2–5 e permanece congelado;
- origem missão e exploração são preservadas;
- retorno `true` de `processarChegada('PADARIA')` agenda origem `missao` sem ramificação adicional por tipo;
- fixtures equivalentes de GPS e Ciências elegíveis seguem o mesmo contrato de destino/retorno;
- retorno `false` em Padaria tenta origem `exploracao` e preserva a missão;
- abertura concorrente é recusada;
- ao final de 02.A, conclusão funcional produz zero habilidade e zero descoberta;
- ao final de 02.B, a cena completa produz zero habilidade e zero descoberta;
- ao final de 02.C, a resposta do Órbi produz zero habilidade e zero descoberta;
- em 02.D, quantidade diferente produz zero evidência;
- em 02.D, conclusão produz exatamente uma evidência em `contagem_contextual_v1` e uma descoberta idempotente;
- em 02.D, repetição de conclusão na mesma instância não duplica;
- em 02.D, uma segunda instância concluída incrementa `contagem_contextual_v1` novamente;
- em 02.D, saída sem conclusão produz zero evidência;
- Golden MicroScene nunca altera `habilidades.contagem`;
- exploração preserva a missão atual;
- origem missão avança no máximo uma vez ao encerrar;
- fallback da Padaria abre a Chegada Viva legada;
- Mercado e Zoológico continuam no fluxo legado;
- estado persistido mantém a allowlist exata dos 11 campos;
- `interacaoContextual` não aparece no JSON persistido;
- save v6 antigo sem `contagem_contextual_v1` hidrata sem reset e assume zero para a nova chave;
- primeira conclusão em save v6 antigo cria somente `habilidades.contagem_contextual_v1` e preserva todas as chaves legadas;
- nenhuma outra chave pedagógica nova é criada;
- `SAVE_VERSION` permanece `6`;
- import/export e save corrompido/futuro continuam passando.

### 17.2 Build

```text
npm test: PASS
npm run build: PASS
git diff --check: PASS
```

O warning conhecido de bundle continua fora do escopo. Não introduzir dependência para a MicroScene.

### 17.3 Desktop

Validar:

- setas dirigem antes e depois da cena;
- Space continua sendo drift fora da cena;
- entrada segurada é zerada ao abrir a MicroScene;
- fechar não deixa tecla presa;
- Padaria funciona com mouse;
- missão Padaria, missão de outro destino e exploração;
- Mercado e Zoológico continuam abrindo seus painéis atuais;
- posto, garagem, Caderninho e buzina continuam funcionais;
- nenhuma fala se sobrepõe;
- reload antes, durante e depois da conclusão.

### 17.4 Touch real

Validar no mínimo em landscapes equivalentes a:

- `844x390`;
- `740x360`;
- `915x412`.

Confirmar:

- Touch Controls somem ao abrir a MicroScene e liberam comandos ativos;
- pães podem ser adicionados e devolvidos por toque;
- botões têm área de toque confortável;
- a cena não cobre excessivamente o mundo;
- saída devolve os Touch Controls neutros;
- dirigir continua normal depois da interação;
- rotação portrait mostra o Orientation Guard sem desmontar a simulação;
- retorno a landscape preserva a interação transitória enquanto não houve reload;
- física e comportamento do carro permanecem iguais ao BUILD 01.

### 17.5 Conteúdo e core loop

Confirmar por diff e smoke:

- `MissionController` continua existindo e orquestrando o loop legado;
- `MissionSensors` continua usando os mesmos sensores;
- `processarChegada()` mantém sua regra e retorno;
- ativação contextual de missão usa destino Padaria + retorno verdadeiro, sem filtro paralelo GPS/Ciências;
- `proximaMissao()` mantém tipos e pesos;
- Chegadas Vivas não Padaria permanecem iguais;
- Mercado e Zoológico não foram migrados;
- nenhuma pergunta/conteúdo pedagógico fora da Padaria mudou;
- economia/moedas não mudaram;
- Rapier, Car e câmera não mudaram;
- BUILD 03 não começou.

### 17.6 Save v6

Validar:

- round-trip exportar → limpar → importar;
- save v6 anterior abre sem migration;
- nome, veículo, moedas, combustível, missão, habilidades e descobertas são preservados;
- save antigo sem `contagem_contextual_v1` continua válido e assume zero até a primeira conclusão Golden;
- concluir Padaria em 02.D persiste somente `habilidades.contagem_contextual_v1` e a descoberta existente apropriada;
- `habilidades.contagem` não muda pela MicroScene;
- os 11 campos top-level permanecem exatamente os mesmos;
- reload durante MicroScene não causa crash ou painel órfão;
- nenhum campo contextual aparece no save.

### 17.7 Golden Save privado

`ORBI_GOLDEN_SAVE_V6_PRIVATE.txt` não está disponível no momento desta SPEC.

Regras do gate:

- não repetir buscas extensas pelo arquivo;
- não inventar fixture substituta e chamá-la de Golden Save privado;
- não afirmar validação do artefato nominal enquanto ele estiver indisponível;
- validar save v6 por contrato, testes, runtime/fixture disponível e round-trip;
- a ausência isolada do arquivo nominal não é FAIL automático se o contrato v6 permanecer íntegro;
- se o arquivo for fornecido antes de 02.E, sua importação passa a ser evidência adicional e deve ser reportada separadamente.

---

## 18. Critérios de rollback

Rollback deve ser possível sem migration e sem perda de save.

### Mecanismo

O registry contextual deve possuir uma capacidade estática única para Padaria. Desabilitar/remover essa entrada faz:

- `temInteracaoContextual('PADARIA')` retornar `false`;
- exploração na Padaria voltar ao silêncio legado;
- missão Padaria cair automaticamente em `temChegadaViva`/`abrirChegadaViva`;
- o quiz atual 3/4/5 voltar sem alteração de schema.

Não criar feature flag remoto, painel administrativo ou campo persistido.

Rollback não apaga nem converte evidências `contagem_contextual_v1` já gravadas. A chave permanece separada e inerte; o quiz legado continua escrevendo somente em `contagem`.

### Acionar rollback se

- evidência pedagógica duplicar ou inflar por toque;
- missão ficar concluída sem caminho de continuidade;
- exploração trocar/concluir a missão atual;
- input ficar preso após abrir/fechar;
- save v6 mudar ou falhar;
- Mercado/Zoológico sofrer regressão;
- fala contextual se sobrepor de forma recorrente;
- UI impedir uso em qualquer viewport obrigatório;
- for necessário tocar em física, Car, câmera ou economia para estabilizar a cena.

Após rollback, toda a suite, build, save e fluxo legado da Padaria devem ser revalidados.

---

## 19. Riscos e contenções

| Risco | Impacto | Contenção |
|---|---|---|
| Missão e exploração abrirem duas cenas | alto | `processarChegada()` sempre primeiro; retorno `true` delega exclusivamente ao Controller. |
| Evidência duplicada por duplo toque/render | alto | conclusão idempotente no store, não em ref visual; Learning Data só é ligado em 02.D. |
| Novo estado entrar no save | alto | estado transitório fora do `partialize` + teste da allowlist de 11 campos. |
| Save v6 antigo não conter a nova chave aninhada | alto | ausência equivale a zero; primeiro registro cria somente `contagem_contextual_v1`, sem migration ou reset. |
| Mistura de metodologias de contagem | alto | legado escreve só em `contagem`; Golden escreve só em `contagem_contextual_v1`; sem agregação automática. |
| Missão ficar concluída e presa | alto | encerramento por origem + fallback legado + teste de reload. |
| Reação genérica do Órbi duplicar a contextual | médio | prioridade contextual; `contagem_contextual_v1` não alimenta o observador legado de `contagem`. |
| Tecla virtual permanecer pressionada | alto | reutilizar release-all de `TouchControls` e neutralização do `useKeyboard`. |
| Abstração crescer antes da validação | médio | registry com uma entrada e host com um único tipo; nenhuma engine genérica. |
| Padaria legada ser removida cedo | alto | manter quiz e registry atuais durante toda a BUILD 02. |
| Repetição exploratória elevar a contagem sem limite | médio/aceito | decisão deliberada do Golden Gate: cada nova cena concluída é nova unidade; não interpretar como mastery, criança única ou conhecimento único. |
| Reload perder a cena aberta | baixo/esperado | estado deliberadamente transitório; validar recuperação sem crash e sem evidência parcial. |

---

## 20. Plano controlado 02.A → 02.E

Cada bloco exige gate próprio. Não iniciar o seguinte se o anterior estiver FAIL ou BLOCKED.

### 02.A — Contextual Interaction Foundation

- criar registry mínimo somente Padaria;
- adicionar estado e ações transitórias;
- adaptar roteamento de `MissionSensors`;
- adaptar prioridade/fallback de `MissionController`;
- montar host vazio/estrutural;
- neutralizar input e competição de overlays;
- garantir que `concluirInteracaoContextual()` altere somente estado transitório;
- registrar zero habilidade e zero descoberta;
- testar resultado de `processarChegada()` sem filtro paralelo por tipo, missão, exploração, idempotência de estado, fallback e save allowlist;
- commit isolado somente após PASS.

### 02.B — Padaria Golden MicroScene

- construir a manipulação tap-to-transfer;
- congelar alvo 2–5;
- implementar conferência e saída sem punição;
- garantir desktop/touch e `prefers-reduced-motion`;
- manter zero escrita de habilidade e descoberta; a ligação com Learning Data fica exclusivamente para 02.D;
- validar visual e funcionalmente;
- commit isolado somente após PASS.

### 02.C — Orbi Companion Response

- integrar pergunta, observação, ajuste e aprendizagem;
- estabelecer prioridade sobre reações genéricas;
- impedir sobreposição de fala e timers antigos;
- validar linguagem com a tese de produto;
- manter zero escrita de habilidade e descoberta;
- commit isolado somente após PASS.

### 02.D — Learning Evidence

- ligar a primeira conclusão válida a `registrarHabilidade('contagem_contextual_v1', true)`;
- registrar descoberta existente uma vez;
- testar zero escrita por gesto/quantidade diferente;
- testar zero escrita por conclusão repetida na mesma instância;
- testar exatamente uma escrita por nova unidade concluída;
- testar que `contagem` permanece inalterada;
- testar save v6 antigo sem a nova chave;
- revalidar save v6 e allowlist;
- commit isolado somente após PASS.

### 02.E — Regression / Golden Validation

- não introduzir feature ou polimento;
- executar toda a matriz da seção 17;
- validar Padaria em missão e exploração;
- validar fallback legado;
- validar Mercado e Zoológico intactos;
- validar desktop e touch real;
- validar reload e save v6;
- registrar o Golden Save privado nominal como indisponível, sem substituto ou alegação de validação;
- confirmar por diff os sistemas proibidos;
- produzir evidências para revisão independente;
- não expandir para outro lugar mesmo se o resultado for PASS.

---

## 21. Gate final proposto

BUILD 02 só poderá ser proposta como PASS quando todos os itens forem verdadeiros:

```text
02.A Foundation: PASS
02.B Padaria MicroScene: PASS
02.C Orbi Response: PASS
02.D Learning Evidence: PASS
02.E Golden Validation: PASS

Padaria por missão: PASS
Padaria por exploração: PASS
Ativação por destino + processarChegada true: PASS
Filtro paralelo GPS/Ciências: NÃO
Manipulação real de pães: PASS
Alternativas 3/4/5 na experiência Golden: NÃO
02.A–02.C Learning Data: ZERO
Uma evidência contagem_contextual_v1 por nova unidade concluída: PASS
Evidência por toque: NÃO
Evidência duplicada na mesma instância: NÃO
Nova visita concluída pode gerar nova unidade: SIM — decisão Golden
Golden escrevendo em contagem legado: NÃO
Agregação automática no relatório BNCC: NÃO
Saída sem punição: PASS
Fallback Padaria legado: PASS

MissionController removido: NÃO
MissionSensors removido: NÃO
ChegadaVivaPanel removido: NÃO
Mercado migrado: NÃO
Zoológico migrado: NÃO

Car/Rapier/física alterados: NÃO
Câmera alterada: NÃO
Economia/moedas alteradas: NÃO
Conteúdo externo à Padaria alterado: NÃO

SAVE_VERSION: 6
Allowlist top-level alterada: NÃO — 11 campos
Nova chave pedagógica autorizada: contagem_contextual_v1
Qualquer outra nova chave pedagógica: NÃO
Interação contextual transitória persistida: NÃO
Save v6: PASS
Golden Save privado nominal: PENDING se indisponível — não é FAIL isolado
npm test: PASS
npm run build: PASS
Regressões críticas: ZERO
BUILD 03 iniciado: NÃO
```

PASS da BUILD 02 não autoriza expansão para Mercado ou Zoológico. Essa expansão exige novo gate de produto e engenharia baseado nas evidências da Padaria.

---

## 22. Condição de FAIL / BLOCKED

BUILD 02 deve ser marcada como FAIL ou BLOCKED se:

- a Padaria só puder funcionar removendo o fluxo legado;
- a MicroScene depender de alteração em Car, Rapier, física ou câmera;
- for necessário mudar a allowlist top-level, migration ou `SAVE_VERSION`;
- evidência confiável exigir persistência além da exceção aninhada `contagem_contextual_v1`;
- missão e exploração não puderem coexistir sem trocar/concluir objetivo indevido;
- não for possível garantir idempotência da conclusão;
- fallback legado deixar de funcionar;
- Mercado, Zoológico ou outro conteúdo precisarem ser migrados junto;
- o escopo exigir uma engine genérica antes de validar a Padaria.

Não contornar esses gates silenciosamente.

---

## 23. Estado após emissão desta SPEC

```text
BUILD 00: PASS
BUILD 01: APROVADO E ENCERRADO
BUILD 02 PREP: SPEC RECONCILIADA APÓS REVISÃO INDEPENDENTE
BUILD 02 IMPLEMENTAÇÃO: NÃO INICIADA
BUILD 03: NÃO INICIADA
```

Esta SPEC não é uma instrução automática de execução. Implementação, commits funcionais e início da BUILD 02 dependem de aprovação independente e de um novo comando explícito.

---

## 24. Princípio final

A Golden MicroScene não deve provar que o Órbi consegue fazer muitos tipos de atividade.

Ela deve provar uma única mudança de relação:

> **a criança age no mundo, o Órbi observa, e o mundo reconhece aquilo que ela ensinou.**
