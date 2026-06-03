import { type ReactNode } from 'react';
import { BONUS_PARTS, countBonusDecorations, isPartUnlocked } from '@/components/house/houseParts';
import { HOUSE_COLORS as C } from '@/components/house/houseColors';

const BONUS_SPOTS: [number, number, number][] = [
    [-1.35, 0.12, 1.05],
    [1.35, 0.12, 1.05],
    [-1.1, 0.35, 0.85],
    [1.1, 0.35, 0.85],
    [0, 0.08, 1.2],
    [-0.55, 0.06, 1.15],
    [0.55, 0.06, 1.1],
    [-0.2, 0.1, 1.18],
];

interface HouseModel3DProps {
    donationsCount: number;
    highlightedPartId?: string | null;
    hoveredPartId?: string | null;
    onPartHover?: (id: string | null) => void;
    onPartClick?: (id: string) => void;
    interactive?: boolean;
}

interface PartProps {
    id: string;
    unlocked: boolean;
    highlighted: boolean;
    hovered: boolean;
    interactive: boolean;
    onHover: (id: string | null) => void;
    onClick: (id: string) => void;
    children: ReactNode;
    ghost?: ReactNode;
}

function BuildPart({
    id,
    unlocked,
    highlighted,
    hovered,
    interactive,
    onHover,
    onClick,
    children,
    ghost,
}: PartProps) {
    const scale = highlighted ? 1.045 : hovered ? 1.02 : 1;

    const handlers = interactive
        ? {
              onPointerOver: (e: { stopPropagation: () => void }) => {
                  e.stopPropagation();
                  onHover(id);
                  document.body.style.cursor = 'pointer';
              },
              onPointerOut: () => {
                  onHover(null);
                  document.body.style.cursor = '';
              },
              onClick: (e: { stopPropagation: () => void }) => {
                  e.stopPropagation();
                  onClick(id);
              },
          }
        : {};

    if (!unlocked) {
        if (!ghost) return null;
        return (
            <group {...handlers}>
                <group scale={0.98}>{ghost}</group>
            </group>
        );
    }

    return (
        <group scale={scale} {...handlers}>
            {(highlighted || hovered) && (
                <pointLight position={[0, 0.6, 0.4]} intensity={highlighted ? 0.7 : 0.35} color={C.accent} distance={2.5} />
            )}
            {children}
        </group>
    );
}

function GhostBox({ args, position }: { args: [number, number, number]; position: [number, number, number] }) {
    return (
        <mesh position={position}>
            <boxGeometry args={args} />
            <meshBasicMaterial color={C.blueprint} wireframe transparent opacity={0.45} />
        </mesh>
    );
}

function BonusDecor({ type }: { type: string }) {
    switch (type) {
        case 'bonus-planter':
            return (
                <group>
                    <mesh position={[0, 0.05, 0]}>
                        <boxGeometry args={[0.16, 0.1, 0.16]} />
                        <meshStandardMaterial color={C.wallDeep} />
                    </mesh>
                    <mesh position={[0, 0.14, 0]}>
                        <sphereGeometry args={[0.1, 8, 8]} />
                        <meshStandardMaterial color={C.olive} />
                    </mesh>
                </group>
            );
        case 'bonus-lantern':
            return (
                <group>
                    <mesh position={[0, 0.1, 0]}>
                        <boxGeometry args={[0.08, 0.12, 0.08]} />
                        <meshStandardMaterial color={C.accent} emissive={C.accent} emissiveIntensity={0.35} />
                    </mesh>
                    <pointLight position={[0, 0.18, 0]} intensity={0.4} color={C.accentLight} distance={1.2} />
                </group>
            );
        case 'bonus-bird':
            return (
                <mesh rotation={[0, 0, 0.3]}>
                    <sphereGeometry args={[0.06, 6, 6]} />
                    <meshStandardMaterial color={C.primary} />
                </mesh>
            );
        case 'bonus-flag':
            return (
                <group>
                    <mesh position={[0, 0.09, 0]}>
                        <cylinderGeometry args={[0.02, 0.02, 0.18, 6]} />
                        <meshStandardMaterial color={C.wallDeep} />
                    </mesh>
                    <mesh position={[0.07, 0.15, 0]} rotation={[0, 0, -0.4]}>
                        <boxGeometry args={[0.14, 0.08, 0.02]} />
                        <meshStandardMaterial color={C.accent} />
                    </mesh>
                </group>
            );
        case 'bonus-bench':
            return (
                <mesh position={[0, 0.03, 0]}>
                    <boxGeometry args={[0.24, 0.06, 0.1]} />
                    <meshStandardMaterial color={C.wallDeep} />
                </mesh>
            );
        case 'bonus-flowers':
            return (
                <group>
                    {[-0.06, 0, 0.06].map((x) => (
                        <mesh key={x} position={[x, 0.06, 0]}>
                            <sphereGeometry args={[0.04, 6, 6]} />
                            <meshStandardMaterial color={C.accentLight} />
                        </mesh>
                    ))}
                </group>
            );
        default:
            return null;
    }
}

