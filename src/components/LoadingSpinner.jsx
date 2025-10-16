// src/components/LoadingSpinner.jsx
export default function LoadingSpinner({ size = 'md', fullScreen = false, text = 'Cargando...' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  }
  
  const spinner = (
    <div 
      className={`inline-block animate-spin rounded-full border-blue-500 border-t-transparent ${sizes[size]}`}
      role="status"
      aria-label={text}
    >
      <span className="sr-only">{text}</span>
    </div>
  )
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div className="text-center">
          {spinner}
          <p className="mt-4 text-gray-600 font-medium">{text}</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex items-center justify-center gap-2">
      {spinner}
      {text && <span className="text-gray-600 text-sm">{text}</span>}
    </div>
  )
}