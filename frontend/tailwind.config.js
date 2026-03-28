/** @type {import('tailwindcss').Config} */
export default {
  /*
   * DECISION : "content" indique à Tailwind quels fichiers scanner
   * pour trouver les classes CSS utilisées.
   * Tailwind supprime les classes inutilisées au build (tree-shaking CSS)
   * → bundle CSS très léger en production.
   */
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
