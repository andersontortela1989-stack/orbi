# Frente 02 — Uma cidade que responde à criança

Implementação local concluída em 09/09/2026, na base `feature/orbi-golden-rebuild`, HEAD `6aaaff42c84d59fa11b0c23fc27e57484bc51f3a`. Sem commit, push ou publicação remota. Alterações anteriores preservadas por comparação de hashes.

## Comportamento entregue

- O vaso frontal esquerdo da escola acompanha a Horta: divisões e sementes correspondem à faixa escolhida, a rega escurece a terra e marca água, e a conclusão mostra brotinhos. Pausar mantém o aspecto alcançado. Reiniciar uma aventura concluída prepara o canteiro novamente.
- No ateliê de Artes, `Colocar no mural` publica uma cópia do desenho de 16 espaços na fachada, à direita da porta. Alterar/desfazer no papel não muda a obra publicada até um novo clique. Desenhos vazios ou inválidos são recusados.
- A professora Lia aparece ilustrada no encerramento da Horta, agradece pelo cuidado e convida a observar o pátio. O agradecimento integra o texto narrado existente.
- Horta e mural duram enquanto a página permanece aberta. Recarregar/resetar limpa esses estados. O save v6 continua com 11 campos; nenhuma moeda ou descoberta é concedida por publicar.

## Verificação

- `npm.cmd test`: 59/59 passaram. Inclui as três faixas da horta, cópia/validação do mural, array esparso recusado, economia e exclusão do save.
- `npm.cmd run build`: passou. Aviso existente de tamanho do bundle permanece; otimização global não faz parte desta frente.
- Edge local: percurso completo da Horta nas três faixas, usando sensores reais de chegada; pausa/retomada preservam etapa e missão. Sem erros de página.
- Edge local: criação, publicação, edição sem alteração da cópia publicada, republicação e retorno à cidade. Painel sem overflow horizontal em 640×233, 844×390 e 1366×900; botão de publicar alcançável por rolagem.
- Inspeção da cena real: canteiro 6–7 anos exibe 4 sementes em 2 divisões, depois 4 brotos. Capturas dos estados foram feitas com estado isolado de teste e câmera normal do jogo; o percurso completo foi validado separadamente. Matrizes das instâncias preenchidas após troca de etapa.
- Mural, terra regada e brotos conferidos nas capturas. Cena observada com mural: 114 chamadas de desenho; com horta: 115. Essa medição local não comprova desempenho no celular. Sem novo loop de animação, Canvas ou componente de colisão; os arquivos de física/sensores/câmera não foram alterados nesta frente. Não foi feita nova contagem de colliders em execução.
- Revisão independente: nenhum bloqueio; ajuste defensivo de array esparso aplicado e retestado.
- Preview compilado em `http://192.168.100.93:4176/`: entrada na escola dirigindo pelo teclado, publicação no ateliê e retorno à cidade passaram. Asset confirmado: `index-BUfDM8Kt.js` e CSS `index-DNPs_tKe.css`.

## Evidências e limites

Capturas e resultados em `docs/evidence/frente02/`: `garden-concluida.png`, `garden-regar.png`, `mural-world.png`, `teacher-completion.png`, `studio-640.png`, `preview-published.png`, `result.json`, `horta-flow.json` e `preview.json`.

Teste humano das frentes 01 e 02 permanece pendente por escolha do usuário. Narração foi integrada/verificada por fluxo, sem avaliação auditiva humana. Não foi iniciada a frente 03 nem implementado histórico permanente.
