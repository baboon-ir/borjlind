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
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Inter", "Arial"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "monospace"]
      }
    }
  },
  plugins: [require("@tailwindcss/typography")]
};
