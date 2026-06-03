import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { HouseModel3D } from '@/components/house/HouseModel3D';

export interface HouseCanvasProps {
    donationsCount: number;
    highlightedPartId?: string | null;
    hoveredPartId?: string | null;
    onPartHover?: (id: string | null) => void;
    onPartClick?: (id: string) => void;
    interactive?: boolean;
}

export function HouseCanvas({
    donationsCount,
    highlightedPartId = null,
    hoveredPartId = null,
    onPartHover,
    onPartClick,
    interactive = true,
}: HouseCanvasProps) {
    return (
        <Canvas
            className="h-full w-full touch-none"
            camera={{ position: [3.8, 2.6, 4.2], fov: 42, near: 0.1, far: 50 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]}
            style={{ background: 'transparent' }}
        >
            <color attach="background" args={['#f5faf8']} />
            <fog attach="fog" args={['#f5faf8', 8, 18]} />
            <ambientLight intensity={0.55} />
            <directionalLight position={[5, 8, 4]} intensity={1.15} castShadow shadow-mapSize={[512, 512]} />
            <directionalLight position={[-3, 5, -2]} intensity={0.35} />
            <Suspense fallback={null}>
                <HouseModel3D
                    donationsCount={donationsCount}
                    highlightedPartId={highlightedPartId}
                    hoveredPartId={hoveredPartId}
                    onPartHover={onPartHover}
                    onPartClick={onPartClick}
                    interactive={interactive}
                />
                <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={8} blur={2.8} far={4} />
                <OrbitControls
                    enablePan={false}
                    enableZoom={interactive}
                    minDistance={4}
                    maxDistance={7.5}
                    minPolarAngle={0.55}
                    maxPolarAngle={1.35}
                    autoRotate={interactive}
                    autoRotateSpeed={0.5}
                />
            </Suspense>
        </Canvas>
    );
}
