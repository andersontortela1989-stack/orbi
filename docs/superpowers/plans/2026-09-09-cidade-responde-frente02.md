# Cidade que responde — Frente 02 Implementation Plan

> Proposta da frente02 aprovada pelo usuário. Executar em sequência com execução/testes e revisão independente final; sem commit/push/deploy remoto.

**Goal:** Ações da criança deixam resultado visível no pátio e mural da escola, com agradecimento pela horta.

**Architecture:** Projeção visual pura do estado transitório horta existente, instâncias estáticas atualizadas por ação. Arte validada/copiada na store transitória e publicada explicitamente; textura própria do desenho no mural existente. Nenhum save novo, frame loop, sensor ou colisão novo.

**Tech Stack:** React, Three/Drei, Zustand, Canvas2D somente para reproduzir as formas criadas pela criança, testes Node e navegador Edge local.

**Spec:** Frente02 aprovada: cidade responde ao plantio, desenho no mural e agradecimento de personagem. Guardar durante a página aberta; histórico permanente fica para frente05. Horta substitui a vegetação decorativa somente do vaso frontal esquerdo já existente; mural ocupa a região do livro em azulejos à direita da porta. Fachada/placa/porta/piso/canteiro do parque, controles, missão, economia e save preservados.

- [x] Criar school-living-model.js e tests/school-living.test.js: derivar canteiros/sementes/água/brotos por faixa e progresso, sem mudar horta; volumes dentro do vaso existente; copiar e validar 16 células de mural (cores/formatos permitidos, ao menos uma pintada).
- [x] Implementar estado arteEscola transitório e publicarArteEscola(board), testes rejeitando conteúdo inválido, aliasing e save extra. Ateliê oferece publicar após pintar; pintura/desfazer não alteram mural até novo clique explícito.
- [x] Implementar SchoolLivingEnvironment com instâncias por tipo geométrico, sem loop contínuo, e SchoolArtMural com CanvasTexture atualizada e descartada corretamente. SchoolEnvironment filtra apenas flores/arbustos correspondentes e azulejos do mural quando há criações; chave das instâncias estáticas muda quando muda a ocupação.
- [x] Adicionar professora ilustrada e agradecimento no fechamento da horta; mensagem explica resultado visível ao voltar à cidade. Continuar usando narração existente e rolagem compacta.
- [x] Testar suite/build, navegador: publicar/substituir mural, formato exato, horta parcial/regada/concluída/pausada, retorno à cidade, reset, preservação de Canvas e código de colisões (sem recontagem em execução). Conferir imagens com câmera real e desenhar dentro do lote. Revisão independente.
- [x] Salvar relatório e evidências, servir build em4176, manter teste humano frente01 e frente02 pendente; não começar frente03.

