// src/components/Reviews.jsx - VERSIÓN OPTIMIZADA CON MEJOR RESPONSIVIDAD
import { useState, useMemo, useCallback, memo, useEffect } from 'react'
import { useReviews } from '../contexts/ReviewContext'
import Button from './ui/Button'
import ReviewModal from './ReviewModal'
import { logger } from '../utils/logger'

// StarRating - Optimizado con mejor responsividad
const StarRating = memo(({ rating, size = 'md' }) => {
  const sizes = {
    sm: 'w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4',
    md: 'w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5',
    lg: 'w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6',
    xl: 'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8'
  }

  return (
    <div className="flex gap-0.5 sm:gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizes[size]} ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} transition-colors`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
})

StarRating.displayName = 'StarRating'

// Barra de distribución - Optimizada
const DistributionBar = memo(({ stars, count, total }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <span className="text-xs sm:text-sm text-gray-600 w-7 sm:w-10 flex-shrink-0">{stars} ★</span>
      <div className="flex-1 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs sm:text-sm text-gray-600 w-6 sm:w-8 text-right flex-shrink-0">{count}</span>
    </div>
  )
})

DistributionBar.displayName = 'DistributionBar'

// Card de reseña - Optimizada con mejor responsive
const ReviewCard = memo(({ review }) => (
  <div
    className="bg-white border border-line rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-soft hover:shadow-lg transition-all duration-300"
    data-reveal
  >
    <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-title text-sm sm:text-base md:text-lg truncate">{review.name}</h4>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
          {new Date(review.date).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
      <div className="flex-shrink-0">
        <StarRating rating={review.rating} size="sm" />
      </div>
    </div>

    <p className="text-text leading-relaxed text-sm sm:text-base break-words hyphens-auto">
      {review.comment}
    </p>

    {review.project && (
      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
        <span className="text-xs sm:text-sm text-gray-500">
          Proyecto: <span className="font-semibold text-gray-700">{review.project}</span>
        </span>
      </div>
    )}
  </div>
))

ReviewCard.displayName = 'ReviewCard'

export default function Reviews() {
  const { 
    reviews, 
    loading, 
    error, 
    stats, 
    initialized,
    loadReviews,
    addReview 
  } = useReviews()

  // Cargar códigos disponibles
  const { loadCodes, initialized: codesInitialized } = useCodes()

  const [showModal, setShowModal] = useState(false)
  const [visibleCount, setVisibleCount] = useState(9)

  // Cargar reseñas al montar
  useEffect(() => {
    if (!initialized) {
      logger.info('Cargando reseñas públicas...')
      loadReviews().catch(err => {
        logger.error('Error cargando reseñas', err)
      })
    }
  }, [initialized, loadReviews])

  // Cargar códigos disponibles
  useEffect(() => {
    if (!codesInitialized) {
      logger.info('Cargando códigos disponibles...')
      loadCodes().catch(err => {
        logger.error('Error cargando códigos', err)
      })
    }
  }, [codesInitialized, loadCodes])

  
  // Reseñas visibles con paginación
  const visibleReviews = useMemo(() => {
    return reviews.slice(0, visibleCount)
  }, [reviews, visibleCount])

  const hasMore = reviews.length > visibleCount

  // Manejar nueva reseña
  const handleNewReview = useCallback(async (newReview) => {
    try {
      await addReview(newReview)
      setShowModal(false)
      logger.info('Nueva reseña agregada')
    } catch (error) {
      logger.error('Error agregando reseña', error)
      alert('Error al agregar reseña: ' + error.message)
    }
  }, [addReview])

  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + 9, reviews.length))
  }, [reviews.length])

  if (loading && !initialized) {
    return (
      <section id="resenas" className="py-8 sm:py-12 md:py-16 scroll-mt-24 bg-white">
        <div className="container">
          <div className="text-center py-8 sm:py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">Cargando reseñas...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="resenas" className="py-8 sm:py-12 md:py-16 scroll-mt-24 bg-white">
        <div className="container">
          <div className="text-center py-8 sm:py-12">
            <p className="text-red-600 text-sm sm:text-base mb-4">Error: {error}</p>
            <Button onClick={() => loadReviews()} size="sm">
              Reintentar
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="resenas" className="py-8 sm:py-12 md:py-16 scroll-mt-24 bg-white">
      <div className="container">
        {/* Header - Optimizado para responsive */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-line" data-reveal>
          <div className="flex-1">
            <div className="text-subtitle font-bold uppercase tracking-[.14em] text-xs sm:text-sm">
              Reseñas
            </div>
            <h2 className="text-title text-xl sm:text-2xl md:text-3xl font-bold mt-1">
              Lo que dicen nuestros clientes
            </h2>
          </div>
          <Button 
            onClick={() => setShowModal(true)} 
            size="sm"
            className="w-full sm:w-auto justify-center whitespace-nowrap text-sm sm:text-base"
          >
            Dejar reseña
          </Button>
        </div>

        {/* Estadísticas - Mejoradas para responsive */}
        {stats.total > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 md:mb-12" data-reveal>
            {/* Resumen */}
            <div className="bg-alt rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-title mb-2">
                {stats.average.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2 sm:mb-3">
                <StarRating rating={Math.round(stats.average)} size="lg" />
              </div>
              <p className="text-text text-xs sm:text-sm md:text-base">
                Basado en {stats.total} {stats.total === 1 ? 'reseña' : 'reseñas'}
              </p>
            </div>

            {/* Distribución */}
            <div className="space-y-1.5 sm:space-y-2 flex flex-col justify-center">
              {[5, 4, 3, 2, 1].map(stars => (
                <DistributionBar
                  key={stars}
                  stars={stars}
                  count={stats.distribution[stars]}
                  total={stats.total}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-alt rounded-xl sm:rounded-2xl mb-6 sm:mb-8 md:mb-12 px-4" data-reveal>
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-600 mb-2">
              Aún no hay reseñas
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4">
              Sé el primero en compartir tu experiencia
            </p>
            <Button 
              onClick={() => setShowModal(true)}
              size="sm"
              className="text-sm sm:text-base"
            >
              Dejar la primera reseña
            </Button>
          </div>
        )}

        {/* Grid de reseñas - Optimizado para responsive */}
        {visibleReviews.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
              {visibleReviews.map((review, index) => (
                <ReviewCard
                  key={review.id || `review-${index}`}
                  review={review}
                />
              ))}
            </div>

            {/* Botón cargar más - Optimizado */}
            {hasMore && (
              <div className="text-center" data-reveal>
                <Button 
                  onClick={handleLoadMore} 
                  variant="outline"
                  className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8"
                >
                  Cargar más ({reviews.length - visibleCount} restantes)
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ReviewModal
          onClose={() => setShowModal(false)}
          onSubmit={handleNewReview}
        />
      )}
    </section>
  )
}