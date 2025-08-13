import { useState, useEffect } from 'react'

export default function Header(){
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 900) setOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <header className="sticky top-0 z-50 h-[var(--nav-h)] border-b border-line glass">
      <div className="container h-full flex items-center justify-between gap-4">
        <a href="#inicio" className="flex items-center gap-2 font-bold text-title" aria-label="Inicio">
          <img src="\public\logo.png" alt="ProconIng" className="w-10 h-10"/>
        </a>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-4">
          <a className="px-3 py-2 rounded-lg text-title font-semibold hover:bg-alt" href="#inicio">Inicio</a>
          <a className="px-3 py-2 rounded-lg text-title font-semibold hover:bg-alt" href="#proyectos">Proyectos</a>
          <a className="px-3 py-2 rounded-lg text-title font-semibold hover:bg-alt" href="#quienes-somos">Quiénes somos</a>
          <a className="px-3 py-2 rounded-lg text-title font-semibold hover:bg-alt" href="#contacto">Contáctanos</a>
        </nav>

        {/* Hamburguesa */}
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

      {/* Nav móvil */}
      <nav id="primary-nav" className={`md:hidden fixed left-0 right-0 top-[var(--nav-h)] bg-white border-b border-line px-5 py-3 transition-transform ${open ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="container flex flex-col gap-2">
          <a onClick={()=>setOpen(false)} className="px-3 py-2 rounded-lg text-title font-semibold hover:bg-alt" href="#inicio">Inicio</a>
          <a onClick={()=>setOpen(false)} className="px-3 py-2 rounded-lg text-title font-semibold hover:bg-alt" href="#proyectos">Proyectos</a>
          <a onClick={()=>setOpen(false)} className="px-3 py-2 rounded-lg text-title font-semibold hover:bg-alt" href="#quienes-somos">Quiénes somos</a>
          <a onClick={()=>setOpen(false)} className="px-3 py-2 rounded-lg text-title font-semibold hover:bg-alt" href="#contacto">Contáctanos</a>
        </div>
      </nav>
    </header>
  )
}