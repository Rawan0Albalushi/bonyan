import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { HouseVillaModel } from '@/components/house/HouseVillaModel';

export interface HouseCanvasProps {
    donationsCount: number;
    highlightedPartId?: string | null;
    revealPartId?: string | null;
    hoveredPartId?: string | null;
    onPartHover?: (id: string | null) => void;
    onPartClick?: (id: string) => void;
    interactive?: boolean;
    celebrateMode?: boolean;
}

const FOCUS_ANCHORS: Record<string, [number, number, number]> = {
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

function CinematicCamera({ focusId }: { focusId: string | null }) {
    const { camera } = useThree();
    const target = useRef(new THREE.Vector3(0, 1, 0.5));

    useEffect(() => {
        const anchor = focusId ? FOCUS_ANCHORS[focusId] : null;
        if (anchor) {
            target.current.set(anchor[0] * 0.5, anchor[1], anchor[2] * 0.6);
        } else {
            target.current.set(0, 1.05, 0.45);
        }
        camera.position.set(4.2, 2.8, 5.2);
        camera.lookAt(target.current);
    }, [camera, focusId]);

    return null;
}

export function HouseCanvas({
    donationsCount,
    highlightedPartId = null,
    revealPartId = null,
    hoveredPartId = null,
    onPartHover,
    onPartClick,
    interactive = true,
    celebrateMode = false,
}: HouseCanvasProps) {
    const focusId = revealPartId ?? highlightedPartId;

    return (
        <Canvas
            className="h-full w-full touch-none"
            camera={{ position: [4.5, 2.6, 5.5], fov: 32, near: 0.1, far: 80 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]}
            shadows
            onCreated={({ gl }) => {
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = 1.1;
                gl.shadowMap.type = THREE.PCFSoftShadowMap;
            }}
        >
            <color attach="background" args={['#cfe2ef']} />
            <fog attach="fog" args={['#dbe9f2', 16, 38]} />
            <Sky sunPosition={[12, 9, 7]} turbidity={5} rayleigh={1.2} mieCoefficient={0.006} />
            <ambientLight intensity={0.35} />
            <hemisphereLight args={['#cfe2ef', '#8a9a6c', 0.6]} />
            {/* warm low-angle key (late-afternoon sun) */}
            <directionalLight
                position={[12, 9, 7]}
                intensity={2.1}
                color="#fff1d6"
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-bias={-0.0004}
                shadow-camera-near={1}
                shadow-camera-far={40}
                shadow-camera-left={-8}
                shadow-camera-right={8}
                shadow-camera-top={8}
                shadow-camera-bottom={-8}
            />
            {/* cool sky fill from the opposite side */}
            <directionalLight position={[-7, 6, -5]} intensity={0.45} color="#bcd4ea" />
            {/* subtle warm bounce from the ground */}
            <directionalLight position={[0, -3, 4]} intensity={0.18} color="#d8c39a" />
            {celebrateMode && <CinematicCamera focusId={focusId} />}
            <Suspense fallback={null}>
                <Environment preset="park" environmentIntensity={0.7} />
                <HouseVillaModel
                    donationsCount={donationsCount}
                    highlightedPartId={highlightedPartId}
                    revealPartId={revealPartId}
                    hoveredPartId={hoveredPartId}
                    onPartHover={onPartHover}
                    onPartClick={onPartClick}
                    interactive={interactive && !celebrateMode}
                />
                <ContactShadows position={[0, 0.02, 0]} opacity={0.55} scale={11} blur={2.2} far={5} color="#3a2a1a" />
                <OrbitControls
                    enablePan={false}
                    enableZoom={!celebrateMode && interactive}
                    minDistance={celebrateMode ? 5 : 4.5}
                    maxDistance={celebrateMode ? 7 : 9}
                    minPolarAngle={0.45}
                    maxPolarAngle={1.22}
                    autoRotate={interactive && !celebrateMode}
                    autoRotateSpeed={0.25}
                    target={[0, 1.15, 0.4]}
                    enableDamping
                    dampingFactor={0.05}
                />
            </Suspense>
        </Canvas>
    );
}
