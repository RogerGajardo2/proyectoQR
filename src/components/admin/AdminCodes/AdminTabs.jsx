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