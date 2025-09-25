import { useState } from 'react'
import Button from './ui/Button'

export default function Contact(){
  const [status, setStatus] = useState({ type: 'idle', msg: '' })
  const [errors, setErrors] = useState({})

  // Función para validar el formulario
  function validateForm(formData) {
    const errors = {}
    
    const nombre = (formData.get('name') || '').toString().trim()
    const email = (formData.get('email') || '').toString().trim()
    const phone = (formData.get('phone') || '').toString().trim()
    const message = (formData.get('message') || '').toString().trim()

    // Validación del nombre
    if (!nombre) {
      errors.name = 'El nombre es obligatorio'
    } else if (nombre.length > 50) {
      errors.name = 'El nombre no puede exceder 50 caracteres'
    }

    // Validación del email
    if (!email) {
      errors.email = 'El correo electrónico es obligatorio'
    } else {
      // Expresión regular para validar correos con dominios específicos
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(cl|com|org)$/i
      if (!emailRegex.test(email)) {
        errors.email = 'Ingresa un correo válido con terminación .cl, .com o .org'
      }
    }

    // Validación del teléfono (opcional, pero si se ingresa debe cumplir formato)
    if (phone) {
      // Verificar que empiece con +56
      if (!phone.startsWith('+56')) {
        errors.phone = 'El teléfono debe comenzar con +56'
      } else if (phone.length > 20) {
        errors.phone = 'El teléfono no puede exceder 20 caracteres'
      } else {
        // Verificar que después de +56 solo contenga números y espacios
        const phoneNumbers = phone.slice(3).replace(/\s/g, '') // Remover +56 y espacios
        if (!/^\d+$/.test(phoneNumbers)) {
          errors.phone = 'El teléfono solo debe contener números después de +56'
        }
      }
    }

    // Validación del mensaje
    if (!message) {
      errors.message = 'El mensaje es obligatorio'
    } else if (message.length > 800) {
      errors.message = 'El mensaje no puede exceder 800 caracteres'
    }

    return errors
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

    // Validar formulario
    const validationErrors = validateForm(fd)
    setErrors(validationErrors)

    // Si hay errores, no continuar
    if (Object.keys(validationErrors).length > 0) {
      setStatus({ type: 'error', msg: 'Por favor corrige los errores del formulario' })
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
        phone, 
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
        setStatus({ type: 'ok', msg: '¡Mensaje enviado! Te responderemos a la brevedad.' })
        setErrors({}) // Limpiar errores
        form.reset() 
      } else { 
        throw new Error(result.message || 'No se pudo enviar el formulario.') 
      }
    } catch (err){ 
      console.error(err)
      setStatus({ type: 'error', msg: 'Hubo un problema al enviar. Intenta nuevamente o escríbenos a contacto@proconing.cl' }) 
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
            <form onSubmit={onSubmit} className="grid gap-3" autoComplete="on">
              <input type="text" name="botcheck" className="sr-only" tabIndex="-1" aria-hidden="true" />
              
              {/* Campo Nombre */}
              <label className="font-semibold text-title" htmlFor="name">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input 
                id="name" 
                name="name" 
                type="text" 
                placeholder="Tu nombre" 
                required 
                maxLength="50"
                className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-500' : 'border-line'}`}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              
              {/* Campo Email */}
              <label className="font-semibold text-title" htmlFor="email">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="tu@correo.cl" 
                required 
                className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-line'}`}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              
              {/* Campo Teléfono */}
              <label className="font-semibold text-title" htmlFor="phone">Teléfono</label>
              <input 
                id="phone" 
                name="phone" 
                type="tel" 
                placeholder="+56 9 1234 5678" 
                maxLength="20"
                pattern="\+56[0-9\s]*"
                className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-line'}`}
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              <p className="text-gray-500 text-xs">+56 seguido del número</p>
              
              {/* Campo Mensaje */}
              <label className="font-semibold text-title" htmlFor="message">
                Mensaje <span className="text-red-500">*</span>
              </label>
              <textarea 
                id="message" 
                name="message" 
                placeholder="Cuéntanos brevemente tu necesidad" 
                required 
                maxLength="800"
                className={`min-h-[120px] w-full px-4 py-3 rounded-xl border ${errors.message ? 'border-red-500' : 'border-line'}`}
              />
              {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
              <p className="text-gray-500 text-xs">Máximo 800 caracteres</p>
              
              <Button 
                type="submit" 
                disabled={status.type==='loading'} 
                className="mt-2 w-full justify-center rounded-xl"
              >
                {status.type==='loading' ? 'Enviando…' : 'Enviar'}
              </Button>
              
              <div className={`text-sm ${status.type==='error'?'text-red-600':status.type==='ok'?'text-subtitle':'text-text'}`}>
                {status.msg}
              </div>
            </form>
          </div>

          {/* Cuadro de datos */}
          <aside className="bg-white border border-line rounded-2xl p-5 shadow-soft grid gap-3" data-reveal>
            <h3 className="text-title text-xl font-bold">Datos</h3>
            <div className="flex items-center gap-3">
              <span>📧</span>
              <a href="mailto:contacto@proconing.cl">contacto@proconing.cl</a>
            </div>
            <div className="flex items-center gap-3">
              <span>📱</span>
              <a href="tel:+56973495086">+569 7349 5086</a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}