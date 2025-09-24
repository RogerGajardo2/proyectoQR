// src/components/ProjectsList.jsx

import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './ui/Button'
import { getCarouselSlides } from '../data/projectsData'

// Componente para cada card de proyecto
const ProjectCard = ({ project, onProjectClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleImageLoad = () => setImageLoaded(true)
  const handleImageError = () => setImageError(true)

  return (
    <div className="bg-white border border-line rounded-2xl shadow-soft overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Imagen del proyecto */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {!imageError ? (
          <img
            src={project.img}
            alt={project.title}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <div className="text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Imagen no disponible</p>
            </div>
          </div>
        )}

        {/* Overlay con botón */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
          <Button
            onClick={() => onProjectClick(project.id)}
            variant="outline"
            className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white/90 hover:bg-white border-white text-gray-900 hover:text-gray-900"
          >
            Ver Proyecto
          </Button>
        </div>
      </div>

      {/* Información del proyecto */}
      <div className="p-6">
        <h3 className="text-title text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
          {project.title}
        </h3>
        <p className="text-text text-sm mb-4 line-clamp-2">
          {project.caption}
        </p>

        {/* Metadata del proyecto */}
        {project.metadata && (
          <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
            <span>{project.metadata.type}</span>
            <span>{project.metadata.year}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Componente para filtros (opcional, para futuras mejoras)
const ProjectFilters = ({ filters, activeFilter, onFilterChange }) => {
  if (!filters || filters.length <= 1) return null

  return (
    <div className="flex flex-wrap gap-2 mb-8" data-reveal>
      <button
        onClick={() => onFilterChange('all')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === 'all'
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
      >
        Todos los proyectos
      </button>
      {filters.map(filter => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === filter
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          {filter}
        </button>
      ))}
    </div>
  )
}

export default function ProjectsList() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('all')

  // Obtener todos los proyectos (usando los slides del carrusel como base)
  // En el futuro, podrías crear una función separada para obtener todos los proyectos
  const allProjects = useMemo(() => {
    const slides = getCarouselSlides()

    // Agregar metadata adicional si está disponible
    return slides.map(slide => ({
      ...slide,
      metadata: {
        type: 'Residencial', // Esto debería venir de tus datos
        year: '2024', // Esto debería venir de tus datos
      }
    }))
  }, [])

  // Obtener filtros únicos (para futuras mejoras)
  const availableFilters = useMemo(() => {
    const types = allProjects.map(project => project.metadata?.type).filter(Boolean)
    return [...new Set(types)]
  }, [allProjects])

  // Filtrar proyectos
  const filteredProjects = useMemo(() => {
    if (activeFilter === 'all') return allProjects
    return allProjects.filter(project => project.metadata?.type === activeFilter)
  }, [allProjects, activeFilter])

  // Manejar navegación a proyecto específico
  const handleProjectClick = useCallback((projectId) => {
    navigate(`/inicio/proyecto-${projectId}`)
  }, [navigate])

  // Manejar regreso al inicio
  const handleBackToHome = useCallback(() => {
    // Verificar si hay historial para volver
    if (window.history.length > 1) {
      navigate(-1) // Ir a la página anterior
    } else {
      // Fallback si no hay historial (acceso directo)
      navigate('/inicio/proyectos')
    }
  }, [navigate])

  const handleProjectCarrouselClick = useCallback((projectId) => {
    navigate(`/inicio?to=proyectos`)
  }, [navigate])

  return (
    <section className="py-16 scroll-mt-24 min-h-screen bg-gray-50">
      <div className="container">
        {/* Header de la página */}
        <div className="mb-8" data-reveal>
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-2 text-subtitle hover:opacity-70 mb-6 transition-colors"
            aria-label="Volver al inicio"
          >
            <span>←</span> Volver
          </button>

          <div className="text-center max-w-3xl mx-auto">
            <div className="text-subtitle font-bold uppercase tracking-[.14em] text-sm mb-2">
              Portafolio Completo
            </div>
            <h1 className="text-title text-4xl md:text-5xl font-bold mb-4">
              Todos nuestros proyectos
            </h1>
            <p className="text-text text-lg leading-relaxed">
              Explora nuestra colección completa de proyectos residenciales y comerciales,
              cada uno diseñado con atención al detalle y calidad constructiva excepcional.
            </p>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12" data-reveal>
          <div className="bg-white rounded-2xl p-6 text-center shadow-soft">
            <div className="text-3xl font-bold text-blue-600 mb-2">{allProjects.length}</div>
            <div className="text-gray-600">Proyectos completados</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-soft">
            <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
            <div className="text-gray-600">Satisfacción del cliente</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-soft">
            <div className="text-3xl font-bold text-purple-600 mb-2">{new Date().getFullYear() - 2010}+</div>
            <div className="text-gray-600">Años de experiencia</div>
          </div>
        </div>

        {/* Filtros */}
        <ProjectFilters
          filters={availableFilters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Grid de proyectos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12" data-reveal>
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={`${project.id}-${index}`}
              project={project}
              onProjectClick={handleProjectClick}
            />
          ))}
        </div>

        {/* Mensaje si no hay proyectos */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16" data-reveal>
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No hay proyectos en esta categoría
            </h3>
            <p className="text-gray-500">
              Prueba con un filtro diferente o ve todos los proyectos.
            </p>
          </div>
        )}

        {/* CTA final con botones centrados - SOLUCIÓN CORREGIDA */}
        <div className="bg-white border border-line rounded-2xl shadow-soft p-8 text-center" data-reveal>
          <h3 className="text-title text-2xl font-bold mb-4">¿Listo para tu próximo proyecto?</h3>
          <p className="text-text mb-6 leading-relaxed max-w-2xl mx-auto">
            Cada proyecto es único y merece atención personalizada. Contáctanos para discutir
            tus ideas y crear algo extraordinario juntos.
          </p>
          <div className="button-container-centered">
            <Button onClick={() => navigate('/inicio?to=contacto')} size="lg" className="btn-mobile-full">
              Iniciar mi proyecto
            </Button>
            <Button
              size="lg"
              onClick={handleProjectCarrouselClick}
              className="btn-mobile-full"
            >
              Volver al carrusel
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}