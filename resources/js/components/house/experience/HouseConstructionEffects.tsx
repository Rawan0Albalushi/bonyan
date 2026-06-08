import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { getActiveLifeStage } from '@/components/house/houseLifeProgress';
import {
    HOUSE_SCENE_EFFECTS_BUILD_CLIP,
    HOUSE_SCENE_WORKERS_CLIP,
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
    outfit?: 'navy' | 'orange' | 'olive' | 'slate';
}

const PLATFORM_WORKERS: WorkerConfig[] = [
    { insetInline: '8%', delay: 0, variant: 'hammer', outfit: 'orange' },
    { insetInline: '20%', delay: 0.35, variant: 'shovel', scale: 0.96, outfit: 'navy' },
    { insetInline: '33%', delay: 0.7, variant: 'carry', outfit: 'olive' },
    { insetInline: '46%', delay: 1.05, variant: 'hammer', scale: 1.04, outfit: 'slate' },
    { insetInline: '59%', delay: 0.5, variant: 'shovel', outfit: 'orange' },
    { insetInline: '72%', delay: 0.85, variant: 'hammer', scale: 0.98, outfit: 'navy' },
    { insetInline: '84%', delay: 1.2, variant: 'carry', scale: 1.02, outfit: 'olive' },
];

const WORKER_OUTFITS: Record<
    NonNullable<WorkerConfig['outfit']>,
    { overalls: string; overallsDark: string; shirt: string; stripe: string }
> = {
    navy: { overalls: '#2c4a6e', overallsDark: '#1e3550', shirt: '#5a7a9a', stripe: '#f0c040' },
    orange: { overalls: '#c9880a', overallsDark: '#9a6808', shirt: '#e8b84a', stripe: '#fff4d6' },
    olive: { overalls: '#4a6741', overallsDark: '#354d2e', shirt: '#7a9a72', stripe: '#f0c040' },
    slate: { overalls: '#4a5568', overallsDark: '#364152', shirt: '#718096', stripe: '#f0c040' },
};

const WORKER_SKIN = '#d4a574';
const WORKER_BOOT = '#3d2914';
const WORKER_HAT = '#f0c040';
const WORKER_HAT_RIM = '#c9880a';

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

function getWorkerLeanTowardHouse(insetInline: string): number {
    const pct = Number.parseFloat(insetInline);
    if (Number.isNaN(pct)) {
        return 0;
    }

    return ((50 - pct) / 50) * 6;
}

const WORKER_TORSO_BACK_PATH = 'M6.8 26.5 L8.8 14.5 L15.2 14.5 L17.2 26.5 Z';

function WorkerToolBack({
    variant,
    delay,
    toolColor = '#6b5344',
    layer,
}: {
    variant: WorkerVariant;
    delay: number;
    toolColor?: string;
    layer: 'behind' | 'front';
}) {
    if (variant === 'carry') {
        if (layer === 'behind') {
            return null;
        }

        return (
            <motion.g
                animate={{ y: [1, -2.5, 1] }}
                transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut', delay }}
            >
                <rect x="9.2" y="1.5" width="5.6" height="3.4" rx="0.7" fill="#a08060" stroke="#7a6048" strokeWidth="0.25" />
                <rect x="9.8" y="2.2" width="4.4" height="1" rx="0.25" fill="#c4a882" opacity="0.75" />
            </motion.g>
        );
    }

    if (variant === 'shovel') {
        const shovelMotion = {
            animate: { rotate: [10, -14, 10], y: [0, -1.5, 0] },
            transition: { duration: 1.35, repeat: Infinity, ease: 'easeInOut' as const, delay: delay + 0.1 },
            style: { transformOrigin: '12px 18px' },
        };

        if (layer === 'behind') {
            return (
                <motion.g {...shovelMotion}>
                    <rect x="11.1" y="8" width="1.8" height="9" rx="0.5" fill={toolColor} />
                </motion.g>
            );
        }

        return (
            <motion.g {...shovelMotion}>
                <rect x="11.1" y="2" width="1.8" height="7" rx="0.5" fill={toolColor} />
                <path d="M8.5 2.2 H15.5 Q16.5 2.2 16.2 3.5 L15.2 5.2 Q14.5 6 13.5 6 H10.5 Q9.5 6 8.8 5.2 L7.8 3.5 Q7.5 2.2 8.5 2.2 Z" fill="#8a9098" />
            </motion.g>
        );
    }

    const hammerMotion = {
        animate: { rotate: [32, -38, 32] },
        transition: { duration: 1.05, repeat: Infinity, ease: 'easeInOut' as const, delay: delay + 0.15 },
        style: { transformOrigin: '12px 17px' },
    };

    if (layer === 'behind') {
        return (
            <motion.g {...hammerMotion}>
                <rect x="11" y="10" width="2" height="7" rx="0.5" fill={toolColor} />
            </motion.g>
        );
    }

    return (
        <motion.g {...hammerMotion}>
            <rect x="11" y="4" width="2" height="7" rx="0.5" fill={toolColor} />
            <rect x="8" y="0.8" width="8" height="3.6" rx="0.9" fill="#5a4030" />
            <rect x="8.5" y="1.2" width="7" height="0.8" rx="0.3" fill="#7a5840" opacity="0.55" />
        </motion.g>
    );
}

