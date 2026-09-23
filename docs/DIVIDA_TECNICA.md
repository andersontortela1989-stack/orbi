# Dívida técnica — Órbi

Registro do que foi observado e ainda **não** foi resolvido. Uma entrada por
item. Nada aqui é correção: é memória, para que um achado não se perca entre
uma fatia e outra.

Cada entrada diz **o que foi observado**, **onde**, **quando** e **o que falta
verificar ou decidir**. Item sem "o que falta" não pertence a este arquivo —
ou já foi resolvido, ou vira fatia.

Levantado nos testes de setembro de 2026, na branch
`codex/activity-coordinator-p0`.

---

## 1. Painel de pergunta transparente

**Observado.** No quiz de bandeiras do ESTÁDIO ("Qual bandeira é da
Argentina?"), o painel deixou ver o mundo 3D por trás. Não foi possível
distinguir, a olho, se a transparência dura só a entrada ou permanece com o
painel aberto.

**Onde.** `src/components/ChegadaVivaPanel.jsx:115` (`.viva-painel`), estilos em
`src/styles.css`.

**Quando.** Teste no notebook, 23/09/2026.

**O que falta verificar.** A leitura do código dá uma hipótese forte, ainda não
confirmada: o fundo é `--surface-card` → `--orbi-white` → `#FFFFFF`, **opaco**;
mas o painel roda `animation: postoEntra var(--dur-calm)`, e essa animação vai
de `opacity: 0` a `1` em **320 ms**. Ou seja, a transparência provavelmente é a
entrada, não o estado final.

Teste barato que decide: ligar `prefers-reduced-motion` no sistema. Sob ele o
CSS já aplica `.viva-painel { animation: none; }` — se a transparência sumir, era
a animação; se continuar, o problema é outro e aí sim há bug.

Se for a animação, vale decidir separadamente se 320 ms de fade é adequado ao
perfil TEA, ou se painel deve aparecer seco. A mesma animação é usada por **oito**
painéis (posto, garagem, chegada viva, caderninho, área dos pais, aventura,
conforto) — mexer nela afeta todos.

---

## 2. `esbuild` usado sem declaração

**Observado.** `tests/garagem-saida.test.js` faz `import { transform } from
'esbuild'` para compilar o painel real em memória. O pacote existe em
`node_modules` porque o **vite** o traz, mas **não está declarado** no
`package.json` — nem em `dependencies`, nem em `devDependencies`.

**Onde.** `tests/garagem-saida.test.js:6`; `package.json`.

**Quando.** Escrita da fatia da saída da garagem, 22/09/2026.

**O que falta decidir.** Declarar `esbuild` em `devDependencies` resolve, e é
uma linha. Não foi feito porque `package.json` estava fora do escopo daquela
fatia. Enquanto não for, o teste depende de o vite continuar içando `esbuild`
para o topo de `node_modules` — o dia em que isso mudar, o arquivo quebra sem
aviso, e o sintoma (um teste sumindo) não aponta para a causa.

A branch congelada `feature/orbi-golden-rebuild` tinha o mesmo acoplamento.

---

## 3. Repetir a fala do Órbi

**Observado.** Não existe nenhuma forma de ouvir de novo a última coisa que o
Órbi falou. **Silenciar existe** e funciona bem: `SensorySettings` tem o
interruptor VOZ DO ÓRBI, `audio/voz.js` consulta a preferência no momento da
fala, e a escolha é persistida no save (v8). **Repetir, não.**

Quem perdeu uma instrução hoje só tem o `pedir_ajuda` das aventuras — que fala a
`dica`, texto diferente do original, e só existe dentro de uma aventura.

**Onde.** `src/components/SensorySettings.jsx`, `src/audio/voz.js`,
`src/preferences.js`. Ausência confirmada por busca em todo o `src/`.

**Quando.** Auditoria de 22/09/2026.

**O que falta decidir — antes de qualquer código.** É design, não implementação:

- **Onde fica o botão.** O gatilho ⚙️ de conforto some quando um painel domina o
  HUD (`painelEmUso` em `SensorySettings.jsx:61`). Se o botão de repetir seguir a
  mesma regra, não dá para repetir uma pergunta — que é justamente quando mais se
  precisa.
- **Se aparece dentro dos painéis**, e em quais.
- **O que ele repete**: a última fala de qualquer dona, ou só a da atividade em
  foco? O coordenador tem dono de voz único; repetir a fala de uma atividade já
  encerrada contradiz isso.

A branch congelada tem uma referência de implementação em
`src/components/VoiceControls.jsx` e `src/audio/voice-state.js`: botão ↻ fixo no
HUD, desabilitado quando mudo ou sem texto. **Lá o mudo não persiste** — o daqui
persiste, e é melhor. Serve de referência de UI, não de arquitetura.

---

## 4. Resumo da Horta nas repetições

**Observado.** A Horta é repetível desde `a943c6c`. O adesivo só é entregue na
primeira conclusão — `registrarRecompensa` ignora repetido, então o save fica
correto. Mas o **painel de resumo continua exibindo** "ADESIVO: BROTO DA
ESCOLA" em toda conclusão, inclusive na segunda e na terceira.

**Onde.** `src/school/horta-aventura.js:123` — o campo `recompensas` do passo
`resumo` é texto de exibição, não escrita no save.

**Quando.** Fatia da Horta repetível, 22/09/2026.

**O que falta decidir.** Foi decisão explícita à época: *"a fala de comemoração e
o resumo acontecem normalmente"*. A pergunta em aberto é se anunciar um adesivo
que não foi ganho confunde ou frustra. Três saídas possíveis, nenhuma escolhida:

1. deixar como está (o resumo celebra a brincadeira, não o prêmio);
2. omitir a linha do adesivo quando ele já estava no save;
3. trocar por outra frase na repetição ("você plantou de novo!").

Depende de ver o Heitor repetindo a Horta. Sem essa observação é chute.

---

## 5. Balão da carona durante missão ativa

**Observado.** O convite do cachorro (`🐶 PARQUE?`, balão no mundo 3D sobre o cão
na calçada) aparece ao mesmo tempo em que a missão principal pede outro destino
("VET?", "ÁGUA?").

Vale a distinção, porque muda o enquadramento: **não são dois donos de foco**. A
pílula do HUD obedece ao coordenador e mostra um pedido só. O balão é objeto do
mundo e existe **antes** do embarque, quando a carona ainda não pediu foco
nenhum. A regra "uma instrução por vez" está sendo cumprida na interface; o que
se vê em duplicidade é um convite no mundo ao lado de uma instrução na tela.

**Onde.** `src/components/Carona.jsx:133` (o balão), `src/components/HUD.jsx`
(pílula e banner), `src/activity/activity-machine.js` (`carona` prioridade 30,
`em_missao` prioridade 10).

**Quando.** Teste no notebook, 22/09/2026.

**O que falta decidir.** Decisão de produto, **pendente de observação com a
criança** — não de análise. Alternativa já mapeada: mostrar o balão só quando o
carro passa perto do cão, em vez de permanentemente. Nada foi alterado na regra
de quando a carona aparece.

*(A sobreposição visual entre o balão e o `CHEGAMOS!` era problema diferente e
foi corrigida em `25b4458`.)*

---

## 6. Desempenho: 33 a 55 FPS no notebook

**Observado.** O medidor de FPS do modo de desenvolvimento marcou entre 33 e 55
quadros por segundo no notebook. **Ligar o Modo Tranquilo não melhorou o
número** — o que é a informação útil: o Modo Tranquilo desliga animações,
partículas e detalhes decorativos, então o gargalo provavelmente **não está na
decoração**.

**Onde.** Medidor em `src/GameExperience.jsx:108`, dev-only
(`import.meta.env.DEV`, confirmado ausente do build de produção).

**Quando.** Teste no notebook, 23/09/2026.

**O que falta verificar — antes de otimizar qualquer coisa.** Nenhuma
otimização deve ser feita sem medição no **aparelho alvo**. O notebook não é o
alvo; o celular do Heitor é. Existe precedente registrado de uma caçada a FPS
que não se reproduziu e consumiu tempo à toa.

O que falta: medir no celular, e só então procurar gargalo — com número, não com
palpite. Enquanto isso, não mexer em céu, física, DPR, antialias nem grid.

---

## 7. Texto da Área dos Pais sobre monetização

**Observado.** A Área dos Pais afirma: *"Sem anúncios, sem compras, sem
cadastro"*. **Hoje é verdade** — não há anúncio, cobrança nem cadastro em lugar
nenhum do código.

**Onde.** `src/components/AreaPais.jsx:186`.

**Quando.** Auditoria de 23/09/2026.

**O que falta decidir.** Nada, enquanto a frase for verdadeira. Fica registrado
como **gatilho**: no dia em que existir qualquer recurso pago, esta linha vira
falsa e precisa mudar **junto com** o recurso, não depois. É promessa feita a
pai e mãe, na tela dedicada a eles.

O `README.md` já foi ajustado para "O acesso principal é gratuito" — os dois
textos precisam continuar coerentes entre si.

---

## 8. Alertas do `npm audit`

**Observado.** Sete alertas. **Um** de produção e **seis** de desenvolvimento.

- **`fflate` (moderate, produção).** Chega por `three-stdlib`, que vem do
  `@react-three/drei` e do `@react-three/rapier`. O aviso é sobre `unzipSync`
  entrar em laço infinito com ZIP64 malformado. **O caminho não é alcançável
  pelo jogo:** não se carrega ZIP, GLTF, FBX nem arquivo comprimido; não existe
  asset desse tipo no repositório; e no bundle de produção não aparece nenhuma
  função de descompressão (`addPanel`, `unzipSync`, `inflate` — todas em zero).
  A única ocorrência de "fflate" no build é comentário de licença do Troika.
- **Os seis restantes** — `browserslist`, `postcss`, `nanoid`, `esbuild` (via
  `vite`), `baseline-browser-mapping` — são de build e **não chegam ao
  navegador**. `npm audit --omit=dev` lista só o `fflate`.

**Quando.** Auditoria de 22/09/2026.

**O que falta decidir.** **Não rodar `npm audit fix` nem `npm audit fix --force`
sem análise.** O `--force` sobe para `vite@8`, que é mudança breaking. Revisitar
quando houver motivo real — atualização do drei, por exemplo — e não por causa
do número vermelho.

---

## 9. Handoffs históricos com instruções obsoletas

**Observado.** Os três handoffs em `docs/` são registro histórico e **não devem
ser editados**. Alguns trechos, porém, leem como instrução ativa e podem
desviar uma sessão nova.

**Onde e o quê:**

| Arquivo | Linha | Trecho | Por que confunde |
|---|---|---|---|
| `handoff-cidade-turbo-3d.md` | 5 | *"§9 (Prompt da Fatia 1) primeiro"* | manda ir a um prompt obsoleto |
| " | 62 | *"A Fatia 1 inteira existe só para acertar isso"* | presente do passado |
| " | 166, 197 | *"Next.js (App Router) **ou** React + Vite — escolher o de setup mais rápido"* | apresenta como escolha aberta; foi decidida (Vite) |
| " | 189 | *"## 9. Prompt da Fatia 1 (**cole isto no Claude Code AGORA**)"* | imperativo e datado |
| " | 194 | *"Hoje construímos SÓ A FATIA 1"* | idem |
| " | 223 | *"Não construa nada além da Fatia 1"* | idem |
| " | §8 | tabela listando fatias **0 a 6** como trabalho futuro | todas construídas |
| `handoff-cidade-turbo-3d-ADENDO-curriculo.md` | 31 | *"Hoje há **3 prédios soltos**"* | hoje são **11** |
| " | 83, 87 | *"Fatia 13"*, *"desde a Fatia 6"* | numeração de um roadmap que já não corre |

`handoff-orbi-ADENDO-narrativa.md` não tem nada operacional desatualizado — é
tom e narrativa, continua válido.

**Quando.** Auditoria de 22/09/2026.

**O que falta.** Nada a corrigir: são registro. A mitigação já existe — o
`docs/START-HERE.md` foi reescrito e declara que vence sobre eles, separando o
que neles ainda vale (princípios, guard-rails, tom) do que não vale (instrução
operacional). Esta entrada existe para que a lista dos trechos fique localizável
sem precisar reler os três arquivos.
