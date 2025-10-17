// src/components/admin/AdminCodes/AdminLogin.jsx - VERSIÓN MEJORADA
import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../../lib/firebase'
import { loginRateLimiter } from '../../../utils/security'
import { logger } from '../../../utils/logger'
import Button from '../../ui/Button'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Por favor completa todos los campos')
      return
    }

    const limitCheck = loginRateLimiter.checkLimit(email)
    
    if (!limitCheck.allowed) {
      const minutes = Math.ceil((limitCheck.resetTime - Date.now()) / 60000)
      setError(`Demasiados intentos. Intenta en ${minutes} minuto(s)`)
      logger.warn('Rate limit alcanzado para login', { email })
      return
    }

    setLoading(true)

    try {
      // Usar un timeout para evitar bloqueos indefinidos
      const loginPromise = signInWithEmailAndPassword(auth, email, password)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 15000)
      )
      
      await Promise.race([loginPromise, timeoutPromise])
      
      logger.info('Login exitoso', { email })
      
      // Pequeño delay para asegurar que el estado de auth se propague
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (err) {
      logger.error('Error en login', err)
      loginRateLimiter.increment(email)
      
      // Ignorar errores de message channel
      if (err.message && (
        err.message.includes('message channel closed') ||
        err.message.includes('Extension context')
      )) {
        logger.info('Error de extensión ignorado durante login')
        // Esperar un momento y verificar si el login fue exitoso de todas formas
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Si después de esperar no hay error, probablemente el login funcionó
        if (auth.currentUser) {
          logger.info('Login completado a pesar del error de extensión')
          return
        }
      }
      
      if (err.message === 'Timeout') {
        setError('El inicio de sesión está tardando mucho. Por favor, verifica tu conexión.')
        return
      }
      
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('Credenciales incorrectas')
          break
        case 'auth/too-many-requests':
          setError('Demasiados intentos. Intenta más tarde')
          break
        case 'auth/network-request-failed':
          setError('Error de conexión. Verifica tu internet')
          break
        default:
          setError('Error al iniciar sesión. Intenta nuevamente')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full mb-3 sm:mb-4">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Panel Admin</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">ProconIng</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@proconing.cl"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={loading}
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={loading}
              autoComplete="current-password"
              required
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2 sm:gap-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-800 text-xs sm:text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full justify-center text-sm sm:text-base py-2.5 sm:py-3"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Iniciando sesión...
              </span>
            ) : 'Iniciar sesión'}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-4 sm:mt-6 text-center">
          <button
            onClick={() => window.location.href = '/#/inicio'}
            className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Volver al sitio
          </button>
        </div>

        {/* Security info */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            🔒 Conexión segura · Intentos limitados
          </p>
        </div>
      </div>
    </div>
  )
}