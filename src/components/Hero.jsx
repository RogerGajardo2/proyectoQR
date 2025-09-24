import { useRef, useEffect, useState, useCallback } from 'react'
import Button from './ui/Button'
import { useGoToSection } from '../hooks/useGoToSection'

export default function Hero() {
  const go = useGoToSection()
  const videoRef = useRef(null)
  const sectionRef = useRef(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Detectar si es dispositivo móvil
  const isMobile = useCallback(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth < 768
  }, [])

  // Detectar conexión lenta
  const isSlowConnection = useCallback(() => {
    return navigator.connection && 
           (navigator.connection.effectiveType === 'slow-2g' || 
            navigator.connection.effectiveType === '2g')
  }, [])

  // Intersection Observer para lazy loading y pausa automática
  useEffect(() => {
    const currentSection = sectionRef.current
    if (!currentSection) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
        
        const video = videoRef.current
        if (!video) return

        if (entry.isIntersecting) {
          // Cargar video cuando sea visible
          if (!videoLoaded && !isSlowConnection()) {
            video.load()
          }
          // Reproducir si está cargado
          if (videoLoaded) {
            video.play().catch(console.error)
          }
        } else {
          // Pausar cuando no sea visible para ahorrar recursos
          video.pause()
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    observer.observe(currentSection)

    return () => {
      observer.unobserve(currentSection)
    }
  }, [videoLoaded, isSlowConnection])

  // Manejar eventos del video
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleCanPlayThrough = () => {
      setVideoLoaded(true)
      if (isVisible) {
        video.play().catch(console.error)
      }
    }

    const handleError = () => {
      setVideoError(true)
      console.warn('Error cargando video del hero')
    }

    const handleLoadStart = () => {
      setVideoError(false)
    }

    // Solo agregar listeners si no es conexión lenta
    if (!isSlowConnection()) {
      video.addEventListener('canplaythrough', handleCanPlayThrough)
      video.addEventListener('error', handleError)
      video.addEventListener('loadstart', handleLoadStart)

      // Cargar inmediatamente si está visible
      if (isVisible) {
        video.load()
      }
    }

    return () => {
      video.removeEventListener('canplaythrough', handleCanPlayThrough)
      video.removeEventListener('error', handleError)
      video.removeEventListener('loadstart', handleLoadStart)
    }
  }, [isVisible, isSlowConnection])

  // Optimizar para móviles: pausar en background
  useEffect(() => {
    const handleVisibilityChange = () => {
      const video = videoRef.current
      if (!video || !videoLoaded) return

      if (document.hidden) {
        video.pause()
      } else if (isVisible) {
        video.play().catch(console.error)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [videoLoaded, isVisible])

  return (
    <section 
      ref={sectionRef}
      id="inicio" 
      className="relative min-h-[65vh] grid place-items-center overflow-hidden scroll-mt-24"
    >
      {/* Video Background con optimizaciones */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
        {/* Imagen de poster como fallback y carga inicial */}
        <div 
          className={`absolute inset-0 bg-cover bg-center bg-gray-800 transition-opacity duration-500 ${
            videoLoaded && !videoError ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            backgroundImage: `url(${import.meta.env.BASE_URL}resources/hero-poster.webp)`
          }}
        />

        {/* Video optimizado */}
        <video 
          ref={videoRef}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            videoLoaded && !videoError ? 'opacity-100' : 'opacity-0'
          }`}
          muted 
          playsInline
          loop
          preload={isSlowConnection() ? 'none' : 'metadata'}
          poster={`${import.meta.env.BASE_URL}resources/hero-poster.webp`}
        >
          {/* Fuentes optimizadas por dispositivo */}
          {!isMobile() && (
            <>
              <source 
                src={`${import.meta.env.BASE_URL}resources/proconing_hero_bg_desktop.webm`} 
                type="video/webm" 
                media="(min-width: 768px)"
              />
              <source 
                src={`${import.meta.env.BASE_URL}resources/proconing_hero_bg_desktop.mp4`} 
                type="video/mp4" 
                media="(min-width: 768px)"
              />
            </>
          )}
          
          {/* Versión móvil más ligera */}
          <source 
            src={`${import.meta.env.BASE_URL}resources/proconing_hero_bg_mobile.webm`} 
            type="video/webm" 
            media="(max-width: 767px)"
          />
          <source 
            src={`${import.meta.env.BASE_URL}resources/proconing_hero_bg_mobile.mp4`} 
            type="video/mp4" 
            media="(max-width: 767px)"
          />
          
          {/* Fallback universal */}
          <source 
            src={`${import.meta.env.BASE_URL}resources/proconing_hero_bg_5s.webm`} 
            type="video/webm" 
          />
          <source 
            src={`${import.meta.env.BASE_URL}resources/proconing_hero_bg_5s.mp4`} 
            type="video/mp4" 
          />
        </video>

        {/* Indicador de carga sutil */}
        {isVisible && !videoLoaded && !videoError && !isSlowConnection() && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Overlay optimizado */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/30 via-black/20 to-transparent pointer-events-none" />

      {/* Contenido del hero */}
      <div className="container text-center py-20 relative z-10 text-white" data-reveal>
        <span className="font-semibold tracking-widest uppercase text-sm opacity-90">
          Arquitectura y Construcción
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mt-2 drop-shadow-lg">
          Diseñamos y ejecutamos proyectos que perduran
        </h1>
        <p className="mt-3 text-lg opacity-90 drop-shadow max-w-2xl mx-auto">
          Soluciones integrales en arquitectura, construcción y gestión de obras.
        </p>
        <div className="mt-6 flex justify-center gap-4 flex-wrap">
          <Button onClick={() => go('proyectos')} size="lg">
            Ver proyectos
          </Button>
          <Button onClick={() => go('contacto')} size="lg">
            Contáctanos
          </Button>
        </div>

        {/* Mensaje para conexiones lentas */}
        {isSlowConnection() && (
          <div className="mt-4 text-sm opacity-75 bg-black/30 rounded-lg px-4 py-2 inline-block">
            Modo ahorro de datos activado
          </div>
        )}
      </div>
    </section>
  )
}