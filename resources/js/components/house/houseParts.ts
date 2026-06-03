export interface HousePart {
    id: string;
    /** Unlocks when completed donations count >= this value */
    unlockAt: number;
    labelKey: string;
    icon: string;
}

/** Each donation unlocks the next build stage (1:1 with donation count). */
export const HOUSE_BUILD_PARTS: HousePart[] = [
    { id: 'foundation', unlockAt: 1, labelKey: 'house.parts.foundation', icon: '🧱' },
    { id: 'ground-walls', unlockAt: 2, labelKey: 'house.parts.ground_walls', icon: '🏗️' },
    { id: 'columns', unlockAt: 3, labelKey: 'house.parts.columns', icon: '🏛️' },
    { id: 'upper-walls', unlockAt: 4, labelKey: 'house.parts.upper_walls', icon: '🧱' },
    { id: 'roof-frame', unlockAt: 5, labelKey: 'house.parts.roof_frame', icon: '🔨' },
    { id: 'roof-tiles', unlockAt: 6, labelKey: 'house.parts.roof_tiles', icon: '🏠' },
    { id: 'window-left', unlockAt: 7, labelKey: 'house.parts.window_left', icon: '🪟' },
    { id: 'window-right', unlockAt: 8, labelKey: 'house.parts.window_right', icon: '🪟' },
    { id: 'door', unlockAt: 9, labelKey: 'house.parts.door', icon: '🚪' },
    { id: 'balcony', unlockAt: 10, labelKey: 'house.parts.balcony', icon: '🏡' },
    { id: 'chimney', unlockAt: 11, labelKey: 'house.parts.chimney', icon: '🏗️' },
    { id: 'facade', unlockAt: 12, labelKey: 'house.parts.facade', icon: '✨' },
    { id: 'walkway', unlockAt: 13, labelKey: 'house.parts.walkway', icon: '🛤️' },
    { id: 'garden', unlockAt: 14, labelKey: 'house.parts.garden', icon: '🌿' },
    { id: 'olive-tree', unlockAt: 15, labelKey: 'house.parts.olive_tree', icon: '🌳' },
    { id: 'fence', unlockAt: 16, labelKey: 'house.parts.fence', icon: '🪵' },
    { id: 'lights', unlockAt: 17, labelKey: 'house.parts.lights', icon: '💡' },
    { id: 'heart', unlockAt: 18, labelKey: 'house.parts.heart', icon: '💛' },
];

export const BONUS_PARTS: HousePart[] = [
    { id: 'bonus-planter', unlockAt: 0, labelKey: 'house.parts.bonus_planter', icon: '🪴' },
    { id: 'bonus-lantern', unlockAt: 0, labelKey: 'house.parts.bonus_lantern', icon: '🏮' },
    { id: 'bonus-bird', unlockAt: 0, labelKey: 'house.parts.bonus_bird', icon: '🐦' },
    { id: 'bonus-flag', unlockAt: 0, labelKey: 'house.parts.bonus_flag', icon: '🎗️' },
    { id: 'bonus-bench', unlockAt: 0, labelKey: 'house.parts.bonus_bench', icon: '🪑' },
    { id: 'bonus-flowers', unlockAt: 0, labelKey: 'house.parts.bonus_flowers', icon: '🌸' },
];

export const CORE_PART_COUNT = HOUSE_BUILD_PARTS.length;

export function isPartUnlocked(partId: string, donationsCount: number): boolean {
    const core = HOUSE_BUILD_PARTS.find((p) => p.id === partId);
    if (core) {
        return donationsCount >= core.unlockAt;
    }
    const bonusIndex = BONUS_PARTS.findIndex((p) => p.id === partId);
    if (bonusIndex === -1) {
        return false;
    }
    const bonusSlot = donationsCount - CORE_PART_COUNT;
    if (bonusSlot <= 0) {
        return false;
    }
    return (bonusSlot - 1) % BONUS_PARTS.length === bonusIndex && Math.ceil(bonusSlot / BONUS_PARTS.length) >= 1;
}

export function getUnlockedPartIds(donationsCount: number): string[] {
    const ids = HOUSE_BUILD_PARTS.filter((p) => donationsCount >= p.unlockAt).map((p) => p.id);
    const bonusSlots = Math.max(0, donationsCount - CORE_PART_COUNT);
    for (let i = 0; i < bonusSlots; i++) {
        ids.push(BONUS_PARTS[i % BONUS_PARTS.length].id);
    }
    return ids;
}

/** The part that donation #N unlocked (N = donations count after donation). */
export function getPartUnlockedByDonation(donationNumber: number): HousePart | null {
    if (donationNumber <= 0) {
        return null;
    }
    const core = HOUSE_BUILD_PARTS.find((p) => p.unlockAt === donationNumber);
    if (core) {
        return core;
    }
    if (donationNumber > CORE_PART_COUNT) {
        const bonusIndex = (donationNumber - CORE_PART_COUNT - 1) % BONUS_PARTS.length;
        return BONUS_PARTS[bonusIndex];
    }
    return null;
}

export function getPartById(id: string): HousePart | undefined {
    return HOUSE_BUILD_PARTS.find((p) => p.id === id) ?? BONUS_PARTS.find((p) => p.id === id);
}

export function countBonusDecorations(donationsCount: number): number {
    return Math.max(0, donationsCount - CORE_PART_COUNT);
}

/** SVG / highlight id for the part added by donation #N */
export function getHighlightIdForDonation(donationNumber: number): string | null {
    if (donationNumber <= 0) {
        return null;
    }
    if (donationNumber <= CORE_PART_COUNT) {
        return HOUSE_BUILD_PARTS.find((p) => p.unlockAt === donationNumber)?.id ?? null;
    }
    return `bonus-${donationNumber - CORE_PART_COUNT - 1}`;
}

export function getRecentUnlockChipIds(donationsCount: number, limit = 6): string[] {
    const chips: string[] = [];
    for (const part of HOUSE_BUILD_PARTS) {
        if (donationsCount >= part.unlockAt) {
            chips.push(part.id);
        }
    }
    const bonusSlots = countBonusDecorations(donationsCount);
    for (let i = 0; i < bonusSlots; i++) {
        chips.push(`bonus-${i}`);
    }
    return chips.slice(-limit);
}
