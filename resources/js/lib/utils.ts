import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Project } from '@/api/types';
import type { Locale } from '@/i18n';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Tailwind class: LTR + Latin font so IBM Plex Arabic does not swap digits in RTL. */
export const ENGLISH_NUMERALS_CLASS = 'english-numerals';

function formatDecimalEn(
    value: number,
    { minimumFractionDigits = 0, maximumFractionDigits = 3 } = {},
): string {
    return value.toLocaleString('en-US', {
        minimumFractionDigits,
        maximumFractionDigits,
    });
}

export function normalizeCurrencyCode(currency?: string): string {
    return typeof currency === 'string' && /^[A-Z]{3}$/i.test(currency) ? currency.toUpperCase() : 'OMR';
}

export function formatCurrencyAmount(amount: number): string {
    return formatDecimalEn(amount, { maximumFractionDigits: 3 });
}

/** @deprecated Use `<CurrencyAmount />` for OMR sprite display. */
export function formatCurrency(amount: number, currency = 'OMR', _locale = 'ar'): string {
    const safeCurrency = normalizeCurrencyCode(currency);
    const formatted = formatCurrencyAmount(amount);

    if (safeCurrency === 'OMR') {
        return `${formatted} ر.ع.`;
    }

    return `${formatted} ${safeCurrency}`;
}

const ADMIN_DATE_TIME_LOCALE = 'en-OM';

function parseAdminIsoDate(iso: string): Date | null {
    const date = new Date(iso);

    return Number.isNaN(date.getTime()) ? null : date;
}

export function formatAdminDate(iso: string): string {
    const date = parseAdminIsoDate(iso);
    if (!date) {
        return '—';
    }

    const intlOptions = { numberingSystem: 'latn' as const };

    const datePart = date.toLocaleDateString(ADMIN_DATE_TIME_LOCALE, {
        ...intlOptions,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
    const timePart = date.toLocaleTimeString(ADMIN_DATE_TIME_LOCALE, {
        ...intlOptions,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    return `${datePart} ${timePart}`;
}

export function formatPhone(phone?: string | null): string {
    if (!phone?.trim()) {
        return '—';
    }

    const digits = phone.replace(/\D/g, '');
    if (digits.length === 8) {
        return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    }

    return phone.replace(/^[\s\-+]+/, '').trim();
}

export function formatReference(reference?: string | null): string {
    if (!reference?.trim()) {
        return '—';
    }

    return reference.trim();
}

export function getLocalizedProjectTitle(
    project: Project | null | undefined,
    locale: Locale,
): string | null {
    if (!project) {
        return null;
    }

    return (locale === 'en' ? project.title_en : project.title_ar) || project.title || null;
}

export function getLocalizedProjectDescription(
    project: Project | null | undefined,
    locale: Locale,
): string | null {
    if (!project) {
        return null;
    }

    return (
        (locale === 'en' ? project.description_en : project.description_ar) ||
        project.description ||
        null
    );
}

export function formatNumber(value: number, _locale = 'ar'): string {
    const hasFraction = Math.abs(value % 1) > 1e-9;

    return formatDecimalEn(value, {
        minimumFractionDigits: hasFraction ? 0 : 0,
        maximumFractionDigits: hasFraction ? 2 : 0,
    });
}
