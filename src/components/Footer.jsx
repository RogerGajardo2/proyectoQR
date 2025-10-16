// src/components/Footer.jsx (CON LINK A ADMIN)
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
const IconAdmin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="currentColor" strokeWidth="2"/></svg>
)

export default function Footer(){
  const email = 'Contacto@proconing.cl'
  const subject = 'Consulta desde la web'
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
    try { window.open(gmail, '_blank', 'noopener') } catch {}
  }

  const circle = 'w-11 h-11 grid place-items-center rounded-full border btn-gold bg-white text-title shadow-soft transition hover:bg-title hover:text-white'
  
  return (
    <footer className="bottom-0 inset-x-0 z-[9999] border-t border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 no-glass" 
            style={{ 
              zIndex: 9999,
              position: 'static',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}>
      <div className="container py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-title/70">
          <span>© {new Date().getFullYear()} ProconIng</span>
          {/* Link secreto al admin - hacer triple clic */}
          <Link 
            to="/admin/codigos" 
            className="opacity-0 hover:opacity-100 transition-opacity duration-300 text-xs"
            title="Panel de administración"
          >
            🔐
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <a aria-label="Instagram" href="https://www.instagram.com/procon.ing?igsh=MTV6OWljNjZjYmRlcQ%3D%3D&utm_source=qr" target="_blank" rel="noreferrer" className={circle}><IconInstagram /></a>
          <a aria-label="WhatsApp" href="https://wa.me/56973495086" target="_blank" rel="noreferrer" className={circle}><IconWhatsApp /></a>
          <a aria-label="Enviar correo" href="#enviar-correo-web" onClick={sendEmail} className={circle}><IconMail /></a>
          <Link aria-label="Perfil" to="/" className={circle}><IconUser /></Link>
          {/* Botón visible de admin (opcional - comentado por defecto) */}
          <Link aria-label="Admin" to="/admin/codigos" className={circle}><IconAdmin /></Link> 
        </div>
      </div>
    </footer>
  )
}