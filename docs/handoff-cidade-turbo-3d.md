# HANDOFF — Cidade Turbo 3D (mundo aberto educacional)
### Documento de entrega para o Claude Code

> **Como usar este documento:** não cole tudo de uma vez no Code. Cole a seção
> **§9 (Prompt da Fatia 1)** primeiro. As seções §1–§8 são o contexto de
> arquitetura e regras — use-as como referência ao aprovar cada fatia. A ordem
> de construção está na **§8**.

---

## 1. O que é, e para quem

Jogo de **mundo aberto 3D low-poly** rodando no navegador, focado em **direção de veículos**, em que **a educação É a mecânica de jogo** — não há tela modal que pausa para "fazer uma pergunta". Aprender é dirigir, ler placas, abastecer, pagar pedágio, cumprir missões.

- **Usuário-alvo:** criança de 7 anos com **TEA + TDAH**. Lê palavras inteiras (leitura global), formula pedidos curtos, reconhece números 1–15, contagem visual. Absorve sistemas complexos (joga GTA/Mario), mas desengaja com frustração e com excesso de estímulo simultâneo.
- **Plataforma-alvo:** **notebook**. Controle por **teclado**. (Prever gamepad é opcional e fica para depois.)
- **Objetivo pedagógico (2º ano / BNCC):** leitura global utilitária, número↔quantidade, adição simples, navegação espacial — tudo embutido nas mecânicas.

---

## 2. Decisões travadas (NÃO reabrir)

O Code deve tratar estas como dadas e não gastar ciclos questionando:

1. **Câmera:** ortográfica/isométrica **de cima**, seguindo o carro com `lerp`. **Não** terceira pessoa. (Razão: o jogo é sobre ler placas e navegar — visão de cima mostra o mapa e o letreiro; terceira pessoa esconde o que está atrás e traz orbit/colisão de câmera que desorienta o perfil TEA.)
2. **Física:** modelo **arcade controlável** (ver §5), **não** simulação realista. Derrapagem é um parâmetro tunável, não consequência de simular suspensão. **Não** modelar rodas com hinge joints (caminho instável e frustrante).
3. **Educação é mecânica, não modal.** Nada de pop-up de quiz parando o jogo.
4. **Placas e UI em CAIXA ALTA**, alto contraste. **Áudio pt-BR** (Web Speech) narrando missões e números.
5. **Universo 100% original.** Sem nomes, assets, personagens ou marcas de GTA/Rockstar, Mario/Nintendo. Inspiração na estrutura, não no conteúdo.
6. **Método de construção:** uma fatia por commit, **build-validada e testada no navegador antes da próxima**, reconhecimento read-only do que existe antes de alterar, **arquivos drop-in completos** (nunca fragmentos). Mesmo método do Tabular Viva.

---

## 3. Princípio central: a educação é a mecânica de sobrevivência

| Habilidade | Mecânica que a ensina |
|---|---|
| Leitura global (utilitária) | **GPS sem seta mágica:** um NPC entra no carro com um balão "QUERO HOSPITAL". O jogador lê a placa e dirige até o prédio com o letreiro **HOSPITAL**. Sem indicador automático — ele lê para chegar. |
| Número ↔ quantidade, contagem 1–15 | **Combustível:** abastecer exige uma quantidade exata visual ("FALTAM 7 LITROS"). **Pedágio:** acesso a bairro novo cobra um valor com contador visual de 1–15. |
| Adição simples | Custos compostos (pedágio + combustível), troco. |
| Navegação espacial | O próprio ato de cruzar a cidade e usar o mini-mapa. |
| Engajamento / variedade | **Troca de veículo:** carro comum → caminhão de bombeiros (pesado, derrapa menos, missão de apagar incêndio) → carro de polícia (rápido, sirene abre o trânsito). **Cada veículo muda os parâmetros de física** (§5) — é o que renova o hiperfoco. |

---

## 4. Guard-rails de design para TEA + TDAH (CRÍTICO — não opcional)

Mundo aberto é, por definição, estímulo simultâneo e carga cognitiva alta — o oposto do "um foco por vez" que regula TEA+TDAH. O Heitor se prende ao GTA, então a fórmula pode funcionar, mas **só com liberdade curada, não caos**:

