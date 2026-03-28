import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axiosConfig'
import ContactCard from '../components/Contacts/ContactCard'
import ContactForm from '../components/Contacts/ContactForm'
import DeleteConfirmModal from '../components/Contacts/DeleteConfirmModal'
import SearchBar from '../components/UI/SearchBar'
import Spinner from '../components/UI/Spinner'

const PAGE_SIZE = 9 // 9 contacts = grille 3x3 propre sur desktop

export default function DashboardPage() {
  const [contacts, setContacts] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  const [editingContact, setEditingContact] = useState(null)
  const [deletingContact, setDeletingContact] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  /*
   * fetchContacts est mémoïsée avec useCallback.
   * Elle ne change que si currentPage ou searchTerm change.
   * Sans ça, l'useEffect ci-dessous bouclerait infiniment.
   */
  const fetchContacts = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = {
        page: currentPage,
        pageSize: PAGE_SIZE,
        ...(searchTerm ? { search: searchTerm } : {}),
      }
      const response = await api.get('/contacts', { params })
      setContacts(response.data.data)
      setTotalCount(response.data.totalCount)
      setTotalPages(response.data.totalPages)
    } catch {
      toast.error('Impossible de charger les contacts.')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchTerm])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  // Quand l'utilisateur tape dans la SearchBar, revenir à la page 1
  const handleSearch = useCallback((term) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }, [])

  const handleCreate = async (formData) => {
    setIsSubmitting(true)
    try {
      await api.post('/contacts', formData)
      toast.success('Contact ajouté avec succès !')
      setShowAddForm(false)
      // Revenir à la page 1 pour voir le nouveau contact en tête
      setCurrentPage(1)
      if (currentPage === 1) fetchContacts()
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'ajout.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (formData) => {
    setIsSubmitting(true)
    try {
      const response = await api.put(`/contacts/${editingContact.id}`, formData)
      // Mettre à jour localement sans recharger toute la page
      setContacts(prev =>
        prev.map(c => c.id === editingContact.id ? response.data : c)
      )
      toast.success('Contact modifié avec succès !')
      setEditingContact(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la modification.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await api.delete(`/contacts/${deletingContact.id}`)
      toast.success(`${deletingContact.firstName} ${deletingContact.lastName} supprimé.`)
      setDeletingContact(null)
      // Si on supprime le dernier contact de la page, reculer d'une page
      const newTotal = totalCount - 1
      const newTotalPages = Math.ceil(newTotal / PAGE_SIZE) || 1
      const pageToGo = currentPage > newTotalPages ? newTotalPages : currentPage
      if (pageToGo !== currentPage) {
        setCurrentPage(pageToGo)
      } else {
        fetchContacts()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mes Contacts</h1>
          <p className="text-gray-500 text-sm mt-1">
            {totalCount} contact{totalCount !== 1 ? 's' : ''}
            {searchTerm && ` pour "${searchTerm}"`}
          </p>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setEditingContact(null) }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <span className="text-lg">+</span> Ajouter un contact
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Rechercher par nom, email, téléphone, entreprise..."
        />
      </div>

      {/* Formulaire d'ajout / modification */}
      {(showAddForm || editingContact) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {editingContact ? 'Modifier le contact' : 'Nouveau contact'}
          </h2>
          <ContactForm
            contact={editingContact}
            onSubmit={editingContact ? handleUpdate : handleCreate}
            onCancel={() => { setShowAddForm(false); setEditingContact(null) }}
            isLoading={isSubmitting}
          />
        </div>
      )}

      {/* Contenu principal */}
      {isLoading ? (
        <Spinner size="lg" className="mt-16" />
      ) : contacts.length === 0 ? (
        <div className="text-center mt-16">
          <div className="text-6xl mb-4">{searchTerm ? '🔍' : '📭'}</div>
          <h3 className="text-xl font-medium text-gray-600">
            {searchTerm
              ? `Aucun résultat pour "${searchTerm}"`
              : "Vous n'avez pas encore de contacts"}
          </h3>
          {!searchTerm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              Ajouter mon premier contact
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Grille de contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map(contact => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={(c) => { setEditingContact(c); setShowAddForm(false) }}
                onDelete={(c) => setDeletingContact(c)}
              />
            ))}
          </div>

          {/*
           * PAGINATION
           * On affiche les boutons seulement s'il y a plus d'une page.
           */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Précédent
              </button>

              <span className="text-sm text-gray-600">
                Page <strong>{currentPage}</strong> sur <strong>{totalPages}</strong>
              </span>

              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}

      {/* Modale de confirmation de suppression */}
      <DeleteConfirmModal
        contact={deletingContact}
        onConfirm={handleDelete}
        onCancel={() => setDeletingContact(null)}
        isLoading={isSubmitting}
      />
    </div>
  )
}
