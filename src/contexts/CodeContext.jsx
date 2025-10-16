// src/contexts/CodeContext.jsx - Context para Códigos
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as codeService from '../services/codeService'
import { logger } from '../utils/logger'

const CodeContext = createContext()

export function CodeProvider({ children }) {
  const [codes, setCodes] = useState([])
  const [availableCodes, setAvailableCodes] = useState([])
  const [usedCodes, setUsedCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar códigos al montar
  useEffect(() => {
    loadCodes()
  }, [])

  // Cargar todos los códigos
  const loadCodes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [allCodes, available, used] = await Promise.all([
        codeService.getCodes(),
        codeService.getAvailableCodes(),
        codeService.getUsedCodes()
      ])
      
      setCodes(allCodes)
      setAvailableCodes(available)
      setUsedCodes(used)
      
      logger.info('Códigos cargados en contexto', { 
        total: allCodes.length,
        available: available.length,
        used: used.length
      })
    } catch (err) {
      logger.error('Error cargando códigos en contexto', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Agregar código
  const addCode = useCallback(async (codeData) => {
    try {
      const newCode = await codeService.addCode(codeData)
      
      setCodes(prev => [...prev, newCode])
      setAvailableCodes(prev => [...prev, newCode])
      
      logger.info('Código agregado en contexto', { id: newCode.id })
      return newCode
    } catch (err) {
      logger.error('Error agregando código en contexto', err)
      throw err
    }
  }, [])

  // Eliminar código
  const deleteCode = useCallback(async (codeId) => {
    try {
      await codeService.deleteCode(codeId)
      
      setCodes(prev => prev.filter(code => code.id !== codeId))
      setAvailableCodes(prev => prev.filter(code => code.id !== codeId))
      setUsedCodes(prev => prev.filter(code => code.id !== codeId))
      
      logger.info('Código eliminado en contexto', { id: codeId })
    } catch (err) {
      logger.error('Error eliminando código en contexto', err)
      throw err
    }
  }, [])

  // Generar código aleatorio
  const generateCode = useCallback(() => {
    return codeService.generateRandomCode()
  }, [])

  // Generar códigos en lote
  const generateBulkCodes = useCallback(async (count, prefix) => {
    try {
      const result = await codeService.generateBulkCodes(count, prefix)
      await loadCodes() // Recargar todos los códigos
      
      logger.info('Códigos generados en lote', { count: result.codes.length })
      return result
    } catch (err) {
      logger.error('Error generando códigos en lote', err)
      throw err
    }
  }, [loadCodes])

  // Importar códigos
  const importCodes = useCallback(async (codesData) => {
    try {
      const result = await codeService.importCodes(codesData)
      await loadCodes() // Recargar todos los códigos
      
      logger.info('Códigos importados', { count: result.imported })
      return result
    } catch (err) {
      logger.error('Error importando códigos', err)
      throw err
    }
  }, [loadCodes])

  // Validar código
  const validateCode = useCallback((code) => {
    return availableCodes.some(c => c.code === code)
  }, [availableCodes])

  const value = {
    codes,
    availableCodes,
    usedCodes,
    loading,
    error,
    loadCodes,
    addCode,
    deleteCode,
    generateCode,
    generateBulkCodes,
    importCodes,
    validateCode
  }

  return (
    <CodeContext.Provider value={value}>
      {children}
    </CodeContext.Provider>
  )
}

// Hook personalizado para usar el contexto
export function useCodes() {
  const context = useContext(CodeContext)
  
  if (!context) {
    throw new Error('useCodes debe usarse dentro de CodeProvider')
  }
  
  return context
}

export default CodeContext