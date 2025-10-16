// src/data/projectsData.js - VERSIÓN MEJORADA CON CACHÉ Y GETTERS OPTIMIZADOS
import { createProject } from './projectConfig'
import { logger } from '../utils/logger'

// Caché de proyectos validados con timestamps
const projectCache = new Map()
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutos

export const projectsData = {
  'proyecto-5': createProject('proyecto-5', {
    title: 'Casa habitación ecológica',
    subtitle: 'Proyecto Raíces de Santo Domingo ',
    description: 'Casa ubicada en Raíces de Santo Domingo, Provincia de San Antonio, 5ta Region de Valparaíso. Ecológica con tecnologías verdes y reutilizacion de agua, sin agregar componentes quimicos dañinos para la naturaleza, 100% auto-sustentable.',
    imageCount: 51,
    area: '175 m²',
    type: 'Casa unifamiliar',
    year: '2024',
    features: [
      'Equipo solar de 5000 watts',
      'Construida en Panel SIP 110mm',
      'Cimientos en Hormigón H25',
      'Vigas a la vista en Pino Oregón Nacional',
      'Cercha frontal vidriada',
      'Fachada en Sading PVC Azul Petróleo',
      'Ventanas en Aluminio proyección Roble',
      'Fosa Séptica',
      'Dren 10.000 litros',
      'Descargas de ducterias sanitarias y de desagüe hacia el sector de recopilación fosas',
      'Cámara degrasadora',
      'Cámaras de inspección',
      '2 Baños',
      '4 Habitaciones',
      '12 Ventanas y Ventanales emplazados',
      'Living, comedor, cocina americana',
      'Terraza en Pino Oregón Nacional'
    ]
  }),

  'proyecto-6': createProject('proyecto-6', {
    title: 'Cobertizo Mediterráneo',
    subtitle: 'Proyecto Colina',
    description: 'Proyecto ubicado en condominio El Remanso de Chicureo, comuna de Colina, Region Metropolitana..',
    imageCount: 15,
    area: '65 m²',
    type: 'Cobertizo',
    year: '2024',
    features: [
      'Pilares en Pino Oregón 10x10 pulgadas',
      'Viga frontal 2x12 pulgadas',
      'Vigas transversales 2x8 pulgadas',
      'Entramado paralelo techumbre 1x3 pulgadas',
      'Instalación Electrica certificada',
      'Techumbre en plancha de policarbonato traslucida Greca',
      'Madera tratada con fungicidas',
      'Terminación en aceite impregnante protector de madera'
    ]
  }),

  'proyecto-7': createProject('proyecto-7', {
    title: 'Cerre perimetral frontal hormigonado',
    subtitle: 'Proyecto Quilicura',
    description: 'Proyecto emplazado en Av. lo Cruzat, comuna de Quilicura, Region Metropolitana.',
    imageCount: 9,
    area: '240 m²',
    type: 'Cierre y Pavimentación',
    year: '2025',
    features: [
      'Intervencion y m² distribuidos en 2 casas',
      'Pavimentación en hormigón H20',
      'Pisos patio delantero y patio trasero con retroiluminación de pisos',
      'Circuito automatizado mediante aplicación movil',
      '56 Focos de pisos instalados',
      'Estructuras metalicas estructuradas con perfiles:',
      '- Perfil 50x50x2mm',
      '- Perfil 100x50x2mm',
      '- Perfil 100x100x2mm',
      '- Perfil celosia bota agua tipo Z 20x50x25x1 mm',
      '- Pletina 30x3mm',
      'Cerrajeria embutida en perfiles metalicos',
      'Rodamientos Ducasse',
      'Motor portón corredera'
    ]
  }),

  'proyecto-1': createProject('proyecto-1', {
    title: 'Quincho tipo Galeria',
    subtitle: 'Proyecto La Granja',
    description: 'Proyecto emplazado en comuna La Granja, Region Metropolitana.',
    imageCount: 16,
    area: '75 m²',
    type: 'Quincho tipo galeria',
    year: '2019',
    features: [
      'Proyectado completamente en Pino Oregón',
      'Puertas batientes en Pino Oregón vidriadas fabricadas in-situ',
      'Ventanales fijos en Pino Oregón vidriados',
      'Entramados paralelos en muros y cielos, listones de Pino Oregón 1x2 pulgadas',
      'Pilares en Pino Oregón 8x8 pulgadas',
      'Vigas transversales portantes 2x8 pulgadas',
      'Vigas perimetrales 2x10 pulgadas',
      'Techumbres en policarbonato alveolar y teja asfaltica rojo colonial',
      'Ceramica anti deslizante 50x50 cm',
      'Luminaria e instalación electrica certificada'
    ]
  }),
  
  'proyecto-2': createProject('proyecto-2', {
    title: 'Techumbre Colegio La Reina',
    subtitle: 'Proyecto Colegio La Reina', 
    description: 'Proyecto emplazado en Lynch Norte, comuna La Reina, Region Metropolitana, en el Colegio Santiago Evangelista.',
    imageCount: 10,
    area: '200 m²',
    type: 'Cubierta y frontiz',
    year: '2019',
    features: [
      'Techumbre estructurado con OSB en 15mm',
      'Instalación de filtro aislante',
      'Instalación cubierta en planchas de Zinc PV4',
      'Frontal aéreo estructurado en metalcon',
      'Fachada frontal superior revestida en Sading PVC',
      'Recambio de canaletas a medida'
    ]
  }),
  
  'proyecto-3': createProject('proyecto-3', {
    title: 'Sala quimica',
    subtitle: 'Proyecto Colegio La Reina',
    description: 'Proyecto emplazado en Lynch Norte, comuna La Reina, Region Metropolitana, en el Colegio Santiago Evangelista.',
    imageCount: 12,
    area: '65 m²', 
    type: 'Remodelacion Sala quimica',
    year: '2019',
    features: [
      'Enchape en planchas de yeso/carton 15mm RF muros',
      'Enchape en planchas de yeso/carton 15mm SD muros y cielos',
      'Terminaciones en yeso, pasta muro y pintura blanca',
      'Piso revestido en porcelanato blanco brillante 60x60cm',
      'Gasfitería emplazada certificada',
      'Reemplazo y diseño de luminarias'
    ]
  }),
  
  'proyecto-4': createProject('proyecto-4', {
    title: 'Cobertizo Metalico',
    subtitle: 'Proyecto Colegio La Reina',
    description: 'Proyecto emplazado en Lynch Norte, comuna La Reina, Region Metropolitana, en el Colegio Santiago Evangelista.',
    imageCount: 22,
    area: '114 m²',
    type: 'Cobertizo Metalico',
    year: '2020',
    features: [
      'Perfileria Metalica',
      'Cubierta plancha policarbonato Greca color cenizo',
      'Luminaria e instalación electrica certificada'
    ]
  }),

  'proyecto-8': createProject('proyecto-8', {
    title: 'Multicancha pasto sintetico',
    subtitle: 'Proyecto Colegio La Reina',
    description: 'Proyecto emplazado en Lynch Norte, comuna La Reina, Region Metropolitana, en el Colegio Santiago Evangelista.',
    imageCount: 4,
    area: '420 m²',
    type: 'Multicancha',
    year: '2020',
    features: [
      'Retiro de pasto sintetico existente',
      'Tratamiento de suelos',
      'Nivelación topográfica',
      'Rellenos y compactación',
      'Postura de pasto sintetico nuevo',
      'Demarcación de pasto sintetico color blanco',
      'Postura de arena de sílice',
      'Postura de caucho granulado',
      'Mantención de cierre perimetral'
    ]
  })
}

