import { type ReactNode } from 'react';
import { CurrencyAmount } from '@/components/shared/CurrencyAmount';
import { cn } from '@/lib/utils';

interface StatCardProps {
    label: string;
    amount?: number;
    currency?: string;
    value?: ReactNode;
    className?: string;
    highlight?: boolean;
}

export function StatCard({ label, amount, currency, value, className, highlight }: StatCardProps) {
    const content =
        amount !== undefined ? (
            <CurrencyAmount amount={amount} currency={currency} brand layout="stat" />
        ) : (
            value
        );

    return (
        <article
            className={cn(
                'stat-card card-elevated relative flex flex-col items-center overflow-visible px-5 py-6 text-center transition-transform hover:-translate-y-0.5 md:px-6 md:py-7',
                highlight && 'ring-2 ring-accent/30',
                className,
            )}
        >
            <div
                className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r from-primary via-primary-light to-accent"
                aria-hidden
            />
            <p className="text-xs font-medium tracking-wide text-muted-foreground md:text-sm">{label}</p>
            <div className="stat-card-value mt-3 flex w-full items-center justify-center">{content}</div>
        </article>
    );
}