- **Uma missão ativa por vez**, sempre visível na HUD e narrada por voz. Nunca empilhar objetivos.
- **Sem caos sensorial:** paleta calma, sem flashes, sem trânsito denso, poucos NPCs, sem música estridente. Sons curtos e claros.
- **Sem punição / sem "game over" estressante.** Combustível acabando → o carro **desacelera suavemente e para**, com aviso calmo para abastecer. Ele nunca "morre", nunca perde progresso de forma abrupta.
- **Feedback assimétrico:** sucesso muito comemorado (luz, som alegre, voz); falha/erro quase invisível e neutro (sem vermelho de alarme, sem som negativo).
- **Mapa e placas legíveis:** CAIXA ALTA, alto contraste, ícones grandes.
- **Respeitar `prefers-reduced-motion`:** reduzir partículas, screen shake e efeitos quando ativado.
- **Mundo pequeno e legível** no começo. A próxima missão sempre óbvia. Liberdade que orienta, não que perde.

---

## 5. O núcleo técnico de risco: a física do carro

**Este é o item de maior risco do projeto inteiro.** "Game feel" de veículo — derrapagem que parece boa, inércia que satisfaz — é o que decide se a criança vai querer explorar. É também a parte que mais consome tempo de tuning. **A Fatia 1 inteira existe só para acertar isso, num plano vazio, antes de qualquer cidade.**

### Abordagem recomendada: arcade, não simulação

Tratar o carro como um **RigidBody dinâmico** com **rotação travada nos eixos X e Z** (`enabledRotations={[false, true, false]}` — o carro nunca capota) e controlar o movimento por um modelo arcade no `useFrame`. A derrapagem sai de **um único parâmetro** (grip lateral), o que torna o feel tunável em minutos em vez de semanas.

```jsx
// CarroArcade — MODELO DE REFERÊNCIA (conceitual). Ajustar à API atual do
// @react-three/rapier no momento da implementação. O ponto é o MODELO, não a sintaxe exata.

// <RigidBody ref={carRef} colliders="cuboid" enabledRotations={[false, true, false]}>
const carRef  = useRef();
const heading = useRef(0); // ângulo Y, em radianos

// >>> PARÂMETROS TUNÁVEIS — é AQUI que mora o "game feel". Afinar sentindo, não no checklist. <<<
const ACEL   = 18;    // força de aceleração
const V_MAX  = 14;    // velocidade máxima
const GIRO   = 2.4;   // rad/s de rotação em velocidade plena
const GRIP   = 0.90;  // aderência lateral: 1 = sobre trilhos, ~0.85 = derrapagem gostosa
const ATRITO = 0.98;  // rolamento quando solta o acelerador
const FREIO_MAO_GRIP = 0.6; // grip reduzido com espaço pressionado (drift sob controle)

useFrame((_, dt) => {
  const rb = carRef.current; if (!rb) return;
  const v = rb.linvel();
  const fwd   = { x: Math.sin(heading.current), z: Math.cos(heading.current) };
  const right = { x: fwd.z, z: -fwd.x };

  // decompõe a velocidade em "para frente" e "lateral" (a derrapagem)
  let vF = v.x * fwd.x   + v.z * fwd.z;
  let vL = v.x * right.x + v.z * right.z;

  // aceleração / ré / rolamento
  if (input.up)   vF += ACEL * dt;
  if (input.down) vF -= ACEL * dt;
  if (!input.up && !input.down) vF *= ATRITO;
  vF = Math.max(-V_MAX * 0.5, Math.min(V_MAX, vF));

  // direção: só vira em movimento; sentido depende de estar indo p/ frente ou ré
  const fator = Math.min(1, Math.abs(vF) / V_MAX);
  const s = Math.sign(vF) || 1;
  if (input.left)  heading.current += GIRO * dt * fator * s;
  if (input.right) heading.current -= GIRO * dt * fator * s;

  // GRIP lateral: reduz a derrapagem. Espaço = freio de mão = derrapa mais.
  vL *= input.space ? FREIO_MAO_GRIP : GRIP;

  // recompõe e aplica (mantém v.y para não anular a gravidade)
  rb.setLinvel({ x: fwd.x * vF + right.x * vL, y: v.y, z: fwd.z * vF + right.z * vL }, true);
  rb.setRotation(quatFromYRotation(heading.current), true); // quaternion só no eixo Y
});
```

