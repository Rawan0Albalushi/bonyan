import { HOUSE_COLORS as C } from '@/components/house/houseColors';

/**
 * Declarative R3F material prop-sets. Spread onto <meshStandardMaterial>.
 * envMapIntensity values are tuned for the `city`/sunset environment so
 * surfaces pick up believable reflections without going metallic.
 */
export const MAT = {
    stucco: { color: C.stucco, roughness: 0.95, metalness: 0, envMapIntensity: 0.35 },
    stuccoDark: { color: C.stuccoShadow, roughness: 0.96, metalness: 0, envMapIntensity: 0.3 },
    trim: { color: C.stuccoTrim, roughness: 0.85, metalness: 0, envMapIntensity: 0.4 },

    concrete: { color: C.concrete, roughness: 0.96, metalness: 0, envMapIntensity: 0.25 },
    stone: { color: C.stone, roughness: 0.92, metalness: 0.02, envMapIntensity: 0.3 },
    stoneDark: { color: C.stoneDark, roughness: 0.94, metalness: 0.02, envMapIntensity: 0.25 },

    frame: { color: C.frame, roughness: 0.55, metalness: 0.25, envMapIntensity: 0.7 },
    trimWhite: { color: C.trimWhite, roughness: 0.6, metalness: 0.05, envMapIntensity: 0.6 },
    metal: { color: C.frameLight, roughness: 0.35, metalness: 0.85, envMapIntensity: 1 },

    wood: { color: C.wood, roughness: 0.65, metalness: 0.04, envMapIntensity: 0.4 },
    woodWarm: { color: C.woodWarm, roughness: 0.62, metalness: 0.04, envMapIntensity: 0.45 },
    woodDark: { color: C.woodDark, roughness: 0.7, metalness: 0.04, envMapIntensity: 0.35 },

    roof: { color: C.roof, roughness: 0.78, metalness: 0.04, envMapIntensity: 0.45 },
    roofLight: { color: C.roofLight, roughness: 0.74, metalness: 0.04, envMapIntensity: 0.5 },
    roofDark: { color: C.roofDark, roughness: 0.8, metalness: 0.04, envMapIntensity: 0.4 },
    ridge: { color: C.ridge, roughness: 0.76, metalness: 0.05, envMapIntensity: 0.45 },

    copper: { color: C.copper, roughness: 0.3, metalness: 0.85, envMapIntensity: 1.1 },
    brass: { color: C.brass, roughness: 0.28, metalness: 0.9, envMapIntensity: 1.2 },

    lawn: { color: C.lawn, roughness: 0.98, metalness: 0, envMapIntensity: 0.2 },
    lawnDark: { color: C.lawnDark, roughness: 0.98, metalness: 0, envMapIntensity: 0.2 },
    foliage: { color: C.foliage, roughness: 0.95, metalness: 0, envMapIntensity: 0.25 },
    soil: { color: C.soil, roughness: 1, metalness: 0, envMapIntensity: 0.15 },
    paver: { color: C.paver, roughness: 0.88, metalness: 0.02, envMapIntensity: 0.3 },
    paverDark: { color: C.paverDark, roughness: 0.9, metalness: 0.02, envMapIntensity: 0.25 },

    ghost: {
        color: C.ghost,
        transparent: true,
        opacity: 0.08,
        roughness: 1,
        emissive: C.ghost,
        emissiveIntensity: 0.15,
    },
} as const;

/** Physically-based glass — spread onto <meshPhysicalMaterial>. */
export const GLASS = {
    color: C.glass,
    roughness: 0.05,
    metalness: 0,
    transmission: 0.65,
    thickness: 0.12,
    ior: 1.45,
    reflectivity: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    transparent: true,
    opacity: 0.55,
    envMapIntensity: 1.4,
} as const;
