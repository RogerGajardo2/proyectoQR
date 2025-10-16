// src/utils/migrateReviews.js
// Funciones de utilidad para gestión de datos de reseñas

/**
 * Exportar todas las reseñas a JSON
 */
export const exportReviewsToJSON = () => {
  const reviews = JSON.parse(localStorage.getItem('proconing_reviews') || '[]')
  const usedCodes = JSON.parse(localStorage.getItem('proconing_used_codes') || '[]')
  const codes = JSON.parse(localStorage.getItem('proconing_codes') || '[]')
  
  const data = {
    exportDate: new Date().toISOString(),
    stats: {
      totalReviews: reviews.length,
      totalCodes: codes.length,
      usedCodes: usedCodes.length,
      availableCodes: codes.length - usedCodes.length
    },
    reviews,
    codes,
    usedCodes
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `proconing-reviews-export-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  return data
}

/**
 * Importar reseñas desde JSON
 */
export const importReviewsFromJSON = (jsonData) => {
  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData
    
    if (data.reviews) {
      localStorage.setItem('proconing_reviews', JSON.stringify(data.reviews))
    }
    
    if (data.codes) {
      localStorage.setItem('proconing_codes', JSON.stringify(data.codes))
    }
    
    if (data.usedCodes) {
      localStorage.setItem('proconing_used_codes', JSON.stringify(data.usedCodes))
    }
    
    return {
      success: true,
      message: 'Datos importados correctamente',
      stats: data.stats
    }
  } catch (error) {
    return {
      success: false,
      message: 'Error al importar datos',
      error: error.message
    }
  }
}

/**
 * Limpiar todos los datos de reseñas
 */
export const clearAllReviewsData = () => {
  const confirmation = window.confirm(
    '¿Estás seguro de eliminar TODOS los datos de reseñas? Esta acción no se puede deshacer.'
  )
  
  if (!confirmation) return false
  
  localStorage.removeItem('proconing_reviews')
  localStorage.removeItem('proconing_codes')
  localStorage.removeItem('proconing_used_codes')
  
  return true
}

/**
 * Obtener estadísticas de reseñas
 */
export const getReviewsStats = () => {
  const reviews = JSON.parse(localStorage.getItem('proconing_reviews') || '[]')
  
  if (reviews.length === 0) {
    return {
      total: 0,
      average: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      byMonth: {},
      topProjects: []
    }
  }
  
  // Calcular promedio
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
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
  
  return {
    total: reviews.length,
    average: parseFloat(average.toFixed(2)),
    distribution,
    byMonth,
    topProjects
  }
}

/**
 * Validar integridad de datos
 */
export const validateDataIntegrity = () => {
  const issues = []
  
  try {
    const reviews = JSON.parse(localStorage.getItem('proconing_reviews') || '[]')
    const codes = JSON.parse(localStorage.getItem('proconing_codes') || '[]')
    const usedCodes = JSON.parse(localStorage.getItem('proconing_used_codes') || '[]')
    
    // Verificar reseñas duplicadas
    const reviewCodes = reviews.map(r => r.code)
    const uniqueCodes = new Set(reviewCodes)
    if (reviewCodes.length !== uniqueCodes.size) {
      issues.push('Se detectaron reseñas con códigos duplicados')
    }
    
    // Verificar códigos usados sin reseña
    usedCodes.forEach(code => {
      if (!reviews.some(r => r.code === code)) {
        issues.push(`Código usado sin reseña asociada: ${code}`)
      }
    })
    
    // Verificar reseñas sin código usado marcado
    reviews.forEach(review => {
      if (!usedCodes.includes(review.code)) {
        issues.push(`Reseña sin código marcado como usado: ${review.code}`)
      }
    })
    
    // Verificar estructura de datos
    reviews.forEach((review, index) => {
      if (!review.name || !review.rating || !review.comment || !review.date) {
        issues.push(`Reseña ${index + 1} tiene campos faltantes`)
      }
      
      if (review.rating < 1 || review.rating > 5) {
        issues.push(`Reseña ${index + 1} tiene rating inválido: ${review.rating}`)
      }
    })
    
    return {
      valid: issues.length === 0,
      issues,
      stats: {
        totalReviews: reviews.length,
        totalCodes: codes.length,
        usedCodes: usedCodes.length
      }
    }
  } catch (error) {
    return {
      valid: false,
      issues: ['Error al validar datos: ' + error.message],
      stats: null
    }
  }
}

/**
 * Reparar inconsistencias automáticamente
 */
export const autoRepairData = () => {
  try {
    const reviews = JSON.parse(localStorage.getItem('proconing_reviews') || '[]')
    let usedCodes = JSON.parse(localStorage.getItem('proconing_used_codes') || '[]')
    
    // Sincronizar códigos usados con reseñas existentes
    const reviewCodes = reviews.map(r => r.code)
    usedCodes = [...new Set(reviewCodes)] // Eliminar duplicados
    
    localStorage.setItem('proconing_used_codes', JSON.stringify(usedCodes))
    
    // Limpiar reseñas con datos inválidos
    const validReviews = reviews.filter(review => 
      review.name && 
      review.rating && 
      review.comment && 
      review.date &&
      review.rating >= 1 && 
      review.rating <= 5
    )
    
    if (validReviews.length !== reviews.length) {
      localStorage.setItem('proconing_reviews', JSON.stringify(validReviews))
    }
    
    return {
      success: true,
      message: 'Datos reparados correctamente',
      removedReviews: reviews.length - validReviews.length,
      syncedCodes: usedCodes.length
    }
  } catch (error) {
    return {
      success: false,
      message: 'Error al reparar datos',
      error: error.message
    }
  }
}

/**
 * Generar reporte en CSV
 */
export const exportToCSV = () => {
  const reviews = JSON.parse(localStorage.getItem('proconing_reviews') || '[]')
  
  if (reviews.length === 0) {
    alert('No hay reseñas para exportar')
    return
  }
  
  // Headers CSV
  const headers = ['Fecha', 'Nombre', 'Rating', 'Comentario', 'Proyecto', 'Código']
  
  // Convertir reseñas a filas CSV
  const rows = reviews.map(review => {
    const date = new Date(review.date).toLocaleDateString('es-CL')
    const name = `"${review.name.replace(/"/g, '""')}"`
    const comment = `"${review.comment.replace(/"/g, '""')}"`
    const project = review.project ? `"${review.project.replace(/"/g, '""')}"` : ''
    
    return [date, name, review.rating, comment, project, review.code].join(',')
  })
  
  // Combinar headers y rows
  const csv = [headers.join(','), ...rows].join('\n')
  
  // Descargar archivo
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `proconing-reviews-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Backup automático
 */
export const createBackup = () => {
  const timestamp = new Date().toISOString()
  const data = {
    reviews: JSON.parse(localStorage.getItem('proconing_reviews') || '[]'),
    codes: JSON.parse(localStorage.getItem('proconing_codes') || '[]'),
    usedCodes: JSON.parse(localStorage.getItem('proconing_used_codes') || '[]')
  }
  
  const backup = {
    timestamp,
    data,
    version: '1.0'
  }
  
  // Guardar backup en localStorage
  const backups = JSON.parse(localStorage.getItem('proconing_backups') || '[]')
  backups.push(backup)
  
  // Mantener solo los últimos 5 backups
  if (backups.length > 5) {
    backups.shift()
  }
  
  localStorage.setItem('proconing_backups', JSON.stringify(backups))
  
  return backup
}

/**
 * Restaurar desde backup
 */
export const restoreFromBackup = (backupIndex = 0) => {
  const backups = JSON.parse(localStorage.getItem('proconing_backups') || '[]')
  
  if (backups.length === 0) {
    return {
      success: false,
      message: 'No hay backups disponibles'
    }
  }
  
  const backup = backups[backupIndex]
  
  if (!backup) {
    return {
      success: false,
      message: 'Backup no encontrado'
    }
  }
  
  try {
    localStorage.setItem('proconing_reviews', JSON.stringify(backup.data.reviews))
    localStorage.setItem('proconing_codes', JSON.stringify(backup.data.codes))
    localStorage.setItem('proconing_used_codes', JSON.stringify(backup.data.usedCodes))
    
    return {
      success: true,
      message: 'Backup restaurado correctamente',
      timestamp: backup.timestamp
    }
  } catch (error) {
    return {
      success: false,
      message: 'Error al restaurar backup',
      error: error.message
    }
  }
}

/**
 * Listar backups disponibles
 */
export const listBackups = () => {
  const backups = JSON.parse(localStorage.getItem('proconing_backups') || '[]')
  
  return backups.map((backup, index) => ({
    index,
    timestamp: backup.timestamp,
    date: new Date(backup.timestamp).toLocaleString('es-CL'),
    reviewsCount: backup.data.reviews.length,
    codesCount: backup.data.codes.length
  }))
}

/**
 * Generar códigos en lote
 */
export const generateBulkCodes = (count = 10, prefix = 'PROC') => {
  const codes = []
  const existingCodes = JSON.parse(localStorage.getItem('proconing_codes') || '[]')
  const existingCodeStrings = existingCodes.map(c => c.code)
  
  for (let i = 0; i < count; i++) {
    let newCode
    let attempts = 0
    
    // Generar código único
    do {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let randomPart = ''
      for (let j = 0; j < 6; j++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      newCode = `${prefix}${randomPart}`
      attempts++
    } while (existingCodeStrings.includes(newCode) && attempts < 100)
    
    if (attempts >= 100) {
      console.warn('No se pudo generar código único después de 100 intentos')
      break
    }
    
    codes.push({
      code: newCode,
      clientName: '',
      createdAt: new Date().toISOString(),
      used: false
    })
  }
  
  // Guardar códigos
  const updatedCodes = [...existingCodes, ...codes]
  localStorage.setItem('proconing_codes', JSON.stringify(updatedCodes))
  
  return {
    success: true,
    generated: codes.length,
    codes: codes.map(c => c.code)
  }
}

/**
 * Obtener reseñas filtradas
 */
export const getFilteredReviews = (filters = {}) => {
  const reviews = JSON.parse(localStorage.getItem('proconing_reviews') || '[]')
  
  let filtered = [...reviews]
  
  // Filtrar por rating
  if (filters.rating) {
    filtered = filtered.filter(r => r.rating === filters.rating)
  }
  
  // Filtrar por fecha
  if (filters.startDate) {
    filtered = filtered.filter(r => new Date(r.date) >= new Date(filters.startDate))
  }
  
  if (filters.endDate) {
    filtered = filtered.filter(r => new Date(r.date) <= new Date(filters.endDate))
  }
  
  // Filtrar por proyecto
  if (filters.project) {
    filtered = filtered.filter(r => 
      r.project && r.project.toLowerCase().includes(filters.project.toLowerCase())
    )
  }
  
  // Filtrar por búsqueda en comentario
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(r => 
      r.comment.toLowerCase().includes(searchLower) ||
      r.name.toLowerCase().includes(searchLower)
    )
  }
  
  // Ordenar
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
      default:
        break
    }
  }
  
  return filtered
}

/**
 * Calcular tendencias
 */
export const calculateTrends = () => {
  const reviews = JSON.parse(localStorage.getItem('proconing_reviews') || '[]')
  
  if (reviews.length < 2) {
    return {
      insufficient: true,
      message: 'Se necesitan al menos 2 reseñas para calcular tendencias'
    }
  }
  
  // Ordenar por fecha
  const sorted = reviews.sort((a, b) => new Date(a.date) - new Date(b.date))
  
  // Dividir en mitades
  const mid = Math.floor(sorted.length / 2)
  const firstHalf = sorted.slice(0, mid)
  const secondHalf = sorted.slice(mid)
  
  // Calcular promedios
  const avgFirst = firstHalf.reduce((acc, r) => acc + r.rating, 0) / firstHalf.length
  const avgSecond = secondHalf.reduce((acc, r) => acc + r.rating, 0) / secondHalf.length
  
  const trend = avgSecond - avgFirst
  
  return {
    firstPeriodAvg: parseFloat(avgFirst.toFixed(2)),
    secondPeriodAvg: parseFloat(avgSecond.toFixed(2)),
    trend: parseFloat(trend.toFixed(2)),
    direction: trend > 0 ? 'mejorando' : trend < 0 ? 'empeorando' : 'estable',
    percentage: parseFloat(((trend / avgFirst) * 100).toFixed(2))
  }
}

/**
 * Utilidad para consola del navegador
 */
if (typeof window !== 'undefined') {
  window.ProconReviews = {
    export: exportReviewsToJSON,
    import: importReviewsFromJSON,
    clear: clearAllReviewsData,
    stats: getReviewsStats,
    validate: validateDataIntegrity,
    repair: autoRepairData,
    exportCSV: exportToCSV,
    backup: createBackup,
    restore: restoreFromBackup,
    listBackups: listBackups,
    generateCodes: generateBulkCodes,
    filter: getFilteredReviews,
    trends: calculateTrends
  }
  
  console.log('💬 ProconReviews Utils cargadas. Usa window.ProconReviews para acceder a las utilidades.')
}

export default {
  exportReviewsToJSON,
  importReviewsFromJSON,
  clearAllReviewsData,
  getReviewsStats,
  validateDataIntegrity,
  autoRepairData,
  exportToCSV,
  createBackup,
  restoreFromBackup,
  listBackups,
  generateBulkCodes,
  getFilteredReviews,
  calculateTrends
}