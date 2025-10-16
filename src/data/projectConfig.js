// src/data/projectConfig.js - VERSIÓN MEJORADA CON SEGURIDAD
import { logger } from '../utils/logger'

const BASE_URL = import.meta.env.BASE_URL || ''

/**
 * Genera URL de imagen con validación de seguridad
 * @param {string} projectId - ID del proyecto
 * @param {number} imageNumber - Número de imagen
 * @returns {string} - URL de la imagen
 */
export const getProjectImage = (projectId, imageNumber) => {
  try {
    // Validar projectId
    if (!projectId || typeof projectId !== 'string') {
      logger.error('projectId inválido', { projectId, type: typeof projectId })
      return ''
    }

    // Sanitizar y validar projectId para prevenir path traversal
    const sanitizedId = projectId.trim().toLowerCase()
    
    if (sanitizedId.includes('..') || sanitizedId.includes('/') || sanitizedId.includes('\\')) {
      logger.error('Intento de path traversal detectado', { projectId })
      return ''
    }

    // Validar formato del ID
    if (!/^proyecto-[0-9]+$/.test(sanitizedId)) {
      logger.error('Formato de projectId inválido', { projectId: sanitizedId })
      return ''
    }

    // Validar imageNumber
    if (typeof imageNumber !== 'number' || imageNumber < 1 || imageNumber > 1000) {
      logger.error('imageNumber inválido', { imageNumber, projectId })
      return ''
    }

    // Construir URL segura
    const url = `${BASE_URL}resources/projects/${sanitizedId}/${imageNumber}.webp`
    
    return url
  } catch (error) {
    logger.error('Error generando URL de imagen', { projectId, imageNumber, error })
    return ''
  }
}

/**
 * Valida la configuración de un proyecto
 * @param {Object} config - Configuración del proyecto
 * @returns {boolean} - true si es válida
 */
const validateProjectConfig = (config) => {
  const errors = []

  // Validar título
  if (!config.title || typeof config.title !== 'string' || config.title.length < 3) {
    errors.push('Título inválido o muy corto')
  }

  if (config.title && config.title.length > 200) {
    errors.push('Título demasiado largo')
  }

  // Validar imageCount
  if (typeof config.imageCount !== 'number' || config.imageCount < 1 || config.imageCount > 1000) {
    errors.push('imageCount debe ser un número entre 1 y 1000')
  }

  // Validar area
  if (config.area && typeof config.area !== 'string') {
    errors.push('area debe ser un string')
  }

  // Validar year
  if (config.year) {
    const yearNum = parseInt(config.year)
    const currentYear = new Date().getFullYear()
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > currentYear + 1) {
      errors.push('year inválido')
    }
  }

  // Validar features
  if (config.features && !Array.isArray(config.features)) {
    errors.push('features debe ser un array')
  }

  if (config.features && config.features.length === 0) {
    errors.push('features no puede estar vacío')
  }

  if (errors.length > 0) {
    logger.error('Configuración de proyecto inválida', { errors, config })
    return false
  }

  return true
}

/**
 * Crea un proyecto con validación
 * @param {string} id - ID del proyecto
 * @param {Object} projectConfig - Configuración del proyecto
 * @returns {Object} - Objeto del proyecto
 */
