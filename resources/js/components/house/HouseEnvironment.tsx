import { Cloud, RoundedBox } from '@react-three/drei';
import { MAT } from '@/components/house/houseMaterials';
import { HOUSE_COLORS as C } from '@/components/house/houseColors';

/** Tall, tapered Mediterranean cypress — instantly reads as a real villa garden. */
function Cypress({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
    return (
        <group position={position} scale={scale}>
            <mesh position={[0, 0.12, 0]} castShadow>
                <cylinderGeometry args={[0.05, 0.07, 0.24, 8]} />
                <meshStandardMaterial {...MAT.woodDark} />
            </mesh>
            <mesh position={[0, 0.95, 0]} castShadow>
                <coneGeometry args={[0.28, 1.7, 12]} />
                <meshStandardMaterial color={C.foliageDark} roughness={0.95} />
            </mesh>
            <mesh position={[0.04, 1.05, 0.02]} castShadow>
                <coneGeometry args={[0.2, 1.4, 12]} />
                <meshStandardMaterial color={C.foliage} roughness={0.92} />
            </mesh>
        </group>
    );
}

function Shrub({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
    return (
        <group position={position} scale={scale}>
            <mesh position={[0, 0.14, 0]} castShadow>
                <sphereGeometry args={[0.2, 14, 14]} />
                <meshStandardMaterial color={C.lawn} roughness={0.95} />
            </mesh>
            <mesh position={[0.12, 0.18, 0.05]} castShadow>
                <sphereGeometry args={[0.13, 12, 12]} />
                <meshStandardMaterial color={C.lawnLight} roughness={0.93} />
            </mesh>
        </group>
    );
}

function Rock({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
    return (
        <mesh position={position} scale={scale} rotation={[0.3, 0.5, 0.2]} castShadow receiveShadow>
            <dodecahedronGeometry args={[0.16, 0]} />
            <meshStandardMaterial {...MAT.stone} />
        </mesh>
    );
}

export function HouseEnvironment() {
    return (
        <group>
            {/* base lawn */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                <circleGeometry args={[8, 64]} />
                <meshStandardMaterial {...MAT.lawn} />
            </mesh>
            {/* darker grass variation patches */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.2, 0.002, -1.2]} receiveShadow>
                <circleGeometry args={[2.4, 48]} />
                <meshStandardMaterial {...MAT.lawnDark} transparent opacity={0.6} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.6, 0.002, 1.6]} receiveShadow>
                <circleGeometry args={[1.8, 48]} />
                <meshStandardMaterial {...MAT.lawnDark} transparent opacity={0.45} />
            </mesh>

            {/* front sandstone courtyard */}
            <RoundedBox args={[3.1, 0.05, 1.6]} radius={0.02} position={[0, 0.025, 1.75]} receiveShadow>
                <meshStandardMaterial {...MAT.paver} />
            </RoundedBox>
            {/* courtyard joint lines */}
            {[-0.9, 0, 0.9].map((x) => (
                <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.052, 1.75]}>
                    <planeGeometry args={[0.02, 1.5]} />
                    <meshStandardMaterial {...MAT.paverDark} />
                </mesh>
            ))}

            {/* planting */}
            <Cypress position={[-2.5, 0, 0.2]} scale={1.1} />
            <Cypress position={[-2.2, 0, -0.9]} scale={0.9} />
            <Cypress position={[2.7, 0, -0.6]} scale={1.05} />
            <Shrub position={[-2.6, 0, 1.5]} />
            <Shrub position={[2.4, 0, 1.9]} scale={0.85} />
            <Rock position={[-2.0, 0.1, 1.9]} />
            <Rock position={[2.0, 0.08, -1.4]} scale={0.8} />

            <Cloud position={[-4, 4.5, -6]} opacity={0.25} speed={0.2} />
            <Cloud position={[5, 4, -8]} opacity={0.18} speed={0.15} />
        </group>
    );
}
