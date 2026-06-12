/**
 * Registry central das missões (Fatia 8) — liga cada TIPO de missão ao seu
 * banco de frases. MissionController pergunta aqui e não precisa saber de
 * onde a frase vem (GPS lê de bairros.js; Ciências, do banco de animais).
 *
 * É a "costura" do adendo do currículo (§E): um tipo novo de missão entra
 * adicionando um caso aqui, sem mexer no controlador.
 */
import { FRASE_PEDIDO, FRASE_CHEGADA } from './destinos.js';
import { ANIMAL_POR_SLUG } from './missoes-ciencias.js';
import { frasesDaBusca } from './busca.js';

// Tipo "chegada-viva": lugares cuja chegada abre uma mini-interação
// de aprendizado (estreia: ZOO). O registry só re-exporta — o banco/gerador
// vive em chegadas-vivas.js, e lugares novos entram lá.
export { temChegadaViva, sortearChegadaViva } from './chegadas-vivas.js';

/**
 * Frases de voz da missão ({ pedido, chegada }), ou null se a missão não é
 * reconhecida (tipo desconhecido, destino/animal que não existe mais — ex.:
 * estado persistido de uma versão antiga). O controlador usa o null no boot
 * pra descartar a missão inválida e sortear uma nova.
 */
export function frasesDaMissao(missao) {
  if (!missao) return null;
  if (missao.tipo === 'gps') {
    const pedido = FRASE_PEDIDO[missao.destino];
    if (!pedido) return null;
    return { pedido, chegada: FRASE_CHEGADA[missao.destino] };
  }
  if (missao.tipo === 'ciencias') {
    const animal = ANIMAL_POR_SLUG[missao.animal];
    if (!animal) return null;
    return { pedido: animal.pedido, chegada: animal.chegada };
  }
  // Busca (Frente 5): destino é o slug do BICHO; frases derivadas de
  // city/bichos.js (pista) + banco ANIMAIS (som) em busca.js.
  if (missao.tipo === 'busca') {
    return frasesDaBusca(missao.destino);
  }
  return null;
}

/**
 * Identidade da missão pro controle de narração ("já narrei esta?").
 * No GPS o destino basta; em Ciências o destino é sempre VET, então quem
 * diferencia é o ANIMAL — sem isso, duas missões de bichos diferentes
 * pareceriam a mesma e a segunda ficaria muda.
 */
export function chaveDaMissao(missao) {
  if (!missao?.destino) return null;
  if (missao.tipo === 'ciencias') return `ciencias:${missao.animal}`;
  // prefixo evita colisão teórica entre slug de bicho e slug de prédio
  if (missao.tipo === 'busca') return `busca:${missao.destino}`;
  return missao.destino;
}
