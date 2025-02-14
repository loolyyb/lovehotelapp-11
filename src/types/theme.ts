export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  spacing: {
    headerHeight: string;
    mobileNavHeight: string;
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface CustomTheme extends ThemeConfig {
  name: string;
  version: string;
}

export type ThemeName = 'default' | 'lover';