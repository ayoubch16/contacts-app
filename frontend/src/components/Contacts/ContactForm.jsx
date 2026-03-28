import { useState, useEffect } from 'react'

/*
 * DECISION : Formulaire contrôlé (Controlled Form).
 *
 * En React, un formulaire "contrôlé" = chaque champ de saisie
 * est lié à un état React via value={...} et onChange={...}.
 *
 * React est la "source de vérité" pour les valeurs du formulaire.
 * Avantage : on peut facilement lire, modifier, valider les valeurs.
 *
 * Alternative : formulaires "non contrôlés" avec useRef → moins idiomatique React.
 *
 * Ce composant sert à la FOIS pour créer ET modifier un contact.
 * La prop "contact" est null → création, renseignée → modification.
 */
export default function ContactForm({ contact, onSubmit, onCancel, isLoading }) {
  // État initial du formulaire
  const initialState = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    company: '',
    notes: '',
  }

  const [formData, setFormData] = useState(initialState)
  const [errors, setErrors] = useState({})

  /*
   * useEffect pour pré-remplir le formulaire quand on édite.
   * Si la prop "contact" change (ex: on ouvre le formulaire d'édition),
   * on met à jour l'état avec les données du contact.
   */
  useEffect(() => {
    if (contact) {
      setFormData({
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        phone: contact.phone || '',
        email: contact.email || '',
        address: contact.address || '',
        company: contact.company || '',
        notes: contact.notes || '',
      })
    } else {
      setFormData(initialState)
    }
  }, [contact])

  // Gestionnaire générique pour tous les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Effacer l'erreur du champ dès que l'utilisateur tape
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Validation côté client (en plus de la validation côté serveur)
  const validate = () => {
    const newErrors = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est obligatoire'
    if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est obligatoire'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email invalide'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault() // Empêche le rechargement de la page (comportement HTML par défaut)
    if (validate()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Prénom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prénom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
          )}
        </div>

        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Téléphone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="+33 6 12 34 56 78"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="jean@exemple.com"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
        )}
      </div>

      {/* Entreprise */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Adresse */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Boutons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          {isLoading ? 'Enregistrement...' : contact ? 'Modifier' : 'Ajouter'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
