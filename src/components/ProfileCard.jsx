import { Link } from 'react-router-dom'
import { useEffect } from 'react'
export default function ProfileCard(){
  useEffect(() => {
    const meta = document.createElement('meta'); meta.name = 'robots'; meta.content = 'noindex, nofollow'; document.head.appendChild(meta)
    return () => { try { document.head.removeChild(meta) } catch {} }
  }, [])
  function sendEmail(e){
    e.preventDefault()
    const email = 'Contacto@proconing.cl'
    const subject = 'Consulta desde QR'
    const body = 'Hola, me interesa conocer más sobre sus servicios.'
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    const a = document.createElement('a'); a.href = mailto; a.style.display='none'; document.body.appendChild(a); a.click(); a.remove()
    setTimeout(async () => {
      const ok = window.confirm(`¿No se abrió tu cliente de correo?\n\nPodemos abrir una ventana emergente (Gmail). Si lo deseas debes Aceptar.\n\nAceptar: Abrir Gmail web\nCancelar: Copiar email y asunto`)
      if (ok){
        alert('Se abrirá una ventana emergente con Gmail. Si tu navegador la bloquea, permite la ventana para continuar.')
        const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
        try { window.open(gmail, '_blank', 'noopener') } catch {}
      } else {
        try { await navigator.clipboard.writeText(`${email} — Asunto: ${subject}`); alert(`Email copiado: ${email}\nAsunto: ${subject}`) }
        catch { alert(`Email: ${email}\nAsunto: ${subject}\n\nMensaje sugerido: ${body}`) }
      }
    }, 800)
  }
  const tiles = Array.from({ length: 15 })
  return (
    <section className="relative min-h-[calc(100svh-var(--nav-h))] grid place-items-center py-6 md:py-10">
      <div className="fixed inset-0 -z-10 opacity-45" aria-hidden>
        <div className="w-full h-full grid grid-cols-3 grid-rows-5 md:grid-rows-4 gap-6 md:gap-10 p-4 md:p-8 place-items-center">
          {tiles.map((_, i) => (
            <img
              key={i}
              src={import.meta.env.BASE_URL + 'resources/profile-pic1.png'}
              alt=""
              className={`object-contain w-full h-full max-w-[28vw] md:max-w-[20vw] ${i >= 12 ? 'md:hidden' : ''}`}
              loading="lazy"
              draggable="false"
            />
          ))}
        </div>
      </div>
      <div className="container">
        <div className="mx-auto max-w-[320px] md:max-w-[420px] text-center rounded-2xl p-5 md:p-8 shadow-[0_22px_44px_rgba(0,0,0,0.38)] md:shadow-[0_25px_50px_rgba(0,0,0,0.4)] bg-title backdrop-blur-xl border border-white/10">
          <div className="w-16 h-16 md:w-28 md:h-28 mx-auto mb-4 md:mb-5 rounded-full border-2 md:border-4"
               style={{ borderColor: 'rgb(250, 214, 8)', backgroundImage: 'url(' + import.meta.env.BASE_URL + 'resources/profile-pic.jpg)', backgroundSize:'cover', backgroundPosition:'center' }} />
          <h1 className="text-white text-lg md:text-2xl font-semibold">Procon Ingenierias SPA</h1>
          <p className="text-neutral-200 mt-2 text-xs md:text-base leading-relaxed">📬Contacto@proconing.cl<br/>🏗️Construcción integral<br/>⚖️Diseños únicos y personalizados en Chile</p>
          <div className="mt-4 md:mt-6 flex flex-col gap-2 md:gap-3">
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
          <div className="mt-4 md:mt-6 pt-3 border-t border-white/20 text-neutral-300 text-[11px] md:text-sm">Procon Ingenierias Spa</div>
        </div>
      </div>
    </section>
  )
}