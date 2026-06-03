import { type ReactNode } from 'react';
import { RoundedBox } from '@react-three/drei';
import { BONUS_PARTS, countBonusDecorations, isPartUnlocked } from '@/components/house/houseParts';
import { HouseBuildPart } from '@/components/house/HouseBuildPart';
import { GhostVolume } from '@/components/house/HouseGhost';
import { HouseHighlightRing } from '@/components/house/HouseHighlightRing';
import { HouseEnvironment } from '@/components/house/HouseEnvironment';
import { GlassBalcony, ModernDoor, ModernWindow } from '@/components/house/HousePrimitives';
import { RoofFrame, RoofTiles } from '@/components/house/HouseRoof';
import { MAT } from '@/components/house/houseMaterials';
import { HOUSE_COLORS as C } from '@/components/house/houseColors';

const BONUS_SPOTS: [number, number, number][] = [
    [-1.6, 0, 1.35],
    [1.6, 0, 1.35],
    [-1.2, 0.15, 1.5],
    [1.2, 0.15, 1.45],
    [0, 0, 1.55],
    [-0.7, 0, 1.5],
    [0.7, 0, 1.48],
    [-0.25, 0.05, 1.52],
];

interface HouseVillaModelProps {
    donationsCount: number;
    highlightedPartId?: string | null;
    revealPartId?: string | null;
    hoveredPartId?: string | null;
    onPartHover?: (id: string | null) => void;
    onPartClick?: (id: string) => void;
    interactive?: boolean;
}

function BonusProp({ type }: { type: string }) {
    switch (type) {
        case 'bonus-planter':
            return (
                <group>
                    <RoundedBox args={[0.35, 0.22, 0.35]} radius={0.03} position={[0, 0.11, 0]} castShadow>
                        <meshStandardMaterial {...MAT.concrete} />
                    </RoundedBox>
                    <mesh position={[0, 0.32, 0]} castShadow>
                        <sphereGeometry args={[0.18, 16, 16]} />
                        <meshStandardMaterial color={C.lawn} roughness={0.75} />
                    </mesh>
                </group>
            );
        case 'bonus-lantern':
            return (
                <group>
                    <mesh position={[0, 0.5, 0]} castShadow>
                        <cylinderGeometry args={[0.03, 0.04, 1, 8]} />
                        <meshStandardMaterial {...MAT.frame} />
                    </mesh>
                    <RoundedBox args={[0.14, 0.2, 0.14]} radius={0.02} position={[0, 0.85, 0]} castShadow>
                        <meshPhysicalMaterial
                            color={C.accentGlow}
                            emissive={C.accent}
                            emissiveIntensity={0.8}
                            roughness={0.3}
                        />
                    </RoundedBox>
                    <pointLight position={[0, 0.95, 0]} intensity={0.8} color={C.accentGlow} distance={2} />
                </group>
            );
        case 'bonus-bird':
            return (
                <mesh position={[0, 0.7, 0]} castShadow>
                    <sphereGeometry args={[0.05, 12, 12]} />
                    <meshStandardMaterial color={C.frame} roughness={0.5} />
                </mesh>
            );
        case 'bonus-flag':
            return (
                <group>
                    <mesh position={[0, 0.45, 0]} castShadow>
                        <cylinderGeometry args={[0.025, 0.03, 0.9, 10]} />
                        <meshStandardMaterial {...MAT.frame} />
                    </mesh>
                    <mesh position={[0.12, 0.75, 0]} rotation={[0, 0, -0.2]} castShadow>
                        <planeGeometry args={[0.22, 0.14]} />
                        <meshStandardMaterial color={C.accent} side={2} />
                    </mesh>
                </group>
            );
        case 'bonus-bench':
            return (
                <RoundedBox args={[0.55, 0.12, 0.22]} radius={0.02} position={[0, 0.06, 0]} castShadow>
                    <meshStandardMaterial {...MAT.wood} />
                </RoundedBox>
            );
        case 'bonus-flowers':
            return (
                <group>
                    {[-0.12, 0, 0.12].map((x) => (
                        <mesh key={x} position={[x, 0.1, 0]} castShadow>
                            <sphereGeometry args={[0.07, 10, 10]} />
                            <meshStandardMaterial color={C.accentGlow} emissive={C.accent} emissiveIntensity={0.2} />
                        </mesh>
                    ))}
                </group>
            );
        default:
            return null;
    }
}

