
export type ThemeName = "lover-rose";

export interface CustomTheme {
  name: ThemeName;
  version: string;
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
