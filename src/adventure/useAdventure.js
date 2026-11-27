import { useSyncExternalStore } from 'react';
import { aventuraRuntime } from './runtime.js';

export function useAdventure() {
  return useSyncExternalStore(
    aventuraRuntime.assinar,
    aventuraRuntime.estado,
    aventuraRuntime.estado
  );
}

