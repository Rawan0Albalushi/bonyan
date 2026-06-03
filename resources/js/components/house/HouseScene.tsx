import { lazy, Suspense } from 'react';

const HouseCanvas = lazy(() =>
    import('@/components/house/HouseCanvas').then((m) => ({ default: m.HouseCanvas })),
);

interface HouseSceneProps {
    donationsCount: number;
    highlightedPartId?: string | null;
    hoveredPartId?: string | null;
    onPartHover?: (id: string | null) => void;
    onPartClick?: (id: string) => void;
    interactive?: boolean;
}

function SceneFallback() {
    return (
        <div
            className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-b from-[#f5faf8] to-[#e8f2ef]"
            aria-hidden
        >
            <div className="h-16 w-16 animate-pulse rounded-full bg-primary/10" />
        </div>
    );
}

export function HouseScene(props: HouseSceneProps) {
    return (
        <Suspense fallback={<SceneFallback />}>
            <HouseCanvas {...props} />
        </Suspense>
    );
}
