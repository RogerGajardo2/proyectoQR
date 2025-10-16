// src/services/codeService.js - Servicio de Códigos con Firestore
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
    throw error
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
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    logger.error('Error obteniendo códigos disponibles', error)
    throw error
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
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    logger.error('Error obteniendo códigos usados', error)
    throw error
  }
}

/**
 * Agregar un código
 */
export const addCode = async (codeData) => {
  try {
    const sanitizedCode = {
      code: SecurityManager.sanitizeInput(codeData.code.toUpperCase(), 50),
      clientName: SecurityManager.sanitizeInput(codeData.clientName || 'Sin nombre', 100),
      used: false,
      createdAt: serverTimestamp(),
      usedAt: null
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
    throw error
  }
}

/**
 * Eliminar un código
 */
export const deleteCode = async (codeId) => {
  try {
    const codeRef = doc(db, CODES_COLLECTION, codeId)
    await deleteDoc(codeRef)
    
    logger.info('Código eliminado', { id: codeId })
  } catch (error) {
    logger.error('Error eliminando código', error)
    throw error
  }
}

/**
 * Verificar si un código existe
 */
const codeExists = async (code) => {
  try {
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
export const generateRandomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'PROC'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Importar códigos desde JSON
 */
export const importCodes = async (codesData) => {
  try {
    const batch = writeBatch(db)
    const codesRef = collection(db, CODES_COLLECTION)
    let imported = 0
    
    for (const codeData of codesData) {
      const exists = await codeExists(codeData.code)
      if (!exists) {
        const newCodeRef = doc(codesRef)
        batch.set(newCodeRef, {
          ...codeData,
          importedAt: serverTimestamp()
        })
        imported++
      }
    }
    
    await batch.commit()
    
    logger.info('Códigos importados', { count: imported })
    return { success: true, imported }
  } catch (error) {
    logger.error('Error importando códigos', error)
    throw error
  }
}

/**
 * Generar códigos en lote
 */
export const generateBulkCodes = async (count = 10, prefix = 'PROC') => {
  try {
    const codes = []
    const existingCodes = await getCodes()
    const existingCodeStrings = existingCodes.map(c => c.code)
    
    for (let i = 0; i < count; i++) {
      let newCode
      let attempts = 0
      
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
        logger.warn('No se pudo generar código único después de 100 intentos')
        break
      }
      
      const codeData = {
        code: newCode,
        clientName: '',
        used: false,
        createdAt: serverTimestamp()
      }
      
      await addDoc(collection(db, CODES_COLLECTION), codeData)
      codes.push(newCode)
    }
    
    logger.info('Códigos generados en lote', { count: codes.length })
    return { success: true, codes }
  } catch (error) {
    logger.error('Error generando códigos en lote', error)
    throw error
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
  generateBulkCodes
}