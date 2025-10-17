// src/components/Reviews.jsx - ACTUALIZADO CON CARGA MANUAL
import { useState, useMemo, useCallback, memo, useEffect } from 'react'
import { useReviews } from '../contexts/ReviewContext'
import Button from './ui/Button'
import ReviewModal from './ReviewModal'
import { logger } from '../utils/logger'

// Componente memoizado para rating de estrellas
const StarRating = memo(({ rating, size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizes[size]} ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
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

// Componente para barra de distribución
const DistributionBar = memo(({ stars, count, total }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 w-12">{stars} ★</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
    </div>
  )
})

DistributionBar.displayName = 'DistributionBar'

// Componente para card de reseña
const ReviewCard = memo(({ review }) => (
  <div
    className="bg-white border border-line rounded-2xl p-6 shadow-soft hover:shadow-lg transition-shadow"
    data-reveal
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <h4 className="font-bold text-title">{review.name}</h4>
        <p className="text-sm text-gray-500">
          {new Date(review.date).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
      <StarRating rating={review.rating} size="sm" />
    </div>

    <p className="text-text leading-relaxed">
      {review.comment}
    </p>

    {review.project && (
      <div className="mt-3 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          Proyecto: <span className="font-semibold">{review.project}</span>
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

  const [showModal, setShowModal] = useState(false)
  const [visibleCount, setVisibleCount] = useState(9)

  // Cargar reseñas al montar (acceso público permitido)
  useEffect(() => {
    if (!initialized) {
      logger.info('Cargando reseñas públicas...')
      loadReviews().catch(err => {
        logger.error('Error cargando reseñas en componente público', err)
      })
    }
  }, [initialized, loadReviews])

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
      logger.info('Nueva reseña agregada desde UI')
    } catch (error) {
      logger.error('Error agregando reseña desde UI', error)
      alert('Error al agregar reseña: ' + error.message)
    }
  }, [addReview])

  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + 9, reviews.length))
  }, [reviews.length])

  if (loading && !initialized) {
    return (
      <section id="resenas" className="py-16 scroll-mt-24 bg-white">
        <div className="container">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Cargando reseñas...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="resenas" className="py-16 scroll-mt-24 bg-white">
        <div className="container">
          <div className="text-center py-12">
            <p className="text-red-600">Error al cargar reseñas: {error}</p>
            <Button onClick={() => loadReviews()} className="mt-4">
              Reintentar
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="resenas" className="py-16 scroll-mt-24 bg-white">
      <div className="container">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 pb-4 mb-6 border-b border-line" data-reveal>
          <div>
            <div className="text-subtitle font-bold uppercase tracking-[.14em] text-sm">
              Reseñas
            </div>
            <h2 className="text-title text-3xl font-bold">Lo que dicen nuestros clientes</h2>
          </div>
          <Button onClick={() => setShowModal(true)} size="sm">
            Dejar reseña
          </Button>
        </div>

        {/* Estadísticas generales */}
        {stats.total > 0 ? (
          <div className="grid md:grid-cols-2 gap-8 mb-12" data-reveal>
            {/* Resumen de rating */}
            <div className="bg-alt rounded-2xl p-8 text-center">
              <div className="text-6xl font-bold text-title mb-2">
                {stats.average.toFixed(1)}
              </div>
              <StarRating rating={Math.round(stats.average)} size="lg" />
              <p className="text-text mt-3">
                Basado en {stats.total} {stats.total === 1 ? 'reseña' : 'reseñas'}
              </p>
            </div>

            {/* Distribución */}
            <div className="space-y-2">
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
          <div className="text-center py-12 bg-alt rounded-2xl mb-12" data-reveal>
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Aún no hay reseñas
            </h3>
            <p className="text-gray-500 mb-4">
              Sé el primero en compartir tu experiencia
            </p>
            <Button onClick={() => setShowModal(true)}>
              Dejar la primera reseña
            </Button>
          </div>
        )}

        {/* Lista de reseñas con paginación */}
        {visibleReviews.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {visibleReviews.map((review, index) => (
                <ReviewCard
                  key={review.id || `review-${index}`}
                  review={review}
                />
              ))}
            </div>

            {/* Botón cargar más */}
            {hasMore && (
              <div className="text-center" data-reveal>
                <Button onClick={handleLoadMore} variant="outline">
                  Cargar más reseñas ({reviews.length - visibleCount} restantes)
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de nueva reseña */}
      {showModal && (
        <ReviewModal
          onClose={() => setShowModal(false)}
          onSubmit={handleNewReview}
        />
      )}
    </section>
  )
}