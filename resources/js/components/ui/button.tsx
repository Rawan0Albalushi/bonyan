import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default:
                    'bg-gradient-to-b from-primary-light to-primary text-primary-foreground shadow-brand hover:brightness-110 active:brightness-95',
                accent:
                    'bg-gradient-to-b from-accent-light to-accent text-accent-foreground shadow-accent hover:brightness-105 active:brightness-95',
                secondary:
                    'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/85 border border-primary/10',
                outline:
                    'border-2 border-primary/25 bg-card text-primary hover:border-primary/50 hover:bg-surface/80',
                ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
                destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
            },
            size: {
                default: 'h-11 px-5 py-2',
                sm: 'h-9 rounded-md px-3',
                lg: 'h-12 rounded-xl px-8 text-base',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return (
            <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
        );
    },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
