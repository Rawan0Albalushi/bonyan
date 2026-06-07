import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { getActiveLifeStage } from '@/components/house/houseLifeProgress';
import {
    HOUSE_SCENE_EFFECTS_BUILD_CLIP,
    HOUSE_SCENE_PLATFORM_CLIP,
    HOUSE_SCENE_WORKER_ROW_BOTTOM,
} from '@/components/house/houseSceneLayout';
import { clampPercentage } from '@/components/house/houseProgressVisual';
import { cn } from '@/lib/utils';

interface HouseConstructionEffectsProps {
    progress: number;
    className?: string;
}

type WorkerVariant = 'hammer' | 'shovel' | 'carry';

interface WorkerConfig {
    insetInline: string;
    delay: number;
    variant: WorkerVariant;
    scale?: number;
}

const PLATFORM_WORKERS: WorkerConfig[] = [
    { insetInline: '8%', delay: 0, variant: 'hammer' },
    { insetInline: '20%', delay: 0.35, variant: 'shovel', scale: 0.96 },
    { insetInline: '33%', delay: 0.7, variant: 'carry' },
    { insetInline: '46%', delay: 1.05, variant: 'hammer', scale: 1.04 },
    { insetInline: '59%', delay: 0.5, variant: 'shovel' },
    { insetInline: '72%', delay: 0.85, variant: 'hammer', scale: 0.98 },
    { insetInline: '84%', delay: 1.2, variant: 'carry', scale: 1.02 },
];

function DustPuff({ left, top, delay, size = 1 }: { left: string; top: string; delay: number; size?: number }) {
    return (
        <motion.span
            className="absolute rounded-full bg-[#c4b59a]/65 blur-[2px]"
            style={{ left, top, width: `${0.7 * size}rem`, height: `${0.7 * size}rem` }}
            initial={{ opacity: 0, scale: 0.4, y: 0 }}
            animate={{ opacity: [0, 0.8, 0], scale: [0.4, 1.8, 2.3], y: [-4, -24, -36] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay }}
            aria-hidden
        />
    );
}

function Spark({ left, top, delay }: { left: string; top: string; delay: number }) {
    return (
        <motion.span
            className="absolute h-1.5 w-1.5 rounded-full bg-accent-light shadow-[0_0_10px_var(--color-accent-light)] sm:h-2 sm:w-2"
            style={{ left, top }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.4, 0],
                x: [0, 6, -5],
                y: [0, -5, 4],
            }}
            transition={{ duration: 0.55, repeat: Infinity, ease: 'easeOut', delay, repeatDelay: 1.6 }}
            aria-hidden
        />
    );
}

function WorkerTool({ variant, delay }: { variant: WorkerVariant; delay: number }) {
    if (variant === 'carry') {
        return (
            <motion.g
                animate={{ y: [0, -1.5, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay }}
            >
                <rect x="4" y="10" width="5" height="4" rx="1" fill="currentColor" opacity="0.9" />
            </motion.g>
        );
    }

    if (variant === 'shovel') {
        return (
            <motion.g
                animate={{ rotate: [-20, 14, -20] }}
                transition={{ duration: 1.35, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.1 }}
                style={{ transformOrigin: '17px 13px' }}
            >
                <rect x="14" y="11" width="9" height="2.5" rx="1" fill="currentColor" />
                <rect x="21" y="13" width="2" height="7" rx="0.5" fill="currentColor" />
            </motion.g>
        );
    }

    return (
        <motion.g
            animate={{ rotate: [-32, 12, -32] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.15 }}
            style={{ transformOrigin: '18px 12px' }}
        >
            <rect x="14" y="11" width="9" height="2.5" rx="1" fill="currentColor" />
        </motion.g>
    );
}

function WorkerSilhouette({ insetInline, delay, variant, scale = 1 }: WorkerConfig) {
    return (
        <motion.div
            className="absolute text-primary-dark/88 drop-shadow-md"
            style={{
                insetInlineStart: insetInline,
                bottom: HOUSE_SCENE_WORKER_ROW_BOTTOM,
                scale,
            }}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay }}
            aria-hidden
        >
            <svg
                viewBox="0 0 24 32"
                className="house-experience-worker h-[clamp(2.5rem,6.8vw,5.25rem)] w-[clamp(1.85rem,5.1vw,4rem)]"
            >
                <ellipse cx="12" cy="5" rx="4.2" ry="4.2" fill="currentColor" />
                <rect x="8.5" y="9" width="7" height="11" rx="2" fill="currentColor" />
                <WorkerTool variant={variant} delay={delay} />
                <rect x="7.5" y="20" width="3.5" height="10" rx="1" fill="currentColor" />
                <rect x="13" y="20" width="3.5" height="10" rx="1" fill="currentColor" />
            </svg>
        </motion.div>
    );
}

