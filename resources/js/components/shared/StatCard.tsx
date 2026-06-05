import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { Hourglass, Target, TrendingUp, type LucideIcon } from 'lucide-react';
import { CurrencyAmount } from '@/components/shared/CurrencyAmount';
import { cn } from '@/lib/utils';

type StatCardVariant = 'raised' | 'goal' | 'remaining';

interface StatCardProps {
    label: string;
    amount?: number;
    currency?: string;
    value?: ReactNode;
    className?: string;
    highlight?: boolean;
    variant?: StatCardVariant;
    index?: number;
}

const variantConfig: Record<
    StatCardVariant,
    {
        icon: LucideIcon;
        iconBg: string;
        iconColor: string;
        glow: string;
        wash: string;
        accent: string;
    }
> = {
    raised: {
        icon: TrendingUp,
        iconBg: 'bg-gradient-to-br from-accent/25 to-accent/10',
        iconColor: 'text-accent',
        glow: 'bg-accent/15',
        wash: 'from-accent/[0.08]',
        accent: 'via-accent',
    },
    goal: {
        icon: Target,
        iconBg: 'bg-gradient-to-br from-primary/20 to-primary/8',
        iconColor: 'text-primary',
        glow: 'bg-primary/12',
        wash: 'from-primary/[0.07]',
        accent: 'via-primary',
    },
    remaining: {
        icon: Hourglass,
        iconBg: 'bg-gradient-to-br from-secondary to-secondary/60',
        iconColor: 'text-primary/80',
        glow: 'bg-primary/8',
        wash: 'from-primary/[0.05]',
        accent: 'via-primary/55',
    },
};

function AnimatedCurrencyAmount({
    amount,
    currency,
    brand,
}: {
    amount: number;
    currency?: string;
    brand?: boolean;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-40px' });
    const [displayAmount, setDisplayAmount] = useState(0);

    useEffect(() => {
        if (!isInView) {
            return;
        }

        const duration = 1100;
        const start = performance.now();
        let frame: number;

        const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayAmount(Math.round(amount * eased));

            if (progress < 1) {
                frame = requestAnimationFrame(tick);
            }
        };

        frame = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frame);
    }, [amount, isInView]);

    return (
        <span ref={ref} className="inline-flex">
            <CurrencyAmount amount={displayAmount} currency={currency} brand={brand} layout="stat" />
        </span>
    );
}

export function StatCard({
    label,
    amount,
    currency,
    value,
    className,
    highlight,
    variant = 'goal',
    index = 0,
}: StatCardProps) {
    const config = variantConfig[variant];
    const Icon = config.icon;

    const content =
        amount !== undefined ? (
            <AnimatedCurrencyAmount amount={amount} currency={currency} brand />
        ) : (
            value
        );

    return (
        <motion.article
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-48px' }}
            transition={{
                duration: 0.55,
                delay: index * 0.12,
                ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ y: -6 }}
            className={cn(
                'stat-card group relative flex flex-col items-center overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-b from-card via-card to-secondary/25 px-4 py-5 text-center shadow-brand transition-shadow duration-300 hover:shadow-brand-lg sm:px-6 sm:py-7 md:px-7 md:py-8',
                highlight && 'ring-1 ring-accent/35',
                className,
            )}
        >
            <div
                className={cn(
                    'pointer-events-none absolute -end-8 -top-8 h-28 w-28 rounded-full blur-2xl transition-opacity duration-500 group-hover:opacity-100',
                    config.glow,
                    highlight ? 'opacity-80' : 'opacity-50',
                )}
                aria-hidden
            />

            <div
                className={cn(
                    'pointer-events-none absolute inset-x-0 top-0 h-20 rounded-t-2xl bg-gradient-to-b to-transparent',
                    config.wash,
                )}
                aria-hidden
            />

            <div
                className={cn(
                    'mb-5 h-[3px] rounded-full bg-gradient-to-r from-transparent to-transparent transition-[width] duration-300 ease-out',
                    highlight ? 'w-16 group-hover:w-[4.5rem]' : 'w-12 group-hover:w-14',
                    config.accent,
                )}
                aria-hidden
            />

            <div
                className={cn(
                    'relative mb-4 flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-105',
                    config.iconBg,
                )}
            >
                <Icon className={cn('h-5 w-5', config.iconColor)} strokeWidth={2.25} aria-hidden />
            </div>

            <p className="relative text-xs font-semibold tracking-wide text-muted-foreground md:text-sm">
                {label}
            </p>

            <div className="stat-card-value relative mt-3 flex w-full items-center justify-center">
                {content}
            </div>

            {highlight && (
                <div
                    className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent"
                    aria-hidden
                />
            )}
        </motion.article>
    );
}
