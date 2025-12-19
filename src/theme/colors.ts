/**
 * SugarReset Color Palette
 * 
 * Calm, authoritative, data-focused design inspired by WHOOP.
 * Matte, desaturated colors with warm accent tones.
 */

export const colors = {
  // Primary backgrounds - matte, calm
  background: {
    primary: '#0D0F12',      // Deep dark (main bg)
    secondary: '#14171C',     // Elevated surfaces
    tertiary: '#1A1E25',      // Cards, modals
    warm: '#15130F',          // Warm variant
  },

  // Glassmorphism overlays
  glass: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.08)',
    strong: 'rgba(255, 255, 255, 0.12)',
    border: 'rgba(255, 255, 255, 0.1)',
  },

  // Text hierarchy
  text: {
    primary: '#F7F7F5',       // Main headings
    secondary: '#A1A1A1',     // Body text
    tertiary: '#6B6B6B',      // Subtle text
    muted: '#4A4A4A',         // Disabled/hints
    inverse: '#0D0F12',       // On light backgrounds
  },

  // Accent colors - warm, organic
  accent: {
    primary: '#E8A87C',       // Warm coral/peach (main CTA)
    secondary: '#D4956F',     // Deeper coral
    tertiary: '#C08162',      // Muted warm
    success: '#7FB069',       // Calm green (progress)
    warning: '#E5B654',       // Muted gold
    error: '#D66853',         // Soft red
  },

  // Gradient stops for organic backgrounds
  gradients: {
    warmStart: '#1A1510',
    warmEnd: '#0D0F12',
    coralStart: 'rgba(232, 168, 124, 0.15)',
    coralEnd: 'rgba(232, 168, 124, 0.02)',
    successStart: 'rgba(127, 176, 105, 0.12)',
    successEnd: 'rgba(127, 176, 105, 0.02)',
  },

  // Progress ring colors
  progress: {
    ring: '#E8A87C',
    ringBg: 'rgba(232, 168, 124, 0.15)',
    success: '#7FB069',
    successBg: 'rgba(127, 176, 105, 0.15)',
  },

  // Utility
  border: {
    subtle: 'rgba(255, 255, 255, 0.06)',
    light: 'rgba(255, 255, 255, 0.1)',
    focus: 'rgba(232, 168, 124, 0.4)',
  },

  // Status indicators
  status: {
    active: '#7FB069',
    inactive: '#4A4A4A',
    pending: '#E5B654',
  },
} as const;

export type ColorTheme = typeof colors;