function WarmWindowGlow({ left, top, delay }: { left: string; top: string; delay: number }) {
    return (
        <motion.div
            className="absolute rounded-full bg-accent/90 blur-[12px] sm:blur-[14px]"
            style={{ left, top, width: '1.4rem', height: '1.4rem' }}
            animate={{ opacity: [0.35, 0.95, 0.35], scale: [0.9, 1.3, 0.9] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay }}
            aria-hidden
        />
    );
}

export function HouseConstructionEffects({ progress, className }: HouseConstructionEffectsProps) {
    const stage = getActiveLifeStage(progress);
    const p = clampPercentage(progress);
    const isBuilding = p < 100;
    const showWorkers = isBuilding && p < 75;
    const showSparks = stage === 'base' || stage === 'roof';
    const showWarmLights = stage === 'lights' || stage === 'interior' || stage === 'complete';

    const buildLineTop = useMemo(() => `${Math.max(10, 72 - p * 0.58)}%`, [p]);

    return (
        <div className={cn('pointer-events-none absolute inset-0', className)} aria-hidden>
            <div
                className="absolute inset-0 z-[2]"
                style={{ clipPath: HOUSE_SCENE_EFFECTS_BUILD_CLIP }}
            >
                {isBuilding && (
                    <>
                        <motion.div
                            className="absolute inset-x-[14%] h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent sm:h-[3px]"
                            style={{ top: buildLineTop }}
                            animate={{ opacity: [0.35, 0.8, 0.35] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                        />

                        <DustPuff left="28%" top="54%" delay={0} />
                        <DustPuff left="40%" top="48%" delay={0.5} size={1.15} />
                        <DustPuff left="52%" top="42%" delay={1} size={1.25} />
                        <DustPuff left="64%" top="50%" delay={1.5} />
                        <DustPuff left="36%" top="36%" delay={2} size={1.1} />
                        <DustPuff left="58%" top="58%" delay={2.5} size={0.95} />
                        <DustPuff left="46%" top="32%" delay={3} size={1.2} />

                        {showSparks && (
                            <>
                                <Spark left="42%" top="36%" delay={0} />
                                <Spark left="47%" top="40%" delay={0.25} />
                                <Spark left="52%" top="44%" delay={0.5} />
                                <Spark left="49%" top="48%" delay={0.75} />
                                <Spark left="55%" top="38%" delay={1} />
                                <Spark left="45%" top="50%" delay={1.25} />
                            </>
                        )}
                    </>
                )}

                {showWarmLights && (
                    <div className="absolute inset-x-[18%] top-[22%] h-[34%]">
                        <WarmWindowGlow left="14%" top="40%" delay={0} />
                        <WarmWindowGlow left="38%" top="36%" delay={0.45} />
                        <WarmWindowGlow left="52%" top="42%" delay={0.9} />
                        <WarmWindowGlow left="68%" top="38%" delay={1.35} />
                        <WarmWindowGlow left="82%" top="44%" delay={1.8} />
                    </div>
                )}
            </div>

            {showWorkers && (
                <div
                    className="absolute inset-0 z-[5]"
                    style={{ clipPath: HOUSE_SCENE_PLATFORM_CLIP }}
                >
                    {PLATFORM_WORKERS.map((worker, index) => (
                        <WorkerSilhouette key={`worker-${index}`} {...worker} />
                    ))}
                </div>
            )}
        </div>
    );
}
