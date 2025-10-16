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