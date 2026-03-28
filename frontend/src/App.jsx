import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/Layout/PrivateRoute'
import Navbar from './components/Layout/Navbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import NotFoundPage from './pages/NotFoundPage'

/*
 * DECISION : Structure de l'application avec React Router v6.
 *
 * Hiérarchie des providers (de l'extérieur vers l'intérieur) :
 * 1. BrowserRouter : gère la navigation via l'historique du navigateur
 * 2. AuthProvider : fournit l'état d'auth à toute l'app
 * 3. Routes/Route : définit quelle page afficher selon l'URL
 *
 * IMPORTANT : L'ordre est crucial. AuthProvider DOIT être à l'intérieur
 * de BrowserRouter pour que les hooks de navigation fonctionnent.
 *
 * React Router v6 vs v5 :
 * - Plus de <Switch>, on utilise <Routes>
 * - Les routes imbriquées sont plus simples avec <Outlet>
 * - Pas de "exact" nécessaire (les routes sont exactes par défaut)
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Navbar est toujours visible (affichée ou masquée selon l'auth dans le composant) */}
        <Navbar />
        <main className="min-h-screen bg-gray-50">
          <Routes>
            {/* Route publique : accessible sans connexion */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/*
              Route protégée : PrivateRoute vérifie si l'utilisateur est connecté.
              Si non → redirige vers /login.
              Si oui → affiche DashboardPage.
            */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />

            {/* Redirection de la racine vers le dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 : toute URL non reconnue */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  )
}
