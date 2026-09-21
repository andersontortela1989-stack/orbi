# Órbi — escola mais viva e ajustes no celular

Data: 07/09/2026. Alterações locais autorizadas pelo usuário após envio de seis fotos do celular.

## Retorno humano e escopo

O usuário confirmou que o carro responde bem ao toque e está fluido no piloto anterior. Também solicitou mais presença visual na escola e correções do painel de abastecimento cortado, da pergunta que encobria o canteiro e do mascote atrás do acelerador. Essa confirmação de fluidez não equivale a uma validação humana da revisão atual.

Raiz: `C:/Users/ander/Cidade-Turbo-3D`; branch `feature/orbi-golden-rebuild`; HEAD `6aaaff42c84d59fa11b0c23fc27e57484bc51f3a`. Nenhum commit ou push realizado.

## Alterações

- Escola: faixas grandes em amarelo, azul e coral, pintura com cores chapadas, símbolos pixelados de livro e sol no telhado, fachada clara, toldo listrado, canteiros com flores e mosaico maior no pátio. A placa ESCOLA permanece na posição original. Não há luz, textura, colisor ou animação nova.
- Abastecimento: organização em duas colunas nas telas baixas. Título, dez marcadores, contador e botão cabem na altura útil. Limite de altura com rolagem interna como proteção para outros tamanhos. Contagem e conclusão não foram modificadas.
- Parque: painel compacto e vista do canteiro ao lado das respostas. O SVG deriva suas árvores de `CANTEIRO.arvores`, a mesma fonte do cenário; não imprime o número da resposta. O cenário continua acima do painel e a criança pode contar na vista mesmo se a posição do carro ocultar as árvores reais.
- Órbi: reserva vertical acima dos pedais quando os controles touch estão presentes. Nenhuma alteração em eventos de toque, direção, aceleração ou física.

Arquivos alterados nesta revisão: `src/styles.css`, `src/components/ChegadaVivaPanel.jsx`, `src/components/school/school-layout.js` e `src/components/school/SchoolEnvironment.jsx`. Novos: `src/components/ParkBedView.jsx` e `tests/park-bed-view.test.js`.

A comparação SHA-256 antes/depois confirmou que os demais arquivos preexistentes de código e testes permaneceram iguais. Em particular: carro, câmera, controles, sensores, economia, save, padaria, garagem e City. O CSS desta revisão foi acrescentado depois dos estilos anteriores, preservando os ajustes existentes da padaria.

## Verificação

| Verificação | Resultado |
|---|---|
| Base do turno | 42/42 testes passando |
| Teste da vista do canteiro antes da implementação | Falha esperada pela ausência do componente |
| Teste da vista após implementação | PASS — acompanha as árvores reais, inclusive alteração temporária da quantidade, sem imprimir resposta |
| Suíte final | PASS — 43/43 |
| Build final | PASS — JS `index-Dd_JK7A2.js`, CSS `index-Cl6GUP0Q.css` |
| Diff check | PASS; apenas avisos LF/CRLF |
| Preview habitual | HTTP 200 e referências aos dois assets finais |

O aviso preexistente do Vite para bundle maior que 500 kB continua presente.

## QA de interface em navegador

Edge headless com perfis temporários, câmera e componentes reais. As checagens dos painéis usaram o servidor de desenvolvimento e a store para ativar os cenários de teste; não foi necessário percorrer missões aleatórias. Isso verifica layout e callbacks reais, não a sequência completa de chegada por sensores nem o aparelho do usuário. Nenhum save do usuário foi utilizado.

Tamanhos conferidos: **640×233, 740×262, 844×390 e 1366×900**. Nos três primeiros, touch simulado.

- Painel do posto, título e botão integralmente dentro do viewport em todos os tamanhos. Em paisagem baixa, altura de aproximadamente 134 px.
- Dez cliques completaram o abastecimento, fecharam o painel e registraram exatamente um acerto de contagem.
- Pergunta do parque, vista das quatro árvores e três cartas dentro do viewport. Em paisagem baixa, altura de aproximadamente 175 px.
- Uma resposta incorreta preservou as quatro árvores; a correta encerrou o painel pelo fluxo existente.
- Mascote separado dos pedais por aproximadamente 10 px nos tamanhos touch testados.
- Perguntas de ZOO, MERCADO, ESTÁDIO e PADARIA também verificadas a 640×233, sem cortes no título, cartas ou dica.
- Zero erros JavaScript (`pageerror`) nas execuções.

## Escola no build de produção

Escola capturada no endereço habitual em dia, entardecer e noite. Medição de uma amostra de 30 segundos após aquecimento, em cena parada, desktop 1366×900, carro X=0/Z=52:

| Medida | Resultado atual |
|---|---:|
| Draw calls | 111 |
| Triângulos | 15.390 |
| Colisores | 81 |
| Mediana do quadro | 16,7 ms |
| p95 | 17,1 ms |

O piloto de 06/09 registrou 111 draw calls e 14.682 triângulos no mesmo enquadramento. A revisão acrescentou 708 triângulos, sem novos grupos de desenho ou colisores. A comparação temporal é com registro anterior, não um benchmark alternado entre versões no mesmo turno. A medição atual é do computador, não do celular.

## Evidências e próximo teste

Arquivos brutos, screenshots e scripts temporários em `C:/Users/ander/AppData/Local/Temp/orbi-polish-20260907/`: `results.json`, `other-quizzes.json`, `production.json`, `school-production.png`, `refuel-740.png`, `park-740.png`, `companion-740.png` e outras dimensões.

Atualizar **http://192.168.100.93:4176/** para testar esta revisão. Aguardam avaliação humana: aparência da escola, leitura e uso dos painéis no celular real e confirmação da fluidez nesta versão. Não há atividades curriculares novas na escola nesta entrega.
