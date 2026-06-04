import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
    HOUSE_BASE_LAYER,
    HOUSE_FULL_IMAGE,
    getVisibleLayers,
    isHouseComplete,
} from '@/components/house/houseLayers';

const SIZE_HEIGHT: Record<string, string> = {
    sm: 'min-h-[15rem] max-h-[22rem] sm:max-h-[28rem]',
    md: 'min-h-[18rem] max-h-[30rem] sm:max-h-[38rem]',
    lg: 'min-h-[20rem] max-h-[36rem] sm:max-h-[44rem] lg:max-h-[52rem] xl:max-h-[58rem]',
    celebration: 'min-h-[22rem] max-h-[38rem] sm:max-h-[46rem] md:max-h-[52rem] lg:max-h-[62rem]',
};

const HERO_HEIGHT =
    'min-h-[26rem] max-h-[48rem] sm:max-h-[58rem] md:max-h-[64rem] lg:min-h-[34rem] lg:max-h-[min(88vh,880px)]';

interface HouseImageSceneProps {
    /** Funding progress toward goal (raised / target), 0–100. */
    percentage: number;
    highlightDetailId?: string | null;
    revealDetailId?: string | null;
    size?: 'sm' | 'md' | 'lg' | 'celebration';
    variant?: 'default' | 'hero';
}

export function HouseImageScene({
    percentage,
    highlightDetailId = null,
    revealDetailId = null,
    size = 'lg',
    variant = 'default',
}: HouseImageSceneProps) {
    const { t } = useTranslation();
    const complete = isHouseComplete(percentage);
    const visibleLayers = useMemo(() => getVisibleLayers(percentage), [percentage]);

    const heightClass = variant === 'hero' ? HERO_HEIGHT : (SIZE_HEIGHT[size] ?? SIZE_HEIGHT.lg);

    return (
        <div
            className={cn('house-scene house-scene-3d relative w-full overflow-visible', heightClass)}
            role="img"
            aria-label={t('house.viewer_label')}
        >
            <img
                src={HOUSE_FULL_IMAGE}
                alt=""
                aria-hidden
                className="invisible block w-full h-auto max-h-full object-contain"
            />

            <div className="house-scene-stage absolute inset-0">
                <div className="house-scene-inner absolute inset-0">
                    {complete ? (
                        <img
                            src={HOUSE_FULL_IMAGE}
                            alt=""
                            loading="eager"
                            decoding="async"
                            className="house-scene-layer absolute inset-0 h-full w-full object-contain object-center"
                        />
                    ) : (
                        visibleLayers.map((layer) => {
                            const isRevealing = revealDetailId === layer.id;
                            const isHighlighted = highlightDetailId === layer.id;
                            const isBase = layer.id === HOUSE_BASE_LAYER.id;

                            return (
                                <img
                                    key={layer.id}
                                    src={layer.image}
                                    alt=""
                                    loading={isBase ? 'eager' : 'lazy'}
                                    decoding="async"
                                    aria-hidden
                                    className={cn(
                                        'house-scene-layer absolute inset-0 h-full w-full object-contain object-center',
                                        !isBase && 'transition-opacity duration-700 ease-out',
                                        isRevealing && 'house-layer-reveal',
                                        isHighlighted && 'house-layer-highlight',
                                    )}
                                />
                            );
                        })
                    )}
                </div>

                <div className="house-ground-shadow pointer-events-none" aria-hidden />
            </div>
        </div>
    );
}
