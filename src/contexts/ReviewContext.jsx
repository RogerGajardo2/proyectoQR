// src/contexts/ReviewContext.jsx - Context para Reseñas
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as reviewService from '../services/reviewService'
import { logger } from '../utils/logger'

const ReviewContext = createContext()

export function ReviewProvider({ children }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  })

  // Cargar reseñas al montar
  useEffect(() => {
    loadReviews()
  }, [])

  // Cargar reseñas desde Firestore
  const loadReviews = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const reviewsData = await reviewService.getReviews()
      setReviews(reviewsData)
      
      // Calcular estadísticas
      const statsData = await reviewService.getReviewStats()
      setStats(statsData)
      
      logger.info('Reseñas cargadas en contexto', { count: reviewsData.length })
    } catch (err) {
      logger.error('Error cargando reseñas en contexto', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Agregar reseña
  const addReview = useCallback(async (reviewData) => {
    try {
      const newReview = await reviewService.addReview(reviewData)
      setReviews(prev => [newReview, ...prev])
      
      // Recalcular estadísticas
      const statsData = await reviewService.getReviewStats()
      setStats(statsData)
      
      logger.info('Reseña agregada en contexto', { id: newReview.id })
      return newReview
    } catch (err) {
      logger.error('Error agregando reseña en contexto', err)
      throw err
    }
  }, [])

  // Actualizar reseña
  const updateReview = useCallback(async (reviewId, updates) => {
    try {
      const updatedReview = await reviewService.updateReview(reviewId, updates)
      
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId ? { ...review, ...updatedReview } : review
        )
      )
      
      logger.info('Reseña actualizada en contexto', { id: reviewId })
      return updatedReview
    } catch (err) {
      logger.error('Error actualizando reseña en contexto', err)
      throw err
    }
  }, [])

  // Eliminar reseña
  const deleteReview = useCallback(async (reviewId, code) => {
    try {
      await reviewService.deleteReview(reviewId, code)
      
      setReviews(prev => prev.filter(review => review.id !== reviewId))
      
      // Recalcular estadísticas
      const statsData = await reviewService.getReviewStats()
      setStats(statsData)
      
      logger.info('Reseña eliminada en contexto', { id: reviewId })
    } catch (err) {
      logger.error('Error eliminando reseña en contexto', err)
      throw err
    }
  }, [])

  // Obtener reseñas filtradas
  const getFilteredReviews = useCallback((filters) => {
    let filtered = [...reviews]
    
    if (filters.rating) {
      filtered = filtered.filter(r => r.rating === filters.rating)
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchLower) ||
        r.comment.toLowerCase().includes(searchLower) ||
        (r.project && r.project.toLowerCase().includes(searchLower))
      )
    }
    
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'date-desc':
          filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
          break
        case 'date-asc':
          filtered.sort((a, b) => new Date(a.date) - new Date(b.date))
          break
        case 'rating-desc':
          filtered.sort((a, b) => b.rating - a.rating)
          break
        case 'rating-asc':
          filtered.sort((a, b) => a.rating - b.rating)
          break
      }
    }
    
    return filtered
  }, [reviews])

  const value = {
    reviews,
    loading,
    error,
    stats,
    loadReviews,
    addReview,
    updateReview,
    deleteReview,
    getFilteredReviews
  }

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  )
}

// Hook personalizado para usar el contexto
export function useReviews() {
  const context = useContext(ReviewContext)
  
  if (!context) {
    throw new Error('useReviews debe usarse dentro de ReviewProvider')
  }
  
  return context
}

export default ReviewContext