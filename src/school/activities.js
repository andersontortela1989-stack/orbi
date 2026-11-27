export const BANDS = [
  { id:'3-5', label:'3–5 anos', title:'Explorar', emoji:'🌱' },
  { id:'6-7', label:'6–7 anos', title:'Descobrir', emoji:'🔎' },
  { id:'8-10', label:'8–10 anos', title:'Investigar', emoji:'🧭' },
];
export const SUBJECTS = [
  { id:'math', label:'Matemática', emoji:'🔢', description:'Contar, juntar e repartir', color:'blue' },
  { id:'words', label:'Português', emoji:'📖', description:'Sons, palavras e histórias', color:'coral' },
  { id:'history', label:'História e vida', emoji:'🕰️', description:'Antes, agora e nossas lembranças', color:'grass' },
  { id:'arts', label:'Artes', emoji:'🎨', description:'Cores, formas e suas ideias', color:'sun' },
];
const option = (id,label,emoji,extra={}) => ({id:String(id),label,emoji,...extra});
const numbers = (n,pictures=false) => [n-1,n,n+1].map(v=>option(v,String(v),null,pictures?{dots:v}:{}));
const choice = (prompt,options,answer,hint,explanation,extra={}) =>
  ({kind:'choice',prompt,options,answer:String(answer),hint,explanation,...extra});
const order = (prompt,options,answer,hint,explanation) => ({kind:'order',prompt,options,answer,hint,explanation});
const studio = (prompt,hint) => ({kind:'studio',prompt,hint,explanation:'Cada criação pode ser diferente. Adorei conhecer a sua ideia!'});
const activity = (band,subject,title,variants) => ({id:`${band}-${subject}`,band,subject,title,variants});

