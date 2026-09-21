# Órbi — piloto visual da escola

Data: 06/09/2026. Implementação local autorizada pelo usuário após aprovação da proposta de 05/09.

Atualização de 07/09: o usuário confirmou a fluidez dos controles no celular e autorizou reforço visual e correções dos painéis. A revisão seguinte e suas verificações estão em [ORBI_MOBILE_POLISH_RESULT.md](ORBI_MOBILE_POLISH_RESULT.md). Os resultados abaixo documentam o piloto anterior.

## Entrega

Escola com porta azul e moldura coral, janela, cobertura de entrada, faixa azul no telhado, mural em azulejos pixelados, canteiros frontais, horta cenográfica nas laterais e pintura no piso da entrada. O letreiro original permanece no telhado.

`City.jsx` monta `SchoolEnvironment` como irmão do prédio existente. A decoração contém 56 caixas e 12 copas facetadas em duas malhas instanciadas; `frames={1}` evita reenviar matrizes e cores estáticas a cada quadro. Sem dependências, texturas, iluminação ou colisores novos.

A revisão com a câmera real mostrou que o prédio escondia os elementos previstos atrás dele. A horta foi posicionada nas faixas laterais e o mosaico de piso passou para a frente, respeitando o lote e o corredor de aproximação. Esta é a adaptação visual prevista na etapa de revisão do plano.

## Escopo e preservação

- Raiz: `C:/Users/ander/Cidade-Turbo-3D`.
- Branch: `feature/orbi-golden-rebuild`; HEAD de partida: `6aaaff42c84d59fa11b0c23fc27e57484bc51f3a`.
- Arquivo existente alterado: `src/components/City.jsx`.
- Novos arquivos de código: `src/components/school/SchoolEnvironment.jsx`, `src/components/school/school-layout.js`, `tests/school-layout.test.js`.
- Comparação SHA-256 dos 77 arquivos de código/testes preexistentes: somente `City.jsx` mudou. Padaria, garagem, estilos, prédio base, câmera, física, sensores, moedas, store e save preservados.
- Sem commit, push ou publicação remota. A implementação permanece local para avaliação humana.
- Esta entrega é visual. Não inclui entrada no prédio, atividades curriculares, seleção de idade, NPCs ou aprendizagem persistida.

## Verificações automatizadas

| Verificação | Resultado |
|---|---|
| Base antes da implementação | PASS — 40/40 testes e build |
| Teste novo antes do módulo | Falhou pela ausência de `school-layout.js`, conforme esperado |
| Planta decorativa | PASS — dados originais preservados, IDs únicos, escalas válidas, limites do lote, aproximação e alcance das moedas |
| Suíte após ajuste visual final | PASS — 42/42 testes |
| Build após ajuste final | PASS — `index-BFbbVSmM.js` |
| `git diff --check` | PASS; avisos de conversão LF/CRLF não são falhas |

O aviso preexistente do Vite sobre bundle maior que 500 kB continua presente. Bundle final: aproximadamente 3.281,95 kB, gzip 1.117,00 kB. Base: 3.279,85 kB, gzip 1.116,19 kB.

## Navegador e método

Teste do build de produção em Edge headless, acelerado por Intel UHD Graphics via ANGLE/D3D11, com perfis temporários independentes. Nenhum save do usuário foi usado ou modificado. A instrumentação externa lê a cena, o renderizador e o corpo do carro via React; não foi adicionada ao produto.

Base de produção copiada antes da edição e piloto executados no mesmo computador, viewport 1366×900, zoom original 16, carro em X=0/Z=52. Foram feitas duas amostras de 30 segundos por versão, após aquecimento. A comparação é de cena parada; não equivale a medição de percurso contínuo nem a desempenho em aparelho móvel. Missões sorteadas podem produzir textos diferentes no HUD.

As evidências brutas, scripts de QA e capturas ficam fora do Git em `C:/Users/ander/AppData/Local/Temp/orbi-school-validation-20260905/`. O arquivo `qa-results.json` registra a última execução; `qa-before-garden-adjustment.json` preserva a execução anterior ao ajuste visual.

## Resultados no build final

| Medida — cena parada | Base | Piloto | Avaliação local |
|---|---:|---:|---|
| Draw calls | 109 | 111 | +2; limite proposto +20 |
| Triângulos | 13.770 | 14.682 | +912; limite proposto +8.000 |
| Colisores na cena | 81 | 81 | Sem acréscimo |
| Mediana, amostra 1 | 16,7 ms | 16,7 ms | Sem aumento mensurável |
| Mediana, amostra 2 | 16,7 ms | 16,7 ms | Sem aumento mensurável |
| p95, amostra 1 | 16,8 ms | 16,9 ms | Aproximadamente +0,6% |
| p95, amostra 2 | 16,8 ms | 16,9 ms | Aproximadamente +0,6% |

O orçamento gráfico e os limites de tempo de quadro foram atendidos nesta cena no computador. O resultado não aprova desempenho em celular nem o percurso contínuo previsto na aceitação completa.

| Conferência | Resultado observado |
|---|---|
| Desktop 1366×900 | PASS local — escola, letreiro, mural, canteiros, horta lateral e mosaico visíveis |
| Dia, entardecer e noite | Capturados no jogo real; placa permanece legível |
| 740×360, 844×390, 915×412 | PASS de renderização em touch simulado; zoom original 9, sem overflow horizontal |
| Rotação para 390×844 | Aviso VIRE O CELULAR aparece; o Canvas permanece montado |
| Vistas dos quatro lados | Capturadas por reposicionamento externo do carro; não equivalem a uma volta dirigida completa |
| Encostar na frente por teclado | Carro parou em Z≈45,97, fora do prédio; sem novo colisor na decoração |
| Dirigir junto à fileira leste | Coleta real por teclado: moedas de 1 para 2 no perfil temporário |
| Erros JavaScript | Zero `pageerror` nas execuções finais |
| Endereço existente na LAN | HTTP 200 e referência ao asset final `index-BFbbVSmM.js` |

O HUD existente pode cobrir a faixa superior da escola em determinados enquadramentos de celular. Seus controles e posicionamento não foram alterados. Permanecem pendentes a avaliação humana, o percurso completo com os controles touch e a observação prolongada de cintilação em aparelho real.

## Avaliação humana

Pendente: experimentar o piloto no celular real, avaliar a intensidade das cores e dos detalhes e percorrer o entorno com os controles touch. Os detalhes do mural são pequenos no zoom de celular; a placa ESCOLA continua sendo o principal identificador. Não há validação de aprendizagem nesta entrega.

Padaria e garagem mantêm suas próprias validações humanas pendentes. Nenhuma delas é aprovada por consequência deste piloto.

Preview no endereço já usado pelo usuário: http://192.168.100.93:4176/ — atualizar a página para carregar o build novo. A porta 4177 foi usada para a conferência isolada de produção.
