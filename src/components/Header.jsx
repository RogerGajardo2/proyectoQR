import { useState, useEffect } from 'react'
import Button from './ui/Button'
import { useGoToSection } from '../hooks/useGoToSection'

export default function Header(){
  const [open, setOpen] = useState(false)
  const go = useGoToSection()
  useEffect(() => { const onResize=()=>{ if(window.innerWidth>900) setOpen(false)}; window.addEventListener('resize',onResize); return ()=>window.removeEventListener('resize',onResize)},[])
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[var(--nav-h)] border-b border-line glass">
      <div className="container h-full flex items-center justify-between gap-4">
        <button onClick={() => go('inicio')} className="flex items-center gap-2 font-bold text-title" aria-label="Inicio">
          <img src={import.meta.env.BASE_URL + 'resources/logo.png'} alt="ProconIng" className="w-10 h-10"/>
          <span>ProconIng</span>
        </button>
        <nav className="hidden md:flex items-center gap-1">
          <Button rounded="none" size="sm" variant="link" onClick={()=>go('inicio')}>Inicio</Button>
          <Button rounded="none" size="sm" variant="link" onClick={()=>go('proyectos')}>Proyectos</Button>
          <Button rounded="none" size="sm" variant="link" onClick={()=>go('quienes-somos')}>Quiénes somos</Button>
          <Button rounded="none" size="sm" variant="link" onClick={()=>go('contacto')}>Contáctanos</Button>
        </nav>
        <button className="relative md:hidden w-10 h-10" aria-expanded={open} aria-controls="primary-nav" aria-label={open?'Cerrar menú':'Abrir menú'} onClick={()=>setOpen(v=>!v)}>
          <span className="absolute left-2 right-2 top-3 h-0.5 bg-title transition"/>
          <span className="absolute left-2 right-2 top-1/2 -mt-0.5 h-0.5 bg-title transition"/>
          <span className="absolute left-2 right-2 bottom-3 h-0.5 bg-title transition"/>
        </button>
      </div>
      <nav id="primary-nav" className={`md:hidden fixed left-0 right-0 top-[var(--nav-h)] bg-white border-b border-line px-5 py-3 transition-transform ${open?'translate-y-0':'-translate-y-full'}`}>
        <div className="container flex flex-col gap-1">
          <Button rounded="none" size="sm" variant="link" className="text-left" onClick={()=>{go('inicio');setOpen(false)}}>Inicio</Button>
          <Button rounded="none" size="sm" variant="link" className="text-left" onClick={()=>{go('proyectos');setOpen(false)}}>Proyectos</Button>
          <Button rounded="none" size="sm" variant="link" className="text-left" onClick={()=>{go('quienes-somos');setOpen(false)}}>Quiénes somos</Button>
          <Button rounded="none" size="sm" variant="link" className="text-left" onClick={()=>{go('contacto');setOpen(false)}}>Contáctanos</Button>
        </div>
      </nav>
    </header>
  )
}