// src/contexts/ReviewContext.jsx - SOLUCIÓN DEFINITIVA
import { createContext, useContext, useState, useCallback, useRef } from 'react'
import * as reviewService from '../services/reviewService'
import { getErrorMessage } from '../utils/errorHandler'
import { logger } from '../utils/logger'

const ReviewContext = createContext()

export function ReviewProvider({ children }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false) // Cambiado a false
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  })
  
  const hasLoadedRef = useRef(false)
  const isLoadingRef = useRef(false)

  // ⚠️ IMPORTANTE: NO usar useEffect para cargar automáticamente
  // Los datos se cargan SOLO cuando se llama a loadReviews() explícitamente

  const loadReviews = useCallback(async () => {
    if (isLoadingRef.current) {
      logger.info('Carga de reseñas ya en progreso, saltando...')
      return
    }

    try {
      isLoadingRef.current = true
      setLoading(true)
      setError(null)
      
      const [reviewsData, statsData] = await Promise.all([
        reviewService.getReviews(),
        reviewService.getReviewStats()
      ])
      
      setReviews(reviewsData)
      setStats(statsData)
      hasLoadedRef.current = true
      
      logger.info('Reseñas cargadas en contexto', { count: reviewsData.length })
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      logger.error('Error cargando reseñas en contexto', err)
      setError(errorMessage)
      hasLoadedRef.current = false
      throw err // Importante: propagar el error
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }, [])

  const addReview = useCallback(async (reviewData) => {
    try {
      const newReview = await reviewService.addReview(reviewData)
      setReviews(prev => [newReview, ...prev])
      
      const statsData = await reviewService.getReviewStats()
      setStats(statsData)
      
      logger.info('Reseña agregada en contexto', { id: newReview.id })
      return newReview
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      logger.error('Error agregando reseña en contexto', err)
      throw new Error(errorMessage)
    }
  }, [])

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
      const errorMessage = getErrorMessage(err)
      logger.error('Error actualizando reseña en contexto', err)
      throw new Error(errorMessage)
    }
  }, [])

  const deleteReview = useCallback(async (reviewId, code) => {
    try {
      await reviewService.deleteReview(reviewId, code)
      
      setReviews(prev => prev.filter(review => review.id !== reviewId))
      
      const statsData = await reviewService.getReviewStats()
      setStats(statsData)
      
      logger.info('Reseña eliminada en contexto', { id: reviewId })
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      logger.error('Error eliminando reseña en contexto', err)
      throw new Error(errorMessage)
    }
  }, [])

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

  const retry = useCallback(() => {
    hasLoadedRef.current = false
    loadReviews()
  }, [loadReviews])

  const value = {
    reviews,
    loading,
    error,
    stats,
    loadReviews,
    addReview,
    updateReview,
    deleteReview,
    getFilteredReviews,
    retry
  }

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  )
}

export function useReviews() {
  const context = useContext(ReviewContext)
  
  if (!context) {
    throw new Error('useReviews debe usarse dentro de ReviewProvider')
  }
  
  return context
}

export default ReviewContext