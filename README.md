# Órbi — um mundo pra descobrir

Um jogo educativo gratuito onde a criança dirige por uma cidade calma e ensina
o Órbi, um alienzinho que acabou de chegar e não conhece nada da Terra.

**Jogar:** https://orbi-kahe.vercel.app

<img width="1292" height="792" alt="image" src="https://github.com/user-attachments/assets/a8decc91-b924-4bf2-8bd0-1fda0c6def19" />


## O que é

A criança não é testada — ela é quem sabe. O Órbi pergunta o que é um hospital,
uma padaria, um farol; a criança leva ele até lá, e a chegada ensina de volta.
O caderninho do Órbi guarda o que ele descobriu, sempre nesse sentido: nunca
"o que você aprendeu", sempre "o que o Órbi descobriu com você".

Educação é a mecânica, não uma tela separada. Ler a placa é o GPS. Abastecer é
contar até N. Escolher a cor do carro é ler a palavra da cor e ver o mundo mudar.

## Como foi desenhado

O jogo foi feito para uma criança autista com TDAH, e essas regras valem em
todas as telas:

- **Errar nunca é punido** — sem vermelho, sem som de erro, sem "você perdeu"
- **Sem game over** — o tanque vazio desacelera o carro com calma, e o modo
  reserva sempre dá para chegar ao posto
- **Uma coisa por vez** — nunca há duas instruções competindo na tela
- **Nada muda sozinho** — o céu só troca quando a criança toca no botão
- **Feedback assimétrico** — o acerto comemora alto, o erro é quase invisível
- **Sem cronômetro, sem anúncios, sem compras, sem cadastro**
- O progresso fica salvo **só no aparelho**, e nunca é apagado em silêncio

## Rodar localmente

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # build de produção
npm run preview  # serve o build
npm test         # testes do save
```

Precisa de Node 20+. Funciona melhor em **paisagem** — no celular o jogo pede
para virar o aparelho.

## Stack

React Three Fiber (Three.js) · Rapier (física) · zustand (estado) · Vite.
Câmera ortográfica de cima, física arcade, tudo em geometria simples — roda
liso em notebook e tablet.

## Estrutura

```
src/components/   render 3D e painéis 2D
src/city/         onde ficam as coisas no mundo (fonte única)
src/missions/     missões, quizzes e conteúdo pedagógico
src/store/        estado do jogo (zustand + persist)
src/save.js       fronteira única de persistência
docs/             arquitetura e decisões de projeto
```

## Nota honesta

O Órbi é um jogo educativo. Ele **não trata, não cura e não substitui**
terapias, diagnóstico ou acompanhamento profissional.

## Feito por

Anderson Tortela, com carinho.
