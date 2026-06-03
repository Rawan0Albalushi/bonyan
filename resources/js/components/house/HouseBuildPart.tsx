import { type ReactNode, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HOUSE_COLORS as C } from '@/components/house/houseColors';

interface BuildPartProps {
    id: string;
    unlocked: boolean;
    highlighted: boolean;
    revealing: boolean;
    hovered: boolean;
    interactive: boolean;
    onHover: (id: string | null) => void;
    onClick: (id: string) => void;
    children: ReactNode;
    ghost?: ReactNode;
}

export function HouseBuildPart({
    id,
    unlocked,
    highlighted,
    revealing,
    hovered,
    interactive,
    onHover,
    onClick,
    children,
    ghost,
}: BuildPartProps) {
    const groupRef = useRef<THREE.Group>(null);
    const revealProgress = useRef(revealing ? 0 : 1);
    const pulse = useRef(0);
    const baseY = useRef(0);

    useFrame((_, delta) => {
        const g = groupRef.current;
        if (!g) return;

        if (revealing && revealProgress.current < 1) {
            revealProgress.current = Math.min(1, revealProgress.current + delta * 1.4);
            const t = revealProgress.current;
            const eased = 1 - Math.pow(1 - t, 4);
            g.scale.setScalar(0.08 + eased * 0.92);
            g.position.y = baseY.current + (1 - eased) * 0.5;
        } else {
            g.position.y = baseY.current;
            if (highlighted) {
                pulse.current += delta * 2.5;
                const s = 1 + Math.sin(pulse.current) * 0.018;
                g.scale.setScalar(s);
            } else if (hovered) {
                g.scale.setScalar(1.012);
            } else {
                g.scale.setScalar(1);
            }
        }
    });

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
        return <group {...handlers}>{ghost}</group>;
    }

    return (
        <group ref={groupRef} {...handlers}>
            {(highlighted || revealing) && (
                <pointLight position={[0, 0.8, 0.6]} intensity={highlighted ? 1.4 : 0.8} color={C.accentGlow} distance={4} />
            )}
            {children}
        </group>
    );
}
