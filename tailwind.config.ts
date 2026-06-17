import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-source-sans)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
        "body-serif": ["var(--font-source-serif)", "serif"],
        logo: ["var(--font-pinyon)", "cursive"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Remap slate to warm cream/charcoal palette (Heritage Elegance)
        slate: {
          50: "#fff8f5",   // Very warm cream background
          100: "#f9f0eb",  // Card cream background
          150: "#f0e4dd",  // Light border / hover cream
          200: "#e9dcd3",  // Standard border cream
          250: "#dbc0bf",  // Warm border line
          300: "#d3b5b3",
          350: "#8a7372",
          400: "#7e6867",
          450: "#775a59",
          455: "#715554",
          500: "#654a49",
          550: "#554241",  // Medium charcoal text
          600: "#4d3938",
          650: "#3f2b2a",
          655: "#34201f",
          700: "#2d2926",  // Dark charcoal text
          750: "#1f293d",  // Lighter dark slate-blue hover
          800: "#171e30",  // Dark slate-blue card border/surface
          850: "#111625",  // Dark slate-blue surface
          900: "#0b0f19",  // Main dark slate-blue background
          950: "#090d16",  // Deeper dark slate-blue
        },
        // Remap purple to rich maroon shades
        purple: {
          50: "#fdf3f3",
          100: "#fbe5e6",
          200: "#f7cdcf",
          300: "#f0a7aa",
          400: "#e27675",  // Light maroon-coral for dark mode highlights
          450: "#d05a5a",
          500: "#a82b2f",
          550: "#7e292c",  // Standard maroon hover
          555: "#6d1c1f",
          600: "#5d1016",  // Brand maroon / primary CTA
          650: "#4d0b0f",
          655: "#3d0006",  // Deep brand maroon titles
        },
        // Remap indigo to antique gold shades
        indigo: {
          50: "#fbfaf6",
          100: "#f7f4ea",
          200: "#ede7cd",
          300: "#ded2a1",
          400: "#cda96e",
          500: "#c5a059",  // Brand antique gold
          600: "#775a19",  // Dark brand gold / text
          700: "#5d4201",
          850: "#392900",
          900: "#1b1200",
        },
        // Remap emerald to elegant sage/olive green
        emerald: {
          450: "#a3b86c",
          500: "#8a9a5b",  // Sage Green
          650: "#556b2f",
          700: "#3e4c16",
        },
        amber: {
          450: "#f8ae18",
          650: "#c76508",
          655: "#c26008",
          955: "#5e2809",
        },
        red: {
          650: "#cc2121",
          655: "#c81f1f",
          955: "#621414",
        },
        rose: {
          450: "#f85872",
          650: "#d01842",
        },
        blue: {
          450: "#4e94f8",
          650: "#2159e2",
          655: "#1f53dd",
        },
        teal: {
          650: "#0e857b",
          655: "#0e8178",
        },
      },
    },
  },
  plugins: [],
};
export default config;
