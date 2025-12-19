/**
 * SugarReset Theme
 * 
 * Unified theme export for consistent design across the app.
 */

export { colors, type ColorTheme } from './colors';
export { typography, type Typography } from './typography';
export { spacing, borderRadius, shadows, type Spacing, type BorderRadius, type Shadows } from './spacing';

import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, shadows } from './spacing';

// Animation durations (ms) - slow, calm animations
export const animations = {
    fast: 150,
    normal: 250,
    slow: 400,
    verySlow: 600,

    // Easing curves
    easing: {
        default: 'ease-out',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
} as const;

// Combined theme object
export const theme = {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    animations,
} as const;

export type Theme = typeof theme;
export default theme;
