import { RoundedBox } from '@react-three/drei';
import { MAT, GLASS } from '@/components/house/houseMaterials';
import { HOUSE_COLORS as C } from '@/components/house/houseColors';

/**
 * A glazed window recessed into the wall, with a casement frame, cross
 * mullions, a projecting stone sill and a header lintel.
 */
export function ModernWindow({ width = 0.72, height = 1.05 }: { width?: number; height?: number }) {
    const reveal = 0.14; // how far the wall reveal sits proud of the glass
    const frameW = 0.045;

    return (
        <group>
            {/* recessed reveal box (darker, sits inside the wall) */}
            <RoundedBox args={[width + 0.1, height + 0.1, reveal]} radius={0.01} position={[0, 0, -reveal / 2]}>
                <meshStandardMaterial {...MAT.stuccoDark} />
            </RoundedBox>

            {/* glazing, set back inside the reveal */}
            <mesh position={[0, 0, -0.02]}>
                <planeGeometry args={[width - frameW, height - frameW]} />
                <meshPhysicalMaterial {...GLASS} />
            </mesh>

            {/* outer casement frame */}
            <RoundedBox args={[width, height, 0.05]} radius={0.012} smoothness={3} position={[0, 0, 0.02]} castShadow>
                <meshStandardMaterial {...MAT.trimWhite} />
            </RoundedBox>
            {/* hollow out the glass area by overlaying inner frame ring */}
            <mesh position={[0, 0, 0.045]}>
                <planeGeometry args={[width - frameW * 2, height - frameW * 2]} />
                <meshPhysicalMaterial {...GLASS} />
            </mesh>

            {/* mullions */}
            <mesh position={[0, 0, 0.05]}>
                <boxGeometry args={[width - frameW, 0.025, 0.03]} />
                <meshStandardMaterial {...MAT.trimWhite} />
            </mesh>
            <mesh position={[0, 0, 0.05]}>
                <boxGeometry args={[0.025, height - frameW, 0.03]} />
                <meshStandardMaterial {...MAT.trimWhite} />
            </mesh>

            {/* projecting stone sill */}
            <RoundedBox args={[width + 0.16, 0.06, 0.16]} radius={0.015} position={[0, -height / 2 - 0.02, 0.06]} castShadow>
                <meshStandardMaterial {...MAT.stone} />
            </RoundedBox>
            {/* header lintel */}
            <RoundedBox args={[width + 0.12, 0.05, 0.1]} radius={0.012} position={[0, height / 2 + 0.03, 0.04]} castShadow>
                <meshStandardMaterial {...MAT.stoneDark} />
            </RoundedBox>
        </group>
    );
}

/** Paneled timber entry door, recessed into a stone surround with brass hardware. */
export function ModernDoor() {
    const w = 0.9;
    const h = 1.4;

    return (
        <group>
            {/* stone surround / jamb */}
            <RoundedBox args={[w + 0.22, h + 0.14, 0.16]} radius={0.02} position={[0, h / 2 + 0.04, 0]} castShadow>
                <meshStandardMaterial {...MAT.stone} />
            </RoundedBox>
            {/* recessed reveal */}
            <RoundedBox args={[w + 0.04, h + 0.02, 0.1]} radius={0.012} position={[0, h / 2 + 0.04, 0.04]}>
                <meshStandardMaterial {...MAT.stuccoDark} />
            </RoundedBox>

            {/* door leaf */}
            <RoundedBox args={[w, h, 0.07]} radius={0.012} smoothness={3} position={[0, h / 2, 0.08]} castShadow>
                <meshStandardMaterial {...MAT.wood} />
            </RoundedBox>
            {/* raised panels */}
            {[0.62, 0.04].map((cy, i) => (
                <RoundedBox
                    key={cy}
                    args={[w - 0.22, i === 0 ? 0.46 : 0.5, 0.03]}
                    radius={0.01}
                    position={[0, h / 2 + cy - 0.33, 0.115]}
                    castShadow
                >
                    <meshStandardMaterial {...MAT.woodWarm} />
                </RoundedBox>
            ))}

            {/* brass handle */}
            <mesh position={[w / 2 - 0.12, h / 2, 0.14]} castShadow>
                <cylinderGeometry args={[0.022, 0.022, 0.05, 14]} />
                <meshStandardMaterial {...MAT.brass} />
            </mesh>
            <mesh position={[w / 2 - 0.12, h / 2 + 0.08, 0.13]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry args={[0.05, 0.012, 10, 24]} />
                <meshStandardMaterial {...MAT.brass} />
            </mesh>

            {/* projecting cornice over the door */}
            <RoundedBox args={[w + 0.34, 0.07, 0.22]} radius={0.015} position={[0, h + 0.14, 0.06]} castShadow>
                <meshStandardMaterial {...MAT.stoneDark} />
            </RoundedBox>
        </group>
    );
}

/** First-floor balcony with a frameless glass balustrade and brushed-metal cap rail. */
export function GlassBalcony() {
    const w = 1.15;
    const d = 0.4;

    return (
        <group>
            {/* slab */}
            <RoundedBox args={[w, 0.07, d]} radius={0.02} castShadow receiveShadow>
                <meshStandardMaterial {...MAT.stone} />
            </RoundedBox>
            {/* under-slab shadow line */}
            <RoundedBox args={[w - 0.04, 0.03, d - 0.04]} radius={0.01} position={[0, -0.05, 0]}>
                <meshStandardMaterial {...MAT.stoneDark} />
            </RoundedBox>

            {/* glass balustrade (front + sides) */}
            <mesh position={[0, 0.22, d / 2 - 0.02]} castShadow>
                <boxGeometry args={[w - 0.06, 0.4, 0.018]} />
                <meshPhysicalMaterial {...GLASS} />
            </mesh>
            {[-1, 1].map((s) => (
                <mesh key={s} position={[s * (w / 2 - 0.02), 0.22, 0]} castShadow>
                    <boxGeometry args={[0.018, 0.4, d - 0.02]} />
                    <meshPhysicalMaterial {...GLASS} />
                </mesh>
            ))}

            {/* metal cap rail */}
            <RoundedBox args={[w, 0.035, 0.05]} radius={0.012} position={[0, 0.44, d / 2 - 0.02]} castShadow>
                <meshStandardMaterial {...MAT.metal} />
            </RoundedBox>
            {[-1, 1].map((s) => (
                <RoundedBox key={s} args={[0.05, 0.035, d]} radius={0.012} position={[s * (w / 2 - 0.02), 0.44, 0]} castShadow>
                    <meshStandardMaterial {...MAT.metal} />
                </RoundedBox>
            ))}
            {/* standoff posts */}
            {[-w / 2 + 0.08, 0, w / 2 - 0.08].map((x) => (
                <mesh key={x} position={[x, 0.12, d / 2 - 0.02]} castShadow>
                    <cylinderGeometry args={[0.012, 0.012, 0.2, 10]} />
                    <meshStandardMaterial {...MAT.metal} />
                </mesh>
            ))}

            <pointLight position={[0, 0.2, 0.1]} intensity={0.12} color={C.glass} distance={1} />
        </group>
    );
}
