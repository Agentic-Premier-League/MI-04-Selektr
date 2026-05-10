import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F3F0EE",
        lifted: "#FCFBFA",
        ink: "#141413",
        charcoal: "#262627",
        cream: "#F3F0EE",
        slate: "#696969",
        granite: "#555555",
        graphite: "#565656",
        signal: "#CF4500",
        arc: "#F37338",
        clay: "#9A3A0A",
        ghost: "#E8E2DA",
        link: "#3860BE",
        bone: "#F4F4F4",
        dust: "#D1CDC7",
      },
      borderRadius: {
        pill: "999px",
        btn: "20px",
        card: "40px",
        msg: "24px",
        sm: "6px",
      },
      fontFamily: {
        sans: ['"Sofia Sans"', "Arial", "sans-serif"],
      },
      fontWeight: {
        "450": "450",
      },
      letterSpacing: {
        "tight-2": "-0.02em",
        "tight-3": "-0.03em",
        eyebrow: "0.04em",
      },
      boxShadow: {
        nav: "rgba(0,0,0,0.04) 0 4px 24px",
        card: "rgba(0,0,0,0.08) 0 24px 48px",
        feature: "rgba(0,0,0,0.25) 0 70px 110px",
      },
      animation: {
        "spin-slow": "spin 4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
