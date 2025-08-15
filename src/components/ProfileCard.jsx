import { Link } from 'react-router-dom'
import { useEffect } from 'react'
export default function ProfileCard(){
  useEffect(() => {
    const meta = document.createElement('meta'); meta.name = 'robots'; meta.content = 'noindex, nofollow'; document.head.appendChild(meta)
    return () => { try { document.head.removeChild(meta) } catch {} }
  }, [])

  const email = 'Contacto@proconing.cl'
  const subject = 'Consulta desde QR'
  const body = 'Hola, me interesa conocer más sobre sus servicios.'
  const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  function openMailDefault(){
    const ok = window.confirm('¿Deseas abrir tu correo predeterminado para enviarnos un mensaje?')
    if (ok){
      const a = document.createElement('a'); a.href = mailto; a.style.display='none'; document.body.appendChild(a); a.click(); a.remove()
    }
  }

  function sendEmail(e){
    e.preventDefault()
    const isDesktop = window.matchMedia('(pointer:fine)').matches && window.innerWidth >= 1024
    if (isDesktop) { openMailDefault(); return }
    const a = document.createElement('a'); a.href = mailto; a.style.display='none'; document.body.appendChild(a); a.click(); a.remove()
    setTimeout(async () => {
      const ok = window.confirm(`¿No se abrió tu cliente de correo?

Podemos abrir una ventana emergente (Gmail). Si lo deseas debes Aceptar.

Aceptar: Abrir Gmail web
Cancelar: Copiar email y asunto`)
      if (ok){
        alert('Se abrirá una ventana emergente con Gmail. Si tu navegador la bloquea, permite la ventana para continuar.')
        const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
        try { window.open(gmail, '_blank', 'noopener') } catch {}
      } else {
        try { await navigator.clipboard.writeText(`${email} — Asunto: ${subject}`); alert(`Email copiado: ${email}
Asunto: ${subject}`) }
        catch { alert(`Email: ${email}
Asunto: ${subject}

Mensaje sugerido: ${body}`) }
      }
    }, 600)
  }

  useEffect(() => {
    const isDesktop = window.matchMedia('(pointer:fine)').matches && window.innerWidth >= 1024
    if (isDesktop && !sessionStorage.getItem('pc_auto_mail_once')){
      sessionStorage.setItem('pc_auto_mail_once','1')
      setTimeout(openMailDefault, 400)
    }
  }, [])

  const tiles = Array.from({ length: 16 })
  return (
    <section className="relative min-h-[calc(100svh-var(--nav-h))] grid place-items-center py-6 md:py-10">
      <div className="fixed inset-0 -z-10 opacity-45" aria-hidden>
        <div className="w-full h-full grid grid-cols-3 grid-rows-4 md:grid-cols-4 md:grid-rows-4 gap-4 md:gap-8 p-4 md:p-10 place-items-center">
          {tiles.map((_, i) => (
            <div key={i} className={`${i >= 12 ? 'hidden md:flex' : 'flex'} items-center justify-center w-full h-full`}>
              <img src={import.meta.env.BASE_URL + 'resources/profile-pic1.png'} alt="" className="object-contain w-[24vw] h-[24vw] max-w-[96px] md:w-[16vw] md:h-[16vw] md:max-w-[160px]" loading="lazy" draggable="false" />
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