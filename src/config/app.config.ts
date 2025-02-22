
export const appConfig = {
  branding: {
    name: "Love Hotel",
    logo: "/logo.svg",
    favicon: "/favicon.ico",
    ogImage: "/og-image.png",
    description: "Une expérience de dating exclusive",
    themeColor: "#ffffff",
  },
  navigation: {
    mobileMenu: [
      { name: "Accueil", href: "/", icon: "home" },
      { name: "Recherche", href: "/search", icon: "search" },
      { name: "Rideaux Ouverts", href: "/rideaux-ouverts", icon: "curtains" },
      { name: "LoverCoin", href: "/lover-coin", icon: "coin" },
    ],
    mainMenu: [
      { name: "Profils", href: "/profiles" },
      { name: "Messages", href: "/messages" },
      { name: "Mon Profil", href: "/profile" },
    ],
  },
  features: {
    enablePWA: true,
    enableMessaging: true,
    enableProfileMatching: true,
    enableLoverCoin: true,
  },
  api: {
    endpoints: {
      profiles: "/api/profiles",
      messages: "/api/messages",
      matches: "/api/matches",
    },
  },
} as const;

export type AppConfig = typeof appConfig;
