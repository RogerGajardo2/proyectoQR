// src/components/admin/AdminCodes/AdminComponents.jsx - VERSIÓN RESPONSIVA
import Button from '../../ui/Button'

export function AdminHeader({ user, onLogout }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3 sm:mb-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Panel de Administración</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">
            <span className="hidden sm:inline">Conectado como: </span>
            <span className="font-semibold">{user.email}</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            onClick={() => window.location.href = '/#/inicio'}
            variant="outline"
            className="w-full sm:w-auto justify-center text-sm sm:text-base"
          >
            <span className="hidden sm:inline">← Volver al sitio</span>
            <span className="sm:hidden">← Sitio</span>
          </Button>
          <Button 
            onClick={onLogout} 
            variant="outline"
            className="w-full sm:w-auto justify-center text-sm sm:text-base"
          >
            🔒 Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  )
}

export function AdminTabs({ activeTab, onTabChange }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-6 mb-4 sm:mb-6">
      <div className="flex gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => onTabChange('codes')}
          className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 sm:py-3 font-semibold text-sm sm:text-base whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'codes'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <span className="hidden sm:inline">Códigos</span>
          <span className="sm:hidden">🔑 Códigos</span>
        </button>
        <button
          onClick={() => onTabChange('reviews')}
          className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 sm:py-3 font-semibold text-sm sm:text-base whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'reviews'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <span className="hidden sm:inline">Reseñas</span>
          <span className="sm:hidden">⭐ Reseñas</span>
        </button>
      </div>
    </div>
  )
}

export function ImportMessage({ message }) {
  if (!message.message) return null

  return (
    <div className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto max-w-md z-50 p-3 sm:p-4 rounded-lg shadow-lg ${
      message.type === 'success' 
        ? 'bg-green-100 text-green-800 border border-green-300' 
        : 'bg-red-100 text-red-800 border border-red-300'
    }`}>
      <p className="text-sm sm:text-base">{message.message}</p>
    </div>
  )
}

export function StatsCard({ label, value, variant = 'default' }) {
  const colors = {
    default: 'bg-white text-gray-900 border-gray-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    danger: 'bg-red-50 text-red-700 border-red-200'
  }

  return (
    <div className={`rounded-xl shadow p-4 sm:p-6 border ${colors[variant]}`}>
      <p className="text-xs sm:text-sm font-medium opacity-80">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold mt-1">{value}</p>
    </div>
  )
}

export default { AdminHeader, AdminTabs, ImportMessage, StatsCard }