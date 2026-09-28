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

## 6. Desempenho no notebook (os 33 a 55 FPS eram do modo de desenvolvimento)

**Observado.** O medidor de FPS do modo de desenvolvimento marcou entre 33 e 55
quadros por segundo no notebook. **Ligar o Modo Tranquilo não melhorou o
número** — o que é a informação útil: o Modo Tranquilo desliga animações,
partículas e detalhes decorativos, então o gargalo provavelmente **não está na
decoração**.

**Onde.** Medidor em `src/GameExperience.jsx:118`, dev-only
(`import.meta.env.DEV`, confirmado ausente do build de produção).

**Quando.** Teste no notebook, 23/09/2026.

**O que falta verificar — antes de otimizar qualquer coisa.** Nenhuma
otimização deve ser feita sem medição no **aparelho alvo**. O notebook não é o
alvo; o celular do Heitor é. Existe precedente registrado de uma caçada a FPS
que não se reproduziu e consumiu tempo à toa.

O que falta: medir no celular, e só então procurar gargalo — com número, não com
palpite. Enquanto isso, não mexer em céu, física, DPR, antialias nem grid.

**Atualização — 27/09/2026, primeira observação no aparelho alvo.** Build de
produção num celular Android, pela rede Wi-Fi local, jogado pelo Heitor e pelo
Higor (registro completo em `docs/TESTES_COM_CRIANCAS.md`). Rodou liso na maior
parte do tempo e **travou em cerca de 10% do tempo**.

Isso confirma que o problema existe no alvo, mas **ainda não é a medição que
este item pede**: o medidor de FPS é só de desenvolvimento e não está no build
de produção, então os 10% são observação durante o jogo, não número de
ferramenta. Não foi registrado em que momentos as travadas aconteciam (curva,
chegada, painel aberto, muitos objetos na tela) nem se o Modo Tranquilo estava
ligado. A regra acima continua valendo; o próximo passo está no item 11.

**Correção — 27/09/2026, medição no build de produção.** Os 33 a 55 FPS medidos
em 23/09 vieram do **modo de desenvolvimento** (`npm run dev`, com o Stats) e
**não valem como referência**. O mesmo vale para a conclusão tirada deles sobre
o Modo Tranquilo e a decoração.

Com o medidor da fatia A3.1a (`?medir=1`), no build de produção
(`npm run preview`, Chrome), **o notebook ficou liso**: mediana de 16,9 ms e
**nenhum quadro acima de 50 ms**. Foram cerca de 1 minuto de direção livre,
fora da rota padrão. O resumo completo está em `docs/TESTES_COM_CRIANCAS.md`,
seção "Medições de desempenho".

**A investigação de travadas passa a ser só no celular**, pela medição A3.2
(marcada para 29/09/2026). No notebook não há o que investigar.

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

---

## 10. Tela inicial em retrato

**Status.** Resolvido pela A4.1 (commit `c8aca64`, caminho 1).

**Observado.** Com o celular em pé, a arte da abertura fica numa faixa estreita
no meio da tela, com muito espaço vazio em cima e embaixo.

**Onde.** `src/components/StartScreen.jsx` — a composição é um canvas fixo de
1280×800 escalado por `Math.min(largura / 1280, altura / 800)`. Em retrato, o
limite é a largura; o canvas encolhe até caber de lado a lado e sobra altura. A
sobra aparece como moldura na cor `--orbi-twilight-deep` (`.orbi-start` em
`src/styles.css`). Exemplo de conta: numa tela de 360 px de largura, a escala
fica em 0,28 e a arte ocupa cerca de 225 px de altura.

A trava de orientação (`OrientationGuard`) **não cobre a abertura**: ela só é
montada dentro de `src/GameExperience.jsx`. Em retrato, a criança vê a abertura
encolhida; o pedido para virar o celular só aparece depois do JOGAR.

**Quando.** Teste no celular, 27/09/2026.

**O que falta decidir.** Há dois caminhos, e nenhum foi escolhido:

1. levar o aviso de virar o celular também para a abertura, para que a
   experiência inteira seja em paisagem;
2. fazer uma composição de abertura própria para retrato.

O primeiro é mais barato e coerente com o jogo, que já é só paisagem. O segundo
mexe numa tela que foi feita fiel a um mock aprovado.

---

## 11. Desempenho no celular: travadas em ~10% do tempo

**Observado.** No teste de 27/09/2026, o build de produção num celular Android
rodou liso na maior parte do tempo e **travou em cerca de 10% do tempo**. É a
primeira observação no aparelho alvo; o histórico do notebook está no item 6.

