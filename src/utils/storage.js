// utils/performance.js

/**
 * Debounce function para optimizar eventos que se disparan frecuentemente
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function para limitar la frecuencia de ejecución
 */
export const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Función optimizada para intersection observer
 */
export const createOptimizedObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  }
  
  return new IntersectionObserver(callback, defaultOptions)
}

/**
 * Preload de imágenes críticas
 */
export const preloadCriticalImages = (imageUrls) => {
  if (!('requestIdleCallback' in window)) {
    // Fallback para navegadores que no soportan requestIdleCallback
    setTimeout(() => {
      imageUrls.forEach(url => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'image'
        link.href = url
        document.head.appendChild(link)
      })
    }, 0)
  } else {
    requestIdleCallback(() => {
      imageUrls.forEach(url => {
        const img = new Image()
        img.src = url
      })
    })
  }
}

// utils/imageOptimization.js

/**
 * Configuración de calidades de imagen para diferentes dispositivos
 */
export const IMAGE_QUALITIES = {
  mobile: 'w_600,q_auto,f_auto',
  tablet: 'w_1024,q_auto,f_auto',
  desktop: 'w_1920,q_auto,f_auto'
}

/**
 * Obtener URL de imagen optimizada según el dispositivo
 */
export const getOptimizedImageUrl = (baseUrl, device = 'desktop') => {
  // Si usas un CDN como Cloudinary, puedes aplicar transformaciones
  if (baseUrl.includes('cloudinary')) {
    const quality = IMAGE_QUALITIES[device]
    return baseUrl.replace('/upload/', `/upload/${quality}/`)
  }
  
  // Para imágenes locales, retornar la URL base
  return baseUrl
}

/**
 * Detectar tipo de dispositivo para cargar imágenes apropiadas
 */
export const getDeviceType = () => {
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

/**
 * Generar srcSet para imágenes responsivas
 */
export const generateSrcSet = (baseUrl) => {
  return [
    `${getOptimizedImageUrl(baseUrl, 'mobile')} 600w`,
    `${getOptimizedImageUrl(baseUrl, 'tablet')} 1024w`,
    `${getOptimizedImageUrl(baseUrl, 'desktop')} 1920w`
  ].join(', ')
}

// config/constants.js

export const ANIMATION_DURATIONS = {
  fast: 200,
  normal: 300,
  slow: 500,
  carousel: 500
}

export const CAROUSEL_CONFIG = {
  autoPlayInterval: 6000,
  transitionDuration: 500,
  swipeThreshold: 50
}

export const LAZY_LOADING_CONFIG = {
  threshold: 0.1,
  rootMargin: '50px'
}

export const LIGHTBOX_CONFIG = {
  enableKeyboard: true,
  enableSwipe: true,
  showCaptions: true,
  closeOnClickOutside: true
}

export const PERFORMANCE_CONFIG = {
  enableImagePreloading: true,
  preloadCount: 3,
  enableVirtualization: false, // Para listas muy largas
  chunkSize: 10 // Para paginación de galería
}

// utils/accessibility.js

/**
 * Manejar focus trap para modales
 */
export const createFocusTrap = (element) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  const handleTabKey = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }
  }
  
  element.addEventListener('keydown', handleTabKey)
  firstElement.focus()
  
  return () => {
    element.removeEventListener('keydown', handleTabKey)
  }
}

/**
 * Anunciar cambios a lectores de pantalla
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.setAttribute('class', 'sr-only')
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// utils/errors.js

/**
 * Error boundary personalizado para manejo de errores
 */
export class ProjectGalleryError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'ProjectGalleryError'
    this.code = code
  }
}

/**
 * Logger optimizado para desarrollo y producción
 */
export const logger = {
  info: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[ProjectGallery] ${message}`, data)
    }
  },
  warn: (message, data) => {
    console.warn(`[ProjectGallery] ${message}`, data)
  },
  error: (message, error) => {
    console.error(`[ProjectGallery] ${message}`, error)
    // En producción, podrías enviar a un servicio de logging
  }
}

// utils/storage.js

/**
 * LocalStorage wrapper con manejo de errores
 */
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      logger.warn(`Error reading from localStorage: ${key}`, error)
      return defaultValue
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      logger.warn(`Error writing to localStorage: ${key}`, error)
      return false
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      logger.warn(`Error removing from localStorage: ${key}`, error)
      return false
    }
  }
}

/**
 * Cache en memoria para datos de proyectos
 */
class ProjectCache {
  constructor(maxSize = 50) {
    this.cache = new Map()
    this.maxSize = maxSize
  }
  
  get(key) {
    if (this.cache.has(key)) {
      // Mover al final (LRU)
      const value = this.cache.get(key)
      this.cache.delete(key)
      this.cache.set(key, value)
      return value
    }
    return null
  }
  
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // Eliminar el más antiguo
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }
  
  clear() {
    this.cache.clear()
  }
}

export const projectCache = new ProjectCache()