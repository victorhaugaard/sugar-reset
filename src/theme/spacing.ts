/**
 * SugarReset Spacing System
 * 
 * Consistent spacing scale for layouts and components.
 * Based on 4px grid for precise alignment.
 */

export const spacing = {
    // Base spacing units (4px grid)
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    '5xl': 64,
    '6xl': 80,

    // Screen padding
    screen: {
        horizontal: 20,
        vertical: 16,
    },

    // Card internal padding
    card: {
        sm: 12,
        md: 16,
        lg: 20,
    },

    // Section spacing
    section: {
        sm: 24,
        md: 32,
        lg: 48,
    },
} as const;

// Border radius tokens
export const borderRadius = {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    full: 9999,
} as const;

// Shadow tokens for elevation
export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.5,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.22,
        shadowRadius: 3,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    glow: {
        shadowColor: '#E8A87C',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
} as const;

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
