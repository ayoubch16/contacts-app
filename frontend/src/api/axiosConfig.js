import axios from 'axios'

/*
 * DECISION : Instance Axios centralisée (au lieu d'utiliser axios directement).
 *
 * En créant une instance avec axios.create(), on configure une fois pour toutes :
 * - L'URL de base de l'API
 * - Les headers par défaut
 * - Les intercepteurs (interceptors)
 *
 * Sans ça, on devrait répéter la baseURL et les headers dans CHAQUE appel API.
 *
 * baseURL '/api' fonctionne grâce au proxy Vite en développement.
 * En production, mettre l'URL complète : 'https://api.monsite.com/api'
 */
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

/*
 * DECISION : Intercepteur de requête (Request Interceptor).
 *
 * Un intercepteur "intercepte" chaque requête AVANT qu'elle soit envoyée.
 * Ici, on ajoute automatiquement le token JWT à chaque requête.
 *
 * Sans ça, il faudrait ajouter le header Authorization manuellement
 * dans chaque composant React → duplication de code.
 *
 * Le token est lu depuis localStorage où il a été stocké lors du login.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/*
 * DECISION : Intercepteur de réponse (Response Interceptor).
 *
 * Intercepte chaque réponse HTTP.
 * Si le serveur renvoie 401 (Unauthorized = token expiré ou invalide),
 * on déconnecte l'utilisateur automatiquement et on le redirige vers /login.
 *
 * Cela évite que l'utilisateur reste bloqué sur un écran vide parce que
 * son token a expiré.
 *
 * Note : on ne peut pas utiliser useNavigate() ici (pas un composant React),
 * donc on utilise window.location.href directement.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
