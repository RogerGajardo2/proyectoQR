import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Button from './ui/Button'
import { useGoToSection } from '../hooks/useGoToSection'

// Función helper para generar rutas de imágenes
const getProjectImage = (project, image) => {
  return `${import.meta.env.BASE_URL}resources/projects/${project}/${image}`
}

const projectsData = {
  'oficinas-centro': {
    title: 'Oficinas Centro',
    subtitle: '12.000 m² · 2023',
    description: 'Proyecto de construcción integral para oficinas corporativas en el centro de la ciudad. Diseño moderno y funcional que maximiza el aprovechamiento del espacio disponible, incorporando tecnologías sustentables y espacios colaborativos que fomentan la productividad.',
    features: [
      'Área total: 12.000 m²',
      '8 niveles de oficinas',
      'Certificación LEED Gold',
      'Sistema de climatización inteligente',
      'Espacios colaborativos y salas de reuniones',
      'Estacionamientos subterráneos para 200 vehículos',
      'Terraza verde en último piso'
    ],
    images: [
      getProjectImage('oficinas-centro', 'main.jpg'),
      getProjectImage('oficinas-centro', 'fachada.jpg'),
      getProjectImage('oficinas-centro', 'espacios.jpg')
    ],
    gallery: [
      { 
        img: getProjectImage('oficinas-centro', 'fachada.jpg'), 
        caption: 'Fachada principal' 
      },
      { 
        img: getProjectImage('oficinas-centro', 'espacios.jpg'), 
        caption: 'Espacios de trabajo' 
      },
      { 
        img: getProjectImage('oficinas-centro', 'salas.jpg'), 
        caption: 'Salas de reuniones' 
      }
    ]
  },
  'interior-patagonia': {
    title: 'Interior Patagonia',
    subtitle: '180 m² · 2025',
    description: 'Diseño y construcción de interior residencial inspirado en la naturaleza patagónica. Proyecto que combina materiales nobles como madera nativa y piedra natural, creando espacios cálidos y acogedores que se integran armoniosamente con el paisaje circundante.',
    features: [
      'Área: 180 m²',
      '3 dormitorios y 2.5 baños',
      'Sala de estar con chimenea a leña',
      'Cocina integrada con isla central',
      'Materiales sustentables y locales',
      'Sistema de calefacción radiante',
      'Ventanales con vista panorámica',
      'Deck exterior en madera nativa'
    ],
    images: [
      getProjectImage('interior-patagonia', 'main.jpg'),
      getProjectImage('interior-patagonia', 'sala.jpg'),
      getProjectImage('interior-patagonia', 'cocina.jpg')
    ],
    gallery: [
      { 
        img: getProjectImage('interior-patagonia', 'sala.jpg'), 
        caption: 'Sala principal' 
      },
      { 
        img: getProjectImage('interior-patagonia', 'cocina.jpg'), 
        caption: 'Cocina integrada' 
      },
      { 
        img: getProjectImage('interior-patagonia', 'dormitorio.jpg'), 
        caption: 'Dormitorio principal' 
      }
    ]
  }
}

export default function ProjectDetail() {
  const location = useLocation()
  const go = useGoToSection()
  const [lightboxImage, setLightboxImage] = useState(null)
  
  // Extraer el ID del proyecto de la URL actual
  const projectId = location.pathname.split('/').pop()?.replace('proyecto-', '') || ''
  const project = projectsData[projectId]
  
  useEffect(() => {
    // Scroll al inicio cuando se carga el componente
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [projectId])

  // Manejar tecla ESC para cerrar lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightboxImage(null)
      }
    }
    
    if (lightboxImage) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [lightboxImage])

  const openLightbox = (image, caption) => {
    setLightboxImage({ img: image, caption })
  }

  const closeLightbox = () => {
    setLightboxImage(null)
  }
  
  if (!project) {
    return (
      <section className="py-16 scroll-mt-24">
        <div className="container text-center">
          <h1 className="text-title text-4xl font-bold mb-4">Proyecto no encontrado</h1>
          <p className="text-text mb-6">El proyecto que buscas no existe o ha sido movido.</p>
          <Button onClick={() => go('proyectos')}>Volver a proyectos</Button>
        </div>
      </section>
    )
  }
  
  return (
    <>
      <section id={`proyecto-${projectId}`} className="py-16 scroll-mt-24">
        <div className="container">
          <div className="mb-8" data-reveal>
            <button 
              onClick={() => go('proyectos')} 
              className="flex items-center gap-2 text-subtitle hover:opacity-70 mb-4 transition-colors"
            >
              <span>←</span> Volver a proyectos
            </button>
            <h1 className="text-title text-4xl font-bold">{project.title}</h1>
            <p className="text-subtitle text-lg font-semibold mt-2">{project.subtitle}</p>
          </div>
          
          {/* Imagen principal */}
          <div className="mb-8" data-reveal>
            <img 
              src={project.images[0]} 
              alt={project.title}
              className="w-full h-[400px] md:h-[500px] object-cover rounded-2xl shadow-soft"
            />
          </div>
          
          {/* Descripción y Características lado a lado */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white border border-line rounded-2xl p-6 shadow-soft" data-reveal>
              <h3 className="text-title text-xl font-bold mb-4">Descripción</h3>
              <p className="text-text leading-relaxed">{project.description}</p>
            </div>
            
            <div className="bg-white border border-line rounded-2xl p-6 shadow-soft" data-reveal>
              <h3 className="text-title text-xl font-bold mb-4">Características</h3>
              <ul className="space-y-2">
                {project.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-text">
                    <span className="text-subtitle mt-1">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Galería de imágenes */}
          <div className="mb-8" data-reveal>
            <h3 className="text-title text-2xl font-bold mb-6">Galería del proyecto</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {project.gallery.map((item, i) => (
                <div 
                  key={i} 
                  className="relative group cursor-pointer overflow-hidden rounded-xl shadow-soft hover:shadow-lg transition-all duration-300"
                  onClick={() => openLightbox(item.img, item.caption)}
                >
                  <img 
                    src={item.img} 
                    alt={item.caption}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Overlay con icono de zoom */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3">
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                  {/* Caption */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white text-sm font-medium">{item.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA de ancho completo debajo de las imágenes */}
          <div className="bg-white border border-line rounded-2xl shadow-soft p-8 text-center" data-reveal>
            <h3 className="text-title text-2xl font-bold mb-4">¿Tienes un proyecto similar?</h3>
            <p className="text-text mb-6 leading-relaxed max-w-2xl mx-auto">
              Contáctanos para desarrollar tu proyecto con la misma calidad y atención al detalle. 
              Nuestro equipo está listo para materializar tus ideas y convertirlas en realidad.
            </p>
            <Button onClick={() => go('contacto')} size="lg">
              Solicitar cotización gratuita
            </Button>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            {/* Botón cerrar */}
            <button 
              onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Imagen en lightbox */}
            <img 
              src={lightboxImage.img} 
              alt={lightboxImage.caption}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Caption en lightbox */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
              <p className="text-white text-lg font-medium text-center">{lightboxImage.caption}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}