# START HERE — Órbi

Leia isto antes de tocar em qualquer arquivo. Onde este documento conflitar com
os handoffs em `docs/`, **este documento vence** (ver a nota no fim).

---

## Onde trabalhar

| | |
|---|---|
| **Pasta de trabalho** | `C:\Users\ander\Documents\orbi-netlify` — **única** |
| **Branch** | `codex/activity-coordinator-p0` |
| **Onde se desenvolve** | só no **Claude Code** |

### O que está congelado

A pasta `C:\Users\ander\Cidade-Turbo-3D` e a branch `feature/orbi-golden-rebuild`
**não recebem mais commits**. Existem só como **fonte de conteúdo a portar**, e
se leem sem checkout:

```bash
git show origin/feature/orbi-golden-rebuild:src/components/school/activities.js
```

Não abra aquela pasta para editar. Não faça merge daquela branch.

---

## Comandos

```bash
npm test         # suíte inteira (node:test)
npm run build    # build de produção (vite) em dist/
npm run dev      # servidor local
```

---

## Publicação

O alvo é o **Netlify**, configurado em `netlify.toml` na raiz: roda
`npm run build`, publica `dist/`, com redirect de SPA e Node 20.

> **Nenhum `push`, `merge`, PR ou deploy sem autorização expressa do Anderson.**
> A mesma regra vale para commit: nada entra sem ele revisar o diff antes.

---

## Princípios invioláveis

Não se negociam por conveniência de implementação.

- **Errar nunca pune nem trava.** Sem game over, sem perda de progresso, sem som
  de erro. Na terceira tentativa a resposta é revelada com calma e o jogo segue
  sozinho.
- **Sem ranking, sem anúncios, sem retenção artificial.** Nada de sequência
  diária, cronômetro, placar ou comparação com outras crianças.
- **Acessível a quem ainda não lê.** Ícone, cor e voz carregam a informação;
  texto é apoio, nunca o único caminho.
- **Modo Tranquilo é estrutural**, não um extra. Reduz som, movimento e detalhe
  — e **mantém a voz**, porque a voz é acesso, não estímulo.

---

## Arquitetura — uma linha por módulo

| Módulo | Responsabilidade |
|---|---|
| `src/activity/` | Coordenador de foco em **pilha**: uma atividade por vez detém voz, HUD e controles; as de baixo são retomadas ao fechar a de cima. |
| `src/adventure/` | Motor **puro** de aventuras: recebe evento, devolve efeito declarativo. Não conhece React, Three.js nem browser. |
| `src/school/`, `src/city/` | Dados e regras **puras** — conteúdo e domínio, sem JSX. |
| `src/components/` | Só React. Regra de negócio não mora aqui. |

Regra derivada: **se dá para testar em `node:test`, não pertence a `components/`.**

---

## Como se trabalha

- **Uma fatia por vez.** A fatia pedida é a fatia entregue — sem antecipar a
  próxima, sem "aproveitar e corrigir" de passagem.
- **Um commit por fatia**, com `npm test` e `npm run build` verdes.
- **Nenhum commit sem o Anderson revisar o diff.**
- Reconhecimento read-only antes de alterar. Arquivos completos, nunca
  fragmentos.

---

## Dependências conhecidas

`npm audit` acusa 7 alertas. **Nenhum exige ação agora.**

- **`fflate` (moderate, produção).** Chega via `three-stdlib`, que vem do
  `@react-three/drei` e do `@react-three/rapier`. O aviso é sobre `unzipSync`
  entrar em laço infinito com ZIP64 malformado. **O caminho é inalcançável pelo
  jogo:** não se carrega ZIP, GLTF, FBX nem nenhum arquivo comprimido, não
  existe asset desse tipo no repositório, e no bundle não aparece nenhuma função
  de descompressão. A única ocorrência de "fflate" no build é um comentário de
  licença do Troika.
- **Os outros 6** — `browserslist`, `postcss`, `nanoid`, `esbuild` (via `vite`)
  e `baseline-browser-mapping` — são **só de desenvolvimento** e não chegam ao
  navegador. `npm audit --omit=dev` lista apenas o `fflate`.

> **Não rode `npm audit fix` nem `npm audit fix --force` sem análise.** O
> `--force` sobe para `vite@8`, que é mudança breaking.

---

## Sobre os handoffs em `docs/`

`handoff-cidade-turbo-3d.md`, `handoff-cidade-turbo-3d-ADENDO-curriculo.md` e
`handoff-orbi-ADENDO-narrativa.md` são **registro histórico** e não são
atualizados.

O que neles continua valendo: os **princípios de produto**, os **guard-rails
TEA+TDAH** e o **tom das falas do Órbi**.

O que **não** vale mais: as instruções operacionais. Eles foram escritos quando
o projeto ainda ia ser criado — descrevem escolha de stack ainda em aberto,
ordem de fatias já construídas e uma cidade de três prédios que hoje tem onze.
