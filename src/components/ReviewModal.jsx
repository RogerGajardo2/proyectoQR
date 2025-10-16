// src/components/ReviewModal.jsx
import { useState, useEffect } from 'react'
import Button from './ui/Button'

const VALID_CODES = [
  'PROC2024',
  'CLIENTE001',
  'VIP2025',
  'PREMIUM100'
  // Agrega más códigos según necesites
]

export default function ReviewModal({ onClose, onSubmit }) {
  const [step, setStep] = useState(1) // 1: código, 2: formulario
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    comment: '',
    project: ''
  })
  const [errors, setErrors] = useState({})
  const [hoveredStar, setHoveredStar] = useState(0)

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  // Verificar si el código ya fue usado
  const isCodeUsed = (code) => {
    const usedCodes = JSON.parse(localStorage.getItem('proconing_used_codes') || '[]')
    return usedCodes.includes(code)
  }

  // Marcar código como usado
  const markCodeAsUsed = (code) => {
    const usedCodes = JSON.parse(localStorage.getItem('proconing_used_codes') || '[]')
    usedCodes.push(code)
    localStorage.setItem('proconing_used_codes', JSON.stringify(usedCodes))
  }

  // Validar código
  const handleCodeSubmit = (e) => {
    e.preventDefault()
    const trimmedCode = code.trim().toUpperCase()

    if (!trimmedCode) {
      setCodeError('Por favor ingresa un código')
      return
    }

    if (!VALID_CODES.includes(trimmedCode)) {
      setCodeError('Código inválido. Verifica que esté escrito correctamente.')
      return
    }

    if (isCodeUsed(trimmedCode)) {
      setCodeError('Este código ya ha sido utilizado')
      return
    }

    setCodeError('')
    setStep(2)
  }

  // Validar formulario
  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres'
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'El nombre no puede exceder 50 caracteres'
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'El comentario es obligatorio'
    } else if (formData.comment.trim().length < 10) {
      newErrors.comment = 'El comentario debe tener al menos 10 caracteres'
    } else if (formData.comment.trim().length > 500) {
      newErrors.comment = 'El comentario no puede exceder 500 caracteres'
    }

    if (formData.project && formData.project.length > 100) {
      newErrors.project = 'El nombre del proyecto no puede exceder 100 caracteres'
    }

    return newErrors
  }

  // Enviar reseña
  const handleSubmit = (e) => {
    e.preventDefault()

    const newErrors = validateForm()
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    const review = {
      ...formData,
      name: formData.name.trim(),
      comment: formData.comment.trim(),
      project: formData.project.trim(),
      date: new Date().toISOString(),
      code: code.trim().toUpperCase()
    }

    markCodeAsUsed(code.trim().toUpperCase())
    onSubmit(review)
  }

  // Renderizar estrellas interactivas
  const StarInput = () => {
    return (
      <div className="flex gap-2 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setFormData({ ...formData, rating: star })}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"
            aria-label={`${star} estrellas`}
          >
            <svg
              className={`w-10 h-10 ${
                star <= (hoveredStar || formData.rating)
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              } transition-colors`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-line px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-xl font-bold text-title">
            {step === 1 ? 'Ingresa tu código' : 'Comparte tu experiencia'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {step === 1 ? (
            // Paso 1: Código de acceso
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <p className="text-text">
                  Para dejar una reseña, necesitas un código de acceso único.
                  Este código te fue proporcionado al finalizar tu proyecto.
                </p>
              </div>

              <div>
                <label htmlFor="code" className="block font-semibold text-title mb-2">
                  Código de acceso <span className="text-red-500">*</span>
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase())
                    setCodeError('')
                  }}
                  placeholder="Ej: PROC2024"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    codeError ? 'border-red-500' : 'border-line'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono`}
                  maxLength={20}
                />
                {codeError && (
                  <p className="text-red-500 text-sm mt-2">{codeError}</p>
                )}
              </div>

              <Button type="submit" className="w-full justify-center">
                Continuar
              </Button>

              <p className="text-xs text-gray-500 text-center">
                ¿No tienes un código? Contáctanos para obtener uno.
              </p>
            </form>
          ) : (
            // Paso 2: Formulario de reseña
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <label htmlFor="name" className="block font-semibold text-title mb-2">
                  Tu nombre <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    setErrors({ ...errors, name: '' })
                  }}
                  placeholder="Juan Pérez"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.name ? 'border-red-500' : 'border-line'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  maxLength={50}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-2">{errors.name}</p>
                )}
              </div>

              {/* Rating */}
              <div>
                <label className="block font-semibold text-title mb-3 text-center">
                  Calificación <span className="text-red-500">*</span>
                </label>
                <StarInput />
                <p className="text-center text-sm text-gray-500 mt-2">
                  {formData.rating === 5 && 'Excelente'}
                  {formData.rating === 4 && 'Muy bueno'}
                  {formData.rating === 3 && 'Bueno'}
                  {formData.rating === 2 && 'Regular'}
                  {formData.rating === 1 && 'Malo'}
                </p>
              </div>

              {/* Comentario */}
              <div>
                <label htmlFor="comment" className="block font-semibold text-title mb-2">
                  Tu reseña <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => {
                    setFormData({ ...formData, comment: e.target.value })
                    setErrors({ ...errors, comment: '' })
                  }}
                  placeholder="Cuéntanos sobre tu experiencia con ProconIng..."
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.comment ? 'border-red-500' : 'border-line'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-y`}
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  {errors.comment ? (
                    <p className="text-red-500 text-sm">{errors.comment}</p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Mínimo 10 caracteres
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {formData.comment.length}/500
                  </p>
                </div>
              </div>

              {/* Proyecto (opcional) */}
              <div>
                <label htmlFor="project" className="block font-semibold text-title mb-2">
                  Proyecto (opcional)
                </label>
                <input
                  id="project"
                  type="text"
                  value={formData.project}
                  onChange={(e) => {
                    setFormData({ ...formData, project: e.target.value })
                    setErrors({ ...errors, project: '' })
                  }}
                  placeholder="Ej: Casa Moderna 2024"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.project ? 'border-red-500' : 'border-line'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  maxLength={100}
                />
                {errors.project && (
                  <p className="text-red-500 text-sm mt-2">{errors.project}</p>
                )}
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="flex-1 justify-center"
                >
                  Volver
                </Button>
                <Button
                  type="submit"
                  className="flex-1 justify-center"
                >
                  Publicar reseña
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}