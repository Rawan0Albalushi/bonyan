import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { MAT } from '@/components/house/houseMaterials';

// Shared roof geometry (kept in sync with the upper-walls footprint).
const EAVE_Y = 1.9;
const RISE = 0.6;
const RIDGE_Y = EAVE_Y + RISE;
const X_HALF = 1.225;
const Z_HALF = 0.925;
const OVERHANG = 0.22;
const ROOF_W = (X_HALF + OVERHANG) * 2; // span along X
const RUN_Z = Z_HALF + OVERHANG; // ridge -> eave horizontal run
const CENTER_Z = 0.05;
const ANGLE = Math.atan2(RISE, RUN_Z);
const SLOPE_LEN = Math.hypot(RISE, RUN_Z) + 0.16; // small eave overshoot

/** Flat roof deck + projecting eaves — the framing stage of the roof. */
export function RoofFrame() {
    return (
        <group>
            <RoundedBox
                args={[ROOF_W, 0.12, RUN_Z * 2]}
                radius={0.02}
                position={[0, EAVE_Y, CENTER_Z]}
                castShadow
                receiveShadow
            >
                <meshStandardMaterial {...MAT.woodDark} />
            </RoundedBox>
            {/* exposed rafter tails along front & back eaves */}
            {[-1, 1].map((s) =>
                Array.from({ length: 7 }).map((_, i) => {
                    const x = -1.2 + i * 0.4;
                    return (
                        <mesh
                            key={`${s}-${x}`}
                            position={[x, EAVE_Y - 0.02, CENTER_Z + s * (RUN_Z - 0.06)]}
                            castShadow
                        >
                            <boxGeometry args={[0.08, 0.08, 0.18]} />
                            <meshStandardMaterial {...MAT.wood} />
                        </mesh>
                    );
                }),
            )}
        </group>
    );
}

/** Pitched terracotta tile roof: two slopes, ridge cap, gable ends and barge boards. */
export function RoofTiles() {
    const gableShape = useMemo(() => {
        const s = new THREE.Shape();
        s.moveTo(-Z_HALF, 0);
        s.lineTo(Z_HALF, 0);
        s.lineTo(0, RISE);
        s.closePath();
        return s;
    }, []);

    const Slope = ({ dir }: { dir: 1 | -1 }) => (
        <group position={[0, RIDGE_Y, CENTER_Z]} rotation={[dir * ANGLE, 0, 0]}>
            <RoundedBox
                args={[ROOF_W, 0.08, SLOPE_LEN]}
                radius={0.015}
                position={[0, 0.04, (dir * SLOPE_LEN) / 2]}
                castShadow
                receiveShadow
            >
                <meshStandardMaterial {...MAT.roof} />
            </RoundedBox>
            {/* tile course lines */}
            {[0.32, 0.62, 0.92, 1.18].map((z) => (
                <mesh key={z} position={[0, 0.085, dir * z]}>
                    <boxGeometry args={[ROOF_W - 0.04, 0.012, 0.03]} />
                    <meshStandardMaterial {...MAT.roofDark} />
                </mesh>
            ))}
        </group>
    );

    return (
        <group>
            <Slope dir={1} />
            <Slope dir={-1} />

            {/* ridge cap */}
            <mesh position={[0, RIDGE_Y + 0.05, CENTER_Z]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.08, 0.08, ROOF_W, 16, 1, false, 0, Math.PI]} />
                <meshStandardMaterial {...MAT.ridge} />
            </mesh>

            {/* gable ends + barge boards */}
            {([-1, 1] as const).map((s) => (
                <group key={s} position={[s * X_HALF, EAVE_Y, CENTER_Z]} rotation={[0, (s * Math.PI) / 2, 0]}>
                    <mesh castShadow>
                        <shapeGeometry args={[gableShape]} />
                        <meshStandardMaterial {...MAT.stucco} side={THREE.DoubleSide} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}
