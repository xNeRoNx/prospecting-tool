import { useKV } from '@github/spark/hooks';

export type Theme = 'default' | 'medium' | 'dark' | 'slate' | 'forest' | 'ocean' | 'sunset';

interface ThemeConfig {
  nameKey: string;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    input: string;
    ring: string;
  };
}

export const themes: Record<Theme, ThemeConfig> = {
  default: {
    nameKey: 'themeDefault',
    colors: {
      background: 'oklch(0.98 0.008 85)',
      foreground: 'oklch(0.20 0.02 45)',
      card: 'oklch(0.99 0.005 85)',
      cardForeground: 'oklch(0.20 0.02 45)',
      popover: 'oklch(1.00 0 0)',
      popoverForeground: 'oklch(0.20 0.02 45)',
      primary: 'oklch(0.48 0.12 75)',
      primaryForeground: 'oklch(0.98 0.008 85)',
      secondary: 'oklch(0.90 0.05 90)',
      secondaryForeground: 'oklch(0.25 0.02 45)',
      accent: 'oklch(0.72 0.08 110)',
      accentForeground: 'oklch(0.20 0.02 45)',
      destructive: 'oklch(0.62 0.15 30)',
      destructiveForeground: 'oklch(0.98 0.008 85)',
      muted: 'oklch(0.94 0.01 85)',
      mutedForeground: 'oklch(0.48 0.01 45)',
      border: 'oklch(0.88 0.02 85)',
      input: 'oklch(0.88 0.02 85)',
      ring: 'oklch(0.48 0.12 75)',
    }
  },
  medium: {
    nameKey: 'themeMedium',
    colors: {
      background: 'oklch(0.35 0.01 240)',
      foreground: 'oklch(0.88 0.01 85)',
      card: 'oklch(0.38 0.01 240)',
      cardForeground: 'oklch(0.88 0.01 85)',
      popover: 'oklch(0.32 0.01 240)',
      popoverForeground: 'oklch(0.88 0.01 85)',
      primary: 'oklch(0.62 0.14 250)',
      primaryForeground: 'oklch(0.35 0.01 240)',
      secondary: 'oklch(0.45 0.02 240)',
      secondaryForeground: 'oklch(0.82 0.01 85)',
      accent: 'oklch(0.52 0.08 270)',
      accentForeground: 'oklch(0.88 0.01 85)',
      destructive: 'oklch(0.58 0.16 20)',
      destructiveForeground: 'oklch(0.35 0.01 240)',
      muted: 'oklch(0.42 0.01 240)',
      mutedForeground: 'oklch(0.62 0.01 85)',
      border: 'oklch(0.50 0.02 240)',
      input: 'oklch(0.50 0.02 240)',
      ring: 'oklch(0.62 0.14 250)',
    }
  },
  dark: {
    nameKey: 'themeDark',
    colors: {
      background: 'oklch(0.08 0.01 240)',
      foreground: 'oklch(0.92 0.01 85)',
      card: 'oklch(0.10 0.01 240)',
      cardForeground: 'oklch(0.92 0.01 85)',
      popover: 'oklch(0.05 0.01 240)',
      popoverForeground: 'oklch(0.92 0.01 85)',
      primary: 'oklch(0.65 0.15 250)',
      primaryForeground: 'oklch(0.08 0.01 240)',
      secondary: 'oklch(0.18 0.02 240)',
      secondaryForeground: 'oklch(0.85 0.01 85)',
      accent: 'oklch(0.35 0.08 270)',
      accentForeground: 'oklch(0.92 0.01 85)',
      destructive: 'oklch(0.62 0.18 25)',
      destructiveForeground: 'oklch(0.08 0.01 240)',
      muted: 'oklch(0.15 0.01 240)',
      mutedForeground: 'oklch(0.68 0.01 85)',
      border: 'oklch(0.22 0.02 240)',
      input: 'oklch(0.22 0.02 240)',
      ring: 'oklch(0.65 0.15 250)',
    }
  },
  slate: {
    nameKey: 'themeSlate',
    colors: {
      background: 'oklch(0.15 0.01 240)',
      foreground: 'oklch(0.90 0.01 85)',
      card: 'oklch(0.18 0.01 240)',
      cardForeground: 'oklch(0.90 0.01 85)',
      popover: 'oklch(0.12 0.01 240)',
      popoverForeground: 'oklch(0.90 0.01 85)',
      primary: 'oklch(0.58 0.12 250)',
      primaryForeground: 'oklch(0.15 0.01 240)',
      secondary: 'oklch(0.25 0.02 240)',
      secondaryForeground: 'oklch(0.82 0.01 85)',
      accent: 'oklch(0.42 0.08 270)',
      accentForeground: 'oklch(0.90 0.01 85)',
      destructive: 'oklch(0.58 0.16 20)',
      destructiveForeground: 'oklch(0.15 0.01 240)',
      muted: 'oklch(0.22 0.01 240)',
      mutedForeground: 'oklch(0.65 0.01 85)',
      border: 'oklch(0.28 0.02 240)',
      input: 'oklch(0.28 0.02 240)',
      ring: 'oklch(0.58 0.12 250)',
    }
  },
  forest: {
    nameKey: 'themeForest',
    colors: {
      background: 'oklch(0.95 0.02 140)',
      foreground: 'oklch(0.18 0.04 160)',
      card: 'oklch(0.97 0.01 140)',
      cardForeground: 'oklch(0.18 0.04 160)',
      popover: 'oklch(0.99 0.005 140)',
      popoverForeground: 'oklch(0.18 0.04 160)',
      primary: 'oklch(0.42 0.16 150)',
      primaryForeground: 'oklch(0.95 0.02 140)',
      secondary: 'oklch(0.88 0.08 140)',
      secondaryForeground: 'oklch(0.22 0.04 160)',
      accent: 'oklch(0.65 0.12 130)',
      accentForeground: 'oklch(0.18 0.04 160)',
      destructive: 'oklch(0.58 0.18 15)',
      destructiveForeground: 'oklch(0.95 0.02 140)',
      muted: 'oklch(0.91 0.03 140)',
      mutedForeground: 'oklch(0.45 0.02 160)',
      border: 'oklch(0.85 0.04 140)',
      input: 'oklch(0.85 0.04 140)',
      ring: 'oklch(0.42 0.16 150)',
    }
  },
  ocean: {
    nameKey: 'themeOcean',
    colors: {
      background: 'oklch(0.96 0.02 220)',
      foreground: 'oklch(0.15 0.04 240)',
      card: 'oklch(0.98 0.01 220)',
      cardForeground: 'oklch(0.15 0.04 240)',
      popover: 'oklch(0.99 0.005 220)',
      popoverForeground: 'oklch(0.15 0.04 240)',
      primary: 'oklch(0.45 0.18 230)',
      primaryForeground: 'oklch(0.96 0.02 220)',
      secondary: 'oklch(0.86 0.08 210)',
      secondaryForeground: 'oklch(0.20 0.04 240)',
      accent: 'oklch(0.62 0.14 200)',
      accentForeground: 'oklch(0.15 0.04 240)',
      destructive: 'oklch(0.60 0.16 25)',
      destructiveForeground: 'oklch(0.96 0.02 220)',
      muted: 'oklch(0.92 0.03 220)',
      mutedForeground: 'oklch(0.42 0.02 240)',
      border: 'oklch(0.84 0.04 220)',
      input: 'oklch(0.84 0.04 220)',
      ring: 'oklch(0.45 0.18 230)',
    }
  },
  sunset: {
    nameKey: 'themeSunset',
    colors: {
      background: 'oklch(0.96 0.03 50)',
      foreground: 'oklch(0.18 0.03 30)',
      card: 'oklch(0.98 0.02 50)',
      cardForeground: 'oklch(0.18 0.03 30)',
      popover: 'oklch(0.99 0.01 50)',
      popoverForeground: 'oklch(0.18 0.03 30)',
      primary: 'oklch(0.55 0.20 40)',
      primaryForeground: 'oklch(0.96 0.03 50)',
      secondary: 'oklch(0.88 0.08 60)',
      secondaryForeground: 'oklch(0.22 0.03 30)',
      accent: 'oklch(0.68 0.16 25)',
      accentForeground: 'oklch(0.18 0.03 30)',
      destructive: 'oklch(0.58 0.18 15)',
      destructiveForeground: 'oklch(0.96 0.03 50)',
      muted: 'oklch(0.91 0.04 50)',
      mutedForeground: 'oklch(0.46 0.02 30)',
      border: 'oklch(0.85 0.05 50)',
      input: 'oklch(0.85 0.05 50)',
      ring: 'oklch(0.55 0.20 40)',
    }
  }
};

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useKV<Theme>('app-theme', 'default');

  const applyTheme = (theme: Theme) => {
    const themeConfig = themes[theme];
    const root = document.documentElement;

    // Apply each color variable to the CSS custom properties
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });

    setCurrentTheme(theme);
  };

  return {
    currentTheme,
    setTheme: applyTheme,
    themes,
  };
}