import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

/*
 * DECISION : <Toaster> est placé ici, au niveau le plus haut de l'arbre React.
 *
 * react-hot-toast utilise un système de portail : les notifications sont
 * affichées dans un div en dehors de l'arbre React principal (dans document.body),
 * donc elles s'affichent toujours par-dessus tout le reste sans problème de z-index.
 *
 * On n'a besoin que d'UN SEUL <Toaster> pour toute l'application.
 * Ensuite, dans n'importe quel composant, on appelle juste :
 *   toast.success("Contact créé !")
 *   toast.error("Une erreur est survenue")
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: '8px',
          fontSize: '14px',
        },
        success: {
          style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' },
        },
        error: {
          style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
        },
      }}
    />
  </StrictMode>,
)
