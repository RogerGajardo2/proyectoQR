// src/components/Reviews.jsx
import { useState, useEffect } from 'react'
import Button from './ui/Button'
import ReviewModal from './ReviewModal'

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  })

  // Cargar reseñas desde localStorage al montar
  useEffect(() => {
    const savedReviews = localStorage.getItem('proconing_reviews')
    if (savedReviews) {
      const parsedReviews = JSON.parse(savedReviews)
      setReviews(parsedReviews)
      calculateStats(parsedReviews)
    }
  }, [])

  // Calcular estadísticas
  const calculateStats = (reviewsList) => {
    if (reviewsList.length === 0) {
      setStats({ average: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } })
      return
    }

    const total = reviewsList.length
    const sum = reviewsList.reduce((acc, review) => acc + review.rating, 0)
    const average = sum / total

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviewsList.forEach(review => {
      distribution[review.rating]++
    })

    setStats({ average, total, distribution })
  }

  // Manejar nueva reseña
  const handleNewReview = (newReview) => {
    const updatedReviews = [...reviews, newReview]
    setReviews(updatedReviews)
    localStorage.setItem('proconing_reviews', JSON.stringify(updatedReviews))
    calculateStats(updatedReviews)
    setShowModal(false)
  }

  // Renderizar estrellas
  const StarRating = ({ rating, size = 'md' }) => {
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
  }

  // Barra de distribución
  const DistributionBar = ({ stars, count, total }) => {
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

        {/* Lista de reseñas */}
        {reviews.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <div
                key={index}
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
            ))}
          </div>
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