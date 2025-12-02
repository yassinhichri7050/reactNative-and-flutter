/**
 * Système de thèmes - 3 thèmes disponibles
 */

export interface Theme {
  name: ThemeName;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    border: string;
    disabled: string;
    white: string;
    black: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  typography: {
    displayLarge: { fontSize: number; fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'bold' | 'normal' };
    displayMedium: { fontSize: number; fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'bold' | 'normal' };
    displaySmall: { fontSize: number; fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'bold' | 'normal' };
    titleLarge: { fontSize: number; fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'bold' | 'normal' };
    titleMedium: { fontSize: number; fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'bold' | 'normal' };
    titleSmall: { fontSize: number; fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'bold' | 'normal' };
    bodyLarge: { fontSize: number; fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'bold' | 'normal' };
    bodyMedium: { fontSize: number; fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'bold' | 'normal' };
    bodySmall: { fontSize: number; fontWeight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'bold' | 'normal' };
  };
}

export type ThemeName = 'gold_light' | 'gold_dark' | 'green_nature';

/**
 * Thème Gold Light (par défaut)
 */
export const goldLightTheme: Theme = {
  name: 'gold_light',
  colors: {
    primary: '#D4AF37',
    secondary: '#C5A257',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    textPrimary: '#212121',
    textSecondary: '#757575',
    error: '#EF5350',
    success: '#66BB6A',
    warning: '#FFA726',
    info: '#29B6F6',
    border: '#E0E0E0',
    disabled: '#BDBDBD',
    white: '#FFFFFF',
    black: '#000000',
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
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  typography: {
    displayLarge: { fontSize: 34, fontWeight: '700' },
    displayMedium: { fontSize: 28, fontWeight: '700' },
    displaySmall: { fontSize: 24, fontWeight: '600' },
    titleLarge: { fontSize: 22, fontWeight: '600' },
    titleMedium: { fontSize: 18, fontWeight: '600' },
    titleSmall: { fontSize: 16, fontWeight: '600' },
    bodyLarge: { fontSize: 16, fontWeight: '400' },
    bodyMedium: { fontSize: 14, fontWeight: '400' },
    bodySmall: { fontSize: 12, fontWeight: '400' },
  },
};

/**
 * Thème Gold Dark
 */
export const goldDarkTheme: Theme = {
  name: 'gold_dark',
  colors: {
    primary: '#D4AF37',
    secondary: '#FFD700',
    background: '#121212',
    surface: '#1E1E1E',
    textPrimary: '#FFFFFF',
    textSecondary: '#B3B3B3',
    error: '#EF5350',
    success: '#66BB6A',
    warning: '#FFA726',
    info: '#29B6F6',
    border: '#424242',
    disabled: '#757575',
    white: '#FFFFFF',
    black: '#000000',
  },
  spacing: goldLightTheme.spacing,
  borderRadius: goldLightTheme.borderRadius,
  typography: goldLightTheme.typography,
};

/**
 * Thème Green Nature
 */
export const greenNatureTheme: Theme = {
  name: 'green_nature',
  colors: {
    primary: '#4CAF50',
    secondary: '#8BC34A',
    background: '#FFFFFF',
    surface: '#F1F8E9',
    textPrimary: '#1B5E20',
    textSecondary: '#558B2F',
    error: '#EF5350',
    success: '#66BB6A',
    warning: '#FFA726',
    info: '#29B6F6',
    border: '#C5E1A5',
    disabled: '#BDBDBD',
    white: '#FFFFFF',
    black: '#000000',
  },
  spacing: goldLightTheme.spacing,
  borderRadius: goldLightTheme.borderRadius,
  typography: goldLightTheme.typography,
};

/**
 * Map des thèmes disponibles
 */
export const themes: Record<ThemeName, Theme> = {
  gold_light: goldLightTheme,
  gold_dark: goldDarkTheme,
  green_nature: greenNatureTheme,
};
