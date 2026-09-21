# Frente 01 — Horta da Escola

Entrega local em 2026-09-09, conforme aprovação da primeira frente na conversa. As frentes 02–05 não foram iniciadas.

## Experiência entregue

Na escola: Vamos aprender → faixa → Aventura: Horta da Escola. O convite inicia um trajeto real até o mercado. A criança separa sementes na cestinha, dirige de volta à escola, reparte nos canteiros, planta, rega e observa brotos após uma passagem explícita de dias fictícios. Nenhuma espera real ou obrigação de retornar diariamente.

| Faixa | Sementes | Canteiros | Em cada canteiro |
| --- | --- | --- | --- |
| 3–5 | 3 | 3 | 1 |
| 6–7 | 4 | 2 | 2 |
| 8–10 | 6 | 3 | 2 |

Contagem ilustrada, fala, repetição, pistas faladas/escritas e etapas curtas. A orientação no alto da cidade aponta o próximo lugar. Clicar nela abre orientação e pausa, sem executar ações reservadas ao destino. Sementes só são coletadas no mercado; plantio e cuidados só na escola.

Voltar à cidade fecha a atividade sem perder a etapa. Pausar libera a missão normal e permite continuar na escola com a faixa e os itens já separados. O estado dura enquanto a página estiver aberta; recarregar ou fechar a página reinicia a horta. A missão normal é preservada durante a aventura; uma missão escolar já concluída avança uma vez antes da aventura. Ao final, a missão normal continua. Carona e abastecimento mantêm prioridade.

## Escopo preservado

- Sem save novo, migração, pontuação ou histórico pedagógico novo; save v6 continua com 11 campos.
- Estado/ações em arquivos próprios, usando o host contextual existente. Nenhum Canvas adicional.
- Nenhuma alteração em física, direção, câmera, economia, cenário ou fachada aprovada. Jardim desta primeira frente é a atividade ilustrada; ainda não transforma o cenário permanentemente.
- Hashes comparados ao início: entre arquivos preexistentes, apenas ContextualInteractionHost, HUD, MissionController, MissionSensors, SchoolMicroScene e useGame foram modificados nesta etapa. Ajustes anteriores de escola, artes, garagem, Padaria, parque e mobile foram preservados.
- Sem commit, push ou publicação remota.

## Verificação

- Baseline: 50 testes. Final: **56/56**, incluindo modelo nas três faixas, transições inválidas, limites de toques, local errado, estado imutável, pausa/retomada, concorrência de painéis, missão e save.
- Build aprovado; aviso já existente de bundle maior que 500 kB permanece.
- Navegador Edge headless: aventura completa nas três faixas, usando sensores reais com posicionamento de teste no ambiente de desenvolvimento. Sair, buscar sementes, voltar, plantar, regar, observar e concluir; pausa parcial e retomada preservaram faixa e quantidade. Missão anterior permaneceu inalterada.
- Viewports 640×233, 844×390 e 1366×900: overflow horizontal zero, saída sempre dentro da tela, botões alcançáveis com rolagem nas telas baixas. Nenhum erro JavaScript.
- Revisão independente identificou duas correções, aplicadas: sementes ilustradas na observação agora seguem a quantidade plantada; pedido de missão normal volta a ser narrado após a aventura liberar o contexto. Teste adicional no navegador confirmou retomada da narração, carona prioritária e pista escrita.
- Preview **http://192.168.100.93:4176/** reativado nesta sessão (não havia processo escutando inicialmente). Teste no build compilado dirigiu até a escola com teclado, abriu a horta, partiu para o mercado, abriu a orientação e pausou. Não equivale a percurso completo manual no celular.
- Assets finais: `index-YPOmataD.js`, `index-BgxPFdoE.css`. Evidências em `docs/evidence/horta-frente01/`.

## Próximo teste humano

Atualizar o jogo, entrar na escola e escolher a aventura após a faixa. Conferir no notebook o trajeto completo e a pausa/retomada; depois repetir no celular deitado, ouvindo a narração real. Os testes humanos anteriores confirmaram fluidez da versão escolar anterior; esta aventura nova ainda precisa desse retorno.

O conteúdo usa uma horta fictícia para contagem, partilha e sequência de cuidados. Não estabelece duração real de germinação nem frequência universal de rega. Histórico permanente e novas transformações da cidade permanecem para as próximas frentes aprovadas, a executar separadamente.
