// src/utils/security.js - Utilidades de seguridad
import { logger } from './logger'

/**
 * Clase para manejar sanitización de inputs
 */
export class SecurityManager {
  /**
   * Sanitiza un input de texto
   * @param {string} input - Texto a sanitizar
   * @param {number} maxLength - Longitud máxima
   * @returns {string} - Texto sanitizado
   */
  static sanitizeInput(input, maxLength = 500) {
    if (typeof input !== 'string') {
      logger.warn('sanitizeInput: Input no es string', typeof input)
      return ''
    }
    
    let sanitized = input
      .trim()
      .slice(0, maxLength)
    
    // Remover scripts y código malicioso
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /<form/gi
    ]
    
    dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '')
    })
    
    return sanitized
  }

  /**
   * Valida un email
   * @param {string} email - Email a validar
   * @returns {boolean} - true si es válido
   */
  static validateEmail(email) {
    if (!email || typeof email !== 'string') return false
    
    // Prevenir emails con doble punto
    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
      return false
    }
    
    // Regex mejorada para emails
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
    
    if (!emailRegex.test(email.trim())) {
      return false
    }
    
    // Validar longitud del dominio
    const domain = email.split('@')[1]
    if (domain && domain.length > 255) {
      return false
    }
    
    return true
  }

  /**
   * Valida un teléfono chileno
   * @param {string} phone - Teléfono a validar
   * @returns {boolean} - true si es válido
   */
  static validateChileanPhone(phone) {
    if (!phone || typeof phone !== 'string') return false
    
    const phoneClean = phone.trim().replace(/[\s-]/g, '')
    
    // Formato: +56 seguido de 9 dígitos (móvil) o 2 + 8 dígitos (fijo)
    const mobileRegex = /^\+56[9]\d{8}$/
    const landlineRegex = /^\+56[2]\d{8}$/
    
    return mobileRegex.test(phoneClean) || landlineRegex.test(phoneClean)
  }

  /**
   * Valida estructura de datos importados
   * @param {Object} data - Datos a validar
   * @param {string} type - Tipo de datos ('codes' o 'reviews')
   * @returns {Array} - Datos validados
   */
  static validateImportedData(data, type) {
    if (!data || typeof data !== 'object') {
      throw new Error('Formato de datos inválido')
    }

    if (type === 'codes') {
      if (!Array.isArray(data.codes)) {
        throw new Error('El archivo debe contener un array de códigos')
      }

      return data.codes.filter(code => {
        return (
          code &&
          typeof code === 'object' &&
          typeof code.code === 'string' &&
          code.code.length > 0 &&
          code.code.length <= 50 &&
          /^[A-Z0-9]+$/.test(code.code) &&
          typeof code.createdAt === 'string'
        )
      }).map(code => ({
        code: this.sanitizeInput(code.code, 50),
        clientName: this.sanitizeInput(code.clientName || 'Sin nombre', 100),
        createdAt: code.createdAt,
        used: false
      }))
    }

    if (type === 'reviews') {
      if (!Array.isArray(data.reviews)) {
        throw new Error('El archivo debe contener un array de reseñas')
      }

      return data.reviews.filter(review => {
        return (
          review &&
          typeof review === 'object' &&
          typeof review.name === 'string' &&
          review.name.length > 0 &&
          review.name.length <= 100 &&
          typeof review.rating === 'number' &&
          review.rating >= 1 &&
          review.rating <= 5 &&
          typeof review.comment === 'string' &&
          review.comment.length >= 10 &&
          review.comment.length <= 1000 &&
          typeof review.code === 'string' &&
          /^[A-Z0-9]+$/.test(review.code)
        )
      }).map(review => ({
        name: this.sanitizeInput(review.name, 100),
        rating: parseInt(review.rating),
        comment: this.sanitizeInput(review.comment, 1000),
        project: this.sanitizeInput(review.project || '', 200),
        date: review.date || new Date().toISOString(),
        code: this.sanitizeInput(review.code, 50)
      }))
    }

    throw new Error('Tipo de datos desconocido')
  }

  /**
   * Detecta contenido de spam
   * @param {string} text - Texto a verificar
   * @returns {boolean} - true si es spam
   */
  static detectSpam(text) {
    if (!text || typeof text !== 'string') return false
    
    const spamPatterns = [
      /viagra|cialis|casino|lottery|winner/i,
      /(https?:\/\/[^\s]+){3,}/g, // Múltiples URLs
      /([A-Z]{10,})/g, // Muchas mayúsculas seguidas
      /(\d{10,})/g, // Muchos números seguidos
      /((.)\2{5,})/g // Caracteres repetidos
    ]
    
    return spamPatterns.some(pattern => pattern.test(text))
  }

  /**
   * Previene path traversal en nombres de archivo
   * @param {string} filename - Nombre de archivo
   * @returns {boolean} - true si es seguro
   */
  static isSafeFilename(filename) {
    if (!filename || typeof filename !== 'string') return false
    
    const dangerousPatterns = [
      /\.\./g, // Parent directory
      /\//g,   // Forward slash
      /\\/g,   // Backslash
      /:/g,    // Drive separator
      /\*/g,   // Wildcard
      /\?/g,   // Query
      /</g,    // Less than
      />/g,    // Greater than
      /\|/g,   // Pipe
      /"/g     // Quote
    ]
    
    return !dangerousPatterns.some(pattern => pattern.test(filename))
  }

  /**
   * Genera un token CSRF
   * @returns {string} - Token generado
   */
  static generateCSRFToken() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    
    // Fallback para navegadores antiguos
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  /**
   * Valida un token CSRF
   * @param {string} token - Token a validar
   * @returns {boolean} - true si es válido
   */
  static validateCSRFToken(token) {
    const storedToken = sessionStorage.getItem('csrf_token')
    return token === storedToken
  }
}

