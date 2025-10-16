// src/services/codeService.js - MEJORADO CON ERROR HANDLING
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc,
  query,
  where,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { SecurityManager } from '../utils/security'
import { handleServiceError } from '../utils/errorHandler'
import { logger } from '../utils/logger'

const CODES_COLLECTION = 'codes'

/**
 * Obtener todos los códigos
 */
export const getCodes = async () => {
  try {
    const codesRef = collection(db, CODES_COLLECTION)
    const snapshot = await getDocs(codesRef)
    
    const codes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    logger.info('Códigos cargados desde Firestore', { count: codes.length })
    return codes
  } catch (error) {
    logger.error('Error obteniendo códigos', error)
    throw handleServiceError(error, 'getCodes')
  }
}

/**
 * Obtener códigos disponibles
 */
export const getAvailableCodes = async () => {
  try {
    const codesRef = collection(db, CODES_COLLECTION)
    const q = query(codesRef, where('used', '==', false))
    const snapshot = await getDocs(q)
    
    const codes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    logger.info('Códigos disponibles obtenidos', { count: codes.length })
    return codes
  } catch (error) {
    logger.error('Error obteniendo códigos disponibles', error)
    throw handleServiceError(error, 'getAvailableCodes')
  }
}

/**
 * Obtener códigos usados
 */
export const getUsedCodes = async () => {
  try {
    const codesRef = collection(db, CODES_COLLECTION)
    const q = query(codesRef, where('used', '==', true))
    const snapshot = await getDocs(q)
    
    const codes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    logger.info('Códigos usados obtenidos', { count: codes.length })
    return codes
  } catch (error) {
    logger.error('Error obteniendo códigos usados', error)
    throw handleServiceError(error, 'getUsedCodes')
  }
}

/**
 * Agregar un código
 */
export const addCode = async (codeData) => {
  try {
    // Validar datos requeridos
    if (!codeData.code) {
      throw new Error('Código es requerido')
    }

    const sanitizedCode = {
      code: SecurityManager.sanitizeInput(codeData.code.toUpperCase(), 50),
      clientName: SecurityManager.sanitizeInput(codeData.clientName || 'Sin nombre', 100),
      used: false,
      createdAt: serverTimestamp(),
      usedAt: null
    }

    // Validar formato del código
    if (!/^[A-Z0-9]+$/.test(sanitizedCode.code)) {
      throw new Error('El código solo puede contener letras mayúsculas y números')
    }

    if (sanitizedCode.code.length < 4) {
      throw new Error('El código debe tener al menos 4 caracteres')
    }
    
    // Verificar que el código no exista
    const exists = await codeExists(sanitizedCode.code)
    if (exists) {
      throw new Error('El código ya existe')
    }
    
    const docRef = await addDoc(collection(db, CODES_COLLECTION), sanitizedCode)
    
    logger.info('Código agregado', { id: docRef.id, code: sanitizedCode.code })
    return { id: docRef.id, ...sanitizedCode }
  } catch (error) {
    logger.error('Error agregando código', error)
    throw handleServiceError(error, 'addCode')
  }
}

/**
 * Eliminar un código
 */
export const deleteCode = async (codeId) => {
  try {
    if (!codeId) {
      throw new Error('ID de código requerido')
    }

    const codeRef = doc(db, CODES_COLLECTION, codeId)
    await deleteDoc(codeRef)
    
    logger.info('Código eliminado', { id: codeId })
  } catch (error) {
    logger.error('Error eliminando código', error)
    throw handleServiceError(error, 'deleteCode')
  }
}

/**
 * Verificar si un código existe
 */
const codeExists = async (code) => {
  try {
    if (!code) return false
    
    const codesRef = collection(db, CODES_COLLECTION)
    const q = query(codesRef, where('code', '==', code))
    const snapshot = await getDocs(q)
    
    return !snapshot.empty
  } catch (error) {
    logger.error('Error verificando código', error)
    return false
  }
}

/**
 * Generar código aleatorio
 */
