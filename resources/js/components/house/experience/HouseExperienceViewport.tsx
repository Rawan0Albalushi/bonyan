import { cn } from '@/lib/utils';
import { HouseConstructionEffects } from '@/components/house/experience/HouseConstructionEffects';
import { HouseGoalPreview } from '@/components/house/experience/HouseGoalPreview';
import { HouseProgress } from '@/components/house/HouseProgress';

interface HouseExperienceViewportProps {
    progress: number;
    showLabel?: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'celebration' | 'immersive';
    liveBuild?: boolean;
    celebrateFromPercentage?: number | null;
    inlineCelebration?: boolean;
    animated?: boolean;
    /** Show a compact completed-house preview overlay (build-a-home encouragement). */
    showGoalPreview?: boolean;
}

export function HouseExperienceViewport({
    progress,
    showLabel = true,
    className,
    size = 'immersive',
    liveBuild = false,
    celebrateFromPercentage = null,
    inlineCelebration = false,
    animated = true,
    showGoalPreview = false,
}: HouseExperienceViewportProps) {
    const showGoal = showGoalPreview && progress < 100;

    return (
        <div className={cn('house-experience-viewport relative w-full', className)}>
            <div className="relative isolate w-full">
                <div className="relative mx-auto w-full px-0 sm:px-2">
                    <HouseProgress
                        percentage={progress}
                        size={size}
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

                    {showGoal && <HouseGoalPreview />}
                </div>
            </div>
        </div>
    );
}
