// src/components/AdminCodes.jsx (CON FIREBASE AUTHENTICATION)
import { useState, useEffect, useRef } from 'react'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../config/firebase'
import Button from './ui/Button'

// ==================== UTILIDADES DE SEGURIDAD ====================

class SecurityManager {
  static sanitizeInput(input, maxLength = 500) {
    if (typeof input !== 'string') return ''
    
    return input
      .trim()
      .slice(0, maxLength)
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
  }

  static validateImportedData(data, type) {
    if (!data || typeof data !== 'object') {
      throw new Error('Formato de datos inválido')
    }

    if (type === 'codes') {
      if (!Array.isArray(data.codes)) {
        throw new Error('El archivo debe contener un array de códigos')
      }

      return data.codes.filter(code => {
        return (
          code &&
          typeof code === 'object' &&
          typeof code.code === 'string' &&
          code.code.length > 0 &&
          code.code.length <= 50 &&
          /^[A-Z0-9]+$/.test(code.code) &&
          typeof code.createdAt === 'string'
        )
      }).map(code => ({
        code: this.sanitizeInput(code.code, 50),
        clientName: this.sanitizeInput(code.clientName || 'Sin nombre', 100),
        createdAt: code.createdAt,
        used: false
      }))
    }

    if (type === 'reviews') {
      if (!Array.isArray(data.reviews)) {
        throw new Error('El archivo debe contener un array de reseñas')
      }

      return data.reviews.filter(review => {
        return (
          review &&
          typeof review === 'object' &&
          typeof review.name === 'string' &&
          review.name.length > 0 &&
          review.name.length <= 100 &&
          typeof review.rating === 'number' &&
          review.rating >= 1 &&
          review.rating <= 5 &&
          typeof review.comment === 'string' &&
          review.comment.length >= 10 &&
          review.comment.length <= 1000 &&
          typeof review.code === 'string' &&
          /^[A-Z0-9]+$/.test(review.code)
        )
      }).map(review => ({
        name: this.sanitizeInput(review.name, 100),
        rating: parseInt(review.rating),
        comment: this.sanitizeInput(review.comment, 1000),
        project: this.sanitizeInput(review.project || '', 200),
        date: review.date || new Date().toISOString(),
        code: this.sanitizeInput(review.code, 50)
      }))
    }

    throw new Error('Tipo de datos desconocido')
  }
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function AdminCodes() {
  // Estados de autenticación
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  
  // Estados de la aplicación
  const [activeTab, setActiveTab] = useState('codes')
  const [codes, setCodes] = useState([])
  const [usedCodes, setUsedCodes] = useState([])
  const [newCode, setNewCode] = useState('')
  const [clientName, setClientName] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  
  const [reviews, setReviews] = useState([])
  const [editingReview, setEditingReview] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRating, setFilterRating] = useState('all')

  const codesFileInputRef = useRef(null)
  const reviewsFileInputRef = useRef(null)

