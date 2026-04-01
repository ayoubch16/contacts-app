import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

const Field = ({ label, name, type = 'text', placeholder, required, formData, fieldErrors, handleChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={formData[name]}
      onChange={handleChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        fieldErrors[name] ? 'border-red-400' : 'border-gray-300'
      }`}
    />
    {fieldErrors[name] && (
      <p className="text-red-500 text-xs mt-1">{fieldErrors[name]}</p>
    )}
  </div>
)

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const errors = {}
    if (!formData.firstName.trim()) errors.firstName = 'Le prénom est obligatoire'
    if (!formData.lastName.trim()) errors.lastName = 'Le nom est obligatoire'
    if (!formData.email.trim()) errors.email = "L'email est obligatoire"
    if (formData.password.length < 6) errors.password = 'Minimum 6 caractères'
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      /*
       * DECISION : On appelle register() qui crée le compte ET génère un token.
       * Mais au lieu de connecter directement l'utilisateur, on le redirige
       * vers /login avec un message de succès. Il doit se connecter manuellement.
       *
       * Cela lui permet de vérifier ses identifiants une fois, ce qui réduit
       * les confusions si l'email était mal saisi.
       *
       * Alternative : connecter directement → rediriger vers /dashboard.
       * Les deux approches sont valides, c'est un choix UX.
       */
      await register(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password
      )
      toast.success('Compte créé avec succès ! Connectez-vous pour continuer.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création du compte.')
    } finally {
      setIsLoading(false)
    }
  }

  const fieldProps = { formData, fieldErrors, handleChange }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📇</div>
          <h1 className="text-3xl font-bold text-gray-800">Créer un compte</h1>
          <p className="text-gray-500 mt-2">Gérez vos contacts en toute simplicité</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Prénom" name="firstName" required {...fieldProps} />
              <Field label="Nom" name="lastName" required {...fieldProps} />
            </div>
            <Field label="Email" name="email" type="email" placeholder="jean@exemple.com" required {...fieldProps} />
            <Field label="Mot de passe" name="password" type="password" placeholder="Minimum 6 caractères" required {...fieldProps} />
            <Field label="Confirmer le mot de passe" name="confirmPassword" type="password" required {...fieldProps} />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 px-4 rounded-lg font-medium transition-colors mt-2"
            >
              {isLoading ? 'Création du compte...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
