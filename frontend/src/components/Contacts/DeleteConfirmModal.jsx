/*
 * DECISION : Modale de confirmation avant suppression.
 *
 * Supprimer un contact est une action IRRÉVERSIBLE (pas de "corbeille").
 * Demander confirmation évite les suppressions accidentelles.
 *
 * Pattern "Portal" : idéalement, une modale devrait être rendue dans
 * document.body pour éviter les problèmes de z-index et d'overflow.
 * Avec ReactDOM.createPortal() on peut le faire.
 * Pour simplifier ici, on utilise une modale "en overlay" classique.
 */
export default function DeleteConfirmModal({ contact, onConfirm, onCancel, isLoading }) {
  if (!contact) return null

  return (
    // Overlay sombre derrière la modale
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        {/* Icône d'avertissement */}
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 rounded-full p-2">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Confirmer la suppression</h3>
        </div>

        <p className="text-gray-600 mb-6">
          Êtes-vous sûr de vouloir supprimer{' '}
          <strong className="text-gray-800">
            {contact.firstName} {contact.lastName}
          </strong>{' '}
          ? Cette action est irréversible.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            {isLoading ? 'Suppression...' : 'Supprimer'}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}
