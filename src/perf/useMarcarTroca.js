import { useEffect, useRef } from 'react';
import { marcar } from './sonda.js';

/**
 * M1b — marca na sonda quando `ativo` MUDA (abre/fecha um painel, sai uma
 * pergunta). Não marca na montagem, só na troca. Nome vazio = não marca
 * aquele lado. Sem `?medir=1` a sonda está desligada e nada é registrado.
 */
export function useMarcarTroca(ativo, nomeLigou, nomeDesligou = null) {
  const antes = useRef(ativo);
  useEffect(() => {
    if (antes.current !== ativo) {
      const nome = ativo ? nomeLigou : nomeDesligou;
      if (nome) marcar(nome);
    }
    antes.current = ativo;
  }, [ativo, nomeLigou, nomeDesligou]);
}