/**
 * Valida la estructura de un proyecto
 */
const validateProjectStructure = (project) => {
  if (!project || typeof project !== 'object') {
    logger.error('Proyecto no es un objeto válido', project)
    return false
  }

  const requiredFields = ['id', 'title', 'description', 'imageCount', 'features']
  const missingFields = requiredFields.filter(field => !project[field])

  if (missingFields.length > 0) {
    logger.error('Proyecto tiene campos faltantes', { id: project.id, missingFields })
    return false
  }

  if (typeof project.imageCount !== 'number' || project.imageCount < 1) {
    logger.error('imageCount inválido', { id: project.id, imageCount: project.imageCount })
    return false
  }

  if (!Array.isArray(project.features) || project.features.length === 0) {
    logger.error('Features inválidas', { id: project.id })
    return false
  }

  return true
}

/**
 * Obtiene todos los proyectos validados con caché
 */
export const getAllProjects = () => {
  try {
    const cacheKey = 'all-projects'
    const cached = projectCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      logger.info('Proyectos cargados desde caché')
      return cached.data
    }

    const projects = Object.values(projectsData)
    const validProjects = projects.filter(validateProjectStructure)
    
    if (validProjects.length !== projects.length) {
      logger.warn('Algunos proyectos no pasaron la validación', {
        total: projects.length,
        valid: validProjects.length
      })
    }

    // Guardar en caché
    projectCache.set(cacheKey, {
      data: validProjects,
      timestamp: Date.now()
    })

    return validProjects
  } catch (error) {
    logger.error('Error obteniendo todos los proyectos', error)
    return []
  }
}

/**
 * Obtiene un proyecto por ID con validación y caché
 */