export function HouseVillaModel({
    donationsCount,
    highlightedPartId = null,
    revealPartId = null,
    hoveredPartId = null,
    onPartHover,
    onPartClick,
    interactive = true,
}: HouseVillaModelProps) {
    const hover = onPartHover ?? (() => undefined);
    const click = onPartClick ?? (() => undefined);
    const unlocked = (id: string) => isPartUnlocked(id, donationsCount);
    const hi = (id: string) => highlightedPartId === id;
    const hov = (id: string) => hoveredPartId === id;
    const revealing = (id: string) => revealPartId === id;
    const bonusCount = countBonusDecorations(donationsCount);

    const focusId = revealPartId ?? highlightedPartId;
    const anchors: Record<string, [number, number, number]> = {
        foundation: [0, 0.06, 0.2],
        'ground-walls': [0, 0.55, 0.35],
        columns: [0, 0.5, 0.95],
        'upper-walls': [0, 1.45, 0.2],
        'roof-frame': [0, 2.05, 0.15],
        'roof-tiles': [0, 2.12, 0.15],
        'window-left': [-0.95, 0.75, 1.02],
        'window-right': [0.95, 0.75, 1.02],
        door: [0, 0.55, 1.05],
        balcony: [0, 1.35, 1.08],
        chimney: [1.15, 1.5, 0.35],
        facade: [0, 0.85, 1.06],
        walkway: [0, 0.02, 1.55],
        garden: [-1.35, 0.08, 1.4],
        'olive-tree': [1.5, 0.6, 1.1],
        fence: [-1.75, 0.25, 0.9],
        lights: [0, 1.1, 1.05],
        heart: [0, 1.05, 1.08],
    };
    const highlightAnchor = focusId && anchors[focusId] ? anchors[focusId] : null;

    const part = (id: string, children: ReactNode, ghost?: ReactNode) => (
        <HouseBuildPart
            key={id}
            id={id}
            unlocked={unlocked(id)}
            highlighted={hi(id)}
            revealing={revealing(id)}
            hovered={hov(id)}
            interactive={interactive}
            onHover={hover}
            onClick={click}
            ghost={ghost}
        >
            {children}
        </HouseBuildPart>
    );

    return (
        <group position={[0, 0, 0]}>
            <HouseEnvironment />

            {part(
                'foundation',
                <group>
                    {/* footing pad */}
                    <RoundedBox args={[3.2, 0.1, 2.7]} radius={0.02} position={[0, 0.05, 0.15]} receiveShadow castShadow>
                        <meshStandardMaterial {...MAT.stoneDark} />
                    </RoundedBox>
                    {/* chamfered stone plinth */}
                    <RoundedBox args={[3.0, 0.16, 2.5]} radius={0.02} position={[0, 0.16, 0.15]} receiveShadow castShadow>
                        <meshStandardMaterial {...MAT.stone} />
                    </RoundedBox>
                </group>,
                <GhostVolume size={[3.1, 0.14, 2.6]} position={[0, 0.07, 0.15]} />,
            )}

            {part(
                'ground-walls',
                <group>
                    <RoundedBox args={[2.85, 1.05, 2.15]} radius={0.05} smoothness={5} position={[0, 0.72, 0.2]} castShadow receiveShadow>
                        <meshStandardMaterial {...MAT.stucco} />
                    </RoundedBox>
                    {/* darker base course / skirting */}
                    <RoundedBox args={[2.9, 0.18, 2.2]} radius={0.03} position={[0, 0.29, 0.2]} castShadow receiveShadow>
                        <meshStandardMaterial {...MAT.stoneDark} />
                    </RoundedBox>
                    {/* mid-floor string course */}
                    <RoundedBox args={[2.92, 0.07, 2.22]} radius={0.02} position={[0, 1.26, 0.2]} castShadow>
                        <meshStandardMaterial {...MAT.trim} />
                    </RoundedBox>
                </group>,
                <GhostVolume size={[2.85, 1.05, 2.15]} position={[0, 0.72, 0.2]} />,
            )}

            {part(
                'columns',
                <group>
                    {([-0.75, 0.75] as const).map((x) => (
                        <RoundedBox
                            key={x}
                            args={[0.14, 1.02, 0.14]}
                            radius={0.02}
                            position={[x, 0.58, 0.92]}
                            castShadow
                        >
                            <meshStandardMaterial {...MAT.stuccoDark} />
                        </RoundedBox>
                    ))}
                    <RoundedBox args={[1.72, 0.08, 0.35]} radius={0.02} position={[0, 1.08, 0.92]} castShadow>
                        <meshStandardMaterial {...MAT.stuccoDark} />
                    </RoundedBox>
                </group>,
                <group>
                    <GhostVolume size={[0.14, 1.02, 0.14]} position={[-0.75, 0.58, 0.92]} />
                    <GhostVolume size={[0.14, 1.02, 0.14]} position={[0.75, 0.58, 0.92]} />
                </group>,
            )}

            {part(
                'upper-walls',
                <RoundedBox args={[2.45, 0.85, 1.85]} radius={0.05} smoothness={5} position={[0, 1.48, 0.05]} castShadow>
                    <meshStandardMaterial {...MAT.stucco} />
                </RoundedBox>,
                <GhostVolume size={[2.45, 0.85, 1.85]} position={[0, 1.48, 0.05]} />,
            )}

            {part(
                'roof-frame',
                <RoofFrame />,
                <GhostVolume size={[2.9, 0.12, 2.3]} position={[0, 1.9, 0.05]} />,
            )}

            {part('roof-tiles', <RoofTiles />)}

            {part(
                'window-left',
                <group position={[-0.95, 0.72, 1.02]}>
                    <ModernWindow width={0.7} height={1} />
                </group>,
                <GhostVolume size={[0.7, 1, 0.12]} position={[-0.95, 0.72, 1.02]} />,
            )}

            {part(
                'window-right',
                <group position={[0.95, 0.72, 1.02]}>
                    <ModernWindow width={0.7} height={1} />
                </group>,
                <GhostVolume size={[0.7, 1, 0.12]} position={[0.95, 0.72, 1.02]} />,
            )}

            {part(
                'door',
                <group position={[0, 0.02, 1.02]}>
                    <ModernDoor />
                </group>,
                <GhostVolume size={[0.95, 1.35, 0.1]} position={[0, 0.55, 1.02]} />,
            )}

            {part(
                'balcony',
                <group position={[0, 1.32, 1.05]}>
                    <GlassBalcony />
                </group>,
                <GhostVolume size={[1.1, 0.5, 0.35]} position={[0, 1.32, 1.05]} />,
            )}

            {part(
                'chimney',
                <group position={[1.05, 2.05, 0.35]}>
                    {/* rendered masonry stack */}
                    <RoundedBox args={[0.36, 1.0, 0.32]} radius={0.015} castShadow receiveShadow>
                        <meshStandardMaterial {...MAT.stucco} />
                    </RoundedBox>
                    {/* projecting cap */}
                    <RoundedBox args={[0.46, 0.08, 0.42]} radius={0.015} position={[0, 0.52, 0]} castShadow>
                        <meshStandardMaterial {...MAT.stoneDark} />
                    </RoundedBox>
                    {/* clay flue pots */}
                    {[-0.08, 0.08].map((x) => (
                        <mesh key={x} position={[x, 0.64, 0]} castShadow>
                            <cylinderGeometry args={[0.05, 0.06, 0.16, 14]} />
                            <meshStandardMaterial {...MAT.roof} />
                        </mesh>
                    ))}
                </group>,
                <GhostVolume size={[0.36, 1.0, 0.32]} position={[1.05, 2.05, 0.35]} />,
            )}

            {part(
                'facade',
                <group>
                    <RoundedBox args={[1.4, 0.06, 0.5]} radius={0.03} position={[0, 1.22, 0.95]} castShadow>
                        <meshStandardMaterial {...MAT.stuccoDark} />
                    </RoundedBox>
                    <mesh position={[0, 1.05, 1.04]} castShadow>
                        <boxGeometry args={[0.28, 0.08, 0.02]} />
                        <meshStandardMaterial {...MAT.copper} />
                    </mesh>
                </group>,
            )}

            {part(
                'walkway',
                <group position={[0, 0.03, 1.5]}>
                    {[-0.24, 0, 0.24].map((x) => (
                        <RoundedBox key={x} args={[0.42, 0.03, 0.42]} radius={0.04} position={[x, 0, 0]} receiveShadow>
                            <meshStandardMaterial {...MAT.paver} />
                        </RoundedBox>
                    ))}
                </group>,
                <GhostVolume size={[0.9, 0.03, 0.5]} position={[0, 0.03, 1.5]} />,
            )}

            {part(
                'garden',
                <group>
                    {([-1.35, 1.35] as const).map((x) => (
                        <group key={x} position={[x, 0.18, 1.4]}>
                            {/* raised stone planter */}
                            <RoundedBox args={[0.6, 0.3, 0.5]} radius={0.03} castShadow receiveShadow>
                                <meshStandardMaterial {...MAT.stone} />
                            </RoundedBox>
                            {/* soil */}
                            <RoundedBox args={[0.5, 0.06, 0.4]} radius={0.02} position={[0, 0.15, 0]} receiveShadow>
                                <meshStandardMaterial {...MAT.soil} />
                            </RoundedBox>
                            {/* shrubs */}
                            {[-0.12, 0.05, 0.14].map((dx, i) => (
                                <mesh key={dx} position={[dx, 0.24 + i * 0.02, (i - 1) * 0.1]} castShadow>
                                    <sphereGeometry args={[0.11 - i * 0.01, 12, 12]} />
                                    <meshStandardMaterial color={i % 2 ? C.lawn : C.foliage} roughness={0.9} />
                                </mesh>
                            ))}
                        </group>
                    ))}
                </group>,
            )}

            {part(
                'olive-tree',
                <group position={[1.55, 0, 1.15]}>
                    {/* tapered, slightly leaning trunk */}
                    <mesh position={[0.02, 0.4, 0]} rotation={[0, 0, -0.06]} castShadow>
                        <cylinderGeometry args={[0.05, 0.09, 0.82, 12]} />
                        <meshStandardMaterial {...MAT.woodDark} />
                    </mesh>
                    {/* layered canopy clusters */}
                    {([
                        [0, 0.92, 0, 0.32, C.foliageDark],
                        [-0.18, 0.82, 0.1, 0.22, C.foliage],
                        [0.16, 0.86, -0.08, 0.24, C.lawn],
                        [0.04, 1.05, 0.12, 0.2, C.lawnLight],
                        [-0.08, 1.0, -0.12, 0.18, C.foliage],
                    ] as const).map(([cx, cy, cz, r, col], i) => (
                        <mesh key={i} position={[cx, cy, cz]} castShadow>
                            <sphereGeometry args={[r, 14, 14]} />
                            <meshStandardMaterial color={col} roughness={0.92} />
                        </mesh>
                    ))}
                </group>,
                <GhostVolume size={[0.5, 0.9, 0.5]} position={[1.55, 0.5, 1.15]} />,
            )}

            {part(
                'fence',
                <group>
                    {([-1.75, 1.75] as const).map((x) => (
                        <group key={x} position={[x, 0, 0.85]}>
                            {/* low boundary wall */}
                            <RoundedBox args={[0.12, 0.36, 1.4]} radius={0.02} position={[0, 0.2, 0]} castShadow receiveShadow>
                                <meshStandardMaterial {...MAT.stucco} />
                            </RoundedBox>
                            {/* coping cap */}
                            <RoundedBox args={[0.18, 0.05, 1.46]} radius={0.015} position={[0, 0.4, 0]} castShadow>
                                <meshStandardMaterial {...MAT.stoneDark} />
                            </RoundedBox>
                            {/* end piers */}
                            {[-0.6, 0.6].map((z) => (
                                <RoundedBox key={z} args={[0.2, 0.5, 0.2]} radius={0.02} position={[0, 0.27, z]} castShadow>
                                    <meshStandardMaterial {...MAT.stucco} />
                                </RoundedBox>
                            ))}
                        </group>
                    ))}
                </group>,
            )}

            {part(
                'lights',
                <group>
                    <pointLight position={[-0.95, 0.72, 1.12]} intensity={0.6} color={C.accentGlow} distance={2.2} />
                    <pointLight position={[0.95, 0.72, 1.12]} intensity={0.6} color={C.accentGlow} distance={2.2} />
                    <pointLight position={[0, 1.22, 1.1]} intensity={0.4} color={C.glass} distance={1.8} />
                    {[-0.95, 0.95].map((x) => (
                        <mesh key={x} position={[x, 0.72, 1.06]}>
                            <boxGeometry args={[0.7, 0.02, 0.02]} />
                            <meshStandardMaterial
                                color={C.accentGlow}
                                emissive={C.accent}
                                emissiveIntensity={0.5}
                            />
                        </mesh>
                    ))}
                </group>,
            )}

            {part(
                'heart',
                <mesh position={[0, 1.05, 1.07]} castShadow>
                    <torusGeometry args={[0.08, 0.025, 12, 32]} />
                    <meshPhysicalMaterial
                        color={C.accentGlow}
                        emissive={C.accent}
                        emissiveIntensity={0.45}
                        metalness={0.7}
                        roughness={0.2}
                    />
                </mesh>,
            )}

            {Array.from({ length: bonusCount }).map((_, i) => {
                const spot = BONUS_SPOTS[i % BONUS_SPOTS.length];
                const type = BONUS_PARTS[i % BONUS_PARTS.length].id;
                const bonusId = `bonus-${i}`;
                const isFocus = highlightedPartId === bonusId || revealPartId === bonusId;

                return (
                    <group key={bonusId} position={spot} scale={isFocus ? 1.15 : 1}>
                        <BonusProp type={type} />
                    </group>
                );
            })}

            {highlightAnchor && (
                <HouseHighlightRing
                    position={[highlightAnchor[0], highlightAnchor[1] + 0.2, highlightAnchor[2]]}
                    active
                />
            )}
        </group>
    );
}
