/**
 * DayFrame Unified Design System & Theme
 * 
 * Color Direction Principles:
 * - Avoid dual-gradient color treatments (no cyan-to-purple, magenta-to-yellow, or high-contrast chromatic pairs).
 * - Prioritize single gradients (black -> transparent, white -> transparent, or monochromatic tone shifts).
 * - Solid colors for all key UI elements (buttons, inputs, cards, headers, sheets).
 * - Subtle tonal variations for layered surfaces and borders.
 * - Understated, editorial, tactile aesthetic allowing photos and memories to stand out.
 */

export const theme = {
  colors: {
    // Canvas & Surfaces
    background: '#F9F9FB',
    card: '#FFFFFF',
    surface: {
      base: '#FFFFFF',
      subtle: '#F9F9FB',
      secondary: '#F2F2F7',
      muted: '#EBEBF0',
      elevated: '#FFFFFF',
      dark: '#121214',
      darkElevated: '#1C1C1E',
    },

    // Typography
    text: {
      primary: '#1C1C1E',
      secondary: '#8E8E93',
      tertiary: '#AEAEB2',
      inverse: '#FFFFFF',
    },

    // Core Brand Actions
    primary: '#111111',
    primaryLight: '#2C2C2E',
    accent: '#D9534F',      // Grounded warm crimson (avoiding neon/candy red)
    border: '#E5E5EA',
    borderSubtle: 'rgba(0,0,0,0.06)',
    success: '#2E7D5E',     // Refined forest pine (avoiding electric neon green)
    error: '#C93B3B',

    // Item Type & Timeline Badges (Solid, mature, tactile pigments)
    itemTypes: {
      memory: '#1C1C1E',    // Deep obsidian graphite
      photo: '#243B53',     // Deep slate marine
      event: '#2B5A4B',     // Muted evergreen
      note: '#7B5A2E',      // Warm earthen ochre
      milestone: '#8A3828', // Rich terracotta sienna
    },

    // Soft backgrounds for badges/tags (subtle tints paired with solid badges)
    itemTypeTints: {
      memory: 'rgba(28, 28, 30, 0.07)',
      photo: 'rgba(36, 59, 83, 0.08)',
      event: 'rgba(43, 90, 75, 0.08)',
      note: 'rgba(123, 90, 46, 0.08)',
      milestone: 'rgba(138, 56, 40, 0.08)',
    },
  },

  // Single-Gradient Presets (Black -> transparent, white -> transparent, or single tone shifts)
  gradients: {
    // Photo overlay scrims for crystal-clear text readability
    scrimDark: ['transparent', 'rgba(0,0,0,0.85)'] as const,
    scrimSoft: ['transparent', 'rgba(0,0,0,0.65)'] as const,
    scrimDeep: ['transparent', 'rgba(0,0,0,0.95)'] as const,
    scrimTop: ['rgba(0,0,0,0.6)', 'transparent'] as const,
    scrimWhite: ['transparent', 'rgba(255,255,255,0.92)'] as const,

    // Monochromatic subtle surface shift
    subtleMonochrome: ['rgba(0,0,0,0.02)', 'rgba(0,0,0,0.06)'] as const,
    subtleDark: ['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)'] as const,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    pill: 9999,
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};