**Onde.** Ainda não se sabe — esse é o ponto. O medidor de FPS existente
(`src/GameExperience.jsx:118`) só roda no modo de desenvolvimento e não estava
presente no teste.

**Quando.** Teste no celular, 27/09/2026 (`docs/TESTES_COM_CRIANCAS.md`).

**O que falta — antes de otimizar.** Medir no aparelho, com número:

- em que momentos trava (andando reto, em curva, na chegada a um lugar, com
  painel aberto, perto de muitos objetos);
- se a travada é queda contínua de FPS ou pico isolado (coleta de lixo,
  carregamento, compilação de shader na primeira aparição de algo);
- se o Modo Tranquilo muda alguma coisa no celular, como não mudou no notebook.

Só depois disso escolher onde mexer. As proibições do item 6 continuam valendo
até lá.

As causas prováveis levantadas na leitura do código e o protocolo de medição
repetível estão na iniciativa **A3** de `docs/PLANO_MESTRE.md`.

---

## 12. Lote fixo de ±10 no teste da planta da escola

**Observado.** O teste "volumes cabem no lote e mantêm aproximação e moedas
livres" usa um lote fixo de ±10 em volta da ESCOLA, digitado à mão. Esse número
vem da regra antiga `max(w,l)+4` (16 + 4 = 20, logo ±10). A calçada real da
ESCOLA é por eixo: ±10,2 em x e **±8,2 em z**. O teste aceita volumes até 1,8
além da calçada real na profundidade.

**Onde.** `tests/school-layout.test.js:17-42` (a caixa está na linha 29).

**Quando.** Levantado na fatia A1.1, 27/09/2026.

**O que falta.** Sem efeito hoje: `src/school/school-layout.js` não está ligado
ao jogo nesta base. Corrigir quando a escola com ateliê (B2) entrar no jogo,
fazendo o teste consumir a geometria compartilhada (`CALCADA_POR_LADO` em
`src/city/geometria.js`) em vez do 10 fixo.

---

## 13. Pares de calçadas com folga entre 5,6 e 5,7

**Observado.** Com a regra de folga mínima 4 entre calçadas
(`tests/folgas-cidade.test.js`), três pares passam, mas com pouca sobra:

| Par | Distância entre calçadas |
|---|---|
| PORTO ↔ POSTO | 5,60 |
| HOSPITAL ↔ ESCOLA | 5,63 |
| ZOO ↔ gramado do PARQUE | 5,72 (limite inferior: o gramado é medido pelo retângulo da elipse) |

**Onde.** Posições em `src/city/bairros.js` e `src/city/posto.js`; gramado em
`src/city/geometria.js`.

**Quando.** Tabela de distâncias da fatia A1.1, 27/09/2026.

**O que falta.** Nada até o lançamento: é **insumo** para espalhar a cidade
depois de 04/10 (opção maior da iniciativa A1 em `docs/PLANO_MESTRE.md`). São os
primeiros pares a conferir se a folga mínima subir.

---

## 14. Ruas passam por baixo das calçadas, por desenho

**Observado.** As ruas (`CAMINHOS`) ligam os prédios pelo centro: o caminho 4
nasce no centro do POSTO e termina no centro do HOSPITAL, e o caminho 3 termina
no centro da GARAGEM. Por isso o leito de alguma rua passa por baixo da calçada
de **10 dos 13 lotes**. Só PADARIA, FAROL e VET ficam fora do leito. A calçada é
desenhada acima da rua e a cobre.

**Onde.** `src/components/RoadNetwork.jsx:13-24`.

**Quando.** Análise da fatia A1.2b, 27/09/2026.

**O que falta.** Nada a corrigir: é o desenho da cidade. Fica registrado que
**"nenhum lote sobre rua" não é uma regra válida** para o teste de folgas — 10
lotes falhariam hoje.

---

## 15. Proposta de teste (d): todo sensor de chegada alcançado por uma rua

**Observado.** Dá para medir, com os dados, se o leito de alguma rua entra no
sensor de chegada de cada lugar. Hoje isso **não vale** para PADARIA, FAROL e
VET. Depois da A1.2b, o sensor do VET fica a cerca de 8,6 do leito mais
próximo: a criança precisa sair da rua para chegar. O chão inteiro é dirigível,
então continua possível.

**Onde.** Ruas em `src/components/RoadNetwork.jsx:13-24`; sensores derivados de
`src/city/bairros.js` e `src/city/geometria.js`.

