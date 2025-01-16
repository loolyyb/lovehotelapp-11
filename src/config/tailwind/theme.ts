import { colors } from './colors';
import { animation } from './animations';

export const theme = {
  container: {
    center: true,
    padding: "2rem",
    screens: {
      "2xl": "1400px",
    },
  },
  extend: {
    colors,
    fontFamily: {
      montserrat: ['Montserrat', 'sans-serif'],
      cormorant: ['Cormorant Garamond', 'serif'],
    },
    boxShadow: {
      'admin-shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    },
    animation,
  },
};