// src/utils/migrateToFirestore.js - Script de Migración de localStorage a Firestore
import { collection, addDoc, getDocs, query, where, writeBatch } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { logger } from './logger'

/**
 * Migrar códigos de localStorage a Firestore
 */
export async function migrateCodesToFirestore() {
  try {
    console.log('🔄 Iniciando migración de códigos...')
    
    // Obtener códigos de localStorage
    const codesData = localStorage.getItem('proconing_codes')
    const usedCodesData = localStorage.getItem('proconing_used_codes')
    
    if (!codesData) {
      console.log('✅ No hay códigos en localStorage para migrar')
      return { success: true, migrated: 0, message: 'No hay códigos para migrar' }
    }
    
    const codes = JSON.parse(codesData)
    const usedCodes = JSON.parse(usedCodesData || '[]')
    
    console.log(`📦 Encontrados ${codes.length} códigos en localStorage`)
    
    // Verificar códigos existentes en Firestore
    const codesRef = collection(db, 'codes')
    const existingSnapshot = await getDocs(codesRef)
    const existingCodes = existingSnapshot.docs.map(doc => doc.data().code)
    
    console.log(`📊 Códigos existentes en Firestore: ${existingCodes.length}`)
    
    // Usar batch para operaciones múltiples
    const batch = writeBatch(db)
    let migratedCount = 0
    
    for (const codeData of codes) {
      // Verificar si el código ya existe
      if (existingCodes.includes(codeData.code)) {
        console.log(`⏭️  Código ${codeData.code} ya existe, saltando...`)
        continue
      }
      
      // Preparar datos del código
      const firestoreCode = {
        code: codeData.code,
        clientName: codeData.clientName || 'Sin nombre',
        used: usedCodes.includes(codeData.code),
        createdAt: new Date(codeData.createdAt),
        usedAt: usedCodes.includes(codeData.code) ? new Date() : null
      }
      
      // Agregar al batch
      const newCodeRef = collection(db, 'codes')
      const docRef = await addDoc(newCodeRef, firestoreCode)
      migratedCount++
      
      console.log(`✅ Migrado: ${codeData.code}`)
    }
    
    console.log(`✨ Migración completada: ${migratedCount} códigos migrados`)
    
    return {
      success: true,
      migrated: migratedCount,
      total: codes.length,
      message: `${migratedCount} de ${codes.length} códigos migrados exitosamente`
    }
  } catch (error) {
    logger.error('Error en migración de códigos', error)
    console.error('❌ Error:', error)
    throw error
  }
}

/**
 * Migrar reseñas de localStorage a Firestore
 */
export async function migrateReviewsToFirestore() {
  try {
    console.log('🔄 Iniciando migración de reseñas...')
    
    // Obtener reseñas de localStorage
    const reviewsData = localStorage.getItem('proconing_reviews')
    
    if (!reviewsData) {
      console.log('✅ No hay reseñas en localStorage para migrar')
      return { success: true, migrated: 0, message: 'No hay reseñas para migrar' }
    }
    
    const reviews = JSON.parse(reviewsData)
    
    console.log(`📦 Encontradas ${reviews.length} reseñas en localStorage`)
    
    // Verificar reseñas existentes en Firestore
    const reviewsRef = collection(db, 'reviews')
    const existingSnapshot = await getDocs(reviewsRef)
    const existingCodes = existingSnapshot.docs.map(doc => doc.data().code)
    
    console.log(`📊 Reseñas existentes en Firestore: ${existingCodes.length}`)
    
    let migratedCount = 0
    
    for (const reviewData of reviews) {
      // Verificar si la reseña ya existe (por código)
      if (existingCodes.includes(reviewData.code)) {
        console.log(`⏭️  Reseña con código ${reviewData.code} ya existe, saltando...`)
        continue
      }
      
      // Preparar datos de la reseña
      const firestoreReview = {
        name: reviewData.name,
        rating: reviewData.rating,
        comment: reviewData.comment,
        project: reviewData.project || '',
        code: reviewData.code,
        createdAt: new Date(reviewData.date),
        updatedAt: new Date(reviewData.date)
      }
      
      // Agregar a Firestore
      await addDoc(reviewsRef, firestoreReview)
      migratedCount++
      
      console.log(`✅ Migrado: ${reviewData.name} (${reviewData.code})`)
    }
    
    console.log(`✨ Migración completada: ${migratedCount} reseñas migradas`)
    
    return {
      success: true,
      migrated: migratedCount,
      total: reviews.length,
      message: `${migratedCount} de ${reviews.length} reseñas migradas exitosamente`
    }
  } catch (error) {
    logger.error('Error en migración de reseñas', error)
    console.error('❌ Error:', error)
    throw error
  }
}

/**
 * Migrar todos los datos (códigos y reseñas)
 */
