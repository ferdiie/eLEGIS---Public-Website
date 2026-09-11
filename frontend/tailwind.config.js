/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Primary brand scale — anchored to the SB Office management
        // system's navy→violet identity (#090446 at 900, #380075 at 700).
        forest: {
          50: "#EEEDFB",
          100: "#DCDAF7",
          200: "#BEB9EF",
          300: "#9C93E3",
          400: "#7A6BD3",
          500: "#5C46C0",
          600: "#472A9E",
          700: "#380075",
          800: "#240052",
          900: "#090446",
        },
        // Secondary accent — the solid-violet variant the management
        // system uses for its second stat-card color, kept distinct from
        // the primary gradient for section differentiation (Announcements).
        harbor: {
          50: "#F5EDFB",
          100: "#E9D8F5",
          200: "#CCAAE8",
          300: "#AC7ADA",
          400: "#8B4FC7",
          500: "#6B2CA8",
          600: "#571F8D",
          700: "#380075",
          800: "#2A0058",
          900: "#1D003D",
        },
        parchment: "#F8FAFC",
        ink: "#1E293B",
        muted: "#64748B",
      },
      fontFamily: {
        display: ["Montserrat", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Nunito", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      backgroundImage: {
        "seal-hero":
          "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.12) 0, transparent 45%), linear-gradient(135deg, #090446 0%, #380075 100%)",
      },
      boxShadow: {
        card: "0 1px 2px rgba(9,4,70,0.06), 0 6px 20px rgba(9,4,70,0.08)",
        "card-hover": "0 4px 10px rgba(9,4,70,0.10), 0 16px 32px rgba(9,4,70,0.14)",
      },
    },
  },
  plugins: [],
}
