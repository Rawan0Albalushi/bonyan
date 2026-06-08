import { Hourglass, Target, TrendingUp, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CurrencyAmount } from '@/components/shared/CurrencyAmount';
import { cn } from '@/lib/utils';

interface FundingSummaryRowProps {
    goalAmount: number;
    raisedAmount: number;
    remainingAmount: number;
    currency?: string;
    className?: string;
}

type FundingStat = {
    label: string;
    amount: number;
    icon: LucideIcon;
    iconBg: string;
    iconColor: string;
    highlight?: boolean;
};

export function FundingSummaryRow({
    goalAmount,
    raisedAmount,
    remainingAmount,
    currency,
    className,
}: FundingSummaryRowProps) {
    const { t } = useTranslation();

    const stats: FundingStat[] = [
        {
            label: t('home.goal'),
            amount: goalAmount,
            icon: Target,
            iconBg: 'bg-gradient-to-br from-primary/20 to-primary/8',
            iconColor: 'text-primary',
        },
        {
            label: t('home.raised'),
            amount: raisedAmount,
            icon: TrendingUp,
            iconBg: 'bg-gradient-to-br from-accent/25 to-accent/10',
            iconColor: 'text-accent',
            highlight: true,
        },
        {
            label: t('home.remaining'),
            amount: remainingAmount,
            icon: Hourglass,
            iconBg: 'bg-gradient-to-br from-secondary to-secondary/60',
            iconColor: 'text-primary/80',
        },
    ];

    return (
        <div
            className={cn(
                'grid grid-cols-3 gap-2 sm:gap-3',
                className,
            )}
            role="list"
            aria-label={t('houseExperience.funding_summary_label')}
        >
            {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                    <div
                        key={stat.label}
                        role="listitem"
                        className={cn(
                            'flex flex-col items-center gap-1.5 rounded-xl border border-primary/10 bg-card/70 px-2 py-3 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-brand sm:gap-2 sm:rounded-2xl sm:px-3 sm:py-4',
                            stat.highlight && 'ring-1 ring-accent/25',
                        )}
                    >
                        <div
                            className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-xl sm:h-10 sm:w-10',
                                stat.iconBg,
                            )}
                        >
                            <Icon
                                className={cn('h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]', stat.iconColor)}
                                strokeWidth={2.25}
                                aria-hidden
                            />
                        </div>

                        <p className="text-center text-[0.625rem] font-semibold leading-tight tracking-wide text-muted-foreground sm:text-xs">
                            {stat.label}
                        </p>

                        <CurrencyAmount
                            amount={stat.amount}
                            currency={currency}
                            brand
                            iconSize="sm"
                            amountClassName="text-sm font-bold sm:text-base"
                        />
                    </div>
                );
            })}
        </div>
    );
}
