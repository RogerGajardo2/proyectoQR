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