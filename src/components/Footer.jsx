import { Link } from 'react-router-dom'
const IconInstagram = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg>
)
const IconWhatsApp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 12a8 8 0 0 1-11.7 7L4 20l1.1-4.2A8 8 0 1 1 20 12Z" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M9.5 9.5c.3-1 .8-1 1.3-.7l.8.5c.3.2.4.6.3.9l-.2.6a.8.8 0 0 0 .2.8l.9 1a.8.8 0 0 0 .8.2l.7-.2c.4-.1.8 0 1 .3l.5.9c.3.5.2 1-.4 1.3-1.7.9-3.8.7-5.7-1.1-1.8-1.7-2.3-3.5-1.9-5 .2-.6.8-.6 1-.3Z" fill="currentColor"/></svg>
)
const IconMail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
)
const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="2"/><path d="M6 19a6 6 0 0 1 12 0" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
)
export default function Footer(){
  function sendEmail(e){
    e.preventDefault()
    const email = 'Contacto@proconing.cl'
    const subject = 'Consulta desde la web'
    const body = 'Hola, me interesa conocer más sobre sus servicios.'
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
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
  const circle = 'w-11 h-11 grid place-items-center rounded-full border btn-gold bg-white text-title shadow-soft transition hover:bg-title hover:text-white'
  return (
    <footer className="fixed bottom-0 inset-x-0 z-40 border-t border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-title/70">
          <img src={import.meta.env.BASE_URL + 'resources/logo.png'} alt="ProconIng" className="w-6 h-6"/>
          <span>© {new Date().getFullYear()} ProconIng</span>
        </div>
        <div className="flex items-center gap-2">
          <a aria-label="Instagram" href="https://www.instagram.com/procon.ing?igsh=MTV6OWljNjZjYmRlcQ%3D%3D&utm_source=qr" target="_blank" rel="noreferrer" className={circle}><IconInstagram /></a>
          <a aria-label="WhatsApp" href="https://wa.me/56973495086" target="_blank" rel="noreferrer" className={circle}><IconWhatsApp /></a>
          <a aria-label="Enviar correo" href="#enviar-correo-web" onClick={sendEmail} className={circle}><IconMail /></a>
          <Link aria-label="Perfil" to="/" className={circle}><IconUser /></Link>
        </div>
      </div>
    </footer>
  )
}