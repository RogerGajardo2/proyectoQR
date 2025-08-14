import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGoToSection } from '../hooks/useGoToSection'

export default function Header(){
  const [open, setOpen] = useState(false)
  const go = useGoToSection()

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 900) setOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <header className="sticky top-0 z-50 h-[var(--nav-h)] border-b border-line glass">
      <div className="container h-full flex items-center justify-between gap-4">
        <button onClick={() => go('inicio')} className="flex items-center gap-2 font-bold text-title" aria-label="Inicio">
          <img src={import.meta.env.BASE_URL + 'resources/logo.png'} alt="ProconIng" className="w-10 h-10"/>
          <span>ProconIng</span>
        </button>
        <nav className="hidden md:flex items-center gap-4">
          <button className="px-3 py-2 rounded-lg text-title font-semibold hover:bg-alt" onClick={() => go('inicio')}>Inicio</button>
          <button className="px-3 py-2 rounded-lg text-title font-semibold hover:bg-alt" onClick={() => go('proyectos')}>Proyectos</button>
          <button className="px-3 py-2 rounded-lg text-title font-semibold hover:bg-alt" onClick={() => go('quienes-somos')}>Quiénes somos</button>
          <button className="px-3 py-2 rounded-lg text-title font-semibold hover:bg-alt" onClick={() => go('contacto')}>Contáctanos</button>
        </nav>
        <button
          className="relative md:hidden w-10 h-10"
          aria-expanded={open}
          aria-controls="primary-nav"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen(v => !v)}
        >
          <span className="absolute left-2 right-2 top-3 h-0.5 bg-title transition"/>
          <span className="absolute left-2 right-2 top-1/2 -mt-0.5 h-0.5 bg-title transition"/>
          <span className="absolute left-2 right-2 bottom-3 h-0.5 bg-title transition"/>
        </button>
      </div>
      <nav id="primary-nav" className={`md:hidden fixed left-0 right-0 top-[var(--nav-h)] bg-white border-b border-line px-5 py-3 transition-transform ${open ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="container flex flex-col gap-2">
          <button onClick={()=>{go('inicio'); setOpen(false)}} className="text-left px-3 py-2 rounded-lg btn-gold text-title font-semibold hover:bg-alt">Inicio</button>
          <button onClick={()=>{go('proyectos'); setOpen(false)}} className="text-left px-3 py-2 rounded-lg btn-gold text-title font-semibold hover:bg-alt">Proyectos</button>
          <button onClick={()=>{go('quienes-somos'); setOpen(false)}} className="text-left px-3 py-2 rounded-lg btn-gold text-title font-semibold hover:bg-alt">Quiénes somos</button>
          <button onClick={()=>{go('contacto'); setOpen(false)}} className="text-left px-3 py-2 rounded-lg btn-gold text-title font-semibold hover:bg-alt">Contáctanos</button>
          <Link to="/" onClick={()=>setOpen(false)} className="px-3 py-2 rounded-lg btn-gold text-title font-semibold hover:bg-alt">Perfil</Link>
        </div>
      </nav>
    </header>
  )
}