/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./content/**/*.{md,njk,html}",
    "./layouts/**/*.{njk,html}",
    "./includes/**/*.{njk,html}",
    "./assets/js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        dark: "#1c1d1e", // biografi.rolfborjlind.com
        hub: "#282828",  // rolfborjlind.com
        light: "#fdf9f0"
      },
      fontFamily: {
        // match live sites (serif-first)
        serif: ["ui-serif", "Georgia", "Cambria", '"Times New Roman"', "Times", "serif"],
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Inter", "Arial"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "monospace"]
      },
      letterSpacing: {
        cta: "0.3em" // close to live hub CTA (5px at 16px)
      }
    }
  },
  plugins: [require("@tailwindcss/typography")]
};
