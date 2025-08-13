import { Link } from 'react-router-dom'
import { useEffect } from 'react'

/**
 * Página de perfil/QR (solo por URL).
 * - Añade <meta name="robots" content="noindex, nofollow"> mientras esta ruta está montada
 * - Botón "Mi web" vuelve a la landing "/"
 * - Botón "Enviar Correo" intenta mailto y ofrece fallback (copiar email / abrir Gmail)
 */
export default function ProfileCard(){
  // Meta robots noindex (solo en esta ruta)
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => { try { document.head.removeChild(meta) } catch {} }
  }, [])

  function sendEmail(e){
    e.preventDefault()
    const email = 'Contacto@proconing.cl'
    const subject = 'Consulta desde QR'
    const body = 'Hola, me interesa conocer más sobre sus servicios de construcción e ingeniería.'

    // Intento primario via mailto (oculto para evitar navegación extraña)
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    const a = document.createElement('a')
    a.href = mailto
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    a.remove()

    // Fallback: copiar o abrir Gmail (template literal con 
    setTimeout(async () => {
      const ok = window.confirm(`¿No se abrió tu cliente de correo?

OK: Copiar email
Cancelar: Abrir Gmail web`)
      if (ok){
        try {
          await navigator.clipboard.writeText(email)
          alert(`Email copiado: ${email}

Asunto sugerido: ${subject}`)
        } catch {
          alert(`Email: ${email}

Asunto: ${subject}

Mensaje: ${body}`)
        }
      } else {
        const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
        try { window.open(gmail, '_blank', 'noopener') } catch {}
      }
    }, 800)
  }

  return (
    <section className="relative min-h-[calc(100svh-var(--nav-h))] grid place-items-center py-10">
      {/* Fondo patrón repetido */}
      <div className="fixed inset-0 -z-10 opacity-50 bg-[url('/resources/profile-pic1.png')] bg-repeat [background-size:400px_400px]" aria-hidden />

      <div className="container">
        <div className="mx-auto max-w-[420px] text-center rounded-2xl p-8 shadow-[0_25px_50px_rgba(0,0,0,0.4)] bg-black/95 backdrop-blur-xl border border-white/10">
          {/* Foto */}
          <div className="w-28 h-28 mx-auto mb-5 rounded-full border-4" style={{ borderColor: 'rgb(250, 214, 8)', backgroundImage: "url('/resources/profile-pic.jpg')", backgroundSize:'cover', backgroundPosition:'center' }} />

          <h1 className="text-white text-2xl font-bold">Procon Ingenierias SPA</h1>
          <p className="text-neutral-200 mt-2 leading-relaxed">
            📬Contacto@proconing.cl<br/>
            🏡🔝Diseñamos la casa de tus sueños<br/>
            🏗️Construcción integral<br/>
            ⚖️Diseños únicos y personalizados en Chile
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <a href="https://www.instagram.com/procon.ing?igsh=MTV6OWljNjZjYmRlcQ%3D%3D&utm_source=qr" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-5 py-3 rounded-xl text-white shadow-soft" style={{ background: 'linear-gradient(45deg,#f09433,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)' }}>
              <span className="text-xl">📷</span>
              <span className="font-semibold text-left grow">Instagram</span>
            </a>
            <a href="https://wa.me/56973495086" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-5 py-3 rounded-xl text-white shadow-soft bg-[#25d366]">
              <span className="text-xl">💬</span>
              <span className="font-semibold text-left grow">WhatsApp</span>
            </a>
            <a href="#enviar-correo" onClick={sendEmail} className="flex items-center gap-3 px-5 py-3 rounded-xl text-white shadow-soft bg-[#00CED1]">
              <span className="text-xl">📧</span>
              <span className="font-semibold text-left grow">Enviar Correo</span>
            </a>

            {/* Botón MI WEB → Landing */}
            <Link to="/" className="flex items-center gap-3 px-5 py-3 rounded-xl text-white shadow-soft bg-title hover:opacity-95">
              <span className="text-xl">🏠</span>
              <span className="font-semibold text-left grow">Mi web</span>
            </Link>
          </div>

          <div className="mt-6 pt-4 border-t border-white/20 text-neutral-300 text-sm">Procon Ingenierias Spa</div>
        </div>
      </div>
    </section>
  )
}