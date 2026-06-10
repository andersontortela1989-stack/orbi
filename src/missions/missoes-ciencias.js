/**
 * Banco FIXO de missões de Ciências (Fatia 8) — "leve o animal ao VET".
 *
 * O conteúdo pedagógico é o próprio animal: o Órbi não conhece os bichos da
 * Terra, então cada missão APRESENTA um animal pelo nome e pelo som que faz
 * ("um gato! Ele faz miau!"), e a chegada ensina de volta — o Órbi aprende o
 * que é o VET e repete o animal (reforço duplo). A conclusão registra a
 * habilidade `cienciasVida` (adendo do currículo, §F).
 *
 * Padrão das frases (aprovado pelo Anderson): curto, uma ideia por frase —
 *   pedido:  "Olha, um gato! Ele faz miau! Tá dodói… me leva no vet?"
 *   chegada: "Uau! Então vet é o médico dos animais! O gato vai ficar bom!"
 * Frases de VOZ em minúsculas: alguns TTS soletram palavras em CAIXA ALTA
 * (mesmo motivo do nomeParaVoz em voz.js). A CAIXA ALTA fica no HUD/letreiro.
 *
 * Como o banco do GPS (destinos.js), é consumido por interface (sortearAnimal,
 * ANIMAL_POR_SLUG) e não lido direto do array — costura pronta pra trocar o
 * banco fixo por geração via IA no futuro sem tocar no resto do jogo (§E).
 */

export const ANIMAIS = [
  {
    slug: 'CACHORRO',
    emoji: '🐶',
    pedido: 'Olha, um cachorro! Ele faz au au! Tá dodói… me leva no vet?',
    chegada: 'Uau! Então vet é o médico dos animais! O cachorro vai ficar bom!',
  },
  {
    slug: 'GATO',
    emoji: '🐱',
    pedido: 'Olha, um gato! Ele faz miau! Tá dodói… me leva no vet?',
    chegada: 'Uau! Então vet é o médico dos animais! O gato vai ficar bom!',
  },
  {
    slug: 'VACA',
    emoji: '🐮',
    pedido: 'Olha, uma vaca! Ela faz muu! Tá dodói… me leva no vet?',
    chegada: 'Uau! Então vet é o médico dos animais! A vaca vai ficar boa!',
  },
  {
    slug: 'PATO',
    emoji: '🦆',
    pedido: 'Olha, um pato! Ele faz quá quá! Tá dodói… me leva no vet?',
    chegada: 'Uau! Então vet é o médico dos animais! O pato vai ficar bom!',
  },
  {
    slug: 'GALINHA',
    emoji: '🐔',
    pedido: 'Olha, uma galinha! Ela faz có có! Tá dodói… me leva no vet?',
    chegada: 'Uau! Então vet é o médico dos animais! A galinha vai ficar boa!',
  },
];

/** Busca por slug (HUD usa o emoji; o registry usa pedido/chegada). */
export const ANIMAL_POR_SLUG = Object.fromEntries(
  ANIMAIS.map((a) => [a.slug, a])
);

/**
 * Sorteia o slug de um animal, evitando repetir o último (variedade
 * percebida — mesma regra do sorteio de destinos do GPS).
 */
export function sortearAnimal(ultimoSlug) {
  const candidatos = ANIMAIS.filter((a) => a.slug !== ultimoSlug);
  const sorteado =
    candidatos[Math.floor(Math.random() * candidatos.length)] ?? ANIMAIS[0];
  return sorteado.slug;
}
