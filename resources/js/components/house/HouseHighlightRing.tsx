import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HOUSE_COLORS as C } from '@/components/house/houseColors';

interface HouseHighlightRingProps {
    position: [number, number, number];
    active: boolean;
}

export function HouseHighlightRing({ position, active }: HouseHighlightRingProps) {
    const outerRef = useRef<THREE.Mesh>(null);
    const innerRef = useRef<THREE.Mesh>(null);
    const phase = useRef(0);

    useFrame((_, delta) => {
        if (!active) return;
        phase.current += delta * 2;
        const pulse = 1 + Math.sin(phase.current) * 0.08;
        if (outerRef.current) outerRef.current.scale.setScalar(pulse * 1.1);
        if (innerRef.current) innerRef.current.scale.setScalar(pulse);
    });

    if (!active) return null;

    return (
        <group position={position}>
            <mesh ref={outerRef} rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.5, 0.58, 48]} />
                <meshBasicMaterial color={C.accentGlow} transparent opacity={0.35} side={THREE.DoubleSide} />
            </mesh>
            <mesh ref={innerRef} rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.32, 0.36, 48]} />
                <meshBasicMaterial color={C.accent} transparent opacity={0.55} side={THREE.DoubleSide} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.2, 32]} />
                <meshBasicMaterial color={C.accentGlow} transparent opacity={0.2} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
}