export const getProject = (id) => {
  try {
    if (!id || typeof id !== 'string') {
      logger.error('ID de proyecto inválido', { id, type: typeof id })
      return null
    }

    const sanitizedId = id.trim().toLowerCase()
    
    if (!/^proyecto-[0-9]+$/.test(sanitizedId)) {
      logger.warn('Formato de ID de proyecto no válido', { id: sanitizedId })
      return null
    }

    // Verificar caché
    const cached = projectCache.get(sanitizedId)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      logger.info('Proyecto cargado desde caché', { id: sanitizedId })
      return cached.data
    }

    const project = projectsData[sanitizedId]

    if (!project) {
      logger.warn('Proyecto no encontrado', { id: sanitizedId })
      return null
    }

    if (!validateProjectStructure(project)) {
      logger.error('Proyecto no pasó validación', { id: sanitizedId })
      return null
    }

    // Guardar en caché
    projectCache.set(sanitizedId, {
      data: project,
      timestamp: Date.now()
    })

    return project
  } catch (error) {
    logger.error('Error obteniendo proyecto', { id, error })
    return null
  }
}

/**
 * Obtiene slides para el carrusel con validación y caché
 */
export const getCarouselSlides = () => {
  try {
    const cacheKey = 'carousel-slides'
    const cached = projectCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      logger.info('Slides cargados desde caché')
      return cached.data
    }

    const allProjects = getAllProjects()
    
    const slides = allProjects.map(project => {
      if (!project.mainImage) {
        logger.warn('Proyecto sin mainImage', { id: project.id })
        return null
      }

      return {
        img: project.mainImage,
        caption: project.caption || `${project.type} · ${project.area} · ${project.year}`,
        id: project.id,
        title: project.title,
        imageCount: project.imageCount
      }
    }).filter(Boolean)

    // Guardar en caché
    projectCache.set(cacheKey, {
      data: slides,
      timestamp: Date.now()
    })

    return slides
  } catch (error) {
    logger.error('Error obteniendo slides del carrusel', error)
    return []
  }
}

/**
 * Busca proyectos por término
 */
export const searchProjects = (searchTerm) => {
  try {
    if (!searchTerm || typeof searchTerm !== 'string') {
      return []
    }

    const term = searchTerm.toLowerCase().trim()
    
    if (term.length < 2) {
      logger.info('Término de búsqueda muy corto', { term })
      return []
    }

    const allProjects = getAllProjects()

    return allProjects.filter(project => {
      return (
        project.title.toLowerCase().includes(term) ||
        project.subtitle.toLowerCase().includes(term) ||
        project.description.toLowerCase().includes(term) ||
        project.type.toLowerCase().includes(term) ||
        project.features.some(f => f.toLowerCase().includes(term))
      )
    })
  } catch (error) {
    logger.error('Error buscando proyectos', { searchTerm, error })
    return []
  }
}

/**
 * Obtiene proyectos por tipo
 */
export const getProjectsByType = (type) => {
  try {
    if (!type || typeof type !== 'string') {
      return []
    }

    const allProjects = getAllProjects()
    const normalizedType = type.toLowerCase().trim()

    return allProjects.filter(project => 
      project.type.toLowerCase().includes(normalizedType)
    )
  } catch (error) {
    logger.error('Error obteniendo proyectos por tipo', { type, error })
    return []
  }
}

/**
 * Limpia la caché de proyectos
 */
export const clearProjectCache = () => {
  projectCache.clear()
  logger.info('Caché de proyectos limpiada')
}

/**
 * Obtiene estadísticas de proyectos
 */
export const getProjectStats = () => {
  try {
    const allProjects = getAllProjects()

    const totalImages = allProjects.reduce((sum, p) => sum + p.imageCount, 0)
    const projectTypes = [...new Set(allProjects.map(p => p.type))]
    const yearRange = allProjects.reduce((acc, p) => {
      const year = parseInt(p.year)
      return {
        min: Math.min(acc.min, year),
        max: Math.max(acc.max, year)
      }
    }, { min: Infinity, max: -Infinity })

    return {
      totalProjects: allProjects.length,
      totalImages,
      projectTypes,
      yearRange,
      cachedProjects: projectCache.size,
      cacheHealth: {
        size: projectCache.size,
        maxAge: CACHE_DURATION,
        items: Array.from(projectCache.keys())
      }
    }
  } catch (error) {
    logger.error('Error obteniendo estadísticas de proyectos', error)
    return {
      totalProjects: 0,
      totalImages: 0,
      projectTypes: [],
      yearRange: { min: 0, max: 0 },
      cachedProjects: 0
    }
  }
}

// Exportar para debugging en consola
if (typeof window !== 'undefined') {
  window.ProconProjects = {
    getAll: getAllProjects,
    getById: getProject,
    search: searchProjects,
    getByType: getProjectsByType,
    clearCache: clearProjectCache,
    getStats: getProjectStats,
    cache: projectCache
  }
}

export default {
  getAllProjects,
  getProject,
  getCarouselSlides,
  searchProjects,
  getProjectsByType,
  clearProjectCache,
  getProjectStats
}