/**
 * Centralized Theme Configuration
 * 
 * This file contains all design tokens for the PrenatalPlus mobile app:
 * - Colors (primary, secondary, semantic)
 * - Typography scale
 * - Spacing system
 * - Border radius values
 * - Shadow definitions
 * - Animation timings
 */

export const colors = {
    // Primary Colors - Calming Blue
    primary: {
        50: '#EFF6FF',
        100: '#DBEAFE',
        200: '#BFDBFE',
        300: '#93C5FD',
        400: '#60A5FA',
        500: '#3B82F6', // Main primary
        600: '#2563EB',
        700: '#1D4ED8',
        800: '#1E40AF',
        900: '#1E3A8A',
    },

    // Secondary Colors - Soft Pink (Pregnancy theme)
    secondary: {
        50: '#FDF2F8',
        100: '#FCE7F3',
        200: '#FBCFE8',
        300: '#F9A8D4',
        400: '#F472B6',
        500: '#EC4899', // Main secondary
        600: '#DB2777',
        700: '#BE185D',
        800: '#9D174D',
        900: '#831843',
    },

    // Accent Colors - Purple
    accent: {
        50: '#FAF5FF',
        100: '#F3E8FF',
        200: '#E9D5FF',
        300: '#D8B4FE',
        400: '#C084FC',
        500: '#A855F7', // Main accent
        600: '#9333EA',
        700: '#7E22CE',
        800: '#6B21A8',
        900: '#581C87',
    },

    // Semantic Colors
    success: {
        50: '#F0FDF4',
        100: '#DCFCE7',
        200: '#BBF7D0',
        300: '#86EFAC',
        400: '#4ADE80',
        500: '#22C55E', // Main success
        600: '#16A34A',
        700: '#15803D',
        800: '#166534',
        900: '#14532D',
    },

    warning: {
        50: '#FFFBEB',
        100: '#FEF3C7',
        200: '#FDE68A',
        300: '#FCD34D',
        400: '#FBBF24',
        500: '#F59E0B', // Main warning
        600: '#D97706',
        700: '#B45309',
        800: '#92400E',
        900: '#78350F',
    },

    danger: {
        50: '#FEF2F2',
        100: '#FEE2E2',
        200: '#FECACA',
        300: '#FCA5A5',
        400: '#F87171',
        500: '#EF4444', // Main danger
        600: '#DC2626',
        700: '#B91C1C',
        800: '#991B1B',
        900: '#7F1D1D',
    },

    // Neutral Colors
    gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
    },

    // Special Colors
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',

    // Background Colors
    background: {
        primary: '#FFFFFF',
        secondary: '#F9FAFB',
        tertiary: '#F3F4F6',
        muted: '#E5E7EB',
    },

    // Text Colors
    text: {
        primary: '#111827',
        secondary: '#6B7280',
        tertiary: '#9CA3AF',
        inverse: '#FFFFFF',
        disabled: '#D1D5DB',
    },

    // Border Colors
    border: {
        light: '#F3F4F6',
        default: '#E5E7EB',
        medium: '#D1D5DB',
        dark: '#9CA3AF',
    },
};

// Gradient Definitions
export const gradients = {
    primary: ['#3B82F6', '#2563EB'] as readonly [string, string],
    secondary: ['#EC4899', '#DB2777'] as readonly [string, string],
    accent: ['#A855F7', '#9333EA'] as readonly [string, string],
    pregnancy: ['#3B82F6', '#A855F7'] as readonly [string, string], // Blue to Purple
    sunset: ['#EC4899', '#F59E0B'] as readonly [string, string], // Pink to Amber
    ocean: ['#06B6D4', '#3B82F6'] as readonly [string, string], // Cyan to Blue
    success: ['#22C55E', '#16A34A'] as readonly [string, string],
    danger: ['#EF4444', '#DC2626'] as readonly [string, string],
    background: ['#F9FBFF', '#FFFFFF'] as readonly [string, string],
    card: ['#FFFFFF', '#F9FAFB'] as readonly [string, string],
};

// Typography Scale
export const typography = {
    fontFamily: {
        regular: 'System',
        medium: 'System',
        semibold: 'System',
        bold: 'System',
    },

    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
        '5xl': 48,
    },

    fontWeight: {
        normal: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
        extrabold: '800' as const,
    },

    lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
    },

    letterSpacing: {
        tight: -0.5,
        normal: 0,
        wide: 0.5,
        wider: 1,
    },
};

// Spacing System (4px based)
export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
    '4xl': 96,
};

// Border Radius
export const borderRadius = {
    none: 0,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 40,
    full: 9999,
};

// Shadow Definitions (for iOS and Android)
export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 8,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 16,
        elevation: 12,
    },
    colored: (color: string) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 8,
    }),
};

// Animation Timings
export const animation = {
    duration: {
        fast: 150,
        normal: 300,
        slow: 500,
        slower: 700,
    },
    easing: {
        linear: 'linear' as const,
        easeIn: 'ease-in' as const,
        easeOut: 'ease-out' as const,
        easeInOut: 'ease-in-out' as const,
    },
};

// Icon Sizes
export const iconSize = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
    '2xl': 48,
};

// Touch Target Sizes (Accessibility)
export const touchTarget = {
    min: 44, // Minimum touch target size (iOS HIG)
    comfortable: 48,
    large: 56,
};

// Z-Index Scale
export const zIndex = {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
};

// Default Theme Export
export const theme = {
    colors,
    gradients,
    typography,
    spacing,
    borderRadius,
    shadows,
    animation,
    iconSize,
    touchTarget,
    zIndex,
};

export type Theme = typeof theme;
export default theme;
