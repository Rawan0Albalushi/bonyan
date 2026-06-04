import { useTranslation } from 'react-i18next';
import {
    HOUSE_CONSTRUCTION_PHASES,
    HOUSE_PHASE_FUNDING_THRESHOLDS,
    getMaxPhaseIndexFromFunding,
} from '@/components/house/housePhases';
import { clampPercentage } from '@/components/house/houseProgressVisual';
import { cn } from '@/lib/utils';

interface HousePhaseIndicatorProps {
    fundingPercent: number;
    className?: string;
}

/** Shows the three build phases (0–50 / 50–80 / 80–100) and which is active. */
export function HousePhaseIndicator({ fundingPercent, className }: HousePhaseIndicatorProps) {
    const { t } = useTranslation();
    const p = clampPercentage(fundingPercent);
    const activeIndex = getMaxPhaseIndexFromFunding(p);

    return (
        <div
            className={cn(
                'flex flex-wrap items-center justify-center gap-1.5 sm:gap-2',
                className,
            )}
            role="list"
            aria-label={t('house.viewer_label')}
        >
            {HOUSE_CONSTRUCTION_PHASES.map((phase, index) => {
                const isActive = index === activeIndex;
                const isDone = index < activeIndex || p >= HOUSE_PHASE_FUNDING_THRESHOLDS[index + 1];

                return (
                    <span
                        key={phase.id}
                        role="listitem"
                        className={cn(
                            'rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors sm:text-[11px]',
                            isActive &&
                                'border-primary/30 bg-primary/10 text-primary shadow-sm',
                            isDone && !isActive && 'border-primary/15 bg-muted/50 text-muted-foreground',
                            !isActive && !isDone && 'border-border/60 bg-card/80 text-muted-foreground/70',
                        )}
                    >
                        {t(phase.labelKey)}
                    </span>
                );
            })}
        </div>
    );
}
