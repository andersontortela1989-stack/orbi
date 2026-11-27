/** Primeira aventura vertical do Órbi. */
export const PARQUE_COM_SEDE = Object.freeze({
  id: 'parque-com-sede',
  titulo: 'O PARQUE ESTÁ COM SEDE',
  bairro: 'PARQUE',
  duracao: 8,
  etapas: [
    {
      id: 'chamado',
      tipo: 'fala',
      texto: 'O guarda do parque chamou a gente. As flores estão com sede!',
      espera: 'toque',
      botao: 'VAMOS AJUDAR!',
    },
    {
      id: 'saber',
      tipo: 'pergunta',
      texto: 'Do que as plantas precisam para viver?',
      opcoes: [
        { id: 'agua', rotulo: 'ÁGUA', emoji: '💧', correta: true },
        { id: 'areia', rotulo: 'AREIA', emoji: '🏖️' },
        { id: 'papel', rotulo: 'PAPEL', emoji: '📄' },
      ],
      reforco: 'Quase! Vamos observar de novo?',
      dica: 'É a água! Ela cai da nuvem e ajuda a planta a crescer.',
    },
    {
      id: 'ir-ao-porto',
      tipo: 'ir_para',
      lugar: 'PORTO',
      texto: 'Vamos ao porto buscar água para as flores.',
      dica: 'O porto fica perto do mar, onde os barcos param.',
      destacarApos: 45,
    },
    {
      id: 'contar-baldes',
      tipo: 'coletar',
      item: 'balde_agua',
      quantidade: 4,
      texto: 'Pegue quatro baldes de água.',
      dica: 'Vamos contar juntos: um, dois, três, quatro.',
    },
    {
      id: 'voltar-ao-parque',
      tipo: 'entregar',
      lugar: 'PARQUE',
      texto: 'Agora leve a água até o parque.',
      dica: 'O parque é o lugar verde, com árvores e espaço para brincar.',
    },
    { id: 'flores-crescem', tipo: 'mundo', flag: 'parque_florido' },
    {
      id: 'premio',
      tipo: 'recompensa',
      itens: ['flor-do-parque', 'regador-no-teto'],
      descobertas: [
        { categoria: 'objetos', id: 'agua' },
        { categoria: 'objetos', id: 'flor-do-parque' },
        { categoria: 'lugares', id: 'PORTO' },
        { categoria: 'lugares', id: 'PARQUE' },
        { categoria: 'contagens', id: '4' },
      ],
    },
    {
      id: 'fecho',
      tipo: 'resumo',
      // H3: as flores crescem quando o resumo fecha (FloresParque), então a
      // fala convida a olhar.
      fala: 'Você cuidou do parque! Vamos ver as flores crescendo?',
      // H3 (g): a ação que o jogo observou, não a habilidade que supõe. A
      // água vale também quando a resposta foi revelada: quem aprendeu foi o
      // Órbi.
      aprendizados: [
        'O Órbi aprendeu que as plantas bebem água.',
        'Você buscou quatro baldes de água.',
        'Você foi ao porto e voltou ao parque.',
      ],
      recompensas: ['ADESIVO: FLOR DO PARQUE', 'ACESSÓRIO: REGADOR'],
    },
  ],
});
