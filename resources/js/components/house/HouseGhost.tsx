import { Edges, RoundedBox } from '@react-three/drei';
import { HOUSE_COLORS as C } from '@/components/house/houseColors';
import { MAT } from '@/components/house/houseMaterials';

interface GhostVolumeProps {
    size: [number, number, number];
    position?: [number, number, number];
    radius?: number;
}

export function GhostVolume({ size, position = [0, 0, 0], radius = 0.04 }: GhostVolumeProps) {
    return (
        <group position={position}>
            <RoundedBox args={size} radius={radius} smoothness={4}>
                <meshStandardMaterial {...MAT.ghost} />
                <Edges color={C.ghostLine} threshold={15} />
            </RoundedBox>
        </group>
    );
}
