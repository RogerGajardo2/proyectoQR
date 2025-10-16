// src/components/admin/AdminCodes/AdminHeader.jsx
import Button from '../../ui/Button'

export function AdminHeader({ user, onLogout }) {
  return (
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
          <Button onClick={onLogout} variant="outline">
            🔒 Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  )
}

// src/components/admin/AdminCodes/AdminTabs.jsx
export function AdminTabs({ activeTab, onTabChange }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => onTabChange('codes')}
          className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'codes'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Códigos
        </button>
        <button
          onClick={() => onTabChange('reviews')}
          className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'reviews'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Reseñas
        </button>
      </div>
    </div>
  )
}

// src/components/admin/AdminCodes/ImportMessage.jsx
export function ImportMessage({ message }) {
  if (!message.message) return null

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
      message.type === 'success' 
        ? 'bg-green-100 text-green-800 border border-green-300' 
        : 'bg-red-100 text-red-800 border border-red-300'
    }`}>
      {message.message}
    </div>
  )
}

// src/components/admin/AdminCodes/StatsCard.jsx
export function StatsCard({ label, value, variant = 'default' }) {
  const colors = {
    default: 'bg-white text-gray-900',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    danger: 'bg-red-50 text-red-700 border-red-200'
  }

  return (
    <div className={`rounded-xl shadow p-6 border ${colors[variant]}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  )
}

export default { AdminHeader, AdminTabs, ImportMessage, StatsCard }