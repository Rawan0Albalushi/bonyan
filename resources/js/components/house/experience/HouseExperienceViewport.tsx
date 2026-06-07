import { cn } from '@/lib/utils';
import { HouseConstructionEffects } from '@/components/house/experience/HouseConstructionEffects';
import { HouseProgress } from '@/components/house/HouseProgress';

interface HouseExperienceViewportProps {
    progress: number;
    showLabel?: boolean;
    className?: string;
    liveBuild?: boolean;
    celebrateFromPercentage?: number | null;
    inlineCelebration?: boolean;
    animated?: boolean;
}

export function HouseExperienceViewport({
    progress,
    showLabel = true,
    className,
    liveBuild = false,
    celebrateFromPercentage = null,
    inlineCelebration = false,
    animated = true,
}: HouseExperienceViewportProps) {
    return (
        <div className={cn('house-experience-viewport relative w-full', className)}>
            <div className="relative isolate w-full">
                <div className="relative mx-auto w-full px-0 sm:px-2">
                    <HouseProgress
                        percentage={progress}
                        size="immersive"
                        variant="experience"
                        showLabel={showLabel}
                        liveBuild={liveBuild}
                        celebrateFromPercentage={celebrateFromPercentage}
                        inlineCelebration={inlineCelebration}
                        animated={animated}
                        className="mx-auto"
                    >
                        <HouseConstructionEffects progress={progress} />
                    </HouseProgress>
                </div>
            </div>
        </div>
    );
}
