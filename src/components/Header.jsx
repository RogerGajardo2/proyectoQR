import { useState, useEffect } from 'react'
import { useGoToSection } from '../hooks/useGoToSection'

export default function Header() {
  const go = useGoToSection()
  const [open, setOpen] = useState(false)
  const [show, setShow] = useState(true)

  useEffect(() => {
    let prev = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      if (y < 12) setShow(true)
      else if (y < prev) setShow(true)
      else if (y > prev && y > 80) setShow(false)
      prev = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const linkCls = 'tracking-wider font-medium text-title hover:opacity-70 transition'
  const headerBg = open ? 'bg-white' : 'bg-white md:glass'

  return (
    <header className={`fixed top-0 inset-x-0 z-50 h-[var(--nav-h)] border-b border-line ${headerBg} transition-transform duration-300 ${show ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="container h-full flex items-center justify-between gap-4">
        <button type="button" onClick={() => go('inicio')} aria-label="Ir al inicio" className="flex items-center gap-2">
          <img src={import.meta.env.BASE_URL + 'resources/logo.png'} alt="ProconIng" className="w-10 h-10"/>
          <span className="text-title tracking-wider font-medium">ProconIng</span>
        </button>
        <nav className="hidden md:flex items-center gap-3">
          <button type="button" className={`px-2 py-2 ${linkCls}`} onClick={() => go('inicio')}>Inicio</button>
          <button type="button" className={`px-2 py-2 ${linkCls}`} onClick={() => go('proyectos')}>Proyectos</button>
          <button type="button" className={`px-2 py-2 ${linkCls}`} onClick={() => go('quienes-somos')}>Quiénes somos</button>
          <button type="button" className={`px-2 py-2 ${linkCls}`} onClick={() => go('contacto')}>Contáctanos</button>
        </nav>
        <button type="button" className="relative md:hidden w-10 h-10" aria-expanded={open} aria-controls="primary-nav" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setOpen(v => !v)}>
          <span className={`absolute left-2 right-2 top-3 h-0.5 bg-title transition ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`absolute left-2 right-2 top-1/2 -mt-0.5 h-0.5 bg-title transition ${open ? 'opacity-0' : ''}`} />
          <span className={`absolute left-2 right-2 bottom-3 h-0.5 bg-title transition ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      <button
        aria-hidden
        onClick={() => setOpen(false)}
        className={`md:hidden fixed inset-0 top-[var(--nav-h)] bg-black/35 transition-opacity z-[55] ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      <nav
        id="primary-nav"
        className={`md:hidden fixed top-[var(--nav-h)] bottom-0 right-0 w-1/2 min-w-[300px] bg-white border-l border-line shadow-2xl transition-transform duration-300 z-[60] isolate ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full flex flex-col px-6 py-8 space-y-8">
          <button type="button" className={`${linkCls} text-left text-lg py-3`} onClick={() => { go('inicio'); setOpen(false) }}>Inicio</button>
          <button type="button" className={`${linkCls} text-left text-lg py-3`} onClick={() => { go('proyectos'); setOpen(false) }}>Proyectos</button>
          <button type="button" className={`${linkCls} text-left text-lg py-3`} onClick={() => { go('quienes-somos'); setOpen(false) }}>Quiénes somos</button>
          <button type="button" className={`${linkCls} text-left text-lg py-3`} onClick={() => { go('contacto'); setOpen(false) }}>Contáctanos</button>
        </div>
      </nav>
    </header>
  )
}