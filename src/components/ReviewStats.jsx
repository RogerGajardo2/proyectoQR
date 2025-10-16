// src/components/ReviewStats.jsx
// Componente opcional para mostrar estadísticas detalladas en el panel de admin

import { useMemo } from 'react'

export default function ReviewStats({ reviews }) {
  const stats = useMemo(() => {
    if (reviews.length === 0) {
      return {
        total: 0,
        average: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        byMonth: {},
        topProjects: [],
        recentTrend: 'N/A'
      }
    }

    // Calcular promedio
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
    const average = sum / reviews.length

    // Distribución de ratings
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(review => {
      distribution[review.rating]++
    })

    // Reseñas por mes
    const byMonth = {}
    reviews.forEach(review => {
      const month = new Date(review.date).toLocaleDateString('es-CL', { 
        year: 'numeric', 
        month: 'long' 
      })
      byMonth[month] = (byMonth[month] || 0) + 1
    })

    // Top proyectos mencionados
    const projectCounts = {}
    reviews.forEach(review => {
      if (review.project) {
        projectCounts[review.project] = (projectCounts[review.project] || 0) + 1
      }
    })

    const topProjects = Object.entries(projectCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([project, count]) => ({ project, count }))

    // Tendencia reciente (últimos 30 días vs anteriores)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const recent = reviews.filter(r => new Date(r.date) >= thirtyDaysAgo)
    const older = reviews.filter(r => new Date(r.date) < thirtyDaysAgo)
    
    let recentTrend = 'N/A'
    if (recent.length > 0 && older.length > 0) {
      const recentAvg = recent.reduce((acc, r) => acc + r.rating, 0) / recent.length
      const olderAvg = older.reduce((acc, r) => acc + r.rating, 0) / older.length
      const diff = recentAvg - olderAvg
      
      if (diff > 0.2) recentTrend = 'Mejorando'
      else if (diff < -0.2) recentTrend = 'Empeorando'
      else recentTrend = 'Estable'
    }

    return {
      total: reviews.length,
      average: parseFloat(average.toFixed(2)),
      distribution,
      byMonth,
      topProjects,
      recentTrend
    }
  }, [reviews])

  const DistributionBar = ({ stars, count, total }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0

    return (
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700 w-16">{stars} ★</span>
        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-gray-700 w-12 text-right">
          {count} ({percentage.toFixed(0)}%)
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumen general */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Resumen General</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-gray-600 mt-1">Total reseñas</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">
              {stats.average.toFixed(1)} ★
            </p>
            <p className="text-sm text-gray-600 mt-1">Promedio</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {stats.distribution[5]}
            </p>
            <p className="text-sm text-gray-600 mt-1">5 estrellas</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{stats.recentTrend}</p>
            <p className="text-sm text-gray-600 mt-1">Tendencia</p>
          </div>
        </div>
      </div>

      {/* Distribución de ratings */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">⭐ Distribución de Calificaciones</h3>
        <div className="space-y-3">
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

      {/* Reseñas por mes */}
      {Object.keys(stats.byMonth).length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📅 Reseñas por Mes</h3>
          <div className="space-y-2">
            {Object.entries(stats.byMonth)
              .sort((a, b) => new Date(b[0]) - new Date(a[0]))
              .slice(0, 6)
              .map(([month, count]) => (
                <div key={month} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700 capitalize">{month}</span>
                  <span className="font-semibold text-blue-600">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Top proyectos */}
      {stats.topProjects.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">🏗️ Top Proyectos Mencionados</h3>
          <div className="space-y-2">
            {stats.topProjects.map((item, index) => (
              <div key={item.project} className="flex items-center gap-3 py-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                  {index + 1}
                </span>
                <span className="flex-1 text-sm text-gray-700">{item.project}</span>
                <span className="font-semibold text-gray-900">{item.count} reseñas</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Métricas de calidad */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">✨ Métricas de Calidad</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Satisfacción</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${(stats.average / 5) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold text-green-600">
                {((stats.average / 5) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Excelencia</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500"
                  style={{ 
                    width: stats.total > 0 
                      ? `${((stats.distribution[5] + stats.distribution[4]) / stats.total) * 100}%` 
                      : '0%' 
                  }}
                />
              </div>
              <span className="text-sm font-bold text-yellow-600">
                {stats.total > 0 
                  ? (((stats.distribution[5] + stats.distribution[4]) / stats.total) * 100).toFixed(0)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          * Satisfacción: Promedio general | Excelencia: Reseñas de 4-5 estrellas
        </p>
      </div>
    </div>
  )
}