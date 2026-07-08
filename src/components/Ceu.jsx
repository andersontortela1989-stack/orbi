import { CEUS, useCeuId } from '../ceu.js';

/**
 * CÉU (3D) — aplica o preset de hora do dia ao mundo, num lugar só: cor de
 * fundo + fog + as duas luzes. Antes o fundo/fog viviam no App e as luzes no
 * Game; centralizados aqui pra trocar todos juntos, no toque, sem re-render do
 * Game/Physics (só este componente re-renderiza quando o céu muda).
 *
 * Montado como filho direto do <Canvas> (attach de scene funciona em qualquer
 * profundidade). A posição do directional é fixa (só a intensidade muda) — a
 * direção da sombra SÓLIDA do mundo é constante da marca (SOMBRA_SOLIDA).
 */
export function Ceu() {
  const preset = CEUS[useCeuId()];
  return (
    <>
      <color attach="background" args={[preset.fundo]} />
      <fog attach="fog" args={[preset.neblina, 80, 180]} />
      <ambientLight intensity={preset.ambient} />
      <directionalLight position={[30, 50, 20]} intensity={preset.directional} />
    </>
  );
}
