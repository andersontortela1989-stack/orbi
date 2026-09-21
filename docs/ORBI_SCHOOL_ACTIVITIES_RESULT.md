# Escola do Órbi — atividades locais

Data: 2026-09-07. Implementação da proposta aprovada na conversa.

## Entrega

Ao aproximar o carro da escola, abre-se o convite “Vamos aprender?”. A criança escolhe com um adulto entre 3–5, 6–7 e 8–10 anos, podendo ajustar a faixa durante a visita. Há quatro cantinhos, sem cronômetro, nota, ranking ou penalidade por tentativa.

| Cantinho | 3–5 | 6–7 | 8–10 |
| --- | --- | --- | --- |
| Matemática | Contar maçãs e comparar grupos | Juntar e retirar | Compras, partilha e troco |
| Português | Reconhecer sons de animais | Ordenar sílabas | Ler histórias curtas |
| História e vida | Organizar primeiro e depois | Comparar objetos e lembranças | Investigar registros e mudanças |
| Artes | Cores e formas livres | Padrões e criação livre | Composição de imagens |

São 12 bases e 30 variações. Escolhas são embaralhadas sem alterar a resposta. Instruções, pistas e explicações usam a voz existente do Órbi. Há “Ouvir novamente”, retentativa e “Outra descoberta”. No ateliê, quatro cores e três formas preenchem 16 espaços; a criança pode desfazer e mostrar a criação ao Órbi. Artes de 6–7 também oferece criação livre.

“Voltar à cidade” fica no cabeçalho fixo. Tab permanece no diálogo e Escape sai. A visita livre preserva a missão; uma chegada que conclui missão aguarda a celebração e avança somente ao sair. O Canvas permanece montado.

## Estado preservado

- Faixa, atividades exploradas e desenhos existem apenas durante a visita. Sair e reentrar recomeça a seleção; nada disso é acrescentado ao caderninho ou às métricas persistidas.
- Save continua v6 com exatamente 11 campos. A descoberta de chegada à escola pela missão mantém o comportamento anterior do jogo.
- Nenhuma mudança em direção, física, câmera, economia, prédios ou exterior aprovado da escola. Comparação SHA-256 com o início desta etapa confirmou preservação dos ajustes anteriores de escola visual, garagem, parque, mobile e Padaria.
- Nos arquivos já existentes, esta etapa altera apenas host contextual, controlador de narração das missões, registry contextual, fechamento na store e uma asserção do teste do registry. Demais arquivos desta entrega são novos e isolados.
- O balão HTML do cachorro fica invisível e sem interceptar toques enquanto a sala está aberta; retorna ao sair.

## Verificação

- Baseline: 43 testes e build aprovados. Final: **50/50 testes** e build aprovado. O aviso preexistente de bundle maior que 500 kB permanece.
- Edge headless: 12 bases com tentativa incorreta/pista, acerto, variação, ordenação/desfazer, arte/desfazer, mudança de faixa, visita e missão. Verificado Canvas idêntico antes/depois, saída da Padaria e ausência de erros JavaScript.
- Tela 640×233: **30/30 variações** respondidas/criadas pela interface; sem transbordamento horizontal. Cabeçalho acessível, conteúdo com rolagem. Também conferidos 740×262, 844×390 e 1366×900.
- Revisão independente encontrou largura excessiva do ateliê em retrato estreito; ferramentas e papel agora se empilham. Medição de 390×844 confirmou overflow horizontal zero. A orientação de gameplay continua deitada, com o OrientationGuard original.
- Narração: chamadas de pergunta, repetição e pista conferidas; pedido atrasado da missão não interrompe a atividade. Síntese real audível ainda precisa ser ouvida no aparelho.
- Preview habitual: build carregado em **http://192.168.100.93:4176/**; teste dirigindo com teclado até o sensor real, respondendo contagem, criando arte e saindo. Sem helper de teleporte em produção e sem erro JavaScript.
- Artefatos finais: `index-D1j6n-YL.js` e `index-u2901Av2.css`.

Evidências em `docs/evidence/school-activities/`: capturas do preview e resultados JSON de navegação e telas compactas.

## Para testar no aparelho

Atualize o endereço habitual na mesma rede, jogue com o celular deitado e aproxime o carro da escola. Toque em “Vamos aprender!”, escolha a faixa e um cantinho. Se estiver levando o cachorro ao parque, conclua a carona primeiro, conforme a prioridade já existente.

A avaliação humana seguinte é ouvir a voz no celular e observar compreensão, conforto e adequação das atividades com crianças. As faixas são pontos de partida ajustáveis; não houve validação curricular formal. Nos celulares mais baixos, é necessário deslizar o conteúdo dentro da sala. As histórias de investigação são exemplos fictícios.

Trabalho local, sem commit, push ou publicação remota. O processo do preview habitual foi preservado.
