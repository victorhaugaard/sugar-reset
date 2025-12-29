/**
 * SugarReset Color Palette - Universe Theme
 * 
 * Deep, cosmic aesthetic inspired by QUITTR/STOPPR.
 * Dark indigo backgrounds, electric purple accents, and starry vibes.
 */

export const colors = {
  // Primary backgrounds - Deep Universe
  background: {
    primary: '#050511',      // Deepest Space (Main bg)
    secondary: '#0F0F26',    // Dark Indigo (Cards)
    tertiary: '#1A1A3D',     // Lighter Indigo (Modals)
    warm: '#0B0B26',         // (Mapped to dark indigo for compatibility)
  },

  // Glassmorphism overlays - Cool, blue-tinted
  glass: {
    light: 'rgba(50, 50, 100, 0.15)',
    medium: 'rgba(50, 50, 100, 0.25)',
    strong: 'rgba(50, 50, 100, 0.40)',
    border: 'rgba(100, 100, 255, 0.15)',
  },

  // Text hierarchy
  text: {
    primary: '#FFFFFF',       // Pure White
    secondary: '#B0B0D0',     // Blue-grey (Stardust)
    tertiary: '#707090',      // Muted indigo
    muted: '#4A4A6A',         // Disabled
    inverse: '#050511',       // On bright buttons
  },

  // Accent colors - Electric, Neon
  accent: {
    primary: '#A020F0',       // Electric Purple (Main CTA) - matching screenshot
    secondary: '#D44DFF',     // Lighter Neon Purple
    tertiary: '#7000B0',      // Deep Purple
    success: '#00E0FF',       // Cyan/Electric Blue (Progress/Success)
    warning: '#FFD700',       // Gold (Stars)
    error: '#FF2D55',         // Neon Red
  },

  // Gradient stops
  gradients: {
    warmStart: '#0B0B26',     // (Mapped to universe)
    warmEnd: '#050511',
    universeStart: '#141432', // Top of screen
    universeEnd: '#050511',   // Bottom of screen
    coralStart: 'rgba(160, 32, 240, 0.2)', // Purple glow
    coralEnd: 'rgba(160, 32, 240, 0.0)',
    successStart: 'rgba(0, 224, 255, 0.2)', // Cyan glow
    successEnd: 'rgba(0, 224, 255, 0.0)',
  },

  // Progress ring colors
  progress: {
    ring: '#A020F0',          // Purple
    ringBg: 'rgba(160, 32, 240, 0.2)',
    success: '#00E0FF',       // Cyan
    successBg: 'rgba(0, 224, 255, 0.2)',
  },

  // Utility
  border: {
    subtle: 'rgba(255, 255, 255, 0.08)',
    light: 'rgba(255, 255, 255, 0.15)',
    focus: 'rgba(160, 32, 240, 0.6)',
  },

  // Status indicators
  status: {
    active: '#00E0FF',
    inactive: '#4A4A6A',
    pending: '#FFD700',
  },
} as const;

export type ColorTheme = typeof colors;
