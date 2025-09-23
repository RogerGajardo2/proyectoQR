import { useRef, useEffect } from 'react'
import Button from './ui/Button'
import { useGoToSection } from '../hooks/useGoToSection'

export default function Hero(){
  const go = useGoToSection()
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      if (video.currentTime >= 19) {
        video.currentTime = 0
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdate)

    // Cleanup
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [])

  return (
    <section id="inicio" className="relative min-h-[70vh] grid place-items-center overflow-hidden scroll-mt-24">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
        <video 
          ref={videoRef}
          className="w-full h-full object-cover" 
          autoPlay 
          muted 
          playsInline
        >
          <source src={`${import.meta.env.BASE_URL}resources/proconing_hero_bg_5s.webm`} type="video/webm" />
          <source src={`${import.meta.env.BASE_URL}resources/proconing_hero_bg_5s.mp4`} type="video/mp4" />
        </video>
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-white/10 via-white/20 to-transparent pointer-events-none"/>
      <div className="container text-center py-20 relative z-10 text-[#f3f4f6]" data-reveal>
        <span className="font-semibold tracking-widest uppercase text-sm">Arquitectura y Construcción</span>
        <h1 className="text-4xl md:text-5xl font-bold mt-2 text-[#f3f4f6]">Diseñamos y ejecutamos proyectos que perduran</h1>
        <p className="mt-3 text-[#f3f4f6]">Soluciones integrales en arquitectura, construcción y gestión de obras.</p>
        <div className="mt-5 flex justify-center gap-3">
          <Button onClick={()=>go('proyectos')}>Ver proyectos</Button>
          <Button variant="outline" onClick={()=>go('contacto')}>Contáctanos</Button>
        </div>
      </div>
    </section>
  )
}