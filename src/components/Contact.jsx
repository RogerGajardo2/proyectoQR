// src/components/Contact.jsx (CON VALIDACIONES MEJORADAS)
import { useState } from 'react'
import Button from './ui/Button'

export default function Contact(){
  const [status, setStatus] = useState({ type: 'idle', msg: '' })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Función para validar el formulario en tiempo real
  function validateField(name, value) {
    let error = ''
    
    switch(name) {
      case 'name':
        if (!value.trim()) {
          error = 'El nombre es obligatorio'
        } else if (value.trim().length < 2) {
          error = 'El nombre debe tener al menos 2 caracteres'
        } else if (value.trim().length > 50) {
          error = 'El nombre no puede exceder 50 caracteres'
        } else if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/i.test(value.trim())) {
          error = 'El nombre solo puede contener letras y espacios'
        }
        break

      case 'email':
        if (!value.trim()) {
          error = 'El correo electrónico es obligatorio'
        } else {
          // Validación mejorada de email
          const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
          if (!emailRegex.test(value.trim())) {
            error = 'Ingresa un correo electrónico válido'
          } else if (value.trim().length > 100) {
            error = 'El correo no puede exceder 100 caracteres'
          }
        }
        break

      case 'phone':
        if (value.trim()) {
          // Si se proporciona teléfono, validarlo
          const phoneClean = value.trim().replace(/\s/g, '')
          
          if (!phoneClean.startsWith('+56')) {
            error = 'El teléfono debe comenzar con +56'
          } else if (phoneClean.length < 11 || phoneClean.length > 13) {
            error = 'El teléfono debe tener entre 11 y 13 dígitos (ej: +56912345678)'
          } else {
            const numbersOnly = phoneClean.slice(3)
            if (!/^\d+$/.test(numbersOnly)) {
              error = 'El teléfono solo debe contener números después de +56'
            } else if (!['9', '2'].includes(numbersOnly[0])) {
              error = 'El teléfono debe empezar con 9 (móvil) o 2 (fijo) después de +56'
            }
          }
        }
        break

      case 'message':
        if (!value.trim()) {
          error = 'El mensaje es obligatorio'
        } else if (value.trim().length < 10) {
          error = 'El mensaje debe tener al menos 10 caracteres'
        } else if (value.trim().length > 800) {
          error = 'El mensaje no puede exceder 800 caracteres'
        } else {
          // Detectar spam o contenido sospechoso
          const spamPatterns = [
            /viagra|cialis|casino|lottery|winner/i,
            /(https?:\/\/[^\s]+){3,}/g, // Múltiples URLs
            /([A-Z]{10,})/g, // Muchas mayúsculas seguidas
          ]
          
          if (spamPatterns.some(pattern => pattern.test(value))) {
            error = 'El mensaje contiene contenido no permitido'
          }
        }
        break
    }
    
    return error
  }

  // Validar todos los campos
  function validateForm(formData) {
    const errors = {}
    
    const nombre = (formData.get('name') || '').toString()
    const email = (formData.get('email') || '').toString()
    const phone = (formData.get('phone') || '').toString()
    const message = (formData.get('message') || '').toString()

    const nameError = validateField('name', nombre)
    const emailError = validateField('email', email)
    const phoneError = validateField('phone', phone)
    const messageError = validateField('message', message)

    if (nameError) errors.name = nameError
    if (emailError) errors.email = emailError
    if (phoneError) errors.phone = phoneError
    if (messageError) errors.message = messageError

    return errors
  }

  // Manejar cambio de campo
  const handleFieldChange = (e) => {
    const { name, value } = e.target
    
    // Validar campo actual
    const error = validateField(name, value)
    
    setErrors(prev => ({
      ...prev,
      [name]: error
    }))
  }

  // Manejar blur (cuando el usuario sale del campo)
  const handleBlur = (e) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
  }

  async function onSubmit(e){
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    
    // Verificación anti-bot
    if (fd.get('botcheck')){ 
      setStatus({ type: 'error', msg: 'Error: validación anti-bot.' })
      return 
    }

    // Validar formulario completo
    const validationErrors = validateForm(fd)
    setErrors(validationErrors)

    // Marcar todos los campos como tocados
    setTouched({
      name: true,
      email: true,
      phone: true,
      message: true
    })

    // Si hay errores, no continuar
    if (Object.keys(validationErrors).length > 0) {
      setStatus({ type: 'error', msg: 'Por favor corrige los errores del formulario' })
      // Hacer scroll al primer error
      const firstErrorField = Object.keys(validationErrors)[0]
      const element = document.getElementById(firstErrorField)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.focus()
      }
      return
    }

    const nombre = (fd.get('name')||'').toString().trim()
    const email = (fd.get('email')||'').toString().trim()
    const phone = (fd.get('phone')||'').toString().trim()
    const message = (fd.get('message')||'').toString().trim()

    setStatus({ type: 'loading', msg: 'Enviando…' })
    
    try{
      const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || 'YOUR_ACCESS_KEY_HERE'
      const payload = { 
        access_key: ACCESS_KEY, 
        subject: 'Nueva consulta — ProconIng', 
        from_name: nombre, 
        from_email: email, 
        phone: phone || 'No proporcionado', 
        message 
      }
      
      const res = await fetch('https://api.web3forms.com/submit', { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json' 
        }, 
        body: JSON.stringify(payload) 
      })
      
      const result = await res.json()
      
      if (result.success){ 
        setStatus({ type: 'ok', msg: '¡Mensaje enviado exitosamente! Te responderemos a la brevedad.' })
        setErrors({})
        setTouched({})
        form.reset() 
        
        // Scroll al mensaje de éxito
        setTimeout(() => {
          const statusElement = document.querySelector('.contact-status-message')
          if (statusElement) {
            statusElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }
        }, 100)
      } else { 
        throw new Error(result.message || 'No se pudo enviar el formulario.') 
      }
    } catch (err){ 
      console.error(err)
      setStatus({ 
        type: 'error', 
        msg: 'Hubo un problema al enviar. Intenta nuevamente o escríbenos directamente a contacto@proconing.cl' 
      }) 
    }
  }

  return (
    <section id="contacto" className="py-16 scroll-mt-24">
      <div className="container">
        <div className="flex items-end justify-between gap-4 pb-4 mb-6 border-b border-line" data-reveal>
          <div>
            <div className="text-subtitle font-bold uppercase tracking-[.14em] text-sm">Contáctanos</div>
            <h2 className="text-title text-3xl font-bold">Hablemos de tu proyecto</h2>
          </div>
          <p className="hidden md:block">Escríbenos y te responderemos a la brevedad.</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white border border-line rounded-2xl p-5 shadow-soft" data-reveal>
            <form onSubmit={onSubmit} className="grid gap-3" autoComplete="on" noValidate>
              <input type="text" name="botcheck" className="sr-only" tabIndex="-1" aria-hidden="true" />
              
              {/* Campo Nombre */}
              <div>
                <label className="font-semibold text-title" htmlFor="name">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input 
                  id="name" 
                  name="name" 
                  type="text" 
                  placeholder="Tu nombre completo" 
                  required 
                  maxLength="50"
                  onChange={handleFieldChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    touched.name && errors.name ? 'border-red-500 bg-red-50' : 'border-line'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                  aria-invalid={touched.name && errors.name ? 'true' : 'false'}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {touched.name && errors.name && (
                  <p id="name-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.name}
                  </p>
                )}
              </div>
              
              {/* Campo Email */}
              <div>
                <label className="font-semibold text-title" htmlFor="email">
                  Correo electrónico <span className="text-red-500">*</span>
                </label>
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="tu@correo.com" 
                  required 
                  maxLength="100"
                  onChange={handleFieldChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    touched.email && errors.email ? 'border-red-500 bg-red-50' : 'border-line'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                  aria-invalid={touched.email && errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {touched.email && errors.email && (
                  <p id="email-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email}
                  </p>
                )}
              </div>
              
              {/* Campo Teléfono */}
              <div>
                <label className="font-semibold text-title" htmlFor="phone">
                  Teléfono (opcional)
                </label>
                <input 
                  id="phone" 
                  name="phone" 
                  type="tel" 
                  placeholder="+56 9 1234 5678" 
                  maxLength="20"
                  onChange={handleFieldChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    touched.phone && errors.phone ? 'border-red-500 bg-red-50' : 'border-line'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                  aria-invalid={touched.phone && errors.phone ? 'true' : 'false'}
                  aria-describedby="phone-help phone-error"
                />
                {touched.phone && errors.phone ? (
                  <p id="phone-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.phone}
                  </p>
                ) : (
                  <p id="phone-help" className="text-gray-500 text-xs mt-1">
                    Formato: +56 seguido del número (ej: +56912345678)
                  </p>
                )}
              </div>
              
              {/* Campo Mensaje */}
              <div>
                <label className="font-semibold text-title" htmlFor="message">
                  Mensaje <span className="text-red-500">*</span>
                </label>
                <textarea 
                  id="message" 
                  name="message" 
                  placeholder="Cuéntanos sobre tu proyecto o consulta" 
                  required 
                  maxLength="800"
                  rows="5"
                  onChange={handleFieldChange}
                  onBlur={handleBlur}
                  className={`min-h-[120px] w-full px-4 py-3 rounded-xl border ${
                    touched.message && errors.message ? 'border-red-500 bg-red-50' : 'border-line'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-y`}
                  aria-invalid={touched.message && errors.message ? 'true' : 'false'}
                  aria-describedby="message-help message-error"
                />
                <div className="flex justify-between items-start mt-1">
                  <div className="flex-1">
                    {touched.message && errors.message ? (
                      <p id="message-error" className="text-red-500 text-sm flex items-center gap-1">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.message}
                      </p>
                    ) : (
                      <p id="message-help" className="text-gray-500 text-xs">
                        Mínimo 10 caracteres
                      </p>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs ml-2 flex-shrink-0">
                    {document.getElementById('message')?.value.length || 0}/800
                  </p>
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={status.type==='loading'} 
                className="mt-2 w-full justify-center rounded-xl"
              >
                {status.type==='loading' ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Enviando…
                  </span>
                ) : 'Enviar Mensaje'}
              </Button>
              
              {status.msg && (
                <div 
                  className={`contact-status-message text-sm p-4 rounded-xl ${
                    status.type==='error'
                      ? 'bg-red-100 text-red-700 border border-red-300'
                      : status.type==='ok'
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'text-text'
                  }`}
                  role="alert"
                >
                  <div className="flex items-start gap-2">
                    {status.type === 'ok' ? (
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : status.type === 'error' ? (
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    ) : null}
                    <span>{status.msg}</span>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Cuadro de datos de contacto */}
          <aside className="bg-white border border-line rounded-2xl p-5 shadow-soft grid gap-3" data-reveal>
            <h3 className="text-title text-xl font-bold">Información de contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <a href="mailto:contacto@proconing.cl" className="text-subtitle font-semibold hover:underline">
                    contacto@proconing.cl
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="text-xs text-gray-500">Teléfono</p>
                  <a href="tel:+56973495086" className="text-subtitle font-semibold hover:underline">
                    +569 7349 5086
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">⏰</span>
                <div>
                  <p className="text-xs text-gray-500">Horario de atención</p>
                  <p className="text-gray-700 font-medium">Lun - Vie: 9:00 - 18:00</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}