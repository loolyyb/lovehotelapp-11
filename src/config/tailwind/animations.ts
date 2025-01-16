export const animation = {
  "accordion-down": "accordion-down 0.2s ease-out",
  "accordion-up": "accordion-up 0.2s ease-out",
  "fadeIn": "fadeIn 0.5s ease-out",
  "slideIn": "slideIn 0.3s ease-out",
  "shine": "shine 1.5s ease-in-out infinite",
  "bounce": "bounce 1s infinite",
};

export const keyframes = {
  "accordion-down": {
    from: { height: "0" },
    to: { height: "var(--radix-accordion-content-height)" },
  },
  "accordion-up": {
    from: { height: "var(--radix-accordion-content-height)" },
    to: { height: "0" },
  },
  fadeIn: {
    "0%": { opacity: "0", transform: "translateY(10px)" },
    "100%": { opacity: "1", transform: "translateY(0)" },
  },
  slideIn: {
    "0%": { transform: "translateX(-100%)" },
    "100%": { transform: "translateX(0)" },
  },
  shine: {
    "0%": { transform: "translateX(-100%)" },
    "100%": { transform: "translateX(100%)" },
  },
  bounce: {
    "0%, 100%": { transform: "translateY(-25%)", animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)" },
    "50%": { transform: "translateY(0)", animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)" },
  },
};