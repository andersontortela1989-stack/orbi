import * as THREE from 'three';
import { PALETA_REAL } from './paleta.js';

/**
 * Materiais do ESTILO REAL, UMA instância de cada, compartilhada pelos prédios
 * (PredioReal) e pela rua (RuaReal): a cor vem dos vértices, então um material
 * serve para todas as peças opacas — e nenhum programa de shader novo nasce
 * quando um lugar novo entra no estilo real.
 */
export const MATERIAL_OPACO = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.85,
  metalness: 0,
});

// Contorno fino (V1.2b): cascas pelo avesso, na cor escura da paleta (não
// preto), como o traço do Building.
export const MATERIAL_CONTORNO = new THREE.MeshBasicMaterial({
  color: PALETA_REAL.contorno,
  side: THREE.BackSide,
});
