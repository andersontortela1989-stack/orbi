import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { PALETA3D, SOMBRA_SOLIDA, TINTAS } from '../brand/paleta3d.js';
import { CALCADA_EXTRA } from '../city/geometria.js';
import { SHOPPING_LAYOUT } from '../city/shopping.js';
import { useGame } from '../store/useGame.js';
import { perfilVisual } from '../visual/world-style.js';

const TRACO = 0.2;

const BOLINHAS = Object.freeze([
  [-0.95, -0.8, TINTAS.coral], [-0.3, -0.85, TINTAS.sun], [0.35, -0.75, TINTAS.blue], [0.95, -0.8, TINTAS.grass],
  [-0.85, -0.15, TINTAS.sun], [-0.2, -0.2, TINTAS.violet], [0.45, -0.1, TINTAS.coral], [0.95, -0.15, TINTAS.blue],
  [-0.9, 0.55, TINTAS.blue], [-0.25, 0.5, TINTAS.grass], [0.4, 0.6, TINTAS.sun], [0.9, 0.5, TINTAS.coral],
  [-0.55, 0.18, TINTAS.white], [0.1, 0.22, TINTAS.coral], [0.7, 0.18, TINTAS.grass],
]);

function Claraboia({ w, l, brilho }) {
  const { w: cw, l: cl, y, nervurasX, nervurasZ } = SHOPPING_LAYOUT.claraboia;
  return (
    <group>
      <mesh position={[0, 8.15, 0]}>
        <boxGeometry args={[w + 0.7, 0.36, l + 0.7]} />
        <meshStandardMaterial color={TINTAS.violetDeep} roughness={0.68} />
      </mesh>
      <mesh position={[0, 8.38, 0]}>
        <boxGeometry args={[w - 1.2, 0.2, l - 1.2]} />
        <meshStandardMaterial color={TINTAS.violetSoft} roughness={0.75} />
      </mesh>
      <mesh position={[0, y + 0.24, 0]}>
        <boxGeometry args={[cw + 0.5, 0.36, cl + 0.5]} />
        <meshStandardMaterial color={TINTAS.violetDeep} roughness={0.55} />
      </mesh>
      <mesh position={[0, y + 0.44, 0]}>
        <boxGeometry args={[cw, 0.14, cl]} />
        <meshStandardMaterial
          color={TINTAS.blueSoft}
          emissive={TINTAS.sky}
          emissiveIntensity={Math.max(0.18, brilho * 0.6)}
          roughness={0.22}
        />
      </mesh>
      {nervurasX.map((nx) => (
        <mesh key={'nx_' + nx} position={[nx, y + 0.54, 0]}>
          <boxGeometry args={[0.18, 0.1, cl + 0.1]} />
          <meshStandardMaterial color={TINTAS.ink} roughness={0.5} />
        </mesh>
      ))}
      {nervurasZ.map((nz) => (
        <mesh key={'nz_' + nz} position={[0, y + 0.54, nz]}>
          <boxGeometry args={[cw + 0.1, 0.1, 0.18]} />
          <meshStandardMaterial color={TINTAS.ink} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function FachadasLojas({ w, l, brilho }) {
  return (
    <group>
      {[-11.3, -6.8, -2.7, 2.7, 6.8, 11.3].map((px) => (
        <mesh key={'pf_' + px} position={[px, 4.0, l / 2 + 0.08]}>
          <boxGeometry args={[0.38, 7.6, 0.22]} />
          <meshStandardMaterial color={TINTAS.violetSoft} roughness={0.7} />
        </mesh>
      ))}

      {SHOPPING_LAYOUT.lojasFrente.map((loja) => (
        <group key={loja.id} position={[loja.x, loja.y, l / 2 + 0.06]}>
          <mesh>
            <boxGeometry args={[loja.w + 0.26, loja.h + 0.26, 0.14]} />
            <meshBasicMaterial color={TINTAS.violetDeep} />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <boxGeometry args={[loja.w, loja.h, 0.08]} />
            <meshStandardMaterial
              color={loja.vitrine}
              emissive={loja.vitrine}
              emissiveIntensity={brilho}
              roughness={0.28}
            />
          </mesh>
          <mesh position={[0, loja.h / 2 + 0.22, 0.42]} rotation={[0.28, 0, 0]}>
            <boxGeometry args={[loja.w + 0.32, 0.18, 0.78]} />
            <meshStandardMaterial color={loja.toldo} roughness={0.55} />
          </mesh>
        </group>
      ))}

      {SHOPPING_LAYOUT.lojasLateral.map((loja) => (
        <group key={loja.id} position={[w / 2 + 0.06, loja.y, loja.z]}>
          <mesh>
            <boxGeometry args={[0.14, loja.h + 0.26, loja.l + 0.26]} />
            <meshBasicMaterial color={TINTAS.violetDeep} />
          </mesh>
          <mesh position={[0.08, 0, 0]}>
            <boxGeometry args={[0.08, loja.h, loja.l]} />
            <meshStandardMaterial
              color={loja.vitrine}
              emissive={loja.vitrine}
              emissiveIntensity={brilho}
              roughness={0.28}
            />
          </mesh>
          <mesh position={[0.4, loja.h / 2 + 0.22, 0]} rotation={[0, 0, -0.28]}>
            <boxGeometry args={[0.76, 0.18, loja.l + 0.3]} />
            <meshStandardMaterial color={loja.toldo} roughness={0.55} />
          </mesh>
        </group>
      ))}

      {/* Entrada principal (+Z): portas de vidro + marquise + placa SHOPPING */}
      <group position={[0, 0, l / 2]}>
        <mesh position={[0, 1.55, 0.1]}>
          <boxGeometry args={[4.6, 2.9, 0.22]} />
          <meshStandardMaterial color={TINTAS.violetDeep} roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.5, 0.22]}>
          <boxGeometry args={[3.9, 2.5, 0.08]} />
          <meshStandardMaterial
            color={TINTAS.blueSoft}
            emissive={TINTAS.sky}
            emissiveIntensity={Math.max(0.2, brilho * 0.7)}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 1.5, 0.28]}>
          <boxGeometry args={[0.14, 2.5, 0.08]} />
          <meshBasicMaterial color={TINTAS.ink} />
        </mesh>

        <mesh position={[0, 3.25, 1.1]}>
          <boxGeometry args={[6.0, 0.34, 2.2]} />
          <meshStandardMaterial color={TINTAS.sun} roughness={0.5} />
        </mesh>
        <mesh position={[0, 3.44, 1.1]}>
          <boxGeometry args={[6.2, 0.12, 2.34]} />
          <meshStandardMaterial color={TINTAS.violetDeep} roughness={0.6} />
        </mesh>
        {[-2.5, 2.5].map((cx) => (
          <mesh key={'col_' + cx} position={[cx, 1.65, 1.95]}>
            <cylinderGeometry args={[0.15, 0.18, 3.1, 10]} />
            <meshStandardMaterial color={TINTAS.white} roughness={0.6} />
          </mesh>
        ))}

        <group position={[0, 6.95, 0.34]}>
          <mesh position={[0, 0, -0.06]}>
            <boxGeometry args={[8.4, 2.1, 0.22]} />
            <meshBasicMaterial color={TINTAS.violetDeep} />
          </mesh>
          <mesh>
            <boxGeometry args={[8.0, 1.72, 0.22]} />
            <meshStandardMaterial color={TINTAS.sun} emissive={TINTAS.sun} emissiveIntensity={0.1} roughness={0.5} />
          </mesh>
          <Text
            position={[0, 0, 0.14]}
            fontSize={1.12}
            color={TINTAS.ink}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.05}
            fontWeight={700}
          >
            SHOPPING
          </Text>
        </group>
      </group>
    </group>
  );
}

