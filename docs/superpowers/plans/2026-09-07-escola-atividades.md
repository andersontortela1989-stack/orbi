# Escola do Órbi — Implementation Plan

> Implementação em sequência com executing-plans; revisão independente ao final conforme requesting-code-review. Proposta de 12 atividades aprovada pelo usuário nesta conversa.

**Goal:** Visita à escola com convite, faixa ajustável, quatro cantinhos, 12 atividades-base e criação livre.

**Architecture:** Ampliar o registry contextual existente com tipo específico da escola; manter conclusão da padaria separada. Conteúdo puro por faixa/área, apresentação isolada e progresso apenas local à visita. Nenhuma migração de save ou métrica pedagógica nova.

**Tech Stack:** React, Zustand e testes Node já instalados; CSS/SVG e fala existente do Órbi.

**Spec:** Proposta aprovada na conversa: matemática, português, história e vida, artes para 3–5, 6–7, 8–10; instruções narradas, pistas, repetir, tentar novamente e voltar à cidade.

## Restrições

- Trabalhar no checkout autorizado Cidade-Turbo-3D, preservando a revisão visual e os ajustes anteriores.
- Não alterar direção, física, câmera, dados dos prédios, economia, save v6 ou os 11 campos persistidos.
- Faixa é ponto de partida escolhido com responsável, ajustável. Não inferir idade ou capacidade. Sem cadastro ou data de nascimento.
- Nenhum cronômetro, punição, ranking, nota ou alegação de alinhamento curricular formal.
- Contagem e respostas derivam dos dados apresentados; histórias de exemplo são ficcionais e não inventam fatos históricos.
- Entrada e saída mantêm a missão anterior em exploração; saída após missão completa avança uma única vez.
- Sem commit/push/deploy remoto neste trabalho.

## Etapas

- [x] Testar e implementar registry/fechamento da escola, mantendo rejeição de tipos desconhecidos e os contratos da padaria.
- [x] Testar e implementar 12 atividades-base com variações: contar, juntar/retirar, compras/partilha; sons/imagens, sílabas, leitura; sequência temporal, objetos antes/hoje, interpretação de registros; formas/cores, padrões, composição livre.
- [x] Implementar convite, seleção de faixa, menu, atividades de escolha/ordenação, pistas, voz, retorno e ateliê com desfazer.
- [x] Integrar host e evitar narração de missão durante atividades; manter Canvas montado.
- [x] Executar testes/build e conferir no navegador: 12 bases, variação, erro/pista, acerto, arte/desfazer, troca de faixa, sair/reentrar, exploração/missão e telas baixas.
- [x] Registrar resultados e limites, disponibilizar no preview habitual para teste humano. Voz efetiva e adequação pedagógica dependem de avaliação humana.