export const generateRandomCode = (prefix = 'PROC', length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = prefix
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Importar códigos desde JSON
 */
export const importCodes = async (codesData) => {
  try {
    if (!Array.isArray(codesData) || codesData.length === 0) {
      throw new Error('Datos de códigos inválidos')
    }

    const batch = writeBatch(db)
    const codesRef = collection(db, CODES_COLLECTION)
    let imported = 0
    let skipped = 0
    const errors = []
    
    for (const codeData of codesData) {
      try {
        // Validar estructura
        if (!codeData.code) {
          errors.push(`Código sin valor: ${JSON.stringify(codeData)}`)
          skipped++
          continue
        }

        // Verificar si existe
        const exists = await codeExists(codeData.code)
        if (exists) {
          logger.info('Código ya existe, saltando', { code: codeData.code })
          skipped++
          continue
        }

        // Preparar datos
        const sanitizedCode = {
          code: SecurityManager.sanitizeInput(codeData.code.toUpperCase(), 50),
          clientName: SecurityManager.sanitizeInput(codeData.clientName || 'Sin nombre', 100),
          used: Boolean(codeData.used),
          createdAt: serverTimestamp(),
          usedAt: codeData.used ? serverTimestamp() : null,
          importedAt: serverTimestamp()
        }

        // Validar formato
        if (!/^[A-Z0-9]+$/.test(sanitizedCode.code)) {
          errors.push(`Código con formato inválido: ${codeData.code}`)
          skipped++
          continue
        }

        const newCodeRef = doc(codesRef)
        batch.set(newCodeRef, sanitizedCode)
        imported++
      } catch (error) {
        errors.push(`Error procesando código ${codeData.code}: ${error.message}`)
        skipped++
      }
    }
    
    if (imported > 0) {
      await batch.commit()
    }
    
    logger.info('Códigos importados', { imported, skipped, errors: errors.length })
    
    return { 
      success: true, 
      imported, 
      skipped,
      errors: errors.length > 0 ? errors : undefined
    }
  } catch (error) {
    logger.error('Error importando códigos', error)
    throw handleServiceError(error, 'importCodes')
  }
}

/**
 * Generar códigos en lote
 */
export const generateBulkCodes = async (count = 10, prefix = 'PROC') => {
  try {
    // Validar parámetros
    const validCount = parseInt(count)
    if (isNaN(validCount) || validCount < 1 || validCount > 100) {
      throw new Error('La cantidad debe estar entre 1 y 100')
    }

    const codes = []
    const existingCodes = await getCodes()
    const existingCodeStrings = existingCodes.map(c => c.code)
    
    for (let i = 0; i < validCount; i++) {
      let newCode
      let attempts = 0
      const maxAttempts = 100
      
      do {
        newCode = generateRandomCode(prefix, 6)
        attempts++
        
        if (attempts >= maxAttempts) {
          logger.warn('No se pudo generar código único después de múltiples intentos')
          break
        }
      } while (existingCodeStrings.includes(newCode) || codes.includes(newCode))
      
      if (attempts < maxAttempts) {
        const codeData = {
          code: newCode,
          clientName: '',
          used: false,
          createdAt: serverTimestamp()
        }
        
        try {
          await addDoc(collection(db, CODES_COLLECTION), codeData)
          codes.push(newCode)
        } catch (error) {
          logger.error('Error agregando código generado', { code: newCode, error })
        }
      }
    }
    
    logger.info('Códigos generados en lote', { requested: validCount, generated: codes.length })
    
    return { 
      success: true, 
      codes,
      generated: codes.length,
      requested: validCount
    }
  } catch (error) {
    logger.error('Error generando códigos en lote', error)
    throw handleServiceError(error, 'generateBulkCodes')
  }
}

/**
 * Obtener estadísticas de códigos
 */
export const getCodeStats = async () => {
  try {
    const allCodes = await getCodes()
    const availableCodes = allCodes.filter(c => !c.used)
    const usedCodes = allCodes.filter(c => c.used)
    
    return {
      total: allCodes.length,
      available: availableCodes.length,
      used: usedCodes.length,
      usageRate: allCodes.length > 0 ? (usedCodes.length / allCodes.length * 100).toFixed(2) : 0
    }
  } catch (error) {
    logger.error('Error obteniendo estadísticas de códigos', error)
    throw handleServiceError(error, 'getCodeStats')
  }
}

export default {
  getCodes,
  getAvailableCodes,
  getUsedCodes,
  addCode,
  deleteCode,
  generateRandomCode,
  importCodes,
  generateBulkCodes,
  getCodeStats
}