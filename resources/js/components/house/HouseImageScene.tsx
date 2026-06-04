import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { getColorRevealClip, getWarmGlowOpacity } from '@/components/house/houseProgressVisual';

const FULL_HOUSE = '/image/house/house-full.png';

const SIZE_HEIGHT: Record<string, string> = {
    sm: 'min-h-[18rem] max-h-[28rem] sm:max-h-[34rem]',
    md: 'min-h-[22rem] max-h-[38rem] sm:max-h-[48rem]',
    lg: 'min-h-[26rem] max-h-[48rem] sm:max-h-[58rem] lg:max-h-[68rem] xl:max-h-[76rem]',
    celebration: 'min-h-[28rem] max-h-[50rem] sm:max-h-[60rem] md:max-h-[68rem] lg:max-h-[80rem]',
};

const HERO_HEIGHT = 'min-h-[28rem] max-h-[52rem] sm:max-h-[62rem] lg:max-h-[min(88vh,880px)]';

interface HouseImageSceneProps {
    percentage: number;
    highlightDetailId?: string | null;
    revealDetailId?: string | null;
    size?: 'sm' | 'md' | 'lg' | 'celebration';
    variant?: 'default' | 'hero';
}

export function HouseImageScene({
    percentage,
    revealDetailId = null,
    size = 'lg',
    variant = 'default',
}: HouseImageSceneProps) {
    const clipInset = useMemo(() => getColorRevealClip(percentage), [percentage]);
    const warmGlow = useMemo(() => getWarmGlowOpacity(percentage), [percentage]);
    const skeletonOpacity = useMemo(() => (percentage >= 100 ? 0 : 1), [percentage]);
    const isRevealing = revealDetailId != null;

    const heightClass = variant === 'hero' ? HERO_HEIGHT : (SIZE_HEIGHT[size] ?? SIZE_HEIGHT.lg);

    return (
        <div
            className={cn('house-scene house-scene-3d relative w-full overflow-visible', heightClass)}
            role="img"
            aria-label="House build progress"
        >
            <img
                src={FULL_HOUSE}
                alt=""
                aria-hidden
                className="invisible block w-full h-auto max-h-full object-contain"
            />

            <div className="house-scene-stage absolute inset-0">
                <div className="house-scene-inner absolute inset-0">
                    <img
                        src={FULL_HOUSE}
                        alt=""
                        aria-hidden
                        className="house-skeleton house-scene-layer absolute inset-0 h-full w-full object-contain object-center transition-opacity duration-700 ease-out"
                        style={{ opacity: skeletonOpacity }}
                    />

                    <div
                        className={cn(
                            'house-color-reveal absolute inset-0 transition-[clip-path] duration-700 ease-out',
                            isRevealing && 'house-stage-reveal',
                        )}
                        style={{ clipPath: `inset(${clipInset}% 0 0 0)` }}
                    >
                        <img
                            src={FULL_HOUSE}
                            alt=""
                            loading="eager"
                            decoding="async"
                            className="house-scene-layer house-scene-layer-color absolute inset-0 h-full w-full object-contain object-center"
                        />

                        <div
                            className="pointer-events-none absolute inset-0 transition-opacity duration-700 ease-out"
                            style={{
                                opacity: warmGlow,
                                background:
                                    'radial-gradient(ellipse 70% 60% at 50% 55%, rgba(255, 210, 100, 0.35) 0%, transparent 70%)',
                            }}
                            aria-hidden
                        />
                    </div>
                </div>

                <div className="house-ground-shadow pointer-events-none" aria-hidden />
            </div>
        </div>
    );
}
