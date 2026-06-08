import { useTranslation } from 'react-i18next';
import type { Project } from '@/api/types';
import { clampPercentage } from '@/components/house/houseProgressVisual';
import { useAnimatedFunding } from '@/components/house/useAnimatedFunding';
import { CurrencyAmount } from '@/components/shared/CurrencyAmount';
import { Progress } from '@/components/ui/progress';
import { useLocale } from '@/contexts/LocaleContext';
import { cn, ENGLISH_NUMERALS_CLASS, formatNumber } from '@/lib/utils';

const ANIMATION_MS = 1000;

interface SuccessProgressCardProps {
    fundingProgress: number;
    fundingBefore: number;
    progressAdded: number;
    project: Project;
}

export function SuccessProgressCard({
    fundingProgress,
    fundingBefore,
    progressAdded,
    project,
}: SuccessProgressCardProps) {
    const { t } = useTranslation();
    const { locale } = useLocale();
    const shouldAnimate = progressAdded > 0;

    const displayProgress = useAnimatedFunding(
        fundingBefore,
        fundingProgress,
        shouldAnimate,
        ANIMATION_MS,
    );

    return (
        <div className="border-b border-border/50 px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t('success.new_progress')}
                </p>
                <div className="flex items-baseline gap-2">
                    {progressAdded > 0 && (
                        <span
                            className={cn('text-xs font-semibold text-accent', ENGLISH_NUMERALS_CLASS)}
                            dir="ltr"
                        >
                            +{formatNumber(progressAdded, locale)}%
                        </span>
                    )}
                    <span
                        className={cn(
                            'font-display text-2xl font-extrabold leading-none text-primary sm:text-3xl',
                            ENGLISH_NUMERALS_CLASS,
                        )}
                        dir="ltr"
                    >
                        {formatNumber(clampPercentage(displayProgress), locale)}%
                    </span>
                </div>
            </div>

            {progressAdded > 0 && (
                <p className="mt-1 text-end text-xs text-muted-foreground">{t('success.progress_added')}</p>
            )}

            <Progress value={displayProgress} variant="hero" className="mt-3 h-2.5 sm:h-3" />

            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                    <span>{t('home.raised')}</span>
                    <CurrencyAmount
                        amount={project.raised_amount}
                        currency={project.currency}
                        iconSize="sm"
                        amountClassName="font-semibold text-foreground"
                    />
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <span>{t('home.goal')}</span>
                    <CurrencyAmount
                        amount={project.goal_amount}
                        currency={project.currency}
                        iconSize="sm"
                        amountClassName="font-semibold text-foreground"
                    />
                </span>
            </div>
        </div>
    );
}
