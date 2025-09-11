import { Link } from 'react-router-dom'
import { useEffect } from 'react'

export default function ProfileCard() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta)
    return () => { try { document.head.removeChild(meta) } catch { } }
  }, [])

  const email = 'Contacto@proconing.cl'
  const subject = 'Consulta desde QR'
  const body = 'Hola, me interesa conocer más sobre sus servicios.'
  const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  function isMobile() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.matchMedia('(pointer:coarse)').matches
  }

  function sendEmail(e) {
    e.preventDefault()
    if (isMobile()) {
      try { window.location.href = mailto } catch { const a = document.createElement('a'); a.href = mailto; a.style.display = 'none'; document.body.appendChild(a); a.click(); a.remove() }
      return
    }
    const ok = window.confirm('¿Abrir Gmail en una ventana nueva para enviar un correo?')
    if (!ok) return
    const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    try { window.open(gmail, '_blank', 'noopener,noreferrer') } catch { }
  }

  // Móvil: 3x4 = 12 logos
  // Desktop: 4x3 = 12 logos
  const mobileLogos = Array.from({ length: 12 })
  const desktopLogos = Array.from({ length: 12 })

  return (
    <section className="relative min-h-[calc(100svh-var(--nav-h))] grid place-items-center py-6 md:py-10">
      <div className="fixed inset-0 -z-10 opacity-45" aria-hidden>
        {/* Grid móvil: 3x4 */}
        <div className="md:hidden w-full h-full grid grid-cols-3 grid-rows-4 gap-4 p-4 place-items-center">
          {mobileLogos.map((_, i) => (
            <div key={i} className="flex items-center justify-center w-full h-full">
              <img
                src={import.meta.env.BASE_URL + 'resources/logo.png'}
                alt=""
                className="object-contain w-full h-full"
                loading="lazy"
                draggable="false"
              />
            </div>
          ))}
        </div>

        {/* Grid desktop: 4x3 con logos de ~2cm x 2cm */}
        <div className="hidden md:grid w-full h-full grid-cols-4 grid-rows-3 gap-8 p-10 place-items-center">
          {desktopLogos.map((_, i) => (
            <div key={i} className="flex items-center justify-center w-full h-full">
              <img
                src={import.meta.env.BASE_URL + 'resources/logo.png'}
                alt=""
                className="object-contain w-64 h-64"
                loading="lazy"
                draggable="false"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="container">
        <div className="mx-auto max-w-[320px] md:max-w-[560px] text-center rounded-2xl p-6 py-8 md:p-10 shadow-[0_22px_44px_rgba(0,0,0,0.38)] md:shadow-[0_25px_50px_rgba(0,0,0,0.4)] bg-title backdrop-blur-xl border border-white/10">

          {/* Logo con fondo blanco y mejor visibilidad responsiva */}
          <div
            className="mx-auto mb-5 md:mb-6 rounded-full bg-white shadow-lg flex items-center justify-center overflow-visible
             w-32 h-32 md:w-40 md:h-40"
            style={{ borderColor: 'rgb(250, 214, 8)', border: '3px solid rgb(250, 214, 8)' }}
          >
            <img
              src={import.meta.env.BASE_URL + 'resources/logo.png'}
              alt="Procon Ingenierias Logo"
              className="w-full h-full object-contain scale-125 md:scale-150"
              loading="eager"
            />
          </div>


          <h1 className="text-white text-base md:text-2xl font-semibold">Procon Ingenierias SPA</h1>
          <p className="text-neutral-200 mt-3 text-sm md:text-base leading-relaxed">📬Contacto@proconing.cl<br />🏗️Construcción integral<br />⚖️Diseños únicos y personalizados en Chile</p>
          <div className="mt-6 md:mt-6 flex flex-col gap-2.5 md:gap-3">
            <a href="https://www.instagram.com/procon.ing?igsh=MTV6OWljNjZjYmRlcQ%3D%3D&utm_source=qr" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3.5 py-2.5 md:px-5 md:py-3 rounded-xl text-white shadow-soft btn-gold text-sm md:text-base" style={{ background: 'linear-gradient(45deg,#f09433,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)' }}>
              <span className="text-lg md:text-xl">📷</span><span className="font-semibold text-left grow">Instagram</span>
            </a>
            <a href="https://wa.me/56973495086" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3.5 py-2.5 md:px-5 md:py-3 rounded-xl text-white shadow-soft bg-[#25d366] text-sm md:text-base">
              <span className="text-lg md:text-xl">💬</span><span className="font-semibold text-left grow">WhatsApp</span>
            </a>
            <a href="#enviar-correo" onClick={sendEmail} className="flex items-center gap-3 px-3.5 py-2.5 md:px-5 md:py-3 rounded-xl text-white shadow-soft bg-[#00CED1] text-sm md:text-base">
              <span className="text-lg md:text-xl">📧</span><span className="font-semibold text-left grow">Enviar Correo</span>
            </a>
            <Link to="/inicio?to=inicio" className="flex items-center gap-3 px-3.5 py-2.5 md:px-5 md:py-3 rounded-xl bg-white text-title shadow-soft btn-gold hover:bg-alt text-sm md:text-base">
              <span className="text-lg md:text-xl">🏠</span><span className="font-semibold text-left grow">Mi web</span>
            </Link>
          </div>
          <div className="mt-6 md:mt-6 pt-3 border-t border-white/20 text-neutral-300 text-xs md:text-sm">Procon Ingenierias Spa</div>
        </div>
      </div>
    </section>
  )
}