export const createProject = (id, projectConfig = {}) => {
  try {
    // Validar ID
    if (!id || typeof id !== 'string') {
      throw new Error('ID de proyecto inválido')
    }

    const sanitizedId = id.trim().toLowerCase()

    if (!/^proyecto-[0-9]+$/.test(sanitizedId)) {
      throw new Error('Formato de ID inválido')
    }

    // Configuración por defecto
    const defaultConfig = {
      title: 'Proyecto',
      subtitle: 'Descripción del proyecto',
      description: 'Descripción detallada del proyecto.',
      year: new Date().getFullYear().toString(),
      area: '200 m²',
      type: 'Casa',
      imageCount: 52,
      features: [
        `Área total: ${projectConfig.area || '200 m²'}`,
        'Construcción de alta calidad',
        'Materiales premium',
        'Diseño funcional y moderno',
        'Acabados de primera',
        'Excelente ubicación'
      ]
    }

    // Combinar configuración
    const finalConfig = { ...defaultConfig, ...projectConfig }

    // Validar configuración
    if (!validateProjectConfig(finalConfig)) {
      throw new Error('Configuración de proyecto inválida')
    }

    // Sanitizar strings
    const sanitizeString = (str, maxLength = 500) => {
      if (typeof str !== 'string') return ''
      return str.trim().slice(0, maxLength)
    }

    const project = {
      id: sanitizedId,
      title: sanitizeString(finalConfig.title, 200),
      subtitle: sanitizeString(finalConfig.subtitle, 200),
      description: sanitizeString(finalConfig.description, 1000),
      year: sanitizeString(finalConfig.year, 4),
      area: sanitizeString(finalConfig.area, 50),
      type: sanitizeString(finalConfig.type, 100),
      imageCount: Math.max(1, Math.min(1000, parseInt(finalConfig.imageCount) || 1)),
      features: Array.isArray(finalConfig.features) 
        ? finalConfig.features.map(f => sanitizeString(f, 500))
        : [],
      
      get images() {
        return Array.from({ length: this.imageCount }, (_, i) => {
          const url = getProjectImage(this.id, i + 1)
          if (!url) {
            logger.warn('No se pudo generar URL de imagen', { id: this.id, index: i + 1 })
          }
          return url
        }).filter(Boolean)
      },
      
      get gallery() {
        return Array.from({ length: this.imageCount }, (_, i) => {
          const url = getProjectImage(this.id, i + 1)
          if (!url) return null
          
          return {
            img: url,
            caption: `${this.title} - Foto ${i + 1}`
          }
        }).filter(Boolean)
      },
      
      get mainImage() {
        const url = getProjectImage(this.id, 1)
        if (!url) {
          logger.error('No se pudo obtener imagen principal', { id: this.id })
          return ''
        }
        return url
      },
      
      get caption() {
        return `${this.type} · ${this.area} · ${this.year}`
      }
    }

    // Validar que se generaron las imágenes correctamente
    if (project.images.length === 0) {
      logger.error('No se generaron imágenes para el proyecto', { id: sanitizedId })
    }

    if (project.gallery.length === 0) {
      logger.error('No se generó galería para el proyecto', { id: sanitizedId })
    }

    logger.info('Proyecto creado exitosamente', { 
      id: sanitizedId, 
      imageCount: project.images.length 
    })

    return project
  } catch (error) {
    logger.error('Error creando proyecto', { id, error })
    throw error
  }
}

/**
 * Verifica si una imagen existe (simulado)
 * @param {string} url - URL de la imagen
 * @returns {Promise<boolean>} - true si existe
 */
export const checkImageExists = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch (error) {
    logger.warn('Error verificando existencia de imagen', { url, error })
    return false
  }
}

/**
 * Pre-carga imágenes críticas de un proyecto
 * @param {string} projectId - ID del proyecto
 * @param {number} count - Número de imágenes a pre-cargar
 */
export const preloadProjectImages = (projectId, count = 5) => {
  try {
    const imagesToPreload = Math.min(count, 10) // Máximo 10 imágenes

    for (let i = 1; i <= imagesToPreload; i++) {
      const url = getProjectImage(projectId, i)
      if (url) {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'image'
        link.href = url
        document.head.appendChild(link)
      }
    }

    logger.info('Imágenes pre-cargadas', { projectId, count: imagesToPreload })
  } catch (error) {
    logger.error('Error pre-cargando imágenes', { projectId, error })
  }
}

export default {
  getProjectImage,
  createProject,
  checkImageExists,
  preloadProjectImages
}