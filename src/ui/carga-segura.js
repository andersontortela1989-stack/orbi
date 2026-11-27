import { Component } from 'react';

/**
 * R2 — limite de erro em volta da parte do jogo carregada sob demanda.
 *
 * Sem ele, a falha do GameExperience (arquivo que sumiu depois de uma
 * promoção, rede que caiu) desmontava a árvore inteira e sobrava a tela
 * vazia. O R1 já tenta UMA recarga sozinho; quando ela não resolve, a criança
 * vê a tela calma (<GameLoading falhou />) e um adulto toca em TENTAR DE NOVO.
 *
 * Em .js (sem JSX) para os testes do Node rodarem sem DOM. Estado criado no
 * construtor, não como campo de classe: o campo puxaria um auxiliar do
 * compilador para o pacote inicial (cerca de 170 bytes).
 */
export const TEXTO_FALHA_CARGA = 'A CIDADE AINDA NÃO CHEGOU.';
export const BOTAO_FALHA_CARGA = 'TENTAR DE NOVO';

/** TENTAR DE NOVO: recarrega a página (o clique não passa argumento útil). */
export function tentarDeNovo() {
  location.reload();
}

export class CargaSegura extends Component {
  constructor(props) {
    super(props);
    this.state = { falhou: false };
  }

  static getDerivedStateFromError() {
    return { falhou: true };
  }

  render() {
    return this.state.falhou ? this.props.tela : this.props.children;
  }
}
