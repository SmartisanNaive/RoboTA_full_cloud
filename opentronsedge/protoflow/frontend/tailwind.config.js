/** @type {import('tailwindcss').Config} */
import tailwindcss from '@tailwindcss/postcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    tailwindcss,
  ],
}
