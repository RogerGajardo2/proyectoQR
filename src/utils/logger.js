// src/utils/logger.js - Sistema de logging centralizado
const isDev = import.meta.env.DEV
const isProduction = import.meta.env.PROD

class Logger {
  constructor() {
    this.prefix = '[ProconIng]'
    this.errorLog = []
  }

  _formatMessage(level, message, data) {
    const timestamp = new Date().toISOString()
    return {
      timestamp,
      level,
      message,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href
    }
  }

  info(message, data = null) {
    if (isDev) {
      console.info(this.prefix, message, data || '')
    }
  }

  warn(message, data = null) {
    console.warn(this.prefix, message, data || '')
    
    if (isProduction) {
      // En producción, podrías enviar warnings a un servicio
      this._sendToLoggingService('warn', message, data)
    }
  }

  error(message, error = null) {
    console.error(this.prefix, message, error || '')
    
    const logEntry = this._formatMessage('error', message, error)
    this.errorLog.push(logEntry)
    
    // Mantener solo los últimos 50 errores en memoria
    if (this.errorLog.length > 50) {
      this.errorLog.shift()
    }
    
    if (isProduction) {
      this._sendToLoggingService('error', message, error)
    }
  }

  debug(message, data = null) {
    if (isDev) {
      console.debug(this.prefix, message, data || '')
    }
  }

  _sendToLoggingService(level, message, data) {
    // Aquí podrías integrar con servicios como Sentry, LogRocket, etc.
    // Por ahora, solo almacenamos localmente
    try {
      const logs = JSON.parse(localStorage.getItem('proconing_error_logs') || '[]')
      logs.push(this._formatMessage(level, message, data))
      
      // Mantener solo los últimos 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100)
      }
      
      localStorage.setItem('proconing_error_logs', JSON.stringify(logs))
    } catch (e) {
      console.error('Error guardando logs:', e)
    }
  }

  getErrorLog() {
    return this.errorLog
  }

  clearErrorLog() {
    this.errorLog = []
  }

  exportLogs() {
    const logs = {
      inMemory: this.errorLog,
      stored: JSON.parse(localStorage.getItem('proconing_error_logs') || '[]'),
      exportDate: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `proconing-logs-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
}

export const logger = new Logger()

// Exportar para uso en consola del navegador
if (typeof window !== 'undefined') {
  window.ProconLogger = logger
}

export default logger