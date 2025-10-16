// src/components/admin/AdminCodes/ReviewsTab.jsx - Usando Context
import { useState, useMemo } from 'react'
import { useReviews } from '../../../contexts/ReviewContext'
import Button from '../../ui/Button'
import { StatsCard } from './AdminComponents'
import { SecurityManager } from '../../../utils/security'
import { logger } from '../../../utils/logger'

export default function ReviewsTab({ showImportMessage }) {
  const {
    reviews,
    loading,
    stats,
    updateReview,
    deleteReview
  } = useReviews()

  const [editingReview, setEditingReview] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRating, setFilterRating] = useState('all')

  // Filtrar reseñas
  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      const matchesSearch = 
        review.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (review.project && review.project.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating)
      
      return matchesSearch && matchesRating
    })
  }, [reviews, searchTerm, filterRating])

  // Calcular reseñas recientes (últimos 30 días)
  const recentReviews = useMemo(() => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    return reviews.filter(r => new Date(r.date).getTime() > thirtyDaysAgo).length
  }, [reviews])

  const handleEditReview = (review) => {
    setEditingReview({ ...review })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editingReview.name.trim() || !editingReview.comment.trim()) {
      alert('El nombre y comentario son obligatorios')
      return
    }

    if (editingReview.rating < 1 || editingReview.rating > 5) {
      alert('El rating debe estar entre 1 y 5')
      return
    }

    try {
      await updateReview(editingReview.id, {
        name: editingReview.name,
        rating: editingReview.rating,
        comment: editingReview.comment,
        project: editingReview.project
      })

      setShowEditModal(false)
      setEditingReview(null)
      showImportMessage('success', 'Reseña actualizada correctamente')
    } catch (error) {
      logger.error('Error actualizando reseña', error)
      showImportMessage('error', 'Error al actualizar reseña')
    }
  }

  const handleDeleteReview = async (reviewId, reviewCode, reviewName) => {
    if (!window.confirm(`¿Eliminar la reseña de ${reviewName}?`)) return
    
    try {
      await deleteReview(reviewId, reviewCode)
      showImportMessage('success', 'Reseña eliminada. El código ha sido liberado.')
    } catch (error) {
      logger.error('Error eliminando reseña', error)
      showImportMessage('error', 'Error al eliminar reseña')
    }
  }

  const handleExport = () => {
    const data = {
      reviews: reviews.map(r => ({
        name: r.name,
        rating: r.rating,
        comment: r.comment,
        project: r.project || '',
        date: r.date,
        code: r.code
      })),
      exportDate: new Date().toISOString(),
      totalReviews: reviews.length,
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `proconing-reviews-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    logger.info('Reseñas exportadas', { count: reviews.length })
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Cargando reseñas...</p>
      </div>
    )
  }

  return (
    <>
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatsCard label="Total reseñas" value={stats.total} />
        <StatsCard 
          label="Promedio" 
          value={`${stats.average.toFixed(1)} ★`} 
          variant="success" 
        />
        <StatsCard 
          label="5 estrellas" 
          value={stats.distribution[5]} 
          variant="success" 
        />
        <StatsCard 
          label="Últimos 30 días" 
          value={recentReviews} 
          variant="default" 
        />
      </div>

      {/* Acciones */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <Button onClick={handleExport} variant="outline">
            Exportar reseñas
          </Button>
        </div>

        {/* Filtros */}
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, comentario o proyecto..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por rating</label>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="5">5 estrellas</option>
              <option value="4">4 estrellas</option>
              <option value="3">3 estrellas</option>
              <option value="2">2 estrellas</option>
              <option value="1">1 estrella</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de reseñas */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Reseñas ({filteredReviews.length})
        </h2>
        {filteredReviews.length > 0 ? (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{review.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString('es-CL')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id, review.code, review.name)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-700 mt-2 leading-relaxed">{review.comment}</p>
                
                <div className="flex gap-4 mt-3 text-sm text-gray-500">
                  {review.project && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {review.project}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    {review.code}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay reseñas que coincidan con los filtros</p>
        )}
      </div>

      {/* Modal de edición */}
      {showEditModal && editingReview && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Editar Reseña</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={editingReview.name}
                  onChange={(e) => setEditingReview({ ...editingReview, name: e.target.value })}
                  maxLength={100}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <select
                  value={editingReview.rating}
                  onChange={(e) => setEditingReview({ ...editingReview, rating: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5 estrellas</option>
                  <option value={4}>4 estrellas</option>
                  <option value={3}>3 estrellas</option>
                  <option value={2}>2 estrellas</option>
                  <option value={1}>1 estrella</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comentario</label>
                <textarea
                  value={editingReview.comment}
                  onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                  maxLength={1000}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Proyecto (opcional)</label>
                <input
                  type="text"
                  value={editingReview.project || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, project: e.target.value })}
                  maxLength={200}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowEditModal(false)}
                variant="outline"
                className="flex-1 justify-center"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="flex-1 justify-center"
              >
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}