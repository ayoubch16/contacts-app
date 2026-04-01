import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axiosConfig'
import ContactCard from '../components/Contacts/ContactCard'
import ContactForm from '../components/Contacts/ContactForm'
import DeleteConfirmModal from '../components/Contacts/DeleteConfirmModal'
import SearchBar from '../components/UI/SearchBar'
import Spinner from '../components/UI/Spinner'
import Modal from '../components/UI/Modal'
import CategoriesManager from '../components/Categories/CategoriesManager'

const PAGE_SIZE = 9

export default function DashboardPage() {
  const [contacts, setContacts] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  const [editingContact, setEditingContact] = useState(null)
  const [deletingContact, setDeletingContact] = useState(null)

  // Modales
  const [showContactModal, setShowContactModal] = useState(false)
  const [showCategoriesModal, setShowCategoriesModal] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSearch = useCallback((term) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }, [])

  const openAddModal = () => {
    setEditingContact(null)
    setShowContactModal(true)
  }

  const openEditModal = (contact) => {
    setEditingContact(contact)
    setShowContactModal(true)
  }

  const closeContactModal = () => {
    setShowContactModal(false)
    setEditingContact(null)
  }

  const handleCreate = async (formData) => {
    setIsSubmitting(true)
    try {
      await api.post('/contacts', formData)
      toast.success('Contact ajouté avec succès !')
      closeContactModal()
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
      setContacts(prev =>
        prev.map(c => c.id === editingContact.id ? response.data : c)
      )
      toast.success('Contact modifié avec succès !')
      closeContactModal()
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
      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mes Contacts</h1>
          <p className="text-gray-500 text-sm mt-1">
            {totalCount} contact{totalCount !== 1 ? 's' : ''}
            {searchTerm && ` pour "${searchTerm}"`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCategoriesModal(true)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            🏷️ Catégories
          </button>
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <span className="text-lg">+</span> Ajouter un contact
          </button>
        </div>
      </div>

      {/* ── Barre de recherche ── */}
      <div className="mb-6">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Rechercher par nom, email, téléphone..."
        />
      </div>

      {/* ── Liste des contacts ── */}
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
              onClick={openAddModal}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              Ajouter mon premier contact
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map(contact => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={openEditModal}
                onDelete={(c) => setDeletingContact(c)}
              />
            ))}
          </div>

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

      {/* ── Modale : Ajouter / Modifier un contact ── */}
      <Modal
        isOpen={showContactModal}
        onClose={closeContactModal}
        title={editingContact ? 'Modifier le contact' : 'Nouveau contact'}
      >
        <ContactForm
          contact={editingContact}
          onSubmit={editingContact ? handleUpdate : handleCreate}
          onCancel={closeContactModal}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* ── Modale : Gérer les catégories ── */}
      <Modal
        isOpen={showCategoriesModal}
        onClose={() => setShowCategoriesModal(false)}
        title="Gérer mes catégories"
        maxWidth="max-w-md"
      >
        <CategoriesManager />
      </Modal>

      {/* ── Modale : Confirmer la suppression ── */}
      <DeleteConfirmModal
        contact={deletingContact}
        onConfirm={handleDelete}
        onCancel={() => setDeletingContact(null)}
        isLoading={isSubmitting}
      />
    </div>
  )
}
