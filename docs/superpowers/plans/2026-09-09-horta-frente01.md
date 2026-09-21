# Horta da Escola — Implementation Plan

> Executar sequencialmente com executing-plans e revisão final independente. Frente 01 aprovada pelo usuário em 2026-09-09. Não requer nova aprovação de implementação.

**Goal:** Aventura conectada Escola → Mercado → Escola, com contagem, partilha, plantio, rega e observação narrada.

**Architecture:** Modelo puro de etapas e ações; estado transitório na store atual, excluído do save. Contexto horta-v1 usa o host de diálogos existente. Aventura ativa suspende conclusão e narração das missões normais sem substituir a missão. Sensores reais abrem atividades apenas no destino certo. Pausar mantém progresso da sessão; retomar na escola. Sem modificações em física ou prédios.

**Tech Stack:** React, Zustand, CSS/SVG e fala existentes; Node tests e Edge/Playwright locais. Sem dependências novas.

**Spec:** Proposta aprovada da frente 01: pequenas aventuras entre lugares; piloto Horta da Escola. Três faixas ajustadas à atividade: 3 sementes/3 canteiros, 4 sementes/2 canteiros, 6 sementes/3 canteiros. Tap em sementes, distribuição igualmente nos canteiros, uma rega ilustrada por canteiro, passagem explícita de dias fictícios. Não ensina frequência real de rega nem garante germinação real. Sem espera, cronômetro ou recompensa financeira.

## Restrições

- Checkout autorizado Cidade-Turbo-3D; preservar alterações anteriores e save v6/11 campos. Sem commit/push/deploy remoto.
- Somente frente 01. Sem transformação permanente do cenário, novo sistema de personalidade, biblioteca geral de jogos ou persistência de histórico.
- Estado da horta vive durante a página aberta. Pausa retoma na escola sem perder sementes/plantio/rega; reload recomeça a aventura. Interface informa esse limite.
- Missões GPS/Ciências/Busca ficam preservadas durante aventura ativa. Serviços de combustível e carona mantêm prioridade; nenhum soft-lock de saída.
- Voz repetível, pistas, alvos ≥44px, cabeçalho sempre acessível, rolagem em telas baixas, nenhum movimento automático novo.

## Etapas

- [x] Modelo e store: criar src/adventures/horta.js e tests/horta.test.js. Testar transições convite→sementes→plantar→regar→observar→concluida, limites/duplicação de toques, lugares errados e três faixas. Exemplo: `hortaAction(createHorta('6-7'),'coletar')` só coleta na etapa sementes. Integrar por `criarAcoesHorta(set,get)` em src/store/horta-actions.js; testes de store garantem missão preservada, pausa/retomada, rejeição de contexto concorrente e zero campos persistidos novos.
- [x] Integração: MissionSensors prioriza `chegarHorta(slug)` durante aventura ativa; processarChegada/processarBusca recusam avanço paralelo. Host seleciona HortaPanel, SchoolMicroScene oferece convite após faixa; HUD mostra o destino da aventura; MissionController silencia pedidos atrasados durante aventura.
- [x] Interface: HortaPanel.jsx/ horta.css, reaproveitando tokens da escola. Cabeçalho saída, três marcos Escola/Mercado/Horta, bancada de sementes, canteiros manipuláveis e conclusão. Ações da store validam contexto/lugar, painel de caminho só orienta e permite pausar. Pausa na escola e retomada preservam etapa e faixa original.
- [x] Verificação: testes vermelhos antes do modelo/store; suite completa/build. Navegador nas três faixas, erros/limites, pause/resume, missão normal, entrada real escola/mercado e carona; 640×233,844×390,1366×900. Revisão independente e correções necessárias.
- [x] Entrega: relatório/evidências e atualização do preview 4176 existente; conferir build servido, manter processo habitual e encerrar apenas helpers criados nesta etapa.