**Por que arcade e não o raycast vehicle controller do Rapier:** o `DynamicRayCastVehicleController` existe e é fisicamente correto, mas é difícil de tunar para "divertido para criança" e exige integração de baixo nível via `useRapier`. Para este público, controle previsível e responsivo > realismo. Comece arcade. Só migre para raycast vehicle se houver razão forte — e nesse caso, confirme a API atual na doc, pois evoluiu.

**Troca de veículo = trocar os parâmetros acima.** Bombeiro: `V_MAX` menor, `GRIP` maior (pesado, gruda). Polícia: `V_MAX` e `ACEL` maiores. Mesmo modelo, constantes diferentes — é isso que renova o hiperfoco com baixo custo.

---

## 6. Arquitetura de estado (Zustand)

Estado global único. Importante: registrar **acertos por habilidade** desde já — isso alimenta o **relatório de evidência por habilidade da BNCC** no futuro (o documento que mostra o nível real do Heitor, sua munição contra a escola que o subestima).

```js
// useGame.js (shape de referência)
{
  // veículo
  veiculo: "carro",                 // "carro" | "bombeiro" | "policia"
  desbloqueados: ["carro"],

  // economia (mecânica = matemática)
  moedas: 0,
  combustivel: 100,                 // 0–100; chega a 0 → para suave, sem game over

  // missão (uma por vez)
  missao: { tipo: "gps", destino: "HOSPITAL", concluida: false },

  // progresso pedagógico — base do relatório futuro
  habilidades: {
    leituraGlobal: { acertos: 0, tentativas: 0 },
    contagem:      { acertos: 0, tentativas: 0 },
    adicao:        { acertos: 0, tentativas: 0 },
    navegacao:     { acertos: 0, tentativas: 0 },
  },

  // ações
  abastecer:      (litros) => {},
  pagarPedagio:   (valor)  => {},
  completarMissao:()       => {},
  trocarVeiculo:  (id)     => {},
  registrarHabilidade: (chave, acertou) => {},
}
```

Persistir em `localStorage` (notebook permite — sem as restrições de artifact). No produto, isto migra para Supabase com perfil por criança.

---

## 7. Stack e detalhes de mundo

- **Render:** `@react-three/fiber` (Three.js). UI/HUD: overlay React 2D normal por cima do `<Canvas>` (HUD não vai dentro do 3D).
- **Física:** `@react-three/rapier`.
- **Estado:** `zustand`.
- **Texto 3D:** `Text` do `@react-three/drei` para os letreiros dos prédios (CAIXA ALTA).
- **Base:** Next.js (App Router) ou React + Vite — escolher o de setup mais rápido. O `<Canvas>` precisa ser client component (`"use client"`).
- **Áudio:** Web Speech API nativa (`speechSynthesis`, `lang: "pt-BR"`) para narrar missões e números; Web Audio para sons curtos de feedback.
- **Cidade low-poly:** prédios = caixas (corpos `fixed` no Rapier, colisão real) com `Text` em cima. Ruas = plano com textura/grid simples. Manter contagem de polígonos baixa e número de NPCs mínimo (guard-rail sensorial).
- **Versões:** instalar as **versões atuais** e **confirmar na doc oficial** a API de `RigidBody`/controllers do `@react-three/rapier` no momento da implementação — esse ecossistema muda rápido e detalhes deste documento podem ter evoluído.

---

## 8. Sequência de fatias (uma por commit, validada antes de avançar)

