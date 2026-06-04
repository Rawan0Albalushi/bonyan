import type { ReactNode } from 'react';
import { HouseSvgPart } from '@/components/house/HouseSvgPart';
import { HOUSE_SVG_VIEWBOX, SVG } from '@/components/house/houseSvgPalette';

interface HouseSvgIllustrationProps {
    fundingPercentage: number;
    highlightDetailId?: string | null;
    revealDetailId?: string | null;
}

function partFlags(
    partId: string,
    highlightDetailId: string | null,
    revealDetailId: string | null,
) {
    return {
        isRevealing: revealDetailId === partId,
        isHighlighted: highlightDetailId === partId,
    };
}

/** Cutaway Mediterranean villa — built part-by-part via SVG groups (no PNG layers). */
export function HouseSvgIllustration({
    fundingPercentage,
    highlightDetailId = null,
    revealDetailId = null,
}: HouseSvgIllustrationProps) {
    const { width, height } = HOUSE_SVG_VIEWBOX;

    const wrap = (partId: string, content: ReactNode) => {
        const flags = partFlags(partId, highlightDetailId, revealDetailId);
        return (
            <HouseSvgPart partId={partId} fundingPercentage={fundingPercentage} {...flags}>
                {content}
            </HouseSvgPart>
        );
    };

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className="house-svg-canvas h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
            role="presentation"
            aria-hidden
        >
            <defs>
                <linearGradient id="house-sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SVG.skyTop} />
                    <stop offset="100%" stopColor={SVG.skyBottom} />
                </linearGradient>
                <linearGradient id="house-ground" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SVG.lawn} />
                    <stop offset="100%" stopColor={SVG.groundDark} />
                </linearGradient>
                <linearGradient id="house-roof-tile" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SVG.roofLight} />
                    <stop offset="100%" stopColor={SVG.roofDark} />
                </linearGradient>
                <linearGradient id="house-warm-glow" x1="0.5" y1="0" x2="0.5" y2="1">
                    <stop offset="0%" stopColor={SVG.warmGlow} stopOpacity="0.85" />
                    <stop offset="100%" stopColor={SVG.warmGlowSoft} stopOpacity="0" />
                </linearGradient>
                <filter id="house-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#3a2a1a" floodOpacity="0.18" />
                </filter>
                <filter id="house-glow" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Static backdrop — always visible */}
            <rect width={width} height={height} fill="url(#house-sky)" />
            <ellipse cx={240} cy={318} rx={220} ry={28} fill="url(#house-ground)" opacity={0.9} />

            {wrap(
                'foundation',
                <g filter="url(#house-soft-shadow)">
                    <path
                        d="M72 268 L408 268 L398 302 L82 302 Z"
                        fill={SVG.concreteDark}
                    />
                    <path
                        d="M88 272 L392 272 L384 296 L96 296 Z"
                        fill={SVG.stone}
                    />
                    <path
                        d="M96 276 L120 276 L118 292 L98 292 Z M360 276 L384 276 L382 292 L362 292 Z"
                        fill={SVG.stoneDark}
                        opacity={0.7}
                    />
                </g>,
            )}

            {wrap(
                'ground-walls',
                <g>
                    <rect x={108} y={198} width={264} height={74} fill={SVG.stuccoShadow} rx={2} />
                    <rect x={114} y={204} width={252} height={66} fill={SVG.stucco} />
                    <rect x={114} y={262} width={252} height={8} fill={SVG.woodDark} />
                    <line x1={114} y1={232} x2={366} y2={232} stroke={SVG.wood} strokeWidth={5} />
                </g>,
            )}

            {wrap(
                'columns',
                <g>
                    <rect x={168} y={148} width={14} height={120} fill={SVG.woodDark} rx={1} />
                    <rect x={298} y={148} width={14} height={120} fill={SVG.woodDark} rx={1} />
                    <rect x={222} y={148} width={36} height={10} fill={SVG.wood} rx={1} />
                    <rect x={114} y={198} width={252} height={6} fill={SVG.wood} />
                </g>,
            )}

            {wrap(
                'upper-walls',
                <g>
                    <rect x={108} y={118} width={264} height={84} fill={SVG.stuccoShadow} rx={2} />
                    <rect x={114} y={124} width={252} height={72} fill={SVG.stucco} />
                    <rect x={114} y={192} width={252} height={8} fill={SVG.woodDark} />
                    <rect x={108} y={52} width={264} height={70} fill={SVG.stuccoShadow} rx={2} />
                    <rect x={114} y={58} width={252} height={58} fill={SVG.stucco} />
                    <line x1={114} y1={118} x2={366} y2={118} stroke={SVG.wood} strokeWidth={5} />
                    <line x1={114} y1={168} x2={366} y2={168} stroke={SVG.woodDark} strokeWidth={3} opacity={0.6} />
                </g>,
            )}

            {wrap(
                'roof-frame',
                <g>
                    <polygon points="88,118 240,42 392,118" fill={SVG.woodDark} />
                    <polygon points="100,118 240,54 380,118" fill={SVG.wood} opacity={0.85} />
                    <rect x={198} y={42} width={84} height={8} fill={SVG.woodDark} rx={2} />
                </g>,
            )}

            {wrap(
                'roof-tiles',
                <g>
                    <polygon points="92,118 240,48 388,118" fill="url(#house-roof-tile)" />
                    <path
                        d="M108 108 Q240 72 372 108"
                        fill="none"
                        stroke={SVG.ridge}
                        strokeWidth={4}
                        strokeLinecap="round"
                    />
                    {Array.from({ length: 9 }, (_, i) => (
                        <line
                            key={i}
                            x1={120 + i * 28}
                            y1={112 - (i % 2) * 2}
                            x2={130 + i * 28}
                            y2={100 - (i % 2) * 2}
                            stroke={SVG.roofDark}
                            strokeWidth={2}
                            opacity={0.35}
                        />
                    ))}
                </g>,
            )}

            {wrap(
                'window-left',
                <g>
                    <rect x={128} y={214} width={44} height={48} fill={SVG.frame} rx={2} />
                    <rect x={134} y={220} width={32} height={36} fill={SVG.glass} rx={1} />
                    <rect x={128} y={148} width={40} height={40} fill={SVG.frame} rx={2} />
                    <rect x={134} y={154} width={28} height={28} fill={SVG.glassDeep} rx={1} opacity={0.7} />
                </g>,
            )}

            {wrap(
                'window-right',
                <g>
                    <rect x={308} y={214} width={44} height={48} fill={SVG.frame} rx={2} />
                    <rect x={314} y={220} width={32} height={36} fill={SVG.glass} rx={1} />
                    <rect x={312} y={68} width={36} height={36} fill={SVG.frame} rx={2} />
                    <rect x={318} y={74} width={24} height={24} fill={SVG.glass} rx={1} />
                </g>,
            )}

            {wrap(
                'door',
                <g>
                    <rect x={214} y={220} width={52} height={52} fill={SVG.stoneDark} rx={3} />
                    <rect x={220} y={226} width={40} height={44} fill={SVG.wood} rx={2} />
                    <rect x={228} y={238} width={24} height={28} fill={SVG.woodDark} rx={1} opacity={0.5} />
                    <circle cx={252} cy={248} r={3} fill={SVG.accent} />
                </g>,
            )}

            {wrap(
                'balcony',
                <g>
                    <rect x={268} y={168} width={72} height={8} fill={SVG.stone} />
                    <rect x={272} y={176} width={4} height={28} fill={SVG.frame} />
                    <rect x={332} y={176} width={4} height={28} fill={SVG.frame} />
                    <rect x={276} y={180} width={56} height={4} fill={SVG.trim} />
                </g>,
            )}

            {wrap(
                'chimney',
                <g>
                    <rect x={352} y={62} width={28} height={58} fill={SVG.stoneDark} rx={2} />
                    <rect x={356} y={58} width={20} height={8} fill={SVG.concreteDark} rx={1} />
                    <ellipse cx={366} cy={52} rx={10} ry={6} fill="#b8b0a4" opacity={0.45} />
                </g>,
            )}

            {wrap(
                'walkway',
                <g>
                    <path
                        d="M200 302 L280 302 L276 318 L204 318 Z"
                        fill={SVG.paver}
                    />
                    <path
                        d="M208 306 L272 306 L270 314 L210 314 Z"
                        fill={SVG.paverDark}
                        opacity={0.5}
                    />
                </g>,
            )}

            {wrap(
                'garden',
                <g>
                    <ellipse cx={58} cy={288} rx={36} ry={18} fill={SVG.foliageDark} opacity={0.35} />
                    <path
                        d="M40 290 Q48 250 58 268 Q68 248 76 290 Z"
                        fill={SVG.foliage}
                    />
                    <path
                        d="M52 290 Q56 262 60 278 Q64 260 68 290 Z"
                        fill={SVG.lawn}
                    />
                </g>,
            )}

            {wrap(
                'olive-tree',
                <g>
                    <rect x={408} y={278} width={8} height={24} fill={SVG.woodDark} rx={2} />
                    <ellipse cx={412} cy={262} rx={28} ry={34} fill={SVG.foliage} />
                    <ellipse cx={404} cy={252} rx={18} ry={22} fill={SVG.foliageDark} opacity={0.6} />
                </g>,
            )}

            {wrap(
                'fence',
                <g>
                    {Array.from({ length: 5 }, (_, i) => (
                        <rect
                            key={i}
                            x={24 + i * 10}
                            y={248}
                            width={5}
                            height={42}
                            fill={SVG.wood}
                            rx={1}
                        />
                    ))}
                    <rect x={20} y={248} width={58} height={4} fill={SVG.woodDark} />
                </g>,
            )}

            {wrap(
                'facade',
                <g opacity={0.95}>
                    {/* Interior cutaway — floors & rooms */}
                    <rect x={118} y={206} width={118} height={56} fill={SVG.interiorFloor} />
                    <rect x={244} y={206} width={118} height={56} fill={SVG.interiorWall} />
                    <rect x={118} y={126} width={118} height={66} fill={SVG.interiorFloor} />
                    <rect x={244} y={126} width={118} height={66} fill={SVG.interiorWall} />
                    <rect x={118} y={62} width={118} height={54} fill={SVG.interiorFloor} />
                    <rect x={244} y={62} width={118} height={54} fill={SVG.interiorWall} />
                    {/* Stairs */}
                    <path
                        d="M228 206 L228 262 L252 262 L252 206 Z"
                        fill={SVG.wood}
                        opacity={0.85}
                    />
                    {Array.from({ length: 6 }, (_, i) => (
                        <line
                            key={i}
                            x1={230}
                            y1={214 + i * 8}
                            x2={250}
                            y2={214 + i * 8}
                            stroke={SVG.woodDark}
                            strokeWidth={2}
                        />
                    ))}
                    {/* Kitchen block */}
                    <rect x={124} y={132} width={48} height={24} fill={SVG.trim} rx={2} />
                    <rect x={128} y={160} width={40} height={28} fill={SVG.trim} opacity={0.9} />
                    {/* Sofa */}
                    <path
                        d="M258 220 Q290 210 318 224 L318 248 L258 248 Z"
                        fill={SVG.woodDark}
                        opacity={0.75}
                    />
                    {/* Bed */}
                    <rect x={124} y={218} width={56} height={32} fill={SVG.wood} rx={3} />
                    {/* Tub */}
                    <ellipse cx={148} cy={88} rx={22} ry={14} fill={SVG.trim} />
                    {/* Desk */}
                    <rect x={280} y={224} width={40} height={20} fill={SVG.wood} rx={2} />
                </g>,
            )}

            {wrap(
                'lights',
                <g filter="url(#house-glow)">
                    <ellipse cx={168} cy={228} rx={28} ry={18} fill="url(#house-warm-glow)" opacity={0.75} />
                    <ellipse cx={300} cy={228} rx={32} ry={20} fill="url(#house-warm-glow)" opacity={0.7} />
                    <ellipse cx={168} cy={148} rx={24} ry={16} fill="url(#house-warm-glow)" opacity={0.55} />
                    <ellipse cx={300} cy={148} rx={30} ry={18} fill="url(#house-warm-glow)" opacity={0.6} />
                    <ellipse cx={240} cy={88} rx={26} ry={14} fill="url(#house-warm-glow)" opacity={0.5} />
                    <rect x={134} y={220} width={32} height={36} fill={SVG.warmGlow} opacity={0.35} rx={1} />
                    <rect x={314} y={220} width={32} height={36} fill={SVG.warmGlow} opacity={0.35} rx={1} />
                </g>,
            )}

            {wrap(
                'heart',
                <g transform="translate(262, 192)">
                    <path
                        d="M-14 -6 C-14 -16 0 -16 0 -6 C0 -16 14 -16 14 -2 C14 12 0 24 0 24 C0 24 -14 12 -14 -2 Z"
                        fill={SVG.accent}
                    />
                    <circle cx={0} cy={4} r={18} fill={SVG.accentGlow} opacity={0.25} />
                </g>,
            )}

        </svg>
    );
}