**Quando.** Análise da fatia A1.2b, 27/09/2026.

**O que falta.** Proposta futura, não implementada: um item (d) em
`tests/folgas-cidade.test.js` com a regra "todo sensor de chegada é alcançado
pelo leito de alguma rua" (PADARIA, FAROL e VET entrariam como TODO). Exige
**promover `CAMINHOS` a dado puro em `src/city/`**, como a A1.2a fez com a
geometria dos lugares, e amostrar a mesma curva do jogo no teste.

---

## 16. `RoadNetwork.jsx` repete a posição do POSTO

**Observado.** O caminho 4 começa em `[-34, 24]`, que é a posição do POSTO
digitada à mão, em vez de ler `POSTO_POS` de `src/city/posto.js`. Mover o POSTO
deixaria a rua para trás sem aviso.

**Onde.** `src/components/RoadNetwork.jsx:20`.

**Quando.** Análise da fatia A1.2b, 27/09/2026.

**O que falta.** Fazer o ponto ler `POSTO_POS` — de preferência junto com a
promoção de `CAMINHOS` a dado puro (item 15).

---

## 17. Alternativa R4 para ZOO↔VET, se o VET ficar difícil de alcançar

**Observado.** A A1.2b separou ZOO e VET movendo o VET para `[24, 56]`, o que o
afastou das ruas (item 15). A alternativa medida na análise foi mover o **ZOO**
para `[14, 84]`: também resolve o par com folga 5,6, mas põe a árvore
`[14, 90]` sobre a parede do prédio e se afasta do fim do caminho 2
(`[20, 78]`).

**Onde.** `src/city/bairros.js` (ZOO e VET), árvore em
`src/components/Cenario.jsx:46`, fim do caminho 2 em
`src/components/RoadNetwork.jsx:16`.

**Quando.** Análise da fatia A1.2b, 27/09/2026.

**O que falta.** Decidir **só se** o teste com as crianças mostrar que o VET
ficou difícil de alcançar. Nesse caso: VET volta para `[22, 62]`, ZOO vai para
`[14, 84]`, a árvore `[14, 90]` sai de cima da parede e o fim do caminho 2
acompanha o ZOO.

---

## 18. O teste (b) mede sobreposição geométrica, não o limiar do carro

**Observado.** O carro (3,5 × 1,8) pode disparar dois sensores ao mesmo tempo
se eles estiverem a menos de 1,8 um do outro. Depois da A1.2b, só a zona de
embarque da carona × sensor de chegada da PIZZA (0,50) fica abaixo disso. No
teste manual de 28/09/2026, chegar à PIZZA pelo sul com a missão PIZZA ativa
**não** embarcou o cão.

**Onde.** `tests/folgas-cidade.test.js`; `src/city/carona.js:16`.

**Quando.** Teste manual da A1.2b, 28/09/2026.

**O que falta.** Proposta futura: o teste (b) exigir distância ≥ largura do
carro entre sensores de atividades diferentes.

---

## 19. Aviso de virar o celular pode não se explicar para quem não lê

**Observado.** O aviso de orientação é um 🔄 parado com dois textos, sem voz e
sem animação. Para uma criança que ainda não lê, pode não ficar claro o que
fazer.

**Onde.** `src/components/OrientationGuard.jsx`.

**Quando.** Fatia A4.1, 28/09/2026.

**O que falta.** Observar no teste com as crianças se elas entendem o aviso
sozinhas.

---

## 20. A intro não mostra o aviso de retrato

**Observado.** A intro (`IntroChegada`, com o campo do nome) não mostra o aviso
de virar o celular. Decisão consciente: digitar costuma ser mais fácil com o
celular em pé.

**Onde.** `src/components/IntroChegada.jsx`.

**Quando.** Fatia A4.1, 28/09/2026.

**O que falta.** Reavaliar se o teste com as crianças mostrar problema.

---

## 21. Aviso de retrato cobre o botão da Área dos Pais na abertura

**Observado.** Em celular em retrato, na abertura, o aviso de orientação cobre
o botão "Área dos pais". O adulto precisa virar o celular para abri-la. Com a
Área dos Pais já aberta, o aviso não aparece por cima dela.

**Onde.** `src/components/StartScreen.jsx`; `src/components/OrientationGuard.jsx`.

**Quando.** Fatia A4.1, 28/09/2026.

**O que falta.** Decidir se isso incomoda os pais; hoje não há outro caminho
para a Área dos Pais em retrato.
