/*
 * ContactCard affiche les informations d'un contact.
 * C'est un composant "présentationnel" (dumb component) :
 * il ne fait rien tout seul, il reçoit tout via des props.
 *
 * La logique (appels API, état) est dans DashboardPage.
 * Séparation des responsabilités = code plus maintenable.
 */
export default function ContactCard({ contact, onEdit, onDelete }) {
  // Générer des initiales pour l'avatar (ex: "Jean Dupont" → "JD")
  const initials = `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase()

  // Couleur d'avatar basée sur la première lettre du nom (palette de 8 couleurs)
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
    'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ]
  const colorIndex = contact.lastName.charCodeAt(0) % colors.length
  const avatarColor = colors[colorIndex]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Avatar avec initiales */}
        <div className={`${avatarColor} text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0`}>
          {initials}
        </div>

        {/* Informations du contact */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 text-lg truncate">
            {contact.firstName} {contact.lastName}
          </h3>

          {contact.company && (
            <p className="text-gray-500 text-sm">{contact.company}</p>
          )}

          <div className="mt-2 space-y-1">
            {contact.phone && (
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span>📞</span>
                <a href={`tel:${contact.phone}`} className="hover:text-blue-600">
                  {contact.phone}
                </a>
              </p>
            )}
            {contact.email && (
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span>✉️</span>
                <a href={`mailto:${contact.email}`} className="hover:text-blue-600 truncate">
                  {contact.email}
                </a>
              </p>
            )}
            {contact.address && (
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span>📍</span>
                <span className="truncate">{contact.address}</span>
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(contact)}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded transition-colors"
            title="Modifier"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(contact)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
            title="Supprimer"
          >
            🗑️
          </button>
        </div>
      </div>

      {contact.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-500 italic">{contact.notes}</p>
        </div>
      )}
    </div>
  )
}
