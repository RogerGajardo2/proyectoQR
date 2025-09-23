// src/components/ProjectDetail.jsx (VERSIÓN SIN BUCLES DE CARGA)

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from './ui/Button'
import { getProject } from '../data/projectsData'

// Componente simple para elemento de galería (imágenes más pequeñas)
const SimpleGalleryItem = ({ item, index, onImageClick }) => {
  const [hasError, setHasError] = useState(false)

  const handleImageError = () => {
    setHasError(true)
  }

  // Si la imagen falló, no mostrar el elemento
  if (hasError) {
    return null
  }

  return (
    <div 
      className="aspect-square overflow-hidden rounded-lg cursor-pointer transition-all duration-300 relative bg-gray-100 hover:shadow-lg hover:-translate-y-1 max-w-[200px] mx-auto"
      onClick={() => onImageClick(item.img, item.caption)}
    >
      <img
        src={item.img}
        alt={item.caption}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        onError={handleImageError}
        loading="lazy"
      />
      
      {/* Icono de zoom más pequeño */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-75 opacity-0 hover:opacity-100 transition-all duration-300 bg-white/90 rounded-full p-2 backdrop-blur-sm">
        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      </div>
      
      {/* Overlay con caption más sutil */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
        <p className="text-white text-xs font-medium truncate">{item.caption}</p>
      </div>
    </div>
  )
}

// Galería simple sin verificación automática
const SimpleGallery = ({ project, onImageClick }) => {
  return (
    <div className="mb-8" data-reveal>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-title text-2xl font-bold">Galería del proyecto</h3>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{backgroundColor: 'var(--subtitle)', color: 'white'}}>
          {project.imageCount} {project.imageCount === 1 ? 'imagen' : 'imágenes'}
        </span>
      </div>
      
      {/* Grid directo con Tailwind - 4 columnas en desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
        {project.gallery.map((item, i) => (
          <SimpleGalleryItem
            key={`${project.id}-${i}`}
            item={item}
            index={i}
            onImageClick={onImageClick}
          />
        ))}
      </div>
      
      {/* Información adicional */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          {project.imageCount} imágenes configuradas para este proyecto
        </p>
      </div>
    </div>
  )
}

// Componente para imagen con lazy loading simple
const LazyImage = ({ src, alt, className, onClick, children }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleError = useCallback(() => {
    setHasError(true)
  }, [])

  if (hasError) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center`}>
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">Imagen no disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className} onClick={onClick}>
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        loading="lazy"
      />
      {children}
    </div>
  )
}

// Componente para el lightbox
const Lightbox = ({ image, onClose }) => {
  useEffect(() => {
    if (!image) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    
    document.addEventListener('keydown', handleKeyDown)
    
    // Solo bloquear scroll cuando lightbox esté abierto
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [image, onClose])

  if (!image) return null

  return (
    <div 
      className="lightbox-overlay"
      onClick={onClose}
    >
      <div className="lightbox-content">
        {/* Botón cerrar */}
        <button 
          onClick={onClose}
          className="lightbox-close"
          aria-label="Cerrar"
        >
          ×
        </button>
        
        {/* Imagen en lightbox */}
        <img 
          src={image.img} 
          alt={image.caption}
          className="lightbox-image"
          onClick={(e) => e.stopPropagation()}
        />
        
        {/* Caption en lightbox */}
        <div className="lightbox-caption">
          <p>{image.caption}</p>
        </div>
      </div>
    </div>
  )
}

// Componente de información del proyecto
const ProjectInfo = ({ project }) => (
  <div className="grid md:grid-cols-2 gap-8 mb-8">
    <div className="bg-white border border-line rounded-2xl p-6 shadow-soft" data-reveal>
      <h3 className="text-title text-xl font-bold mb-4">Descripción</h3>
      <p className="text-text leading-relaxed mb-4">{project.description}</p>
      
      {/* Información adicional del proyecto */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div>
          <span className="text-sm text-gray-500">Área total</span>
          <p className="font-semibold text-title">{project.area}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Año</span>
          <p className="font-semibold text-title">{project.year}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Tipo</span>
          <p className="font-semibold text-title">{project.type}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Imágenes</span>
          <p className="font-semibold text-title">{project.imageCount} fotos</p>
        </div>
      </div>
    </div>
    
    <div className="bg-white border border-line rounded-2xl p-6 shadow-soft" data-reveal>
      <h3 className="text-title text-xl font-bold mb-4">Características</h3>
      <ul className="space-y-2">
        {project.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 text-text">
            <span className="text-blue-500 mt-1">✓</span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  </div>
)

export default function ProjectDetail() {
  const location = useLocation()
  const navigate = useNavigate()
  const [lightboxImage, setLightboxImage] = useState(null)
  
  // Extraer el ID del proyecto correctamente
  const projectId = useMemo(() => {
    const pathSegments = location.pathname.split('/')
    const projectSegment = pathSegments.find(segment => segment.startsWith('proyecto-'))
    
    // Si encontramos algo como "proyecto-proyecto-1", extraer solo "proyecto-1"
    if (projectSegment && projectSegment.startsWith('proyecto-proyecto-')) {
      return projectSegment.replace('proyecto-', '')
    }
    
    return projectSegment || ''
  }, [location.pathname])
  
  // Obtener proyecto usando la función centralizada
  const project = useMemo(() => getProject(projectId), [projectId])
  
  useEffect(() => {
    // Asegurar que el scroll funcione al cargar la página
    document.body.style.overflow = 'auto'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [projectId])

  // Funciones memoizadas para mejor performance
  const openLightbox = useCallback((image, caption) => {
    setLightboxImage({ img: image, caption })
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxImage(null)
  }, [])

  const handleBackToProjects = useCallback(() => {
    navigate('/inicio?to=proyectos')
  }, [navigate])

  const handleContactClick = useCallback(() => {
    navigate('/inicio?to=contacto')
  }, [navigate])
  
  // Proyecto no encontrado
  if (!project) {
    return (
      <section className="py-16 scroll-mt-24">
        <div className="container text-center">
          <h1 className="text-title text-4xl font-bold mb-4">Proyecto no encontrado</h1>
          <p className="text-text mb-6">El proyecto que buscas no existe o ha sido movido.</p>
          <Button onClick={handleBackToProjects}>Volver a proyectos</Button>
        </div>
      </section>
    )
  }
  
  return (
    <>
      <section className="project-detail-page py-16 scroll-mt-24">
        <div className="container">
          {/* Header con navegación */}
          <div className="mb-8" data-reveal>
            <button 
              onClick={handleBackToProjects}
              className="flex items-center gap-2 text-subtitle hover:opacity-70 mb-4 transition-colors"
              aria-label="Volver a proyectos"
            >
              <span>←</span> Volver a proyectos
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-title text-4xl font-bold">{project.title}</h1>
                <p className="text-subtitle text-lg font-semibold mt-2">{project.subtitle}</p>
              </div>

            </div>
          </div>
          
          {/* Imagen principal con lazy loading y fallback */}
          <div className="mb-8" data-reveal>
            <LazyImage
              src={project.mainImage}
              alt={project.title}
              className="w-full h-[400px] md:h-[500px] object-cover rounded-2xl shadow-soft"
            />
          </div>
          
          {/* Información del proyecto */}
          <ProjectInfo project={project} />

          {/* Galería simple (sin verificación automática) */}
          <SimpleGallery 
            project={project} 
            onImageClick={openLightbox}
          />

          {/* CTA optimizado */}
          <div className="bg-white border border-line rounded-2xl shadow-soft p-8 text-center" data-reveal>
            <h3 className="text-title text-2xl font-bold mb-4">¿Tienes un proyecto similar?</h3>
            <p className="text-text mb-6 leading-relaxed max-w-2xl mx-auto">
              Contáctanos para desarrollar tu proyecto con la misma calidad y atención al detalle. 
              Nuestro equipo está listo para materializar tus ideas y convertirlas en realidad.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleContactClick} size="lg">
                Solicitar cotización gratuita
              </Button>
              <button
                onClick={handleBackToProjects} 
                className="px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-soft hover:shadow-lg"
                style={{
                  border: '2px solid var(--subtitle)',
                  color: 'var(--subtitle)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--subtitle)'
                  e.target.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                  e.target.style.color = 'var(--subtitle)'
                }}
              >
                Ver más proyectos
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox optimizado */}
      <Lightbox image={lightboxImage} onClose={closeLightbox} />
    </>
  )
}