// src/hooks/useGoToSection.js - VERSIÓN MEJORADA CON VALIDACIÓN
import { useLocation, useNavigate } from 'react-router-dom'
import { logger } from '../utils/logger'

// Secciones válidas del sitio
const VALID_SECTIONS = ['inicio', 'proyectos', 'quienes-somos', 'resenas', 'contacto']

/**
 * Sanitiza y valida una sección
 * @param {string} section - Sección a validar
 * @returns {string|null} - Sección sanitizada o null si es inválida
 */
const sanitizeSection = (section) => {
  if (!section || typeof section !== 'string') {
    return null
  }

  const sanitized = section.trim().toLowerCase()

  // Validar caracteres permitidos
  if (!/^[a-z0-9-]+$/.test(sanitized)) {
    logger.warn('Sección contiene caracteres no permitidos', { section })
    return null
  }

  return sanitized
}

/**
 * Valida si una sección es válida
 * @param {string} section - Sección a validar
 * @returns {boolean} - true si es válida
 */
const isValidSection = (section) => {
  if (!section) return false
  
  // Es válida si está en la lista o es un proyecto
  return VALID_SECTIONS.includes(section) || section.startsWith('proyecto-')
}

/**
 * Valida un ID de proyecto
 * @param {string} projectId - ID del proyecto
 * @returns {boolean} - true si es válido
 */
const isValidProjectId = (projectId) => {
  if (!projectId || typeof projectId !== 'string') {
    return false
  }

  // Debe seguir el formato proyecto-N
  return /^proyecto-[0-9]+$/.test(projectId)
}

/**
 * Hook para navegación entre secciones con validación
 */
export function useGoToSection(){
  const navigate = useNavigate()
  const location = useLocation()
  
  return (section) => {
    try {
      // Validar entrada
      if (!section || typeof section !== 'string') {
        logger.error('Sección inválida', { section, type: typeof section })
        return
      }
      
      // Sanitizar sección
      const sanitizedSection = sanitizeSection(section)
      
      if (!sanitizedSection) {
        logger.error('Sección no pudo ser sanitizada', { section })
        navigate('/inicio')
        return
      }

      // Si es una ruta de proyecto
      if (sanitizedSection.startsWith('proyecto-')) {
        const projectId = sanitizedSection

        // Validar ID de proyecto
        if (!isValidProjectId(projectId)) {
          logger.error('ID de proyecto inválido', { projectId })
          navigate('/inicio')
          return
        }
        
        const projectRoute = `/inicio/${projectId}`
        logger.info('Navegando a proyecto', { projectId, route: projectRoute })
        navigate(projectRoute)
        return
      }
      
      // Validar que la sección existe
      if (!isValidSection(sanitizedSection)) {
        logger.warn('Intento de navegar a sección no válida', { section: sanitizedSection })
        navigate('/inicio')
        return
      }

      // Si estamos en una página de proyecto y queremos ir a una sección
      if (location.pathname.includes('proyecto-')) {
        logger.info('Navegando desde proyecto a sección', { 
          from: location.pathname, 
          to: sanitizedSection 
        })
        
        navigate(`/inicio?to=${sanitizedSection}`)
        
        // Esperar un poco y hacer scroll
        setTimeout(() => {
          scrollToSection(sanitizedSection)
        }, 200)
        return
      }
      
      // Lógica existente para secciones normales
      const params = new URLSearchParams(location.search)
      const current = params.get('to') || ''
      const atLanding = location.pathname === '/inicio'
      const base = `/inicio?to=${sanitizedSection}`
      
      if (!atLanding || current !== sanitizedSection){ 
        logger.info('Navegando a sección', { 
          section: sanitizedSection, 
          from: location.pathname 
        })
        navigate(base, { replace: false }) 
      } else { 
        // Forzar re-navegación con timestamp
        navigate(base + `&r=${Date.now()}`, { replace: true }) 
      }
      
      // Hacer scroll a la sección
      setTimeout(() => {
        scrollToSection(sanitizedSection)
      }, 100)
      
    } catch (e) { 
      logger.error('Error en useGoToSection', e) 
      // Navegación de fallback
      navigate('/inicio')
    }
  }
}

/**
 * Función auxiliar para hacer scroll a una sección
 * @param {string} sectionId - ID de la sección
 */
const scrollToSection = (sectionId) => {
  let tries = 0
  const maxTries = 12
  
  const tryScroll = () => {
    const el = document.getElementById(sectionId)
    
    if (el) {
      const header = document.querySelector('header')
      const headerH = header ? header.getBoundingClientRect().height : 0
      const extra = 12
      const top = window.pageYOffset + el.getBoundingClientRect().top - (headerH + extra)
      
      window.scrollTo({ 
        top, 
        behavior: 'smooth' 
      })
      
      logger.info('Scroll exitoso a sección', { sectionId, top })
    } else if (tries < maxTries) { 
      tries++
      requestAnimationFrame(tryScroll) 
    } else {
      logger.warn('No se pudo hacer scroll a sección después de varios intentos', { 
        sectionId, 
        tries 
      })
    }
  }
  
  requestAnimationFrame(tryScroll)
}

export default useGoToSection