| # | Fatia | Critério de aceite (gate) |
|---|---|---|
| **0** | Setup: projeto + R3F + Rapier + Zustand. Cena vazia: plano de asfalto, luz, câmera ortográfica de cima. | Build roda, cena renderiza, 60fps no notebook. |
| **1** | **O carro arcade num plano vazio.** Só dirigir (setas + espaço = freio de mão). Câmera segue com lerp. Modelo da §5. | **Dirigir tem que ser DIVERTIDO.** Critério subjetivo e inegociável: você (e idealmente o Heitor) testa e aprova pelo feel. Não avança enquanto não estiver gostoso. |
| **2** | Cidade mínima navegável: ruas + 3 prédios (caixas fixas) com letreiros 3D "PIZZA", "HOSPITAL", "ESCOLA" em CAIXA ALTA. Colisão real. | Carro colide com prédios; dá pra ler as placas de cima; navegação fluida. |
| **3** | Estado Zustand + HUD 2D (moedas, missão atual) + áudio pt-BR narrando. | HUD reflete o estado; voz narra. |
| **4** | **Missão GPS:** NPC entra no carro, balão "QUERO HOSPITAL", **sem seta**; chegar ao prédio certo completa e registra `leituraGlobal`. Mini-mapa. | Leitura da placa leva à conclusão; habilidade registrada. |
| **5** | **Economia:** combustível (gasta dirigindo; abastecer com quantidade exata "FALTAM N LITROS"); pedágio (contador 1–15). Registra `contagem`/`adicao`. | Sem caos, sem game over; matemática funciona como mecânica. |
| **6** | **Troca de veículo:** desbloquear bombeiro/polícia; cada um troca os parâmetros de física e tem missão própria (incêndio / sirene). | Física muda perceptivelmente por veículo; missões específicas funcionam. |

Guard-rails da §4 valem em **todas** as fatias, não só onde aparecem.

---

## 9. Prompt da Fatia 1 (cole isto no Claude Code AGORA)

```
Atue como Engenheiro de Jogos Web Sênior. Vamos construir, EM FATIAS, a fundação
de um jogo de mundo aberto 3D estilo sandbox de direção, no navegador, para rodar
em NOTEBOOK com controle por TECLADO. Hoje construímos SÓ A FATIA 1.

STACK:
- React + Vite (ou Next.js App Router — escolha o setup mais rápido; o <Canvas> deve ser client).
- @react-three/fiber (render 3D), @react-three/rapier (física), zustand (estado), @react-three/drei (Text).

FATIA 1 — O CHASSI DA DIVERSÃO (apenas isto; não adicione cidade, missões nem economia):
1. Cena: plano grande de asfalto, luz adequada, e uma CÂMERA ORTOGRÁFICA DE CIMA
   (visão isométrica/tática) que segue o carro suavemente com interpolação (lerp).
   NÃO usar câmera em terceira pessoa.
2. Carro com primitivas 3D (caixa para o chassi, cilindros para as rodas — visual apenas).
3. FÍSICA ARCADE, não simulação realista. O carro é um RigidBody dinâmico com rotação
   travada em X e Z (enabledRotations={[false,true,false]} — nunca capota). Controle no
   useFrame por um modelo arcade:
   - decompor a velocidade em componente "para frente" (direção do carro) e "lateral";
   - setas cima/baixo aceleram/ré; sem input, rolamento (atrito);
   - setas esquerda/direita giram o heading, proporcional à velocidade e ao sentido;
   - DERRAPAGEM controlada por UM parâmetro de grip lateral (multiplica a componente
     lateral da velocidade); ESPAÇO = freio de mão = grip menor = derrapa mais;
   - recompor e aplicar a velocidade via setLinvel, mantendo o eixo Y (gravidade);
   - aplicar a rotação como quaternion só no eixo Y.
4. Exponha os parâmetros de game feel como CONSTANTES nomeadas no topo (ACEL, V_MAX,
   GIRO, GRIP, ATRITO, FREIO_MAO_GRIP) para eu afinar facilmente.
5. Entregue ARQUIVOS COMPLETOS prontos para rodar (não fragmentos), build validada.

CRITÉRIO DE ACEITE: dirigir tem que ser RESPONSIVO E DIVERTIDO — inércia e derrapagem
com bom game feel, não movimento duro. Vou testar pelo feel antes de aprovar a Fatia 2.
Confirme a API atual do @react-three/rapier (RigidBody, setLinvel, setRotation) ao implementar.

Não construa nada além da Fatia 1.
```

---

## 10. Próximas fatias (roadmap, não construir agora)

Depois da Fatia 1 aprovada **pelo feel**, seguir a tabela da §8 — uma por vez, validando cada uma no navegador antes da seguinte. O conteúdo educacional (banco de palavras/números por habilidade e nível) começa estático e, no produto, passa a ser **gerado por IA** (Claude API) a partir do desempenho por habilidade — que é o que torna "adaptativo" real e é o fosso que material pronto nunca terá. O `habilidades` do store (§6) é a base do **relatório por habilidade da BNCC**: o documento que comprova o nível real do Heitor.
