// src/components/admin/AdminCodes/ReviewsTab.jsx - VERSIÓN COMPLETAMENTE RESPONSIVA
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
        <p className="mt-4 text-gray-600 text-sm sm:text-base">Cargando reseñas...</p>
      </div>
    )
  }

  return (
    <>
      {/* Estadísticas - Responsivas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
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

      {/* Acciones - Responsivas */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Acciones</h2>
        <div className="mb-4 sm:mb-0">
          <Button 
            onClick={handleExport} 
            variant="outline"
            className="w-full sm:w-auto text-sm sm:text-base"
          >
            💾 Exportar reseñas
          </Button>
        </div>

        {/* Filtros - Responsivos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, comentario..."
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Filtrar por rating</label>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Lista de reseñas - Responsiva con Cards en móvil */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
          Reseñas ({filteredReviews.length})
        </h2>
        
        {filteredReviews.length > 0 ? (
          <>
            {/* Vista de cards para móvil */}
            <div className="block lg:hidden space-y-4">
              {filteredReviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  {/* Header del card */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm truncate">{review.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {/* Estrellas */}
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(star => (
                            <svg
                              key={star}
                              className={`w-3 h-3 sm:w-4 sm:h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.date).toLocaleDateString('es-CL')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Comentario */}
                  <p className="text-gray-700 text-sm leading-relaxed mb-3 break-words">{review.comment}</p>
                  
                  {/* Info adicional */}
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                    {review.project && (
                      <span className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {review.project}
                      </span>
                    )}
                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded font-mono">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      {review.code}
                    </span>
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="flex-1 text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium px-3 py-2 rounded-lg hover:bg-blue-50 border border-blue-200 transition-colors"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id, review.code, review.name)}
                      className="flex-1 text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 border border-red-200 transition-colors"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Vista de tabla para desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rating</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Comentario</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Proyecto</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Código</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-[150px] truncate">
                        {review.name}
                      </td>
                      <td className="px-4 py-3">
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
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-[300px]">
                        <div className="line-clamp-2">{review.comment}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-[150px] truncate">
                        {review.project || '-'}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-600">
                        {review.code}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(review.date).toLocaleDateString('es-CL')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditReview(review)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review.id, review.code, review.name)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center py-8 text-sm sm:text-base">
            No hay reseñas que coincidan con los filtros
          </p>
        )}
      </div>

      {/* Modal de edición - Completamente responsivo */}
      {showEditModal && editingReview && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl sm:rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Editar Reseña</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  aria-label="Cerrar"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={editingReview.name}
                  onChange={(e) => setEditingReview({ ...editingReview, name: e.target.value })}
                  maxLength={100}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Rating</label>
                <select
                  value={editingReview.rating}
                  onChange={(e) => setEditingReview({ ...editingReview, rating: parseInt(e.target.value) })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ 5 estrellas</option>
                  <option value={4}>⭐⭐⭐⭐ 4 estrellas</option>
                  <option value={3}>⭐⭐⭐ 3 estrellas</option>
                  <option value={2}>⭐⭐ 2 estrellas</option>
                  <option value={1}>⭐ 1 estrella</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Comentario</label>
                <textarea
                  value={editingReview.comment}
                  onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                  maxLength={1000}
                  rows={4}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editingReview.comment.length}/1000 caracteres
                </p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Proyecto (opcional)</label>
                <input
                  type="text"
                  value={editingReview.project || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, project: e.target.value })}
                  maxLength={200}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Footer del modal */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 rounded-b-xl sm:rounded-b-2xl">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={() => setShowEditModal(false)}
                  variant="outline"
                  className="w-full sm:flex-1 justify-center text-sm sm:text-base"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  className="w-full sm:flex-1 justify-center text-sm sm:text-base"
                >
                  Guardar cambios
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}