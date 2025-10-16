// src/services/reviewService.js - Servicio de Reseñas con Firestore
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { SecurityManager } from '../utils/security'
import { logger } from '../utils/logger'

const REVIEWS_COLLECTION = 'reviews'
const CODES_COLLECTION = 'codes'

/**
 * Obtener todas las reseñas
 */
export const getReviews = async () => {
  try {
    const reviewsRef = collection(db, REVIEWS_COLLECTION)
    const q = query(reviewsRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
    }))
    
    logger.info('Reseñas cargadas desde Firestore', { count: reviews.length })
    return reviews
  } catch (error) {
    logger.error('Error obteniendo reseñas', error)
    throw error
  }
}

/**
 * Agregar una nueva reseña
 */
export const addReview = async (reviewData) => {
  try {
    // Validar y sanitizar datos
    const sanitizedReview = {
      name: SecurityManager.sanitizeInput(reviewData.name, 100),
      rating: parseInt(reviewData.rating),
      comment: SecurityManager.sanitizeInput(reviewData.comment, 1000),
      project: SecurityManager.sanitizeInput(reviewData.project || '', 200),
      code: SecurityManager.sanitizeInput(reviewData.code, 50),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    // Validar que el código existe y no está usado
    const isValid = await validateCode(sanitizedReview.code)
    if (!isValid) {
      throw new Error('Código inválido o ya usado')
    }
    
    // Agregar reseña
    const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), sanitizedReview)
    
    // Marcar código como usado
    await markCodeAsUsed(sanitizedReview.code)
    
    logger.info('Reseña agregada', { id: docRef.id, code: sanitizedReview.code })
    
    return { id: docRef.id, ...sanitizedReview }
  } catch (error) {
    logger.error('Error agregando reseña', error)
    throw error
  }
}

/**
 * Actualizar una reseña
 */
export const updateReview = async (reviewId, updates) => {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId)
    
    const sanitizedUpdates = {
      name: SecurityManager.sanitizeInput(updates.name, 100),
      rating: parseInt(updates.rating),
      comment: SecurityManager.sanitizeInput(updates.comment, 1000),
      project: SecurityManager.sanitizeInput(updates.project || '', 200),
      updatedAt: serverTimestamp()
    }
    
    await updateDoc(reviewRef, sanitizedUpdates)
    
    logger.info('Reseña actualizada', { id: reviewId })
    return { id: reviewId, ...sanitizedUpdates }
  } catch (error) {
    logger.error('Error actualizando reseña', error)
    throw error
  }
}

/**
 * Eliminar una reseña
 */
export const deleteReview = async (reviewId, code) => {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId)
    await deleteDoc(reviewRef)
    
    // Liberar el código
    await releaseCode(code)
    
    logger.info('Reseña eliminada', { id: reviewId, code })
  } catch (error) {
    logger.error('Error eliminando reseña', error)
    throw error
  }
}

/**
 * Obtener reseñas filtradas
 */
export const getFilteredReviews = async (filters = {}) => {
  try {
    let q = query(collection(db, REVIEWS_COLLECTION))
    
    if (filters.rating) {
      q = query(q, where('rating', '==', filters.rating))
    }
    
    if (filters.minRating) {
      q = query(q, where('rating', '>=', filters.minRating))
    }
    
    q = query(q, orderBy('createdAt', 'desc'))
    
    if (filters.limit) {
      q = query(q, limit(filters.limit))
    }
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
    }))
  } catch (error) {
    logger.error('Error obteniendo reseñas filtradas', error)
    throw error
  }
}

/**
 * Validar código
 */
const validateCode = async (code) => {
  try {
    const codesRef = collection(db, CODES_COLLECTION)
    const q = query(codesRef, where('code', '==', code), where('used', '==', false))
    const snapshot = await getDocs(q)
    
    return !snapshot.empty
  } catch (error) {
    logger.error('Error validando código', error)
    return false
  }
}

/**
 * Marcar código como usado
 */
const markCodeAsUsed = async (code) => {
  try {
    const codesRef = collection(db, CODES_COLLECTION)
    const q = query(codesRef, where('code', '==', code))
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      const codeDoc = snapshot.docs[0]
      await updateDoc(codeDoc.ref, {
        used: true,
        usedAt: serverTimestamp()
      })
    }
  } catch (error) {
    logger.error('Error marcando código como usado', error)
    throw error
  }
}

/**
 * Liberar código (cuando se elimina reseña)
 */
const releaseCode = async (code) => {
  try {
    const codesRef = collection(db, CODES_COLLECTION)
    const q = query(codesRef, where('code', '==', code))
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      const codeDoc = snapshot.docs[0]
      await updateDoc(codeDoc.ref, {
        used: false,
        usedAt: null
      })
    }
  } catch (error) {
    logger.error('Error liberando código', error)
    throw error
  }
}

/**
 * Obtener estadísticas de reseñas
 */
export const getReviewStats = async () => {
  try {
    const reviews = await getReviews()
    
    if (reviews.length === 0) {
      return {
        total: 0,
        average: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      }
    }
    
    const total = reviews.length
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
    const average = sum / total
    
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(review => {
      distribution[review.rating]++
    })
    
    return { total, average, distribution }
  } catch (error) {
    logger.error('Error obteniendo estadísticas', error)
    throw error
  }
}

export default {
  getReviews,
  addReview,
  updateReview,
  deleteReview,
  getFilteredReviews,
  getReviewStats
}