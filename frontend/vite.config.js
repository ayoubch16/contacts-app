import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/*
 * DECISION : Vite comme bundler (remplaçant de Create React App).
 *
 * Vite est beaucoup plus rapide que webpack (CRA) grâce à :
 * - ESModules natifs en développement (pas de bundling)
 * - Hot Module Replacement (HMR) quasi-instantané
 *
 * La config "proxy" est essentielle :
 * Quand le frontend appelle /api/..., Vite redirige vers le backend.
 * Avantages :
 * 1. Évite les problèmes CORS en développement (même origin du point de vue du navigateur)
 * 2. Facile à changer l'URL du backend sans modifier le code React
 *
 * Note : en production, ce proxy n'existe plus → configurer CORS sur le backend
 * (ce qu'on a déjà fait dans Program.cs)
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      }
    }
  }
})