export function HouseModel3D({
    donationsCount,
    highlightedPartId = null,
    hoveredPartId = null,
    onPartHover,
    onPartClick,
    interactive = true,
}: HouseModel3DProps) {
    const hover = onPartHover ?? (() => undefined);
    const click = onPartClick ?? (() => undefined);
    const unlocked = (id: string) => isPartUnlocked(id, donationsCount);
    const hi = (id: string) => highlightedPartId === id;
    const hov = (id: string) => hoveredPartId === id;
    const bonusCount = countBonusDecorations(donationsCount);

    const part = (id: string, children: ReactNode, ghost?: ReactNode) => (
        <BuildPart
            key={id}
            id={id}
            unlocked={unlocked(id)}
            highlighted={hi(id)}
            hovered={hov(id)}
            interactive={interactive}
            onHover={hover}
            onClick={click}
            ghost={ghost}
        >
            {children}
        </BuildPart>
    );

    return (
        <group position={[0, -0.05, 0]}>
            {/* Sky backdrop plane */}
            <mesh position={[0, 2.2, -2.5]} scale={[8, 5, 1]}>
                <planeGeometry />
                <meshBasicMaterial color={C.sky} />
            </mesh>

            {/* Sun */}
            <mesh position={[2.2, 2.8, -1.5]}>
                <sphereGeometry args={[0.35, 16, 16]} />
                <meshBasicMaterial color={C.accentLight} transparent opacity={0.55} />
            </mesh>

            {/* Ground lot — always visible */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[5.5, 4.5]} />
                <meshStandardMaterial color={C.ground} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
                <circleGeometry args={[2.2, 32]} />
                <meshStandardMaterial color={C.groundDark} transparent opacity={0.25} />
            </mesh>

            {part(
                'foundation',
                <mesh position={[0, 0.1, 0]} castShadow>
                    <boxGeometry args={[2.8, 0.2, 2.2]} />
                    <meshStandardMaterial color={C.wallDeep} />
                </mesh>,
                <GhostBox args={[2.8, 0.2, 2.2]} position={[0, 0.1, 0]} />,
            )}

            {part(
                'ground-walls',
                <mesh position={[0, 0.65, 0]} castShadow>
                    <boxGeometry args={[2.4, 0.9, 2]} />
                    <meshStandardMaterial color={C.wall} />
                </mesh>,
                <GhostBox args={[2.4, 0.9, 2]} position={[0, 0.65, 0]} />,
            )}

            {part(
                'columns',
                <group>
                    {([-0.85, 0, 0.85] as const).map((x) => (
                        <mesh key={x} position={[x, 0.65, 0.02]} castShadow>
                            <boxGeometry args={[0.12, 0.9, 0.14]} />
                            <meshStandardMaterial color={C.wallDeep} />
                        </mesh>
                    ))}
                </group>,
                <group>
                    <GhostBox args={[0.12, 0.9, 0.14]} position={[-0.85, 0.65, 0.02]} />
                    <GhostBox args={[0.12, 0.9, 0.14]} position={[0.85, 0.65, 0.02]} />
                </group>,
            )}

            {part(
                'upper-walls',
                <group>
                    <mesh position={[0, 1.35, 0]} castShadow>
                        <boxGeometry args={[2.5, 0.7, 2.1]} />
                        <meshStandardMaterial color={C.wall} />
                    </mesh>
                    <mesh position={[1.28, 1.32, -0.05]} castShadow>
                        <boxGeometry args={[0.18, 0.68, 2.05]} />
                        <meshStandardMaterial color={C.wallDark} />
                    </mesh>
                </group>,
                <GhostBox args={[2.5, 0.7, 2.1]} position={[0, 1.35, 0]} />,
            )}

            {part(
                'roof-frame',
                <mesh position={[0, 2.05, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                    <coneGeometry args={[1.85, 0.75, 4]} />
                    <meshStandardMaterial color={C.roof} transparent opacity={0.85} />
                </mesh>,
                <mesh position={[0, 2.05, 0]} rotation={[0, Math.PI / 4, 0]}>
                    <coneGeometry args={[1.85, 0.75, 4]} />
                    <meshBasicMaterial color={C.blueprint} wireframe transparent opacity={0.4} />
                </mesh>,
            )}

            {part(
                'roof-tiles',
                <group>
                    <mesh position={[0, 2.08, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                        <coneGeometry args={[1.88, 0.78, 4]} />
                        <meshStandardMaterial color={C.roofHi} roughness={0.65} />
                    </mesh>
                    <mesh position={[0, 1.72, 0]}>
                        <boxGeometry args={[2.6, 0.12, 2.15]} />
                        <meshStandardMaterial color={C.roofDark} />
                    </mesh>
                </group>,
            )}

            {part(
                'window-left',
                <group position={[-0.72, 0.55, 1.02]}>
                    <mesh>
                        <boxGeometry args={[0.36, 0.32, 0.06]} />
                        <meshStandardMaterial color={C.wallDeep} />
                    </mesh>
                    <mesh position={[0, 0, 0.04]}>
                        <boxGeometry args={[0.28, 0.24, 0.04]} />
                        <meshStandardMaterial color={C.glass} metalness={0.2} roughness={0.1} />
                    </mesh>
                </group>,
                <GhostBox args={[0.36, 0.32, 0.06]} position={[-0.72, 0.55, 1.02]} />,
            )}

            {part(
                'window-right',
                <group position={[0.72, 0.55, 1.02]}>
                    <mesh>
                        <boxGeometry args={[0.36, 0.32, 0.06]} />
                        <meshStandardMaterial color={C.wallDeep} />
                    </mesh>
                    <mesh position={[0, 0, 0.04]}>
                        <boxGeometry args={[0.28, 0.24, 0.04]} />
                        <meshStandardMaterial color={C.glass} metalness={0.2} roughness={0.1} />
                    </mesh>
                </group>,
                <GhostBox args={[0.36, 0.32, 0.06]} position={[0.72, 0.55, 1.02]} />,
            )}

            {part(
                'door',
                <group position={[0, 0.38, 1.03]}>
                    <mesh>
                        <boxGeometry args={[0.44, 0.38, 0.06]} />
                        <meshStandardMaterial color={C.wallDeep} />
                    </mesh>
                    <mesh position={[0, -0.02, 0.05]}>
                        <boxGeometry args={[0.36, 0.34, 0.04]} />
                        <meshStandardMaterial color={C.primaryDark} />
                    </mesh>
                    <mesh position={[0.14, -0.05, 0.08]}>
                        <sphereGeometry args={[0.03, 8, 8]} />
                        <meshStandardMaterial color={C.accent} metalness={0.6} />
                    </mesh>
                </group>,
                <GhostBox args={[0.44, 0.38, 0.06]} position={[0, 0.38, 1.03]} />,
            )}

            {part(
                'balcony',
                <group position={[0, 1.05, 1.08]}>
                    <mesh>
                        <boxGeometry args={[0.64, 0.06, 0.2]} />
                        <meshStandardMaterial color={C.wallDeep} />
                    </mesh>
                    {[-0.28, -0.09, 0.09, 0.28].map((x) => (
                        <mesh key={x} position={[x, -0.08, 0.06]}>
                            <boxGeometry args={[0.03, 0.14, 0.03]} />
                            <meshStandardMaterial color={C.primary} />
                        </mesh>
                    ))}
                </group>,
                <GhostBox args={[0.64, 0.2, 0.2]} position={[0, 1.05, 1.08]} />,
            )}

            {part(
                'chimney',
                <group position={[0.95, 1.85, -0.35]}>
                    <mesh>
                        <boxGeometry args={[0.22, 0.48, 0.22]} />
                        <meshStandardMaterial color={C.wallDark} />
                    </mesh>
                    <mesh position={[0, 0.28, 0]}>
                        <boxGeometry args={[0.3, 0.1, 0.28]} />
                        <meshStandardMaterial color={C.roofDark} />
                    </mesh>
                </group>,
                <GhostBox args={[0.22, 0.48, 0.22]} position={[0.95, 1.85, -0.35]} />,
            )}

            {part(
                'facade',
                <group>
                    <mesh position={[0, 1.25, 1.04]}>
                        <torusGeometry args={[0.11, 0.03, 12, 24]} />
                        <meshStandardMaterial color={C.wallDeep} />
                    </mesh>
                    <mesh position={[0, 1.25, 1.07]}>
                        <circleGeometry args={[0.07, 16]} />
                        <meshStandardMaterial color={C.glass} />
                    </mesh>
                </group>,
            )}

            {part(
                'walkway',
                <mesh position={[0, 0.03, 1.35]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.6, 0.2]} />
                    <meshStandardMaterial color={C.groundDark} />
                </mesh>,
                <mesh position={[0, 0.03, 1.35]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.6, 0.2]} />
                    <meshBasicMaterial color={C.blueprint} wireframe transparent opacity={0.4} />
                </mesh>,
            )}

            {part(
                'garden',
                <group>
                    {([-1.4, 1.4] as const).map((x) => (
                        <mesh key={x} position={[x, 0.08, 1.25]} rotation={[-Math.PI / 2, 0, 0]}>
                            <circleGeometry args={[0.35, 16]} />
                            <meshStandardMaterial color={C.olive} transparent opacity={0.45} />
                        </mesh>
                    ))}
                </group>,
            )}

            {part(
                'olive-tree',
                <group position={[1.35, 0.35, 0.6]}>
                    <mesh position={[0, 0.2, 0]}>
                        <cylinderGeometry args={[0.04, 0.05, 0.4, 8]} />
                        <meshStandardMaterial color={C.wallDeep} />
                    </mesh>
                    <mesh position={[0, 0.55, 0]}>
                        <sphereGeometry args={[0.22, 10, 10]} />
                        <meshStandardMaterial color={C.olive} />
                    </mesh>
                    <mesh position={[-0.08, 0.5, 0.05]}>
                        <sphereGeometry args={[0.12, 8, 8]} />
                        <meshStandardMaterial color={C.olive} transparent opacity={0.7} />
                    </mesh>
                </group>,
                <mesh position={[1.35, 0.45, 0.6]}>
                    <sphereGeometry args={[0.2, 8, 8]} />
                    <meshBasicMaterial color={C.blueprint} wireframe transparent opacity={0.4} />
                </mesh>,
            )}

            {part(
                'fence',
                <group>
                    {([-1.55, 1.55] as const).map((x) => (
                        <group key={x} position={[x, 0.2, 0.85]}>
                            {[0, 0.08, 0.16].map((z) => (
                                <mesh key={z} position={[0, 0.1 + z * 0.5, z * 0.3]}>
                                    <boxGeometry args={[0.04, 0.22, 0.04]} />
                                    <meshStandardMaterial color={C.wallDeep} />
                                </mesh>
                            ))}
                            <mesh position={[0, 0.22, 0.08]} rotation={[0, 0, Math.PI / 2]}>
                                <boxGeometry args={[0.5, 0.03, 0.03]} />
                                <meshStandardMaterial color={C.wallDeep} />
                            </mesh>
                        </group>
                    ))}
                </group>,
            )}

            {part(
                'lights',
                <group>
                    <pointLight position={[-0.72, 0.55, 1.15]} intensity={0.35} color={C.accent} distance={1.5} />
                    <pointLight position={[0.72, 0.55, 1.15]} intensity={0.35} color={C.accent} distance={1.5} />
                    <pointLight position={[0, 1.25, 1.15]} intensity={0.25} color={C.accentLight} distance={1.2} />
                </group>,
            )}

            {part(
                'heart',
                <mesh position={[0, 0.75, 1.12]} scale={0.12}>
                    <octahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial color={C.accent} emissive={C.accent} emissiveIntensity={0.25} metalness={0.3} />
                </mesh>,
            )}

            {Array.from({ length: bonusCount }).map((_, i) => {
                const spot = BONUS_SPOTS[i % BONUS_SPOTS.length];
                const type = BONUS_PARTS[i % BONUS_PARTS.length].id;
                const bonusId = `bonus-${i}`;
                const isHi = highlightedPartId === bonusId || highlightedPartId === type;

                return (
                    <group key={bonusId} position={spot} scale={isHi ? 1.25 : 1}>
                        <BonusDecor type={type} />
                    </group>
                );
            })}
        </group>
    );
}
