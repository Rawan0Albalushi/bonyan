import { lazy, Suspense } from 'react';
import { HouseSceneErrorBoundary } from '@/components/house/HouseSceneErrorBoundary';
import i18n from '@/i18n';

const HouseCanvas = lazy(() =>
    import('@/components/house/HouseCanvas').then((m) => ({ default: m.HouseCanvas })),
);

interface HouseSceneProps {
    donationsCount: number;
    highlightedPartId?: string | null;
    revealPartId?: string | null;
    hoveredPartId?: string | null;
    onPartHover?: (id: string | null) => void;
    onPartClick?: (id: string) => void;
    interactive?: boolean;
    celebrateMode?: boolean;
}

function SceneFallback() {
    return (
        <div className="house-scene-fallback flex h-full w-full items-center justify-center" aria-hidden>
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-pulse rounded-full border-2 border-white/20 border-t-accent-light" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
                    {i18n.t('common.loading')}
                </span>
            </div>
        </div>
    );
}

export function HouseScene(props: HouseSceneProps) {
    return (
        <div className="h-full w-full">
            <HouseSceneErrorBoundary>
                <Suspense fallback={<SceneFallback />}>
                    <HouseCanvas {...props} />
                </Suspense>
            </HouseSceneErrorBoundary>
        </div>
    );
}
