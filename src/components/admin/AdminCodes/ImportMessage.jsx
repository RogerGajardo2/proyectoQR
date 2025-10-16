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