export const ACTIVITIES = [
  activity('3-5','math','Vamos contar?', [3,4,5].map(n=>choice(
    'Quantas maçãs você vê? Toque no grupo com a mesma quantidade.',numbers(n,true),n,
    'Toque em cada maçã com o dedo e conte devagar. Depois conte as bolinhas.',
    `Temos ${n} maçãs. O grupo com ${n} bolinhas combina com elas!`,
    {visual:Array(n).fill('🍎'),value:n,calculation:{a:n,b:0,op:'+'}},
  ))),
  activity('6-7','math','Juntar e retirar', [
    choice('Havia 2 maçãs. Chegaram mais 3. Quantas ficaram?',numbers(5),5,
      'Conte as duas maçãs e continue contando as outras três.','Duas mais três são cinco!',
      {scene:'🍎🍎 + 🍎🍎🍎',value:5,calculation:{a:2,b:3,op:'+'}}),
    choice('Havia 5 bolas. Duas foram guardadas. Quantas ficaram fora?',numbers(3),3,
      'Comece com cinco dedos. Abaixe dois e conte os que ficaram.','Cinco menos dois são três.',
      {scene:'⚽ ⚽ ⚽ ⚽ ⚽',value:3,calculation:{a:5,b:2,op:'−'}}),
    choice('Há 3 lápis azuis e 3 amarelos. Quantos lápis ao todo?',numbers(6),6,
      'Junte os dois grupos de três.','Três mais três são seis!',
      {scene:'✏️✏️✏️ + ✏️✏️✏️',value:6,calculation:{a:3,b:3,op:'+'}}),
  ]),
  activity('8-10','math','Contas da aventura', [
    choice('Cada caderno custa 2 moedas. Quanto custam 3 cadernos?',numbers(6),6,
      'Some duas moedas para cada caderno: 2 + 2 + 2.','Três grupos de duas moedas formam seis moedas.',
      {scene:'📒 📒 📒',value:6,calculation:{a:3,b:2,op:'×'}}),
    choice('Vamos repartir 12 lápis igualmente entre 4 crianças. Quantos para cada uma?',numbers(3),3,
      'Distribua um lápis por vez para cada criança. Quantas rodadas dá para fazer?',
      'Cada criança recebe três lápis. Quatro grupos de três formam doze.',
      {scene:'✏️ → 🧒 🧒 🧒 🧒',value:3,calculation:{a:12,b:4,op:'÷'}}),
    choice('Você tinha 10 moedas e usou 4 em um livro. Quantas sobraram?',numbers(6),6,
      'Retire quatro das dez moedas.','Dez menos quatro são seis moedas.',
      {scene:'🪙 → 📖',value:6,calculation:{a:10,b:4,op:'−'}}),
  ]),
  activity('3-5','words','Quem faz esse som?', [
    ['miau','gato','🐱'],['au au','cachorro','🐶'],['muuu','vaca','🐮'],
  ].map(([sound,name,emoji])=>choice(
    `Ouça: ${sound}! Qual bichinho faz esse som?`,
    [option('gato','Gato','🐱'),option('cachorro','Cachorro','🐶'),option('vaca','Vaca','🐮')],name,
    `Vamos ouvir de novo: ${sound}. Pense nos bichinhos que você conhece.`,
    `É o ${name}! Vamos brincar com o som: ${sound}!`,{scene:'👂',spoken:`Ouça: ${sound}! Qual bichinho faz esse som?`},
  ))),
  activity('6-7','words','Monte a palavra', [
    ['CASA','🏠','CA','SA','BO'],['BOLA','⚽','BO','LA','PA'],['PATO','🦆','PA','TO','CA'],
  ].map(([word,emoji,first,last,other])=>order(
    `Monte a palavra ${word}. Toque nas sílabas na ordem.`,
    [option(first,first),option(last,last),option(other,other)],[first,last],
    `${word.toLowerCase()} começa com ${first} e termina com ${last}.`,
    `${first} com ${last}: ${word.toLowerCase()}!`,
  )).map((q,i)=>({...q,scene:['🏠','⚽','🦆'][i]}))),
  activity('8-10','words','Uma história curtinha', [
    choice('Onde Lia leu?', [option('praca','Na praça','🌳'),option('praia','Na praia','🏖️'),option('escola','Na escola','🏫')], 'praca',
      'Volte à primeira frase. Ela diz para onde Lia levou o livro.','Lia levou o livro para a praça e leu ali.',
      {passage:'Lia levou um livro para a praça. Ela leu à sombra de uma árvore.'}),
    choice('Por que Davi pegou o guarda-chuva?', [option('chuva','Porque chovia','🌧️'),option('sol','Para guardar um livro','📖'),option('bola','Para jogar bola','⚽')],'chuva',
      'O que Davi viu pela janela?','Ele viu a chuva e pegou o guarda-chuva para sair.',
      {passage:'Davi olhou pela janela e viu a chuva. Antes de sair, pegou seu guarda-chuva.'}),
    choice('O que Nina fez primeiro?', [option('plantou','Plantou','🌱'),option('regou','Regou','💧'),option('colheu','Colheu','🌼')],'plantou',
      'Procure a ação que aparece no começo da história.','Primeiro Nina plantou. Depois regou.',
      {passage:'Nina plantou uma semente. Depois regou a terra. Dias mais tarde, viu um brotinho.'}),
  ]),
  activity('3-5','history','Primeiro e depois', [
    order('Vamos acompanhar uma planta. O que vem primeiro e depois?',
      [option('semente','Semente','🫘'),option('broto','Broto','🌱'),option('flor','Flor','🌻')],['semente','broto','flor'],
      'Primeiro plantamos a semente. Dela pode nascer um broto, que cresce e pode dar uma flor.',
      'Semente, broto e flor: as coisas mudam com o tempo!'),
    order('Vamos fazer um desenho. Coloque os momentos na ordem.',
      [option('folha','Papel em branco','📄'),option('desenhar','Desenhando','🖍️'),option('quadro','Desenho pronto','🖼️')],['folha','desenhar','quadro'],
      'Primeiro pegamos o papel. Depois desenhamos. No fim mostramos a criação.',
      'Papel, desenho e criação pronta. Você organizou os momentos!'),
  ]),
  activity('6-7','history','Objetos contam histórias', [
    choice('Neste par, qual telefone tem uma tela?', [option('disco','Telefone com disco','☎️'),option('tela','Celular com tela','📱')],'tela',
      'Observe o visor. Em qual objeto podemos ver imagens na tela?','O celular tem tela. Telefones de formatos diferentes ajudam a contar histórias de outras épocas.',
      {passage:'A família de Bia guardou um telefone com disco. Bia colocou um celular ao lado para comparar.'}),
    choice('Qual objeto ajuda a guardar uma lembrança da família?', [option('foto','Uma fotografia','📷'),option('bola','Uma bola sem história contada','⚽'),option('colher','Uma colher nova','🥄')],'foto',
      'Qual pode mostrar as pessoas reunidas naquele dia?','Uma fotografia pode registrar um momento. Perguntar a quem estava lá ajuda a entender sua história.',
      {passage:'Na história de Bia, a família quer guardar uma imagem do encontro de hoje.'}),
  ]),
  activity('8-10','history','Investigue as lembranças', [
    choice('O que mudou na praça desta história?', [option('caminho','O caminho','🛤️'),option('arvore','A árvore desapareceu','🌳'),option('lago','Surgiu um lago','🌊')],'caminho',
      'Compare o chão descrito nas duas fotos.','O caminho de terra ganhou piso. As fotografias ajudam a comparar mudanças e permanências.',
      {passage:'Num álbum fictício da cidade, uma foto antiga mostra a praça com caminho de terra e uma árvore. Na foto atual, o caminho tem piso e a mesma árvore continua lá.'}),
    choice('Como investigar a história desta escola?', [option('fontes','Comparar fotos e ouvir relatos','🖼️'),option('chutar','Adivinhar pela cor da parede','🎨'),option('inventar','Inventar uma data','📅')],'fontes',
      'Procure registros e pessoas que possam contar o que viveram.','Fotos e relatos são fontes. Comparar fontes ajuda a investigar o passado, e elas podem deixar perguntas em aberto.',
      {passage:'A turma quer descobrir como era a escola antes. Há fotografias antigas e pessoas que estudaram nela.'}),
  ]),
  activity('3-5','arts','Brincar com cores e formas', [
    studio('Vamos espalhar cores! Escolha uma cor e toque no papel.','Você pode mudar a cor e escolher círculo, quadrado ou triângulo.'),
    studio('Crie um jardim de formas do seu jeito.','Círculos podem virar flores. Triângulos podem lembrar folhas. Você decide!'),
  ]),
  activity('6-7','arts','Descobrir padrões', [
    choice('Azul, amarelo, azul, amarelo… Qual cor continua?',
      [option('blue','Azul',null,{color:'blue'}),option('sun','Amarelo',null,{color:'sun'}),option('coral','Coral',null,{color:'coral'})],'blue',
      'O par azul e amarelo se repete. Depois do amarelo, ele começa de novo.',
      'O azul recomeça o par. Você encontrou um padrão!',{pattern:['blue','sun','blue','sun']}),
    choice('Círculo, quadrado, círculo, quadrado… Qual forma continua?',
      [option('circle','Círculo',null,{shape:'circle'}),option('square','Quadrado',null,{shape:'square'}),option('triangle','Triângulo',null,{shape:'triangle'})],'circle',
      'Veja o par círculo e quadrado. Qual forma começa o par?',
      'O círculo começa novamente. Agora você pode inventar seu próprio padrão!',{scene:'● ■ ● ■ …'}),
  ]),
  activity('8-10','arts','Compor uma imagem', [
    studio('Crie uma praça usando formas e cores.','Experimente repetir uma forma ou destacar uma cor. Sua composição pode contar uma ideia.'),
    studio('Crie duas regiões de cores diferentes na mesma imagem.','Você pode aproximar cores parecidas ou colocar cores diferentes lado a lado e observar o resultado.'),
  ]),
];

export function makeQuestion(activityId,round=0,random=Math.random) {
  const a=ACTIVITIES.find(a=>a.id===activityId);
  if(!a)return null;
  const index=Math.max(0,Math.floor(round))%a.variants.length;
  const q=structuredClone(a.variants[index]);
  if(q.options)for(let i=q.options.length-1;i>0;i--){const j=Math.min(i,Math.floor(Math.max(0,random())*(i+1)));[q.options[i],q.options[j]]=[q.options[j],q.options[i]];}
  return {...q,activityId,variant:index};
}
export function checkAnswer(question,answer) {
  if(!question||question.kind==='studio')return false;
  return Array.isArray(question.answer)
    ? Array.isArray(answer)&&answer.length===question.answer.length&&answer.every((id,i)=>id===question.answer[i])
    : answer===question.answer;
}
export function paintCell(board,index,paint) {
  if(!Number.isInteger(index)||index<0||index>=board.length)return board;
  return board.map((cell,i)=>i===index?{...paint}:cell);
}
