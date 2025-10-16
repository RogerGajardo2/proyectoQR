// src/utils/errorHandler.js
import { logger } from './logger'

export class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', statusCode = 500) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

export const ErrorCodes = {
  // Auth errors
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // Network errors
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // General errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}

export const handleServiceError = (error, context = 'Unknown') => {
  logger.error(`Error en ${context}`, error)
  
  // Firebase Auth errors
  if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
    return new AppError('Credenciales incorrectas', ErrorCodes.INVALID_CREDENTIALS, 401)
  }
  
  if (error.code === 'auth/too-many-requests') {
    return new AppError('Demasiados intentos. Intenta más tarde', ErrorCodes.TIMEOUT, 429)
  }
  
  // Firestore errors
  if (error.code === 'permission-denied') {
    return new AppError('No tienes permisos para esta acción', ErrorCodes.PERMISSION_DENIED, 403)
  }
  
  if (error.code === 'not-found') {
    return new AppError('Recurso no encontrado', ErrorCodes.NOT_FOUND, 404)
  }
  
  if (error.code === 'already-exists') {
    return new AppError('El recurso ya existe', ErrorCodes.ALREADY_EXISTS, 409)
  }
  
  if (error.code === 'unavailable') {
    return new AppError('Servicio no disponible. Intenta más tarde', ErrorCodes.SERVICE_UNAVAILABLE, 503)
  }
  
  // Network errors
  if (error.message === 'Failed to fetch' || error.message === 'Network request failed') {
    return new AppError('Error de red. Verifica tu conexión', ErrorCodes.NETWORK_ERROR, 503)
  }
  
  // Default
  if (error instanceof AppError) {
    return error
  }
  
  return new AppError(
    error.message || 'Error interno del servidor', 
    ErrorCodes.INTERNAL_ERROR, 
    500
  )
}

export const getErrorMessage = (error) => {
  if (error instanceof AppError) {
    return error.message
  }
  
  if (error.code) {
    const handled = handleServiceError(error)
    return handled.message
  }
  
  return 'Ha ocurrido un error inesperado'
}

export default {
  AppError,
  ErrorCodes,
  handleServiceError,
  getErrorMessage
}