  const [importMessage, setImportMessage] = useState({ type: '', message: '' })

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
      if (currentUser) {
        loadAllData()
      }
    })

    return () => unsubscribe()
  }, [])

  const loadAllData = () => {
    const savedCodes = JSON.parse(localStorage.getItem('proconing_codes') || '[]')
    const savedUsedCodes = JSON.parse(localStorage.getItem('proconing_used_codes') || '[]')
    const savedReviews = JSON.parse(localStorage.getItem('proconing_reviews') || '[]')
    
    setCodes(savedCodes)
    setUsedCodes(savedUsedCodes)
    setReviews(savedReviews)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      setLoginError('Por favor completa todos los campos')
      return
    }

    setLoggingIn(true)
    setLoginError('')

    try {
      await signInWithEmailAndPassword(auth, email, password)
      // El onAuthStateChanged manejará el cambio de estado
      setEmail('')
      setPassword('')
    } catch (error) {
      console.error('Error de login:', error)
      
      switch (error.code) {
        case 'auth/invalid-email':
          setLoginError('Correo electrónico inválido')
          break
        case 'auth/user-disabled':
          setLoginError('Usuario deshabilitado')
          break
        case 'auth/user-not-found':
          setLoginError('Usuario no encontrado')
          break
        case 'auth/wrong-password':
          setLoginError('Contraseña incorrecta')
          break
        case 'auth/too-many-requests':
          setLoginError('Demasiados intentos fallidos. Intenta más tarde.')
          break
        case 'auth/network-request-failed':
          setLoginError('Error de red. Verifica tu conexión.')
          break
        default:
          setLoginError('Error al iniciar sesión. Intenta nuevamente.')
      }
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      showImportMessage('success', 'Sesión cerrada correctamente')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      showImportMessage('error', 'Error al cerrar sesión')
    }
  }

  const showImportMessage = (type, message) => {
    setImportMessage({ type, message })
    setTimeout(() => {
      setImportMessage({ type: '', message: '' })
    }, 5000)
  }

  // ==================== FUNCIONES DE IMPORTACIÓN ====================

  const handleImportCodes = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 1024 * 1024) {
      showImportMessage('error', 'El archivo es demasiado grande (máximo 1MB)')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        const validCodes = SecurityManager.validateImportedData(data, 'codes')

        if (validCodes.length === 0) {
          showImportMessage('error', 'No se encontraron códigos válidos en el archivo')
          return
        }

        const confirm = window.confirm(
          `¿Importar ${validCodes.length} código(s)?\n\n⚠️ ADVERTENCIA: Esto sobrescribirá todos los códigos actuales.\n\n¿Estás seguro?`
        )

        if (!confirm) return

        localStorage.setItem('proconing_codes', JSON.stringify(validCodes))
        setCodes(validCodes)

        if (data.usedCodes && Array.isArray(data.usedCodes)) {
          const sanitizedUsedCodes = data.usedCodes
            .filter(code => typeof code === 'string' && /^[A-Z0-9]+$/.test(code))
            .map(code => SecurityManager.sanitizeInput(code, 50))
          
          localStorage.setItem('proconing_used_codes', JSON.stringify(sanitizedUsedCodes))
          setUsedCodes(sanitizedUsedCodes)
        }

        showImportMessage('success', `✓ ${validCodes.length} código(s) importado(s) correctamente`)
      } catch (error) {
        console.error('Error al importar códigos:', error)
        showImportMessage('error', `Error: ${error.message}`)
      }
    }

    reader.onerror = () => {
      showImportMessage('error', 'Error al leer el archivo')
    }

    reader.readAsText(file)
    e.target.value = ''
  }

  const handleImportReviews = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      showImportMessage('error', 'El archivo es demasiado grande (máximo 2MB)')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        const validReviews = SecurityManager.validateImportedData(data, 'reviews')

        if (validReviews.length === 0) {
          showImportMessage('error', 'No se encontraron reseñas válidas en el archivo')
          return
        }

        const confirm = window.confirm(
          `¿Importar ${validReviews.length} reseña(s)?\n\n⚠️ ADVERTENCIA: Esto sobrescribirá todas las reseñas actuales.\n\n¿Estás seguro?`
        )

        if (!confirm) return

        localStorage.setItem('proconing_reviews', JSON.stringify(validReviews))
        setReviews(validReviews)

        const reviewCodes = validReviews.map(r => r.code)
        const uniqueUsedCodes = [...new Set(reviewCodes)]
        localStorage.setItem('proconing_used_codes', JSON.stringify(uniqueUsedCodes))
        setUsedCodes(uniqueUsedCodes)

        showImportMessage('success', `✓ ${validReviews.length} reseña(s) importada(s) correctamente`)
      } catch (error) {
        console.error('Error al importar reseñas:', error)
        showImportMessage('error', `Error: ${error.message}`)
      }
    }

    reader.onerror = () => {
      showImportMessage('error', 'Error al leer el archivo')
    }

    reader.readAsText(file)
    e.target.value = ''
  }

  // ==================== FUNCIONES DE CÓDIGOS ====================
  
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'PROC'
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const handleAddCode = () => {
    if (!newCode.trim()) {
      alert('Ingresa un código válido')
      return
    }

    const code = SecurityManager.sanitizeInput(newCode.trim().toUpperCase(), 50)
    
    if (!/^[A-Z0-9]+$/.test(code)) {
      alert('El código solo puede contener letras mayúsculas y números')
      return
    }

    if (codes.some(c => c.code === code)) {
      alert('Este código ya existe')
      return
    }

    const newCodeObj = {
      code,
      clientName: SecurityManager.sanitizeInput(clientName.trim() || 'Sin nombre', 100),
      createdAt: new Date().toISOString(),
      used: false
    }

    const updatedCodes = [...codes, newCodeObj]
    setCodes(updatedCodes)
    localStorage.setItem('proconing_codes', JSON.stringify(updatedCodes))
    
    setNewCode('')
    setClientName('')
    setShowAddForm(false)
  }

  const handleDeleteCode = (codeToDelete) => {
    if (!window.confirm(`¿Eliminar el código ${codeToDelete}?`)) return
    
    const updatedCodes = codes.filter(c => c.code !== codeToDelete)
    setCodes(updatedCodes)
    localStorage.setItem('proconing_codes', JSON.stringify(updatedCodes))
  }

  // ==================== FUNCIONES DE RESEÑAS ====================

  const handleDeleteReview = (index) => {
    const review = reviews[index]
    
    if (!window.confirm(`¿Eliminar la reseña de ${review.name}?`)) return
    
    const updatedReviews = reviews.filter((_, i) => i !== index)
    setReviews(updatedReviews)
    localStorage.setItem('proconing_reviews', JSON.stringify(updatedReviews))
    
    const updatedUsedCodes = usedCodes.filter(code => code !== review.code)
    setUsedCodes(updatedUsedCodes)
    localStorage.setItem('proconing_used_codes', JSON.stringify(updatedUsedCodes))
    
    alert('Reseña eliminada. El código ha sido liberado para reutilización.')
  }

  const handleEditReview = (index) => {
    setEditingReview({ ...reviews[index], index })
    setShowEditModal(true)
  }

  const handleSaveEdit = () => {
    if (!editingReview.name.trim() || !editingReview.comment.trim()) {
      alert('El nombre y comentario son obligatorios')
      return
    }

    if (editingReview.rating < 1 || editingReview.rating > 5) {
      alert('El rating debe estar entre 1 y 5')
      return
    }

    const updatedReviews = [...reviews]
    updatedReviews[editingReview.index] = {
      name: SecurityManager.sanitizeInput(editingReview.name.trim(), 100),
      rating: parseInt(editingReview.rating),
      comment: SecurityManager.sanitizeInput(editingReview.comment.trim(), 1000),
      project: SecurityManager.sanitizeInput(editingReview.project?.trim() || '', 200),
      date: editingReview.date,
      code: editingReview.code
    }

    setReviews(updatedReviews)
    localStorage.setItem('proconing_reviews', JSON.stringify(updatedReviews))
    setShowEditModal(false)
    setEditingReview(null)
  }

  const handleExportReviews = () => {
    const data = {
      reviews,
      exportDate: new Date().toISOString(),
      totalReviews: reviews.length,
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `proconing-reviews-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportCodesData = () => {
    const data = {
      codes,
      usedCodes,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `proconing-codes-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.project && review.project.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating)
    
    return matchesSearch && matchesRating
  })

  // ==================== UI DE LOADING ====================

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

  // ==================== UI DE LOGIN ====================

  if (!user) {
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
            <p className="text-gray-600 mt-2">Autenticación segura con Firebase</p>
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

            <div className="text-center text-xs text-gray-500 mt-4 space-y-1">
              <p>🔐 Autenticación con Firebase</p>
              <p>🔒 Conexión segura SSL/TLS</p>
              <p>✅ Protección contra ataques</p>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // ==================== UI PRINCIPAL ====================

  const availableCodes = codes.filter(c => !usedCodes.includes(c.code))
  const usedCodesData = codes.filter(c => usedCodes.includes(c.code))

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Mensaje de importación */}
        {importMessage.message && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            importMessage.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {importMessage.message}
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-gray-600 mt-1">
                Conectado como: <span className="font-semibold">{user.email}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => window.location.href = '/#/inicio'}
                variant="outline"
              >
                ← Volver al sitio
              </Button>
              <Button onClick={handleLogout} variant="outline">
                🔒 Cerrar sesión
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('codes')}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === 'codes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Códigos ({codes.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === 'reviews'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Reseñas ({reviews.length})
            </button>
          </div>
        </div>

        {/* TAB DE CÓDIGOS */}
        {activeTab === 'codes' && (
          <>
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Total de códigos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{codes.length}</p>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Códigos disponibles</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{availableCodes.length}</p>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Códigos usados</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{usedCodesData.length}</p>
              </div>
            </div>

            {/* Acciones */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones</h2>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setShowAddForm(!showAddForm)}>
                  {showAddForm ? 'Cancelar' : 'Agregar código'}
                </Button>
                <Button onClick={() => {
                  setNewCode(generateRandomCode())
                  setShowAddForm(true)
                }} variant="outline">
                  Generar código aleatorio
                </Button>
                <Button onClick={handleExportCodesData} variant="outline">
                  Exportar códigos
                </Button>
                <Button 
                  onClick={() => codesFileInputRef.current?.click()} 
                  variant="outline"
                  className="bg-green-50 hover:bg-green-100 border-green-300"
                >
                  📥 Importar códigos
                </Button>
              </div>

              <input
                ref={codesFileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportCodes}
                className="hidden"
              />

              {showAddForm && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Nuevo código</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Código</label>
                      <input
                        type="text"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                        placeholder="PROC2024"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del cliente (opcional)</label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Juan Pérez"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button onClick={handleAddCode}>Guardar código</Button>
                  </div>
                </div>
              )}
            </div>

            {/* Listas de códigos - igual que antes */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Códigos disponibles ({availableCodes.length})
              </h2>
              {availableCodes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Código</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cliente</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Creado</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {availableCodes.map((code) => (
                        <tr key={code.code} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono font-semibold text-blue-600">{code.code}</td>
                          <td className="px-4 py-3 text-gray-900">{code.clientName}</td>
                          <td className="px-4 py-3 text-gray-600 text-sm">
                            {new Date(code.createdAt).toLocaleDateString('es-CL')}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleDeleteCode(code.code)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No hay códigos disponibles</p>
              )}
            </div>
          </>
        )}

        {/* TAB DE RESEÑAS */}
        {activeTab === 'reviews' && (
          <>
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleExportReviews} variant="outline">
                  Exportar reseñas
                </Button>
                <Button 
                  onClick={() => reviewsFileInputRef.current?.click()} 
                  variant="outline"
                  className="bg-green-50 hover:bg-green-100 border-green-300"
                >
                  📥 Importar reseñas
                </Button>
              </div>

              <input
                ref={reviewsFileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportReviews}
                className="hidden"
              />
            </div>

            {/* Lista de reseñas - igual que antes */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Reseñas ({reviews.length})
              </h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-bold">{review.name}</h3>
                          <p className="text-sm text-gray-600">Rating: {review.rating}★</p>
                          <p className="mt-2">{review.comment}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditReview(index)}
                            className="text-blue-600 hover:underline"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteReview(index)}
                            className="text-red-600 hover:underline"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No hay reseñas</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}