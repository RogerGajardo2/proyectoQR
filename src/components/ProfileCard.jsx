import { Link } from 'react-router-dom'
import { useEffect } from 'react'

export default function ProfileCard(){
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta)
    return () => { try { document.head.removeChild(meta) } catch {} }
  }, [])

  const email = 'Contacto@proconing.cl'
  const subject = 'Consulta desde QR'
  const body = 'Hola, me interesa conocer más sobre sus servicios.'
  const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  function isMobile(){
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.matchMedia('(pointer:coarse)').matches
  }

  function sendEmail(e){
    e.preventDefault()
    if (isMobile()){
      try { window.location.href = mailto } catch { const a=document.createElement('a'); a.href=mailto; a.style.display='none'; document.body.appendChild(a); a.click(); a.remove() }
      return
    }
    const ok = window.confirm('¿Abrir Gmail en una ventana nueva para enviar un correo?')
    if (!ok) return
    const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    try { window.open(gmail, '_blank', 'noopener,noreferrer') } catch {}
  }

  // Móvil: 3x4 = 12 logos
  // Desktop: 3x3 = 9 logos
  const mobileLogos = Array.from({ length: 12 })
  const desktopLogos = Array.from({ length: 9 })

  return (
    <section className="relative min-h-[calc(100svh-var(--nav-h))] grid place-items-center py-6 md:py-10">
      <div className="fixed inset-0 -z-10 opacity-45" aria-hidden>
        {/* Grid móvil: 3x4 */}
        <div className="md:hidden w-full h-full grid grid-cols-3 grid-rows-4 gap-4 p-4 place-items-center">
          {mobileLogos.map((_, i) => (
            <div key={i} className="flex items-center justify-center w-full h-full">
              <img 
                src={import.meta.env.BASE_URL + 'resources/profile-pic1.png'} 
                alt="" 
                className="object-contain w-[24vw] h-[24vw] max-w-[96px]" 
                loading="lazy" 
                draggable="false" 
              />
            </div>
          ))}
        </div>

        {/* Grid desktop: 3x3 */}
        <div className="hidden md:grid w-full h-full grid-cols-3 grid-rows-3 gap-8 p-10 place-items-center">
          {desktopLogos.map((_, i) => (
            <div key={i} className="flex items-center justify-center w-full h-full">
              <img 
                src={import.meta.env.BASE_URL + 'resources/profile-pic1.png'} 
                alt="" 
                className="object-contain w-[25vw] h-[25vw] max-w-[160px]" 
                loading="lazy" 
                draggable="false" 
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="container">
        <div className="mx-auto max-w-[320px] md:max-w-[560px] text-center rounded-2xl p-5 md:p-10 shadow-[0_22px_44px_rgba(0,0,0,0.38)] md:shadow-[0_25px_50px_rgba(0,0,0,0.4)] bg-title backdrop-blur-xl border border-white/10">
          <div className="w-14 h-14 md:w-32 md:h-32 mx-auto mb-4 md:mb-6 rounded-full border-2 md:border-4" style={{ borderColor: 'rgb(250, 214, 8)', backgroundImage: 'url(' + import.meta.env.BASE_URL + 'resources/profile-pic.jpg)', backgroundSize:'cover', backgroundPosition:'center' }} />
          <h1 className="text-white text-base md:text-2xl font-semibold">Procon Ingenierias SPA</h1>
          <p className="text-neutral-200 mt-2 text-xs md:text-base leading-relaxed">📬Contacto@proconing.cl<br/>🏗️Construcción integral<br/>⚖️Diseños únicos y personalizados en Chile</p>
          <div className="mt-3 md:mt-6 flex flex-col gap-2 md:gap-3">
            <a href="https://www.instagram.com/procon.ing?igsh=MTV6OWljNjZjYmRlcQ%3D%3D&utm_source=qr" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2 md:px-5 md:py-3 rounded-xl text-white shadow-soft btn-gold text-sm md:text-base" style={{ background: 'linear-gradient(45deg,#f09433,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)' }}>
              <span className="text-lg md:text-xl">📷</span><span className="font-semibold text-left grow">Instagram</span>
            </a>
            <a href="https://wa.me/56973495086" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2 md:px-5 md:py-3 rounded-xl text-white shadow-soft bg-[#25d366] text-sm md:text-base">
              <span className="text-lg md:text-xl">💬</span><span className="font-semibold text-left grow">WhatsApp</span>
            </a>
            <a href="#enviar-correo" onClick={sendEmail} className="flex items-center gap-3 px-3 py-2 md:px-5 md:py-3 rounded-xl text-white shadow-soft bg-[#00CED1] text-sm md:text-base">
              <span className="text-lg md:text-xl">📧</span><span className="font-semibold text-left grow">Enviar Correo</span>
            </a>
            <Link to="/inicio?to=inicio" className="flex items-center gap-3 px-3 py-2 md:px-5 md:py-3 rounded-xl bg-white text-title shadow-soft btn-gold hover:bg-alt text-sm md:text-base">
              <span className="text-lg md:text-xl">🏠</span><span className="font-semibold text-left grow">Mi web</span>
            </Link>
          </div>
          <div className="mt-3 md:mt-6 pt-3 border-t border-white/20 text-neutral-300 text-[11px] md:text-sm">Procon Ingenierias Spa</div>
        </div>
      </div>
    </section>
  )
}