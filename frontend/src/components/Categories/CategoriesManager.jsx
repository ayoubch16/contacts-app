import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../api/axiosConfig'

export default function CategoriesManager() {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // null = aucun formulaire ouvert, 0 = ajout, id = édition
  const [editingId, setEditingId] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const res = await api.get('/categories')
      setCategories(res.data)
    } catch {
      toast.error('Impossible de charger les catégories.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const openAdd = () => {
    setEditingId(0)
    setInputValue('')
  }

  const openEdit = (cat) => {
    setEditingId(cat.id)
    setInputValue(cat.name)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setInputValue('')
  }

  const handleSave = async () => {
    const name = inputValue.trim()
    if (!name) return

    setIsSaving(true)
    try {
      if (editingId === 0) {
        const res = await api.post('/categories', { name })
        setCategories(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)))
        toast.success('Catégorie ajoutée.')
      } else {
        const res = await api.put(`/categories/${editingId}`, { name })
        setCategories(prev =>
          prev.map(c => c.id === editingId ? res.data : c)
              .sort((a, b) => a.name.localeCompare(b.name))
        )
        toast.success('Catégorie modifiée.')
      }
      cancelEdit()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la sauvegarde.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (cat) => {
    if (!window.confirm(`Supprimer la catégorie "${cat.name}" ?`)) return
    try {
      await api.delete(`/categories/${cat.id}`)
      setCategories(prev => prev.filter(c => c.id !== cat.id))
      toast.success(`"${cat.name}" supprimée.`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression.')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') cancelEdit()
  }

  if (isLoading) {
    return <p className="text-center text-gray-400 py-6">Chargement...</p>
  }

  return (
    <div className="space-y-3">
      {/* Liste des catégories */}
      {categories.length === 0 && editingId !== 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">Aucune catégorie. Ajoutez-en une !</p>
      ) : (
        <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
          {categories.map(cat => (
            <li key={cat.id} className="flex items-center gap-3 px-4 py-2.5 bg-white">
              {editingId === cat.id ? (
                /* Ligne en mode édition */
                <>
                  <input
                    autoFocus
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 px-2 py-1 border border-blue-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !inputValue.trim()}
                    className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-3 py-1 rounded-md font-medium transition-colors"
                  >
                    Sauver
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-md transition-colors"
                  >
                    Annuler
                  </button>
                </>
              ) : (
                /* Ligne normale */
                <>
                  <span className="flex-1 text-sm text-gray-700">{cat.name}</span>
                  <button
                    onClick={() => openEdit(cat)}
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded transition-colors"
                    title="Modifier"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Formulaire d'ajout */}
      {editingId === 0 ? (
        <div className="flex items-center gap-2 p-3 border border-blue-200 bg-blue-50 rounded-lg">
          <input
            autoFocus
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nom de la catégorie"
            className="flex-1 px-3 py-1.5 border border-blue-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSave}
            disabled={isSaving || !inputValue.trim()}
            className="text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-1.5 rounded-md font-medium transition-colors"
          >
            Ajouter
          </button>
          <button
            onClick={cancelEdit}
            className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-md transition-colors"
          >
            Annuler
          </button>
        </div>
      ) : (
        <button
          onClick={openAdd}
          className="w-full text-sm text-blue-600 hover:text-blue-800 border border-dashed border-blue-300 hover:border-blue-500 rounded-lg py-2.5 transition-colors"
        >
          + Ajouter une catégorie
        </button>
      )}
    </div>
  )
}
