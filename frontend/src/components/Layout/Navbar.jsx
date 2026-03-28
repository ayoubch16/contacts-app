import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Si l'utilisateur n'est pas connecté, ne pas afficher la navbar
  if (!isAuthenticated) return null

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo / titre */}
        <Link to="/dashboard" className="text-xl font-bold hover:text-blue-100 transition-colors">
          📇 Mes Contacts
        </Link>

        {/* Infos utilisateur + bouton déconnexion */}
        <div className="flex items-center gap-4">
          <span className="text-blue-100 text-sm">
            Bonjour, <strong className="text-white">{user?.firstName}</strong>
          </span>
          <button
            onClick={handleLogout}
            className="bg-blue-700 hover:bg-blue-800 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  )
}
