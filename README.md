# Órbi — um mundo pra descobrir

Jogo educativo de exploração urbana em 3D, **gratuito**, que roda no navegador.
A criança dirige por uma cidade e aprende pelo caminho: ler as placas, contar,
repartir, cuidar de uma horta, levar alguém aonde precisa chegar.

**Sem cadastro. Sem anúncios. Sem ranking.** O acesso principal é gratuito, e
nada é coletado sobre quem joga — o progresso fica salvo no próprio aparelho.

Feito para crianças que ainda não leem com fluência, com atenção particular a
perfis TEA e TDAH: uma coisa por vez, nada muda sozinho na tela, e errar não
custa nada — na terceira tentativa a resposta aparece com calma e o jogo segue.

## Como rodar localmente

Requer **Node 20** ou mais novo.

```bash
npm install
npm run dev
```

Abra o endereço que o Vite imprimir no terminal. Outros comandos:

```bash
npm test         # suíte de testes (node:test)
npm run build    # build de produção em dist/
npm run preview  # serve o build de produção
```

## Onde o jogo é publicado

A publicação é feita pela **Vercel**: roda `npm run build` e publica a pasta
`dist/`.

O endereço público vigente é definido pelo responsável pelo projeto. A Vercel
gera uma prévia da branch de desenvolvimento a cada push; a produção só muda
por promoção manual.

## Aviso

O Órbi **não substitui acompanhamento profissional** — pedagógico, terapêutico
ou de saúde. Ele é uma brincadeira, não uma intervenção.

O Órbi também **não avalia domínio de conteúdo escolar**. Não há nota, não há
diagnóstico e não há relatório de desempenho.

Histórias, personagens e situações são ficcionais e existem a serviço da
brincadeira.

## Para quem vai desenvolver

Leia **[`docs/START-HERE.md`](docs/START-HERE.md)** antes de tocar em qualquer
arquivo. Ele define a pasta e a branch de trabalho, os princípios invioláveis,
a arquitetura e o método de commit.
