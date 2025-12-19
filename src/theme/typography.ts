/**
 * SugarReset Typography System
 * 
 * Clean, modern typography with clear hierarchy.
 * Uses system fonts with custom weights for consistency.
 */

import { Platform, TextStyle } from 'react-native';

const fontFamily = Platform.select({
    ios: {
        regular: 'System',
        medium: 'System',
        semibold: 'System',
        bold: 'System',
    },
    android: {
        regular: 'Roboto',
        medium: 'Roboto',
        semibold: 'Roboto',
        bold: 'Roboto',
    },
    default: {
        regular: 'System',
        medium: 'System',
        semibold: 'System',
        bold: 'System',
    },
});

export const typography = {
    // Font families
    fonts: fontFamily,

    // Font sizes (rem-like scaling)
    sizes: {
        xs: 11,
        sm: 13,
        base: 15,
        md: 17,
        lg: 20,
        xl: 24,
        '2xl': 28,
        '3xl': 34,
        '4xl': 42,
        '5xl': 56,
    },

    // Font weights - use numeric values for compatibility
    weights: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },

    // Line heights (in pixels)
    lineHeights: {
        tight: 18,
        normal: 24,
        relaxed: 28,
    },

    // Letter spacing
    letterSpacing: {
        tight: -0.5,
        normal: 0,
        wide: 0.5,
        wider: 1,
        widest: 2,
    },

    // Pre-defined text styles
    // Note: textTransform removed from style objects - apply separately if needed
    styles: {
        // Display - for large hero numbers/stats
        display: {
            fontSize: 56,
            fontWeight: '700' as const,
            letterSpacing: -1,
            lineHeight: 62,
        } as TextStyle,

        // Headings
        h1: {
            fontSize: 34,
            fontWeight: '700' as const,
            letterSpacing: -0.5,
            lineHeight: 41,
        } as TextStyle,
        h2: {
            fontSize: 28,
            fontWeight: '600' as const,
            letterSpacing: -0.3,
            lineHeight: 34,
        } as TextStyle,
        h3: {
            fontSize: 24,
            fontWeight: '600' as const,
            letterSpacing: 0,
            lineHeight: 30,
        } as TextStyle,
        h4: {
            fontSize: 20,
            fontWeight: '600' as const,
            letterSpacing: 0,
            lineHeight: 26,
        } as TextStyle,

        // Body
        body: {
            fontSize: 15,
            fontWeight: '400' as const,
            letterSpacing: 0,
            lineHeight: 22,
        } as TextStyle,
        bodyMedium: {
            fontSize: 15,
            fontWeight: '500' as const,
            letterSpacing: 0,
            lineHeight: 22,
        } as TextStyle,
        bodySm: {
            fontSize: 13,
            fontWeight: '400' as const,
            letterSpacing: 0,
            lineHeight: 18,
        } as TextStyle,

        // Labels & captions - textTransform should be applied separately
        label: {
            fontSize: 13,
            fontWeight: '500' as const,
            letterSpacing: 0.5,
            lineHeight: 17,
        } as TextStyle,
        caption: {
            fontSize: 11,
            fontWeight: '400' as const,
            letterSpacing: 0.3,
            lineHeight: 15,
        } as TextStyle,

        // Metrics & data - textTransform should be applied separately
        metric: {
            fontSize: 42,
            fontWeight: '600' as const,
            letterSpacing: -0.5,
            lineHeight: 48,
        } as TextStyle,
        metricLabel: {
            fontSize: 11,
            fontWeight: '500' as const,
            letterSpacing: 1,
            lineHeight: 14,
        } as TextStyle,
    },
} as const;

export type Typography = typeof typography;
