# START HERE — Cidade Turbo 3D

Projeto **separado** do Tabular-Viva-OS. Repositório git próprio (branch `main`), zero acoplamento com o SaaS de produção.

## Como começar (sessão nova do Claude Code)

1. Abra um **PowerShell novo** e suba uma sessão limpa do Claude Code **dentro desta pasta**:

   ```powershell
   cd C:\Users\ander\Cidade-Turbo-3D
   claude
   ```

2. Na nova sessão, cole o **Prompt da Fatia 1** (no fim deste arquivo — é idêntico à §9 do handoff).

3. Quando o Claude rodar o scaffold do Vite e ele avisar que **"a pasta não está vazia"** (`directory not empty`), escolha **"Ignore files and continue"**. Só existe a pasta `docs/` aqui — não há conflito com os arquivos que o Vite gera.

## Contexto e regras (ler antes de aprovar cada fatia)

- Documento completo de arquitetura, decisões e sequência de fatias: [`handoff-cidade-turbo-3d.md`](./handoff-cidade-turbo-3d.md).
- **§2 — Decisões travadas: NÃO reabrir.** (câmera de cima, física arcade, educação como mecânica, caixa alta, universo original.)
- **§4 — Guard-rails TEA+TDAH valem em TODAS as fatias** (uma missão por vez, sem caos sensorial, sem game over, feedback assimétrico, respeitar `prefers-reduced-motion`).
- Método: **uma fatia por commit**, build-validada no navegador antes da próxima, reconhecimento read-only antes de alterar, **arquivos drop-in completos** (nunca fragmentos).
- Ordem de construção: **§8** do handoff. Hoje é só a **Fatia 1** — o carro arcade num plano vazio. Critério de aceite é subjetivo e inegociável: **dirigir tem que ser gostoso**. Não avança enquanto não estiver.

---

## Prompt da Fatia 1 (cole na sessão nova)

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
