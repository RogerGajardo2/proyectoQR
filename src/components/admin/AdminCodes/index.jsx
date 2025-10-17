// src/components/admin/AdminCodes/index.jsx - VERSIÓN MEJORADA CON useAuth
import { useState, useEffect } from 'react'
import { loginRateLimiter } from '../../../utils/security'
import { logger } from '../../../utils/logger'
import { ReviewProvider, useReviews } from '../../../contexts/ReviewContext'
import { CodeProvider, useCodes } from '../../../contexts/CodeContext'
import { useAuth } from '../../../hooks/useAuth'

import AdminLogin from './AdminLogin'
import { AdminHeader, AdminTabs, ImportMessage } from './AdminComponents'
import CodesTab from './CodesTab'
import ReviewsTab from './ReviewsTab'

// Componente que carga datos después de renderizar
function DataLoader() {
  const { loadCodes, loading: codesLoading } = useCodes()
  const { loadReviews, loading: reviewsLoading } = useReviews()
  const [dataLoaded, setDataLoaded] = useState(false)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      if (dataLoaded) return

      try {
        logger.info('Cargando datos del admin...')
        
        // Cargar datos en paralelo con timeout
        const loadPromise = Promise.all([
          loadCodes(),
          loadReviews()
        ])

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout cargando datos')), 15000)
        )

        await Promise.race([loadPromise, timeoutPromise])
        
        if (isMounted) {
          setDataLoaded(true)
          logger.info('Datos cargados exitosamente')
        }
      } catch (error) {
        if (isMounted) {
          // Ignorar errores de extensiones
          if (error.message?.includes('message channel')) {
            logger.debug('Error de extensión ignorado durante carga de datos')
            setDataLoaded(true)
            return
          }

          logger.error('Error cargando datos del admin', error)
          setLoadError(error.message)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [loadCodes, loadReviews, dataLoaded])

  // Mostrar loading mientras cargan los datos iniciales
  if ((codesLoading || reviewsLoading) && !dataLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  // Mostrar error si hubo problema
  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error al cargar datos</h2>
          <p className="text-gray-600 mb-4">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return null // El DataLoader no renderiza nada una vez cargado
}

// Componente interno que usa los contexts
function AdminContent({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('codes')
  const [importMessage, setImportMessage] = useState({ type: '', message: '' })

  const showImportMessage = (type, message) => {
    setImportMessage({ type, message })
    setTimeout(() => {
      setImportMessage({ type: '', message: '' })
    }, 5000)
  }

  return (
    <>
      {/* Componente que carga datos */}
      <DataLoader />
      
      <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Mensaje de importación */}
          <ImportMessage message={importMessage} />
          
          {/* Header */}
          <AdminHeader 
            user={user} 
            onLogout={onLogout} 
          />

          {/* Tabs */}
          <AdminTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />

          {/* Contenido según tab activo */}
          <div className="mt-6">
            {activeTab === 'codes' ? (
              <CodesTab showImportMessage={showImportMessage} />
            ) : (
              <ReviewsTab showImportMessage={showImportMessage} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default function AdminCodes() {
  const { user, loading, error: authError, logout, initialized } = useAuth()
  const [showError, setShowError] = useState(false)

  // Limpiar rate limiter periódicamente
  useEffect(() => {
    const cleanup = setInterval(() => {
      loginRateLimiter.cleanup()
    }, 5 * 60 * 1000) // Cada 5 minutos

    return () => clearInterval(cleanup)
  }, [])

  // Manejar errores de autenticación
  useEffect(() => {
    if (authError && initialized) {
      // Solo mostrar errores que no sean de extensiones
      const isExtensionError = authError.message?.includes('message channel') ||
                              authError.message?.includes('Extension context')
      
      if (!isExtensionError) {
        setShowError(true)
        logger.error('Error de autenticación persistente', authError)
      }
    }
  }, [authError, initialized])

  const handleLogout = async () => {
    try {
      const result = await logout()
      if (!result.success) {
        logger.error('Error al cerrar sesión', result.error)
        alert('Hubo un error al cerrar sesión. Intenta nuevamente.')
      }
    } catch (error) {
      logger.error('Error inesperado al cerrar sesión', error)
    }
  }

  // Loading state inicial
  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
          {loading && (
            <p className="mt-2 text-xs text-gray-500">
              Si esto tarda mucho, intenta recargar la página
            </p>
          )}
        </div>
      </div>
    )
  }

  // Error state (solo para errores no relacionados con extensiones)
  if (showError && authError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error de Autenticación</h2>
          <p className="text-gray-600 mb-6">
            Hubo un problema verificando tu sesión. Por favor, intenta nuevamente.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
          <button
            onClick={() => window.location.href = '/#/inicio'}
            className="w-full mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  // Login screen
  if (!user) {
    return <AdminLogin />
  }

  // Admin dashboard - Los providers están aquí
  return (
    <CodeProvider>
      <ReviewProvider>
        <AdminContent user={user} onLogout={handleLogout} />
      </ReviewProvider>
    </CodeProvider>
  )
}