import { motion } from 'framer-motion';
import { BadgeCheck, Coins, Smartphone, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type StepVariant = 'amount' | 'phone' | 'complete';

interface HowDonateStepCardProps {
    step: number;
    label: string;
    variant: StepVariant;
    index?: number;
    showConnector?: boolean;
    className?: string;
}

const variantConfig: Record<
    StepVariant,
    {
        icon: LucideIcon;
        ring: string;
        inner: string;
        iconColor: string;
        glow: string;
        badge: string;
    }
> = {
    amount: {
        icon: Coins,
        ring: 'from-accent via-accent-light to-accent',
        inner: 'from-card to-accent/[0.06]',
        iconColor: 'text-accent',
        glow: 'bg-accent/20',
        badge: 'from-accent to-accent-light text-accent-foreground',
    },
    phone: {
        icon: Smartphone,
        ring: 'from-primary via-primary-light to-primary',
        inner: 'from-card to-primary/[0.06]',
        iconColor: 'text-primary',
        glow: 'bg-primary/18',
        badge: 'from-primary to-primary-light text-primary-foreground',
    },
    complete: {
        icon: BadgeCheck,
        ring: 'from-primary-dark via-primary to-primary-light',
        inner: 'from-card to-secondary/80',
        iconColor: 'text-primary',
        glow: 'bg-primary/14',
        badge: 'from-primary-dark to-primary text-primary-foreground',
    },
};

export function HowDonateStepCard({
    step,
    label,
    variant,
    index = 0,
    showConnector = false,
    className,
}: HowDonateStepCardProps) {
    const config = variantConfig[variant];
    const Icon = config.icon;

    return (
        <motion.article
            initial={{ opacity: 0, scale: 0.88 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-48px' }}
            transition={{
                duration: 0.5,
                delay: index * 0.12,
                ease: [0.22, 1, 0.36, 1],
            }}
            className={cn('how-donate-step group relative flex flex-col items-center text-center', className)}
        >
            {showConnector && (
                <div
                    className="pointer-events-none absolute top-14 hidden h-px w-[calc(100%-7rem)] bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 md:block ltr:left-[calc(50%+3.5rem)] rtl:right-[calc(50%+3.5rem)]"
                    aria-hidden
                >
                    <span className="absolute top-1/2 start-1/4 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary/25" />
                    <span className="absolute top-1/2 start-1/2 h-1.5 w-1.5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-primary/35" />
                    <span className="absolute top-1/2 start-3/4 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary/25" />
                </div>
            )}

            <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                className="relative"
            >
                <div
                    className={cn(
                        'pointer-events-none absolute inset-0 scale-110 rounded-full opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100',
                        config.glow,
                    )}
                    aria-hidden
                />

                <div
                    className={cn(
                        'relative rounded-full bg-gradient-to-br p-[3px] shadow-brand transition-shadow duration-300 group-hover:shadow-brand-lg',
                        `bg-gradient-to-br ${config.ring}`,
                    )}
                >
                    <div
                        className={cn(
                            'flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br sm:h-28 sm:w-28 md:h-32 md:w-32',
                            config.inner,
                        )}
                    >
                        <Icon className={cn('h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10', config.iconColor)} strokeWidth={2} aria-hidden />
                    </div>
                </div>

                <span
                    className={cn(
                        'absolute -top-1 end-0 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br font-display text-sm font-bold shadow-brand ring-2 ring-card',
                        config.badge,
                    )}
                    dir="ltr"
                >
                    {step}
                </span>
            </motion.div>

            <p className="mt-5 max-w-[11rem] text-sm font-semibold leading-relaxed text-foreground sm:max-w-[13rem] md:mt-6 md:text-base">
                {label}
            </p>
        </motion.article>
    );
}
