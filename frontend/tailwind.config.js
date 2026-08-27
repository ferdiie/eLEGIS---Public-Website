/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#EEF6F0",
          100: "#D7EBDC",
          200: "#AED8B8",
          300: "#7EC08F",
          400: "#4DA466",
          500: "#2E8849",
          600: "#1E7A34",
          700: "#175E28",
          800: "#124A20",
          900: "#0F4D22",
        },
        harbor: {
          600: "#26456B",
          700: "#1E3A5F",
          800: "#162B49",
        },
        parchment: "#F7F9F6",
        ink: "#1F2937",
        muted: "#5B6B60",
      },
      fontFamily: {
        display: ["Lora", "ui-serif", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      backgroundImage: {
        "seal-hero":
          "radial-gradient(circle at 15% 30%, rgba(255,255,255,0.08) 0, transparent 45%), linear-gradient(135deg, #1E7A34 0%, #0F4D22 100%)",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,77,34,0.06), 0 4px 14px rgba(15,77,34,0.06)",
      },
    },
  },
  plugins: [],
}
