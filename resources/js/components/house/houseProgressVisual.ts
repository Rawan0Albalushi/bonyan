export function clampPercentage(value: number): number {
    return Math.min(100, Math.max(0, value));
}

export function getFundingProgressPercentage(progressPercentage: number): number {
    return clampPercentage(progressPercentage);
}

export function getFundingProgressBeforeDonation(
    goalAmount: number,
    raisedAmount: number,
    donationAmount: number,
): number {
    if (goalAmount <= 0) {
        return 0;
    }

    const raisedBefore = Math.max(0, raisedAmount - donationAmount);
    const before = (raisedBefore / goalAmount) * 100;
    const after = (raisedAmount / goalAmount) * 100;

    if (after - before < 0.0001) {
        /** Step back ~¼ of one build step so the success animation has a real before/after. */
        const step = 100 / 18;
        return clampPercentage(Math.max(0, before - step));
    }

    return clampPercentage(before);
}
