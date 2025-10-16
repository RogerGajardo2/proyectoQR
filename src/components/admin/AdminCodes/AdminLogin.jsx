// src/components/admin/AdminCodes/AdminLogin.jsx
import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../../lib/firebase'
import Button from '../../ui/Button'
import { SecurityManager, loginRateLimiter } from '../../../utils/security'
import { logger } from '../../../utils/logger'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      setLoginError('Por favor completa todos los campos')
      return
    }

    // Validar email
    if (!SecurityManager.validateEmail(email)) {
      setLoginError('Formato de email inválido')
      return
    }

    // Verificar rate limiting
    const limitCheck = loginRateLimiter.checkLimit(email)
    
    if (!limitCheck.allowed) {
      const resetTime = new Date(limitCheck.resetTime)
      const minutes = Math.ceil((limitCheck.resetTime - Date.now()) / 60000)
      setLoginError(`Demasiados intentos fallidos. Intenta en ${minutes} minuto(s)`)
      logger.warn('Login bloqueado por rate limit', { email, resetTime })
      return
    }

    setLoggingIn(true)
    setLoginError('')

    try {
      await signInWithEmailAndPassword(auth, email, password)
      loginRateLimiter.reset(email)
      logger.info('Login exitoso', email)
    } catch (error) {
      loginRateLimiter.increment(email)
      logger.error('Error de login', { email, error: error.code })
      
      const remaining = loginRateLimiter.checkLimit(email).remainingAttempts
      
      switch (error.code) {
        case 'auth/invalid-email':
          setLoginError('Correo electrónico inválido')
          break
        case 'auth/user-disabled':
          setLoginError('Usuario deshabilitado')
          break
        case 'auth/user-not-found':
          setLoginError(`Credenciales incorrectas. ${remaining} intentos restantes`)
          break
        case 'auth/wrong-password':
          setLoginError(`Credenciales incorrectas. ${remaining} intentos restantes`)
          break
        case 'auth/too-many-requests':
          setLoginError('Demasiados intentos fallidos. Intenta más tarde.')
          break
        case 'auth/network-request-failed':
          setLoginError('Error de red. Verifica tu conexión.')
          break
        case 'auth/invalid-credential':
          setLoginError(`Credenciales incorrectas. ${remaining} intentos restantes`)
          break
        default:
          setLoginError('Error al iniciar sesión. Intenta nuevamente.')
      }
    } finally {
      setLoggingIn(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Panel de Administración</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block font-semibold text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setLoginError('')
              }}
              disabled={loggingIn}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="admin@proconing.cl"
              autoComplete="email"
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-semibold text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setLoginError('')
              }}
              disabled={loggingIn}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="••••••••"
              autoComplete="current-password"
              maxLength={100}
            />
          </div>

          {loginError && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-800 text-sm">{loginError}</p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full justify-center"
            disabled={loggingIn}
          >
            {loggingIn ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>

          <a 
            className="block text-center hover:opacity-70 transition underline text-sm text-gray-600 mt-4"
            onClick={() => window.location.href = '/#/inicio'}
          >
            ← Volver al sitio
          </a>
        </form>
      </div>
    </div>
  )
}