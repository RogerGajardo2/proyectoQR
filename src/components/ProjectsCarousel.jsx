// src/components/ProjectsCarousel.jsx (VERSIÓN CON BOTÓN A LISTA - MOBILE OPTIMIZED + SWIPE)

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './ui/Button'
import { getCarouselSlides } from '../data/projectsData'

// Componente para cada slide del carrusel
const CarouselSlide = ({ slide, onProjectClick }) => (
  <div className="carousel-slide group">
    <img 
      className="carousel-image" 
      src={slide.img} 
      alt={slide.caption}
      loading="lazy"
    />
    
    {/* Overlay base sin efecto hover */}
    <div className="absolute inset-0 bg-black/20 transition-all duration-300" />
    
    {/* Botón central para ver el proyecto */}
    <Button 
      onClick={() => onProjectClick(slide.id)}
      variant="outline"
      className="project-button"
      aria-label={`Ver proyecto ${slide.title}`}
    >
      Ver Proyecto
    </Button>
    
    {/* Caption del proyecto */}
    <div className="carousel-caption absolute left-0 bottom-0">
      {slide.caption}
    </div>
  </div>
)

// Componente para botones de navegación
const NavigationButton = ({ direction, onClick, ariaLabel }) => (
  <button 
    onClick={onClick}
    aria-label={ariaLabel}
    className={`
      absolute ${direction === 'left' ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 
      bg-transparent md:bg-black/70 md:hover:bg-black/90 
      text-white p-3 md:rounded-full 
      transition-all duration-200 backdrop-blur-sm z-50 
      hover:scale-110
    `}
  >
    {direction === 'left' ? '‹' : '›'}
  </button>
)

// Componente para indicadores de navegación
const NavigationDots = ({ slides, currentIndex, onDotClick }) => (
  <div className="absolute inset-x-0 -bottom-2 pb-5 flex justify-center gap-2 z-20 max-md:hidden">
    {slides.map((_, i) => (
      <button 
        key={i}
        onClick={() => onDotClick(i)}
        aria-label={`Ir a slide ${i + 1}`}
        className={`carousel-indicator ${i === currentIndex ? 'active' : ''}`}
      />
    ))}
  </div>
)

export default function ProjectsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const trackRef = useRef(null)
  const timerRef = useRef(null)
  const navigate = useNavigate()
  
  // Obtener slides de manera optimizada y memoizada
  const slides = useMemo(() => getCarouselSlides(), [])
  
  // Función para navegar a un índice específico
  const goToSlide = useCallback((index) => {
    const normalizedIndex = ((index % slides.length) + slides.length) % slides.length
    setCurrentIndex(normalizedIndex)
  }, [slides.length])
  
  // Función para manejar clic en proyecto
  const handleProjectClick = useCallback((projectId) => {
    navigate(`/inicio/proyecto-${projectId}`)
  }, [navigate])

  const handleViewAllProjects = useCallback(() => {
    navigate('/inicio/proyectos')
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }, [navigate])
  
  // Funciones de navegación memoizadas
  const goToPrevious = useCallback(() => {
    goToSlide(currentIndex - 1)
  }, [currentIndex, goToSlide])
  
  const goToNext = useCallback(() => {
    goToSlide(currentIndex + 1)
  }, [currentIndex, goToSlide])

  // Manejar gestos táctiles para navegación por swipe
  const handleTouchStart = useCallback((e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }, [])

  const handleTouchMove = useCallback((e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const minSwipeDistance = 50
    
    if (distance > minSwipeDistance) {
      // Swipe izquierda - siguiente slide
      goToNext()
    } else if (distance < -minSwipeDistance) {
      // Swipe derecha - slide anterior
      goToPrevious()
    }
  }, [touchStart, touchEnd, goToNext, goToPrevious])
  
  // Efecto para actualizar la transformación del track
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${currentIndex * 100}%)`
    }
  }, [currentIndex])
  
  // Efecto para el auto-play del carrusel
  useEffect(() => {
    const startTimer = () => {
      timerRef.current = setInterval(() => {
        goToSlide(currentIndex + 1)
      }, 6000)
    }
    
    const clearTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
    
    startTimer()
    return clearTimer
  }, [currentIndex, goToSlide])

  // Efecto para manejar resize y aplicar transición correcta
  useEffect(() => {
    const handleResize = () => {
      if (trackRef.current) {
        const isMobile = window.innerWidth < 768
        if (isMobile) {
          trackRef.current.style.transition = 'transform 500ms ease-out'
        } else {
          trackRef.current.style.transition = 'none'
        }
      }
    }

    // Aplicar al cargar
    handleResize()
    
    // Escuchar cambios de tamaño
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Manejar pausa del auto-play al hacer hover
  const handleMouseEnter = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }, [])
  
  const handleMouseLeave = useCallback(() => {
    timerRef.current = setInterval(() => {
      goToSlide(currentIndex + 1)
    }, 6000)
  }, [currentIndex, goToSlide])
  
  // Manejar navegación por teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'ArrowRight':
          goToNext()
          break
        default:
          break
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [goToPrevious, goToNext])
  
  if (!slides.length) {
    return (
      <section id="proyectos" className="py-16 bg-alt scroll-mt-24">
        <div className="container">
          <div className="text-center py-16">
            <p className="text-text">No hay proyectos disponibles</p>
          </div>
        </div>
      </section>
    )
  }
  
  return (
    <section id="proyectos" className="py-16 bg-alt scroll-mt-24">
      <div className="container">
        {/* Header de la sección con botón a lista completa */}
        <div className="flex items-end justify-between gap-4 pb-4 mb-6 border-b border-line" data-reveal>
          <div className="flex-1">
            <div className="text-subtitle font-bold uppercase tracking-[.14em] text-sm">
              Proyectos
            </div>
            <h2 className="text-title text-3xl font-bold">Obras destacadas</h2>
            <p className="hidden md:block text-text mt-2">
              Calidad constructiva, eficiencia y diseño, en cada etapa.
            </p>
          </div>
          
          {/* Botón para ver todos los proyectos */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleViewAllProjects}
              variant="outline"
              size="sm"
              className="whitespace-nowrap flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Lista de proyectos
            </Button>
          </div>
        </div>
        
        {/* Carrusel principal - salir del container en móvil */}
        <div className="-mx-4 md:mx-0">
          <div 
            className="
              carousel-container relative rounded-2xl shadow-soft bg-white group
              /* En móvil: sin bordes redondeados ni sombra */
              max-md:rounded-none max-md:shadow-none max-md:bg-transparent
            " 
            data-reveal
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            role="region"
            aria-label="Galería de proyectos"
          >
            {/* Track del carrusel */}
            <div 
              ref={trackRef} 
              className="carousel-track"
            >
              {slides.map((slide, index) => (
                <CarouselSlide
                  key={`${slide.id}-${index}`}
                  slide={slide}
                  onProjectClick={handleProjectClick}
                />
              ))}
            </div>
            
            {/* Botones de navegación */}
            <NavigationButton
              direction="left"
              onClick={goToPrevious}
              ariaLabel="Proyecto anterior"
            />
            <NavigationButton
              direction="right"
              onClick={goToNext}
              ariaLabel="Proyecto siguiente"
            />
            
            {/* Indicadores de navegación - Ocultos en mobile */}
            <NavigationDots
              slides={slides}
              currentIndex={currentIndex}
              onDotClick={goToSlide}
            />
          </div>
        </div>
        
        {/* Información adicional y enlaces */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4" data-reveal>
          <div className="text-center sm:text-left">
            <p className="text-sm text-text/70">
              {currentIndex + 1} de {slides.length} proyectos destacados
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}