// src/hooks/useAuth.js - HOOK PERSONALIZADO PARA AUTENTICACIÓN
import { useState, useEffect, useCallback } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { logger } from '../utils/logger'

/**
 * Hook personalizado para manejar autenticación con Firebase
 * Incluye manejo robusto de errores y cleanup
 */
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    let isMounted = true
    let unsubscribe = null

    const setupAuthListener = async () => {
      try {
        unsubscribe = onAuthStateChanged(
          auth,
          (currentUser) => {
            if (!isMounted) return
            
            setUser(currentUser)
            setLoading(false)
            setError(null)
            setInitialized(true)
            
            if (currentUser) {
              logger.info('Usuario autenticado', { 
                email: currentUser.email,
                uid: currentUser.uid 
              })
            } else {
              logger.info('Usuario no autenticado')
            }
          },
          (authError) => {
            if (!isMounted) return
            
            // Ignorar errores conocidos de extensiones del navegador
            const ignoredErrorPatterns = [
              'message channel closed',
              'Extension context invalidated',
              'runtime.lastError'
            ]
            
            const isIgnoredError = ignoredErrorPatterns.some(pattern => 
              authError.message?.includes(pattern)
            )
            
            if (isIgnoredError) {
              logger.debug('Error de extensión del navegador ignorado', { 
                message: authError.message 
              })
              // No actualizar el estado de error para estos casos
              if (!initialized) {
                setLoading(false)
                setInitialized(true)
              }
              return
            }
            
            // Para otros errores, sí actualizar el estado
            logger.error('Error en auth listener', authError)
            setError(authError)
            setLoading(false)
            setInitialized(true)
          }
        )
      } catch (err) {
        if (!isMounted) return
        
        logger.error('Error configurando auth listener', err)
        setError(err)
        setLoading(false)
        setInitialized(true)
      }
    }

    setupAuthListener()

    return () => {
      isMounted = false
      if (unsubscribe) {
        try {
          unsubscribe()
        } catch (err) {
          // Ignorar errores al limpiar
          logger.debug('Error limpiando auth listener', err)
        }
      }
    }
  }, [])

  // Función para cerrar sesión
  const logout = useCallback(async () => {
    try {
      await signOut(auth)
      logger.info('Logout exitoso')
      return { success: true }
    } catch (err) {
      logger.error('Error al cerrar sesión', err)
      return { success: false, error: err }
    }
  }, [])

  // Función para reintentar autenticación
  const retry = useCallback(() => {
    setLoading(true)
    setError(null)
    setInitialized(false)
  }, [])

  return { 
    user, 
    loading, 
    error,
    initialized,
    logout,
    retry,
    isAuthenticated: !!user,
    isLoading: loading
  }
}

export default useAuth