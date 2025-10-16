// src/components/AdminCodes.jsx (CON CRUD DE RESEÑAS)
import { useState, useEffect } from 'react'
import Button from './ui/Button'

const ADMIN_PASSWORD = 'ProconIng2025' // Cambiar por una contraseña segura

export default function AdminCodes() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [activeTab, setActiveTab] = useState('codes') // 'codes' o 'reviews'
  
  // Estados para códigos
  const [codes, setCodes] = useState([])
  const [usedCodes, setUsedCodes] = useState([])
  const [newCode, setNewCode] = useState('')
  const [clientName, setClientName] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  
  // Estados para reseñas
  const [reviews, setReviews] = useState([])
  const [editingReview, setEditingReview] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRating, setFilterRating] = useState('all')

  // Cargar datos al autenticarse
  useEffect(() => {
    if (authenticated) {
      loadAllData()
    }
  }, [authenticated])

  const loadAllData = () => {
    const savedCodes = JSON.parse(localStorage.getItem('proconing_codes') || '[]')
    const savedUsedCodes = JSON.parse(localStorage.getItem('proconing_used_codes') || '[]')
    const savedReviews = JSON.parse(localStorage.getItem('proconing_reviews') || '[]')
    
    setCodes(savedCodes)
    setUsedCodes(savedUsedCodes)
    setReviews(savedReviews)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
      setPasswordError('')
    } else {
      setPasswordError('Contraseña incorrecta')
    }
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

    const code = newCode.trim().toUpperCase()
    
    if (codes.some(c => c.code === code)) {
      alert('Este código ya existe')
      return
    }

    const newCodeObj = {
      code,
      clientName: clientName.trim() || 'Sin nombre',
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
    
    // Liberar el código para que se pueda usar de nuevo
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
      name: editingReview.name.trim(),
      rating: parseInt(editingReview.rating),
      comment: editingReview.comment.trim(),
      project: editingReview.project?.trim() || '',
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
      totalReviews: reviews.length
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
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `proconing-codes-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Filtrar reseñas
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.project && review.project.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating)
    
    return matchesSearch && matchesRating
  })

  // ==================== COMPONENTE DE LOGIN ====================

  if (!authenticated) {
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
            <p className="text-gray-600 mt-2">Gestión de códigos y reseñas</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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
                  setPasswordError('')
                }}
                className={`w-full px-4 py-3 rounded-xl border ${
                  passwordError ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Ingresa la contraseña"
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-2">{passwordError}</p>
              )}
            </div>

            <Button type="submit" className="w-full justify-center">
              Acceder
            </Button>
          </form>
        </div>
      </div>
    )
  }

  // ==================== COMPONENTE PRINCIPAL ====================

  const availableCodes = codes.filter(c => !usedCodes.includes(c.code))
  const usedCodesData = codes.filter(c => usedCodes.includes(c.code))

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header con tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-gray-600 mt-1">Gestiona códigos y reseñas</p>
            </div>
            <Button onClick={() => setAuthenticated(false)} variant="outline">
              Cerrar sesión
            </Button>
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

        {/* ==================== TAB DE CÓDIGOS ==================== */}
        {activeTab === 'codes' && (
          <>
            {/* Estadísticas de códigos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total de códigos</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{codes.length}</p>
                  </div>
                  <div className="bg-blue-100 rounded-full p-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Códigos disponibles</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{availableCodes.length}</p>
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Códigos usados</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">{usedCodesData.length}</p>
                  </div>
                  <div className="bg-red-100 rounded-full p-3">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones de códigos */}
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
              </div>

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

            {/* Lista de códigos disponibles */}
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

            {/* Lista de códigos usados */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Códigos usados ({usedCodesData.length})
              </h2>
              {usedCodesData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Código</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cliente</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Creado</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {usedCodesData.map((code) => (
                        <tr key={code.code} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono font-semibold text-gray-400 line-through">{code.code}</td>
                          <td className="px-4 py-3 text-gray-900">{code.clientName}</td>
                          <td className="px-4 py-3 text-gray-600 text-sm">
                            {new Date(code.createdAt).toLocaleDateString('es-CL')}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Usado
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No hay códigos usados</p>
              )}
            </div>
          </>
        )}

        {/* ==================== TAB DE RESEÑAS ==================== */}
        {activeTab === 'reviews' && (
          <>
            {/* Estadísticas de reseñas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{reviews.length}</p>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Promedio</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {reviews.length > 0
                    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                    : '0.0'}
                  <span className="text-lg">★</span>
                </p>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <p className="text-gray-600 text-sm font-medium">5 Estrellas</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {reviews.filter(r => r.rating === 5).length}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <p className="text-gray-600 text-sm font-medium">Última reseña</p>
                <p className="text-sm text-gray-900 mt-1">
                  {reviews.length > 0
                    ? new Date(Math.max(...reviews.map(r => new Date(r.date)))).toLocaleDateString('es-CL')
                    : 'N/A'}
                </p>
              </div>
            </div>

            {/* Filtros y acciones */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, comentario o proyecto..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por rating</label>
                  <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todas</option>
                    <option value="5">5 ★</option>
                    <option value="4">4 ★</option>
                    <option value="3">3 ★</option>
                    <option value="2">2 ★</option>
                    <option value="1">1 ★</option>
                  </select>
                </div>
                <Button onClick={handleExportReviews} variant="outline">
                  Exportar reseñas
                </Button>
              </div>
            </div>

            {/* Lista de reseñas */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Reseñas ({filteredReviews.length})
              </h2>
              {filteredReviews.length > 0 ? (
                <div className="space-y-4">
                  {filteredReviews.map((review, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-gray-900">{review.name}</h3>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-5 h-5 ${
                                    star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 mb-2">{review.comment}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span>📅 {new Date(review.date).toLocaleDateString('es-CL')}</span>
                            {review.project && <span>🏗️ {review.project}</span>}
                            <span>🔑 {review.code}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditReview(reviews.indexOf(review))}
                            className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteReview(reviews.indexOf(review))}
                            className="px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {searchTerm || filterRating !== 'all' ? 'No se encontraron reseñas con esos filtros' : 'No hay reseñas'}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal de edición */}
      {showEditModal && editingReview && (
        <div
          className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-gray-900">Editar Reseña</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Cerrar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-4">
              {/* Nombre */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingReview.name}
                  onChange={(e) => setEditingReview({ ...editingReview, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del cliente"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Calificación <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditingReview({ ...editingReview, rating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <svg
                        className={`w-10 h-10 ${
                          star <= editingReview.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* Comentario */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Comentario <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={editingReview.comment}
                  onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-y"
                  placeholder="Comentario del cliente"
                />
              </div>

              {/* Proyecto */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Proyecto (opcional)
                </label>
                <input
                  type="text"
                  value={editingReview.project || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, project: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del proyecto"
                />
              </div>

              {/* Información adicional (solo lectura) */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-700 mb-2">Información adicional</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Código:</strong> {editingReview.code}</p>
                  <p><strong>Fecha:</strong> {new Date(editingReview.date).toLocaleString('es-CL')}</p>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowEditModal(false)}
                  variant="outline"
                  className="flex-1 justify-center"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  className="flex-1 justify-center"
                >
                  Guardar cambios
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}