function WorkerTorsoBack({ colors }: { colors: (typeof WORKER_OUTFITS)[keyof typeof WORKER_OUTFITS] }) {
    return (
        <g>
            <path d={WORKER_TORSO_BACK_PATH} fill={colors.overalls} />
            <path
                d="M9.2 14.5 L12 21.5 L14.8 14.5"
                fill="none"
                stroke={colors.overallsDark}
                strokeWidth="1.1"
                strokeLinecap="round"
                opacity="0.65"
            />
            <rect x="8.2" y="19.5" width="7.6" height="1.1" rx="0.3" fill={colors.stripe} opacity="0.9" />
            <rect x="9.5" y="16.5" width="5" height="0.7" rx="0.2" fill={colors.overallsDark} opacity="0.4" />
            <rect x="7.8" y="25.5" width="8.4" height="0.9" rx="0.3" fill={colors.overallsDark} />
            <ellipse cx="12" cy="14.2" rx="2.2" ry="0.9" fill={colors.shirt} />
        </g>
    );
}

function WorkerFigure({ insetInline, delay, variant, scale = 1, outfit = 'navy' }: WorkerConfig) {
    const colors = WORKER_OUTFITS[outfit];
    const toolColor = '#6b5344';
    const lean = getWorkerLeanTowardHouse(insetInline);

    return (
        <motion.div
            className="absolute origin-bottom overflow-visible drop-shadow-[0_3px_6px_rgba(6,77,58,0.35)]"
            style={{
                insetInlineStart: insetInline,
                bottom: HOUSE_SCENE_WORKER_ROW_BOTTOM,
                scale,
                rotate: `${lean}deg`,
            }}
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay }}
            aria-hidden
        >
            <svg
                viewBox="0 -10 24 50"
                overflow="visible"
                className="house-experience-worker h-[clamp(3.75rem,10vw,7.8rem)] w-[clamp(2.5rem,6.25vw,5.6rem)] overflow-visible"
            >
                {/* Work boots — seen from behind */}
                <rect x="7.8" y="34.5" width="3.4" height="3.2" rx="0.7" fill={WORKER_BOOT} />
                <rect x="12.8" y="34.5" width="3.4" height="3.2" rx="0.7" fill={WORKER_BOOT} />
                <rect x="7.2" y="36.8" width="4.2" height="1.1" rx="0.35" fill="#2a1c0e" />
                <rect x="12.2" y="36.8" width="4.2" height="1.1" rx="0.35" fill="#2a1c0e" />

                {/* Overalls — legs */}
                <rect x="8.2" y="26.5" width="3.2" height="8.5" rx="1" fill={colors.overalls} />
                <rect x="12.6" y="26.5" width="3.2" height="8.5" rx="1" fill={colors.overalls} />
                <rect x="8.6" y="28.5" width="2.4" height="0.55" rx="0.2" fill={colors.overallsDark} opacity="0.45" />
                <rect x="13" y="28.5" width="2.4" height="0.55" rx="0.2" fill={colors.overallsDark} opacity="0.45" />

                {/* Tool shaft — behind torso so the body occludes the grip area */}
                <WorkerToolBack variant={variant} delay={delay} toolColor={toolColor} layer="behind" />

                {/* Overalls — back & shoulders (covers tool mid-section) */}
                <WorkerTorsoBack colors={colors} />

                {/* Arms reaching toward the house */}
                {variant === 'hammer' && (
                    <>
                        <motion.g
                            animate={{ rotate: [6, -10, 6] }}
                            transition={{ duration: 1.05, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.15 }}
                            style={{ transformOrigin: '15px 16px' }}
                        >
                            <rect x="14.2" y="8" width="2.1" height="11" rx="0.75" fill={colors.overalls} />
                            <ellipse cx="15.2" cy="7.4" rx="1.15" ry="0.9" fill={WORKER_SKIN} />
                        </motion.g>
                        <rect x="6.8" y="15" width="2" height="7.5" rx="0.75" fill={colors.overalls} />
                        <ellipse cx="7.8" cy="14.4" rx="1" ry="0.85" fill={WORKER_SKIN} />
                    </>
                )}
                {variant === 'shovel' && (
                    <>
                        <rect x="7" y="10" width="2" height="9.5" rx="0.75" fill={colors.overalls} />
                        <rect x="15" y="10" width="2" height="9.5" rx="0.75" fill={colors.overalls} />
                        <ellipse cx="8" cy="9.4" rx="1" ry="0.85" fill={WORKER_SKIN} />
                        <ellipse cx="16" cy="9.4" rx="1" ry="0.85" fill={WORKER_SKIN} />
                    </>
                )}
                {variant === 'carry' && (
                    <motion.g
                        animate={{ y: [0.5, -1.5, 0.5] }}
                        transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut', delay }}
                    >
                        <rect x="7.2" y="9" width="2" height="9" rx="0.75" fill={colors.overalls} />
                        <rect x="14.8" y="9" width="2" height="9" rx="0.75" fill={colors.overalls} />
                        <ellipse cx="8.2" cy="8.4" rx="1" ry="0.85" fill={WORKER_SKIN} />
                        <ellipse cx="15.8" cy="8.4" rx="1" ry="0.85" fill={WORKER_SKIN} />
                    </motion.g>
                )}

                {/* Tool head / blade / load — above torso, below hard hat */}
                <WorkerToolBack variant={variant} delay={delay} toolColor={toolColor} layer="front" />

                {/* Hard hat — rear view */}
                <ellipse cx="12" cy="10.5" rx="5.2" ry="3.4" fill={WORKER_HAT} />
                <ellipse cx="12" cy="12.2" rx="5.6" ry="1.15" fill={WORKER_HAT_RIM} />
                <rect x="10.8" y="8.2" width="2.4" height="1.1" rx="0.35" fill={WORKER_HAT_RIM} opacity="0.55" />
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
    const showWorkers = isBuilding;
    const showSparks = stage === 'base' || stage === 'roof';
    const showWarmLights = stage === 'lights' || stage === 'interior' || stage === 'complete';

    const buildLineTop = useMemo(() => `${Math.max(10, 72 - p * 0.58)}%`, [p]);

    return (
        <div className={cn('pointer-events-none absolute inset-0 z-[6]', className)} aria-hidden>
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
                    className="absolute inset-0 z-[5] overflow-visible"
                    style={{ clipPath: HOUSE_SCENE_WORKERS_CLIP }}
                >
                    {PLATFORM_WORKERS.map((worker, index) => (
                        <WorkerFigure key={`worker-${index}`} {...worker} />
                    ))}
                </div>
            )}
        </div>
    );
}
