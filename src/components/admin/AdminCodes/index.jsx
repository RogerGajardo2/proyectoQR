// src/components/admin/AdminCodes/index.jsx - SOLUCIÓN COMPLETA
import { useState, useEffect } from 'react'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../../lib/firebase'
import { loginRateLimiter } from '../../../utils/security'
import { logger } from '../../../utils/logger'
import { ReviewProvider, useReviews } from '../../../contexts/ReviewContext'
import { CodeProvider, useCodes } from '../../../contexts/CodeContext'

import AdminLogin from './AdminLogin'
import { AdminHeader, AdminTabs, ImportMessage } from './AdminComponents'
import CodesTab from './CodesTab'
import ReviewsTab from './ReviewsTab'

// Componente que carga datos después de renderizar
function DataLoader() {
  const { loadCodes, loading: codesLoading } = useCodes()
  const { loadReviews, loading: reviewsLoading } = useReviews()

  useEffect(() => {
    // Cargar datos cuando el componente se monta (usuario ya autenticado)
    const loadData = async () => {
      try {
        logger.info('Cargando datos del admin...')
        await Promise.all([
          loadCodes(),
          loadReviews()
        ])
        logger.info('Datos cargados exitosamente')
      } catch (error) {
        logger.error('Error cargando datos del admin', error)
      }
    }

    loadData()
  }, [loadCodes, loadReviews])

  // Mostrar loading mientras cargan los datos iniciales
  if (codesLoading || reviewsLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return null // El DataLoader no renderiza nada, solo carga datos
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
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
      
      if (currentUser) {
        logger.info('Usuario autenticado', { email: currentUser.email })
      } else {
        logger.info('Usuario no autenticado')
      }
    })

    return () => unsubscribe()
  }, [])

  // Limpiar rate limiter periódicamente
  useEffect(() => {
    const cleanup = setInterval(() => {
      loginRateLimiter.cleanup()
    }, 5 * 60 * 1000)

    return () => clearInterval(cleanup)
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      logger.info('Logout exitoso')
    } catch (error) {
      logger.error('Error al cerrar sesión', error)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Login screen
  if (!user) {
    return <AdminLogin />
  }

  // Admin dashboard - Los providers están aquí, pero NO cargan datos automáticamente
  return (
    <CodeProvider>
      <ReviewProvider>
        <AdminContent user={user} onLogout={handleLogout} />
      </ReviewProvider>
    </CodeProvider>
  )
}