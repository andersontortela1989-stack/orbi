import { useRef } from 'react';
import { Grid } from '@react-three/drei';
import { Car } from './Car.jsx';
import { Ground } from './Ground.jsx';
import { CameraFollow } from './CameraFollow.jsx';

export function Game() {
  const carRef = useRef(null);

  return (
    <>
      {/* Iluminação: ambiente baixo + direcional única para definir formas */}
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[30, 50, 20]}
        intensity={1.3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-near={0.5}
        shadow-camera-far={200}
        shadow-bias={-0.0005}
      />

      <Ground />

      {/* Grade de referência: torna velocidade e derrapagem perceptíveis no plano vazio */}
      <Grid
        position={[0, 0.01, 0]}
        args={[200, 200]}
        cellSize={2}
        cellThickness={0.5}
        cellColor="#3f4248"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#5a5d65"
        fadeDistance={120}
        fadeStrength={1}
        infiniteGrid
      />

      <Car rigidBodyRef={carRef} />
      <CameraFollow targetRef={carRef} />
    </>
  );
}
