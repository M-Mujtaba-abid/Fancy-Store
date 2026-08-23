/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // Enable class-based dark mode for next-themes
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary-color)",
        "text-main": "var(--text-main)",
        "text-muted": "var(--text-muted)",
        error: "var(--error)",
        success: "var(--success)",
        "border-custom": "var(--border-light)",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
