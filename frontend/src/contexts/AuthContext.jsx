import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/axiosConfig'

/*
 * DECISION : Context API pour l'état d'authentification global.
 *
 * Problème sans Context : si plusieurs composants ont besoin de savoir
 * si l'utilisateur est connecté (Navbar, PrivateRoute, Dashboard...),
 * on devrait passer l'info via des props de composant en composant.
 * C'est le "prop drilling" → difficile à maintenir.
 *
 * Solution : Context API crée un "store" global accessible partout.
 * Tout composant peut appeler useAuth() pour savoir qui est connecté.
 *
 * Alternative : Redux, Zustand (librairies externes plus puissantes).
 * Pour cette taille d'app, Context est suffisant et sans dépendance.
 */

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  /*
   * DECISION : Initialiser depuis localStorage.
   *
   * Quand l'utilisateur recharge la page, React repart de zéro.
   * Si on ne persistait pas dans localStorage, l'utilisateur serait
   * déconnecté à chaque rafraîchissement.
   *
   * On lit le token et les infos user depuis localStorage au démarrage.
   */
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  /*
   * useCallback mémoïse la fonction pour éviter de la recréer à chaque render.
   * Important pour les fonctions passées dans un Context car sinon tous les
   * composants qui consomment ce Context re-renderaient inutilement.
   */
  const login = useCallback(async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    const data = response.data

    // Persister le token et les infos user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({
      id: data.userId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    }))

    setToken(data.token)
    setUser({
      id: data.userId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    })

    return data
  }, [])

  const register = useCallback(async (firstName, lastName, email, password) => {
    const response = await api.post('/auth/register', {
      firstName,
      lastName,
      email,
      password,
    })
    const data = response.data

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({
      id: data.userId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    }))

    setToken(data.token)
    setUser({
      id: data.userId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    })

    return data
  }, [])

  const logout = useCallback(() => {
    /*
     * DECISION : Logout côté CLIENT uniquement.
     *
     * On ne fait pas d'appel API pour le logout car les JWT sont "stateless" :
     * le serveur ne garde pas de liste des tokens actifs.
     * On supprime juste le token localement → l'utilisateur ne peut plus
     * l'envoyer → protégé.
     *
     * Limitation : si un token volé n'est pas encore expiré, il reste valide
     * jusqu'à son expiration. Pour éviter ça en production : utiliser une
     * blacklist de tokens côté serveur ou des refresh tokens.
     */
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  const value = {
    token,
    user,
    isAuthenticated: !!token, // !! convertit une valeur en boolean
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/*
 * DECISION : Hook personnalisé useAuth().
 *
 * Au lieu d'importer AuthContext ET useContext dans chaque composant,
 * on crée un hook qui fait les deux en une ligne.
 * Plus propre, et on peut ajouter une vérification que le hook
 * est bien utilisé à l'intérieur d'un AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider')
  }
  return context
}
