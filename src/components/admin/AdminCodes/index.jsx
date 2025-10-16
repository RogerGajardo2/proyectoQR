// src/components/admin/AdminCodes/index.jsx - REFACTORIZADO
import { useState, useEffect } from 'react'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../../lib/firebase'
import { loginRateLimiter } from '../../../utils/security'
import { logger } from '../../../utils/logger'
import { ReviewProvider } from '../../../contexts/ReviewContext'
import { CodeProvider } from '../../../contexts/CodeContext'

import AdminLogin from './AdminLogin'
import { AdminHeader, AdminTabs, ImportMessage } from './AdminComponents'
import CodesTab from './CodesTab'
import ReviewsTab from './ReviewsTab'

export default function AdminCodes() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('codes')
  const [importMessage, setImportMessage] = useState({ type: '', message: '' })

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
      if (currentUser) {
        logger.info('Usuario autenticado', currentUser.email)
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
      showImportMessage('success', 'Sesión cerrada correctamente')
      logger.info('Logout exitoso')
    } catch (error) {
      logger.error('Error al cerrar sesión', error)
      showImportMessage('error', 'Error al cerrar sesión')
    }
  }

  const showImportMessage = (type, message) => {
    setImportMessage({ type, message })
    setTimeout(() => {
      setImportMessage({ type: '', message: '' })
    }, 5000)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // Login screen
  if (!user) {
    return <AdminLogin />
  }

  // Admin dashboard
  return (
    <ReviewProvider>
      <CodeProvider>
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Mensaje de importación */}
            <ImportMessage message={importMessage} />

            {/* Header */}
            <AdminHeader 
              user={user} 
              onLogout={handleLogout} 
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
      </CodeProvider>
    </ReviewProvider>
  )
}