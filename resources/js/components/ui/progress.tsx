import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

type ProgressProps = React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    variant?: 'default' | 'hero';
};

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
    ({ className, value, variant = 'default', ...props }, ref) => (
        <ProgressPrimitive.Root
            ref={ref}
            className={cn(
                'relative w-full overflow-hidden rounded-full',
                variant === 'hero'
                    ? 'h-3.5 border border-primary/40 bg-white/75 shadow-[0_1px_5px_color-mix(in_srgb,var(--color-primary)_14%,transparent),inset_0_1px_3px_color-mix(in_srgb,var(--color-primary)_12%,transparent)]'
                    : 'h-3 border border-primary/10 bg-secondary/80',
                className,
            )}
            {...props}
        >
            <ProgressPrimitive.Indicator
                className={cn(
                    'h-full flex-1 rounded-full transition-all duration-1000 ease-out',
                    variant === 'hero'
                        ? 'progress-indicator-hero bg-gradient-to-r from-primary-dark via-primary to-accent'
                        : 'bg-gradient-to-r from-primary via-primary-light to-accent duration-700',
                )}
                style={{ width: `${value || 0}%` }}
            />
        </ProgressPrimitive.Root>
    ),
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
