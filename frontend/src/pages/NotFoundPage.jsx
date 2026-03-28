import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-8xl mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Page introuvable</h1>
        <p className="text-gray-500 mb-8">Cette page n'existe pas.</p>
        <Link
          to="/dashboard"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}
