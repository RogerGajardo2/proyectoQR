// src/components/Contact.jsx - CON HCAPTCHA (Web3Forms nativo)
import { useState, useEffect, useRef } from 'react'
import Button from './ui/Button'
import { SecurityManager, formRateLimiter } from '../utils/security'
import { logger } from '../utils/logger'

export default function Contact(){
  const [status, setStatus] = useState({ type: 'idle', msg: '' })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [csrfToken] = useState(() => SecurityManager.generateCSRFToken())
  const [hcaptchaToken, setHcaptchaToken] = useState(null)
  const [hcaptchaLoaded, setHcaptchaLoaded] = useState(false)
  const hcaptchaRef = useRef(null)
  const widgetIdRef = useRef(null)

  useEffect(() => {
    sessionStorage.setItem('csrf_token', csrfToken)
  }, [csrfToken])

  // Inicializar hCaptcha cuando el script esté cargado
  useEffect(() => {
    const initHcaptcha = () => {
      if (window.hcaptcha && hcaptchaRef.current && !widgetIdRef.current) {
        try {
          widgetIdRef.current = window.hcaptcha.render(hcaptchaRef.current, {
            sitekey: '50b2fe65-b00b-4b9e-ad62-3ba471098be2', // Sitekey de prueba de hCaptcha
            callback: (token) => {
              setHcaptchaToken(token)
              logger.info('hCaptcha token recibido')
            },
            'error-callback': () => {
              setHcaptchaToken(null)
              logger.error('Error en hCaptcha')
            },
            'expired-callback': () => {
              setHcaptchaToken(null)
              logger.warn('hCaptcha token expirado')
            },
            theme: 'light',
            size: 'normal'
          })
          setHcaptchaLoaded(true)
          logger.info('hCaptcha inicializado')
        } catch (error) {
          logger.error('Error inicializando hCaptcha', error)
        }
      }
    }

    // Verificar si hCaptcha ya está cargado
    if (window.hcaptcha) {
      initHcaptcha()
    } else {
      // Esperar a que se cargue el script
      const checkHcaptcha = setInterval(() => {
        if (window.hcaptcha) {
          clearInterval(checkHcaptcha)
          initHcaptcha()
        }
      }, 100)

      // Timeout después de 10 segundos
      setTimeout(() => clearInterval(checkHcaptcha), 10000)

      return () => clearInterval(checkHcaptcha)
    }
  }, [])

  // Resetear hCaptcha después de envío exitoso
  const resetHcaptcha = () => {
    if (window.hcaptcha && widgetIdRef.current !== null) {
      try {
        window.hcaptcha.reset(widgetIdRef.current)
        setHcaptchaToken(null)
        logger.info('hCaptcha reseteado')
      } catch (error) {
        logger.error('Error reseteando hCaptcha', error)
      }
    }
  }

  // Función para validar el formulario en tiempo real
  function validateField(name, value) {
    let error = ''
    
    // Detectar scripts maliciosos
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi
    ]
    
    if (dangerousPatterns.some(pattern => pattern.test(value))) {
      return 'Contenido no permitido detectado'
    }

    // Detectar spam
    if (SecurityManager.detectSpam(value)) {
      return 'Contenido sospechoso detectado'
    }
    
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
        } else if (!SecurityManager.validateEmail(value)) {
          error = 'Ingresa un correo electrónico válido'
        }
        break

      case 'phone':
        if (value.trim()) {
          if (!SecurityManager.validateChileanPhone(value)) {
            error = 'Formato de teléfono chileno inválido (ej: +56912345678)'
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
    
    // Verificación anti-bot (campo oculto)
    if (fd.get('botcheck')){ 
      setStatus({ type: 'error', msg: 'Error: validación anti-bot.' })
      logger.warn('Intento de bot detectado', { botcheck: fd.get('botcheck') })
      return 
    }

    // Verificación honeypot adicional
    if (fd.get('website')) {
      setStatus({ type: 'error', msg: 'Spam detectado' })
      logger.warn('Honeypot activado', { website: fd.get('website') })
      return
    }

    // Verificar CSRF token
    const submittedToken = fd.get('csrf_token')
    if (!SecurityManager.validateCSRFToken(submittedToken)) {
      setStatus({ type: 'error', msg: 'Token de seguridad inválido. Recarga la página.' })
      logger.error('CSRF token inválido', { submitted: submittedToken })
      return
    }

    // ✅ Verificar hCaptcha token
    if (!hcaptchaToken) {
      setStatus({ type: 'error', msg: 'Por favor completa la verificación de seguridad (hCaptcha)' })
      logger.warn('Intento de envío sin token de hCaptcha')
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
      const firstErrorField = Object.keys(validationErrors)[0]
      const element = document.getElementById(firstErrorField)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.focus()
      }
      return
    }

    // Verificar rate limiting
    const email = (fd.get('email') || '').toString().trim()
    const limitCheck = formRateLimiter.checkLimit(email)
    
    if (!limitCheck.allowed) {
      const minutes = Math.ceil((limitCheck.resetTime - Date.now()) / 60000)
      setStatus({ 
        type: 'error', 
        msg: `Has alcanzado el límite de envíos. Intenta en ${minutes} minuto(s)` 
      })
      logger.warn('Rate limit alcanzado para formulario', { email })
      return
    }

    const nombre = SecurityManager.sanitizeInput((fd.get('name')||'').toString().trim(), 50)
    const emailSanitized = SecurityManager.sanitizeInput(email, 100)
    const phone = SecurityManager.sanitizeInput((fd.get('phone')||'').toString().trim(), 20)
    const message = SecurityManager.sanitizeInput((fd.get('message')||'').toString().trim(), 800)

    setStatus({ type: 'loading', msg: 'Enviando…' })
    
    try{
      const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || 'YOUR_ACCESS_KEY_HERE'
      
      if (ACCESS_KEY === 'YOUR_ACCESS_KEY_HERE') {
        throw new Error('Clave de API no configurada')
      }

      const payload = { 
        access_key: ACCESS_KEY, 
        subject: 'Nueva consulta — ProconIng', 
        from_name: nombre, 
        from_email: emailSanitized, 
        phone: phone || 'No proporcionado', 
        message,
        // ✅ Agregar token de hCaptcha
        'h-captcha-response': hcaptchaToken
      }
      
      const res = await fetch('https://api.web3forms.com/submit', { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json' 
        }, 
        body: JSON.stringify(payload) 
      })
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const result = await res.json()
      
      if (result.success){ 
        setStatus({ 
          type: 'ok', 
          msg: '¡Mensaje enviado exitosamente! Te responderemos a la brevedad.' 
        })
        setErrors({})
        setTouched({})
        form.reset()
        
        // Incrementar contador de rate limiting
        formRateLimiter.increment(email)
        
        // ✅ Resetear hCaptcha
        resetHcaptcha()
        
        logger.info('Formulario de contacto enviado', { email: emailSanitized })
        
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
      logger.error('Error al enviar formulario de contacto', err)
      setStatus({ 
        type: 'error', 
        msg: 'Hubo un problema al enviar. Intenta nuevamente o escríbenos directamente a contacto@proconing.cl' 
      })
      
      // Resetear hCaptcha en caso de error
      resetHcaptcha()
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
              {/* Campo anti-bot oculto */}
              <input 
                type="text" 
                name="botcheck" 
                className="sr-only" 
                tabIndex="-1" 
                aria-hidden="true" 
              />
              
              {/* Honeypot adicional */}
              <input 
                type="text" 
                name="website" 
                tabIndex="-1" 
                autoComplete="off"
                style={{ position: 'absolute', left: '-9999px' }}
                aria-hidden="true"
              />

              {/* CSRF Token */}
              <input type="hidden" name="csrf_token" value={csrfToken} />
              
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

              {/* ✅ Widget de hCaptcha */}
              <div className="flex flex-col items-center gap-2 py-3">
                <div 
                  ref={hcaptchaRef}
                  className="h-captcha"
                  data-sitekey="c1badf3e-d56c-4d60-b8be-df20408cdccc"
                />
                {!hcaptchaLoaded && (
                  <p className="text-xs text-gray-500">
                    Cargando verificación de seguridad...
                  </p>
                )}
                {hcaptchaLoaded && !hcaptchaToken && (
                  <p className="text-xs text-blue-600">
                    ✓ Por favor completa la verificación de seguridad
                  </p>
                )}
              </div>
              
              <Button 
                type="submit" 
                disabled={status.type==='loading' || !hcaptchaToken} 
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
                  <a className="text-subtitle font-semibold">
                    contacto@proconing.cl
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="text-xs text-gray-500">Teléfono</p>
                  <a className="text-subtitle font-semibold">
                    +569 7349 5086
                  </a>
                </div>
              </div>
            </div>
          
          </aside>
        </div>
      </div>
    </section>
  )
}