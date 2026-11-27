# Órbi — um mundo pra descobrir

Um jogo educativo gratuito em que a criança dirige por uma cidade calma e ensina o Órbi, um alienzinho que acabou de chegar e ainda está descobrindo a Terra.

**Jogar:** [orbi-kahe.vercel.app](https://orbi-kahe.vercel.app)

## O que é

A criança não é testada: é quem sabe e guia a aventura. O Órbi pergunta sobre lugares e coisas do cotidiano; a criança dirige até lá e o ajuda a descobrir. O caderninho guarda essas descobertas sempre nesse sentido: **“O que o Órbi descobriu com você”**.

A cidade reúne lugares para explorar, incluindo o Shopping e o Sítio, com seu pasto e rio. Educação é a mecânica, não uma tela separada: ler uma placa vira GPS, abastecer envolve contagem e escolher a cor do carro muda o que se vê no mundo.

## Como foi desenhado

O jogo foi criado para uma criança autista com TDAH. Esses princípios orientam todas as telas:

- **Errar não é punido:** sem som de erro, tela vermelha ou “você perdeu”; o Órbi oferece apoio e revela a resposta com calma.
- **Sem game over:** quando o combustível acaba, o carro desacelera com calma e o modo reserva permite chegar ao posto.
- **Uma coisa por vez:** as instruções não competem pela atenção.
- **Nada muda sozinho:** por exemplo, o céu só troca quando a criança toca no botão.
- **Feedback assimétrico:** o acerto é comemorado; o erro recebe uma resposta acolhedora.
- **Sem cronômetro, anúncios, ranking, compras com dinheiro real ou cadastro.** A garagem usa moedas do próprio jogo.
- O progresso fica salvo **no aparelho** e não é apagado em silêncio.

## Rodar localmente

Requer Node.js 20 ou mais recente.

```bash
npm install
npm run dev
```

O Vite mostra o endereço local no terminal. Outros comandos:

```bash
npm test         # testes automatizados
npm run build    # build de produção
npm run preview  # pré-visualizar o build
```

O jogo funciona melhor em **paisagem**. Em telas de celular, pede para virar o aparelho.

## Stack

React · React Three Fiber · Three.js · Rapier · Zustand · Vite. A cidade usa câmera ortográfica, física arcade e geometria simples para rodar em notebook e tablet.

## Estrutura

```text
src/components/   renderização 3D e painéis
src/city/         dados do mundo e da cidade
src/missions/     missões, perguntas e conteúdo pedagógico
src/store/        estado do jogo (Zustand + persistência)
src/save.js       fronteira de persistência
docs/             arquitetura e decisões do projeto
```

## Nota honesta

O Órbi é um jogo educativo. **Não trata, não cura e não substitui** terapias, diagnóstico ou acompanhamento profissional.
Também não dá notas nem avalia o desempenho escolar da criança.

## Feito por

Anderson Tortela, com carinho.

## Para quem vai desenvolver

Leia **[`docs/START-HERE.md`](docs/START-HERE.md)** antes de alterar arquivos. Ele reúne as regras de trabalho, a arquitetura e os princípios do projeto.
