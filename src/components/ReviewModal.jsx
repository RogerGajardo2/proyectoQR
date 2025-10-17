// src/components/ReviewModal.jsx - VERSIÓN SEGURA SIN MOSTRAR INFO DE CÓDIGOS
import { useState, useEffect } from 'react'
import { useCodes } from '../contexts/CodeContext'
import Button from './ui/Button'
import { SecurityManager, reviewRateLimiter } from '../utils/security'
import { logger } from '../utils/logger'

export default function ReviewModal({ onClose, onSubmit }) {
  const [step, setStep] = useState(1)
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    comment: '',
    project: ''
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [hoveredStar, setHoveredStar] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // ✅ Cargar códigos silenciosamente en background
  const { availableCodes, loading: codesLoading, loadCodes, initialized } = useCodes()

  // ✅ Cargar códigos al montar (sin mostrar estado al usuario)
  useEffect(() => {
    if (!initialized) {
      loadCodes().catch(err => {
        logger.error('Error cargando códigos en modal', err)
        // NO mostrar error al usuario, solo loggear
      })
    }
  }, [initialized, loadCodes])

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  // Validación de campos
  const validateField = (name, value) => {
    let error = ''

    if (SecurityManager.detectSpam(value)) {
      return 'Contenido sospechoso detectado'
    }

    switch(name) {
      case 'name':
        if (!value.trim()) {
          error = 'El nombre es obligatorio'
        } else if (value.trim().length < 2) {
          error = 'Mínimo 2 caracteres'
        } else if (value.trim().length > 50) {
          error = 'Máximo 50 caracteres'
        } else if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/i.test(value.trim())) {
          error = 'Solo letras y espacios'
        }
        break

      case 'comment':
        if (!value.trim()) {
          error = 'El comentario es obligatorio'
        } else if (value.trim().length < 10) {
          error = 'Mínimo 10 caracteres'
        } else if (value.trim().length > 500) {
          error = 'Máximo 500 caracteres'
        }
        break

      case 'project':
        if (value.trim() && value.trim().length > 100) {
          error = 'Máximo 100 caracteres'
        } else if (value.trim() && !/^[a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s\-_]+$/i.test(value.trim())) {
          error = 'Caracteres no permitidos'
        }
        break
    }

    return error
  }

  const handleFieldChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    const error = validateField(name, formData[name])
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleCodeSubmit = (e) => {
    e.preventDefault()
    const trimmedCode = SecurityManager.sanitizeInput(code.trim().toUpperCase(), 50)

    if (!trimmedCode) {
      setCodeError('Por favor ingresa un código')
      return
    }

    if (trimmedCode.length < 4) {
      setCodeError('El código debe tener al menos 4 caracteres')
      return
    }

    if (!/^[A-Z0-9]+$/.test(trimmedCode)) {
      setCodeError('Solo letras mayúsculas y números')
      return
    }

    // ✅ VALIDAR código sin mostrar información sobre disponibilidad
    // Esperar a que los códigos estén cargados
    if (codesLoading || !initialized) {
      setCodeError('Validando código... intenta nuevamente')
      return
    }

    // Validar contra códigos disponibles (sin revelar cantidad)
    const isValid = availableCodes && availableCodes.some(c => c.code === trimmedCode)
    
    if (!isValid) {
      // ✅ Mensaje de error genérico - no revela información
      setCodeError('Código inválido o ya usado')
      logger.warn('Código inválido ingresado', { 
        code: trimmedCode.substring(0, 4) + '***' // Log parcial por seguridad
      })
      return
    }

    // Código válido - continuar
    setCodeError('')
    setStep(2)
    logger.info('Código validado exitosamente')
  }

  const validateForm = () => {
    const newErrors = {}

    const nameError = validateField('name', formData.name)
    const commentError = validateField('comment', formData.comment)
    const projectError = validateField('project', formData.project)

    if (nameError) newErrors.name = nameError
    if (commentError) newErrors.comment = commentError
    if (projectError) newErrors.project = projectError

    if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Selecciona una calificación'
    }

    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    setTouched({
      name: true,
      comment: true,
      project: true,
      rating: true
    })

    const newErrors = validateForm()
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0]
      const element = document.getElementById(firstErrorField)
      if (element) {
        element.focus()
      }
      return
    }

    const trimmedCode = code.trim().toUpperCase()
    const limitCheck = reviewRateLimiter.checkLimit(trimmedCode)
    
    if (!limitCheck.allowed) {
      const minutes = Math.ceil((limitCheck.resetTime - Date.now()) / 60000)
      setErrors({ 
        submit: `Límite alcanzado. Intenta en ${minutes} minuto(s)` 
      })
      logger.warn('Rate limit alcanzado para reseñas', { code: trimmedCode })
      return
    }

    setIsSubmitting(true)

    try {
      const review = {
        name: SecurityManager.sanitizeInput(formData.name.trim(), 100),
        rating: parseInt(formData.rating),
        comment: SecurityManager.sanitizeInput(formData.comment.trim(), 1000),
        project: SecurityManager.sanitizeInput(formData.project.trim(), 200),
        date: new Date().toISOString(),
        code: trimmedCode
      }

      reviewRateLimiter.increment(trimmedCode)
      onSubmit(review)
      
      logger.info('Reseña enviada')
    } catch (error) {
      logger.error('Error al enviar reseña', error)
      setErrors({ submit: 'Error al enviar la reseña. Intenta nuevamente.' })
      setIsSubmitting(false)
    }
  }

  const StarInput = () => {
    return (
      <div className="flex gap-1 sm:gap-2 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => {
              setFormData({ ...formData, rating: star })
              setErrors(prev => ({ ...prev, rating: '' }))
            }}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded touch-manipulation p-1"
            aria-label={`${star} estrellas`}
          >
            <svg
              className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 ${
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
      className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-line px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-xl sm:rounded-t-2xl z-10">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-title truncate pr-2">
            {step === 1 ? 'Ingresa tu código' : 'Tu experiencia'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-1 touch-manipulation"
            aria-label="Cerrar"
            disabled={isSubmitting}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 sm:p-6">
          {step === 1 ? (
            // ✅ Paso 1: Código de acceso - SIN mostrar información de disponibilidad
            <form onSubmit={handleCodeSubmit} className="space-y-3 sm:space-y-4">
              <div className="text-center mb-4 sm:mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-2 sm:mb-3">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <p className="text-text text-xs sm:text-sm md:text-base px-2">
                  Necesitas un código único que te fue proporcionado al finalizar tu proyecto.
                </p>
                
                {/* ✅ ELIMINADO: Todo el bloque que mostraba estado de carga y disponibilidad de códigos */}
              </div>

              <div>
                <label htmlFor="code" className="block font-semibold text-title mb-2 text-xs sm:text-sm md:text-base">
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
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border ${
                    codeError ? 'border-red-500 bg-red-50' : 'border-line'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono transition-colors`}
                  maxLength={50}
                  autoComplete="off"
                  aria-invalid={codeError ? 'true' : 'false'}
                  aria-describedby={codeError ? 'code-error' : 'code-help'}
                />
                {codeError ? (
                  <p id="code-error" className="text-red-500 text-xs sm:text-sm mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {codeError}
                  </p>
                ) : (
                  <p id="code-help" className="text-gray-500 text-xs mt-2">
                    Solo letras mayúsculas y números
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full justify-center text-sm sm:text-base py-2.5 sm:py-3"
              >
                Continuar
              </Button>

              <p className="text-xs text-gray-500 text-center">
                ¿No tienes un código? Contáctanos.
              </p>
            </form>
          ) : (
            // Paso 2: Formulario de reseña (sin cambios)
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Nombre */}
              <div>
                <label htmlFor="name" className="block font-semibold text-title mb-2 text-xs sm:text-sm md:text-base">
                  Tu nombre <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  placeholder="Juan Pérez"
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border ${
                    touched.name && errors.name ? 'border-red-500 bg-red-50' : 'border-line'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                  maxLength={50}
                  disabled={isSubmitting}
                  aria-invalid={touched.name && errors.name ? 'true' : 'false'}
                />
                {touched.name && errors.name && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Rating */}
              <div>
                <label className="block font-semibold text-title mb-2 sm:mb-3 text-center text-xs sm:text-sm md:text-base">
                  Calificación <span className="text-red-500">*</span>
                </label>
                <StarInput />
                <p className="text-center text-xs sm:text-sm text-gray-500 mt-2">
                  {formData.rating === 5 && '⭐ Excelente'}
                  {formData.rating === 4 && '⭐ Muy bueno'}
                  {formData.rating === 3 && '⭐ Bueno'}
                  {formData.rating === 2 && '⭐ Regular'}
                  {formData.rating === 1 && '⭐ Necesita mejorar'}
                </p>
              </div>

              {/* Comentario */}
              <div>
                <label htmlFor="comment" className="block font-semibold text-title mb-2 text-xs sm:text-sm md:text-base">
                  Tu reseña <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => handleFieldChange('comment', e.target.value)}
                  onBlur={() => handleBlur('comment')}
                  placeholder="Cuéntanos sobre tu experiencia..."
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border ${
                    touched.comment && errors.comment ? 'border-red-500 bg-red-50' : 'border-line'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] sm:min-h-[120px] resize-y transition-colors`}
                  maxLength={500}
                  disabled={isSubmitting}
                  aria-invalid={touched.comment && errors.comment ? 'true' : 'false'}
                />
                <div className="flex justify-between items-start mt-1">
                  <div className="flex-1">
                    {touched.comment && errors.comment ? (
                      <p className="text-red-500 text-xs sm:text-sm flex items-start gap-1">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{errors.comment}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">Mínimo 10 caracteres</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 ml-2 flex-shrink-0">
                    {formData.comment.length}/500
                  </p>
                </div>
              </div>

              {/* Proyecto (opcional) */}
              <div>
                <label htmlFor="project" className="block font-semibold text-title mb-2 text-xs sm:text-sm md:text-base">
                  Proyecto (opcional)
                </label>
                <input
                  id="project"
                  type="text"
                  value={formData.project}
                  onChange={(e) => handleFieldChange('project', e.target.value)}
                  onBlur={() => handleBlur('project')}
                  placeholder="Ej: Casa Moderna 2024"
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border ${
                    touched.project && errors.project ? 'border-red-500 bg-red-50' : 'border-line'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                  maxLength={100}
                  disabled={isSubmitting}
                />
                {touched.project && errors.project && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.project}</p>
                )}
              </div>

              {/* Error de envío */}
              {errors.submit && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-700 text-xs sm:text-sm">{errors.submit}</p>
                </div>
              )}

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setStep(1)
                    setTouched({})
                    setErrors({})
                  }}
                  className="w-full sm:flex-1 justify-center text-sm sm:text-base py-2.5 sm:py-3"
                  disabled={isSubmitting}
                >
                  Volver
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:flex-1 justify-center text-sm sm:text-base py-2.5 sm:py-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      <span className="hidden sm:inline">Publicando...</span>
                      <span className="sm:hidden">...</span>
                    </span>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Publicar reseña</span>
                      <span className="sm:hidden">Publicar</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}