/**
 * Clase para manejar rate limiting
 */
export class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
    this.attempts = new Map()
  }

  /**
   * Verifica si se alcanzó el límite
   * @param {string} key - Identificador (ej: email, IP)
   * @returns {Object} - { allowed: boolean, remainingAttempts: number, resetTime: number }
   */
  checkLimit(key) {
    const now = Date.now()
    const record = this.attempts.get(key) || { count: 0, resetTime: now + this.windowMs }
    
    // Reset si pasó la ventana de tiempo
    if (now >= record.resetTime) {
      record.count = 0
      record.resetTime = now + this.windowMs
    }
    
    const allowed = record.count < this.maxAttempts
    const remainingAttempts = Math.max(0, this.maxAttempts - record.count)
    
    return {
      allowed,
      remainingAttempts,
      resetTime: record.resetTime
    }
  }

  /**
   * Incrementa el contador de intentos
   * @param {string} key - Identificador
   */
  increment(key) {
    const now = Date.now()
    const record = this.attempts.get(key) || { count: 0, resetTime: now + this.windowMs }
    
    if (now >= record.resetTime) {
      record.count = 1
      record.resetTime = now + this.windowMs
    } else {
      record.count++
    }
    
    this.attempts.set(key, record)
  }

  /**
   * Resetea el contador para una key
   * @param {string} key - Identificador
   */
  reset(key) {
    this.attempts.delete(key)
  }

  /**
   * Limpia intentos antiguos
   */
  cleanup() {
    const now = Date.now()
    for (const [key, record] of this.attempts.entries()) {
      if (now >= record.resetTime) {
        this.attempts.delete(key)
      }
    }
  }
}

// Exportar instancias globales
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000) // 5 intentos en 15 minutos
export const reviewRateLimiter = new RateLimiter(3, 60 * 60 * 1000) // 3 reseñas por hora
export const formRateLimiter = new RateLimiter(10, 60 * 60 * 1000) // 10 envíos por hora

export default SecurityManager