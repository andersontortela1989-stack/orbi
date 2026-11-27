import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * Pré-compila os programas de shader de TUDO o que já está na cena, durante a
 * carga da cidade (fatia V1, estilo real). Os materiais novos do estilo real
 * (cor por vértice, vitrine acesa, pães sem contorno) compilariam na primeira
 * vez que aparecessem — um pico de quadro justamente quando a criança chega à
 * PADARIA. Aqui o custo vai para a carga, que já é uma espera.
 *
 * Montado DEPOIS da cidade no mesmo pai: o efeito roda quando os objetos já
 * estão na cena. Só existe com `?estilo=real` (o estilo atual fica intacto).
 */
export function PreCompilar() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    gl.compile(scene, camera);
  }, [gl, scene, camera]);

  return null;
}
