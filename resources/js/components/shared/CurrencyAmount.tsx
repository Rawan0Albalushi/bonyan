import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/contexts/LocaleContext';
import { cn, ENGLISH_NUMERALS_CLASS, formatCurrencyAmount, normalizeCurrencyCode } from '@/lib/utils';

export type CurrencyIconSize = 'sm' | 'md' | 'lg' | 'xl';
export type CurrencyLayout = 'inline' | 'stat';

const iconSizeClass: Record<CurrencyIconSize, string> = {
    sm: 'currency-symbol--sm',
    md: 'currency-symbol--md',
    lg: 'currency-symbol--lg',
    xl: 'currency-symbol--xl',
};

const CURRENCY_SRC = '/image/currency.png';

interface CurrencyAmountProps {
    amount: number;
    currency?: string;
    className?: string;
    amountClassName?: string;
    iconSize?: CurrencyIconSize;
    brand?: boolean;
    isolate?: boolean;
    layout?: CurrencyLayout;
}

function CurrencyIcon({
    src,
    label,
    iconSize,
    stat,
}: {
    src: string;
    label: string;
    iconSize: CurrencyIconSize;
    stat?: boolean;
}) {
    if (stat) {
        return (
            <span className="currency-icon-box" aria-hidden>
                <img
                    src={src}
                    alt=""
                    role="img"
                    aria-label={label}
                    className="currency-icon-box__img"
                    draggable={false}
                />
            </span>
        );
    }

    return (
        <span className="currency-symbol-wrap">
            <img
                src={src}
                alt=""
                role="img"
                aria-label={label}
                className={cn('currency-symbol', iconSizeClass[iconSize])}
                draggable={false}
            />
        </span>
    );
}

export function CurrencyAmount({
    amount,
    currency = 'OMR',
    className,
    amountClassName,
    iconSize = 'md',
    brand = false,
    isolate = true,
    layout = 'inline',
}: CurrencyAmountProps) {
    const { t } = useTranslation();
    const { isRtl } = useLocale();
    const code = normalizeCurrencyCode(currency);
    const formatted = formatCurrencyAmount(amount);
    const isStat = layout === 'stat';

    if (code !== 'OMR') {
        return (
            <span
                className={cn(
                    isStat ? 'currency-amount currency-amount--stat' : ENGLISH_NUMERALS_CLASS,
                    className,
                )}
                dir={isolate ? 'ltr' : undefined}
            >
                <span className={cn(isStat && 'currency-amount-value--stat', brand && 'text-gradient-brand', amountClassName)}>
                    {formatted}
                </span>{' '}
                {code}
            </span>
        );
    }

    return (
        <span
            className={cn(
                'currency-amount',
                isStat
                    ? cn('currency-amount--stat english-numerals', isRtl && 'currency-amount--stat-rtl')
                    : 'inline-flex shrink-0 items-center gap-1.5',
                !isStat && ENGLISH_NUMERALS_CLASS,
                className,
            )}
            dir={isolate ? 'ltr' : undefined}
        >
            <span
                className={cn(
                    isStat ? 'currency-amount-value--stat' : 'currency-amount-value shrink-0',
                    brand && 'text-gradient-brand',
                    amountClassName,
                )}
            >
                {formatted}
            </span>
            <CurrencyIcon src={CURRENCY_SRC} label={t('common.currency')} iconSize={iconSize} stat={isStat} />
        </span>
    );
}

export function CurrencyAmountInline({
    amounts,
    currency = 'OMR',
    separator = ' / ',
    className,
    iconSize = 'sm',
}: {
    amounts: number[];
    currency?: string;
    separator?: ReactNode;
    className?: string;
    iconSize?: CurrencyIconSize;
}) {
    return (
        <span className={cn('inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5', className)} dir="ltr">
            {amounts.map((amount, index) => (
                <span key={index} className="inline-flex shrink-0 items-center gap-1.5">
                    {index > 0 ? separator : null}
                    <CurrencyAmount amount={amount} currency={currency} iconSize={iconSize} isolate={false} />
                </span>
            ))}
        </span>
    );
}