function AreaKids({ detalhes }) {
  const { x, z, w, l, pulaPula, castelinho, piscinaBolinhas, escorregador, bancos } =
    SHOPPING_LAYOUT.areaKids;
  const postesPula = [0, 1, 2, 3, 4, 5].map((i) => {
    const ang = (i / 6) * Math.PI * 2;
    return [Math.cos(ang) * (pulaPula.raio - 0.08), Math.sin(ang) * (pulaPula.raio - 0.08)];
  });

  return (
    <group position={[x, 0, z]}>
      {/* Base emborrachada colorida */}
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[w + 0.5, 0.14, l + 0.5]} />
        <meshStandardMaterial color={TINTAS.violetDeep} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[w, 0.08, l]} />
        <meshStandardMaterial color={PALETA3D.copa} roughness={0.85} />
      </mesh>
      {/* Tapetes emborrachados em setores */}
      <mesh position={[-2.0, 0.2, -2.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.2, 4.6]} />
        <meshBasicMaterial color={TINTAS.sky} />
      </mesh>
      <mesh position={[2.0, 0.2, 2.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.2, 4.4]} />
        <meshBasicMaterial color="#FFE9A8" />
      </mesh>

      {/* Cercadinho colorido baixo ao redor (aberto na frente) */}
      <mesh position={[0, 0.42, -l / 2 + 0.12]}>
        <boxGeometry args={[w, 0.45, 0.18]} />
        <meshStandardMaterial color={TINTAS.sun} roughness={0.6} />
      </mesh>
      <mesh position={[-w / 2 + 0.12, 0.42, 0]}>
        <boxGeometry args={[0.18, 0.45, l]} />
        <meshStandardMaterial color={TINTAS.blue} roughness={0.6} />
      </mesh>
      <mesh position={[w / 2 - 0.12, 0.42, 0]}>
        <boxGeometry args={[0.18, 0.45, l]} />
        <meshStandardMaterial color={TINTAS.coral} roughness={0.6} />
      </mesh>

      {/* 1. PULA-PULA (cama elástica com aro, lona e rede) */}
      <group position={[pulaPula.x, 0.19, pulaPula.z]}>
        {/* Pés */}
        {[0, 1, 2, 3].map((i) => {
          const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
          return (
            <mesh key={i} position={[Math.cos(ang) * 1.35, 0.32, Math.sin(ang) * 1.35]}>
              <cylinderGeometry args={[0.07, 0.07, 0.64, 8]} />
              <meshStandardMaterial color={TINTAS.inkSoft} roughness={0.6} />
            </mesh>
          );
        })}
        {/* Borda acolchoada azul + lona central */}
        <mesh position={[0, 0.64, 0]}>
          <cylinderGeometry args={[pulaPula.raio, pulaPula.raio, 0.2, 20]} />
          <meshStandardMaterial color={TINTAS.blue} roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.76, 0]}>
          <cylinderGeometry args={[pulaPula.raio - 0.34, pulaPula.raio - 0.34, 0.06, 20]} />
          <meshStandardMaterial color={TINTAS.ink} roughness={0.85} />
        </mesh>
        {/* Escadinha frontal */}
        <mesh position={[0, 0.34, pulaPula.raio + 0.15]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[0.65, 0.72, 0.14]} />
          <meshStandardMaterial color={TINTAS.sun} roughness={0.6} />
        </mesh>
        {/* Postes e aro superior da rede de proteção */}
        {postesPula.map(([px, pz], i) => (
          <mesh key={i} position={[px, 1.48, pz]}>
            <cylinderGeometry args={[0.055, 0.055, 1.65, 6]} />
            <meshStandardMaterial color={TINTAS.sun} roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[0, 2.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[pulaPula.raio - 0.08, 0.07, 8, 24]} />
          <meshStandardMaterial color={TINTAS.coral} roughness={0.5} />
        </mesh>
        {detalhes && (
          <mesh position={[0, 1.48, 0]}>
            <cylinderGeometry args={[pulaPula.raio - 0.1, pulaPula.raio - 0.1, 1.5, 18, 1, true]} />
            <meshBasicMaterial color={TINTAS.white} transparent opacity={0.22} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>

      {/* 2. CASTELINHO INFLÁVEL COLORIDO */}
      <group position={[castelinho.x, 0.19, castelinho.z]}>
        {/* Colchão de base */}
        <mesh position={[0, 0.36, 0]}>
          <boxGeometry args={[castelinho.w, 0.72, castelinho.l]} />
          <meshStandardMaterial color={TINTAS.sun} roughness={0.55} />
        </mesh>
        {/* Paredes laterais e fundo */}
        <mesh position={[0, 1.1, -castelinho.l / 2 + 0.24]}>
          <boxGeometry args={[castelinho.w, 0.9, 0.48]} />
          <meshStandardMaterial color={TINTAS.coral} roughness={0.55} />
        </mesh>
        <mesh position={[-castelinho.w / 2 + 0.24, 1.1, 0]}>
          <boxGeometry args={[0.48, 0.9, castelinho.l]} />
          <meshStandardMaterial color={TINTAS.blue} roughness={0.55} />
        </mesh>
        <mesh position={[castelinho.w / 2 - 0.24, 1.1, 0]}>
          <boxGeometry args={[0.48, 0.9, castelinho.l]} />
          <meshStandardMaterial color={TINTAS.blue} roughness={0.55} />
        </mesh>
        {/* 4 torres de canto com cones coloridos */}
        {[-1, 1].map((sx) =>
          [-1, 1].map((sz) => (
            <group key={sx + '_' + sz} position={[sx * (castelinho.w / 2 - 0.32), 0, sz * (castelinho.l / 2 - 0.32)]}>
              <mesh position={[0, 1.35, 0]}>
                <cylinderGeometry args={[0.34, 0.38, 2.3, 10]} />
                <meshStandardMaterial color={sx === sz ? TINTAS.coral : TINTAS.violet} roughness={0.5} />
              </mesh>
              <mesh position={[0, 2.72, 0]}>
                <coneGeometry args={[0.46, 0.72, 10]} />
                <meshStandardMaterial color={TINTAS.sun} roughness={0.5} />
              </mesh>
            </group>
          ))
        )}
        {/* Rampinha frontal de entrada */}
        <mesh position={[0, 0.22, castelinho.l / 2 + 0.34]} rotation={[0.38, 0, 0]}>
          <boxGeometry args={[1.35, 0.24, 0.9]} />
          <meshStandardMaterial color={TINTAS.coral} roughness={0.55} />
        </mesh>
      </group>

      {/* 3. PISCINA DE BOLINHAS */}
      <group position={[piscinaBolinhas.x, 0.19, piscinaBolinhas.z]}>
        {/* Paredes acolchoadas */}
        <mesh position={[0, 0.34, -piscinaBolinhas.l / 2 + 0.16]}>
          <boxGeometry args={[piscinaBolinhas.w, 0.68, 0.32]} />
          <meshStandardMaterial color={TINTAS.coral} roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.34, piscinaBolinhas.l / 2 - 0.16]}>
          <boxGeometry args={[piscinaBolinhas.w, 0.68, 0.32]} />
          <meshStandardMaterial color={TINTAS.coral} roughness={0.55} />
        </mesh>
        <mesh position={[-piscinaBolinhas.w / 2 + 0.16, 0.34, 0]}>
          <boxGeometry args={[0.32, 0.68, piscinaBolinhas.l]} />
          <meshStandardMaterial color={TINTAS.sun} roughness={0.55} />
        </mesh>
        <mesh position={[piscinaBolinhas.w / 2 - 0.16, 0.34, 0]}>
          <boxGeometry args={[0.32, 0.68, piscinaBolinhas.l]} />
          <meshStandardMaterial color={TINTAS.sun} roughness={0.55} />
        </mesh>
        {/* Fundo */}
        <mesh position={[0, 0.14, 0]}>
          <boxGeometry args={[piscinaBolinhas.w - 0.4, 0.18, piscinaBolinhas.l - 0.4]} />
          <meshStandardMaterial color={TINTAS.blueSoft} roughness={0.7} />
        </mesh>
        {/* Bolinhas coloridas */}
        {BOLINHAS.map(([bx, bz, cor], idx) => (
          <mesh key={idx} position={[bx, 0.42 + (idx % 2) * 0.08, bz]}>
            <sphereGeometry args={[0.24, 8, 8]} />
            <meshStandardMaterial color={cor} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* 4. ESCORREGADOR INFANTIL */}
      <group position={[escorregador.x, 0.19, escorregador.z]}>
        {/* Plataforma superior + pilares */}
        <mesh position={[0, 1.35, -0.8]}>
          <boxGeometry args={[1.15, 0.18, 1.05]} />
          <meshStandardMaterial color={TINTAS.sun} roughness={0.55} />
        </mesh>
        {[-0.45, 0.45].map((px) =>
          [-1.2, -0.4].map((pz) => (
            <mesh key={px + '_' + pz} position={[px, 0.68, pz]}>
              <boxGeometry args={[0.14, 1.36, 0.14]} />
              <meshStandardMaterial color={TINTAS.coral} roughness={0.6} />
            </mesh>
          ))
        )}
        {/* Rampa azul */}
        <mesh position={[0, 0.72, 0.55]} rotation={[0.56, 0, 0]}>
          <boxGeometry args={[0.92, 0.14, 2.35]} />
          <meshStandardMaterial color={TINTAS.blue} roughness={0.4} />
        </mesh>
        {/* Laterais da rampa */}
        {[-0.48, 0.48].map((rx) => (
          <mesh key={rx} position={[rx, 0.84, 0.55]} rotation={[0.56, 0, 0]}>
            <boxGeometry args={[0.1, 0.24, 2.35]} />
            <meshStandardMaterial color={TINTAS.sun} roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* Banquinhos para os pais acompanharem */}
      {bancos.map((b) => (
        <group key={b.id} position={[b.x, 0.19, b.z]}>
          <mesh position={[0, 0.34, 0]}>
            <boxGeometry args={[1.6, 0.14, 0.52]} />
            <meshStandardMaterial color={TINTAS.sun} roughness={0.65} />
          </mesh>
          <mesh position={[-0.62, 0.16, 0]}>
            <boxGeometry args={[0.14, 0.32, 0.44]} />
            <meshStandardMaterial color={TINTAS.inkSoft} roughness={0.7} />
          </mesh>
          <mesh position={[0.62, 0.16, 0]}>
            <boxGeometry args={[0.14, 0.32, 0.44]} />
            <meshStandardMaterial color={TINTAS.inkSoft} roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function EstacionamentoShopping() {
  const { x, z, w, l, vagas, carros, cancela } = SHOPPING_LAYOUT.estacionamento;
  const passoVaga = (l - 1.2) / vagas;
  const inicioZ = -l / 2 + 0.6;

  return (
    <group>
      <group position={[x, 0, z]}>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[w + 0.45, 0.12, l + 0.45]} />
          <meshStandardMaterial color={TINTAS.violetDeep} roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.13, 0]}>
          <boxGeometry args={[w, 0.08, l]} />
          <meshStandardMaterial color={PALETA3D.asfalto} roughness={0.9} />
        </mesh>

        {Array.from({ length: vagas + 1 }).map((_, i) => {
          const linhaZ = inicioZ + i * passoVaga;
          return (
            <mesh key={i} position={[0.45, 0.18, linhaZ]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[w - 1.5, 0.1]} />
              <meshBasicMaterial color={TINTAS.white} />
            </mesh>
          );
        })}

        {carros.map((c) => {
          const carroZ = inicioZ + (c.vaga + 0.5) * passoVaga;
          return (
            <group key={c.vaga} position={[0.55, 0.17, carroZ]}>
              <mesh position={[0, 0.34, 0]}>
                <boxGeometry args={[2.1, 0.5, 1.15]} />
                <meshStandardMaterial color={c.cor} roughness={0.55} />
              </mesh>
              <mesh position={[0.12, 0.72, 0]}>
                <boxGeometry args={[1.1, 0.38, 0.96]} />
                <meshStandardMaterial color={TINTAS.ink} roughness={0.45} />
              </mesh>
              {[-0.65, 0.65].map((rx) =>
                [-0.58, 0.58].map((rz) => (
                  <mesh key={rx + '_' + rz} position={[rx, 0.18, rz]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.18, 0.18, 0.14, 10]} />
                    <meshStandardMaterial color={TINTAS.ink} roughness={0.8} />
                  </mesh>
                ))
              )}
            </group>
          );
        })}
      </group>

      <group position={[cancela.x, 0.1, cancela.z]}>
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[1.1, 1.4, 1.1]} />
          <meshStandardMaterial color={TINTAS.white} roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.58, 0]}>
          <boxGeometry args={[1.35, 0.2, 1.35]} />
          <meshStandardMaterial color={TINTAS.violetDeep} roughness={0.6} />
        </mesh>
        <mesh position={[1.45, 0.92, 0]} rotation={[0, 0, 0.12]}>
          <boxGeometry args={[2.1, 0.12, 0.12]} />
          <meshStandardMaterial color={TINTAS.coral} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

function PracaExterna({ detalhes }) {
  const { faixaPedestres, floreiras, guardaSois, totem } = SHOPPING_LAYOUT.praca;
  const passoTira = faixaPedestres.w / faixaPedestres.tiras;

  return (
    <group>
      <group position={[faixaPedestres.x, 0.04, faixaPedestres.z]}>
        {Array.from({ length: faixaPedestres.tiras }).map((_, i) => {
          const tx = -faixaPedestres.w / 2 + passoTira * (i + 0.5);
          return (
            <mesh key={i} position={[tx, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[passoTira * 0.55, faixaPedestres.l]} />
              <meshBasicMaterial color={TINTAS.white} />
            </mesh>
          );
        })}
      </group>

      {floreiras.map((fl) => (
        <group key={fl.id} position={[fl.x, 0.18, fl.z]}>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[2.2, 0.5, 0.95]} />
            <meshStandardMaterial color={TINTAS.blueSoft} roughness={0.75} />
          </mesh>
          <mesh position={[-0.5, 0.68, 0]}>
            <icosahedronGeometry args={[0.45, 1]} />
            <meshStandardMaterial color={PALETA3D.copa} roughness={0.8} />
          </mesh>
          <mesh position={[0.5, 0.65, 0]}>
            <icosahedronGeometry args={[0.42, 1]} />
            <meshStandardMaterial color={PALETA3D.copaEscura} roughness={0.8} />
          </mesh>
        </group>
      ))}

      <group position={[totem.x, 0.1, totem.z]}>
        <mesh position={[0, 1.9, 0]}>
          <boxGeometry args={[0.9, 3.6, 0.45]} />
          <meshStandardMaterial color={TINTAS.violetDeep} roughness={0.6} />
        </mesh>
        <mesh position={[0, 3.1, 0.25]}>
          <boxGeometry args={[0.68, 0.68, 0.08]} />
          <meshStandardMaterial color={TINTAS.sun} roughness={0.5} />
        </mesh>
        <mesh position={[0, 2.2, 0.25]}>
          <boxGeometry args={[0.68, 0.48, 0.08]} />
          <meshStandardMaterial color={TINTAS.coral} roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.5, 0.25]}>
          <boxGeometry args={[0.68, 0.48, 0.08]} />
          <meshStandardMaterial color={TINTAS.blue} roughness={0.5} />
        </mesh>
      </group>

      {detalhes && guardaSois.map((g) => (
        <group key={g.id} position={[g.x, 0.08, g.z]}>
          <mesh position={[0, 0.48, 0]}>
            <cylinderGeometry args={[0.72, 0.72, 0.1, 14]} />
            <meshStandardMaterial color={TINTAS.white} roughness={0.65} />
          </mesh>
          <mesh position={[0, 0.95, 0]}>
            <cylinderGeometry args={[0.07, 0.08, 1.85, 8]} />
            <meshStandardMaterial color={TINTAS.inkSoft} roughness={0.6} />
          </mesh>
          <mesh position={[0, 1.88, 0]}>
            <coneGeometry args={[1.12, 0.46, 8]} />
            <meshStandardMaterial color={g.cor} roughness={0.55} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function OpenShopping({ floorPos }) {
  const [x, z] = floorPos;
  const [w, h, l] = SHOPPING_LAYOUT.size;
  const preferencias = useGame((s) => s.preferencias);
  const visual = perfilVisual(preferencias);
  const corParede = PALETA3D.predios.SHOPPING;

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[w + CALCADA_EXTRA, 0.16, l + CALCADA_EXTRA]} />
        <meshStandardMaterial color={PALETA3D.calcada} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.175, 0]}>
        <boxGeometry args={[w + 3.2, 0.08, l + 3.2]} />
        <meshStandardMaterial color={TINTAS.violetSoft} roughness={0.88} />
      </mesh>

      <mesh position={[SOMBRA_SOLIDA.dx, 0.23, SOMBRA_SOLIDA.dz]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w + 0.5, l + 0.5]} />
        <meshBasicMaterial
          color={SOMBRA_SOLIDA.cor}
          transparent
          opacity={SOMBRA_SOLIDA.opacidade + 0.04}
          depthWrite={false}
        />
      </mesh>

      <RigidBody type="fixed" colliders={false} position={[0, h / 2, 0]}>
        <CuboidCollider args={[w / 2, h / 2, l / 2]} />
      </RigidBody>

      <group position={[0, h / 2, 0]}>
        <mesh scale={[(w + 2 * TRACO) / w, (h + 2 * TRACO) / h, (l + 2 * TRACO) / l]}>
          <boxGeometry args={[w, h, l]} />
          <meshBasicMaterial color={PALETA3D.contorno} side={THREE.BackSide} />
        </mesh>
        <mesh>
          <boxGeometry args={[w, h, l]} />
          <meshStandardMaterial color={corParede} roughness={0.68} />
        </mesh>
        <mesh position={[0, -h / 2 + 0.42, l / 2 + 0.06]}>
          <boxGeometry args={[w * 0.96, 0.62, 0.14]} />
          <meshStandardMaterial color={TINTAS.sun} roughness={0.62} />
        </mesh>
        <mesh position={[w / 2 + 0.06, -h / 2 + 0.42, 0]}>
          <boxGeometry args={[0.14, 0.62, l * 0.94]} />
          <meshStandardMaterial color={TINTAS.sun} roughness={0.62} />
        </mesh>
      </group>

      <Claraboia w={w} l={l} brilho={visual.brilhoJanela} />
      <FachadasLojas w={w} l={l} brilho={visual.brilhoJanela} />
      <AreaKids detalhes={visual.detalhes} />
      <EstacionamentoShopping />
      <PracaExterna detalhes={visual.detalhes} />
    </group>
  );
}
