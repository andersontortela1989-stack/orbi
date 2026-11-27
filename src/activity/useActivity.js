import { useEffect, useSyncExternalStore } from 'react';
import { coordenadorAtividade } from './index.js';

/** Snapshot reativo e estável do coordenador para componentes React. */
export function useActivity() {
  return useSyncExternalStore(
    coordenadorAtividade.assinar,
    coordenadorAtividade.estado,
    coordenadorAtividade.estado
  );
}

/**
 * Liga o ciclo de vida de um domínio existente ao coordenador.
 * StrictMode-safe: pedir foco é idempotente no topo e liberar inexistente é no-op.
 */
export function useRegistrarAtividade(atividade, ativa) {
  const { foco } = useActivity();

  useEffect(() => {
    if (!ativa) {
      coordenadorAtividade.liberar(atividade);
      return undefined;
    }

    coordenadorAtividade.pedirFoco(atividade);
    return () => coordenadorAtividade.liberar(atividade);
  }, [atividade, ativa]);

  // Se a primeira tentativa foi recusada por um painel não interrompível,
  // tenta novamente na próxima troca de foco. Isso mantém o estado do domínio
  // e o coordenador convergentes sem polling nem acoplamento entre painéis.
  useEffect(() => {
    if (ativa && !coordenadorAtividade.estaAtiva(atividade)) {
      coordenadorAtividade.pedirFoco(atividade);
    }
  }, [atividade, ativa, foco]);
}
