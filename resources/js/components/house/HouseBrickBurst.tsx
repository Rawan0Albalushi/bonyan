import { motion } from 'framer-motion';
import { getDetailById } from '@/components/house/houseDetails';

interface HouseBrickBurstProps {
    partId: string;
    count: number;
    active?: boolean;
}

const BRICK_OFFSETS = [
    { x: 8, y: 4, rotate: -8 },
    { x: 42, y: 12, rotate: 6 },
    { x: 22, y: 28, rotate: -4 },
    { x: 58, y: 20, rotate: 10 },
    { x: 35, y: 8, rotate: 0 },
];

export function HouseBrickBurst({ partId, count, active = true }: HouseBrickBurstProps) {
    const detail = getDetailById(partId);
    if (!detail || !active || count <= 0) {
        return null;
    }

    const bricks = BRICK_OFFSETS.slice(0, count);

    return (
        <div className="pointer-events-none absolute inset-0 z-[25]" aria-hidden>
            {bricks.map((brick, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.3, y: 16 }}
                    animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1, 1, 0.85], y: [16, 0, -2, -6] }}
                    transition={{
                        duration: 1.1,
                        delay: i * 0.12,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    className="house-brick-token absolute text-lg sm:text-xl"
                    style={{
                        left: `${detail.x + (brick.x / 100) * detail.w}%`,
                        top: `${detail.y + (brick.y / 100) * detail.h}%`,
                        transform: `rotate(${brick.rotate}deg)`,
                    }}
                >
                    🧱
                </motion.span>
            ))}
        </div>
    );
}
