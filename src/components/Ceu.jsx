import { CEUS, useCeuId } from '../ceu.js';
import { useGame } from '../store/useGame.js';

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
  const tranquilo = useGame((s) => s.preferencias.modoTranquilo);
  const fundo = tranquilo ? preset.fundoTranquilo : preset.fundo;
  const fator = tranquilo ? 0.86 : 1;
  return (
    <>
      <color attach="background" args={[fundo]} />
      <fog attach="fog" args={[preset.neblina, 80, 180]} />
      <ambientLight intensity={preset.ambient * fator} />
      <hemisphereLight
        args={[preset.ceuLuz, preset.soloLuz, preset.hemisphere * fator]}
      />
      <directionalLight
        position={[35, 55, 28]}
        color={preset.direcionalCor}
        intensity={preset.directional * fator}
      />
    </>
  );
}
