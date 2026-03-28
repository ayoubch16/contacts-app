import { useState, useEffect } from 'react'

/*
 * DECISION : Debounce dans la SearchBar.
 *
 * Sans debounce : chaque frappe de touche déclenche un appel API.
 * Si l'utilisateur tape "jean dupont" (11 caractères) → 11 requêtes API.
 * C'est du gaspillage et ça surcharge le serveur.
 *
 * Avec debounce (300ms) : on attend que l'utilisateur arrête de taper
 * pendant 300ms avant de déclencher la recherche.
 * "jean dupont" = 1 seule requête API.
 *
 * useEffect avec cleanup : quand la valeur change, on annule le timer
 * précédent et on en crée un nouveau → c'est le mécanisme du debounce.
 */
export default function SearchBar({ onSearch, placeholder = 'Rechercher...' }) {
  const [value, setValue] = useState('')

  useEffect(() => {
    // Créer un timer de 300ms
    const timer = setTimeout(() => {
      onSearch(value) // Appeler le callback seulement après 300ms d'inactivité
    }, 300)

    // Cleanup : annuler le timer si value change avant 300ms
    return () => clearTimeout(timer)
  }, [value, onSearch])

  return (
    <div className="relative">
      {/* Icône loupe */}
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {/* Bouton pour effacer la recherche */}
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </div>
  )
}
