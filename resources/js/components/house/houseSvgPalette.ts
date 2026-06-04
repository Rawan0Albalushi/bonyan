import { HOUSE_COLORS } from '@/components/house/houseColors';

/** SVG fill/stroke palette aligned with the Bunyan cutaway villa. */
export const SVG = {
    skyTop: '#dbe9f2',
    skyBottom: '#f4ecdd',
    ground: '#86ab63',
    groundDark: '#4f7639',
    stone: HOUSE_COLORS.stone,
    stoneDark: HOUSE_COLORS.stoneDark,
    concrete: HOUSE_COLORS.concrete,
    concreteDark: HOUSE_COLORS.concreteDark,
    stucco: HOUSE_COLORS.stucco,
    stuccoShadow: HOUSE_COLORS.stuccoShadow,
    trim: HOUSE_COLORS.trimWhite,
    frame: HOUSE_COLORS.frame,
    wood: HOUSE_COLORS.wood,
    woodDark: HOUSE_COLORS.woodDark,
    roof: HOUSE_COLORS.roof,
    roofLight: HOUSE_COLORS.roofLight,
    roofDark: HOUSE_COLORS.roofDark,
    ridge: HOUSE_COLORS.ridge,
    glass: HOUSE_COLORS.glass,
    glassDeep: HOUSE_COLORS.glassDeep,
    lawn: HOUSE_COLORS.lawn,
    foliage: HOUSE_COLORS.foliage,
    foliageDark: HOUSE_COLORS.foliageDark,
    paver: HOUSE_COLORS.paver,
    paverDark: HOUSE_COLORS.paverDark,
    accent: HOUSE_COLORS.accent,
    accentGlow: HOUSE_COLORS.accentGlow,
    warmGlow: '#ffe9b0',
    warmGlowSoft: '#fff4d4',
    interiorFloor: '#e8dcc8',
    interiorWall: '#f2ebe0',
} as const;

export const HOUSE_SVG_VIEWBOX = { width: 480, height: 340 } as const;
