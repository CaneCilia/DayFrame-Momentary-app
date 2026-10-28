/**
 * DayFrame Design System & Theme
 * 
 * Aesthetic Direction:
 * - Minimal black, white, architectural blue, and subtle grey palette.
 * - Calm, editorial typography with generous whitespace.
 * - Flat, tone-stepped surfaces with quiet 1px boundaries (no puffy drop shadows).
 * - Restrained geometry with purposeful border radii.
 * - Photo-first philosophy: UI recedes into a quiet frame so memories take center stage.
 */

export const theme = {
  colors: {
    // Ground & Surfaces
    background: '#FAFAFA',
    card: '#FFFFFF',
    surface: {
      base: '#FFFFFF',
      subtle: '#F4F5F7',
      secondary: '#ECEEF2',
      muted: '#E2E8F0',
      elevated: '#FFFFFF',
      dark: '#0F141C',
      darkElevated: '#1A202C',
    },

    // Editorial Typography
    text: {
      primary: '#0F141C',
      secondary: '#64748B',
      tertiary: '#94A3B8',
      inverse: '#FFFFFF',
    },

    // Core Brand & Architectural Blue Accent
    primary: '#0F141C',         // Deep obsidian ink
    primaryLight: '#1E293B',    // Slate charcoal
    accent: '#2563EB',          // Architectural sapphire blue
    accentSoft: '#EFF6FF',      // 5% subtle blue tint
    accentTrack: '#DBEAFE',     // Soft blue border/track
    accentInk: '#1E40AF',       // Deep blue text
    
    // Hairline Rules & Dividers
    border: '#E2E8F0',
    borderSubtle: '#F1F5F9',

    // Status (Quiet, non-neon)
    success: '#166534',
    error: '#991B1B',

    // Item Types & Timeline Markers (Cohesive graphite, slate, blue, and stone tones)
    itemTypes: {
      memory: '#0F141C',    // Deep obsidian
      photo: '#2563EB',     // Architectural blue
      event: '#334155',     // Slate graphite
      note: '#475569',      // Muted slate
      milestone: '#1E293B', // Dark charcoal
    },

    // Soft backgrounds for tags
    itemTypeTints: {
      memory: 'rgba(15, 20, 28, 0.05)',
      photo: 'rgba(37, 99, 235, 0.08)',
      event: 'rgba(51, 65, 85, 0.06)',
      note: 'rgba(71, 85, 105, 0.06)',
      milestone: 'rgba(30, 41, 59, 0.08)',
    },
  },

  // Single-Gradient Presets (Photo overlay scrims for crystal-clear readability)
  gradients: {
    scrimDark: ['transparent', 'rgba(15, 20, 28, 0.85)'] as const,
    scrimSoft: ['transparent', 'rgba(15, 20, 28, 0.55)'] as const,
    scrimDeep: ['transparent', 'rgba(15, 20, 28, 0.95)'] as const,
    scrimTop: ['rgba(15, 20, 28, 0.6)', 'transparent'] as const,
    scrimWhite: ['transparent', 'rgba(250, 250, 250, 0.92)'] as const,

    // Monochromatic subtle surface shift
    subtleMonochrome: ['rgba(15, 20, 28, 0.02)', 'rgba(15, 20, 28, 0.05)'] as const,
    subtleDark: ['rgba(15, 20, 28, 0.85)', 'rgba(15, 20, 28, 0.98)'] as const,
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
    sm: 6,
    md: 10,
    lg: 16,
    xl: 24,
    pill: 9999,
  },

  // Quiet, understated separation (No heavy floating shadows)
  shadows: {
    sm: {
      shadowColor: '#0F141C',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#0F141C',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    lg: {
      shadowColor: '#0F141C',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
  },
};
