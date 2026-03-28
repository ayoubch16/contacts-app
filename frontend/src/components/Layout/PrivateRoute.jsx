import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

/*
 * DECISION : PrivateRoute = composant gardien (guard).
 *
 * Pattern classique React Router v6 pour protéger des routes.
 *
 * Comment ça fonctionne :
 * - Si isAuthenticated = true → rendre les enfants (children) normalement
 * - Si isAuthenticated = false → <Navigate> redirige vers /login SANS rendre la page
 *
 * "replace" sur Navigate remplace l'URL dans l'historique du navigateur.
 * Sans replace, le bouton "retour" ramènerait sur la page protégée
 * (qui redirigerait encore vers login → boucle infinie).
 *
 * Utilisation dans App.jsx :
 * <PrivateRoute><DashboardPage /></PrivateRoute>
 */
export default function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