export async function migrateAllData() {
  try {
    console.log('🚀 Iniciando migración completa de datos...')
    console.log('=' .repeat(50))
    
    // Confirmar migración
    const confirmed = window.confirm(
      '¿Deseas migrar todos los datos de localStorage a Firestore?\n\n' +
      '⚠️ IMPORTANTE:\n' +
      '- Esta operación puede tardar varios minutos\n' +
      '- No cierres el navegador durante el proceso\n' +
      '- Los datos de localStorage se mantendrán intactos\n\n' +
      '¿Continuar?'
    )
    
    if (!confirmed) {
      console.log('❌ Migración cancelada por el usuario')
      return { success: false, message: 'Migración cancelada' }
    }
    
    // Migrar códigos
    const codesResult = await migrateCodesToFirestore()
    console.log('\n')
    
    // Migrar reseñas
    const reviewsResult = await migrateReviewsToFirestore()
    console.log('\n')
    
    console.log('=' .repeat(50))
    console.log('🎉 MIGRACIÓN COMPLETA')
    console.log('=' .repeat(50))
    console.log(`Códigos: ${codesResult.migrated}/${codesResult.total}`)
    console.log(`Reseñas: ${reviewsResult.migrated}/${reviewsResult.total}`)
    
    // Mostrar resumen
    alert(
      '✅ Migración completada exitosamente!\n\n' +
      `Códigos migrados: ${codesResult.migrated}/${codesResult.total}\n` +
      `Reseñas migradas: ${reviewsResult.migrated}/${reviewsResult.total}\n\n` +
      'Ahora puedes usar Firestore como base de datos.'
    )
    
    return {
      success: true,
      codes: codesResult,
      reviews: reviewsResult,
      message: 'Migración completada exitosamente'
    }
  } catch (error) {
    logger.error('Error en migración completa', error)
    console.error('❌ Error crítico en migración:', error)
    
    alert(
      '❌ Error durante la migración\n\n' +
      'Por favor, verifica:\n' +
      '1. Conexión a internet\n' +
      '2. Configuración de Firebase\n' +
      '3. Consola del navegador para más detalles'
    )
    
    throw error
  }
}

/**
 * Verificar si hay datos para migrar
 */
export function checkMigrationNeeded() {
  const hasLocalCodes = localStorage.getItem('proconing_codes')
  const hasLocalReviews = localStorage.getItem('proconing_reviews')
  
  return {
    needed: !!(hasLocalCodes || hasLocalReviews),
    hasCodes: !!hasLocalCodes,
    hasReviews: !!hasLocalReviews,
    codesCount: hasLocalCodes ? JSON.parse(hasLocalCodes).length : 0,
    reviewsCount: hasLocalReviews ? JSON.parse(hasLocalReviews).length : 0
  }
}

/**
 * Limpiar localStorage después de migración exitosa
 */
export function cleanupLocalStorage() {
  const confirmed = window.confirm(
    '⚠️ ¿Estás seguro de eliminar los datos de localStorage?\n\n' +
    'Esta acción NO se puede deshacer.\n' +
    'Asegúrate de que la migración a Firestore fue exitosa.\n\n' +
    '¿Continuar?'
  )
  
  if (!confirmed) {
    console.log('❌ Limpieza cancelada')
    return false
  }
  
  try {
    localStorage.removeItem('proconing_codes')
    localStorage.removeItem('proconing_reviews')
    localStorage.removeItem('proconing_used_codes')
    
    console.log('✅ LocalStorage limpiado correctamente')
    
    alert('✅ Datos de localStorage eliminados correctamente')
    
    return true
  } catch (error) {
    logger.error('Error limpiando localStorage', error)
    console.error('❌ Error:', error)
    return false
  }
}

// Exportar para uso en consola del navegador
if (typeof window !== 'undefined') {
  window.ProconMigration = {
    migrateCodes: migrateCodesToFirestore,
    migrateReviews: migrateReviewsToFirestore,
    migrateAll: migrateAllData,
    checkNeeded: checkMigrationNeeded,
    cleanup: cleanupLocalStorage
  }
  
  // Verificar si hay migración pendiente al cargar
  const migrationCheck = checkMigrationNeeded()
  if (migrationCheck.needed) {
    console.log('%c ⚠️ MIGRACIÓN PENDIENTE ', 'background: #f59e0b; color: white; padding: 8px 16px; font-size: 14px; font-weight: bold;')
    console.log(`📦 Datos encontrados en localStorage:`)
    console.log(`   - Códigos: ${migrationCheck.codesCount}`)
    console.log(`   - Reseñas: ${migrationCheck.reviewsCount}`)
    console.log('\n💡 Para migrar tus datos a Firestore, ejecuta:')
    console.log('   window.ProconMigration.migrateAll()')
    console.log('\n📚 Más información:')
    console.log('   - Ver datos pendientes: window.ProconMigration.checkNeeded()')
    console.log('   - Migrar solo códigos: window.ProconMigration.migrateCodes()')
    console.log('   - Migrar solo reseñas: window.ProconMigration.migrateReviews()')
    console.log('   - Limpiar localStorage: window.ProconMigration.cleanup()')
  }
}

export default {
  migrateCodesToFirestore,
  migrateReviewsToFirestore,
  migrateAllData,
  checkMigrationNeeded,
  cleanupLocalStorage
}