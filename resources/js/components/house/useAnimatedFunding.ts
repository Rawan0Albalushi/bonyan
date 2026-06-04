import { useEffect, useRef, useState } from 'react';

function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
}

/** Smoothly animates funding % from `from` to `to` while `active`. */
export function useAnimatedFunding(
    from: number,
    to: number,
    active: boolean,
    durationMs = 2400,
): number {
    const [value, setValue] = useState(active ? from : to);
    const frameRef = useRef<number>(0);

    useEffect(() => {
        if (!active) {
            setValue(to);
            return;
        }

        setValue(from);
        const start = performance.now();

        const tick = (now: number) => {
            const elapsed = now - start;
            const t = Math.min(1, elapsed / durationMs);
            setValue(from + (to - from) * easeOutCubic(t));

            if (t < 1) {
                frameRef.current = requestAnimationFrame(tick);
            }
        };

        frameRef.current = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frameRef.current);
    }, [active, from, to, durationMs]);

    return value;
}
