import { useEffect, useMemo } from 'react';
import { useGame } from '../store/useGame.js';
import { perfilVisual } from '../visual/world-style.js';
import { geometriaDe } from '../visual/geometria-mesclada.js';
import { malhasDaRua } from '../visual/estilo-real/rua.js';
import { MATERIAL_CONTORNO, MATERIAL_OPACO } from '../visual/estilo-real/materiais.js';

/**
 * Rua entre a PADARIA e o MERCADO no ESTILO REAL (V1.3, `?estilo=real`):
 * meio-fio, calçada contínua, postes, árvores em canteiro e lixeira — fora do
 * leito (o dado e o teste estão em visual/estilo-real/rua.js).
 *
 * 4 chamadas: base (meio-fio, calçadas, postes) e extra (árvores e lixeira),
 * cada um com o seu contorno. O Modo Tranquilo esconde o grupo extra; nada é
 * animado. Sem colisor: mobiliário segue a regra das árvores da cidade.
 */
export function RuaReal() {
  const geo = useMemo(() => {
    const m = malhasDaRua();
    return {
      base: geometriaDe(m.base),
      baseContorno: geometriaDe(m.baseContorno),
      extra: geometriaDe(m.extra),
      extraContorno: geometriaDe(m.extraContorno),
    };
  }, []);
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);

  const preferencias = useGame((s) => s.preferencias);
  const { tranquilo } = perfilVisual(preferencias);

  return (
    <group>
      <mesh geometry={geo.baseContorno} material={MATERIAL_CONTORNO} />
      <mesh geometry={geo.base} material={MATERIAL_OPACO} />
      {!tranquilo && (
        <>
          <mesh geometry={geo.extraContorno} material={MATERIAL_CONTORNO} />
          <mesh geometry={geo.extra} material={MATERIAL_OPACO} />
        </>
      )}
    </group>
  );
}
