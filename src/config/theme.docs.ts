
/**
 * Documentation officielle du thème "lover-rose"
 * 
 * IMPORTANT : Ce thème est verrouillé et ne doit pas être modifié.
 * Il définit l'identité visuelle fondamentale de l'application.
 */

export const LOVER_ROSE_THEME_DOCUMENTATION = {
  /**
   * Palette de couleurs officielle
   */
  colors: {
    primary: "hsl(270 60% 50%)",      // Violet principal - NE PAS MODIFIER
    secondary: "hsl(300 90% 60%)",     // Rose vif - NE PAS MODIFIER
    accent: "hsl(260 40% 54%)",        // Violet doux - NE PAS MODIFIER
    background: "hsl(251 100% 97%)",   // Fond légèrement lavande - NE PAS MODIFIER
    text: "hsl(230 24% 14%)",          // Gris foncé bleuté - NE PAS MODIFIER
  },

  /**
   * Typographie officielle
   */
  fonts: {
    heading: "'Cormorant Garamond', serif",  // Police des titres - NE PAS MODIFIER
    body: "'Montserrat', sans-serif",        // Police du corps - NE PAS MODIFIER
  },

  /**
   * Espacements standards
   */
  spacing: {
    headerHeight: "4.5rem",       // Hauteur d'en-tête - NE PAS MODIFIER
    mobileNavHeight: "4rem",      // Hauteur nav mobile - NE PAS MODIFIER
  },

  /**
   * Points de rupture responsive
   */
  breakpoints: {
    sm: "640px",    // NE PAS MODIFIER
    md: "768px",    // NE PAS MODIFIER
    lg: "1024px",   // NE PAS MODIFIER
    xl: "1280px",   // NE PAS MODIFIER
  },

  /**
   * Instructions pour les développeurs
   */
  developerNotes: {
    warning: "Ce thème est verrouillé. Ne pas modifier les valeurs.",
    purpose: "Maintenir la cohérence visuelle de l'application",
    lastUpdated: "2024-03-12",
    status: "LOCKED",
  }
} as const;
